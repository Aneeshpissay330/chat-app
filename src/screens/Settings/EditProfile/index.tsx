import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';

const MAX_BIO = 150;

const EditProfile = () => {
  const theme = useTheme();

  // Seeded with values seen in the HTML mock
  const [photoUri, setPhotoUri] = useState(
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
  );
  const [displayName, setDisplayName] = useState('John Smith');
  const [username, setUsername] = useState('johnsmith');
  const [bio, setBio] = useState('Available for chat');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const email = 'john.smith@gmail.com';

  // Modals
  const [photoActionsVisible, setPhotoActionsVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const sectionTitleStyle = useMemo(
    () => ({ marginHorizontal: 16, marginTop: 8, marginBottom: 4, opacity: 0.6 }),
    []
  );

  const handleSave = () => {
    // Wire to your save endpoint / RTK action as needed
    console.log('Saving profile:', { displayName, username, bio, phone });
  };

  const normalizeUsername = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const open = (what: string) => () => console.log(`Open ${what}`);

  const navigation = useNavigation<any>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Profile',
      headerLeft: () => (
        <IconButton
          icon="arrow-left"
          size={20}
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <Button onPress={handleSave} mode="text">
          Save
        </Button>
      ),
    });
  }, [navigation, handleSave]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        {/* Photo section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <View style={{ width: 96, height: 96 }}>
            <Avatar.Image size={96} source={{ uri: photoUri }} />
            <IconButton
              icon="camera"
              size={16}
              onPress={() => setPhotoActionsVisible(true)}
              style={{
                position: 'absolute',
                right: -6,
                bottom: -6,
                backgroundColor: theme.colors.primary,
              }}
              iconColor="white"
            />
          </View>
          <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
            Tap to change photo
          </Text>
        </View>

        {/* Basic Information */}
        <Text variant="labelSmall" style={sectionTitleStyle}>
          BASIC INFORMATION
        </Text>
        <List.Section>
          <List.Item
            title={() => (
              <View style={{ width: '100%' }}>
                <TextInput
                  mode="outlined"
                  label="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>
            )}
          />
          <List.Item
            title={() => (
              <View style={{ width: '100%' }}>
                <TextInput
                  mode="outlined"
                  label="Username"
                  value={username}
                  onChangeText={(t) => setUsername(normalizeUsername(t))}
                  left={<TextInput.Affix text="@" />}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.6 }}>
                  Others can find you by this username
                </Text>
              </View>
            )}
          />
          <List.Item
            title={() => (
              <View style={{ width: '100%' }}>
                <TextInput
                  mode="outlined"
                  label="About"
                  value={bio}
                  multiline
                  numberOfLines={3}
                  onChangeText={(t) => setBio(t.slice(0, MAX_BIO))}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    Write a few words about yourself
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    {bio.length}/{MAX_BIO}
                  </Text>
                </View>
              </View>
            )}
          />
        </List.Section>

        <Divider />

        {/* Contact Information */}
        <Text variant="labelSmall" style={sectionTitleStyle}>
          CONTACT INFORMATION
        </Text>
        <List.Section>
          <List.Item
            title={() => (
              <View style={{ width: '100%' }}>
                <TextInput
                  mode="outlined"
                  label="Email"
                  value={email}
                  disabled
                  right={<TextInput.Icon icon="google" />}
                />
                <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.6 }}>
                  Linked to Google account
                </Text>
              </View>
            )}
          />
          <List.Item
            title={() => (
              <View style={{ width: '100%' }}>
                <TextInput
                  mode="outlined"
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.6 }}>
                  Used for account verification
                </Text>
              </View>
            )}
          />
        </List.Section>

        <Divider />

        {/* Account */}
        <Text variant="labelSmall" style={sectionTitleStyle}>
          ACCOUNT
        </Text>
        <List.Section>
          {/* <Card mode="contained" style={{ marginHorizontal: 8, borderRadius: 12 }}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconButton icon="google" onPress={() => {}} />
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall">Google Account</Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {email}
                </Text>
              </View>
              <Button mode="outlined" onPress={open('re-link google')}>
                Re-link
              </Button>
            </Card.Content>
          </Card> */}

          <List.Item
            title="Share Contact"
            description="Generate QR code"
            left={(props) => <List.Icon {...props} icon="qrcode" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setQrVisible(true)}
          />
        </List.Section>
      </ScrollView>

      {/* Photo action sheet */}
      <Portal>
        <Modal
          visible={photoActionsVisible}
          onDismiss={() => setPhotoActionsVisible(false)}
          contentContainerStyle={{
            margin: 16,
            borderRadius: 16,
            backgroundColor: theme.colors.elevation.level2,
            padding: 12,
          }}
        >
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Change Profile Photo
          </Text>
          <List.Item
            title="Take Photo"
            left={(props) => <List.Icon {...props} icon="camera" />}
            onPress={() => {
              console.log('Open camera');
              setPhotoActionsVisible(false);
            }}
          />
          <List.Item
            title="Choose from Gallery"
            left={(props) => <List.Icon {...props} icon="image" />}
            onPress={() => {
              console.log('Open gallery');
              setPhotoActionsVisible(false);
            }}
          />
          <List.Item
            title="Remove Photo"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} icon="trash-can-outline" color={theme.colors.error} />}
            onPress={() => {
              setPhotoUri('https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg');
              setPhotoActionsVisible(false);
            }}
          />
          <Button mode="outlined" onPress={() => setPhotoActionsVisible(false)} style={{ marginTop: 8 }}>
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* QR modal */}
      <Portal>
        <Modal
          visible={qrVisible}
          onDismiss={() => setQrVisible(false)}
          contentContainerStyle={{
            margin: 16,
            borderRadius: 16,
            backgroundColor: theme.colors.elevation.level2,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium">Share Contact</Text>
            <IconButton icon="close" onPress={() => setQrVisible(false)} />
          </View>
          <View
            style={{
              height: 192,
              borderRadius: 12,
              marginVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            {/* Placeholder QR visual */}
            <IconButton icon="qrcode" size={64} onPress={() => {}} />
          </View>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginBottom: 12 }}>
            Scan this QR code to add {displayName} to contacts
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button mode="contained" style={{ flex: 1 }} onPress={() => console.log('Share QR')}>
              Share
            </Button>
            <Button mode="outlined" style={{ flex: 1 }} onPress={() => console.log('Save QR')}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default EditProfile;
