import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Button, IconButton } from 'react-native-paper';

type Props = {
  inviteLink: string;
  onCopyLink: () => void;
  onResetLink: () => void;
  onShowQr: () => void;
};

export default function GroupInvite({ inviteLink, onCopyLink, onResetLink, onShowQr }: Props) {
  const theme = useTheme();

  // light/dark friendly “pill” background (like bg-gray-50 / dark:bg-gray-800)
  const pillBg =
    theme.dark
      ? theme.colors.elevation?.level2 ?? '#1f1f1f'
      : theme.colors.surfaceVariant ?? '#f3f3f3';

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outlineVariant, borderBottomColor: theme.colors.outlineVariant }]}>
      {/* Header row: title + Reset */}
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={{ fontWeight: '600' }}>Invite Link</Text>
        <Button mode="text" compact onPress={onResetLink}>
          Reset
        </Button>
      </View>

      {/* Link pill: truncated text + copy icon (matches flex row with spacing) */}
      <View style={[styles.pillRow, { backgroundColor: pillBg }]}>
        <Text numberOfLines={1} style={styles.linkText}>
          {inviteLink}
        </Text>
        <IconButton
          icon="content-copy"
          size={18}
          onPress={onCopyLink}
          accessibilityLabel="Copy invite link"
        />
      </View>

      {/* Centered QR action */}
      <View style={styles.qrWrap}>
        <Button
          icon="qrcode"
          mode="text"
          onPress={onShowQr}
          compact
        >
          Join via QR Code
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
  },
  qrWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
});
