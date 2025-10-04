// services/avatar.ts
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import ImageCropPicker, { Image as PickerImage } from 'react-native-image-crop-picker';
import { Platform } from 'react-native';

/** Launch gallery with a circle cropper and return a local path */
export async function pickAvatarFromGallery(): Promise<PickerImage> {
  return ImageCropPicker.openPicker({
    cropping: true,
    cropperCircleOverlay: true,
    compressImageQuality: 0.9,
    mediaType: 'photo',
    width: 512,
    height: 512,
    includeExif: false,
    forceJpg: true,
  });
}

/** Launch camera with a circle cropper and return a local path */
export async function takeAvatarPhoto(): Promise<PickerImage> {
  return ImageCropPicker.openCamera({
    cropping: true,
    cropperCircleOverlay: true,
    compressImageQuality: 0.9,
    mediaType: 'photo',
    width: 512,
    height: 512,
    includeExif: false,
    forceJpg: true,
  });
}

/** Upload the local image file to Firebase Storage and return the downloadURL */
export async function uploadAvatar(localPath: string): Promise<string> {
  const user = auth().currentUser;
  if (!user) throw new Error('User not logged in');

  const ext = localPath.split('.').pop() || 'jpg';
  const ref = storage().ref(`avatars/${user.uid}.${ext}`);

  // On Android we must use file:// path for putFile
  const uploadPath = Platform.select({
    android: localPath,
    ios: localPath.replace('file://', ''),
    default: localPath,
  });

  await ref.putFile(uploadPath, {
    contentType: 'image/jpeg',
    cacheControl: 'public,max-age=604800,immutable',
  } as any);

  // Bust caches by appending token parameter provided by Storage
  const url = await ref.getDownloadURL();
  return url;
}
