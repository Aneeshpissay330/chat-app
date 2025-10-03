import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton, useTheme } from 'react-native-paper';

type Props = {
  phone: string;
  email: string;
  onPressPhone: () => void;
  onPressEmail: () => void;
};

export default function ContactDetails({ phone, email, onPressPhone, onPressEmail }: Props) {
  const theme = useTheme();
  return (
    <View style={{  backgroundColor: theme.colors.background }}>
      <List.Item
        title={phone}
        description="Phone"
        left={(p) => <List.Icon {...p} icon="phone" />}
        right={() => (
          <IconButton icon="phone" iconColor={theme.colors.primary} onPress={onPressPhone} />
        )}
      />
      <List.Item
        title={email}
        description="Email"
        left={(p) => <List.Icon {...p} icon="email" />}
        right={() => (
          <IconButton icon="email" iconColor={theme.colors.primary} onPress={onPressEmail} />
        )}
      />
    </View>
  );
}