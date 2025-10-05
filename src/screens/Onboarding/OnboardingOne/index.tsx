// src/screens/OnboardingOne.tsx
import * as React from 'react';
import { View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import OnboardingScaffold from '../../../components/OnboardingScaffold';

export type RootNavigationParamList = {
  OnboardingTwo: undefined;
};


export default function OnboardingOne() {
  const navigation = useNavigation<NavigationProp<RootNavigationParamList>>();
  const theme = useTheme();
  return (
    <OnboardingScaffold
      title="Enhanced Conversations"
      description="Share media, send voice notes, and collaborate in real-time."
      progress={1 / 3}
      primaryCta={{
        label: 'Continue',
        onPress: () => navigation.navigate('OnboardingTwo'),
      }}
      secondaryCta={{
        label: 'Skip',
        onPress: () => console.log(""),
      }}
    >
      <View style={{ gap: 12, backgroundColor: theme.colors.background }}>
        <Card mode="elevated">
          <Card.Title
            title="Voice Messages"
            subtitle="Send quick voice notes"
            left={props => <Avatar.Icon {...props} icon="microphone" />}
          />
        </Card>
        <Card mode="elevated">
          <Card.Title
            title="Media Sharing"
            subtitle="Share photos & videos instantly"
            left={props => <Avatar.Icon {...props} icon="image-multiple" />}
          />
        </Card>
      </View>
    </OnboardingScaffold>
  );
}
