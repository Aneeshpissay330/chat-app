// src/screens/OnboardingTwo.tsx
import * as React from 'react';
import { View } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import OnboardingScaffold from '../../../components/OnboardingScaffold';
import { NavigationProp, useNavigation } from '@react-navigation/native';

export type RootNavigationParamList = {
  OnboardingThree: undefined;
};

export default function OnboardingTwo() {
  const navigation = useNavigation<NavigationProp<RootNavigationParamList>>();
  return (
    <OnboardingScaffold
      title="Privacy & Security"
      description="End‑to‑end encryption and granular privacy controls."
      progress={2 / 3}
      primaryCta={{
        label: 'Continue',
        onPress: () => navigation.navigate('OnboardingThree'),
      }}
      secondaryCta={{ label: 'Back', onPress: () => navigation.goBack() }}
    >
      <View style={{ gap: 12 }}>
        <Card mode="outlined">
          <Card.Title
            title="End‑to‑End Encryption"
            subtitle="Messages only you can read"
            left={props => <Avatar.Icon {...props} icon="lock" />}
          />
        </Card>
        <Card mode="outlined">
          <Card.Title
            title="Privacy Controls"
            subtitle="Manage who can reach you"
            left={props => <Avatar.Icon {...props} icon="shield-check" />}
          />
        </Card>
      </View>
    </OnboardingScaffold>
  );
}
