import React from 'react';
import {
  PaperProvider,
  Text
} from 'react-native-paper';
import { theme } from './src/theme';
import Auth from './src/screens/Auth';
import Navigation from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
