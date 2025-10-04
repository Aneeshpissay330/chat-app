// services/fcm.ts
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export async function ensureFcmPermission(): Promise<boolean> {
  // Request user permission (iOS prompt; Android 13+ notifications permission)
  const authStatus = await messaging().requestPermission();
  // You could check for AUTHORIZED/PROVISIONAL here if you want to gate
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED
      || authStatus === messaging.AuthorizationStatus.PROVISIONAL
      || Platform.OS === 'android'; // Android often returns DENIED but can still get token pre-13
}

export async function registerFcmToken(uid: string): Promise<string | null> {
  const permissionOk = await ensureFcmPermission();
  if (!permissionOk) return null;

  // iOS: required if you disabled auto-registration or see the getToken error
  // It's harmless to call on Android; only does work on iOS. :contentReference[oaicite:2]{index=2}
  try { await messaging().registerDeviceForRemoteMessages(); } catch {}

  const token = await messaging().getToken(); // unique per app installation :contentReference[oaicite:3]{index=3}
  const apnsToken = Platform.OS === 'ios' ? await messaging().getAPNSToken() : null; // iOS only :contentReference[oaicite:4]{index=4}

  // Store in a subcollection so users can have multiple devices; doc id = token
  // This makes cleanup & targeting easy and avoids array-dup issues. :contentReference[oaicite:5]{index=5}
  const ref = firestore()
    .collection('users')
    .doc(uid)
    .collection('devices')
    .doc(token);

  await ref.set(
    {
      token,
      platform: Platform.OS,
      apnsToken: apnsToken ?? null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      createdAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return token;
}

let tokenRefreshUnsub: (() => void) | null = null;

export function subscribeFcmTokenRefresh(uid: string) {
  // Keep user/devices/{token} up to date when FCM rotates tokens. :contentReference[oaicite:6]{index=6}
  if (tokenRefreshUnsub) tokenRefreshUnsub();
  tokenRefreshUnsub = messaging().onTokenRefresh(async (newToken) => {
    const apnsToken = Platform.OS === 'ios' ? await messaging().getAPNSToken() : null;
    await firestore()
      .collection('users')
      .doc(uid)
      .collection('devices')
      .doc(newToken)
      .set(
        {
          token: newToken,
          platform: Platform.OS,
          apnsToken: apnsToken ?? null,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          // createdAt left untouched if it already exists
        },
        { merge: true }
      );
  });
}

export function unsubscribeFcmTokenRefresh() {
  if (tokenRefreshUnsub) {
    tokenRefreshUnsub();
    tokenRefreshUnsub = null;
  }
}
