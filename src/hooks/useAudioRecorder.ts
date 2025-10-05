
import { useEffect, useRef, useState } from 'react';
import {
  AnalyserNode,
  AudioBuffer,
  AudioContext,
  AudioRecorder,
  GainNode,
} from 'react-native-audio-api';
import { OnAudioReadyEventType } from 'react-native-audio-api/lib/typescript/events/types';
import RNFS from 'react-native-fs';
import {
  concatInt16,
  encodeWavFromInt16,
  float32ToInt16,
  mixToMono,
} from '../utils/audio';
import { Buffer } from '@craftzdog/react-native-buffer';

const DEFAULT_FFT = 512;

type UseAudioRecorderOptions = {
  sampleRate?: number;
  bufferLengthInSamples?: number;
  fftSize?: number;
  smoothing?: number;
  monitor?: boolean; // tap-through to device output
};

export function useAudioRecorder({
  sampleRate = 16000,
  bufferLengthInSamples = 16000,
  fftSize = DEFAULT_FFT,
  smoothing = 0.8,
  monitor = false,
}: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [freqs, setFreqs] = useState<Uint8Array>(() => new Uint8Array(fftSize / 2));
  const [filePath, setFilePath] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);

  const rafRef = useRef<number | null>(null);

  // raw PCM chunks (Int16 mono)
  const audioChunksRef = useRef<Int16Array[]>([]);
  // Reusable FFT buffer to avoid allocations
  const fftBufRef = useRef<Uint8Array | null>(null);
  // toggled by pause/resume; if false we ignore incoming buffers
  const captureEnabledRef = useRef<boolean>(true);

  const loop = () => {
    // Freeze visual when paused
    if (isPaused) return;

    const analyser = analyserRef.current;
    if (!analyser || !fftBufRef.current) return;
    analyser.getByteFrequencyData(fftBufRef.current);
    // push a copy to state to keep it immutable for consumers
    setFreqs(new Uint8Array(fftBufRef.current));
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = async () => {
    const ctx = ctxRef.current;
    const analyser = analyserRef.current;
    const rec = recorderRef.current;
    if (!ctx || !analyser || !rec) return;

    try {
      // Some platforms start the context suspended
      await ctx.resume();
    } catch {}

    // reset state
    audioChunksRef.current = [];
    captureEnabledRef.current = true;
    setIsPaused(false);

    const adapter = ctx.createRecorderAdapter();
    rec.connect(adapter);
    adapter.connect(analyser);
    // The analyser is already connected to destination through a mute gain in setup

    rec.onAudioReady((event: OnAudioReadyEventType) => {
      if (!captureEnabledRef.current) return; // ignore chunks while paused
      const ab: AudioBuffer = event.buffer;
      const mono = mixToMono(ab);
      const int16 = float32ToInt16(mono);
      audioChunksRef.current.push(int16);
    });

    rec.start();
    rafRef.current = requestAnimationFrame(loop);
    setIsRecording(true);
  };

  const pause = () => {
    if (!isRecording || isPaused) return;
    captureEnabledRef.current = false;
    setIsPaused(true);

    // stop visual updates
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    // if monitoring, mute while paused
    if (muteGainRef.current && monitor) {
      try { (muteGainRef.current as any).gain.value = 0; } catch {}
    }
  };

  const resume = async () => {
    if (!isRecording || !isPaused) return;
    captureEnabledRef.current = true;
    setIsPaused(false);

    // if monitoring, unmute again
    if (muteGainRef.current && monitor) {
      try { (muteGainRef.current as any).gain.value = 1; } catch {}
    }

    // ensure context is running
    try { await ctxRef.current?.resume(); } catch {}

    // restart visual updates
    rafRef.current = requestAnimationFrame(loop);
  };

  const togglePause = () => (isPaused ? resume() : pause());

  const stop = async () => {
    try {
      recorderRef.current?.stop();
    } catch {}
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsRecording(false);
    setIsPaused(false);
    captureEnabledRef.current = false;

    const chunks = audioChunksRef.current;
    if (!chunks.length) return;

    try {
      const pcm = concatInt16(chunks);
      const wavBytes = encodeWavFromInt16(pcm, sampleRate);
      const path = `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.wav`;
      const base64 = Buffer.from(wavBytes).toString('base64');
      await RNFS.writeFile(path, base64, 'base64');
      setFilePath(path);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to finalize recording', err);
    }
  };

  useEffect(() => {
    const ctx = new AudioContext({ sampleRate });
    const analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    // Widen the dynamic range so quiet signals don't clamp to zero
    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;

    // Ensure the graph pulls data through the analyser even when not monitoring
    const mute = ctx.createGain();
    // When monitor=false we still pull, but stay silent
    (mute as any).gain.value = monitor ? 1 : 0;
    analyser.connect(mute);
    mute.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    muteGainRef.current = mute;
    recorderRef.current = new AudioRecorder({ sampleRate, bufferLengthInSamples });

    // Allocate FFT buffer
    fftBufRef.current = new Uint8Array(analyser.frequencyBinCount);
    // Initialize outward state to the correct length
    setFreqs(new Uint8Array(analyser.frequencyBinCount));

    return () => {
      // orderly teardown
      try { recorderRef.current?.stop(); } catch {}
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;
      analyserRef.current = null;
      recorderRef.current = null;
      muteGainRef.current = null;
      fftBufRef.current = null;
      captureEnabledRef.current = false;
    };
  }, [sampleRate, bufferLengthInSamples, fftSize, smoothing, monitor]);

  return {
    // state
    isRecording,
    isPaused,
    freqs,        // Uint8Array (FFT bins), handy for visualizers
    filePath,     // absolute path of saved WAV (or null if none)
    // controls
    start,
    pause,
    resume,
    togglePause,
    stop,
  };
}
