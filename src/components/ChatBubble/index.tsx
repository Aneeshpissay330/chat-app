import React from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { Message } from '../../types/chat';
import { formatChatDate } from '../../utils/date';
import Video from 'react-native-video';
import AudioFilePlayer from '../AudioFilePlayer';

type Props = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  showName?: boolean; // show sender name (use for group chats on non-me messages)
};

function fitDims(
  w?: number,
  h?: number,
  maxW = 220,
  maxH = 300,
): { width: number; height: number } {
  if (!w || !h) return { width: maxW, height: Math.round((maxW * 9) / 16) };
  const scale = Math.min(maxW / w, maxH / h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

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
  async function openAttachment(url?: string) {
    try {
      if (!url) return;
      const can = await Linking.canOpenURL(url);
      await Linking.openURL(url); // try anyway; canOpenURL can be flaky for http(s)
    } catch (e) {
      Alert.alert(
        'Cannot open file',
        'Try downloading from the chat details or copy the link.',
      );
    }
  }
  function isDocLike(mime?: Message['mime']) {
    // Everything that is NOT image/video/audio is treated as a document/file card
    if (mime?.includes('application/')) return true;
    if (!mime) return false;
    if (mime.startsWith('image/')) return false;
    if (mime.startsWith('video/')) return false;
    if (mime.startsWith('audio/')) return false;
    return true;
  }
  return (
    <View
      style={[styles.row, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}
    >
      {!isMe && showAvatar && message.userAvatar ? (
        <Image source={{ uri: message.userAvatar }} style={styles.avatar} />
      ) : !isMe && showAvatar ? (
        <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
      ) : (
        null
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
            <Text
              variant="labelSmall"
              style={{ marginBottom: 2, color: nameColor }}
            >
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
                  <Text
                    variant="bodyMedium"
                    style={{ color: textColor, fontWeight: '600' }}
                  >
                    {message.fileName}
                  </Text>
                  {message.fileSizeLabel ? (
                    <Text
                      variant="labelSmall"
                      style={{
                        color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      }}
                    >
                      {message.fileSizeLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

          {message.type === 'image' && message.url ? (
            <View style={{ marginBottom: 8 }}>
              <Image
                source={{ uri: message.url }}
                style={{
                  width:
                    message.width && message.width < 200 ? message.width : 200,
                  height:
                    message.height && message.height < 200
                      ? message.height
                      : 200,
                  borderRadius: 10,
                  backgroundColor: '#e5e7eb',
                }}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Video preview if type = video */}
          {message.type === 'video' && message.url ? (
            <View style={{ marginBottom: 8 }}>
              {(() => {
                const { width, height } = fitDims(
                  message.width,
                  message.height,
                  220,
                  300,
                );
                return (
                  <View
                    style={{
                      width,
                      height,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#111',
                    }}
                  >
                    <Video
                      source={{ uri: message.url }}
                      style={{ width: '100%', height: '100%' }}
                      controls
                      paused
                      resizeMode="cover"
                      // You can pass a poster/thumbnail url if you store it:
                      // poster={message.thumbUrl}
                      // muted // uncomment if you want default muted
                    />
                  </View>
                );
              })()}
            </View>
          ) : null}

          {/* Document / File card */}
          {message.url &&
          (isDocLike(message.mime) ||
            message.type === 'file' ||
            message.fileName) ? (
            <View style={{ marginBottom: message.text ? 8 : 0 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openAttachment(message.url)}
                style={{ borderRadius: 10, overflow: 'hidden' }}
              >
                <View
                  style={[
                    styles.fileRow,
                    {
                      paddingVertical: 10,
                      paddingHorizontal: 8,
                      borderRadius: 10,
                      backgroundColor: isMe
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(2,6,23,0.04)',
                    },
                  ]}
                >
                  <View style={styles.fileIconWrap}>
                    <Icon
                      source={fileIconFor(message.fileType)}
                      size={20}
                      color={isMe ? '#fff' : '#3b82f6'}
                    />
                  </View>
                  <View>
                    <Text
                      variant="bodyMedium"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        fontWeight: '600',
                        color: isMe ? '#fff' : '#111827',
                        width: 80,
                      }}
                    >
                      {message.name ?? 'Attachment'}
                    </Text>
                    <Text
                      variant="labelSmall"
                      numberOfLines={1}
                      style={{
                        color: isMe ? 'rgba(3, 2, 2, 0.8)' : '#6b7280',
                      }}
                    >
                      {message.mime?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Text>
                  </View>

                  {/* Open button chip */}
                  <View
                    style={{
                      borderRadius: 999,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: isMe
                        ? 'rgba(255,255,255,0.16)'
                        : 'rgba(59,130,246,0.12)',
                    }}
                  >
                    <Text
                      variant="labelMedium"
                      style={{
                        color: isMe ? '#fff' : '#1d4ed8',
                        fontWeight: '600',
                      }}
                    >
                      Open
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {message.mime?.includes('audio/') && (
            <AudioFilePlayer
              filePath={message.url || ""}
              onDeleted={p => console.log('deleted', p)}
            />
          )}

          {/* Message text */}
          {message.text ? (
            <Text variant="bodyMedium" style={{ color: textColor }}>
              {message.text}
            </Text>
          ) : null}

          {/* Meta row (timestamp + ticks) */}
          <View style={[styles.metaRow, { justifyContent: 'flex-end' }]}>
            <Text
              variant="labelSmall"
              style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }}
            >
              {formatChatDate(message.createdAt)}
            </Text>
            {isMe ? (
              <View style={{ marginLeft: 4 }}>
                <Icon
                  source="check-all"
                  size={14}
                  color="rgba(255,255,255,0.8)"
                />
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
    case 'image':
      return 'file-image';
    case 'pdf':
      return 'file-pdf-box';
    case 'doc':
      return 'file-word';
    case 'excel':
      return 'file-excel';
    case 'zip':
      return 'folder-zip';
    case 'txt':
      return 'file-document';
    case 'audio':
      return 'microphone';
    default:
      return 'file';
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 4,
    gap: 8,
  },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(98,0,238,0.12)',
  },
});
