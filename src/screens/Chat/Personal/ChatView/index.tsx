import { pick } from '@react-native-documents/picker';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Avatar, IconButton, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from '../../../../components/ChatBubble';
import ChatInput from '../../../../components/ChatInput';
import { useKeyboardStatus } from '../../../../hooks/useKeyboardStatus';
import type { Message, SendPayload } from '../../../../types/chat';

import auth from '@react-native-firebase/auth';
import RNFS from 'react-native-fs';
import { FrequencyChart } from '../../../../components/FrequencyChart';
import { useAudioRecorder } from '../../../../hooks/useAudioRecorder';
import { useUserDoc } from '../../../../hooks/useUserDoc';
import {
  ensureDMChat,
  markChatRead,
  sendAudio,
  sendFile,
  sendImage,
  sendText,
  sendVideo,
  setTyping,
  subscribeMessages,
  subscribePresence,
} from '../../../../services/chat';
import { colors } from '../../../../theme';
import { FFT_SIZE } from '../../../../utils/audio';

type ChatRouteParams = {
  ChatView: { id: string; type?: 'group'; name?: string; avatar?: string };
};

type ChatPersonalNavigationParams = {
  CameraScreen: { id: string };
  PersonalChatContact: { id: string };
};

export default function ChatView() {
  const route = useRoute<RouteProp<ChatRouteParams, 'ChatView'>>();
  const otherUid = route.params?.id;
  const otherName = route.params?.name ?? 'Chat';
  const otherAvatar = route.params?.avatar;
  const isGroup = route.params?.type === 'group';
  const theme = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<ChatPersonalNavigationParams>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [presenceText, setPresenceText] = useState<string>('');
  const listRef = useRef<FlatList<Message>>(null);
  const isKeyboardOpen = useKeyboardStatus();
  const { userDoc: meDoc } = useUserDoc();

  const me = auth().currentUser?.uid;
  const headerHeight = useHeaderHeight();

  const isSelf = useMemo(() => otherUid === me || otherUid === 'me', [otherUid, me]);

  // A ref to always have the latest chatId in cleanups without depending the effect
  const chatIdRef = useRef<string | null>(null);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  /**
   * Combined: ensure chat, subscribe to messages, subscribe to presence
   * One effect => one subscription teardown
   */
  useEffect(() => {
    if (!otherUid) return;

    let isActive = true;
    let unsubMsgs: undefined | (() => void);
    let unsubPresence: undefined | (() => void);

    (async () => {
      try {
        const id = await ensureDMChat(otherUid);
        if (!isActive) return;
        setChatId(id);

        // Messages subscription
        unsubMsgs = subscribeMessages(id, (docs) => {
          const mapped: Message[] = docs.map((d) => ({
            id: d.id,
            text: d.text,
            createdAt: d.createdAt.toDate().toISOString(),
            userId: d.senderId,
            url: d.url,
            type: d.type,
            width: d.width,
            height: d.height,
            size: d.size,
            name: d.name,
            mime: d.mime,
          }));
          setMessages(mapped);
        });

        // Presence subscription (skip self)
        if (!isSelf) {
          unsubPresence = subscribePresence(otherUid, (isOnline, lastActive) => {
            if (isOnline) {
              setPresenceText('Online');
            } else if (lastActive) {
              const mins = Math.max(1, Math.round((Date.now() - lastActive.getTime()) / 60000));
              setPresenceText(`Last seen ${mins}m ago`);
            } else {
              setPresenceText('Offline');
            }
          });
        } else {
          setPresenceText('');
        }
      } catch (e: any) {
        Alert.alert('Chat error', e?.message ?? 'Failed to open chat');
      }
    })();

    return () => {
      isActive = false;
      unsubMsgs?.();
      unsubPresence?.();
    };
  }, [otherUid, isSelf]);

  /**
   * Mark read and reset typing on focus/blur of the screen instead of reacting to message changes.
   */
  useFocusEffect(
    useCallback(() => {
      if (!chatIdRef.current) return;
      // On focus
      markChatRead(chatIdRef.current);
      setTyping(chatIdRef.current, false);

      // On blur/cleanup
      return () => {
        if (chatIdRef.current) setTyping(chatIdRef.current, false);
      };
    }, [])
  );

  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const isMe = !!me && item.userId === me;
      const prev = messages[index + 1]; // inverted list
      return (
        <ChatBubble
          message={item}
          isMe={isMe}
          showAvatar={false}
          showName={isGroup && !isMe}
        />
      );
    },
    [messages, me, isGroup]
  );

  const keyExtractor = useCallback((m: Message) => m.id, []);

  const onSend = useCallback(
    async (payload: SendPayload) => {
      try {
        let currentChatId = chatIdRef.current;
        if (!currentChatId) return;
        await sendText(currentChatId, payload.text || '');
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
      } catch (e: any) {
        Alert.alert('Send failed', e?.message ?? 'Please try again.');
      }
    },
    []
  );

  const onTyping = useCallback((typing: boolean) => {
    const id = chatIdRef.current;
    if (id) setTyping(id, typing);
  }, []);

  const onPickDocument = useCallback(async () => {
    try {
      const [doc] = await pick({ mode: 'open' });
      if (!doc) return;
      const id = chatIdRef.current;
      if (!id) return;

      await sendFile(id, {
        localPath: doc.uri,
        mime: doc.type || 'application/octet-stream',
        size: doc.size || 0,
        name: doc.name || 'document',
      });
    } catch (error) {
      console.log('Document picker error or cancelled', error);
    }
  }, []);

  const onOpenCamera = useCallback(() => {
    navigation.navigate('CameraScreen', { id: otherUid });
  }, [navigation, otherUid]);

  const onOpenGallery = useCallback(async () => {
    try {
      const media: any = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
      });
      const id = chatIdRef.current;
      if (!id) return;

      if (media?.mime?.startsWith('image/')) {
        await sendImage(id, {
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
        });
        return;
      }

      if (media?.mime?.startsWith('video/')) {
        await sendVideo(id, {
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
          durationMs: typeof media.duration === 'number' ? media.duration : undefined,
        });
        return;
      }

      console.log('Unsupported media from gallery:', media?.mime);
    } catch (error) {
      console.log('Gallery error or cancelled', error);
    }
  }, []);

  const { start, stop, isRecording, freqs, filePath, togglePause, isPaused } =
    useAudioRecorder({
      sampleRate: 16000,
      bufferLengthInSamples: 16000,
      fftSize: 512,
      smoothing: 0.8,
      monitor: false,
    });

  const onRecordAudio = useCallback(async () => {
    await start();
  }, [start]);

  const onCancelRecording = useCallback(async () => {
    if (isRecording) await stop();
    if (filePath) await RNFS.unlink(filePath);
  }, [isRecording, stop, filePath]);

  const onSendRecording = useCallback(async () => {
    if (isRecording) await stop();
    if (filePath) {
      const id = chatIdRef.current;
      if (!id) return;
      const stats = await RNFS.stat(filePath);
      await sendAudio(id, { localPath: `file:/${filePath}`, size: stats.size });
    }
  }, [isRecording, stop, filePath]);

  // Header values memoized so useLayoutEffect only runs when inputs truly change
  const headerTitle = useMemo(
    () => (isSelf ? `You (@${meDoc?.username ?? 'you'})` : otherName),
    [isSelf, meDoc?.username, otherName]
  );

  const headerSubtitle = useMemo(() => (isSelf ? '' : presenceText || ' '), [isSelf, presenceText]);
  const avatarUri = useMemo(() => (isSelf ? meDoc?.photoURL : otherAvatar), [isSelf, meDoc?.photoURL, otherAvatar]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <List.Item
          title={headerTitle}
          description={headerSubtitle}
          left={(props) =>
            avatarUri ? (
              <Avatar.Image {...props} size={40} source={{ uri: avatarUri }} />
            ) : (
              <Avatar.Text
                {...props}
                size={40}
                label={(isSelf ? meDoc?.username ?? 'You' : otherName)
                  .slice(0, 2)
                  .toUpperCase()}
              />
            )
          }
          onPress={() => {
            if (!isSelf) navigation.navigate('PersonalChatContact', { id: otherUid });
          }}
        />
      ),
    });
  }, [navigation, headerTitle, headerSubtitle, avatarUri, isSelf, otherUid, meDoc?.username, otherName]);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
        keyboardVerticalOffset={
          !isKeyboardOpen
            ? headerHeight
            : headerHeight - Dimensions.get('window').height * 0.04
        }
      >
          <View style={{ flex: 1 }}>
            <FlatList
              ref={listRef}
              data={messages}
              inverted
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode='on-drag'
              onScrollBeginDrag={() => Keyboard.dismiss()}
              style={{ flex: 1 }}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
            {isRecording ? (
              <View style={{ flex: 1, maxHeight: 140 }}>
                <FrequencyChart data={freqs} dataSize={FFT_SIZE / 2} />
                <View
                  style={{
                    justifyContent: 'space-between',
                    columnGap: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <IconButton icon="trash-can-outline" onPress={onCancelRecording} />
                  <IconButton
                    icon={!isPaused ? 'pause' : 'microphone-outline'}
                    iconColor="red"
                    size={30}
                    onPress={togglePause}
                  />
                  <IconButton
                    icon="send-circle"
                    iconColor={colors.primary}
                    size={45}
                    onPress={onSendRecording}
                  />
                </View>
              </View>
            ) : (
              <ChatInput
                onSend={onSend}
                onPickDocument={onPickDocument}
                onOpenCamera={onOpenCamera}
                onOpenGallery={onOpenGallery}
                onRecordAudio={onRecordAudio}
                onTyping={onTyping}
              />
            )}
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
