/**
 * useVideoPause - Hook to determine if video/animation should be paused
 *
 * Pauses when:
 * - Screen is not focused
 * - App is in background
 *
 * @returns {boolean} shouldPause - true if should pause
 */

import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const useVideoPause = () => {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Pause if screen not focused or app not active
  const shouldPause = !isFocused || appState !== 'active';

  return shouldPause;
};

export default useVideoPause;
