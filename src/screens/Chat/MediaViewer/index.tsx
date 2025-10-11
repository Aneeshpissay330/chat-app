import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import {
  Gallery,
  stackTransition,
  type GalleryRefType,
} from 'react-native-zoom-toolkit';
import { handleStoragePermission } from '../../../permission';
import GalleryImage from './GalleryImage';
import GalleryVideo from './GalleryVideo';

type MediaItem = { src: string; type: 'image' | 'video' };

type RouteParams = {
  MediaViewer: { items: MediaItem[]; initialIndex?: number; title?: string };
};

export default function MediaViewer() {
  const route = useRoute<RouteProp<RouteParams, 'MediaViewer'>>();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const items = route.params?.items ?? [];
  const initial = route.params?.initialIndex ?? 0;
  const title = route.params?.title ?? '';

  const [index, setIndex] = useState(
    Math.min(Math.max(0, initial), Math.max(0, items.length - 1)),
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const galleryRef = useRef<GalleryRefType>(null);

  const openMenu = useCallback(() => {
    console.log('Opening menu');
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    console.log('Closing menu');
    setMenuVisible(false);
  }, []);

  const handleShare = useCallback(async () => {
    closeMenu();
    try {
      const currentItem = items[index];
      if (!currentItem?.src) {
        Alert.alert('Error', 'No media to share');
        return;
      }
      const fileUri = currentItem.src;
      const shareOptions = {
        urls: [fileUri], // Use urls array for file sharing
        type: currentItem.type === 'video' ? 'video/*' : 'image/*',
        title: 'Share Media',
        message: 'Check out this media!',
        failOnCancel: false,
      };
      const result = await Share.open(shareOptions);
      console.log('Share result:', result);
    } catch (error) {
      // Don't show error for user cancellation
      console.log('Share error:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage !== 'User did not share' &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('dismiss')
      ) {
        Alert.alert('Share Failed', 'Could not share media. Please try again.');
      }
    }
  }, [items, index, closeMenu]);

  const handleDownload = useCallback(async () => {
    closeMenu();
    try {
      const currentItem = items[index];
      if (!currentItem?.src) {
        Alert.alert('Error', 'No media to download');
        return;
      }

      // Check storage permission first
      const permissionStatus = await handleStoragePermission('check');

      if (permissionStatus !== 'granted') {
        // Request permission if not granted
        const requestResult = await handleStoragePermission('request');

        if (requestResult !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to save media to your gallery. Please grant permission in settings.',
            [{ text: 'OK' }],
          );
          return;
        }
      }

      // Save to camera roll
      await CameraRoll.saveAsset(currentItem.src, {
        type: currentItem.type === 'video' ? 'video' : 'photo',
        album: 'ChatApp', // Optional: create custom album
      });

      Alert.alert(
        'Success',
        `${currentItem.type === 'video' ? 'Video' : 'Image'} saved to gallery!`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert(
        'Download Failed',
        'Could not save media to gallery. Please check permissions.',
        [{ text: 'OK' }],
      );
    }
  }, [items, index, closeMenu]);

  const handleDelete = useCallback(() => {
    closeMenu();
    // Add delete functionality here
  }, [closeMenu]);

  // Simplified header right component using modal instead of Menu
  const headerRight = useCallback(
    () => (
      <IconButton
        icon="dots-vertical"
        size={24}
        iconColor={theme.colors.onBackground}
        onPress={openMenu}
        testID="menu-button"
      />
    ),
    [openMenu, theme.colors],
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: title,
      headerBackVisible: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTitleStyle: {
        color: theme.colors.onBackground,
      },
      headerTintColor: theme.colors.onBackground,
      headerRight,
    });
  }, [navigation, title, theme.colors, headerRight]);

  // Reset menu state when component unmounts or navigation changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setMenuVisible(false);
    });

    return unsubscribe;
  }, [navigation]);

  // Debug effect to track menu state
  useEffect(() => {
    console.log('Menu visible state changed:', menuVisible);
  }, [menuVisible]);

  // Gallery callback functions
  const renderItem = useCallback((item: MediaItem, itemIndex: number) => {
    if (item.type === 'image') {
      return <GalleryImage uri={item.src} index={itemIndex} />;
    }
    return <GalleryVideo uri={item.src} index={itemIndex} />;
  }, []);

  const keyExtractor = useCallback((item: MediaItem, itemIndex: number) => {
    return `${item.src}-${itemIndex}`;
  }, []);

  const onIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  const onTap = useCallback((_: any, itemIndex: number) => {
    // Handle tap event
  }, []);
  const transition = useCallback(stackTransition, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Gallery
        ref={galleryRef}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onTap={onTap}
        onIndexChange={onIndexChange}
        initialIndex={index}
        customTransition={transition}
      />

      <View
        style={[
          styles.paginationOverlay,
          { bottom: Math.max(insets.bottom + 10, 30) },
        ]}
      >
        <Text style={styles.paginationText}>
          {index + 1} of {items.length}
        </Text>
      </View>

      {/* Alternative Modal-based Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.menuModal,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Menu.Item
                leadingIcon="share-variant"
                onPress={handleShare}
                title="Share"
              />
              <Menu.Item
                leadingIcon="download"
                onPress={handleDownload}
                title="Download"
              />
              <Menu.Item
                leadingIcon="delete"
                onPress={handleDelete}
                title="Delete"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  paginationOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: 'white',
    textAlign: 'center',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 75,
    paddingRight: 16,
  },
  menuModal: {
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
