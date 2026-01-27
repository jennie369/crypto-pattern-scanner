/**
 * useCall Hook
 * Main hook for call state management
 *
 * REQUIREMENTS:
 * - react-native-webrtc must be installed
 * - App must be built with expo-dev-client (not Expo Go)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { callSignalingService } from '../services/callSignalingService';
import { callService } from '../services/callService';
import { webrtcService } from '../services/webrtcService';
import {
  CALL_STATUS,
  CALL_TYPE,
  CONNECTION_QUALITY,
  VIBRATION_PATTERNS,
} from '../constants/callConstants';

/**
 * Hook for managing call state
 * @param {Object} options
 * @param {Object} options.call - Call object (from navigation params)
 * @param {boolean} options.isCaller - Whether current user is the caller
 * @param {Function} options.onCallEnded - Callback when call ends
 * @returns {Object} Call state and methods
 */
export const useCall = ({ call, isCaller = false, onCallEnded }) => {
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

  // ========== INITIALIZATION ==========

  /**
   * Initialize WebRTC and signaling for the call
   */
  const initializeCall = useCallback(async () => {
    if (isInitialized.current) return;

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
            Vibration.vibrate(VIBRATION_PATTERNS.CALL_CONNECTED);
            callService.markConnected(call.id);
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

      // Stop early signaling before regular subscription (avoid channel conflicts)
      // Early signaling was started when incoming call was detected
      if (!isCaller) {
        console.log('[useCall] *** Stopping early signaling before regular subscription...');
        await callService.stopEarlySignaling();
        console.log('[useCall] *** Early signaling stopped');
      }

      // Subscribe to signaling channel
      console.log('[useCall] *** Subscribing to signaling channel...');
      await callSignalingService.subscribe(call.id, user.id);
      console.log('[useCall] *** Subscribed to signaling channel');

      // Setup signaling callbacks
      callSignalingService.onOffer = async (offer, senderId) => {
        console.log('[useCall] *** RECEIVED OFFER via signaling from:', senderId);
        offerReceived.current = true;

        // Stop READY retry since we got the offer
        if (readyRetryInterval.current) {
          clearInterval(readyRetryInterval.current);
          readyRetryInterval.current = null;
          console.log('[useCall] *** Stopped READY retry - offer received');
        }

        console.log('[useCall] *** Creating answer...');
        const answer = await webrtcService.handleOffer(offer);
        console.log('[useCall] *** Sending answer...');
        await callSignalingService.sendAnswer(answer);
        setCallState(CALL_STATUS.CONNECTING);
        console.log('[useCall] *** State set to CONNECTING');
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

        // Get callee ID - prefer direct callee_id, fallback to participants
        const calleeId = call.callee_id || call.participants?.find(p => p.role === 'callee')?.user_id;
        console.log('[useCall] Caller - callee_id:', calleeId);

        // Handle READY signal from callee - resend offer
        callSignalingService.onReady = async (senderId) => {
          console.log('[useCall] *** Callee ready, resending offer to:', calleeId);
          if (calleeId) {
            await callSignalingService.sendOffer(storedOffer, calleeId);
          }
        };

        // Send initial offer
        if (calleeId) {
          console.log('[useCall] *** Sending initial offer to:', calleeId);
          await callSignalingService.sendOffer(offer, calleeId);
        } else {
          console.error('[useCall] *** ERROR: No callee_id found, cannot send offer!');
        }
      } else {
        // Callee: Check for pending offer from early signaling first
        console.log('[useCall] *** Callee checking for pending offer...');
        const pendingOffer = callService.getPendingOffer();
        console.log('[useCall] *** Pending offer:', pendingOffer ? 'FOUND' : 'NOT FOUND');

        if (pendingOffer) {
          console.log('[useCall] *** Processing pending offer from early signaling!');
          offerReceived.current = true;
          const answer = await webrtcService.handleOffer(pendingOffer.offer);
          console.log('[useCall] *** Answer created, sending...');
          await callSignalingService.sendAnswer(answer);
          setCallState(CALL_STATUS.CONNECTING);
          console.log('[useCall] *** State set to CONNECTING');
        } else {
          // No pending offer - send READY signal to tell caller we're listening
          console.log('[useCall] *** No pending offer, sending READY signal');
          await callSignalingService.sendReady();

          // Start retry interval - keep sending READY until offer is received
          // This helps when caller (iOS) doesn't have READY handler or missed the first one
          readyRetryInterval.current = setInterval(async () => {
            if (offerReceived.current) {
              clearInterval(readyRetryInterval.current);
              readyRetryInterval.current = null;
              return;
            }
            console.log('[useCall] *** Retrying READY signal (no offer received yet)...');
            await callSignalingService.sendReady();
          }, 3000); // Retry every 3 seconds
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
  const handleCallEnded = useCallback((reason) => {
    console.log('[useCall] Handling call ended:', reason);

    setCallState(CALL_STATUS.ENDED);
    Vibration.vibrate(VIBRATION_PATTERNS.CALL_ENDED);

    // Clear READY retry interval
    if (readyRetryInterval.current) {
      clearInterval(readyRetryInterval.current);
      readyRetryInterval.current = null;
    }

    // Reset refs
    offerReceived.current = false;
    isInitialized.current = false;

    // Cleanup WebRTC and signaling
    webrtcService.cleanup();
    callSignalingService.cleanup();

    // IMPORTANT: Clear callService state to allow new calls
    callService.clearState();

    // Callback
    onCallEnded?.(reason);
  }, [onCallEnded]);

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
    console.log('[useCall] *** answerCall called, call?.id:', call?.id);
    if (!call?.id) {
      console.log('[useCall] *** answerCall: No call ID, returning');
      return;
    }

    try {
      console.log('[useCall] *** Answering call:', call.id);
      const result = await callService.answerCall(call.id);
      console.log('[useCall] *** answerCall result:', result);

      if (!result.success) {
        console.error('[useCall] *** Answer call failed:', result.error);
        setError(result.error);
        return;
      }

      // Initialize WebRTC if not already done
      console.log('[useCall] *** isInitialized:', isInitialized.current);
      if (!isInitialized.current) {
        console.log('[useCall] *** Calling initializeCall...');
        await initializeCall();
      } else {
        // Already initialized - re-send READY signal to trigger offer resend
        console.log('[useCall] *** Already initialized, re-sending READY signal');
        await callSignalingService.sendReady();
      }
      console.log('[useCall] *** answerCall completed successfully');
    } catch (err) {
      console.error('[useCall] *** Answer call error:', err);
      setError(err.message);
    }
  }, [call?.id, initializeCall]);

  /**
   * Decline the call (for callee)
   */
  const declineCall = useCallback(async () => {
    if (!call?.id) return;

    try {
      await callService.declineCall(call.id);
      handleCallEnded('declined');
    } catch (err) {
      console.error('[useCall] Decline call error:', err);
    }
  }, [call?.id, handleCallEnded]);

  /**
   * Cancel the call (for caller)
   */
  const cancelCall = useCallback(async () => {
    if (!call?.id) return;

    try {
      await callService.cancelCall(call.id);
      handleCallEnded('cancelled');
    } catch (err) {
      console.error('[useCall] Cancel call error:', err);
    }
  }, [call?.id, handleCallEnded]);

  // ========== EFFECTS ==========

  // Initialize on mount
  useEffect(() => {
    if (call?.id) {
      initializeCall();
    }

    return () => {
      // Clear READY retry interval
      if (readyRetryInterval.current) {
        clearInterval(readyRetryInterval.current);
        readyRetryInterval.current = null;
      }
      // Cleanup on unmount
      webrtcService.cleanup();
      callSignalingService.cleanup();
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
