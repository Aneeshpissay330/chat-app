import { useCallback, useEffect, useRef, useState } from 'react';

export type UseTimerOptions = {
  autoStart?: boolean;
  startFrom?: number; // in seconds
  tickMs?: number;    // default 1000
};

export function useTimer(options: UseTimerOptions = {}) {
  const { autoStart = false, startFrom = 0, tickMs = 1000 } = options;

  const [seconds, setSeconds] = useState<number>(startFrom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, tickMs);
  }, [tickMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningRef.current = false;
  }, []);

  const reset = useCallback((to: number = 0) => {
    setSeconds(to);
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  const formatted = formatHMS(seconds);

  return { seconds, formatted, start, stop, reset, running: runningRef.current };
}

function formatHMS(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
