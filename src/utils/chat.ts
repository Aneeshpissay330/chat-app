// utils/chat.ts
export type ChatRow = {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage?: string | null;
  date: string;            // ISO timestamp
  unreadCount?: number;
  pinned?: boolean;
  online?: boolean;
};

export type UserDoc = {
  uid: string;
  username?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

/** Create the "You (@username)" row from the userDoc (or return null if not ready). */
export function buildSelfChat(user: UserDoc | null | undefined): ChatRow | null {
  if (!user) return null;

  const username = user.username?.trim() || 'you';
  return {
    id: 'me',
    name: `You (@${username})`,
    avatar: user.photoURL ?? undefined,
    lastMessage: 'This is your private notes/chat.',
    date: new Date().toISOString(),
    unreadCount: 0,
    pinned: true,   // your self-chat stays pinned
    online: true,
  };
}

/** Sort chats: pinned first, then by most recent date (desc). */
export function sortChats(rows: ChatRow[]): ChatRow[] {
  return [...rows].sort((a, b) => {
    const ap = !!a.pinned, bp = !!b.pinned;
    if (ap !== bp) return bp ? 1 : -1; // pinned true comes first
    const ad = Date.parse(a.date || ''), bd = Date.parse(b.date || '');
    return bd - ad; // newest first
  });
}

/** Merge self row (if present) with the rest and return sorted list. */
export function mergeAndSort(self: ChatRow | null, others: ChatRow[]): ChatRow[] {
  const list = self ? [self, ...others] : [...others];
  return sortChats(list);
}

export const DEFAULT_AVATAR =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg';

export function ensureAvatar(avatar?: string | null): string {
  return avatar ?? DEFAULT_AVATAR;
}
