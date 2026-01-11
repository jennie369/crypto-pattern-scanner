/**
 * usePictureInPicture Hook
 * Manages Picture-in-Picture mode for video calls
 * Note: Full PiP requires native module setup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState } from 'react-native';

/**
 * usePictureInPicture Hook
 * Quản lý Picture-in-Picture mode
 */
export const usePictureInPicture = (isInCall = false) => {
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  // Check PiP support
  useEffect(() => {
    // PiP supported on iOS 14+ and Android 8+
    if (Platform.OS === 'ios') {
      const version = parseInt(Platform.Version, 10);
      setIsPiPSupported(version >= 14);
    } else if (Platform.OS === 'android') {
      setIsPiPSupported(Platform.Version >= 26);
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    if (!isInCall) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Auto-enter PiP when app goes to background during call
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        if (isPiPSupported) {
          enterPiP();
        }
      }

      // Exit PiP when app comes to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        exitPiP();
      }

      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isInCall, isPiPSupported]);

  const enterPiP = useCallback(() => {
    if (isPiPSupported) {
      setIsPiPActive(true);
      // Note: Actual PiP requires native implementation
      // For now, this sets the state which can be used for UI
      console.log('[PiP] Entering Picture-in-Picture');
    }
  }, [isPiPSupported]);

  const exitPiP = useCallback(() => {
    setIsPiPActive(false);
    console.log('[PiP] Exiting Picture-in-Picture');
  }, []);

  const togglePiP = useCallback(() => {
    if (isPiPActive) {
      exitPiP();
    } else {
      enterPiP();
    }
  }, [isPiPActive, enterPiP, exitPiP]);

  return {
    isPiPSupported,
    isPiPActive,
    enterPiP,
    exitPiP,
    togglePiP,
  };
};

export default usePictureInPicture;
