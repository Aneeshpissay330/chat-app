import { useEffect, useState } from 'react';
import { ChatRow } from '../utils/chat';
import { useUserDoc } from './useUserDoc';
import { getSelfChatMeta } from '../services/chat';
import { useIsFocused } from '@react-navigation/native'; // 👈 added

export function useSelfChatRow(): ChatRow | null {
  const { userDoc } = useUserDoc();
  const isFocused = useIsFocused(); // 👈 track screen/tab visibility
  const [selfRow, setSelfRow] = useState<ChatRow | null>(null);

  useEffect(() => {
    if (!userDoc) {
      setSelfRow(null);
      return;
    }

    const baseRow: ChatRow = {
      id: 'me',
      name: `You (@${userDoc.username ?? 'you'})`,
      avatar:
        userDoc.photoURL ??
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      lastMessage: '',
      date: new Date().toISOString(),
      unreadCount: 0,
      pinned: true,
      online: true,
    };

    setSelfRow(baseRow);

    // ⏱️ Fetch only when screen is focused and user is loaded
    if (isFocused) {
      getSelfChatMeta()
        .then((meta) => {
          setSelfRow({
            ...baseRow,
            lastMessage: meta.lastMessage || baseRow.lastMessage,
            date: meta.lastMessageAt?.toDate().toISOString() ?? baseRow.date,
            unreadCount: meta.unread[userDoc.uid] ?? 0,
          });
        })
        .catch((e) => {
          // No self chat found
        });
    }
  }, [userDoc, isFocused]); // 👈 depends on focus

  return selfRow;
}
