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
} from 'react-native';
import Video from 'react-native-video';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { IconButton, useTheme, Menu } from 'react-native-paper';

type MediaItem = { src: string; type: 'image' | 'video' };

type RouteParams = {
  MediaViewer: { items: MediaItem[]; initialIndex?: number; title?: string };
};

export default function MediaViewer() {
  const route = useRoute<RouteProp<RouteParams, 'MediaViewer'>>();
  const navigation = useNavigation();
  const theme = useTheme();
  const items = route.params?.items ?? [];
  const initial = route.params?.initialIndex ?? 0;
  const title = route.params?.title ?? '';

  const [index, setIndex] = useState(Math.min(Math.max(0, initial), Math.max(0, items.length - 1)));
  const [menuVisible, setMenuVisible] = useState(false);
  const listRef = useRef<FlatList<any> | null>(null);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleShare = () => {
    closeMenu();
    // Add share functionality here
  };

  const handleDownload = () => {
    closeMenu();
    // Add download functionality here
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
            leadingIcon="trash-can"
            onPress={handleDelete}
            title="Delete"
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
    if (item.type === 'image') {
      return <Image source={{ uri: item.src }} style={styles.media} resizeMode="contain" />;
    }
    return <Video source={{ uri: item.src }} style={styles.media} controls resizeMode="contain" />;
  }, []);

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

      <View style={styles.paginationOverlay}>
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
  media: { width: width, height: height - 100 }, // Adjusted height to account for header only
  navHit: { width: 64, height: '100%' },
  paginationOverlay: {
    position: 'absolute',
    bottom: 30,
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
