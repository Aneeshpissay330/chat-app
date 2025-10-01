import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { EmojiPopup } from 'react-native-emoji-popup';
import { IconButton, TextInput, useTheme } from 'react-native-paper';
import type { SendPayload } from '../../types/chat';
import AttachmentSheet from '../AttachmentSheet';

type Props = {
  onSend: (payload: SendPayload) => void;
  onPickDocument: () => Promise<void> | void;
  onOpenCamera: () => Promise<void> | void;
  onOpenGallery: () => Promise<void> | void;
  onRecordAudio: () => Promise<void> | void;
};

export default function ChatInput({
  onSend,
  onPickDocument,
  onOpenCamera,
  onOpenGallery,
  onRecordAudio,
}: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const inputRef = useRef<any>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend({ text: text.trim() });
    setText('');
    setShowEmojiPopup(false);
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    inputRef.current?.focus?.();
  };
  const CloseButton = ({ close }: { close: () => void }) => (
    <IconButton mode="contained-tonal" icon="close" onPress={close} />
  );
  return (
    <View
      style={[styles.wrap, { borderTopColor: theme.colors.outlineVariant }]}
    >
      <EmojiPopup
        onEmojiSelected={insertEmoji}
        closeButton={CloseButton}
        contentContainerStyle={{
          backgroundColor: theme.colors.background,
          alignItems: 'flex-end'
        }}
      >
        <IconButton mode="contained-tonal" icon="emoticon-outline" />
      </EmojiPopup>
      <TextInput
        ref={inputRef}
        mode="flat" // or "outlined" with outlineStyle below
        placeholder="Type a message"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={1}
        dense
        activeUnderlineColor="transparent"
        underlineColor="transparent"
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 5,
            minHeight: 0, // important on Android
            maxHeight: 50, // don't let it grow too tall
          },
        ]}
        contentStyle={{ paddingVertical: 8 }} // compact vertical padding
        cursorColor={theme.colors.primary}
        right={
          <TextInput.Icon
            icon="attachment"
            onPress={() => {
              setAttachOpen(true);
              Keyboard.dismiss();
            }}
          />
        }
        // If you prefer outlined look, add:
        // mode="outlined"
        // outlineStyle: { borderRadius: 24 }
      />
      {text.trim().length ? (
        <IconButton icon="send" mode="contained-tonal" onPress={handleSend} />
      ) : (
        <IconButton
          icon="microphone"
          mode="contained-tonal"
          onPress={onRecordAudio}
        />
      )}

      {/* Attachment Sheet */}
      <AttachmentSheet
        visible={attachOpen}
        onDismiss={() => setAttachOpen(false)}
        onPickDocument={() => {
          setAttachOpen(false);
          onPickDocument();
        }}
        onOpenCamera={() => {
          setAttachOpen(false);
          onOpenCamera();
        }}
        onOpenGallery={() => {
          setAttachOpen(false);
          onOpenGallery();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center', // was 'flex-end' -> makes it look misaligned
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  input: { flex: 1, marginHorizontal: 6 },
  emojiBox: { margin: 16, borderRadius: 16, padding: 8, maxHeight: 280 },
  emojiGrid: { gap: 4, padding: 8 },
});
