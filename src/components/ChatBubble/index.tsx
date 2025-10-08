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
import { viewDocument } from '@react-native-documents/viewer'

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

function getDocumentIcon(mime?: string) {
  if (!mime) return '📄';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('word') || mime.includes('doc')) return '📄';
  if (mime.includes('excel') || mime.includes('sheet')) return '📊';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '📊';
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️';
  if (mime.includes('text')) return '📝';
  return '📄';
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(mime?: string) {
  if (!mime) return 'FILE';
  const parts = mime.split('/');
  if (parts.length > 1) {
    return parts[1].toUpperCase();
  }
  return 'FILE';
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
      await viewDocument({ uri: uri, mimeType: message.mime })
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
                style={[
                  styles.documentCard,
                  {
                    backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : '#fff',
                    borderColor: isMe ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                    borderWidth: isMe ? 1 : 0,
                  }
                ]}
              >
                <View style={[
                  styles.documentThumbnail,
                  { backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : '#f8f9fa' }
                ]}>
                  <View style={styles.documentPreview}>
                    {/* Document preview mockup */}
                    <View style={{
                      width: '85%',
                      height: '75%',
                      backgroundColor: isMe ? 'rgba(255,255,255,0.95)' : '#fff',
                      borderRadius: 6,
                      padding: 8,
                      justifyContent: 'space-between',
                    }}>
                      {/* Header section */}
                      <View>
                        <View style={{
                          height: 12,
                          backgroundColor: '#2c3e50',
                          borderRadius: 2,
                          marginBottom: 4,
                          width: '60%',
                        }} />
                        <View style={{
                          height: 2,
                          backgroundColor: '#7f8c8d',
                          borderRadius: 1,
                          marginBottom: 2,
                        }} />
                        <View style={{
                          height: 2,
                          backgroundColor: '#7f8c8d',
                          borderRadius: 1,
                          marginBottom: 2,
                          width: '80%',
                        }} />
                        <View style={{
                          height: 2,
                          backgroundColor: '#7f8c8d',
                          borderRadius: 1,
                          width: '70%',
                        }} />
                      </View>
                      
                      {/* Body content lines */}
                      <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
                        {[...Array(4)].map((_, i) => (
                          <View key={i} style={{
                            height: 1.5,
                            backgroundColor: '#bdc3c7',
                            borderRadius: 1,
                            width: i === 3 ? '50%' : '100%',
                          }} />
                        ))}
                      </View>
                      
                      {/* Footer */}
                      <View style={{
                        height: 4,
                        backgroundColor: '#95a5a6',
                        borderRadius: 1,
                        width: '30%',
                      }} />
                    </View>
                  </View>
                </View>
                
                <View style={[
                  styles.documentInfo,
                  { backgroundColor: isMe ? 'transparent' : '#fff' }
                ]}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.documentTitle,
                      { color: isMe ? '#fff' : '#1a1a1a' }
                    ]}
                  >
                    {message.name ?? 'Attachment'}
                  </Text>
                  
                  <View style={styles.documentMeta}>
                    <Text style={[
                      styles.documentMetaText,
                      { color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }
                    ]}>
                      {formatFileSize(message.size)} • {getFileType(message.mime)}
                    </Text>
                  </View>
                  
                  {isDownloading && (
                    <View style={styles.downloadingIndicator}>
                      <ActivityIndicator size={12} color={isMe ? '#fff' : '#6b7280'} />
                      <Text style={[
                        styles.downloadingText,
                        { color: isMe ? 'rgba(255,255,255,0.8)' : '#6b7280' }
                      ]}>
                        Downloading...
                      </Text>
                    </View>
                  )}
                  
                  {isFailed && (
                    <TouchableOpacity
                      onPress={() => onRetry?.(message.id)}
                      style={[styles.actionButton, {
                        backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.12)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        alignSelf: 'flex-end',
                      }]}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        { color: isMe ? '#fff' : '#dc2626', fontSize: 11 }
                      ]}>
                        Retry
                      </Text>
                    </TouchableOpacity>
                  )}
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
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  // Document card styles
  documentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    maxWidth: 240,
    minWidth: 200,
  },
  documentThumbnail: {
    width: '100%',
    height: 80,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentIcon: {
    fontSize: 24,
    color: '#6b7280',
  },
  documentInfo: {
    padding: 12,
    backgroundColor: '#fff',
  },
  documentTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
    color: '#1a1a1a',
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentMetaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  downloadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
});
