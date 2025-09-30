import React from 'react';
import { Alert, FlatList } from 'react-native';
import ChatItem from '../../../components/ChatItem';

const chatData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    lastMessage: 'Hey! Are we still on for the meeting tomorrow?',
    date: '2025-10-01T14:30:00Z',
    unreadCount: 3,
    pinned: true,
    online: true,
  },
  {
    id: '2',
    name: 'Dev Squad',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    lastMessage: 'New design mockups are ready.',
    date: '2025-09-30T13:15:00Z',
    unreadCount: 0,
    pinned: false,
    online: false,
  },
];

const Personal = () => {
  return (
    <FlatList
      data={chatData}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChatItem
          {...item}
          onPress={() => Alert.alert('Open Chat', `Chat with ${item.name}`)}
        />
      )}
    />
  );
};

export default Personal;
