import { useCallback, useMemo, useState } from 'react';

export function useTorch(initial = false) {
  const [flashOn, setFlashOn] = useState(initial);
  const toggleFlash = useCallback(() => setFlashOn(v => !v), []);
  const torch: 'on' | 'off' = flashOn ? 'on' : 'off';
  return { flashOn, torch, toggleFlash };
}
