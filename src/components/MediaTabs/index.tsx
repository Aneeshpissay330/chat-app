import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { useTheme } from 'react-native-paper';
import StarredTab from './StarredTab';
import MediaTab from './MediaTab';
import DocsTab from './DocsTab';
import LinksTab from './LinksTab';
import { RouteProp, useRoute } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

type MediaTabsRouteParams = {
  MediaTabs: { id: string };
};

const MediaTabs = () => {
  const theme = useTheme(); // Paper theme
  const route = useRoute<RouteProp<MediaTabsRouteParams, 'MediaTabs'>>();
  const otherUid = route.params?.id;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          color: theme.colors.onBackground,
        },
        sceneStyle: { backgroundColor: theme.colors.background }, // ✅ fix here
      }}
    >
      <Tab.Screen name="Starred" component={StarredTab} />
      <Tab.Screen name="Media">
        {() => <MediaTab otherUid={otherUid} />}
      </Tab.Screen>
      <Tab.Screen name="Docs" component={DocsTab} />
      <Tab.Screen name="Links" component={LinksTab} />
    </Tab.Navigator>
  );
};

export default MediaTabs;
