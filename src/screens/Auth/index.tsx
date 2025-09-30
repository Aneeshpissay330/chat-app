import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useTransition } from 'react';
import { Alert, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { googleSignIn } from '../../hooks/useGoogleSignIn';
import { styles } from './styles';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';

const Auth = () => {
  const theme = useTheme();
  const [isInProgress, startTransition] = useTransition();
  const handleGoogleLogin = () => {
    startTransition(async () => {
      const result = await googleSignIn();
      if (result.error) {
        console.log('Login Error:', result.error);
      } else {
        if (!result.idToken) {
          Alert.alert('Google Sign-In', 'No ID token returned.');
        } else {
          const googleCredential = GoogleAuthProvider.credential(
            result.idToken,
          );
          await signInWithCredential(getAuth(), googleCredential);
        }
      }
    });
  };
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Avatar.Icon size={100} icon="message-text" />
      <Text variant="headlineMedium" style={styles.headerTitle}>
        Chat App
      </Text>

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleLogin}
        disabled={isInProgress}
      />
    </View>
  );
};

export default Auth;
