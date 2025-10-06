// app/(tabs)/personal/index.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import ChatItem from '../../../components/ChatItem';
import { ensureAvatar, type ChatRow } from '../../../utils/chat';
import { subscribeMyChats } from '../../../services/chat';
import { useSelfChatRow } from '../../../hooks/useSelfChat';

type RootNavigation = { ChatView: { id: string; type?: 'group'; name?: string; avatar?: string }; ContactScreen: undefined };

const Personal = () => {
  const navigation = useNavigation<NavigationProp<RootNavigation>>();
  const theme = useTheme();
  const selfChat = useSelfChatRow();
  const [chats, setChats] = useState<ChatRow[]>([]);

  useEffect(() => {
    const unsub = subscribeMyChats(fetchedChats => {
      const list = selfChat ? [selfChat, ...fetchedChats] : fetchedChats;
      setChats(list);
    });
    return unsub;
  }, [selfChat]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={chats}
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
            onPress={() =>
              navigation.navigate('ChatView', {
                id: item.id,
                name: item.name ?? 'Chat',
                avatar: item.avatar ?? '',
              })
            }
          />
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ContactScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default Personal;
