// hooks/usePresenceHeartbeat.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { heartbeatPresence } from '../services/chat'; // adjust path if needed

export function usePresenceHeartbeat(intervalMs = 30000) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  let interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const setOnline = () => {
      heartbeatPresence(true);
      if (!interval.current) {
        interval.current = setInterval(
          () => heartbeatPresence(true),
          intervalMs,
        );
      }
    };

    const setOffline = () => {
      heartbeatPresence(false);
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === nextAppState) return;
      appState.current = nextAppState;

      if (nextAppState === 'active') {
        setOnline();
      } else {
        setOffline();
      }
    };

    // Initial run
    if (AppState.currentState === 'active') {
      setOnline();
    } else {
      setOffline();
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      setOffline();
    };
  }, [intervalMs]);
}
