// hooks/useUserDoc.ts
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type UserDoc = {
  uid: string;
  displayName?: string | null;
  username?: string | null;
  bio?: string | null;
  photoURL?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

export function useUserDoc() {
  const [userDoc, setUserDoc] = useState<(UserDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth().currentUser;
    if (!u) {
      setUserDoc(null);
      setLoading(false);
      return;
    }
    const unsub = firestore()
      .collection('users')
      .doc(u.uid)
      .onSnapshot(
        (snap) => {
          setUserDoc(snap.exists() ? ({ id: snap.id, ...(snap.data() as UserDoc) }) : null);
          setLoading(false);
        },
        () => setLoading(false)
      );

    return unsub;
  }, []);

  return { userDoc, loading };
}
