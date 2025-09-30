// useGoogleSignIn.ts
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '887990739707-stk01khp9kks417j9i3htbahaekul5ug.apps.googleusercontent.com',
});

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    // ✅ correct shape: response.user / response.idToken (not response.data)
    return { user: response.data?.user, idToken: response.data?.idToken };
  } catch (error: unknown) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          return { error: 'Sign-in is already in progress.' };
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return { error: 'Google Play Services not available or outdated.' };
        case statusCodes.SIGN_IN_CANCELLED:
          return { error: 'User cancelled the sign-in.' };
        default:
          return { error: `Google sign-in error: ${error.message}` };
      }
    }
    return { error: 'An unknown error occurred during Google Sign-In.' };
  }
};
