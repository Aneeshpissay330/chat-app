import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import { ResumableZoom } from 'react-native-zoom-toolkit';

interface GalleryImageProps {
  uri: string;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GalleryImage: React.FC<GalleryImageProps> = ({ uri, index }) => {
  return (
    <ResumableZoom>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="contain"
      />
    </ResumableZoom>
  );
};

const styles = StyleSheet.create({
  image: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default GalleryImage;