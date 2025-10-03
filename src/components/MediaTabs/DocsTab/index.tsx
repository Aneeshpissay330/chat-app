import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

export default function DocsTab() {
  return (
    <View style={styles.wrap}>
      <List.Item
        title="project_proposal.pdf"
        description="2.4 MB • Yesterday"
        left={(p) => <List.Icon {...p} color="#D32F2F" icon="file-pdf-box" />}
        style={styles.item}
      />
      <List.Item
        title="mockup_v2.png"
        description="1.8 MB • 2 days ago"
        left={(p) => <List.Icon {...p} color="#1976D2" icon="file-image" />}
        style={styles.item}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { paddingHorizontal: 8 }, item: { borderRadius: 8 } });