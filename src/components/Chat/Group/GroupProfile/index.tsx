import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, useTheme, FAB } from 'react-native-paper';

type Props = {
  name: string;
  description?: string;
  createdAt?: string; // e.g. "Jan 15, 2024"
  membersCount?: number;
  photoUri?: string;
  onChangePhoto?: () => void;
};

export default function GroupProfile({
  name,
  description,
  createdAt,
  membersCount,
  photoUri,
  onChangePhoto,
}: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.avatarWrap}>
        {photoUri ? (
          <Avatar.Image size={96} source={{ uri: photoUri }} />
        ) : (
          <Avatar.Icon size={96} icon="account-group" />
        )}
        {/* optional change photo action */}
        {onChangePhoto && (
          <FAB
            size="small"
            icon="camera"
            onPress={onChangePhoto}
            style={[styles.camFab, { backgroundColor: theme.colors.primary }]}
          />
        )}
      </View>

      <Text variant="headlineSmall" style={styles.name}>{name}</Text>
      {!!description && (
        <Text style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
      )}
      {(createdAt || typeof membersCount === 'number') && (
        <Text style={styles.meta}>
          {createdAt ? `Created ${createdAt}` : ''}{createdAt && typeof membersCount === 'number' ? ' • ' : ''}
          {typeof membersCount === 'number' ? `${membersCount} members` : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  camFab: { position: 'absolute', right: -6, bottom: -6 },
  name: { fontWeight: '700' },
  desc: { textAlign: 'center', marginTop: 6, marginHorizontal: 20 },
  meta: { marginTop: 6, fontSize: 12, color: 'gray' },
});
