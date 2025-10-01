import { Platform } from 'react-native';
import { MutableRefObject, useCallback, useState } from 'react';
import type { Mode } from '../types/camera';
import type { Camera, PhotoFile, VideoFile } from 'react-native-vision-camera';

export function useRecordingControls(
  cameraRef: MutableRefObject<Camera | null>,
  mode: Mode,
  flashOn: boolean,
  onPhoto?: (photo: PhotoFile) => void,
  onVideo?: (video: VideoFile) => void
) {
  const [isRecording, setIsRecording] = useState(false);

  const onShoot = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;

    if (mode === 'photo') {
      try {
        const photo = await cam.takePhoto({
          flash: flashOn ? 'on' : 'off',
          enableShutterSound: Platform.OS === 'android',
        });
        onPhoto?.(photo);
      } catch { /* swallow for now */ }
    } else {
      if (!isRecording) {
        try {
          setIsRecording(true);
          await cam.startRecording({
            flash: 'off',
            onRecordingFinished: (video: VideoFile) => {
              setIsRecording(false);
              onVideo?.(video);
            },
            onRecordingError: () => setIsRecording(false),
          });
        } catch {
          setIsRecording(false);
        }
      } else {
        try {
          await cam.stopRecording();
        } catch {
          setIsRecording(false);
        }
      }
    }
  }, [mode, flashOn, isRecording, onPhoto, onVideo]);

  return { isRecording, onShoot };
}
