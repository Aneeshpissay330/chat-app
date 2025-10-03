import React, {
  useCallback,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import ChatBubble from '../../../../components/ChatBubble';
import ChatInput from '../../../../components/ChatInput';
import type { Message, SendPayload } from '../../../../types/chat';
import { useKeyboardStatus } from '../../../../hooks/useKeyboardStatus';

type RootStackParamList = {
  ChatViewGroup: { id: string };
  GroupInfo: { id: string };
};

const ME = 'me-uid';

const initialGroupMessages: Message[] = [
  // Newest first (inverted list)
  {
    id: 'gm-1',
    text: "Let's merge the PR today after the design sync.",
    createdAt: new Date().toISOString(),
    userId: 'sarah',
    userName: 'Sarah Johnson',
    userAvatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    id: 'gm-2',
    text: 'Pushed the latest build to TestFlight.',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    userId: ME,
  },
  {
    id: 'gm-3',
    text: 'New icons exported—check the Figma file.',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userId: 'ali',
    userName: 'Ali Khan',
    userAvatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
  },
  {
    id: 'gm-4',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    userId: 'maria',
    userName: 'Maria Lopez',
    userAvatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    fileName: 'design_spec_v3.pdf',
    fileSizeLabel: '1.2 MB',
    fileType: 'pdf',
    text: 'Spec doc attached.',
  },
];

type ChatRoute = RouteProp<RootStackParamList, 'ChatViewGroup'>;

type ChatGroupNavigationParams = {
  CameraScreen: undefined;
  GroupChatContact: { id: string; };
};

export default function ChatViewGroup() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<ChatGroupNavigationParams>>();
  const route = useRoute<ChatRoute>();

  const groupId = route.params?.id ?? 'g1';
  // Replace with real source (params/store/api) if available
  const groupMeta = useMemo(
    () => ({
      id: groupId,
      name: 'Design Team',
      members: 12,
      online: 3,
      avatar: undefined as string | undefined, // put URL if you have one
    }),
    [groupId],
  );

  const [messages, setMessages] = useState<Message[]>(initialGroupMessages);
  const listRef = useRef<FlatList<Message>>(null);
  const isKeyboardOpen = useKeyboardStatus();
  const headerHeight = useHeaderHeight();

  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const isMe = item.userId === ME;
      const prev = messages[index + 1]; // inverted list = next chronological
      const showAvatar = !isMe && (!prev || prev.userId !== item.userId);
      return (
        <ChatBubble
          message={item}
          isMe={isMe}
          showAvatar={showAvatar}
          showName={!isMe} // show sender name in group for non-me bubbles
        />
      );
    },
    [messages],
  );

  const keyExtractor = useCallback((m: Message) => m.id, []);

  const onSend = useCallback((payload: SendPayload) => {
    if (!payload.text?.trim() && !payload.files?.length) return;
    const next: Message = {
      id: `local-${Date.now()}`,
      text: payload.text,
      createdAt: new Date().toISOString(),
      userId: ME,
    };
    setMessages(curr => [next, ...curr]);
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    // TODO: send to server
  }, []);

  const onPickDocument = useCallback(async () => {
    // TODO: integrate a real document picker
    console.log('Pick document (group)');
  }, []);

  const onOpenCamera = useCallback(async () => {
    // TODO: integrate camera flow
    navigation.navigate('CameraScreen');
  }, [navigation]);

  const onOpenGallery = useCallback(async () => {
    // TODO: integrate gallery picker
    console.log('Open gallery (group)');
  }, []);

  const onRecordAudio = useCallback(() => {
    // TODO: integrate audio recorder
    console.log('Record audio (group)');
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Appbar.BackAction onPress={() => navigation.goBack()} />,
      headerTitle: () => (
        <List.Item
          title={groupMeta.name}
          description={`${groupMeta.members} members • ${groupMeta.online} online`}
          titleNumberOfLines={1}
          descriptionNumberOfLines={1}
          left={props =>
            groupMeta.avatar ? (
              <Avatar.Image {...props} size={40} source={{ uri: groupMeta.avatar }} />
            ) : (
              <Avatar.Icon {...props} size={40} icon="account-group" />
            )
          }
          style={{ paddingLeft: 0 }}
          onPress={() => navigation.navigate('GroupChatContact', { id: groupMeta.id })}
        />
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <Appbar.Action icon="dots-vertical" onPress={() => {/* open sheet/menu */}} />
        </View>
      ),
    });
  }, [navigation, groupMeta]);

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
