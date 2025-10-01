import { useIsFocused } from '@react-navigation/native';
import { useAppState } from '@react-native-community/hooks';

export function useCameraLifecycle() {
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === 'active';
  return isActive;
}
