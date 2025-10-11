import { pick } from '@react-native-documents/picker';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  RouteProp,
  useFocusEffect,
  useIsFocused,
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
import { Avatar, IconButton, List, useTheme, Chip } from 'react-native-paper';
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
import { formatChatDate } from '../../../../utils/date';

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

  // listRef is declared below with ChatListItem typing

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

  const nav = navigation;

  // Build a simple array of image/video items for the media viewer
  const mediaItems = useMemo(() => {
    return messages
      .filter(m => m.type === 'image' || m.type === 'video')
      .map(m => ({ src: m.localPath || m.url || '', type: m.type as 'image' | 'video', id: m.id }));
  }, [messages]);

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

  // If new messages arrive while this screen is focused, ensure they're
  // immediately marked as read so the Personal list shows correct counts
  // when navigating back. This complements the focus-based markReadNow
  // (which runs when the screen gains focus) by reacting to incoming
  // message changes while focused.
  const isFocused = useIsFocused();
  useEffect(() => {
    const id = chatId;
    if (!id) return;
    if (!isFocused) return;
    if (isSelf) return;
    dispatch(markReadNow({ chatId: id }));
  }, [dispatch, chatId, isFocused, messages.length, isSelf]);
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

  // We'll build a flattened list mixing date-separator "items" with messages.
  type DateItem = { kind: 'date'; id: string; dateLabel: string };
  type ChatListItem = DateItem | Message;

  const listRef = useRef<FlatList<ChatListItem>>(null);

  const listData = useMemo(() => {
    // We need to account for the FlatList being inverted. To make the
    // Chip appear visually above a date-group (nearer the newer messages),
    // insert the date separator AFTER the last message of that date in
    // the data array. When inverted, that separator will render above the
    // message group.
    const out: ChatListItem[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      out.push(m);

      // Determine if next message is a different date (or no next message)
      const next = messages[i + 1];
      const d = new Date(m.createdAt);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      let nextDateKey: string | null = null;
      if (next) {
        const nd = new Date(next.createdAt);
        nextDateKey = `${nd.getFullYear()}-${nd.getMonth() + 1}-${nd.getDate()}`;
      }

      if (!next || nextDateKey !== dateKey) {
        // push separator after the last message of this date
        out.push({ kind: 'date', id: `date-${dateKey}`, dateLabel: formatChatDate(m.createdAt) });
      }
    }

    return out;
  }, [messages]);

  const isDateItem = (i: ChatListItem): i is DateItem => (i as any).kind === 'date';

  const keyExtractor = useCallback((item: ChatListItem) => {
    return isDateItem(item) ? item.id : item.id;
  }, []);

  const renderItem: ListRenderItem<ChatListItem> = useCallback(
    ({ item, index }) => {
      if (isDateItem(item)) {
        return (
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Chip mode="outlined">{item.dateLabel}</Chip>
          </View>
        );
      }

      const message = item as Message;
      const isMe = !!me && message.userId === me;

      // find the next message item in the flattened list (next chronological)
      let prevMsg: Message | undefined;
      for (let i = index + 1; i < listData.length; i++) {
        const it = listData[i];
        if (!isDateItem(it)) {
          prevMsg = it as Message;
          break;
        }
      }

      const showAvatar = !isMe && (!prevMsg || prevMsg.userId !== message.userId);

      const onOpenMedia = (items: { src: string; type: 'image' | 'video' }[], idx: number) => {
        // If the message exists in the larger mediaItems list, open full list at that index.
        const globalIndex = mediaItems.findIndex(mi => mi.id === message.id);
        if (globalIndex >= 0) {
          const payload = mediaItems.map(mi => ({ src: mi.src, type: mi.type }));
          (nav as any).navigate('MediaViewer', { items: payload, initialIndex: globalIndex, title: otherName });
          return;
        }
        // fallback: open the small array passed directly
        (nav as any).navigate('MediaViewer', { items, initialIndex: idx, title: otherName });
      };

      return (
        <ChatBubble
          message={message}
          isMe={isMe}
          showAvatar={showAvatar}
          showName={isGroup && !isMe}
          onOpenMedia={onOpenMedia}
        />
      );
    },
    [listData, me, isGroup, mediaItems, nav, otherName],
  );

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

      // Normalize and ensure we have access to the file on Android.
      // Some providers return content:// URIs which later native readers (Firebase
      // Storage, RNFS) cannot read unless the app copies the file to a private
      // path obtained via ACTION_OPEN_DOCUMENT or uses a content resolver. To be
      // robust, copy content:// URIs into the app cache and pass that path on.
      let localPath: string = doc.uri;

      // Strip file:// prefix if present to make path compatible with RNFS usages
      if (localPath.startsWith('file://')) {
        localPath = localPath.replace(/^file:\/\//, '');
      }

      if (Platform.OS === 'android' && doc.uri.startsWith('content://')) {
        // Attempt to copy the content URI into the app cache directory so
        // downstream native code can read it without permission errors.
        const filename = doc.name?.replace(/\s+/g, '_') || `document-${Date.now()}`;
        const dest = `${RNFS.CachesDirectoryPath}/${filename}`;
        try {
          // copyFile supports content:// URIs on some RNFS builds by using
          // Android's ContentResolver internally. Try this first.
          // dest is plain path (no file://) which our other code expects.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await RNFS.copyFile(doc.uri, dest);
          localPath = dest;
        } catch (err) {
          // Fallback: try reading as base64 and writing out. Some RNFS
          // versions support readFile for content URIs.
          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data = await RNFS.readFile(doc.uri, 'base64');
            await RNFS.writeFile(dest, data, 'base64');
            localPath = dest;
          } catch (err2) {
            console.warn('Failed to copy picked document to cache', err, err2);
            Alert.alert(
              'File access error',
              'Unable to access the selected file. Try picking the file again or choose a different file.',
            );
            return;
          }
        }
      }

      await dispatch(
        sendFileNow({
          chatId: id,
          localPath: `file://${localPath}`,
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
    // stop() now returns the saved file path (or null). Use that to avoid
    // reading stale hook state which may not update synchronously.
    let savedPath: string | null = null;
    if (isRecording) {
      try {
        // stop may return the path of the saved WAV
        // @ts-ignore
        savedPath = await stop();
      } catch {}
    }
    const pathToDelete = savedPath ?? filePath;
    if (pathToDelete) await RNFS.unlink(pathToDelete).catch(() => {});
  }, [isRecording, stop, filePath]);

  const onSendRecording = useCallback(async () => {
    // stop() returns the saved file path (or null). Use it to ensure we send
    // the actual file written on disk rather than relying on hook state.
    let savedPath: string | null = null;
    if (isRecording) {
      // @ts-ignore
      savedPath = await stop();
    }
    const pathToSend = savedPath ?? filePath;
    if (pathToSend) {
      const id = chatIdRef.current;
      if (!id) return;
  const stats = await RNFS.stat(pathToSend);
  // Pass plain file system path. UI components will convert to file:// when needed.
  await sendAudio(id, { localPath: pathToSend, size: stats.size });
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
            data={listData}
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
