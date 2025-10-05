import { createStackNavigator } from '@react-navigation/stack';
import OnboardingOne from '../../../screens/Onboarding/OnboardingOne';
import OnboardingTwo from '../../../screens/Onboarding/OnboardingTwo';
import OnboardingThree from '../../../screens/Onboarding/OnboardingThree';

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingOne"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
      <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
      {/* NEW: permissions step */}
      {/* <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissions} /> */}
      <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
    </Stack.Navigator>
  );
}
