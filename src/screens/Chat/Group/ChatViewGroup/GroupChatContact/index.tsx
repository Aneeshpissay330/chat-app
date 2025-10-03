import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, Divider, useTheme, List } from 'react-native-paper';
import GroupProfile from '../../../../../components/Chat/Group/GroupProfile';
import GroupInvite from '../../../../../components/Chat/Group/GroupInvite';
import GroupTabs from '../../../../../components/Chat/Group/GroupTabs';
import GroupChatSettings from '../../../../../components/Chat/Group/GroupChatSettings';
import GroupPolicies from '../../../../../components/Chat/Group/GroupPolicies';

export default function GroupChatProfileScreen() {
  const theme = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [muteGroup, setMuteGroup] = React.useState(false);
  const [sendPolicy, setSendPolicy] = React.useState<'all' | 'admins'>('all');
  const [editPolicy, setEditPolicy] = React.useState<'admins' | 'all'>('admins');

  const members = [
    { id: '1', name: 'Alex Chen', role: 'admin', presence: 'online', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
    { id: '2', name: 'Emma Wilson', role: 'moderator', presence: 'online', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    { id: '3', name: 'Sarah Johnson', role: 'member', presence: '2h ago', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
    { id: '4', name: 'Mike Torres', role: 'member', presence: 'offline', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      {/* Header/Profile (mirrors personal ContactProfile composition) */}
      <GroupProfile
        name="Design Team"
        description="A collaborative space for our design projects and discussions. Share ideas, feedback, and creative solutions."
        createdAt="Jan 15, 2024"
        membersCount={12}
        onChangePhoto={() => console.log('Change group photo')}
      />

      <Divider />

      {/* Invite section */}
      <GroupInvite
        inviteLink="https://chat.app/invite/design-team-xyz123"
        onCopyLink={() => console.log('Copy invite link')}
        onResetLink={() => console.log('Reset invite link')}
        onShowQr={() => console.log('Show QR')}
      />

      <Divider />

      {/* Tabs: Members / Media / Docs / Links */}
      <GroupTabs />

      <Divider />

      {/* Settings (mirrors personal ChatSettings style) */}
      <GroupChatSettings
        notificationsEnabled={notificationsEnabled}
        muteGroup={muteGroup}
        onToggleNotifications={setNotificationsEnabled}
        onToggleMute={setMuteGroup}
      />

      {/* Policies */}
      <GroupPolicies
        sendMessagesPolicy={sendPolicy}
        editInfoPolicy={editPolicy}
        onChangeSendPolicy={setSendPolicy}
        onChangeEditPolicy={setEditPolicy}
      />

      <Divider />

      {/* Leave Group */}
      <View style={{ padding: 16 }}>
        <Button mode="outlined" textColor={theme.colors.error} onPress={() => console.log('Leave group')}>
          Leave Group
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
});
