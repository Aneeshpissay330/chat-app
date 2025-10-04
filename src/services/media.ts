// services/media.ts
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

export type UploadedFile = {
  url: string;
  path: string;        // storage path
  contentType?: string;
  size?: number;
  width?: number;
  height?: number;
  durationMs?: number; // for video/audio
  name?: string;       // original filename if any
};

function normalizeLocalPath(p: string) {
  // Firebase Storage putFile wants plain path on iOS (no file://), full path on Android
  return Platform.OS === 'ios' ? p.replace(/^file:\/\//, '') : p;
}

function extFromMime(m?: string, fallback = 'bin') {
  if (!m) return fallback;
  const part = m.split('/')[1];
  if (!part) return fallback;
  if (part.includes('+')) return part.split('+')[0];
  return part;
}

export async function uploadChatFile(
  chatId: string,
  {
    localPath,
    mime,
    name,
    size,
    width,
    height,
    durationMs,
    overrideExt,
  }: {
    localPath: string;
    mime?: string;
    name?: string;
    size?: number;
    width?: number;
    height?: number;
    durationMs?: number;
    overrideExt?: string;
  }
): Promise<UploadedFile> {
  const user = auth().currentUser;
  if (!user) throw new Error('Not authenticated');

  const ts = Date.now();
  const ext = overrideExt || extFromMime(mime, 'bin');
  const fileName = `${ts}-${user.uid}.${ext}`;
  const storagePath = `chat_media/${chatId}/${user.uid}/${fileName}`;
  const ref = storage().ref(storagePath);

  const pathForUpload = normalizeLocalPath(localPath);
  await ref.putFile(pathForUpload, {
    contentType: mime,
    cacheControl: 'public,max-age=604800,immutable',
  } as any);

  const url = await ref.getDownloadURL();

  return {
    url,
    path: storagePath,
    contentType: mime,
    size,
    width,
    height,
    durationMs,
    name,
  };
}
