import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, useTheme } from 'react-native-paper';

type Props = {
  notificationsEnabled: boolean;
  muteGroup: boolean;
  onToggleNotifications: (v: boolean) => void;
  onToggleMute: (v: boolean) => void;
};

export default function GroupChatSettings({ notificationsEnabled, muteGroup, onToggleNotifications, onToggleMute }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.background }]}>
      <List.Item
        title="Notifications"
        left={(p) => <List.Icon {...p} icon="bell" />}
        right={() => <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />}
      />
      <List.Item
        title="Mute Group"
        left={(p) => <List.Icon {...p} icon="volume-off" />}
        right={() => <Switch value={muteGroup} onValueChange={onToggleMute} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { marginTop: 8 } });
