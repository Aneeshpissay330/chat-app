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
import { IconButton, useTheme } from 'react-native-paper';

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
  const listRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: title,
      headerBackVisible: true,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTitleStyle: {
        color: theme.colors.onBackground,
      },
      headerTintColor: theme.colors.onBackground,
      headerRight: () => (
        <Text style={{ color: theme.colors.onBackground, opacity: 0.7, fontSize: 12, marginRight: 16 }}>
          {index + 1} of {items.length}
        </Text>
      ),
    });
  }, [navigation, title, index, items.length, theme.colors.background, theme.colors.onBackground]);

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

      <View style={styles.bottomBar}>
        <IconButton icon="share-variant" onPress={() => {}} />
        <IconButton icon="download" onPress={() => {}} />
        <IconButton icon="trash-can" onPress={() => {}} />
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
  media: { width: width, height: height - 160 }, // Adjusted height to account for header
  navHit: { width: 64, height: '100%' },
  bottomBar: {
    height: 84,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
