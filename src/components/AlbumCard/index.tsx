import React from "react";
import { FlatList } from "react-native";
import { Card } from "react-native-paper";
import { AlbumWithPhotos, ITEM_SIZE, MinimalPhoto, NUM_COLUMNS, SPACING } from "../../utils/camera-roll";
import PhotoItem from "../PhotoItem";
import { styles } from "./styles";

const AlbumCard = React.memo(({ album }: { album: AlbumWithPhotos }) => {
  const keyExtractor = React.useCallback((p: MinimalPhoto) => p.id, []);

  const renderItem = React.useCallback(
    ({ item }: { item: MinimalPhoto }) => <PhotoItem item={item} size={ITEM_SIZE} />,
    []
  );

  // HINT: tiles are fixed-size, so we can provide getItemLayout
  const getItemLayout = React.useCallback(
    (_: any, index: number) => {
      const row = Math.floor(index / NUM_COLUMNS);
      const height = ITEM_SIZE; // since we set columnWrapper gap via content, keep it simple
      const rowHeight = height + SPACING; // matches columnWrapper gap
      return { length: rowHeight, offset: row * rowHeight, index };
    },
    []
  );

  return (
    <Card style={styles.albumCard} mode="contained">
      <Card.Title title={album.album.title || 'Untitled album'} subtitle={`${album.album.count} photos`} />
      <Card.Content>
        <FlatList
          data={album.photos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.columnWrapper}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
          removeClippedSubviews
          initialNumToRender={NUM_COLUMNS * 4}
          maxToRenderPerBatch={NUM_COLUMNS * 6}
          updateCellsBatchingPeriod={40}
          windowSize={5}
          getItemLayout={getItemLayout}
        />
      </Card.Content>
    </Card>
  );
});

export default AlbumCard;