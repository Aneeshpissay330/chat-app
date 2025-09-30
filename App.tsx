import React from 'react';
import {
  PaperProvider,
  Text
} from 'react-native-paper';
import { theme } from './src/theme';
import Auth from './src/screens/Auth';
import Navigation from './src/navigation';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
