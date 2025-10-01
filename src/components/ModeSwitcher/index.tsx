import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { Mode } from '../../types/camera';

type Props = {
  mode: Mode;
  onChangeMode: (m: Mode) => void;
};

const ModeSwitcher: React.FC<Props> = ({ mode, onChangeMode }) => {
  const buttons = useMemo(
    () => [
      { value: 'photo', label: 'Photo', uncheckedColor: '#FFFFFF' },
      { value: 'video', label: 'Video', uncheckedColor: '#FFFFFF' },
    ],
    []
  );

  return (
    <View style={{ width: '70%', alignSelf: 'center' }}>
      <SegmentedButtons
        value={mode}
        onValueChange={(val) => onChangeMode(val as Mode)}
        buttons={buttons}
        density="regular"
      />
    </View>
  );
};

export default memo(ModeSwitcher);
