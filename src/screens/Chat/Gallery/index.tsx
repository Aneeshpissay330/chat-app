import React, { useCallback, useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import {
  AlbumWithPhotos,
  getAlbumsGroupedMinimal,
} from '../../../utils/camera-roll';
import AlbumCard from '../../../components/AlbumCard';
import { styles } from './styles';

const Gallery = () => {
  const [groupedPhotos, setGroupedPhotos] = React.useState<AlbumWithPhotos[]>(
    [],
  );
  const getGroupPhotos = async () => {
    const grouped = await getAlbumsGroupedMinimal({
      perAlbum: 30,
      assetType: 'Photos',
    });
    setGroupedPhotos(grouped);
    // Implementation for fetching photos from the gallery
  };
  useEffect(() => {
    getGroupPhotos();
  }, []);
  const renderAlbum = useCallback(
    ({ item }: { item: AlbumWithPhotos }) => <AlbumCard album={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (a: AlbumWithPhotos, index: number) => `${a.album.title}-${index}`,
    [],
  );
  return (
    <FlatList
      data={groupedPhotos}
      renderItem={renderAlbum}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      removeClippedSubviews
      windowSize={7}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={50}
      initialNumToRender={4}
    />
  );
};

export default Gallery;
