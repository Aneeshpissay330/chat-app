import React from 'react';
import { Image, View } from 'react-native';
import { MinimalPhoto } from '../../utils/camera-roll';

const PhotoItem = React.memo(
  ({ item, size }: { item: MinimalPhoto; size: number }) => {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          // Android-only: avoid white fade-in
          fadeDuration={0 as any}
        />
      </View>
    );
  },
);

export default PhotoItem;
