import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Avatar, Text, useTheme, FAB } from 'react-native-paper';

type Props = {
  name: string;
  status: string;
  avatarUrl?: string;
  online?: boolean;
  onCall: () => void;
  onVideoCall: () => void;
  onMute: () => void;
  onBlock: () => void;
};

export default function ContactProfile(props: Props) {
  const { name, status, avatarUrl, online, onCall, onVideoCall, onMute, onBlock } = props;
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Avatar.Image size={96} source={{ uri: avatarUrl }} />
        ) : (
          <Avatar.Text size={96} label={name.split(' ').map((n) => n[0]).join('').slice(0, 2)} />
        )}
        {online && <View style={[styles.badge, { borderColor: theme.colors.surface }]} />}
      </View>
      <Text variant="headlineSmall" style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={{ color: theme.colors.secondary, marginBottom: 12 }}>{status}</Text>

      <View style={styles.actionsRow}>
        <FAB small icon="phone" onPress={onCall} style={[styles.fab, { backgroundColor: theme.colors.primary }]} />
        <FAB small icon="video" onPress={onVideoCall} style={styles.fab} />
        <FAB small icon="bell-off" onPress={onMute} style={styles.fab} />
        <FAB small icon="account-cancel" onPress={onBlock} style={[styles.fab, { backgroundColor: theme.colors.error }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3CB371',
    borderWidth: 3,
  },
  name: { fontWeight: '700', textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  fab: { marginHorizontal: 6 },
});