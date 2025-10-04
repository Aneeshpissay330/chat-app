// hooks/useUserDoc.ts
import { useEffect, useState } from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export type UserDoc = {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providers: string[];
  searchablePhones: string[];
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
};

export function useUserDoc(uid?: string) {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const ref = firestore().collection('users').doc(uid);
    const unsub = ref.onSnapshot(
      snap => {
        if (snap.exists()) {
          const data = snap.data() as UserDoc;
          setProfile({ ...data, uid: snap.id }); // uid is overwritten here, which is correct
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      e => {
        setError(e?.message ?? 'Failed to load user');
        setLoading(false);
      },
    );
    return unsub;
  }, [uid]);

  const updateProfile = (patch: Partial<UserDoc>) =>
    firestore()
      .collection('users')
      .doc(uid!)
      .set(
        { ...patch, updatedAt: firestore.FieldValue.serverTimestamp() },
        { merge: true },
      );

  return { profile, loading, error, updateProfile };
}
