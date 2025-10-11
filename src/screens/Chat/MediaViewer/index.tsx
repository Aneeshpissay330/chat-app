import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  FlatList,
  ViewToken,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { IconButton, useTheme, Menu } from 'react-native-paper';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { handleStoragePermission } from '../../../permission';
import Share from 'react-native-share';

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
  const listRef = useRef<FlatList<any> | null>(null);

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

  const onViewRef = useRef((info: { viewableItems: ViewToken[] }) => {
    if (info.viewableItems && info.viewableItems.length > 0) {
      const idx = info.viewableItems[0].index ?? 0;
      setIndex(idx);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = useCallback(({ item }: { item: MediaItem }) => {
    const mediaHeight = height - 100 - Math.max(insets.bottom, 20); // Account for header and bottom safe area
    
    if (item.type === 'image') {
      return <Image source={{ uri: item.src }} style={[styles.media, { height: mediaHeight }]} resizeMode="contain" />;
    }
    return <Video source={{ uri: item.src }} style={[styles.media, { height: mediaHeight }]} controls resizeMode="contain" />;
  }, [insets.bottom]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({ length: Dimensions.get('window').width, offset: Dimensions.get('window').width * i, index: i })}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      <View style={[styles.paginationOverlay, { bottom: Math.max(insets.bottom + 10, 30) }]}>
        <Text style={styles.paginationText}>
          {index + 1} of {items.length}
        </Text>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  mediaContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  mediaWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  media: { width: width }, // Removed fixed height, now calculated dynamically
  navHit: { width: 64, height: '100%' },
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
