import firestore from '@react-native-firebase/firestore';

export async function getUserById(uid: string) {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
