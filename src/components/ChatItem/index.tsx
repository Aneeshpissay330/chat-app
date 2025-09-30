// components/ChatItem.tsx
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {
    GestureResponderEvent,
    Image,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { formatChatDate } from '../../utils/date';

type ChatItemProps = {
  name: string;
  avatar: string;
  lastMessage: string;
  date: string; // ⬅️ changed from time to date
  unreadCount: number;
  pinned?: boolean;
  online?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

export default function ChatItem({
  name,
  avatar,
  lastMessage,
  date,
  unreadCount,
  pinned = false,
  online = false,
  onPress,
}: ChatItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { backgroundColor: '#f2f2f2' },
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        {online && <View style={styles.presenceDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <View style={styles.timeRow}>
            {pinned && (
              <MaterialCommunityIcons
                name="pin"
                color="#6200ee"
                size={12}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={styles.date}>{formatChatDate(date)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.message}>
            {lastMessage}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  avatarWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#6200ee',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
