import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import {
  AlbumWithPhotos,
  ITEM_SIZE,
  MinimalPhoto,
  NUM_COLUMNS,
  SPACING,
} from '../../utils/camera-roll';
import PhotoItem from '../PhotoItem';
import { styles } from './styles';

const AlbumCard = React.memo(({ album }: { album: AlbumWithPhotos }) => {
  const keyExtractor = React.useCallback((p: MinimalPhoto) => p.id, []);

  // Add a thin wrapper to reproduce the old column gap from `columnWrapperStyle`
  const renderItem = React.useCallback(
  ({ item, index }: { item: MinimalPhoto; index: number }) => {
    const col = index % NUM_COLUMNS;
    const isLastCol = col === NUM_COLUMNS - 1;

    return (
      <View
        style={{
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          marginRight: isLastCol ? 0 : SPACING,
        }}
      >
        <PhotoItem item={item} size={ITEM_SIZE * 0.8} />
      </View>
    );
  },
  []
);

  return (
    <Card style={styles.albumCard} mode="contained">
    <Card.Title
      title={album.album.title || 'Untitled album'}
      subtitle={`${album.album.count} photos`}
    />
    <Card.Content>
      <FlashList
        data={album.photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContainer}
      />
    </Card.Content>
  </Card>
  );
});

export default AlbumCard;
