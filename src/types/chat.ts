export type Message = {
  id: string;
  text?: string;
  createdAt: string; // ISO string
  userId: string;
  userName?: string;
  userAvatar?: string;
  // Optional attachments
  fileName?: string;
  fileSizeLabel?: string; // e.g. "2.4 MB"
  fileType?: 'image' | 'pdf' | 'doc' | 'zip' | 'excel' | 'txt' | 'audio';
  url?: string; // download URL for the file/image/audio
  type?: string;
  width?: number;  // for image
  height?: number; // for image
  size?: number;   // for file
  name?: string;  // original filename if any
  mime?: string;  // MIME type if any
};

export type SendPayload = {
  text?: string;
  files?: Array<{ uri: string; name: string; type: string; size?: number }>;
  image?: { uri: string };
  audio?: { uri: string; duration?: number };
};
