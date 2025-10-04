import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { useTheme } from 'react-native-paper';
import Group from './Group';
import Personal from './Personal';
import { View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const Chat = () => {
  const theme = useTheme(); // Paper theme
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Personal />
    </View>
  );
  // return (
  //   <Tab.Navigator
  //     screenOptions={{
  //       tabBarStyle: { backgroundColor: theme.colors.background },
  //       tabBarLabelStyle: { fontWeight: 'bold', color: theme.colors.onBackground },
  //       sceneStyle: { backgroundColor: theme.colors.background }, // ✅ fix here
  //     }}
  //   >
  //     <Tab.Screen name="Personal" component={Personal} />
  //     <Tab.Screen name="Group" component={Group} />
  //   </Tab.Navigator>
  // );
};

export default Chat;
