import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingCarousel from './OnboardingCarousel';

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
  <Stack.Screen name="Onboarding" component={OnboardingCarousel} />
    </Stack.Navigator>
  );
}
