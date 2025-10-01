import { createStackNavigator } from '@react-navigation/stack';
import Tabs from '../tabs';
import ChatView from '../../screens/Chat/ChatView';
import Camera from '../../screens/Chat/Camera';
import Gallery from '../../screens/Chat/Gallery';

const Stack = createStackNavigator();

function Stacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ChatView" component={ChatView} />
      <Stack.Screen name="Camera" component={Camera} options={{ headerShown: false }} />
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
  );
}

export default Stacks;