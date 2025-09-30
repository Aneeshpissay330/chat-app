import { View, Text } from 'react-native';
import React from 'react';
import Auth from '../screens/Auth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import Stacks from './stacks';

const Navigation = () => {
  const { user, initializing } = useFirebaseAuth();
  if (initializing) return null;

  if (!user) {
    return <Auth />;
  }

  return <Stacks />;
};

export default Navigation;
