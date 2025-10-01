import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';

type Props = {
  onClose: () => void;
  flashOn: boolean;
  onToggleFlash: () => void;
  timerText?: string; // NEW: show when provided
};

const SIDE_WIDTH = 56; // matches IconButton touch size nicely

const CameraHeader: React.FC<Props> = ({ onClose, flashOn, onToggleFlash, timerText }) => {
  return (
    <View style={styles.row}>
      {/* Left: Close */}
      <View style={styles.side}>
        <IconButton
          icon="close"
          size={24}
          mode="contained-tonal"
          containerColor="rgba(0,0,0,0.45)"
          iconColor="#fff"
          onPress={onClose}
        />
      </View>

      {/* Center: Timer Chip (only while recording) */}
      <View style={styles.center}>
        {timerText ? (
          <Chip
            mode="flat"
            compact
            style={styles.timerChip}
            textStyle={styles.timerText}
            icon={() => (
              <MaterialCommunityIcons name="record-circle" size={14} color="#ff3b30" />
            )}
          >
            {timerText}
          </Chip>
        ) : null}
      </View>

      {/* Right: Flash */}
      <View style={[styles.side, styles.right]}>
        <IconButton
          icon={flashOn ? 'flash' : 'flash-off'}
          size={24}
          mode="contained-tonal"
          containerColor="rgba(0,0,0,0.45)"
          iconColor="#fff"
          onPress={onToggleFlash}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 6,
  },
  side: {
    width: SIDE_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  timerChip: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
  },
  timerText: {
    color: '#fff',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});

export default memo(CameraHeader);
