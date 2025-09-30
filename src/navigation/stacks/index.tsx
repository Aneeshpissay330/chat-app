import { createStackNavigator } from '@react-navigation/stack';
import Tabs from '../tabs';

const Stack = createStackNavigator();

function Stacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default Stacks;