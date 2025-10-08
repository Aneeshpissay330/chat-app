// src/components/ChatBubble/index.tsx
import React from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Video from 'react-native-video';
import AudioFilePlayer from '../AudioFilePlayer';
import type { Message } from '../../types/chat'; // <- use your Message type (adjust path if needed)
import { useUserDoc } from '../../hooks/useUserDoc';

type Props = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  onRetry?: (messageId: string) => void; // optional retry handler
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
  onRetry,
}: Props) {
  const bubbleBg = isMe ? '#0b93f6' : '#fff';
  const textColor = isMe ? '#fff' : '#111';
  const borderColor = '#e5e7eb';
  const nameColor = isMe ? 'rgba(255,255,255,0.9)' : '#6b7280';
  const { userDoc } = useUserDoc();

  const isDownloading =
    message.downloadStatus === 'pending' ||
    message.downloadStatus === 'downloading';
  const isFailed = message.downloadStatus === 'failed';

  // prefer localPath if available, else remote url
  const mediaUri = message.localPath || message.url;

  async function openAttachment(uri?: string) {
    try {
      if (!uri) return;
      const can = await Linking.canOpenURL(uri);
      if (can) {
        await Linking.openURL(uri);
      } else {
        // fallback: still try to open
        await Linking.openURL(uri);
      }
    } catch (e) {
      Alert.alert(
        'Cannot open file',
        'Try downloading from the chat details or copy the link.',
      );
    }
  }

  function isDocLike(mime?: string) {
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
      {/* optional avatar placeholder */}
      {!isMe && showAvatar ? (
        <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
      ) : null}

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
          {showName ? (
            <Text
              variant="labelSmall"
              style={{ marginBottom: 2, color: nameColor }}
            >
              {message.userId}
            </Text>
          ) : null}

          {/* Image */}
          {message.type === 'image' ? (
            <View style={{ marginBottom: 8 }}>
              {(() => {
                const { width, height } = fitDims(
                  message.width,
                  message.height,
                  200,
                  200,
                );

                // always show a box — even if no uri and not downloading yet
                return (
                  <View style={[styles.mediaBox, { width, height }]}>
                    {mediaUri ? (
                      <Image
                        source={{ uri: mediaUri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.mediaPlaceholder}>
                        <ActivityIndicator size={32} />
                      </View>
                    )}
                    {isDownloading ? (
                      <View style={styles.mediaOverlay}>
                        <ActivityIndicator size={32} />
                      </View>
                    ) : null}
                  </View>
                );
              })()}
            </View>
          ) : null}

          {/* Video */}
          {message.type === 'video' && (mediaUri || isDownloading) ? (
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
                    style={[
                      styles.mediaBox,
                      { width, height, backgroundColor: '#000' },
                    ]}
                  >
                    {mediaUri ? (
                      <Video
                        source={{ uri: mediaUri }}
                        style={{ width: '100%', height: '100%' }}
                        controls
                        paused
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.mediaPlaceholderDark}>
                        <ActivityIndicator size={32} color="#fff" />
                        <Text
                          variant="labelSmall"
                          style={{ marginTop: 8, color: '#fff' }}
                        >
                          Downloading…
                        </Text>
                      </View>
                    )}
                    {isDownloading ? (
                      <View style={styles.mediaOverlay}>
                        <ActivityIndicator size={32} />
                      </View>
                    ) : null}
                    {isFailed ? (
                      <View style={styles.mediaOverlay}>
                        <TouchableOpacity
                          onPress={() => onRetry?.(message.id)}
                          style={styles.retryWrap}
                        >
                          <IconButton icon="refresh" size={18} />
                          <Text variant="labelSmall" style={{ marginLeft: 6 }}>
                            Retry
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })()}
            </View>
          ) : null}

          {/* Document / File card */}
          {(mediaUri &&
            (isDocLike(message.mime) ||
              message.type === 'file' ||
              message.name)) ||
          (!mediaUri &&
            (isDocLike(message.mime) ||
              message.type === 'file' ||
              message.name) &&
            isDownloading) ? (
            <View style={{ marginBottom: message.text ? 8 : 0 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => mediaUri && openAttachment(mediaUri)}
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
                    <Text>{fileIconForMime(message.mime)}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyMedium"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        fontWeight: '600',
                        color: isMe ? '#fff' : '#111827',
                      }}
                    >
                      {message.name ?? 'Attachment'}
                    </Text>
                    <Text
                      variant="labelSmall"
                      numberOfLines={1}
                      style={{
                        color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      }}
                    >
                      {message.mime?.split('/')[1]?.toUpperCase() ||
                        (message.size
                          ? `${(message.size / 1024).toFixed(1)} KB`
                          : 'FILE')}
                    </Text>
                  </View>

                  <View
                    style={{
                      marginLeft: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size={20} />
                    ) : isFailed ? (
                      <TouchableOpacity
                        onPress={() => onRetry?.(message.id)}
                        style={[
                          {
                            borderRadius: 999,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            backgroundColor: isMe
                              ? 'rgba(255,255,255,0.16)'
                              : 'rgba(59,130,246,0.12)',
                          },
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={{
                            color: isMe ? '#fff' : '#1d4ed8',
                            fontWeight: '600',
                          }}
                        >
                          Retry
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={[
                          {
                            borderRadius: 999,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            backgroundColor: isMe
                              ? 'rgba(255,255,255,0.16)'
                              : 'rgba(59,130,246,0.12)',
                          },
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={{
                            color: isMe ? '#fff' : '#1d4ed8',
                            fontWeight: '600',
                          }}
                        >
                          {mediaUri ? 'Open' : 'Pending'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Audio */}
          {message.mime?.includes('audio/') || message.type === 'audio' ? (
            <AudioFilePlayer filePath={mediaUri || ''} onDeleted={() => {}} />
          ) : null}

          {/* Text */}
          {message.text ? (
            <Text variant="bodyMedium" style={{ color: textColor }}>
              {message.text}
            </Text>
          ) : null}

          {/* Meta row */}
          <View style={[styles.metaRow, { justifyContent: 'flex-end' }]}>
            <Text
              variant="labelSmall"
              style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }}
            >
              {new Date(message.createdAt).toLocaleTimeString()}
            </Text>
            {isMe ? (
              <View style={{ marginLeft: 6 }}>
                <Text>✓✓</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {isMe ? <View style={{ width: 24 }} /> : null}
    </View>
  );
}

function fileIconForMime(mime?: string) {
  if (!mime) return '📄';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('word')) return '📄';
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️';
  return '📄';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 4,
    gap: 8,
  },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(98,0,238,0.08)',
  },
  mediaOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  mediaBox: {
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  mediaPlaceholderDark: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
});
