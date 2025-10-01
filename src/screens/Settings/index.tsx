import { View, Text } from 'react-native';
import React from 'react';
import { List, useTheme } from 'react-native-paper';
import { signOutGoogle } from '../../hooks/useGoogleSignIn';
import { getAuth, signOut } from '@react-native-firebase/auth';

const Settings = () => {
  const theme = useTheme();
  const handleLogout = async () => {
    // Implement logout functionality here
    try {
      await signOutGoogle();
      await signOut(getAuth());
    } catch (error) {
      
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <List.Item
        title="Logout"
        right={props => <List.Icon {...props} icon="logout" />}
        onPress={handleLogout}
      />
    </View>
  );
};

export default Settings;
