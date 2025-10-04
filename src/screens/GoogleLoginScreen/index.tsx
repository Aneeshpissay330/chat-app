// GoogleLoginScreen.tsx
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { Card, Snackbar, Text, useTheme } from 'react-native-paper';
import { useGoogleAuth } from '../../hooks/useGoogleSignIn';

export default function GoogleLoginScreen({ navigation }: any) {
  const theme = useTheme();
  const { signInOrLink, loading } = useGoogleAuth();
  const [snack, setSnack] = useState({ visible: false, message: '' });

  // screens/GoogleLoginScreen.tsx
  const onPress = async () => {
    const { error } = await signInOrLink();
    if (error && error !== 'cancelled') {
      setSnack({ visible: true, message: error });
      return;
    }
    if (error === 'cancelled') return;
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Image
        source={require('../../assets/images/light-illustration.png')}
        resizeMode="contain"
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height * 0.4,
          marginBottom: 16,
          borderRadius: 16,
        }}
      />

      <Card mode="outlined" style={{ borderRadius: 20 }}>
        <Card.Content style={{ gap: 14 }}>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.primary, fontWeight: '600' }}
          >
            Welcome!
          </Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7, marginBottom: 8 }}>
            Sign in or get started on your journey — we’re glad you’re here.
          </Text>

          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
            Continue with Google
          </Text>

          <GoogleSigninButton
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
            onPress={onPress}
            disabled={loading}
            style={{
              alignSelf: 'center',
              width: '100%',
              height: 48,
              marginTop: 8,
            }}
          />
        </Card.Content>
      </Card>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack(s => ({ ...s, visible: false }))}
        duration={3000}
        style={{ marginBottom: 24 }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}
