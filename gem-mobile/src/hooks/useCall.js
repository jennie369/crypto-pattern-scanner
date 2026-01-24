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

      // Subscribe to signaling channel
      await callSignalingService.subscribe(call.id, user.id);

      // Setup signaling callbacks
      callSignalingService.onOffer = async (offer, senderId) => {
        console.log('[useCall] Received offer from:', senderId);
        const answer = await webrtcService.handleOffer(offer);
        await callSignalingService.sendAnswer(answer);
        setCallState(CALL_STATUS.CONNECTING);
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

      // If caller, create and send offer
      if (isCaller) {
        setCallState(CALL_STATUS.RINGING);
        const offer = await webrtcService.createOffer();

        // Get callee ID from participants
        const callee = call.participants?.find(p => p.role === 'callee');
        if (callee) {
          await callSignalingService.sendOffer(offer, callee.user_id);
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

    // Cleanup
    webrtcService.cleanup();
    callSignalingService.cleanup();

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
    if (!call?.id) return;

    try {
      console.log('[useCall] Answering call:', call.id);
      const result = await callService.answerCall(call.id);

      if (!result.success) {
        console.error('[useCall] Answer call failed:', result.error);
        setError(result.error);
        return;
      }

      // Initialize WebRTC if not already done
      if (!isInitialized.current) {
        await initializeCall();
      }
    } catch (err) {
      console.error('[useCall] Answer call error:', err);
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
      // Cleanup on unmount
      webrtcService.cleanup();
      callSignalingService.cleanup();
    };
  }, [call?.id, initializeCall]);

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
