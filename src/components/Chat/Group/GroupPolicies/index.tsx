import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, useTheme, Menu, IconButton, Text } from 'react-native-paper';

type Props = {
  sendMessagesPolicy: 'all' | 'admins';
  editInfoPolicy: 'admins' | 'all';
  onChangeSendPolicy: (v: 'all' | 'admins') => void;
  onChangeEditPolicy: (v: 'admins' | 'all') => void;
};

export default function GroupPolicies({
  sendMessagesPolicy, editInfoPolicy, onChangeSendPolicy, onChangeEditPolicy
}: Props) {
  const theme = useTheme();
  const [menu1, setMenu1] = React.useState(false);
  const [menu2, setMenu2] = React.useState(false);

  const sendLabel = sendMessagesPolicy === 'all' ? 'All Members' : 'Admins Only';
  const editLabel = editInfoPolicy === 'admins' ? 'Admins Only' : 'All Members';

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Group Policies</Text>

      <List.Item
        title="Send Messages"
        description={sendLabel}
        right={() => (
          <Menu visible={menu1} onDismiss={() => setMenu1(false)} anchor={<IconButton icon="chevron-down" onPress={() => setMenu1(true)} />}>
            <Menu.Item onPress={() => { setMenu1(false); onChangeSendPolicy('all'); }} title="All Members" />
            <Menu.Item onPress={() => { setMenu1(false); onChangeSendPolicy('admins'); }} title="Admins Only" />
          </Menu>
        )}
      />

      <List.Item
        title="Edit Group Info"
        description={editLabel}
        right={() => (
          <Menu visible={menu2} onDismiss={() => setMenu2(false)} anchor={<IconButton icon="chevron-down" onPress={() => setMenu2(true)} />}>
            <Menu.Item onPress={() => { setMenu2(false); onChangeEditPolicy('admins'); }} title="Admins Only" />
            <Menu.Item onPress={() => { setMenu2(false); onChangeEditPolicy('all'); }} title="All Members" />
          </Menu>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({ section: { paddingHorizontal: 16, paddingVertical: 10 } });
