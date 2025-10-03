import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

export default function LinksTab() {
  return (
    <View style={styles.wrap}>
      <List.Item
        title="design-system.com"
        description="Shared yesterday"
        left={(p) => <List.Icon {...p} color="#2E7D32" icon="link-variant" />}
      />
      <List.Item
        title="figma.com/project-files"
        description="Shared 3 days ago"
        left={(p) => <List.Icon {...p} color="#6A1B9A" icon="link-variant" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { paddingHorizontal: 8 } });