import * as React from 'react';
import { CommonActions } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { theme } from '../../theme';

export default function PaperBottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      style={{
        backgroundColor: theme.colors?.background,
      }}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, (route as any).params),
            target: state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) =>
        descriptors[route.key].options.tabBarIcon?.({
          focused,
          color,
          size: 24,
        }) || null
      }
      getLabelText={({ route }) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;
        return label;
      }}
    />
  );
}
