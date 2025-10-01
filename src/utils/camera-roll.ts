import { PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import type {
  Include,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';

/**
 * Check or request necessary permissions for accessing media on Android.
 */
async function hasAndroidPermission(): Promise<boolean> {
  const androidVersion =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(Platform.Version, 10);
  const getCheckPermissionPromise = (): Promise<boolean> => {
    if (androidVersion >= 33) {
      return Promise.all([
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ),
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }

  const getRequestPermissionPromise = (): Promise<boolean> => {
    if (androidVersion >= 33) {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]).then(
        statuses =>
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ).then(status => status === PermissionsAndroid.RESULTS.GRANTED);
    }
  };

  return await getRequestPermissionPromise();
}

// Keep Include lean so we only fetch what we need
const MIN_INCLUDE: Include[] = ['filename', 'fileSize', 'imageSize'];

/** A single minimal photo record you asked for */
export type MinimalPhoto = {
  id: string;
  url: string;
  filename: string;
  size: number;      // bytes
  album: string;     // album title this photo belongs to
};

/** Grouped return type */
export type AlbumWithPhotos = {
  album: { title: string; count: number };
  photos: MinimalPhoto[];
};

function toMinimal(
  edge: PhotoIdentifier,
  albumTitle: string
): MinimalPhoto {
  const { node } = edge;
  const url = node.image?.uri ?? '';
  const id = node.id; // prefer assetId if present
  const size = (node as any).image.fileSize ?? 0;  // fileSize is present when requested via include
  const filename =
    (node as any).image.filename;

  return { id, url, filename, size, album: albumTitle };
}

/**
 * Get albums and (for each) fetch photos, returning only id, url, filename, size, album.
 * Reuses your Android permission gate. :contentReference[oaicite:1]{index=1}
 */
export async function getAlbumsGroupedMinimal(options?: {
  perAlbum?: number;
  assetType?: 'All' | 'Photos' | 'Videos';
}): Promise<AlbumWithPhotos[]> {
  const { perAlbum = 20, assetType = 'Photos' } = options ?? {};

  if (Platform.OS === 'android') {
    const ok = await hasAndroidPermission(); // from your file
    if (!ok) return [];
  }

  const albums = await CameraRoll.getAlbums({ assetType });

  const grouped: AlbumWithPhotos[] = await Promise.all(
    albums.map(async (album) => {
      const res = await CameraRoll.getPhotos({
        first: perAlbum,
        assetType,
        groupName: album.title,
        groupTypes: 'Album',     // iOS uses this; Android ignores
        include: MIN_INCLUDE,    // only fetch what we need
      });

      const photos = res.edges.map((e) => toMinimal(e as PhotoIdentifier, album.title));

      return {
        album: { title: album.title, count: album.count },
        photos,
      };
    })
  );

  // Optional: sort by album size descending
  grouped.sort((a, b) => b.album.count - a.album.count);
  return grouped;
}

/** If you ever need a single flat list instead of grouped */
export function flattenMinimal(grouped: AlbumWithPhotos[]): MinimalPhoto[] {
  return grouped.flatMap((g) => g.photos);
}