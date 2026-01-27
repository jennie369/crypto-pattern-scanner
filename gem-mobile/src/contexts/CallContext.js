/**
 * CallContext
 * Global call state and incoming call management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Vibration } from 'react-native';
import { Audio } from 'expo-av';

import { useAuth } from './AuthContext';
import { callService } from '../services/callService';
import { CALL_STATUS, VIBRATION_PATTERNS } from '../constants/callConstants';
import { IncomingCallOverlay } from '../components/Call';
import { navigationRef } from '../navigation/navigationRef';

const CallContext = createContext({});

export const useCallContext = () => useContext(CallContext);

/**
 * CallProvider - Wraps app with global call handling
 */
export function CallProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Debug state - shows subscription status without console
  const [debugInfo, setDebugInfo] = useState({
    subscriptionStatus: 'disconnected',
    lastEvent: null,
    lastEventTime: null,
  });

  // Refs
  const ringtoneRef = useRef(null);
  const subscriptionRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // ========== RINGTONE MANAGEMENT ==========

  const playRingtone = useCallback(async () => {
    try {
      // Stop any existing ringtone
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
      }

      // Set audio mode for ringtone
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Ringtone playback
      // Note: To add custom ringtone, create assets/sounds/ringtone.mp3
      // and update the RINGTONE_SOURCE constant below
      // For now, using vibration only as fallback
      console.log('[CallProvider] Playing call notification (vibration)');

      // Start vibration
      Vibration.vibrate(VIBRATION_PATTERNS.INCOMING_CALL, true);
    } catch (error) {
      console.error('[CallProvider] Error playing ringtone:', error);
      // Still vibrate even if audio fails
      Vibration.vibrate(VIBRATION_PATTERNS.INCOMING_CALL, true);
    }
  }, []);

  const stopRingtone = useCallback(async () => {
    try {
      // Stop vibration
      Vibration.cancel();

      // Stop and unload ringtone
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      }
    } catch (error) {
      console.error('[CallProvider] Error stopping ringtone:', error);
    }
  }, []);

  // ========== INCOMING CALL HANDLERS ==========

  const handleIncomingCall = useCallback((call) => {
    console.log('[CallProvider] Incoming call:', call);

    // Don't show if already handling a call
    if (incomingCall) {
      console.log('[CallProvider] Already handling a call, ignoring');
      return;
    }

    // Set incoming call and show overlay
    setIncomingCall(call);
    setShowOverlay(true);

    // Play ringtone and vibrate
    playRingtone();
  }, [incomingCall, playRingtone]);

  const handleCallEnded = useCallback((call) => {
    console.log('[CallProvider] Call ended:', call);

    // If this is the incoming call we're showing, hide overlay
    if (incomingCall?.id === call?.id) {
      stopRingtone();
      setShowOverlay(false);
      setIncomingCall(null);
    }
  }, [incomingCall, stopRingtone]);

  const handleAccept = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Stop ringtone
      await stopRingtone();

      // Hide overlay
      setShowOverlay(false);

      // Get caller info
      const caller = incomingCall.caller || incomingCall.call_participants?.find(
        p => p.user_id !== user?.id
      )?.profiles;

      // Navigate to IncomingCall screen to handle connection
      const navReady = navigationRef.current &&
        (typeof navigationRef.current.isReady === 'function'
          ? navigationRef.current.isReady()
          : true);

      if (navReady) {
        navigationRef.current.navigate('Call', {
          screen: 'IncomingCall',
          params: {
            call: incomingCall,
            caller,
          },
        });
      }

      // Clear incoming call state
      setIncomingCall(null);
    } catch (error) {
      console.error('[CallProvider] Error accepting call:', error);
    }
  }, [incomingCall, user?.id, stopRingtone]);

  const handleDecline = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Decline the call
      await callService.declineCall(incomingCall.id);

      // Stop ringtone
      await stopRingtone();

      // Hide overlay and clear state
      setShowOverlay(false);
      setIncomingCall(null);
    } catch (error) {
      console.error('[CallProvider] Error declining call:', error);
      // Still hide overlay on error
      setShowOverlay(false);
      setIncomingCall(null);
    }
  }, [incomingCall, stopRingtone]);

  // ========== SUBSCRIBE TO INCOMING CALLS ==========

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setDebugInfo(prev => ({ ...prev, subscriptionStatus: 'not_authenticated' }));
      return;
    }

    console.log('[CallProvider] Subscribing to incoming calls for user:', user.id);

    // Status change callback for debugging
    const handleStatusChange = (info) => {
      if (info.type === 'subscription') {
        setDebugInfo(prev => ({
          ...prev,
          subscriptionStatus: info.status,
          lastStatusTime: info.timestamp,
        }));
      } else if (info.type === 'event') {
        setDebugInfo(prev => ({
          ...prev,
          lastEvent: info.event,
          lastEventCallId: info.callId,
          lastEventTime: info.timestamp,
        }));
      }
    };

    // Subscribe to incoming calls - callService returns unsubscribe function directly
    const unsubscribe = callService.subscribeToIncomingCalls(
      user.id,
      (call) => {
        // This callback is called when an incoming call is detected
        handleIncomingCall(call);
      },
      handleStatusChange
    );

    subscriptionRef.current = unsubscribe;

    return () => {
      console.log('[CallProvider] Cleaning up call subscription');
      setDebugInfo(prev => ({ ...prev, subscriptionStatus: 'disconnected' }));
      if (subscriptionRef.current) {
        // subscriptionRef.current is the unsubscribe function
        if (typeof subscriptionRef.current === 'function') {
          subscriptionRef.current();
        }
        subscriptionRef.current = null;
      }
      stopRingtone();
    };
  }, [isAuthenticated, user?.id, handleIncomingCall, stopRingtone]);

  // ========== APP STATE HANDLING ==========

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // When app goes to background during incoming call
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/) &&
        incomingCall
      ) {
        // Stop ringtone (keep vibration for background awareness)
        if (ringtoneRef.current) {
          await ringtoneRef.current.pauseAsync();
        }
      }

      // When app comes to foreground with incoming call
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        incomingCall
      ) {
        // Resume ringtone
        if (ringtoneRef.current) {
          await ringtoneRef.current.playAsync();
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [incomingCall]);

  // ========== CLEANUP ON UNMOUNT ==========

  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  // ========== CONTEXT VALUE ==========

  const contextValue = {
    incomingCall,
    showOverlay,
    acceptCall: handleAccept,
    declineCall: handleDecline,
    // Debug info for troubleshooting call issues
    debugInfo,
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      {/* Global Incoming Call Overlay */}
      <IncomingCallOverlay
        visible={showOverlay}
        call={incomingCall}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </CallContext.Provider>
  );
}

export default CallContext;
