import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';

import PaperBottomTabBar from './PaperBottomTabBar';
import Chat from '../../screens/Chat';
import Settings from '../../screens/Settings';
import { colors } from '../../theme';
import { useTheme } from 'react-native-paper';

export type RootTabParamList = {
  Chat: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function Tabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        animation: 'shift',
        headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground
      }}
      tabBar={(props) => <PaperBottomTabBar {...props} />}
    >
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ color, size = 26 }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          title: 'Chat',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size = 26 }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
