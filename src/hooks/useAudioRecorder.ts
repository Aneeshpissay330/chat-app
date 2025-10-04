import { useEffect, useRef, useState } from "react";
import {
  AudioContext,
  AnalyserNode,
  AudioRecorder,
} from "react-native-audio-api";
import RNFS from "react-native-fs";
import { encodeWAV, mergeBuffers } from "../utils/audio";

const FFT_SIZE = 512;

type UseAudioRecorderOptions = {
  sampleRate?: number;
  bufferLengthInSamples?: number;
  fftSize?: number;
  smoothing?: number;
  monitor?: boolean;
};

export function useAudioRecorder({
  sampleRate = 16000,
  bufferLengthInSamples = 16000,
  fftSize = FFT_SIZE,
  smoothing = 0.8,
  monitor = false,
}: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [freqs, setFreqs] = useState<Uint8Array>(() => new Uint8Array(fftSize / 2));
  const [filePath, setFilePath] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioDataRef = useRef<Int16Array[]>([]);

  const start = () => {
    if (!ctxRef.current || !analyserRef.current || !recorderRef.current) return;

    audioDataRef.current = []; // Reset buffer

    const adapter = ctxRef.current.createRecorderAdapter();
    recorderRef.current.connect(adapter);
    adapter.connect(analyserRef.current);
    if (monitor) analyserRef.current.connect(ctxRef.current.destination);

    // Collect raw PCM data
    // recorderRef.current.ondata = (buffer: Int16Array) => {
    //   audioDataRef.current.push(buffer);
    // };

    recorderRef.current.start();
    loop(); // Visualize
    setIsRecording(true);
  };

  const stop = async () => {
    recorderRef.current?.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsRecording(false);

    const audioBuffers = audioDataRef.current;
    if (audioBuffers.length === 0) return;

    const fullBuffer = mergeBuffers(audioBuffers);
    const wavBytes = encodeWAV(fullBuffer, sampleRate);

    const path = `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.wav`;
    // await RNFS.write(path, Buffer.from(wavBytes).toString("base64"), 'base64');
    setFilePath(path);
  };

  const loop = () => {
    if (!analyserRef.current) return;
    const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(arr);
    setFreqs(arr);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const ctx = new AudioContext({ sampleRate });
    ctxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    analyserRef.current = analyser;

    recorderRef.current = new AudioRecorder({ sampleRate, bufferLengthInSamples });

    return () => {
      try { stop(); } catch {}
      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;
      analyserRef.current = null;
      recorderRef.current = null;
    };
  }, [sampleRate, bufferLengthInSamples, fftSize, smoothing, monitor]);

  return { isRecording, freqs, start, stop, filePath };
}
