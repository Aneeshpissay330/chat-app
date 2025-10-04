import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import PhoneLoginScreen from '../../../screens/PhoneLoginScreen';

const Stack = createStackNavigator();

function AuthStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
      }}
    >
      <Stack.Screen name="PhoneLoginScreen" component={PhoneLoginScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default AuthStack;
