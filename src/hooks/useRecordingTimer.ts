import { useEffect, useMemo } from 'react';
import type { Mode } from '../types/camera';
import { useTimer } from './useTimer';

export function useRecordingTimer(mode: Mode, isRecording: boolean) {
  const { formatted, start, stop, reset } = useTimer();

  useEffect(() => {
    if (mode === 'video' && isRecording) {
      reset(0);
      start();
    } else {
      stop();
      if (mode !== 'video') reset(0);
    }
  }, [mode, isRecording, start, stop, reset]);

  const timerText = useMemo(
    () => (mode === 'video' && isRecording ? formatted : undefined),
    [mode, isRecording, formatted]
  );

  return timerText;
}
