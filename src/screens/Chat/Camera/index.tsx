import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { useAppState } from '@react-native-community/hooks';

const Camera = () => {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === 'active';
  if (!hasPermission) {
    requestPermission();
  }
  console.log({ hasPermission, isFocused, appState, isActive });
  if (device == null) return;
  return (
    <VisionCamera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
    />
  );
};

export default Camera;
