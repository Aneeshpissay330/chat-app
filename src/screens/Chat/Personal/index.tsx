import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import ChatItem from '../../../components/ChatItem';

import type { ChatRow } from '../../../utils/chat';
import { ensureAvatar } from '../../../utils/chat';
import { getSelfChatMeta } from '../../../services/chat';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { useSelfChatRow } from '../../../hooks/useSelfChat';

type RootNavigation = { ChatView: { id: string } };

const Personal = () => {
  const navigation = useNavigation<NavigationProp<RootNavigation>>();
  const selfChat = useSelfChatRow();
  const data = selfChat ? [selfChat] : [];
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChatItem
          name={item.name}
          avatar={ensureAvatar(item.avatar)}
          lastMessage={item.lastMessage ?? ''}
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
