// utils/chat.ts

export type ChatRow = {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage?: string | null;
  /** ISO timestamp used for sorting in UI */
  date: string;
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

/** Default avatar used when a user has no photoURL */
export const DEFAULT_AVATAR =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg';

/** Ensure we always render a valid avatar URL */
export function ensureAvatar(avatar?: string | null): string {
  return avatar ?? DEFAULT_AVATAR;
}

/** Sort chats: pinned first, then by most recent date (desc). */
export function sortChats(rows: ChatRow[]): ChatRow[] {
  return [...rows].sort((a, b) => {
    const ap = !!a.pinned, bp = !!b.pinned;
    if (ap !== bp) return bp ? 1 : -1; // pinned rows first
    const ad = Date.parse(a.date || ''), bd = Date.parse(b.date || '');
    return bd - ad; // newest first
  });
}

/** Merge self row (if present) with others and return sorted list. */
export function mergeAndSort(self: ChatRow | null, others: ChatRow[]): ChatRow[] {
  const list = self ? [self, ...others] : [...others];
  return sortChats(list);
}

/**
 * Utility: coerce various inputs into ISO string for ChatRow.date.
 * Use this when building rows from Firestore timestamps or JS Dates.
 */
export function toISODate(
  input: string | number | Date | { toDate?: () => Date } | null | undefined
): string {
  if (!input) return new Date(0).toISOString();
  if (typeof input === 'string') return new Date(input).toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (input instanceof Date) return input.toISOString();
  if (typeof input === 'object' && typeof input.toDate === 'function') {
    const d = input.toDate();
    return d instanceof Date ? d.toISOString() : new Date(0).toISOString();
  }
  return new Date(0).toISOString();
}
