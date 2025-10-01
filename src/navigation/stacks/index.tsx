import { createStackNavigator } from '@react-navigation/stack';
import Tabs from '../tabs';
import ChatView from '../../screens/Chat/ChatView';
import Gallery from '../../screens/Chat/Gallery';
import CameraScreen from '../../screens/Chat/CameraScreen';

const Stack = createStackNavigator();

function Stacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ChatView" component={ChatView} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
  );
}

export default Stacks;