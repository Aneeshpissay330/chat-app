export type Message = {
  id: string;
  text?: string;
  createdAt: string;
  userId: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  url?: string; // original/remote url or local file path after download
  localPath?: string; // local filesystem path if downloaded
  downloadStatus?: 'idle' | 'pending' | 'downloading' | 'done' | 'failed';
  width?: number;
  height?: number;
  size?: number;
  name?: string;
  mime?: string;
};

export type SendPayload = {
  text?: string;
  files?: Array<{ uri: string; name: string; type: string; size?: number }>;
  image?: { uri: string };
  audio?: { uri: string; duration?: number };
};

// types/chat.ts

export type ChatRow = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  date: string;
  unreadCount: number;
  pinned: boolean;
  online: boolean;
};
