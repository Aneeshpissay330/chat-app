import React from 'react';
import { PaperProvider, Text } from 'react-native-paper';
import { lightTheme, darkTheme } from './src/theme';
import Auth from './src/screens/Auth';
import Navigation from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';

const App = () => {
  const isDark = useColorScheme() === 'dark';
  return (
    <PaperProvider theme={!isDark ? darkTheme : lightTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
