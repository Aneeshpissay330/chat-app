import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import type { Mode } from '../../types/camera';

type Props = {
  mode: Mode;
  isRecording: boolean;
  onPressShutter: () => void;
  onPressGallery: () => void; // NEW
  onPressSwitchCamera: () => void; // NEW
};

const CaptureBar: React.FC<Props> = ({
  mode,
  isRecording,
  onPressShutter,
  onPressGallery,
  onPressSwitchCamera,
}) => {
  const shutterIcon = isRecording ? 'stop-circle' : 'radiobox-marked';
  const shutterColor = isRecording ? '#ff3b30' : '#fff';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* Left: Gallery */}
        <IconButton
          icon="image-multiple"
          size={28}
          onPress={onPressGallery}
          accessibilityLabel="Open gallery"
          iconColor="#FFFFFF"
        />

        {/* Center: Shutter */}
        <IconButton
          icon={shutterIcon}
          iconColor={shutterColor}
          size={72}
          onPress={onPressShutter}
          accessibilityLabel={
            mode === 'photo'
              ? 'Take photo'
              : isRecording
              ? 'Stop recording'
              : 'Start recording'
          }
        />

        {/* Right: Switch camera (disabled while recording) */}
        <IconButton
          icon="camera-switch"
          size={28}
          disabled={isRecording}
          onPress={onPressSwitchCamera}
          accessibilityLabel="Switch camera"
          iconColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  row: {
    width: '86%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: { textAlign: 'center', marginTop: 6, opacity: 0.9 },
});

export default memo(CaptureBar);
