import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useCameraDevice,
  Camera as VisionCamera,
  type PhotoFile,
  type VideoFile,
} from 'react-native-vision-camera';
import CameraHeader from '../../../components/CameraHeader';
import CaptureBar from '../../../components/CaptureBar';
import ModeSwitcher from '../../../components/ModeSwitcher';
import { useCameraLifecycle } from '../../../hooks/useCameraLifecycle';
import { useCameraPermissions } from '../../../hooks/useCameraPermissions';
import { useRecordingControls } from '../../../hooks/useRecordingControls';
import { useRecordingTimer } from '../../../hooks/useRecordingTimer';
import { useTorch } from '../../../hooks/useTorch';
import { Mode } from '../../../types/camera';
import { SafeAreaView } from 'react-native-safe-area-context';

export type RootTabParamList = {
  Gallery: undefined;
};

const CameraScreen: React.FC = () => {
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [mode, setMode] = useState<Mode>('photo');
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const device = useCameraDevice(position);
  const isActive = useCameraLifecycle();
  const { hasCam } = useCameraPermissions(mode);
  const { flashOn, torch, toggleFlash } = useTorch(false);

  const cameraRef = useRef<VisionCamera>(null);
  const onPhoto = useCallback((photo: PhotoFile) => {
    // TODO: Handle photo (preview/upload)
    console.log('Photo', photo.path);
  }, []);
  const onVideo = useCallback((video: VideoFile) => {
    // TODO: Handle video (preview/upload)
    console.log('Video', video.path);
  }, []);

  const { isRecording, onShoot } = useRecordingControls(
    cameraRef,
    mode,
    flashOn,
    onPhoto,
    onVideo,
  );
  const timerText = useRecordingTimer(mode, isRecording);

  const nav = useNavigation();
  const onClose = useCallback(() => {
    if (nav.canGoBack()) nav.goBack();
  }, [nav]);

  const onPressGallery = useCallback(() => {
    // TODO: open gallery picker or navigate to gallery
    navigation.navigate("Gallery");
  }, []);

  const onPressSwitchCamera = useCallback(() => {
    if (isRecording) return;
    setPosition(p => (p === 'back' ? 'front' : 'back'));
  }, [isRecording]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: 'black' },
        camera: { ...StyleSheet.absoluteFillObject },
        topBar: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 8,
        },
        bottomBar: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          paddingHorizontal: 16,
        },
      }),
    [],
  );

  if (device == null || !hasCam) return null;

  return (
    <View style={styles.container}>
      <VisionCamera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isActive}
        enableZoomGesture
        torch={device?.hasTorch ? torch : undefined}
        photo
        video
        audio
      />

      {/* TOP: Close + Flash */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <CameraHeader
          onClose={onClose}
          flashOn={flashOn}
          onToggleFlash={toggleFlash}
          timerText={timerText}
        />
      </SafeAreaView>

      {/* BOTTOM: Mode switch + Shutter */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <ModeSwitcher mode={mode} onChangeMode={setMode} />
        <CaptureBar
          mode={mode}
          isRecording={isRecording}
          onPressShutter={onShoot}
          onPressGallery={onPressGallery}
          onPressSwitchCamera={onPressSwitchCamera}
        />
      </SafeAreaView>
    </View>
  );
};

export default React.memo(CameraScreen);
