import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, List, useTheme, Divider } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onPickDocument: () => void;
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onShareLocation?: () => void;
  onPickContact?: () => void;
};

export default function AttachmentSheet({
  visible,
  onDismiss,
  onPickDocument,
  onOpenCamera,
  onOpenGallery,
  onShareLocation,
  onPickContact,
}: Props) {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <List.Section>
          <List.Item title="Camera" left={(p) => <List.Icon {...p} icon="camera" />} onPress={onOpenCamera} />
          <List.Item title="Gallery" left={(p) => <List.Icon {...p} icon="image-multiple" />} onPress={onOpenGallery} />
          <List.Item title="Document" left={(p) => <List.Icon {...p} icon="file" />} onPress={onPickDocument} />
          {onShareLocation && (
            <>
              <Divider />
              <List.Item title="Location" left={(p) => <List.Icon {...p} icon="map-marker" />} onPress={onShareLocation} />
            </>
          )}
          {onPickContact && (
            <List.Item title="Contact" left={(p) => <List.Icon {...p} icon="account-box" />} onPress={onPickContact} />
          )}
        </List.Section>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, borderRadius: 16, overflow: 'hidden' },
});
