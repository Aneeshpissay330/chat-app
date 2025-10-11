import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GalleryImageProps {
  uri: string;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GalleryImage: React.FC<GalleryImageProps> = ({ uri, index }) => {
  const insets = useSafeAreaInsets();
  
  // Calculate available height accounting for header (~56px) and safe areas
  const availableHeight = screenHeight - 56 - insets.top - insets.bottom;
  
  return (
    <ResumableZoom>
      <Image
        source={{ uri }}
        style={[styles.image, { height: availableHeight }]}
        resizeMode="contain"
      />
    </ResumableZoom>
  );
};

const styles = StyleSheet.create({
  image: {
    width: screenWidth,
  },
});

export default GalleryImage;