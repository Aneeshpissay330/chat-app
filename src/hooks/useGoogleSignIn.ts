import { useCallback, useState } from 'react';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  linkWithCredential,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '887990739707-stk01khp9kks417j9i3htbahaekul5ug.apps.googleusercontent.com',
  scopes: ['email', 'profile'],
});

type UseGoogleAuthResult = {
  signInOrLink: () => Promise<{ error?: string }>;
  signOutGoogle: () => Promise<void>;
  loading: boolean;
};

export function useGoogleAuth(): UseGoogleAuthResult {
  const [loading, setLoading] = useState(false);

  const signInOrLink = useCallback(async () => {
    setLoading(true);
    try {
      if (!(await GoogleSignin.hasPreviousSignIn())) {
        await GoogleSignin.signOut();
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) return { error: 'No ID token from Google' };

      const credential = GoogleAuthProvider.credential(idToken);
      const auth = getAuth();

      if (auth.currentUser) {
        // Already signed in → link Google
        await linkWithCredential(auth.currentUser, credential);
      } else {
        // Not signed in → sign in with Google
        await signInWithCredential(auth, credential);
      }

      return {};
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            return { error: 'Sign-in is already in progress.' };
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return { error: 'Google Play Services not available or outdated.' };
          case statusCodes.SIGN_IN_CANCELLED:
            return { error: 'cancelled' };
          default:
            return { error: `Google sign-in error: ${error.message}` };
        }
      }
      return { error: 'Unknown error during Google Sign-In' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutGoogle = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch {}
  }, []);

  return { signInOrLink, signOutGoogle, loading };
}
