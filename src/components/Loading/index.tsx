import { View, Text } from 'react-native';
import React, { use } from 'react';
import { styles } from './styles';
import { ActivityIndicator, useTheme } from 'react-native-paper';

const Loading = () => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
    </View>
  );
};

export default Loading;
