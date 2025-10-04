import React from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import Stacks from './stacks';
import { View, ActivityIndicator } from 'react-native';
import GoogleLoginScreen from '../screens/GoogleLoginScreen';

const Navigation = () => {
  const { user, initializing } = useFirebaseAuth();
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

  return <Stacks />;
};

export default Navigation;
