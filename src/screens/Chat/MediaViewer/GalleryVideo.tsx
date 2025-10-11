import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import Video from 'react-native-video';

interface GalleryVideoProps {
  uri: string;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GalleryVideo: React.FC<GalleryVideoProps> = ({ uri, index }) => {
  return (
    <ResumableZoom>
      <Video
        source={{ uri }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </ResumableZoom>
  );
};

const styles = StyleSheet.create({
  video: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default GalleryVideo;