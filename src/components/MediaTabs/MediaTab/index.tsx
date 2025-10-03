import * as React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';

const media = [
  { id: '1', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
  { id: '2', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
  { id: '3', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
  { id: '4', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
  { id: '5', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
  { id: '6', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg' },
  { id: '7', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg' },
  { id: '8', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' },
  { id: '9', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg' },
  { id: '10', uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-10.jpg' },
];

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 16 * 2 - 8 * 2) / 3; // 3 columns with 8px gaps and 16px padding

export default function MediaTab() {
  return (
    <View style={styles.grid}>
      {media.map((item) => (
        <Image key={item.id} source={{ uri: item.uri }} style={styles.cell} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  cell: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
  },
});
