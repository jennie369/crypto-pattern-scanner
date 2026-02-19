/**
 * CallContext
 * Global call state and incoming call management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform, Vibration, TouchableOpacity, Text, View, StyleSheet as RNStyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Phone, Video, ChevronRight } from 'lucide-react-native';

import { useAuth } from './AuthContext';
import { callService } from '../services/callService';
import callKeepService from '../services/callKeepService';
import { CALL_STATUS, VIBRATION_PATTERNS } from '../constants/callConstants';
import { IncomingCallOverlay } from '../components/Call';
import { navigationRef } from '../navigation/navigationRef';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const CallContext = createContext({});

export const useCallContext = () => useContext(CallContext);

// Global callback for triggering incoming call from push notifications
// This allows InAppNotificationContext to trigger the full-screen overlay
let globalIncomingCallHandler = null;

export const registerIncomingCallHandler = (handler) => {
  globalIncomingCallHandler = handler;
};

export const triggerIncomingCallFromPush = async (callId) => {
  console.log('[CallContext] triggerIncomingCallFromPush called:', callId);
  if (globalIncomingCallHandler) {
    await globalIncomingCallHandler(callId);
  } else {
    console.warn('[CallContext] No incoming call handler registered');
  }
};

/**
 * CallProvider - Wraps app with global call handling
 */
export function CallProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [callKeepReady, setCallKeepReady] = useState(false);
  // Active call tracking for global floating indicator
  const [activeCall, setActiveCallState] = useState(null); // { call, otherUser, isCaller, screenName }

  // Debug state - shows subscription status without console
  const [debugInfo, setDebugInfo] = useState({
    subscriptionStatus: 'disconnected',
    lastEvent: null,
    lastEventTime: null,
    callKeepAvailable: false,
  });

  // Refs
  const ringtoneRef = useRef(null);
  const subscriptionRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const pendingCallKeepAnswerRef = useRef(null);
  // Track call IDs that have been navigated to - prevent duplicate navigation
  const navigatedCallIdsRef = useRef(new Set());
  // Track last navigation timestamp to debounce
  const lastNavigationTimeRef = useRef(0);
  // Ref for incomingCall to avoid stale closures in async callbacks (C1 fix)
  const incomingCallRef = useRef(null);

  // Keep incomingCallRef in sync with state (C1 fix - prevents stale closures)
  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  // ========== RINGTONE MANAGEMENT ==========

  // Interval ref for ringtone repetition
  const ringtoneIntervalRef = useRef(null);

  const playRingtone = useCallback(async () => {
    try {
      // Stop any existing ringtone
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      }
      if (ringtoneIntervalRef.current) {
        clearInterval(ringtoneIntervalRef.current);
        ringtoneIntervalRef.current = null;
      }

      // Set audio mode for ringtone
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Play level-up sound as ringtone (more musical/recognizable than plain vibration)
      const playOnce = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/Ritual_sounds/level-up.mp3'),
            {
              shouldPlay: true,
              isLooping: false,
              volume: 0.7,
            }
          );
          ringtoneRef.current = sound;

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync().catch(() => {});
              if (ringtoneRef.current === sound) {
                ringtoneRef.current = null;
              }
            }
          });
        } catch (e) {
          // Sound play failed, vibration is still active
        }
      };

      console.log('[CallProvider] Playing incoming call ringtone + vibration');

      // Start vibration
      Vibration.vibrate(VIBRATION_PATTERNS.INCOMING_CALL, true);

      // Play ringtone sound immediately
      await playOnce();

      // Repeat every 3.5 seconds
      ringtoneIntervalRef.current = setInterval(playOnce, 3500);
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

      // Clear ringtone repeat interval
      if (ringtoneIntervalRef.current) {
        clearInterval(ringtoneIntervalRef.current);
        ringtoneIntervalRef.current = null;
      }

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

  // ========== NAVIGATION HELPER ==========

  // Helper function to navigate to call screen
  // IMPORTANT: Must be defined BEFORE handleIncomingCall which depends on it
  const navigateToCallScreen = useCallback((call, caller) => {
    const callId = call?.id;
    console.log('[CallProvider] navigateToCallScreen called:', callId);

    // GUARD 1: Check if already navigated to this call (but allow retry if it's been a while)
    if (navigatedCallIdsRef.current.has(callId)) {
      const timeSinceLastNav = Date.now() - lastNavigationTimeRef.current;
      // Only skip if navigation happened very recently (within 1 second)
      if (timeSinceLastNav < 1000) {
        console.log('[CallProvider] Already navigated to call', callId, timeSinceLastNav, 'ms ago - SKIPPING');
        return false;
      }
      // Otherwise clear and allow retry
      console.log('[CallProvider] Clearing stale navigation entry for', callId);
      navigatedCallIdsRef.current.delete(callId);
    }

    // GUARD 2: Debounce - prevent rapid duplicate navigations (within 1 second, not 2)
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      console.log('[CallProvider] Navigation debounce active (' + (now - lastNavigationTimeRef.current) + 'ms) - SKIPPING');
      return false;
    }

    const navReady = navigationRef.current &&
      (typeof navigationRef.current.isReady === 'function'
        ? navigationRef.current.isReady()
        : true);

    console.log('[CallProvider] Navigation ready:', navReady);

    if (navReady) {
      // Mark this call as navigated BEFORE navigating
      navigatedCallIdsRef.current.add(callId);
      lastNavigationTimeRef.current = now;

      // CRITICAL: Dismiss CallKeep native banner before showing our IncomingCallScreen
      // This prevents duplicate UI (native banner + our fullscreen overlapping)
      if (callKeepService.available && callKeepService.getCurrentCallUUID() === callId) {
        console.log('[CallProvider] Dismissing CallKeep banner to show our IncomingCallScreen');
        // Report end to CallKeep so it dismisses the banner, but DON'T actually end the call
        callKeepService.reportEndCall(callId);
      }

      console.log('[CallProvider] >>> NAVIGATING to IncomingCall screen for:', callId);
      navigationRef.current.navigate('Call', {
        screen: 'IncomingCall',
        params: {
          call,
          caller,
        },
      });
      console.log('[CallProvider] Navigation triggered successfully');
      return true;
    } else {
      console.error('[CallProvider] Navigation not ready');
      return false;
    }
  }, []);

  // ========== INCOMING CALL HANDLERS ==========

  const handleIncomingCall = useCallback((call) => {
    const callId = call?.id;
    console.log('[CallProvider] *** handleIncomingCall called ***');
    console.log('[CallProvider] Call data:', JSON.stringify({
      id: callId,
      status: call?.status,
      call_type: call?.call_type,
      caller_id: call?.caller_id,
    }));

    // GUARD 1: Check if already navigated to this call
    // But only if the navigation actually happened recently (within 10 seconds)
    if (navigatedCallIdsRef.current.has(callId)) {
      const timeSinceLastNav = Date.now() - lastNavigationTimeRef.current;
      if (timeSinceLastNav < 10000) {
        console.log('[CallProvider] Call', callId, 'already handled', timeSinceLastNav, 'ms ago - SKIPPING');
        return;
      } else {
        // Clear stale entry
        console.log('[CallProvider] Clearing stale navigation tracking for', callId);
        navigatedCallIdsRef.current.delete(callId);
      }
    }

    // GUARD 2: Don't show if already handling a DIFFERENT call (use ref to avoid stale closure)
    const currentIncoming = incomingCallRef.current;
    if (currentIncoming && currentIncoming.id !== callId) {
      console.log('[CallProvider] Already handling different call', currentIncoming.id, '- SKIPPING');
      return;
    }

    // Check if CallKeep already answered this call (user answered from native UI)
    if (pendingCallKeepAnswerRef.current === callId) {
      console.log('[CallProvider] Call already answered via CallKeep');
      pendingCallKeepAnswerRef.current = null;

      // Navigate directly to call screen
      const caller = call.caller;
      navigateToCallScreen(call, caller);
      return;
    }

    // Set incoming call state (for tracking)
    console.log('[CallProvider] *** INCOMING CALL DETECTED ***');
    setIncomingCall(call);

    // Play ringtone and vibrate
    playRingtone();

    // NOTE: We ALWAYS navigate to IncomingCallScreen as the in-app UI
    // - On iOS background: CallKit shows native fullscreen, user answers there -> callback handles it
    // - On iOS foreground: CallKit may NOT show fullscreen (iOS 14+), so we need IncomingCallScreen
    // - On Android: ConnectionService doesn't show native UI, so we need IncomingCallScreen
    // If user answers from CallKit, the onAnswerCallback will handle direct navigation to InCall/VideoCall
    console.log('[CallProvider] Will navigate to IncomingCallScreen (works for both foreground and as fallback)');

    // Navigate directly to IncomingCall screen (Android or when CallKeep not available)
    // This is more reliable than showing a Modal overlay
    const caller = call.caller || {
      id: call.caller_id,
      display_name: 'Người gọi',
    };

    console.log('[CallProvider] Navigating to IncomingCall screen...');
    console.log('[CallProvider] Caller:', caller?.display_name);
    const navigated = navigateToCallScreen(call, caller);
    console.log('[CallProvider] Navigation result:', navigated ? 'SUCCESS' : 'SKIPPED');

    // If navigation failed, try again after a short delay (navigation might not be ready)
    if (!navigated) {
      console.log('[CallProvider] Navigation failed, retrying in 500ms...');
      setTimeout(() => {
        console.log('[CallProvider] Retry navigation...');
        navigateToCallScreen(call, caller);
      }, 500);
    }
  }, [playRingtone, navigateToCallScreen, callKeepReady]);

  const handleCallEnded = useCallback((call) => {
    console.log('[CallProvider] Call ended:', call?.id);

    // Clear navigation tracking for this call so user can receive new calls
    if (call?.id) {
      navigatedCallIdsRef.current.delete(call.id);
      console.log('[CallProvider] Cleared navigation tracking for call:', call.id);
    }

    // If this is the incoming call we're showing, hide overlay (use ref to avoid stale closure)
    if (incomingCallRef.current?.id === call?.id) {
      stopRingtone();
      setShowOverlay(false);
      setIncomingCall(null);
    }
  }, [stopRingtone]);

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
      navigateToCallScreen(incomingCall, caller);

      // Clear incoming call state
      setIncomingCall(null);
    } catch (error) {
      console.error('[CallProvider] Error accepting call:', error);
    }
  }, [incomingCall, user?.id, stopRingtone, navigateToCallScreen]);

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

  // ========== CALLKEEP SETUP ==========

  useEffect(() => {
    const setupCallKeep = async () => {
      if (!isAuthenticated || !user?.id) return;

      console.log('[CallProvider] Setting up CallKeep...');

      try {
        const success = await callKeepService.setup();
        setCallKeepReady(success);
        setDebugInfo(prev => ({ ...prev, callKeepAvailable: success }));

        if (!success) {
          console.log('[CallProvider] CallKeep setup failed or not available');
          return;
        }

        // Handle answer from native CallKeep UI
        // IMPORTANT: When user answers from CallKit (iOS), navigate DIRECTLY to InCall/VideoCall
        // Skip IncomingCallScreen since user already accepted from native UI
        callKeepService.setOnAnswerCallback(async (callUUID, callInfo) => {
          console.log('[CallProvider] CallKeep answer callback:', callUUID);
          console.log('[CallProvider] User answered from NATIVE CallKit UI');

          // Stop ringtone and vibration
          await stopRingtone();

          // Mark as navigated to prevent IncomingCallScreen from showing
          navigatedCallIdsRef.current.add(callUUID);

          let callToUse = incomingCallRef.current; // Use ref to avoid stale closure
          let callerToUse = null;

          // If we don't have call info yet, fetch it
          if (!callToUse || callToUse.id !== callUUID) {
            console.log('[CallProvider] Fetching call info for CallKeep answer...');
            const { call } = await callService.getCall(callUUID);
            if (call) {
              callToUse = call;
            } else {
              console.error('[CallProvider] Could not fetch call for CallKeep answer');
              return;
            }
          }

          // Get caller info
          callerToUse = callToUse.caller || callToUse.call_participants?.find(
            p => p.user_id !== user?.id
          )?.profiles || { id: callToUse.caller_id, display_name: 'Người gọi' };

          // Determine screen based on call type - SKIP IncomingCallScreen
          const isVideoCall = callToUse.call_type === 'video';
          const screenName = isVideoCall ? 'VideoCall' : 'InCall';

          console.log('[CallProvider] CallKeep navigating directly to:', screenName);

          // Navigate directly to InCall/VideoCall since user already answered
          const navReady = navigationRef.current &&
            (typeof navigationRef.current.isReady === 'function'
              ? navigationRef.current.isReady()
              : true);

          if (navReady) {
            navigationRef.current.navigate('Call', {
              screen: screenName,
              params: {
                call: callToUse,
                caller: callerToUse,
                isCaller: false,
                answeredFromCallKeep: true, // Flag to auto-initialize
              },
            });
          }

          setShowOverlay(false);
          setIncomingCall(null);
        });

        // Handle end/decline from native CallKeep UI
        callKeepService.setOnEndCallback(async (callUUID, callInfo) => {
          console.log('[CallProvider] CallKeep end callback:', callUUID);

          // Stop ringtone
          await stopRingtone();

          // If this matches our incoming call, decline it (use ref to avoid stale closure)
          if (incomingCallRef.current && incomingCallRef.current.id === callUUID) {
            await callService.declineCall(callUUID);
            setShowOverlay(false);
            setIncomingCall(null);
          } else {
            // Try to decline anyway in case we don't have local state
            try {
              await callService.declineCall(callUUID);
            } catch (e) {
              console.log('[CallProvider] Could not decline call:', e.message);
            }
          }
        });

        // Handle mute toggle from native CallKeep UI
        callKeepService.setOnMuteCallback((muted, callUUID) => {
          console.log('[CallProvider] CallKeep mute callback:', muted, callUUID);
          // This will be handled by the InCallScreen via context or direct service call
          // The webrtcService will be updated directly in useCall hook
        });

        console.log('[CallProvider] CallKeep setup complete');
      } catch (error) {
        console.error('[CallProvider] CallKeep setup error:', error);
        setCallKeepReady(false);
      }
    };

    setupCallKeep();

    return () => {
      console.log('[CallProvider] Cleaning up CallKeep');
      callKeepService.cleanup();
    };
  }, [isAuthenticated, user?.id, stopRingtone, navigateToCallScreen]);

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

  // Track time when app goes to background for subscription refresh
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // When app goes to background during incoming call (use ref to avoid stale closure)
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/) &&
        incomingCallRef.current
      ) {
        // Stop ringtone (keep vibration for background awareness)
        if (ringtoneRef.current) {
          await ringtoneRef.current.pauseAsync();
        }
      }

      // Track when app goes to background
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        backgroundTimeRef.current = Date.now();
        console.log('[CallProvider] App going to background');
      }

      // When app comes to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[CallProvider] App coming to foreground');

        // Resume ringtone if incoming call (use ref to avoid stale closure)
        if (incomingCallRef.current && ringtoneRef.current) {
          await ringtoneRef.current.playAsync();
        }

        // CRITICAL: Refresh subscription if app was in background for more than 5 seconds
        // This fixes one-sided connection issue after app is idle
        // Reduced from 30s to 5s because Supabase Realtime can become stale quickly
        const backgroundDuration = backgroundTimeRef.current
          ? Date.now() - backgroundTimeRef.current
          : 0;

        if (backgroundDuration > 5000 && user?.id && subscriptionRef.current) {
          console.log('[CallProvider] App was in background for', Math.round(backgroundDuration / 1000), 's - refreshing subscription');

          // Unsubscribe old channel
          if (typeof subscriptionRef.current === 'function') {
            subscriptionRef.current();
          }
          subscriptionRef.current = null;

          // Re-subscribe with fresh channel
          const newUnsubscribe = callService.subscribeToIncomingCalls(
            user.id,
            (call) => handleIncomingCall(call),
            (info) => {
              if (info.type === 'subscription') {
                setDebugInfo(prev => ({
                  ...prev,
                  subscriptionStatus: info.status,
                  lastStatusTime: info.timestamp,
                }));
              }
            }
          );
          subscriptionRef.current = newUnsubscribe;
          console.log('[CallProvider] Subscription refreshed successfully');
        }

        backgroundTimeRef.current = null;
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [user?.id, handleIncomingCall]);

  // ========== MONITOR INCOMING CALL STATUS ==========
  // Check if call still exists in database (handles cleanup/delete)

  useEffect(() => {
    if (!incomingCall) return;

    const checkCallStatus = async () => {
      try {
        const { call } = await callService.getCall(incomingCall.id);

        // Call no longer exists (was cleaned up or deleted)
        if (!call) {
          console.log('[CallProvider] Call no longer exists, stopping ringtone');
          await stopRingtone();
          setShowOverlay(false);
          setIncomingCall(null);
          return;
        }

        // Call ended or was declined/cancelled
        if (['ended', 'declined', 'cancelled', 'missed'].includes(call.status)) {
          console.log('[CallProvider] Call ended/cancelled:', call.status);
          await stopRingtone();
          setShowOverlay(false);
          setIncomingCall(null);
        }
      } catch (error) {
        console.log('[CallProvider] Error checking call, stopping ringtone:', error);
        await stopRingtone();
        setShowOverlay(false);
        setIncomingCall(null);
      }
    };

    // Check immediately and then every 2 seconds
    checkCallStatus();
    const interval = setInterval(checkCallStatus, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [incomingCall, stopRingtone]);

  // ========== CLEANUP ON UNMOUNT ==========

  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  // ========== MANUALLY TRIGGER INCOMING CALL (for push notification fallback) ==========

  const triggerIncomingCall = useCallback(async (callId) => {
    console.log('[CallProvider] Manually triggering incoming call:', callId);
    try {
      // Fetch call info with timeout
      console.log('[CallProvider] Fetching call info...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        // Budget: 4s JWT refresh + 8s query = 12s max → 15s with margin
        setTimeout(() => reject(new Error('getCall timeout after 15s')), 15000)
      );

      const result = await Promise.race([
        callService.getCall(callId),
        timeoutPromise
      ]);

      console.log('[CallProvider] getCall result:', result.success, result.call?.id, result.call?.status);

      if (!result.success || !result.call) {
        console.error('[CallProvider] Failed to get call:', result.error);
        // Try to navigate anyway with minimal info
        console.log('[CallProvider] Attempting navigation with minimal call info...');
        const minimalCall = { id: callId, status: 'ringing', call_type: 'video' };
        handleIncomingCall(minimalCall);
        return;
      }

      const call = result.call;
      // Show incoming call screen for any active call status
      // Don't be too strict - let the UI handle ended/declined calls gracefully
      const endedStatuses = ['ended', 'declined', 'cancelled', 'missed', 'failed'];
      if (!endedStatuses.includes(call.status)) {
        console.log('[CallProvider] Call is valid (status:', call.status, '), showing overlay');
        handleIncomingCall(call);
      } else {
        console.log('[CallProvider] Call already ended:', call.status, '- not showing incoming screen');
      }
    } catch (error) {
      console.error('[CallProvider] Error triggering incoming call:', error);
      // Try to navigate anyway with minimal info
      console.log('[CallProvider] Fallback: attempting navigation with minimal call info...');
      try {
        const minimalCall = { id: callId, status: 'ringing', call_type: 'video' };
        handleIncomingCall(minimalCall);
      } catch (navError) {
        console.error('[CallProvider] Fallback navigation also failed:', navError);
      }
    }
  }, [handleIncomingCall]);

  // Register global callback so InAppNotificationContext can trigger incoming call overlay
  useEffect(() => {
    console.log('[CallProvider] Registering global incoming call handler');
    registerIncomingCallHandler(triggerIncomingCall);

    return () => {
      console.log('[CallProvider] Unregistering global incoming call handler');
      registerIncomingCallHandler(null);
    };
  }, [triggerIncomingCall]);

  // Log overlay state changes for debugging
  useEffect(() => {
    console.log('[CallProvider] === OVERLAY STATE CHANGED ===');
    console.log('[CallProvider] showOverlay:', showOverlay);
    console.log('[CallProvider] incomingCall:', incomingCall?.id, incomingCall?.status);
    console.log('[CallProvider] caller:', incomingCall?.caller?.display_name);
  }, [showOverlay, incomingCall]);

  // ========== ACTIVE CALL MANAGEMENT ==========

  const setActiveCall = useCallback((callInfo) => {
    console.log('[CallProvider] Setting active call:', callInfo?.call?.id);
    setActiveCallState(callInfo);
  }, []);

  const clearActiveCall = useCallback(() => {
    console.log('[CallProvider] Clearing active call');
    setActiveCallState(null);
  }, []);

  const returnToActiveCall = useCallback(() => {
    if (!activeCall) return;
    const { call, otherUser, isCaller, screenName } = activeCall;
    const navReady = navigationRef.current &&
      (typeof navigationRef.current.isReady === 'function'
        ? navigationRef.current.isReady()
        : true);

    if (navReady) {
      console.log('[CallProvider] Returning to active call:', screenName);
      navigationRef.current.navigate('Call', {
        screen: screenName,
        params: {
          call,
          caller: isCaller ? undefined : otherUser,
          callee: isCaller ? otherUser : undefined,
          isCaller,
        },
      });
    }
  }, [activeCall]);

  // ========== CONTEXT VALUE ==========

  const contextValue = {
    incomingCall,
    showOverlay,
    acceptCall: handleAccept,
    declineCall: handleDecline,
    // CallKeep availability
    callKeepReady,
    // Debug info for troubleshooting call issues
    debugInfo,
    // Manual trigger for push notification fallback
    triggerIncomingCall,
    // Active call management (for global floating indicator)
    activeCall,
    setActiveCall,
    clearActiveCall,
    returnToActiveCall,
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

      {/* Global Active Call Banner - shows when user navigated away from call screen */}
      {activeCall && (
        <ActiveCallBanner
          activeCall={activeCall}
          onPress={returnToActiveCall}
          onEndCall={() => {
            clearActiveCall();
          }}
        />
      )}
    </CallContext.Provider>
  );
}

/**
 * ActiveCallBanner - Floating banner shown when an active call is minimized
 * Tap to return to call screen
 */
const ActiveCallBanner = ({ activeCall, onPress, onEndCall }) => {
  const { call, otherUser } = activeCall;
  const isVideo = call?.call_type === 'video';

  return (
    <TouchableOpacity
      style={bannerStyles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={bannerStyles.iconContainer}>
        {isVideo ? (
          <Video size={16} color="#fff" />
        ) : (
          <Phone size={16} color="#fff" />
        )}
      </View>
      <Text style={bannerStyles.text} numberOfLines={1}>
        {otherUser?.display_name || 'Cuộc gọi đang diễn ra'}
      </Text>
      <View style={bannerStyles.tapHint}>
        <Text style={bannerStyles.tapText}>Quay lại</Text>
        <ChevronRight size={14} color={COLORS.textPrimary} />
      </View>
    </TouchableOpacity>
  );
};

const bannerStyles = RNStyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#fff',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tapText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export default CallContext;
