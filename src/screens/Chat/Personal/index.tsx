import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList } from 'react-native';
import ChatItem from '../../../components/ChatItem';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { buildSelfChat, ensureAvatar, mergeAndSort } from '../../../utils/chat';

const chatData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    lastMessage: 'Hey! Are we still on for the meeting tomorrow?',
    date: '2025-10-01T14:30:00Z',
    unreadCount: 3,
    pinned: true,
    online: true,
  },
  {
    id: '2',
    name: 'Dev Squad',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    lastMessage: 'New design mockups are ready.',
    date: '2025-09-30T13:15:00Z',
    unreadCount: 0,
    pinned: false,
    online: false,
  },
];

type RootNavigation = { ChatView: { id: string } };

const Personal = () => {
  const navigation = useNavigation<NavigationProp<RootNavigation>>();
  const { userDoc } = useUserDoc();

  const me = buildSelfChat(userDoc as any); // userDoc matches fields the util needs
  const data = mergeAndSort(me, chatData);

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChatItem
          // don't spread; pass required strings explicitly
          name={item.name}
          avatar={ensureAvatar(item.avatar)} // -> string
          lastMessage={item.lastMessage ?? ''} // -> string
          date={item.date}
          unreadCount={item.unreadCount ?? 0}
          pinned={!!item.pinned}
          online={!!item.online}
          onPress={() => navigation.navigate('ChatView', { id: item.id })}
        />
      )}
    />
  );
};

export default Personal;
