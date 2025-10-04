import { useEffect, useRef, useState, useTransition } from 'react';
import {
  AnalyserNode,
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
} from 'react-native-audio-api';

const FFT_SIZE = 512;

export const useAudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [freqs, setFreqs] = useState<Uint8Array>(
    new Uint8Array(FFT_SIZE / 2).fill(10),
  );

  const [isLoading, startTransition] = useTransition();
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const draw = () => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    setFreqs(dataArray);
    requestAnimationFrame(draw);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      bufferSourceRef.current?.stop();
      pausedTimeRef.current = 0;
      startTimeRef.current = 0;
    } else {
      if (!audioContextRef.current || !analyserRef.current) return;
      bufferSourceRef.current = audioContextRef.current.createBufferSource();
      bufferSourceRef.current.buffer = audioBufferRef.current;
      bufferSourceRef.current.connect(analyserRef.current);

      startTimeRef.current = audioContextRef.current.currentTime;
      bufferSourceRef.current.start();

      requestAnimationFrame(draw);
    }
    setIsPlaying(prev => !prev);
  };

  const getCurrentPlaybackTime = () => {
    if (!audioContextRef.current) return 0;
    if (isPlaying) {
      return (
        pausedTimeRef.current +
        (audioContextRef.current.currentTime - startTimeRef.current)
      );
    } else {
      return pausedTimeRef.current;
    }
  };

  const percentComplete = getCurrentPlaybackTime() / (audioBufferRef.current?.duration ?? 1);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = FFT_SIZE;
      analyserRef.current.smoothingTimeConstant = 0.8;

      analyserRef.current.connect(audioContextRef.current.destination);
    }
    const fetchBuffer = () => {
      startTransition(async () => {
        audioBufferRef.current = await fetch(audioUrl)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer =>
            audioContextRef.current!.decodeAudioData(arrayBuffer),
          );
      });
    };
    fetchBuffer();

    return () => {
      audioContextRef.current?.close();
    };
  }, [audioUrl]);
  return {
    isPlaying,
    isLoading,
    freqs,
    handlePlayPause,
    percentComplete,
    audioBuffer: audioBufferRef.current,
  }
};
