// screens/Settings/EditProfile/index.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
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
  useTheme,
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useUserDoc } from '../../../hooks/useUserDoc';
import { updateUserProfile } from '../../../services/user';
import {
  pickAvatarFromGallery,
  takeAvatarPhoto,
  uploadAvatar,
} from '../../../services/avatar';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_BIO = 150;

const EditProfile = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { userDoc } = useUserDoc();

  // UI state
  const [photoUri, setPhotoUri] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoActionsVisible, setPhotoActionsVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const authUser = auth().currentUser;
  const email = userDoc?.email ?? authUser?.email ?? '';
  const phone = userDoc?.phoneNumber ?? authUser?.phoneNumber ?? '';

  // Seed from Firestore doc (preferred) with Auth fallback
  useEffect(() => {
    setPhotoUri(userDoc?.photoURL ?? authUser?.photoURL ?? photoUri);
    setDisplayName(userDoc?.displayName ?? authUser?.displayName ?? '');
    setUsername(userDoc?.username ?? '');
    setBio(userDoc?.bio ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userDoc?.photoURL,
    userDoc?.displayName,
    userDoc?.username,
    userDoc?.bio,
  ]);

  const sectionTitleStyle = useMemo(
    () => ({
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
      opacity: 0.6,
    }),
    [],
  );

  const normalizeUsername = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile({
        displayName: displayName.trim(),
        username: normalizeUsername(username),
        bio: bio.trim(),
        photoURL: photoUri || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changeAvatarFromGallery = async () => {
    try {
      const img = await pickAvatarFromGallery();
      const url = await uploadAvatar(img.path);
      setPhotoUri(url);
      await updateUserProfile({ photoURL: url });
      setPhotoActionsVisible(false);
    } catch (e: any) {
      if (e?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Photo error', e?.message ?? 'Could not update photo.');
      }
    }
  };

  const changeAvatarFromCamera = async () => {
    try {
      const img = await takeAvatarPhoto();
      const url = await uploadAvatar(img.path);
      setPhotoUri(url);
      await updateUserProfile({ photoURL: url });
      setPhotoActionsVisible(false);
    } catch (e: any) {
      if (e?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Photo error', e?.message ?? 'Could not update photo.');
      }
    }
  };

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
        <Button
          onPress={handleSave}
          mode="text"
          loading={saving}
          disabled={saving}
        >
          Save
        </Button>
      ),
    });
  }, [navigation, handleSave, saving]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        {/* Photo section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: theme.dark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.05)',
          }}
        >
          <View style={{ width: 96, height: 96 }}>
            {photoUri ? (
              <Avatar.Image size={96} source={{ uri: photoUri }} />
            ) : (
              <Avatar.Icon size={96} icon="account" />
            )}
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
                  onChangeText={t => setUsername(normalizeUsername(t))}
                  left={<TextInput.Affix text="@" />}
                />
                <Text
                  variant="bodySmall"
                  style={{ marginTop: 4, opacity: 0.6 }}
                >
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
                  onChangeText={t => setBio(t.slice(0, MAX_BIO))}
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

        {/* Contact Information (read-only) */}
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
                />
                <Text
                  variant="bodySmall"
                  style={{ marginTop: 4, opacity: 0.6 }}
                >
                  Linked to account
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
                  disabled
                />
                <Text
                  variant="bodySmall"
                  style={{ marginTop: 4, opacity: 0.6 }}
                >
                  Used for account verification
                </Text>
              </View>
            )}
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
            left={props => <List.Icon {...props} icon="camera" />}
            onPress={changeAvatarFromCamera}
          />
          <List.Item
            title="Choose from Gallery"
            left={props => <List.Icon {...props} icon="image" />}
            onPress={changeAvatarFromGallery}
          />
          {/* <List.Item
            title="Remove Photo"
            titleStyle={{ color: theme.colors.error }}
            left={props => (
              <List.Icon
                {...props}
                icon="trash-can-outline"
                color={theme.colors.error}
              />
            )}
            onPress={async () => {
              setPhotoUri('');
              await updateUserProfile({ photoURL: '' });
              setPhotoActionsVisible(false);
            }}
          /> */}
          <Button
            mode="outlined"
            onPress={() => setPhotoActionsVisible(false)}
            style={{ marginTop: 8 }}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* (Your QR modal stays as-is) */}
    </SafeAreaView>
  );
};

export default EditProfile;
