/**
 * useVideoCall Hook
 * Extended hook for video call state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCall } from './useCall';
import { callService } from '../services/callService';
import { webrtcService } from '../services/webrtcService';

/**
 * useVideoCall Hook
 * Extended hook for video calls, builds on useCall
 * @param {Object} options - Hook options
 * @param {Object} options.call - Call object
 * @param {boolean} options.isCaller - Whether current user is caller
 * @param {Function} options.onCallEnded - Callback when call ends
 */
export const useVideoCall = (options = {}) => {
  // Inherit from useCall
  const callHook = useCall(options);

  // ========== VIDEO STATE ==========
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState(null);
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(true);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [videoStats, setVideoStats] = useState(null);

  // ========== REFS ==========
  const statsIntervalRef = useRef(null);

  // ========== EFFECTS ==========

  // Get video streams when connected
  useEffect(() => {
    if (callHook.isConnected) {
      setLocalVideoStream(webrtcService.getLocalStream());
      setRemoteVideoStream(webrtcService.getRemoteStream());

      // Start stats monitoring
      startStatsMonitoring();
    }

    return () => {
      stopStatsMonitoring();
    };
  }, [callHook.isConnected]);

  // Listen for remote video changes
  useEffect(() => {
    if (!webrtcService) return;

    const originalOnRemoteStream = webrtcService.onRemoteStream;

    webrtcService.onRemoteStream = (stream) => {
      setRemoteVideoStream(stream);

      // Check if remote has video
      const hasVideo = stream?.getVideoTracks().some(t => t.enabled);
      setIsRemoteVideoEnabled(hasVideo);

      // Call original handler if exists
      originalOnRemoteStream?.(stream);
    };

    return () => {
      if (webrtcService) {
        webrtcService.onRemoteStream = originalOnRemoteStream;
      }
    };
  }, []);

  // ========== FUNCTIONS ==========

  const startStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) return;

    statsIntervalRef.current = setInterval(async () => {
      const stats = await webrtcService.getVideoStats();
      setVideoStats(stats);
    }, 2000);
  }, []);

  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  // ========== VIDEO ACTIONS ==========

  /**
   * Toggle local video
   */
  const toggleLocalVideo = useCallback(async () => {
    const newState = !isLocalVideoEnabled;
    setIsLocalVideoEnabled(newState);

    if (options.call?.id) {
      await callService.toggleVideo(options.call.id, newState);
    }
  }, [isLocalVideoEnabled, options.call?.id]);

  /**
   * Switch camera front/back
   */
  const switchCamera = useCallback(async () => {
    if (options.call?.id) {
      const result = await callService.switchCamera(options.call.id);
      if (result.success) {
        setIsFrontCamera(result.isFrontCamera);
      }
      return result;
    }
    return { success: false };
  }, [options.call?.id]);

  /**
   * Upgrade from audio to video
   */
  const upgradeToVideo = useCallback(async () => {
    if (options.call?.id) {
      const result = await callService.upgradeToVideo(options.call.id);
      if (result.success) {
        setIsLocalVideoEnabled(true);
        setLocalVideoStream(webrtcService.getLocalStream());
      }
      return result;
    }
    return { success: false };
  }, [options.call?.id]);

  /**
   * Minimize video call
   */
  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  /**
   * Maximize video call
   */
  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  /**
   * Toggle Picture-in-Picture
   */
  const togglePiP = useCallback(() => {
    setIsPiPActive(prev => !prev);
  }, []);

  /**
   * Set video quality
   */
  const setVideoQuality = useCallback(async (quality) => {
    await webrtcService.setVideoQuality(quality);
  }, []);

  // ========== RETURN ==========
  return {
    // From useCall
    ...callHook,

    // Video state
    localVideoStream,
    remoteVideoStream,
    isLocalVideoEnabled,
    isRemoteVideoEnabled,
    isFrontCamera,
    isMinimized,
    isPiPActive,
    videoStats,

    // Video actions
    toggleLocalVideo,
    switchCamera,
    upgradeToVideo,
    minimize,
    maximize,
    togglePiP,
    setVideoQuality,
  };
};

export default useVideoCall;
