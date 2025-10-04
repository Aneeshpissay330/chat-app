import { RoundedRect, Canvas as SKCanvas } from '@shopify/react-native-skia';
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { FFT_SIZE, GROUP_QUANTITY, PLAYER_WIDTH } from '../../utils/audio';
import { colors } from '../../theme';
import { useSharedValue } from 'react-native-reanimated';

interface Point {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface ChartProps {
  data: Uint8Array;
  dataSize: number;
}

interface Size {
  width: number;
  height: number;
}

export const FrequencyChart: React.FC<ChartProps> = props => {
  const size = useSharedValue<Size>({ width: 0, height: 0 });
  const { data, dataSize } = props;
  const { width, height } = size.value;

  const barWidth = width / (FFT_SIZE / 2 / GROUP_QUANTITY) - 5;

  const points: Point[] = useMemo(() => {
    const p: Point[] = [];

    let runningTotal = 0;

    for (let i = 0; i < FFT_SIZE / 2; i += GROUP_QUANTITY) {
      for (let j = i; j < i + GROUP_QUANTITY; j++) {
        runningTotal += data[j];
      }
      const avg = runningTotal / GROUP_QUANTITY;

      const x = i + 1 / GROUP_QUANTITY;
      const y1 = height;
      const y2 = height - height * (avg / FFT_SIZE / 2);

      const color = colors.primary;
      p.push({ x1: x, y1, x2: x, y2, color });
      runningTotal = 0;
    }
    return p;
  }, [size, data, dataSize]);

  return (
    <SKCanvas
      style={{
        flex: 2,
        width: PLAYER_WIDTH,
        alignSelf: 'center',
      }}
      onSize={size}
    >
      {points.map((point, index) => (
        <RoundedRect
          r={10}
          key={index}
          x={point.x1}
          y={point.y1}
          height={Math.min((point.y2 - point.y1) * 4, -10)}
          width={barWidth}
          color={point.color}
        />
      ))}
    </SKCanvas>
  );
};
