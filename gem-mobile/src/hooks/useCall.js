/**
 * useCall Hook
 * Main hook for call state management
 *
 * REQUIREMENTS:
 * - react-native-webrtc must be installed
 * - App must be built with expo-dev-client (not Expo Go)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration, AppState } from 'react-native';
import { Audio } from 'expo-av';
import { callSignalingService } from '../services/callSignalingService';
import { callService } from '../services/callService';
import { webrtcService } from '../services/webrtcService';
import {
  CALL_STATUS,
  CALL_TYPE,
  CONNECTION_QUALITY,
  VIBRATION_PATTERNS,
} from '../constants/callConstants';

// Global tracking to prevent multiple useCall instances for the same call
const activeCallInstances = new Map(); // callId -> { instanceId, timestamp }

/**
 * Hook for managing call state
 * @param {Object} options
 * @param {Object} options.call - Call object (from navigation params)
 * @param {boolean} options.isCaller - Whether current user is the caller
 * @param {boolean} options.autoInitialize - Whether to auto-initialize on mount (default: true for caller, false for callee)
 * @param {Function} options.onCallEnded - Callback when call ends
 * @returns {Object} Call state and methods
 */
export const useCall = ({ call, isCaller = false, autoInitialize, onCallEnded }) => {
  // For callee, don't auto-initialize - wait for user to press Accept
  // For caller, auto-initialize to send offer immediately
  const shouldAutoInit = autoInitialize !== undefined ? autoInitialize : isCaller;
  // ========== STATE ==========
  const [callState, setCallState] = useState(CALL_STATUS.INITIATING);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call?.call_type === CALL_TYPE.VIDEO);
  const [connectionQuality, setConnectionQuality] = useState(CONNECTION_QUALITY.GOOD);
  const [remoteIsMuted, setRemoteIsMuted] = useState(false);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // ========== REFS ==========
  const userId = useRef(null);
  const isInitialized = useRef(false);
  const offerReceived = useRef(false);
  const readyRetryInterval = useRef(null);
  // Unique instance ID for this hook instance
  const instanceId = useRef(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  // Ringback tone for caller while waiting
  const ringbackSoundRef = useRef(null);
  // Prevent multiple simultaneous answer attempts
  const answeringRef = useRef(false);

  // ========== RINGBACK TONE ==========

  /**
   * Play ringback tone for caller while waiting for answer
   * Uses chime.mp3 as a placeholder ringback tone
   */
  const playRingbackTone = useCallback(async () => {
    try {
      // Stop any existing ringback
      if (ringbackSoundRef.current) {
        await ringbackSoundRef.current.stopAsync();
        await ringbackSoundRef.current.unloadAsync();
        ringbackSoundRef.current = null;
      }

      // Configure audio for ringback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Use chime.mp3 as ringback tone (loops every ~2 seconds)
      // For a proper ringback, replace with a ringback.mp3 file
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/Ritual_sounds/chime.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.4,
        }
      );

      ringbackSoundRef.current = sound;
      console.log('[useCall] Ringback tone started (using chime)');
    } catch (err) {
      // No ringback sound available, that's OK - caller will wait silently
      console.log('[useCall] Could not play ringback tone:', err.message);
    }
  }, []);

  /**
   * Stop ringback tone
   */
  const stopRingbackTone = useCallback(async () => {
    try {
      if (ringbackSoundRef.current) {
        await ringbackSoundRef.current.stopAsync();
        await ringbackSoundRef.current.unloadAsync();
        ringbackSoundRef.current = null;
        console.log('[useCall] Ringback tone stopped');
      }
    } catch (err) {
      console.log('[useCall] Error stopping ringback:', err.message);
    }
  }, []);

  // ========== INITIALIZATION ==========

  /**
   * Initialize WebRTC and signaling for the call
   */
  const initializeCall = useCallback(async () => {
    const callId = call?.id;
    console.log('[useCall] initializeCall called for call:', callId, 'instance:', instanceId.current);

    // GUARD 1: Already initialized in this instance
    if (isInitialized.current) {
      console.log('[useCall] Already initialized in this instance - SKIPPING');
      return;
    }

    // GUARD 2: Check if another instance is already handling this call
    const existingInstance = activeCallInstances.get(callId);
    if (existingInstance && existingInstance.instanceId !== instanceId.current) {
      const age = Date.now() - existingInstance.timestamp;
      // Only consider existing instance if it's less than 30 seconds old
      if (age < 30000) {
        console.log('[useCall] Another instance', existingInstance.instanceId, 'is handling call', callId, '- SKIPPING');
        console.log('[useCall] Existing instance age:', age, 'ms');
        return;
      } else {
        console.log('[useCall] Existing instance is stale (', age, 'ms), taking over');
      }
    }

    // Register this instance as the active handler for this call
    activeCallInstances.set(callId, {
      instanceId: instanceId.current,
      timestamp: Date.now(),
    });
    console.log('[useCall] Registered as active handler for call:', callId);

    try {
      console.log('[useCall] Initializing call...');

      // Check if WebRTC is available
      if (!webrtcService.isAvailable) {
        throw new Error('Tính năng gọi điện chưa khả dụng. Vui lòng cập nhật ứng dụng.');
      }

      // Get current user
      const { data: { user } } = await (await import('../services/supabase')).supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');
      userId.current = user.id;

      // Initialize WebRTC local stream
      const stream = await webrtcService.initLocalStream(call?.call_type === CALL_TYPE.VIDEO);
      setLocalStream(stream);

      // Create peer connection
      webrtcService.createPeerConnection();

      // Setup WebRTC callbacks
      webrtcService.onRemoteStream = (stream) => {
        console.log('[useCall] Remote stream received');
        setRemoteStream(stream);
      };

      webrtcService.onConnectionStateChange = (state) => {
        console.log('[useCall] Connection state changed:', state);
        switch (state) {
          case 'connected':
            setCallState(CALL_STATUS.CONNECTED);
            // CRITICAL: Cancel any ongoing vibration (e.g., incoming call vibration)
            Vibration.cancel();
            // Short feedback vibrate to indicate connection
            Vibration.vibrate(VIBRATION_PATTERNS.CALL_CONNECTED);
            callService.markConnected(call.id);
            // Stop READY retry when connected
            if (readyRetryInterval.current) {
              clearInterval(readyRetryInterval.current);
              readyRetryInterval.current = null;
              console.log('[useCall] Stopped READY retry - call connected');
            }
            break;
          case 'disconnected':
          case 'reconnecting':
            setCallState(CALL_STATUS.RECONNECTING);
            break;
          case 'failed':
            setCallState(CALL_STATUS.FAILED);
            setError('Kết nối thất bại');
            break;
        }
      };

      webrtcService.onConnectionQualityChange = (quality) => {
        setConnectionQuality(quality);
      };

      webrtcService.onError = (type, message) => {
        console.error('[useCall] WebRTC error:', type, message);
        setError(message);
      };

      webrtcService.onIceCandidate = async (candidate) => {
        await callSignalingService.sendIceCandidate(candidate);
      };

      // For callee: Get pending offer FIRST while early signaling is still active
      // This captures any offer that came in before we pressed Accept
      let pendingOffer = null;
      if (!isCaller) {
        pendingOffer = callService.getPendingOffer();
        console.log('[useCall] *** Pending offer:', pendingOffer ? 'FOUND' : 'NOT FOUND');

        // CRITICAL: Stop early signaling BEFORE subscribing to regular signaling
        // Both use the same channel name, so we must release it first
        console.log('[useCall] *** Stopping early signaling to release channel...');
        await callService.stopEarlySignaling();
        console.log('[useCall] *** Early signaling stopped, channel released');
      }

      // NOW subscribe to signaling channel (channel name is now available)
      console.log('[useCall] *** Subscribing to signaling channel...');
      await callSignalingService.subscribe(call.id, user.id);
      console.log('[useCall] *** Subscribed to signaling channel');

      // Setup signaling callbacks
      callSignalingService.onOffer = async (offer, senderId) => {
        console.log('[useCall] *** RECEIVED OFFER via signaling from:', senderId);

        // Stop READY retry since we got the offer
        if (readyRetryInterval.current) {
          clearInterval(readyRetryInterval.current);
          readyRetryInterval.current = null;
          console.log('[useCall] *** Stopped READY retry - offer received');
        }

        console.log('[useCall] *** Creating answer...');
        const answer = await webrtcService.handleOffer(offer);

        // handleOffer returns null if connection is already in stable state
        if (answer) {
          offerReceived.current = true;
          console.log('[useCall] *** Sending answer...');
          await callSignalingService.sendAnswer(answer);
          setCallState(CALL_STATUS.CONNECTING);
          console.log('[useCall] *** State set to CONNECTING');
        } else {
          console.log('[useCall] *** handleOffer returned null (already stable), skipping answer');
        }
      };

      callSignalingService.onAnswer = async (answer) => {
        console.log('[useCall] Received answer');
        await webrtcService.handleAnswer(answer);
        setCallState(CALL_STATUS.CONNECTING);
      };

      callSignalingService.onIceCandidate = async (candidate) => {
        await webrtcService.addIceCandidate(candidate);
      };

      callSignalingService.onEnd = (reason) => {
        console.log('[useCall] Call ended by peer:', reason);
        handleCallEnded(reason);
      };

      callSignalingService.onMuteChange = (muted, senderId) => {
        console.log('[useCall] Remote mute changed:', muted);
        setRemoteIsMuted(muted);
      };

      callSignalingService.onVideoChange = (enabled, senderId) => {
        console.log('[useCall] Remote video changed:', enabled);
        setRemoteVideoEnabled(enabled);
      };

      callSignalingService.onBusy = () => {
        console.log('[useCall] Remote user is busy');
        setCallState(CALL_STATUS.BUSY);
        setError('Người nhận đang bận');
      };

      // If caller, create offer and setup ready handler
      if (isCaller) {
        setCallState(CALL_STATUS.RINGING);
        const offer = await webrtcService.createOffer();

        // Store offer for potential resend
        const storedOffer = offer;
        const callee = call.participants?.find(p => p.role === 'callee');

        // Handle READY signal from callee - resend offer (only if not already connected)
        callSignalingService.onReady = async (senderId) => {
          console.log('[useCall] *** Callee ready signal received from:', senderId);

          // Don't resend offer if already connected/stable
          const signalingState = webrtcService.peerConnection?.signalingState;
          const connectionState = webrtcService.peerConnection?.connectionState;
          console.log('[useCall] *** signalingState:', signalingState, 'connectionState:', connectionState);

          if (signalingState === 'stable' || connectionState === 'connected') {
            console.log('[useCall] *** Already connected/stable, ignoring READY signal');
            return;
          }

          console.log('[useCall] *** call.participants:', JSON.stringify(call.participants));
          console.log('[useCall] *** callee:', callee ? callee.user_id : 'undefined');
          if (callee) {
            console.log('[useCall] *** RESENDING OFFER to callee:', callee.user_id);
            await callSignalingService.sendOffer(storedOffer, callee.user_id);
            console.log('[useCall] *** Offer resent successfully');
          } else {
            console.error('[useCall] *** ERROR: callee is undefined, cannot resend offer!');
          }
        };

        // Small delay to give callee time to set up early signaling
        // This improves reliability when callee receives the call notification
        console.log('[useCall] *** Waiting 1500ms for callee to set up early signaling...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if already connected (callee might have answered via READY signal resend)
        const connState = webrtcService.peerConnection?.connectionState;
        if (connState === 'connected') {
          console.log('[useCall] *** Already connected, skipping initial offer');
        } else if (callee) {
          console.log('[useCall] *** Sending initial offer to callee:', callee.user_id);
          await callSignalingService.sendOffer(offer, callee.user_id);
          console.log('[useCall] *** Initial offer sent successfully');
        } else {
          console.error('[useCall] *** ERROR: Cannot send initial offer - callee is undefined!');
          console.log('[useCall] *** call.participants:', JSON.stringify(call.participants));
        }
      } else {
        // Callee: Use pending offer that was already fetched before stopping early signaling
        // (pendingOffer variable was set at the beginning of initializeCall for callee)
        console.log('[useCall] *** Callee processing, pendingOffer:', pendingOffer ? 'FOUND' : 'NOT FOUND');

        if (pendingOffer) {
          console.log('[useCall] *** Processing pending offer from early signaling!');
          const answer = await webrtcService.handleOffer(pendingOffer.offer);
          // handleOffer returns null if connection is already stable
          if (answer) {
            offerReceived.current = true;
            console.log('[useCall] *** Answer created, sending...');
            await callSignalingService.sendAnswer(answer);
            setCallState(CALL_STATUS.CONNECTING);
            console.log('[useCall] *** State set to CONNECTING');
          } else {
            console.log('[useCall] *** handleOffer returned null (already stable)');
          }
        } else {
          // No pending offer - send READY signal to tell caller we're listening
          console.log('[useCall] *** No pending offer, sending READY signal');
          await callSignalingService.sendReady();

          // Start retry interval - keep sending READY until offer is received
          // This helps when caller (iOS) doesn't have READY handler or missed the first one
          // IMPORTANT: Add multiple guards to prevent spam after call ends
          let retryCount = 0;
          const maxRetries = 10; // Max 30 seconds of retrying
          const intervalId = setInterval(async () => {
            retryCount++;

            // Helper function to stop the interval
            const stopInterval = (reason) => {
              console.log('[useCall] *** Stopping READY retry -', reason);
              clearInterval(intervalId);
              if (readyRetryInterval.current === intervalId) {
                readyRetryInterval.current = null;
              }
            };

            // GUARD 1: Stop if offer received
            if (offerReceived.current) {
              stopInterval('offer received');
              return;
            }

            // GUARD 2: Stop if call ended or not initialized
            if (!isInitialized.current) {
              stopInterval('not initialized');
              return;
            }

            // GUARD 3: Stop if max retries reached
            if (retryCount >= maxRetries) {
              stopInterval('max retries reached');
              return;
            }

            // GUARD 4: Stop if no signaling channel
            if (!callSignalingService.hasActiveChannel()) {
              stopInterval('no signaling channel');
              return;
            }

            console.log('[useCall] *** Retrying READY signal (' + retryCount + '/' + maxRetries + ')...');
            const sent = await callSignalingService.sendReady();
            if (!sent) {
              stopInterval('sendReady failed');
            }
          }, 3000); // Retry every 3 seconds

          readyRetryInterval.current = intervalId;
        }
      }

      isInitialized.current = true;
      console.log('[useCall] Call initialized successfully');

    } catch (err) {
      console.error('[useCall] Initialize error:', err);
      setError(err.message);
      setCallState(CALL_STATUS.FAILED);
    }
  }, [call, isCaller]);

  // ========== HANDLERS ==========

  /**
   * Handle call ended
   */
  const handleCallEnded = useCallback(async (reason) => {
    console.log('[useCall] ========================================');
    console.log('[useCall] Handling call ended:', reason);
    console.log('[useCall] instance:', instanceId.current);
    console.log('[useCall] ========================================');

    setCallState(CALL_STATUS.ENDED);
    Vibration.vibrate(VIBRATION_PATTERNS.CALL_ENDED);

    // Stop ringback tone if playing (for caller)
    stopRingbackTone();

    // Clear READY retry interval IMMEDIATELY
    if (readyRetryInterval.current) {
      clearInterval(readyRetryInterval.current);
      readyRetryInterval.current = null;
      console.log('[useCall] Cleared READY retry interval');
    }

    // Reset ALL refs to prevent state leakage
    offerReceived.current = false;
    isInitialized.current = false;
    answeringRef.current = false;

    // Clear from global tracking IMMEDIATELY
    const callId = call?.id;
    if (callId) {
      activeCallInstances.delete(callId);
      console.log('[useCall] Cleared global tracking for call:', callId);
    }

    // Cleanup WebRTC first (sync)
    webrtcService.cleanup();

    // Cleanup signaling (don't await - let it run in background)
    callSignalingService.cleanup().catch(err => {
      console.log('[useCall] Signaling cleanup error (non-critical):', err.message);
    });

    // IMPORTANT: Clear callService state to allow new calls
    // Pass callId to also cleanup database records
    callService.clearState(callId).catch(err => {
      console.log('[useCall] CallService cleanup error (non-critical):', err.message);
    });

    // Callback
    onCallEnded?.(reason);
  }, [call?.id, onCallEnded, stopRingbackTone]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    webrtcService.toggleMute(newMuted);
    await callSignalingService.sendMuteChange(newMuted);

    if (call?.id) {
      await callService.toggleMute(call.id, newMuted);
    }
  }, [isMuted, call?.id]);

  /**
   * Toggle speaker
   */
  const toggleSpeaker = useCallback(async () => {
    const newSpeaker = !isSpeakerOn;
    setIsSpeakerOn(newSpeaker);

    await webrtcService.toggleSpeaker(newSpeaker);

    if (call?.id) {
      await callService.toggleSpeaker(call.id, newSpeaker);
    }
  }, [isSpeakerOn, call?.id]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(async () => {
    const newVideo = !isVideoEnabled;
    setIsVideoEnabled(newVideo);

    webrtcService.toggleVideo(newVideo);
    await callSignalingService.sendVideoChange(newVideo);

    if (call?.id) {
      await callService.toggleVideo(call.id, newVideo);
    }
  }, [isVideoEnabled, call?.id]);

  /**
   * Switch camera
   */
  const switchCamera = useCallback(async () => {
    await webrtcService.switchCamera();
  }, []);

  /**
   * End the call
   */
  const endCall = useCallback(async () => {
    if (!call?.id) return;

    // CRITICAL: Clear global tracking IMMEDIATELY before any async operations
    activeCallInstances.delete(call.id);
    console.log('[useCall] Cleared activeCallInstances immediately for:', call.id);

    try {
      await callService.endCall(call.id);
      handleCallEnded('user_ended');
    } catch (err) {
      console.error('[useCall] End call error:', err);
      handleCallEnded('error');
    }
  }, [call?.id, handleCallEnded]);

  /**
   * Answer the call (for callee)
   */
  const answerCall = useCallback(async () => {
    console.log('[useCall] ========================================');
    console.log('[useCall] *** answerCall called');
    console.log('[useCall] *** call?.id:', call?.id);
    console.log('[useCall] *** isInitialized:', isInitialized.current);
    console.log('[useCall] *** answeringRef:', answeringRef.current);
    console.log('[useCall] ========================================');

    if (!call?.id) {
      console.log('[useCall] *** answerCall: No call ID, returning');
      return;
    }

    // GUARD: Prevent multiple simultaneous answer attempts
    if (answeringRef.current) {
      console.log('[useCall] *** answerCall: Already answering, returning');
      return;
    }
    answeringRef.current = true;

    try {
      // CRITICAL: Clear any lingering state from previous calls before answering
      // This prevents conflicts when answering a new call quickly after ending one
      if (readyRetryInterval.current) {
        console.log('[useCall] *** Clearing lingering READY interval before answer');
        clearInterval(readyRetryInterval.current);
        readyRetryInterval.current = null;
      }

      // DON'T force reset signaling here - early signaling might still be active
      // and resetting would cause channel conflicts
      console.log('[useCall] *** Skipping signaling reset (early signaling may be active)');

      console.log('[useCall] *** Answering call:', call.id);
      const result = await callService.answerCall(call.id);
      console.log('[useCall] *** answerCall result:', result);

      if (!result.success && !result.alreadyAnswering) {
        console.error('[useCall] *** Answer call failed:', result.error);
        setError(result.error);
        answeringRef.current = false;
        return;
      }

      // ALWAYS initialize - force reinitialize to ensure clean state
      console.log('[useCall] *** Force initializing call...');
      isInitialized.current = false; // Reset to force initialize
      offerReceived.current = false; // Reset offer tracking
      await initializeCall();

      console.log('[useCall] *** answerCall completed successfully');
    } catch (err) {
      console.error('[useCall] *** Answer call error:', err);
      setError(err.message);
    } finally {
      // Reset answering flag after a delay to prevent rapid re-attempts
      setTimeout(() => {
        answeringRef.current = false;
      }, 2000);
    }
  }, [call?.id, initializeCall]);

  /**
   * Decline the call (for callee)
   */
  const declineCall = useCallback(async () => {
    if (!call?.id) return;

    // CRITICAL: Clear global tracking IMMEDIATELY before any async operations
    activeCallInstances.delete(call.id);
    console.log('[useCall] Cleared activeCallInstances immediately for:', call.id);

    try {
      await callService.declineCall(call.id);
      handleCallEnded('declined');
    } catch (err) {
      console.error('[useCall] Decline call error:', err);
      handleCallEnded('error');
    }
  }, [call?.id, handleCallEnded]);

  /**
   * Cancel the call (for caller)
   */
  const cancelCall = useCallback(async () => {
    if (!call?.id) return;

    // CRITICAL: Clear global tracking IMMEDIATELY before any async operations
    // This prevents "already in a call" error when user quickly makes another call
    activeCallInstances.delete(call.id);
    console.log('[useCall] Cleared activeCallInstances immediately for:', call.id);

    try {
      await callService.cancelCall(call.id);
      handleCallEnded('cancelled');
    } catch (err) {
      console.error('[useCall] Cancel call error:', err);
      // Still call handleCallEnded to clean up local state
      handleCallEnded('error');
    }
  }, [call?.id, handleCallEnded]);

  // ========== EFFECTS ==========

  // Initialize on mount (only for caller, callee waits for Accept button)
  useEffect(() => {
    const callId = call?.id;
    const myInstanceId = instanceId.current;
    console.log('[useCall] useEffect mount, callId:', callId, 'instance:', myInstanceId, 'shouldAutoInit:', shouldAutoInit);

    // Check if WebRTC connection already exists (navigated from another call screen)
    const existingConnection = webrtcService.peerConnection;
    const connectionState = existingConnection?.connectionState;
    const iceState = existingConnection?.iceConnectionState;
    console.log('[useCall] Existing connection check - connectionState:', connectionState, 'iceState:', iceState);

    if (existingConnection && (connectionState === 'connected' || iceState === 'connected' || iceState === 'completed')) {
      console.log('[useCall] REUSING existing WebRTC connection (navigated from previous screen)');
      isInitialized.current = true;

      // Register this instance as active handler
      activeCallInstances.set(callId, {
        instanceId: myInstanceId,
        timestamp: Date.now(),
      });

      // Set connected state
      setCallState(CALL_STATUS.CONNECTED);

      // Get existing streams
      if (webrtcService.localStream) {
        setLocalStream(webrtcService.localStream);
      }
      if (webrtcService.remoteStream) {
        setRemoteStream(webrtcService.remoteStream);
      }

      // Re-attach callbacks
      webrtcService.onRemoteStream = (stream) => {
        console.log('[useCall] Remote stream received (reattached)');
        setRemoteStream(stream);
      };
      webrtcService.onConnectionStateChange = (state) => {
        console.log('[useCall] Connection state changed (reattached):', state);
        switch (state) {
          case 'connected':
            setCallState(CALL_STATUS.CONNECTED);
            break;
          case 'disconnected':
          case 'reconnecting':
            setCallState(CALL_STATUS.RECONNECTING);
            break;
          case 'failed':
            setCallState(CALL_STATUS.FAILED);
            setError('Kết nối thất bại');
            break;
        }
      };
      return;
    }

    if (callId && shouldAutoInit) {
      console.log('[useCall] Auto-initializing (caller or explicit autoInitialize)');
      initializeCall();
    } else if (callId && !shouldAutoInit) {
      console.log('[useCall] Waiting for user to Accept call before initializing');
    }

    return () => {
      console.log('[useCall] useEffect cleanup, callId:', callId, 'instance:', myInstanceId);

      // Clear READY retry interval
      if (readyRetryInterval.current) {
        clearInterval(readyRetryInterval.current);
        readyRetryInterval.current = null;
      }

      // Only cleanup WebRTC if this instance is the active handler
      const activeInstance = activeCallInstances.get(callId);
      if (activeInstance && activeInstance.instanceId === myInstanceId) {
        // CRITICAL: Don't cleanup if connection is still active!
        // This prevents destroying connection when navigating between call screens
        const connectionState = webrtcService.peerConnection?.connectionState;
        const iceState = webrtcService.peerConnection?.iceConnectionState;
        console.log('[useCall] Cleanup check - connectionState:', connectionState, 'iceState:', iceState);

        if (connectionState === 'connected' || iceState === 'connected' || iceState === 'completed') {
          console.log('[useCall] Connection is ACTIVE - NOT cleaning up WebRTC (navigating between screens)');
          // Keep the instance registered so new screen can take over
          // Don't cleanup WebRTC or signaling
          return;
        }

        console.log('[useCall] This instance is active handler, performing full cleanup');
        activeCallInstances.delete(callId);
        webrtcService.cleanup();
        callSignalingService.cleanup();
        // Also clear callService state to prevent "busy" errors
        callService.clearState(callId).catch(() => {});
      } else {
        console.log('[useCall] This instance is NOT active handler, skipping WebRTC cleanup');
        console.log('[useCall] Active instance:', activeInstance?.instanceId);
      }
    };
  }, [call?.id, initializeCall]);

  // Monitor call status from database for timeout/missed/ended
  // This handles cases where signaling doesn't work or timeout fires
  useEffect(() => {
    if (!call?.id || callState === CALL_STATUS.ENDED || callState === CALL_STATUS.CONNECTED) {
      return;
    }

    const checkCallStatus = async () => {
      try {
        const { call: latestCall } = await callService.getCall(call.id);

        if (latestCall) {
          const status = latestCall.status;

          // Check if call has ended by various means
          if (
            status === CALL_STATUS.MISSED ||
            status === CALL_STATUS.DECLINED ||
            status === CALL_STATUS.CANCELLED ||
            status === CALL_STATUS.ENDED ||
            status === CALL_STATUS.FAILED
          ) {
            console.log('[useCall] Call status changed to:', status);
            handleCallEnded(latestCall.end_reason || status);
          }
        }
      } catch (err) {
        console.log('[useCall] Check call status error:', err.message);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(checkCallStatus, 3000);

    // Also check immediately
    checkCallStatus();

    return () => clearInterval(interval);
  }, [call?.id, callState, handleCallEnded]);

  // Play ringback tone when caller is waiting (RINGING state)
  // Stop when connected or call ends
  useEffect(() => {
    // Only play ringback for CALLER when in RINGING state
    if (isCaller && callState === CALL_STATUS.RINGING) {
      playRingbackTone();
    } else {
      // Stop ringback when connected or call ends
      stopRingbackTone();
    }

    return () => {
      stopRingbackTone();
    };
  }, [isCaller, callState, playRingbackTone, stopRingbackTone]);

  // CRITICAL: Handle app state changes to fix one-sided connection after idle
  // When app comes back from background, check if we need to re-establish signaling
  useEffect(() => {
    const callId = call?.id;
    if (!callId || !isInitialized.current) return;

    let backgroundTime = null;
    let appStateRef = 'active';

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Track when app goes to background
      if (appStateRef === 'active' && nextAppState.match(/inactive|background/)) {
        backgroundTime = Date.now();
        console.log('[useCall] App going to background');
      }

      // When app comes back to foreground
      if (appStateRef.match(/inactive|background/) && nextAppState === 'active' && backgroundTime) {
        const backgroundDuration = Date.now() - backgroundTime;
        console.log('[useCall] App came to foreground after', Math.round(backgroundDuration / 1000), 's');

        // Check connection state
        const connectionState = webrtcService.peerConnection?.connectionState;
        const iceState = webrtcService.peerConnection?.iceConnectionState;
        const signalingState = webrtcService.peerConnection?.signalingState;

        console.log('[useCall] Connection check - connectionState:', connectionState, 'iceState:', iceState, 'signalingState:', signalingState);

        // If connection is already established, don't do anything
        if (connectionState === 'connected' || iceState === 'connected' || iceState === 'completed') {
          console.log('[useCall] Connection is already established, no action needed');
          backgroundTime = null;
          appStateRef = nextAppState;
          return;
        }

        // If app was in background for more than 30 seconds AND connection is not established
        if (backgroundDuration > 30000) {
          console.log('[useCall] Connection not established after long background, attempting to re-establish...');

          try {
            const { data: { user } } = await (await import('../services/supabase')).supabase.auth.getUser();
            if (user) {
              // Only re-subscribe to signaling, don't touch WebRTC peer connection
              await callSignalingService.cleanup();
              await callSignalingService.subscribe(callId, user.id);

              // Re-setup signaling callbacks
              callSignalingService.onOffer = async (offer, senderId) => {
                console.log('[useCall] *** RECEIVED OFFER via signaling (after reconnect)');
                const answer = await webrtcService.handleOffer(offer);
                // handleOffer returns null if already in stable state
                if (answer) {
                  offerReceived.current = true;
                  await callSignalingService.sendAnswer(answer);
                  setCallState(CALL_STATUS.CONNECTING);
                } else {
                  console.log('[useCall] handleOffer returned null (connection already stable)');
                }
              };

              callSignalingService.onAnswer = async (answer) => {
                console.log('[useCall] Received answer (after reconnect)');
                await webrtcService.handleAnswer(answer);
                setCallState(CALL_STATUS.CONNECTING);
              };

              callSignalingService.onIceCandidate = async (candidate) => {
                await webrtcService.addIceCandidate(candidate);
              };

              callSignalingService.onEnd = (reason) => {
                console.log('[useCall] Call ended by peer (after reconnect)');
                handleCallEnded(reason);
              };

              // Only send READY signal if we're callee and haven't received offer yet
              if (!isCaller && !offerReceived.current) {
                console.log('[useCall] Sending READY signal after background...');
                await callSignalingService.sendReady();
              }

              console.log('[useCall] Signaling re-established successfully');
            }
          } catch (err) {
            console.error('[useCall] Failed to re-establish signaling:', err);
          }
        }

        backgroundTime = null;
      }

      appStateRef = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [call?.id, isCaller, handleCallEnded]);

  // ========== RETURN ==========

  return {
    // State
    callState,
    isMuted,
    isSpeakerOn,
    isVideoEnabled,
    connectionQuality,
    remoteIsMuted,
    remoteVideoEnabled,
    error,
    localStream,
    remoteStream,

    // Methods
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    switchCamera,
    endCall,
    answerCall,
    declineCall,
    cancelCall,
    initializeCall,

    // Computed
    isConnected: callState === CALL_STATUS.CONNECTED,
    isRinging: callState === CALL_STATUS.RINGING,
    isConnecting: callState === CALL_STATUS.CONNECTING,
    isReconnecting: callState === CALL_STATUS.RECONNECTING,
    isEnded: callState === CALL_STATUS.ENDED,
    isFailed: callState === CALL_STATUS.FAILED,
  };
};

export default useCall;
