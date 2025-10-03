import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { Message } from '../../types/chat';
import { formatChatDate } from '../../utils/date';

type Props = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  showName?: boolean; // show sender name (use for group chats on non-me messages)
};

export default function ChatBubble({
  message,
  isMe,
  showAvatar = !isMe,
  showName = false,
}: Props) {
  const theme = useTheme();

  const bubbleBg = isMe
    ? theme.colors.primary
    : theme.dark
    ? theme.colors.surface
    : '#fff';

  const textColor = isMe
    ? '#fff'
    : theme.dark
    ? theme.colors.onSurface
    : '#1f2937';

  const borderColor = theme.dark ? '#4b5563' : '#e5e7eb';
  const nameColor = isMe ? 'rgba(255,255,255,0.85)' : '#6b7280';

  return (
    <View style={[styles.row, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
      {!isMe && showAvatar && message.userAvatar ? (
        <Image source={{ uri: message.userAvatar }} style={styles.avatar} />
      ) : !isMe && showAvatar ? (
        <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
      ) : (
        <View style={{ width: 24 }} />
      )}

      <View style={{ maxWidth: '78%' }}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderColor: isMe ? 'transparent' : borderColor,
              borderWidth: isMe ? 0 : 1,
              borderBottomLeftRadius: isMe ? 16 : 6,
              borderBottomRightRadius: isMe ? 6 : 16,
            },
          ]}
        >
          {/* Sender name (group chats) */}
          {showName && message.userName ? (
            <Text variant="labelSmall" style={{ marginBottom: 2, color: nameColor }}>
              {message.userName}
            </Text>
          ) : null}

          {/* File attachment header */}
          {message.fileName ? (
            <View style={{ marginBottom: message.text ? 8 : 0 }}>
              <View style={styles.fileRow}>
                <View style={styles.fileIconWrap}>
                  <Icon
                    source={fileIconFor(message.fileType)}
                    size={20}
                    color={isMe ? '#fff' : theme.colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color: textColor, fontWeight: '600' }}>
                    {message.fileName}
                  </Text>
                  {message.fileSizeLabel ? (
                    <Text variant="labelSmall" style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>
                      {message.fileSizeLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {/* Message text */}
          {message.text ? (
            <Text variant="bodyMedium" style={{ color: textColor }}>
              {message.text}
            </Text>
          ) : null}

          {/* Meta row (timestamp + ticks) */}
          <View style={[styles.metaRow, { justifyContent: 'flex-end' }]}>
            <Text variant="labelSmall" style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>
              {formatChatDate(message.createdAt)}
            </Text>
            {isMe ? (
              <View style={{ marginLeft: 4 }}>
                <Icon source="check-all" size={14} color="rgba(255,255,255,0.8)" />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {isMe ? <View style={{ width: 24 }} /> : null}
    </View>
  );
}

function fileIconFor(type?: Message['fileType']) {
  switch (type) {
    case 'image': return 'file-image';
    case 'pdf': return 'file-pdf-box';
    case 'doc': return 'file-word';
    case 'excel': return 'file-excel';
    case 'zip': return 'folder-zip';
    case 'txt': return 'file-document';
    case 'audio': return 'microphone';
    default: return 'file';
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, marginVertical: 4, gap: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(98,0,238,0.12)' },
});
