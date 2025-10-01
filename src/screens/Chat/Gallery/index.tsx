import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { getAlbumsGroupedMinimal } from '../../../utils/camera-roll';

const Gallery = () => {
  const getGroupPhotos = async () => {
    const grouped = await getAlbumsGroupedMinimal({
      perAlbum: 30,
      assetType: 'Photos',
    });
    console.log(grouped);
    // Implementation for fetching photos from the gallery
  };
  useEffect(() => {
    getGroupPhotos();
  }, []);
  return (
    <View>
      <Text>Gallery</Text>
    </View>
  );
};

export default Gallery;
