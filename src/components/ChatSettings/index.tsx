import * as React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { List, Switch, useTheme, Text, IconButton } from 'react-native-paper';

type Props = {
  notificationsEnabled: boolean;
  onToggleNotifications: (v: boolean) => void;
  onClearChat: () => void;
};

export default function ChatSettings({ notificationsEnabled, onToggleNotifications, onClearChat }: Props) {
  const theme = useTheme();

  const confirmClear = () => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear this chat? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onClearChat },
    ]);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.background }]}>
      <List.Item
        title="Notifications"
        left={(p) => <List.Icon {...p} icon="bell" />}
        right={() => (
          <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />
        )}
      />

      <List.Item
        title="Encryption"
        description="Messages are end-to-end encrypted"
        left={(p) => <List.Icon {...p} icon="shield-lock" />}
        right={() => <IconButton icon="lock" iconColor={theme.colors.secondary} onPress={() => {}} />}
      />

      <List.Item
        title="Clear Chat"
        left={(p) => <List.Icon {...p} color={theme.colors.error} icon="trash-can" />}
        titleStyle={{ color: theme.colors.error }}
        onPress={confirmClear}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { marginTop: 8 } });