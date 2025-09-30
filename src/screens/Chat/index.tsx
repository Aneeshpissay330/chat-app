import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import Group from './Group';
import Personal from './Personal';

const Tab = createMaterialTopTabNavigator();

const Chat = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Personal" component={Personal} />
      <Tab.Screen name="Group" component={Group} />
    </Tab.Navigator>
  );
};

export default Chat;
