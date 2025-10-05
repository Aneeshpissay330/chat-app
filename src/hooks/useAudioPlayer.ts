
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
} from 'react-native-audio-api';
import RNFS from 'react-native-fs';
import { Buffer } from '@craftzdog/react-native-buffer';

/**
 * useAudioPlayer
 * - fetch + decode once per URL (supports http(s), file://, and absolute paths)
 * - creates fresh BufferSource on play/resume
 * - progress tracked via requestAnimationFrame
 * - pause/seek implemented by stopping node + remembering offset
 *
 * Returned API:
 * const { isPlaying, isLoading, duration, progress, togglePlayPause, seekTo, stop } = useAudioPlayer({ audioUrl })
 */
export function useAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [duration, setDuration] = useState(0); // ms
  const [progress, setProgress] = useState(0); // ms

  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startTimeRef = useRef(0); // contextTime when current node started (sec)
  const pauseMsRef = useRef(0);   // accumulated paused offset (ms)
  const rafRef = useRef<number | null>(null);

  // ensure context exists
  const ensureContext = () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  };

  const loadFromLocal = async (urlOrPath: string) => {
    // strip scheme
    const path = urlOrPath.startsWith('file://') ? urlOrPath.replace('file://', '') : urlOrPath;
    const base64 = await RNFS.readFile(path, 'base64');
    const arr = Buffer.from(base64, 'base64');
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
  };

  // load/decode
  const loadAudio = useCallback(async () => {
    if (!audioUrl) return;
    const ctx = ensureContext();
    let arrayBuffer: ArrayBuffer;

    // Decide how to read
    const lower = audioUrl.toLowerCase();
    const isLocal = lower.startsWith('file://') || (!lower.startsWith('http://') && !lower.startsWith('https://') && !lower.startsWith('content://'));

    if (isLocal) {
      arrayBuffer = await loadFromLocal(audioUrl);
    } else {
      const res = await fetch(audioUrl);
      const ab = await res.arrayBuffer();
      arrayBuffer = ab;
    }

    const audioBuf = await ctx.decodeAudioData(arrayBuffer);
    bufferRef.current = audioBuf;
    setDuration(Math.floor(audioBuf.duration * 1000));
    setProgress(0);
    pauseMsRef.current = 0;
  }, [audioUrl]);

  const stopRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const tick = useCallback(() => {
    const ctx = ctxRef.current;
    const buf = bufferRef.current;
    if (!ctx || !buf) return;

    const elapsedMs = (ctx.currentTime - startTimeRef.current) * 1000 + pauseMsRef.current;
    const next = Math.min(elapsedMs, buf.duration * 1000);
    setProgress(next);

    if (next >= buf.duration * 1000) {
      // natural end
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }
      setIsPlaying(false);
      stopRaf();
      pauseMsRef.current = 0;
      setProgress(0);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startNode = useCallback(async (offsetMs: number) => {
    const ctx = ensureContext();
    try { await ctx.resume(); } catch {}
    const buf = bufferRef.current;
    if (!buf) return;

    // fresh node every time
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0, Math.max(0, offsetMs) / 1000);

    sourceRef.current = src;
    startTimeRef.current = ctx.currentTime;
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
    setIsPlaying(true);
  }, [tick]);

  const play = useCallback(() => {
    if (!bufferRef.current) return;
    startNode(pauseMsRef.current);
  }, [startNode]);

  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      const elapsedMs = (ctx.currentTime - startTimeRef.current) * 1000 + pauseMsRef.current;
      pauseMsRef.current = elapsedMs;
    }
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      try { sourceRef.current.disconnect(); } catch {}
      sourceRef.current = null;
    }
    stopRaf();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      try { sourceRef.current.disconnect(); } catch {}
      sourceRef.current = null;
    }
    stopRaf();
    setIsPlaying(false);
    setProgress(0);
    pauseMsRef.current = 0;
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seekTo = useCallback((ms: number) => {
    // clamp and restart
    const buf = bufferRef.current;
    if (!buf) return;
    const clamped = Math.max(0, Math.min(ms, buf.duration * 1000));
    pauseMsRef.current = clamped;
    setProgress(clamped);
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      try { sourceRef.current.disconnect(); } catch {}
      sourceRef.current = null;
    }
    startNode(clamped);
    setIsPlaying(true);
  }, [startNode]);

  // load on URL change
  useEffect(() => {
    if (!audioUrl) return;
    startTransition(async () => {
      try {
        await loadAudio();
      } catch (e) {
        console.warn('Failed to load audio', e);
      }
    });
    return () => {
      stop();
      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;
      bufferRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  return {
    isPlaying,
    isLoading,
    duration,
    progress,
    togglePlayPause,
    seekTo,
    stop,
  };
}
