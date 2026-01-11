/**
 * useIncomingCall Hook
 * Global hook for listening to incoming calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration, AppState } from 'react-native';
import { Audio } from 'expo-av';
import { callService } from '../services/callService';
import { VIBRATION_PATTERNS } from '../constants/callConstants';

/**
 * Hook for managing incoming call state globally
 * @param {string} userId - Current user ID
 * @param {Object} options
 * @param {Function} options.onIncomingCall - Callback when call comes in
 * @param {Function} options.onCallMissed - Callback when call is missed
 * @returns {Object} { incomingCall, dismissCall, isRinging }
 */
export const useIncomingCall = (userId, options = {}) => {
  const { onIncomingCall, onCallMissed } = options;

  // ========== STATE ==========
  const [incomingCall, setIncomingCall] = useState(null);
  const [isRinging, setIsRinging] = useState(false);

  // ========== REFS ==========
  const soundRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // ========== RINGTONE & VIBRATION ==========

  /**
   * Start ringtone and vibration
   */
  const startRinging = useCallback(async () => {
    try {
      setIsRinging(true);

      // Start vibration pattern (loop)
      vibrationIntervalRef.current = setInterval(() => {
        Vibration.vibrate(VIBRATION_PATTERNS.INCOMING_CALL);
      }, 2500);

      // Start ringtone
      // Note: Ringtone file should be added to assets/sounds/ringtone.mp3
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/ringtone.mp3'),
          { isLooping: true, volume: 1.0 }
        );
        soundRef.current = sound;
        await sound.playAsync();
      } catch (soundError) {
        console.log('[useIncomingCall] Ringtone not available, using vibration only');
      }

      console.log('[useIncomingCall] Ringing started');
    } catch (error) {
      console.error('[useIncomingCall] Start ringing error:', error);
    }
  }, []);

  /**
   * Stop ringtone and vibration
   */
  const stopRinging = useCallback(async () => {
    try {
      setIsRinging(false);

      // Stop vibration
      Vibration.cancel();
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }

      // Stop ringtone
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      console.log('[useIncomingCall] Ringing stopped');
    } catch (error) {
      console.error('[useIncomingCall] Stop ringing error:', error);
    }
  }, []);

  // ========== HANDLERS ==========

  /**
   * Handle incoming call
   */
  const handleIncomingCall = useCallback(async (call) => {
    console.log('[useIncomingCall] Incoming call received:', call.id);

    // Check if already handling a call
    if (incomingCall) {
      console.log('[useIncomingCall] Already handling a call, ignoring');
      return;
    }

    setIncomingCall(call);
    startRinging();
    onIncomingCall?.(call);
  }, [incomingCall, startRinging, onIncomingCall]);

  /**
   * Dismiss incoming call (user handled it)
   */
  const dismissCall = useCallback(() => {
    console.log('[useIncomingCall] Dismissing incoming call');
    stopRinging();
    setIncomingCall(null);
  }, [stopRinging]);

  /**
   * Handle call missed
   */
  const handleCallMissed = useCallback(() => {
    console.log('[useIncomingCall] Call missed');
    stopRinging();
    const missedCall = incomingCall;
    setIncomingCall(null);
    onCallMissed?.(missedCall);
  }, [incomingCall, stopRinging, onCallMissed]);

  // ========== SUBSCRIPTION ==========

  useEffect(() => {
    if (!userId) return;

    console.log('[useIncomingCall] Setting up subscription for user:', userId);

    // Subscribe to incoming calls
    unsubscribeRef.current = callService.subscribeToIncomingCalls(
      userId,
      handleIncomingCall
    );

    // Handle app state changes
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[useIncomingCall] App came to foreground');
        // Check for pending incoming calls
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      console.log('[useIncomingCall] Cleaning up subscription');

      // Unsubscribe from calls
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Remove app state listener
      appStateSubscription.remove();

      // Stop ringing
      stopRinging();
    };
  }, [userId, handleIncomingCall, stopRinging]);

  // ========== CALL STATUS MONITORING ==========

  useEffect(() => {
    if (!incomingCall) return;

    // Monitor call status for missed/cancelled
    const checkCallStatus = async () => {
      const { call } = await callService.getCall(incomingCall.id);

      if (call) {
        if (call.status === 'missed' || call.status === 'cancelled') {
          handleCallMissed();
        } else if (call.status === 'ended' || call.status === 'declined') {
          dismissCall();
        }
      }
    };

    const interval = setInterval(checkCallStatus, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [incomingCall, handleCallMissed, dismissCall]);

  // ========== RETURN ==========

  return {
    incomingCall,
    isRinging,
    dismissCall,
    stopRinging,
    handleCallMissed,
  };
};

export default useIncomingCall;
