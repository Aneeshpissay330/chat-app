import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatSettings from '../../../../../components/ChatSettings';
import ContactDetails from '../../../../../components/ContactDetails';
import ContactProfile from '../../../../../components/ContactProfile';
import MediaPreviewRow from '../../../../../components/MediaPreviewRow';

export default function PersonalChatContact() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ContactProfile
          name="Sarah Johnson"
          status="Online"
          avatarUrl="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
          online
          onCall={() => console.log('Call')}
          onVideoCall={() => console.log('Video Call')}
          onMute={() => console.log('Mute')}
          onBlock={() => console.log('Block')}
        />
        <Divider />
        <ContactDetails
          phone="+1 (555) 123-4567"
          email="sarah.johnson@email.com"
          onPressPhone={() => console.log('Call Number')}
          onPressEmail={() => console.log('Send Email')}
        />
        <Divider />
        <MediaPreviewRow />
        <Divider />
        <ChatSettings
          notificationsEnabled
          onToggleNotifications={v => console.log('Notifications:', v)}
          onClearChat={() => console.log('Clear chat confirmed')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 24 },
});
