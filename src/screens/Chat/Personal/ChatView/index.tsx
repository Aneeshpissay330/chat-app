import { pick } from '@react-native-documents/picker';
import { useHeaderHeight } from '@react-navigation/elements';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  findDMChat,
  markChatRead,
  sendAudio,
  sendFile,
  sendImage,
  sendText,
  sendVideo,
  setTyping,
  subscribeMessages,
  subscribePresence
} from '../../../../services/chat'; // <-- add this file from previous step
import { colors } from '../../../../theme';
import { FFT_SIZE } from '../../../../utils/audio';

type ChatRouteParams = {
  ChatView: { id: string; type?: 'group'; name?: string; avatar?: string };
};

type ChatPersonalNavigationParams = {
  CameraScreen: { id: string };
  PersonalChatContact: undefined;
};

export default function ChatView() {
  const route = useRoute<RouteProp<ChatRouteParams, 'ChatView'>>();
  const otherUid = route.params?.id; // receiver uid from route
  const isGroup = route.params?.type === 'group';
  const displayName = route.params?.name ?? 'Chat';
  const theme = useTheme();
  const navigation =
    useNavigation<StackNavigationProp<ChatPersonalNavigationParams>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [presenceText, setPresenceText] = useState<string>(''); // "Online" / "Last seen ..."
  const listRef = useRef<FlatList<Message>>(null);
  const isKeyboardOpen = useKeyboardStatus();
  const { userDoc: meDoc } = useUserDoc();

  const me = auth().currentUser?.uid;
  const headerHeight = useHeaderHeight();
  const isSelf = otherUid === me || otherUid === 'me';

  // Ensure chat exists (or reuse) and then subscribe to messages
  useEffect(() => {
    let unsubMsgs: undefined | (() => void);
    (async () => {
      try {
        if (!otherUid) throw new Error('Missing receiver id');
        let id = await findDMChat(otherUid);
        if (!id) return; // Or wait until first message to create
        setChatId(id);

        unsubMsgs = subscribeMessages(id, docs => {
          // Map Firestore message to your UI Message type
          const mapped: Message[] = docs.map(d => ({
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
            // you can add userName/userAvatar here if you fetch user profiles
          }));
          setMessages(mapped);
        });
      } catch (e: any) {
        Alert.alert('Chat error', e?.message ?? 'Failed to open chat');
      }
    })();
    return () => {
      unsubMsgs?.();
    };
  }, [otherUid]);

  // Mark chat read when focused
  useEffect(() => {
    if (!chatId) return;
    const sub = navigation.addListener('focus', () => {
      markChatRead(chatId).catch(() => {});
    });
    return sub;
  }, [chatId, navigation]);

  // Subscribe to other user's presence
  useEffect(() => {
    if (!otherUid || isSelf) return; // skip self
    const unsub = subscribePresence(otherUid, (isOnline, lastActive) => {
      if (isOnline) {
        setPresenceText('Online');
      } else if (lastActive) {
        const mins = Math.max(
          1,
          Math.round((Date.now() - lastActive.getTime()) / 60000),
        );
        setPresenceText(`Last seen ${mins}m ago`);
      } else {
        setPresenceText('Offline');
      }
    });
    return unsub;
  }, [otherUid, isSelf]);

  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const isMe = !!me && item.userId === me;
      const prev = messages[index + 1]; // inverted list
      const showAvatar = !isMe && (!prev || prev.userId !== item.userId);
      return (
        <ChatBubble
          message={item}
          isMe={isMe}
          showAvatar={showAvatar}
          showName={isGroup && !isMe}
        />
      );
    },
    [messages, me, isGroup],
  );

  const keyExtractor = useCallback((m: Message) => m.id, []);

  const onSend = useCallback(
    async (payload: SendPayload) => {
      try {
        let currentChatId = chatId;
        if (!currentChatId) {
          currentChatId = await ensureDMChat(otherUid);
          setChatId(currentChatId);
        }
        await sendText(currentChatId, payload.text || '');
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
      } catch (e: any) {
        Alert.alert('Send failed', e?.message ?? 'Please try again.');
      }
    },
    [chatId],
  );

  // If your ChatInput exposes typing change, call setTyping(chatId, bool)
  // Example:
  const onTyping = useCallback(
    (typing: boolean) => {
      if (chatId) setTyping(chatId, typing);
    },
    [chatId],
  );

  useEffect(() => {
    return () => {
      if (chatId) setTyping(chatId, false);
    };
  }, [chatId]);

  // Attach header with presence
  useLayoutEffect(() => {
    const headerTitle = isSelf
      ? `You (@${meDoc?.username ?? 'you'})`
      : displayName;

    const headerSubtitle = isSelf ? '' : presenceText || ' ';

    navigation.setOptions({
      headerTitle: () => (
        <List.Item
          title={headerTitle}
          description={headerSubtitle}
          left={props => (
            <Avatar.Image
              {...props}
              size={40}
              source={{ uri: meDoc?.photoURL || '' }}
            />
          )}
          onPress={() => {
            if (!isSelf) navigation.navigate('PersonalChatContact');
          }}
        />
      ),
      // headerRight: () => (
      //   <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      // ),
    });
  }, [navigation, displayName, presenceText, isSelf, meDoc?.username]);

  const onPickDocument = useCallback(async () => {
    try {
      const [doc] = await pick({ mode: 'open' });
      if (!doc) return;

      // @react-native-documents/picker returns a content uri on Android ("content://")
      // For Firebase Storage putFile, pass the same uri; it handles content uris on Android.
      // On iOS it will be "file://".
      if (!chatId) return;

      await sendFile(chatId, {
        localPath: doc.uri,
        mime: doc.type || 'application/octet-stream',
        size: doc.size || 0,
        name: doc.name || 'document',
      });
    } catch (error) {
      console.log('Document picker error or cancelled', error);
    }
  }, [chatId]);

  const onOpenCamera = useCallback(async () => {
    navigation.navigate('CameraScreen', { id: otherUid });
  }, [navigation]);

  const onOpenGallery = useCallback(async () => {
    try {
      // Allow both photo & video; cropping only makes sense for images
      const media: any = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
        // includeExif: true,
      });
      if (!chatId) return;

      // image
      if (media?.mime?.startsWith('image/')) {
        await sendImage(chatId, {
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
        });
        return;
      }

      // video
      if (media?.mime?.startsWith('video/')) {
        console.log('Send video', media);
        await sendVideo(chatId, {
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
          durationMs:
            typeof media.duration === 'number' ? media.duration : undefined,
        });
        return;
      }

      console.log('Unsupported media from gallery:', media?.mime);
    } catch (error) {
      console.log('Gallery error or cancelled', error);
    }
  }, [chatId]);

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
  }, []);
  const onCancelRecording = useCallback(async () => {
    if (isRecording) {
      await stop();
    }
    if (filePath) {
      await RNFS.unlink(filePath);
    }
  }, [isRecording, filePath]);
  const onSendRecording = useCallback(async () => {
    if (isRecording) {
      await stop();
    }
    if (filePath) {
      if (!chatId) return;
      const stats = await RNFS.stat(filePath);
      await sendAudio(chatId, {
        localPath: `file:/${filePath}`,
        size: stats.size,
      });
      return;
    }
  }, [isRecording, filePath]);
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={listRef}
              data={messages}
              inverted
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              keyboardShouldPersistTaps="handled"
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
                  <IconButton
                    icon="trash-can-outline"
                    onPress={onCancelRecording}
                  />
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
                onTyping={onTyping} // if you expose this prop from ChatInput
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
