// src/utils/downloadFile.ts
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export async function downloadFileToCache({
  url,
  filename,
}: {
  url: string;
  filename?: string;
}): Promise<string> {
  if (!url) throw new Error('No url provided');

  // sanitize filename
  const name = filename || url.split('/').pop() || `file-${Date.now()}`;

  // choose cache dir (app-private). Use CachesDirectoryPath so OS can cleanup if needed.
  const destPath = `${RNFS.CachesDirectoryPath}/${name}`;

  // downloadFile returns a job you can await via .promise
  const ret = RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    // you can tune background/discretionary flags if desired
    background: true,
    discretionary: true,
  });

  const res = await ret.promise; // { statusCode, bytesWritten } on success (Android/iOS)
  if (res.statusCode && res.statusCode >= 400) {
    // cleanup partial file if present
    try {
      await RNFS.unlink(destPath);
    } catch (_) {}
    throw new Error(`Failed to download (status ${res.statusCode})`);
  }

  // Some consumers may expect a file:// URI — return file:// prefix to be explicit:
  const fileUri = Platform.OS === 'android' ? `file://${destPath}` : destPath;
  return fileUri;
}
