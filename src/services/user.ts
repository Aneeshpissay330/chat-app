// services/user.ts
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export type UserDoc = {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  providers?: string[];
  searchablePhones?: string[];
  createdAt?: any;
  updatedAt?: any;
};

export function subscribeUserById(
  uid: string,
  onData: (user: (UserDoc & { id: string }) | null) => void,
  onError?: (e: any) => void
) {
  return firestore()
    .collection('users')
    .doc(uid)
    .onSnapshot(
      (snap) => {
        if (!snap.exists) {
          onData(null);
          return;
        }
        onData({ id: snap.id, ...(snap.data() as UserDoc) });
      },
      (err) => {
        console.error('Error listening to user doc:', err);
        onError?.(err);
      }
    );
}

export async function updateUserProfile(input: {
  displayName?: string;
  username?: string;
  bio?: string;
  photoURL?: string;
}) {
  const user = auth().currentUser;
  if (!user) throw new Error('User not logged in');

  const ref = firestore().collection('users').doc(user.uid);

  await ref.set(
    {
      ...input,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Keep Auth basic profile in sync (optional but nice)
  if (input.displayName !== undefined || input.photoURL !== undefined) {
    await user.updateProfile({
      displayName: input.displayName ?? user.displayName ?? undefined,
      photoURL: input.photoURL ?? user.photoURL ?? undefined,
    });
  }
}