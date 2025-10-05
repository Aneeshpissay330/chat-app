// src/screens/OnboardingThree.tsx
import * as React from 'react';
import { View } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import OnboardingScaffold from '../../../components/OnboardingScaffold';
import { useNavigation } from '@react-navigation/native';

export type RootNavigationParamList = {
  OnboardingThree: undefined;
};

export default function OnboardingThree() {
    const navigation = useNavigation();
  return (
    <OnboardingScaffold
      title="Sync Across Devices"
      description="Access conversations anywhere with real‑time sync."
      progress={1}
      primaryCta={{ label: 'Get Started', onPress: () => console.log("") }}
      secondaryCta={{ label: 'Back', onPress: () => navigation.goBack() }}
    >
      <View style={{ gap: 12 }}>
        <Card mode="contained">
          <Card.Title
            title="Cloud Backup"
            subtitle="Never lose your messages"
            left={(props) => <Avatar.Icon {...props} icon="cloud-outline" />}
          />
        </Card>
        <Card mode="contained">
          <Card.Title
            title="Multi‑Device"
            subtitle="Continue anywhere"
            left={(props) => <Avatar.Icon {...props} icon="cellphone-link" />}
          />
        </Card>
      </View>
    </OnboardingScaffold>
  );
}
