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
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Avatar, IconButton, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from '../../../../components/ChatBubble';
import ChatInput from '../../../../components/ChatInput';
import { useKeyboardStatus } from '../../../../hooks/useKeyboardStatus';
import type { Message } from '../../../../types/chat';

import auth from '@react-native-firebase/auth';
import RNFS from 'react-native-fs';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { FrequencyChart } from '../../../../components/FrequencyChart';
import {
  clearChatState,
  markReadNow,
  openDmChat,
  selectChatIdByOther,
  selectMessagesByOther,
  selectMsgStatusByOther,
  selectPresenceByOther,
  sendFileNow,
  sendImageNow,
  sendTextNow,
  sendVideoNow,
  setTypingNow,
  startSubscriptions,
} from '../../../../features/messages';
import { useAudioRecorder } from '../../../../hooks/useAudioRecorder';
import { useUserDoc } from '../../../../hooks/useUserDoc';
import { sendAudio } from '../../../../services/chat';
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
  //Theming
  const theme = useTheme();
  // Routing / params
  const route = useRoute<RouteProp<ChatRouteParams, 'ChatView'>>();
  const navigation =
    useNavigation<StackNavigationProp<ChatPersonalNavigationParams>>();
  const otherUid = route.params?.id;
  const otherName = route.params?.name ?? 'Chat';
  const otherAvatar = route.params?.avatar;
  const isGroup = route.params?.type === 'group';

  const listRef = useRef<FlatList<Message>>(null);

  // Me
  const me = auth().currentUser?.uid;
  const { userDoc: meDoc } = useUserDoc();

  // Redux
  const dispatch = useAppDispatch();
  const messages = useAppSelector(s => selectMessagesByOther(s, otherUid));
  const chatId = useAppSelector(s => selectChatIdByOther(s, otherUid));
  const presenceText = useAppSelector(s => selectPresenceByOther(s, otherUid));
  const msgStatus = useAppSelector(s => selectMsgStatusByOther(s, otherUid));

  // UI env (for header offsets if you later add KeyboardAvoidingView)
  const isKeyboardOpen = useKeyboardStatus();
  const headerHeight = useHeaderHeight();
  const keyboardOffset = !isKeyboardOpen
    ? headerHeight
    : headerHeight - Dimensions.get('window').height * 0.04;

  // Derived
  const isSelf = useMemo(
    () => otherUid === me || otherUid === 'me',
    [otherUid, me],
  );

  // Latest chatId for async/cleanup
  const chatIdRef = useRef<string | undefined>(chatId ?? undefined);
  useEffect(() => {
    chatIdRef.current = chatId ?? undefined;
  }, [chatId]);

  /**
   * Combined: ensure chat, subscribe to messages, subscribe to presence
   * One effect => one subscription teardown
   */
  useFocusEffect(
    useCallback(() => {
      if (!otherUid) return;

      (async () => {
        try {
          const { chatId } = await dispatch(openDmChat({ otherUid })).unwrap();
          await dispatch(startSubscriptions({ otherUid, chatId, isSelf }));
        } catch (e: any) {
          Alert.alert('Chat error', e?.message ?? 'Failed to open chat');
        }
      })();

      return () => {
        dispatch(clearChatState({ otherUid }));
      };
    }, [dispatch, otherUid, isSelf]),
  );
  useEffect(() => {
    console.log('messages changed', messages);
  }, [messages]);
  /**
   * Mark read and reset typing on focus/blur of the screen instead of reacting to message changes.
   */
  useFocusEffect(
    useCallback(() => {
      const id = chatIdRef.current;
      if (id) {
        dispatch(markReadNow({ chatId: id }));
        dispatch(setTypingNow({ chatId: id, typing: false }));
      }
      return () => {
        const id2 = chatIdRef.current;
        if (id2) dispatch(setTypingNow({ chatId: id2, typing: false }));
      };
    }, [dispatch, chatIdRef.current]),
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
    [messages, me, isGroup],
  );

  const keyExtractor = useCallback((m: Message) => m.id, []);

  const onSend = useCallback(
    async (text: string) => {
      const id = chatIdRef.current;
      if (!id) return;
      await dispatch(sendTextNow({ chatId: id, text }));
      // you can scroll list to top in your render layer
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    },
    [dispatch],
  );

  const onTyping = useCallback(
    (typing: boolean) => {
      const id = chatIdRef.current;
      if (id) dispatch(setTypingNow({ chatId: id, typing }));
    },
    [dispatch],
  );

  const onPickDocument = useCallback(async () => {
    try {
      const [doc] = await pick({ mode: 'open' });
      if (!doc) return;
      const id = chatIdRef.current;
      if (!id) return;

      await dispatch(
        sendFileNow({
          chatId: id,
          localPath: doc.uri,
          mime: doc.type || 'application/octet-stream',
          size: doc.size || 0,
          name: doc.name || 'document',
        }),
      );
    } catch (error) {
      // picker cancelled or failed
    }
  }, [dispatch]);

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
      if (!id || !media?.mime) return;

      if (media.mime.startsWith('image/')) {
        await dispatch(
          sendImageNow({
            chatId: id,
            localPath: media.path,
            mime: media.mime,
            width: media.width,
            height: media.height,
            size: media.size,
          }),
        );
        return;
      }
      if (media.mime.startsWith('video/')) {
        await dispatch(
          sendVideoNow({
            chatId: id,
            localPath: media.path,
            mime: media.mime,
            width: media.width,
            height: media.height,
            size: media.size,
            durationMs:
              typeof media.duration === 'number' ? media.duration : undefined,
          }),
        );
        return;
      }
      // unsupported type -> ignore silently
    } catch (error) {
      // gallery cancelled or failed
    }
  }, [dispatch]);

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
    [isSelf, meDoc?.username, otherName],
  );
  const headerSubtitle = useMemo(
    () => (isSelf ? '' : presenceText || ' '),
    [isSelf, presenceText],
  );
  const avatarUri = useMemo(
    () => (isSelf ? meDoc?.photoURL : otherAvatar),
    [isSelf, meDoc?.photoURL, otherAvatar],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <List.Item
          title={headerTitle}
          description={headerSubtitle}
          left={props =>
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
            if (!isSelf)
              navigation.navigate('PersonalChatContact', { id: otherUid });
          }}
        />
      ),
    });
  }, [
    navigation,
    headerTitle,
    headerSubtitle,
    avatarUri,
    isSelf,
    otherUid,
    meDoc?.username,
    otherName,
  ]);

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
            keyboardDismissMode="on-drag"
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
