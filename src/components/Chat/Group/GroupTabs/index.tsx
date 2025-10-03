import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import Members from './Members';
import Media from './Media';

export default function GroupTabs() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'members' | 'media'>('members');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SegmentedButtons
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'members' | 'media')}
        buttons={[
          { value: 'members', label: 'Members' },
          { value: 'media', label: 'Media' },
          // Add Docs / Links when needed
        ]}
        style={styles.segmented}
      />

      <View style={styles.content}>
        {activeTab === 'members' && <Members />}
        {activeTab === 'media' && <Media />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmented: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  content: {
    flex: 1,
    marginTop: 12,
  },
});
