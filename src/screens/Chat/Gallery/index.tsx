import React, { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  AlbumWithPhotos,
  getAlbumsGroupedMinimal,
} from '../../../utils/camera-roll';
import AlbumCard from '../../../components/AlbumCard';
import { styles } from './styles';

const Gallery = () => {
  const [groupedPhotos, setGroupedPhotos] = React.useState<AlbumWithPhotos[]>([]);
  const [loading, setLoading] = React.useState(true);

  const getGroupPhotos = async () => {
    try {
      const grouped = await getAlbumsGroupedMinimal({
        perAlbum: 30,
        assetType: 'Photos',
      });
      setGroupedPhotos(grouped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroupPhotos();
  }, []);

  const renderAlbum = useCallback(
    ({ item }: { item: AlbumWithPhotos }) => <AlbumCard album={item} />,
    []
  );

  const keyExtractor = useCallback(
    (a: AlbumWithPhotos, index: number) => `${a.album.title}-${index}`,
    []
  );

  return (
    <FlashList
      data={groupedPhotos}
      renderItem={renderAlbum}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        loading ? (
          <View style={{ padding: 24 }}>
            <Text>Loading albums…</Text>
          </View>
        ) : (
          <View style={{ padding: 24 }}>
            <Text>No albums found</Text>
          </View>
        )
      }
      // FlashList v2 handles virtualization; FlatList-only props removed:
      // removeClippedSubviews, windowSize, maxToRenderPerBatch,
      // updateCellsBatchingPeriod, initialNumToRender
    />
  );
};

export default Gallery;
