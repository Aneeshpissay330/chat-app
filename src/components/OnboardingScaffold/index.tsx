// src/components/OnboardingScaffold.tsx
import * as React from 'react';
import { View } from 'react-native';
import { ProgressBar, Text, Button, useTheme } from 'react-native-paper';

type Props = {
  title: string;
  description: string;
  progress: number; // 0..1
  primaryCta: { label: string; onPress: () => void };
  secondaryCta?: { label: string; onPress: () => void };
  children?: React.ReactNode;
};

export default function OnboardingScaffold({
  title,
  description,
  progress,
  primaryCta,
  secondaryCta,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, padding: 24, gap: 24, justifyContent: 'space-between' }}>
      <View style={{ gap: 16 }}>
        <ProgressBar progress={progress} />
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ opacity: 0.8 }}>
          {description}
        </Text>
        {children}
      </View>

      <View style={{ gap: 12 }}>
        <Button mode="contained" onPress={primaryCta.onPress}>
          {primaryCta.label}
        </Button>
        {secondaryCta ? (
          <Button mode="text" onPress={secondaryCta.onPress}>
            {secondaryCta.label}
          </Button>
        ) : null}
      </View>
    </View>
  );
}
