/**
 * useVoiceSpeed Hook
 * Manages voice message playback speed with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gem_voice_playback_speed';

/**
 * Speed options for voice playback
 */
export const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

/**
 * Hook to manage voice playback speed
 * Persists speed preference to AsyncStorage
 *
 * @returns {Object} { speed, setSpeed, SPEED_OPTIONS, loaded }
 */
export const useVoiceSpeed = () => {
  const [speed, setSpeedState] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // Load saved speed on mount
  useEffect(() => {
    const loadSpeed = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedSpeed = parseFloat(saved);
          // Validate speed is a valid option
          if (SPEED_OPTIONS.some((o) => o.value === parsedSpeed)) {
            setSpeedState(parsedSpeed);
          }
        }
      } catch (err) {
        console.error('[useVoiceSpeed] Load error:', err);
      } finally {
        setLoaded(true);
      }
    };

    loadSpeed();
  }, []);

  // Save speed when changed
  const setSpeed = useCallback(async (newSpeed) => {
    try {
      // Validate
      if (!SPEED_OPTIONS.some((o) => o.value === newSpeed)) {
        console.warn('[useVoiceSpeed] Invalid speed:', newSpeed);
        return;
      }

      setSpeedState(newSpeed);
      await AsyncStorage.setItem(STORAGE_KEY, newSpeed.toString());
    } catch (err) {
      console.error('[useVoiceSpeed] Save error:', err);
    }
  }, []);

  return {
    speed,
    setSpeed,
    SPEED_OPTIONS,
    loaded,
  };
};

export default useVoiceSpeed;
