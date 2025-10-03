import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function StarredTab() {
  return (
    <View style={styles.wrap}>
      <Card>
        <Card.Content>
          <Text>"Perfect! I'll see you there at 2 PM tomorrow."</Text>
          <Text variant="bodySmall" style={styles.meta}>3:45 PM - Today</Text>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content>
          <Text>"Here are the updated designs!"</Text>
          <Text variant="bodySmall" style={styles.meta}>Yesterday</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 12, gap: 12 },
  meta: { opacity: 0.7, marginTop: 6 },
});