import React from 'react';
import { FlatList } from 'react-native';
import ChatItem from '../../../components/ChatItem';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type GroupListItem = {
  id: string;
  name: string;
  avatar: string;
  lastMessageText: string;   // message content
  lastMessageSender: string; // who sent it
  date: string;
  unreadCount: number;
  pinned?: boolean;
  online?: boolean;
};

const groupChats: GroupListItem[] = [
  {
    id: 'g1',
    name: 'Dev Team',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    lastMessageText: 'Let’s merge the PR today.',
    lastMessageSender: 'Sarah',
    date: '2025-10-01T09:20:00Z',
    unreadCount: 5,
  },
  {
    id: 'g2',
    name: 'Project Alpha',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    lastMessageText: 'Final presentation is uploaded.',
    lastMessageSender: 'Ali',
    date: '2025-09-29T17:45:00Z',
    unreadCount: 0,
  },
];

export type RootNavigation = {
  ChatViewGroup: { id: string; type?: 'group' };
};

const Group = () => {
  const navigation = useNavigation<NavigationProp<RootNavigation>>();

  return (
    <FlatList
      data={groupChats}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChatItem
          name={item.name}
          avatar={item.avatar}
          lastMessage={`${item.lastMessageSender}: ${item.lastMessageText}`}
          date={item.date}
          unreadCount={item.unreadCount}
          pinned={item.pinned}
          online={item.online}
          onPress={() => navigation.navigate('ChatViewGroup', { id: item.id, type: 'group' })}
        />
      )}
    />
  );
};

export default Group;
