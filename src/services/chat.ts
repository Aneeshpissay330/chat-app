// services/chat.ts

import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import type { ChatRow } from '../utils/chat';
import { uploadChatFile } from './media';

export type Chat = {
  id: string;
  memberIds: string[];
  memberHash: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  lastMessage?: string | null;
  lastMessageAt?: FirebaseFirestoreTypes.Timestamp | null;
  unread?: Record<string, number>;
  typing?: Record<string, boolean>;
};

export type MessageDoc = {
  id: string;
  text?: string;

  // NEW: media / file variants
  type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  url?: string; // downloadURL
  mime?: string;
  name?: string; // original filename
  size?: number; // bytes
  width?: number; // image/video
  height?: number; // image/video
  durationMs?: number; // video/audio
  thumbUrl?: string | null;

  senderId: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  status: 'sent' | 'delivered' | 'read';
  seenBy?: string[];
  deliveredTo?: string[];
};

type UserDoc = {
  uid?: string;
  username?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

function toISO(ts?: FirebaseFirestoreTypes.Timestamp | null) {
  return ts?.toDate?.().toISOString?.() ?? new Date(0).toISOString();
}

const CHATS = firestore().collection('chats');
const PRESENCE = firestore().collection('presence');

function sortedHash(a: string, b: string) {
  const [x, y] = [a, b].sort();
  return { memberIds: [x, y], memberHash: `${x}_${y}` };
}

function normalizeOtherUid(otherUid: string): string {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');
  if (!otherUid || otherUid === 'me' || otherUid === 'self') return me;
  return otherUid;
}

function sanitizeFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (v === undefined) return; // drop undefined
    if (typeof v === 'number' && Number.isNaN(v)) {
      out[k] = null;
      return;
    }
    out[k] = v;
  });
  return out as Partial<T>;
}

export async function ensureDMChat(otherUid: string): Promise<string> {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');

  const other = normalizeOtherUid(otherUid);
  const { memberIds, memberHash } = sortedHash(me, other);

  // canonical exists?
  let q = await CHATS.where('memberHash', '==', memberHash).limit(1).get();
  if (!q.empty) return q.docs[0].id;

  // legacy exists? migrate it
  if (other === me) {
    const legacyHash = `${me}_me`;
    q = await CHATS.where('memberHash', '==', legacyHash).limit(1).get();
    if (!q.empty) {
      const ref = q.docs[0].ref;
      await ref.set(
        { memberIds: [me, me], memberHash: `${me}_${me}` },
        { merge: true },
      );
      return ref.id;
    }
  }

  // slow fallback
  const all = await CHATS.where('memberIds', 'array-contains', me).get();
  for (const doc of all.docs) {
    const h = (doc.data() as any)?.memberHash;
    if (h === memberHash) return doc.id;
    if (other === me && h === `${me}_me`) {
      await doc.ref.set(
        { memberIds: [me, me], memberHash: `${me}_${me}` },
        { merge: true },
      );
      return doc.id;
    }
  }

  // create
  const ref = await CHATS.add({
    memberIds,
    memberHash,
    createdAt: firestore.FieldValue.serverTimestamp(),
    unread: { [me]: 0, [other]: 0 },
    typing: { [me]: false, [other]: false },
  });
  return ref.id;
}

export async function findDMChat(otherUid: string): Promise<string | null> {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');

  const other = normalizeOtherUid(otherUid);
  const { memberHash } = sortedHash(me, other);

  // canonical
  let q = await CHATS.where('memberHash', '==', memberHash).limit(1).get();
  if (!q.empty) return q.docs[0].id;

  // legacy: self chat stored as uid_me
  if (other === me) {
    const legacyHash = `${me}_me`;
    q = await CHATS.where('memberHash', '==', legacyHash).limit(1).get();
    if (!q.empty) return q.docs[0].id;
  }

  // slow fallback
  const all = await CHATS.where('memberIds', 'array-contains', me).get();
  for (const doc of all.docs) {
    const h = (doc.data() as any)?.memberHash;
    if (h === memberHash) return doc.id;
    if (other === me && h === `${me}_me`) return doc.id;
  }
  return null;
}

/** Subscribe to single chat metadata */
export function subscribeChat(chatId: string, onData: (chat: Chat) => void) {
  return CHATS.doc(chatId).onSnapshot(snap => {
    if (!snap.exists) return;
    onData({ id: snap.id, ...(snap.data() as any) });
  });
}

/** Subscribe to latest N messages in a chat */
export function subscribeMessages(
  chatId: string,
  onData: (msgs: MessageDoc[]) => void,
  pageSize = 50,
) {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');

  return CHATS.doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(pageSize)
    .onSnapshot(async snap => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      })) as MessageDoc[];

      // Auto mark as delivered
      const batch = firestore().batch();
      let hasWrites = false;

      msgs.forEach(m => {
        if (m.senderId !== me && m.status === 'sent') {
          const ref = CHATS.doc(chatId).collection('messages').doc(m.id);
          batch.update(ref, {
            status: 'delivered',
            deliveredTo: firestore.FieldValue.arrayUnion(me),
          });
          hasWrites = true;
        }
      });

      if (hasWrites) await batch.commit();
      onData(msgs);
    });
}

/** Send a message */
export async function sendText(chatId: string, text: string) {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');

  const msgRef = CHATS.doc(chatId).collection('messages').doc();
  const chatRef = CHATS.doc(chatId);

  await firestore().runTransaction(async tx => {
    const createdAt = firestore.FieldValue.serverTimestamp() as any;

    tx.set(msgRef, {
      text,
      senderId: me,
      createdAt,
      status: 'sent',
      seenBy: [me],
      deliveredTo: [],
    });

    const chatSnap = await tx.get(chatRef);
    const chat = chatSnap.exists() ? (chatSnap.data() as any) : {};
    const others = (chat.memberIds || []).filter((id: string) => id !== me);

    const unread = { ...(chat.unread || {}) };
    others.forEach((uid: string) => (unread[uid] = (unread[uid] || 0) + 1));

    tx.set(
      chatRef,
      {
        lastMessage: text,
        lastMessageAt: createdAt,
        unread,
      },
      { merge: true },
    );
  });

  return msgRef.id;
}

async function sendMediaInternal(
  chatId: string,
  payload: {
    kind: 'image' | 'video' | 'audio' | 'file';
    localPath: string;
    mime?: string;
    name?: string;
    size?: number;
    width?: number;
    height?: number;
    durationMs?: number;
    lastMessageText?: string; // e.g., "[Photo]" "[Video]" …
  },
) {
  try {
    const me = auth().currentUser?.uid;
    if (!me) throw new Error('Not authenticated');

    const msgRef = CHATS.doc(chatId).collection('messages').doc();
    const chatRef = CHATS.doc(chatId);

    // 1) Upload to Storage
    const uploaded = await uploadChatFile(chatId, {
      localPath: payload.localPath,
      mime: payload.mime,
      name: payload.name,
      size: payload.size,
      width: payload.width,
      height: payload.height,
      durationMs: payload.durationMs,
    });

    // 2) Write message + update chat meta in a transaction
    await firestore().runTransaction(async tx => {
      const createdAt = firestore.FieldValue.serverTimestamp() as any;

      const messageData = sanitizeFirestore({
        type: payload.kind,
        url: uploaded.url,
        mime: uploaded.contentType,
        name: uploaded.name,
        size: uploaded.size,
        width: uploaded.width,
        height: uploaded.height,
        durationMs: uploaded.durationMs,

        text: '',
        senderId: me,
        createdAt,
        status: 'sent',
        seenBy: [me],
        deliveredTo: [],
      });

      tx.set(msgRef, messageData);

      const chatSnap = await tx.get(chatRef);
      const chat = chatSnap.exists() ? (chatSnap.data() as any) : {};
      const others = (chat.memberIds || []).filter((id: string) => id !== me);

      const unread = { ...(chat.unread || {}) };
      others.forEach((uid: string) => (unread[uid] = (unread[uid] || 0) + 1));

      const lm =
        payload.lastMessageText ??
        (payload.kind === 'image'
          ? '[Photo]'
          : payload.kind === 'video'
          ? '[Video]'
          : payload.kind === 'audio'
          ? '[Audio]'
          : payload.name
          ? `[File] ${payload.name}`
          : '[File]');

      const chatUpdate = sanitizeFirestore({
        lastMessage: lm,
        lastMessageAt: createdAt,
        unread,
      });

      tx.set(chatRef, chatUpdate, { merge: true });
    });

    return msgRef.id;
  } catch (error) {
    console.error('sendMediaInternal error', error);
  }
}

/** Mark messages as read + reset unread counter */
export async function markChatRead(chatId: string) {
  const me = auth().currentUser?.uid;
  if (!me) throw new Error('Not authenticated');

  const chatRef = CHATS.doc(chatId);
  const msgsRef = chatRef.collection('messages');

  const unreadSnap = await msgsRef
    .where('senderId', '!=', me)
    .where('status', 'in', ['sent', 'delivered'])
    .get();

  const batch = firestore().batch();
  unreadSnap.forEach(d => {
    batch.update(d.ref, {
      status: 'read',
      seenBy: firestore.FieldValue.arrayUnion(me),
    });
  });

  batch.set(chatRef, { [`unread.${me}`]: 0 }, { merge: true });
  await batch.commit();
}

/** Set typing state in chat doc */
export async function setTyping(chatId: string, isTyping: boolean) {
  const me = auth().currentUser?.uid;
  if (!me) return;

  await CHATS.doc(chatId).set({ typing: { [me]: isTyping } }, { merge: true });
}

/** Send presence heartbeat */
export async function heartbeatPresence(online: boolean) {
  const me = auth().currentUser?.uid;
  if (!me) return;

  await PRESENCE.doc(me).set(
    {
      online,
      lastActive: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/** Subscribe to a user's presence */
export function subscribePresence(
  uid: string,
  onUpdate: (isOnline: boolean, lastActive?: Date) => void,
  thresholdSec = 60,
) {
  return firestore()
    .collection('presence')
    .doc(uid)
    .onSnapshot(snap => {
      const data = snap.exists() ? (snap.data() as any) : undefined;
      const ts = data?.lastActive;
      const lastActive =
        ts && typeof ts.toDate === 'function' ? ts.toDate() : undefined;

      const fresh =
        lastActive && (Date.now() - lastActive.getTime()) / 1000 < thresholdSec;

      onUpdate(!!data?.online && !!fresh, lastActive);
    });
}

/** Get chatId for self-chat (if it exists). Returns null if not found. */
export async function getSelfChatId(): Promise<string | null> {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  return await findDMChat(uid); // may return null
}

/** Fetch metadata of self-chat. Throws if chat doesn't exist. */
export async function getSelfChatMeta(): Promise<{
  chatId: string;
  lastMessage: string;
  lastMessageAt: FirebaseFirestoreTypes.Timestamp | null;
  unread: Record<string, number>;
}> {
  const chatId = await getSelfChatId();
  if (!chatId) throw new Error('Self chat does not exist');

  const chatSnap = await CHATS.doc(chatId).get();
  if (!chatSnap.exists) throw new Error('Self chat document not found');

  const data = chatSnap.data()!;
  return {
    chatId,
    lastMessage: data.lastMessage ?? '',
    lastMessageAt: data.lastMessageAt ?? null,
    unread: data.unread ?? {},
  };
}

export async function sendImage(
  chatId: string,
  args: {
    localPath: string;
    mime?: string;
    width?: number;
    height?: number;
    size?: number;
  },
) {
  try {
    return sendMediaInternal(chatId, {
      kind: 'image',
      localPath: args.localPath,
      mime: args.mime,
      width: args.width,
      height: args.height,
      size: args.size,
      lastMessageText: '[Photo]',
    });
  } catch (error) {
    console.error('sendImage error', error);
  }
}

export async function sendVideo(
  chatId: string,
  args: {
    localPath: string;
    mime?: string;
    width?: number;
    height?: number;
    size?: number;
    durationMs?: number;
  },
) {
  try {
    console.log('sendVideo', args, chatId);
    return sendMediaInternal(chatId, {
      kind: 'video',
      localPath: args.localPath,
      mime: args.mime,
      width: args.width,
      height: args.height,
      size: args.size,
      durationMs: Number.isFinite(args.durationMs)
        ? args.durationMs
        : undefined,
      lastMessageText: '[Video]',
    });
  } catch (error) {
    console.error('sendVideo error', error);
  }
}

export async function sendAudio(
  chatId: string,
  args: {
    localPath: string;
    mime?: string;
    size?: number;
    durationMs?: number;
    name?: string;
  },
) {
  return sendMediaInternal(chatId, {
    kind: 'audio',
    localPath: args.localPath,
    mime: args.mime ?? 'audio/mpeg',
    size: args.size,
    durationMs: args.durationMs,
    lastMessageText: '[Audio]',
    name: args.name,
  });
}

export async function sendFile(
  chatId: string,
  args: {
    localPath: string;
    mime?: string;
    size?: number;
    name?: string;
  },
) {
  return sendMediaInternal(chatId, {
    kind: 'file',
    localPath: args.localPath,
    mime: args.mime,
    size: args.size,
    lastMessageText: args.name ? `[File] ${args.name}` : '[File]',
    name: args.name,
  });
}
