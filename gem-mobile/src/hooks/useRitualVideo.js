/**
 * Lazy Video Loading Hook
 * Load video only when ritual is opened, cleanup on close
 * Phase 2: VisionBoard Upgrade
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import useDevicePerformance from './useDevicePerformance';

const HOOK_NAME = '[useRitualVideo]';

// Fallback gradient colors when video disabled
const FALLBACK_GRADIENTS = {
  'heart-expansion': ['#FF6B6B', '#C44569', '#6C5CE7'],
  'gratitude-flow': ['#FFD93D', '#FF9D00', '#FF6B6B'],
  'cleansing-breath': ['#74B9FF', '#0984E3', '#6C5CE7'],
  'water-manifest': ['#00CEC9', '#0984E3', '#6C5CE7'],
  'letter-to-universe': ['#A29BFE', '#6C5CE7', '#341F97'],
  'burn-release': ['#FF7675', '#D63031', '#E17055'],
  'star-wish': ['#0F0C29', '#302B63', '#24243E'],
  'crystal-healing': ['#6C5CE7', '#A29BFE', '#FD79A8'],
};

/**
 * useRitualVideo Hook
 *
 * @param {string} ritualId - Ritual identifier
 * @returns {object} Video state and controls
 */
const useRitualVideo = (ritualId) => {
  const { features, isLowEnd } = useDevicePerformance();
  const videoRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Determine if should use video
  const shouldUseVideo = features.enableVideoBackground && !isLowEnd;

  // Get fallback gradient
  const fallbackGradient = FALLBACK_GRADIENTS[ritualId] || FALLBACK_GRADIENTS['heart-expansion'];

  // Load video on mount
  useEffect(() => {
    if (!ritualId) return;

    console.log(HOOK_NAME, 'Loading video for:', ritualId);

    if (!shouldUseVideo) {
      console.log(HOOK_NAME, 'Video disabled, using gradient fallback');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      console.log(HOOK_NAME, 'Cleaning up video for:', ritualId);
      setIsPlaying(false);
    };
  }, [ritualId, shouldUseVideo]);

  // Play video
  const play = useCallback(async () => {
    if (videoRef.current && shouldUseVideo) {
      try {
        await videoRef.current.playAsync();
        setIsPlaying(true);
        console.log(HOOK_NAME, 'Video playing');
      } catch (err) {
        console.error(HOOK_NAME, 'Play error:', err?.message);
        setError(err?.message);
      }
    }
  }, [shouldUseVideo]);

  // Pause video
  const pause = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
        console.log(HOOK_NAME, 'Video paused');
      } catch (err) {
        console.error(HOOK_NAME, 'Pause error:', err?.message);
      }
    }
  }, []);

  // Stop and unload
  const stop = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
        setIsPlaying(false);
        console.log(HOOK_NAME, 'Video stopped and unloaded');
      } catch (err) {
        console.error(HOOK_NAME, 'Stop error:', err?.message);
      }
    }
  }, []);

  // Handle video load
  const handleLoad = useCallback((status) => {
    console.log(HOOK_NAME, 'Video loaded:', status);
    setIsLoading(false);
  }, []);

  // Handle video error
  const handleError = useCallback((err) => {
    console.error(HOOK_NAME, 'Video error:', err);
    setError(err);
    setIsLoading(false);
  }, []);

  return {
    videoRef,
    isLoading,
    isPlaying,
    error,
    shouldUseVideo,
    fallbackGradient,
    play,
    pause,
    stop,
    handleLoad,
    handleError,
  };
};

export default useRitualVideo;
export { FALLBACK_GRADIENTS };
