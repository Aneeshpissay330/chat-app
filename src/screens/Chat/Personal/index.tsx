import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ChatItem from '../../../components/ChatItem';

import { FAB, useTheme } from 'react-native-paper';
import { useSelfChatRow } from '../../../hooks/useSelfChat';
import { ensureAvatar } from '../../../utils/chat';

type RootNavigation = { ChatView: { id: string }, ContactScreen: undefined };

const Personal = () => {
  const navigation = useNavigation<NavigationProp<RootNavigation>>();
  const selfChat = useSelfChatRow();
  const data = selfChat ? [selfChat] : [];
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ContactScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default Personal;
