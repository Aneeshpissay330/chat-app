import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatSettings from '../../../../../components/ChatSettings';
import ContactDetails from '../../../../../components/ContactDetails';
import ContactProfile from '../../../../../components/ContactProfile';
import MediaPreviewRow from '../../../../../components/MediaPreviewRow';
import { RouteProp, useRoute } from '@react-navigation/native';
import { subscribeUserById, UserDoc } from '../../../../../services/user';

type ChatRouteParams = {
  PersonalChatContact: { id: string };
};

export default function PersonalChatContact() {
  const theme = useTheme();
  const route = useRoute<RouteProp<ChatRouteParams, 'PersonalChatContact'>>();
  const otherUid = route.params?.id;
  const [user, setUser] = React.useState<UserDoc | null>(null);

  React.useEffect(() => {
    if (!otherUid) return;

    const unsubscribe = subscribeUserById(otherUid, userData => {
      setUser(userData);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, [otherUid]);
  
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <>
            <ContactProfile
              name={user.displayName || 'Unknown'}
              status="Online" // You can change this if you track presence
              avatarUrl={user.photoURL || ''}
              online
              onCall={() => console.log('Call')}
              onVideoCall={() => console.log('Video Call')}
              onMute={() => console.log('Mute')}
              onBlock={() => console.log('Block')}
            />
            <Divider />
            <ContactDetails
              phone={user.phoneNumber || 'N/A'}
              email={user.email || 'N/A'}
              onPressPhone={() => console.log('Call Number')}
              onPressEmail={() => console.log('Send Email')}
            />
            <Divider />
          </>
        )}

        <MediaPreviewRow otherUid={otherUid} />
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
