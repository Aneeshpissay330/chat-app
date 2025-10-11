import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ResumableZoom } from 'react-native-zoom-toolkit';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GalleryVideoProps {
  uri: string;
  index: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GalleryVideo: React.FC<GalleryVideoProps> = ({ uri, index }) => {
  const insets = useSafeAreaInsets();
  
  // Calculate available height accounting for header (~56px) and safe areas
  const availableHeight = screenHeight - 56 - insets.top - insets.bottom;
  
  return (
    <ResumableZoom>
      <Video
        source={{ uri }}
        style={[styles.video, { height: availableHeight }]}
        controls
        resizeMode="contain"
      />
    </ResumableZoom>
  );
};

const styles = StyleSheet.create({
  video: {
    width: screenWidth,
  },
});

export default GalleryVideo;