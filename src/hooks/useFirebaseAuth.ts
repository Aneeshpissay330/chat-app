// hooks/useFirebaseAuth.ts
import { useState, useEffect } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getAuth, onIdTokenChanged } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { registerFcmToken, subscribeFcmTokenRefresh } from '../services/fcm';

// Helper to normalize names
const normalizeName = (name?: string | null) => {
  if (!name) return null;
  const clean = name.replace(/\s+/g, ' ').trim();
  return clean.length ? clean : null;
};

// Single source of truth for display name, prefer Auth -> Google provider
const resolveDisplayName = (firebaseUser: FirebaseAuthTypes.User | null) => {
  if (!firebaseUser) return null;
  const fromAuth = normalizeName(firebaseUser.displayName);

  const googleProvider = firebaseUser.providerData.find(
    p => p.providerId === 'google.com'
  );

  const fromProvider = normalizeName(googleProvider?.displayName);

  return fromAuth ?? fromProvider ?? null;
};

export function useFirebaseAuth() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const displayName = resolveDisplayName(firebaseUser);

        const ref = firestore().collection('users').doc(firebaseUser.uid);
        await ref.set(
          {
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber ?? null,
            email: firebaseUser.email ?? null,
            displayName,                       // <- unified, normalized
            photoURL: firebaseUser.photoURL ?? null,
            providers: firebaseUser.providerData.map(p => p.providerId),
            searchablePhones: firebaseUser.phoneNumber ? [firebaseUser.phoneNumber] : [],
            updatedAt: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Move FCM registration here so it always runs when auth is ready
        const uid = firebaseUser.uid;
        await registerFcmToken(uid);
        subscribeFcmTokenRefresh(uid);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  return { user, initializing };
}
