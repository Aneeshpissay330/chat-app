import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { IconButton, useTheme, Menu } from 'react-native-paper';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { handleStoragePermission } from '../../../permission';
import Share from 'react-native-share';
import {
  stackTransition,
  Gallery,
  type GalleryRefType,
} from 'react-native-zoom-toolkit';
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

  const [index, setIndex] = useState(Math.min(Math.max(0, initial), Math.max(0, items.length - 1)));
  const [menuVisible, setMenuVisible] = useState(false);
  const galleryRef = useRef<GalleryRefType>(null);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleShare = async () => {
    closeMenu();
    try {
      const currentItem = items[index];
      console.log('Preparing to share item:', currentItem);
      if (!currentItem?.src) {
        Alert.alert('Error', 'No media to share');
        return;
      }

      // Determine if it's a local file or remote URL
      const isLocalFile = !currentItem.src.startsWith('http');
      const fileUri = isLocalFile ? `file://${currentItem.src}` : currentItem.src;

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
      console.log('Share cancelled or failed:', error);
      // Don't show error for user cancellation
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage !== 'User did not share' && 
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('dismiss')
      ) {
        Alert.alert('Share Failed', 'Could not share media. Please try again.');
      }
    }
  };

  const handleDownload = async () => {
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
            [{ text: 'OK' }]
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
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'Could not save media to gallery. Please check permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDelete = () => {
    closeMenu();
    // Add delete functionality here
  };

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
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              iconColor={theme.colors.onBackground}
              onPress={openMenu}
            />
          }
          anchorPosition="bottom"
          contentStyle={{
            backgroundColor: theme.colors.surface,
          }}
        >
          <Menu.Item
            leadingIcon="share-variant"
            onPress={handleShare}
            title="Share"
            titleStyle={{ color: theme.colors.onSurface }}
            style={{ backgroundColor: theme.colors.surface }}
          />
          <Menu.Item
            leadingIcon="download"
            onPress={handleDownload}
            title="Download"
            titleStyle={{ color: theme.colors.onSurface }}
            style={{ backgroundColor: theme.colors.surface }}
          />
          <Menu.Item
            leadingIcon="trash-can"
            onPress={handleDelete}
            title="Delete"
            titleStyle={{ color: theme.colors.onSurface }}
            style={{ backgroundColor: theme.colors.surface }}
          />
        </Menu>
      ),
    });
  }, [navigation, title, menuVisible, theme.colors.background, theme.colors.onBackground, openMenu, closeMenu, handleShare, handleDownload, handleDelete]);

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
    console.log(`Tapped on index ${itemIndex}`);
  }, []);  const transition = useCallback(stackTransition, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <View style={[styles.paginationOverlay, { bottom: Math.max(insets.bottom + 10, 30) }]}>
        <Text style={styles.paginationText}>
          {index + 1} of {items.length}
        </Text>
      </View>
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
});
