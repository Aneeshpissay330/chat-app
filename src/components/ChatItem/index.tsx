import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import React from 'react';
import {
  GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { formatChatDate } from '../../utils/date';

type ChatItemProps = {
  name: string;
  avatar: string;
  lastMessage: string;
  date: string;
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
  const theme = useTheme();

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: theme.colors.surface },
          pressed && { backgroundColor: theme.colors.surfaceVariant },
        ]}
        onPress={onPress}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {online && (
            <View
              style={[
                styles.presenceDot,
                { borderColor: theme.colors.surface },
              ]}
            />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {name}
            </Text>
            <View style={styles.timeRow}>
              {pinned && (
                <MaterialCommunityIcons
                  name="pin"
                  color={theme.colors.primary}
                  size={12}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text style={[styles.date, { color: theme.colors.outline }]}>
                {formatChatDate(date)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text
              numberOfLines={1}
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            >
              {lastMessage}
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>

      {/* Paper Divider below the item */}
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
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
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  unreadBadge: {
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
