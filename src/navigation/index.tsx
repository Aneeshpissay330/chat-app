import React from 'react';
import { useAppSelector } from '../app/hooks';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import Stacks from './stacks';
import { View, ActivityIndicator } from 'react-native';
import GoogleLoginScreen from '../screens/GoogleLoginScreen';
import OnboardingStack from './stacks/Onboarding';

const Navigation = () => {
  const { user, initializing } = useFirebaseAuth();
  const onboardingCompleted = useAppSelector((s) => s.onboarding?.completed ?? false);

  // If onboarding hasn't been completed, show it first regardless of auth state
  if (!onboardingCompleted) {
    return <OnboardingStack />;
  }

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // if (!user?.phoneNumber) {
  //   return <PhoneLoginScreen />;
  // }

  if (!user?.email) {
    return <GoogleLoginScreen />;
  }

  if (!onboardingCompleted) {
    return <OnboardingStack />;
  }

  return <Stacks />;
};

export default Navigation;
