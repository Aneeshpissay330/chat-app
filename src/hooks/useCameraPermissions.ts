import { useEffect } from 'react';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import type { Mode } from '../types/camera';

export function useCameraPermissions(mode: Mode) {
  const { hasPermission: hasCam, requestPermission: requestCam } = useCameraPermission();
  const { hasPermission: hasMic, requestPermission: requestMic } = useMicrophonePermission();

  // Request camera once
  useEffect(() => {
    if (!hasCam) requestCam();
  }, [hasCam, requestCam]);

  // When switching to video, ensure mic permission
  useEffect(() => {
    if (mode === 'video' && !hasMic) requestMic();
  }, [mode, hasMic, requestMic]);

  return { hasCam, hasMic };
}
