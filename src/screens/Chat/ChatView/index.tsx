import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  FlatList,
  ListRenderItem,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Appbar, Avatar, List, useTheme } from 'react-native-paper';
import ChatBubble from '../../../components/ChatBubble';
import ChatInput from '../../../components/ChatInput';
import type { Message, SendPayload } from '../../../types/chat';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useKeyboardStatus } from '../../../hooks/useKeyboardStatus';
import ImagePicker from 'react-native-image-crop-picker';

const ME = 'me-uid';

const initialMessages: Message[] = [
  {
    id: 'm-1',
    text: "Perfect! I'll see you there at 2 PM tomorrow. Looking forward to discussing the project details.",
    createdAt: new Date().toISOString(),
    userId: ME,
  },
  {
    id: 'm-2',
    text: 'Great! How about we meet at the coffee shop on 5th Street?',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    userId: 'sarah',
    userName: 'Sarah Johnson',
    userAvatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    id: 'm-3',
    text: 'Hey Sarah! Are we still on for the meeting tomorrow?',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userId: ME,
  },
  {
    id: 'm-4',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    userId: 'sarah',
    userName: 'Sarah Johnson',
    userAvatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    fileName: 'mockup_v2.png',
    fileSizeLabel: '2.4 MB',
    fileType: 'image',
    text: 'Here are the updated designs!',
  },
];

export default function ChatView() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const listRef = useRef<FlatList<Message>>(null);
  const isKeyboardOpen = useKeyboardStatus();
  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const isMe = item.userId === ME;
      const prev = messages[index + 1]; // inverted list
      const showAvatar = !isMe && (!prev || prev.userId !== item.userId);
      return <ChatBubble message={item} isMe={isMe} showAvatar={showAvatar} />;
    },
    [messages],
  );

  const keyExtractor = useCallback((m: Message) => m.id, []);

  const onSend = useCallback((payload: SendPayload) => {
    const next: Message = {
      id: `local-${Date.now()}`,
      text: payload.text,
      createdAt: new Date().toISOString(),
      userId: ME,
    };
    setMessages(curr => [next, ...curr]);
    // TODO: send to server
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const onPickDocument = useCallback(() => {
    // TODO: integrate react-native-document-picker
    console.log('Pick Document');
  }, []);
  const onOpenCamera = useCallback(async () => {
    // TODO: integrate react-native-image-picker (launchCamera)
    // navigation.navigate('Camera');
    try {
      const result = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
      console.log(result);
    } catch (error) {
      console.log('Camera error or cancelled', error);
    }
  }, []);
  const onOpenGallery = useCallback(async () => {
    // TODO: integrate react-native-image-picker (launchImageLibrary)
    // navigation.navigate('Gallery');
    try {
      const result = await ImagePicker.openPicker({
        // multiple: true,
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
      });
      console.log(result);
    } catch (error) {
      console.log('Gallery error or cancelled', error);
    }
  }, []);
  const onRecordAudio = useCallback(() => {
    // TODO: integrate recorder (e.g., react-native-audio-recorder-player)
    console.log('Record Audio');
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <List.Item
          title="Sarah Johnson"
          description="Online"
          left={props => <List.Icon {...props} icon="folder" />}
          onPress={() => {}}
        />
      ),
      headerRight: () => (
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      ),
    });
  }, [navigation]);
  const headerHeight = useHeaderHeight();

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
            />
            <ChatInput
              onSend={onSend}
              onPickDocument={onPickDocument}
              onOpenCamera={onOpenCamera}
              onOpenGallery={onOpenGallery}
              onRecordAudio={onRecordAudio}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
