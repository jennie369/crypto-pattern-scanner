/**
 * useCallTimer Hook
 * Manages call duration timer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Format seconds to HH:MM:SS or MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Hook for managing call duration timer
 * @param {boolean} isRunning - Whether timer should be running
 * @param {number} initialSeconds - Initial seconds (for resuming)
 * @returns {Object} { duration, formattedDuration, reset }
 */
export const useCallTimer = (isRunning = false, initialSeconds = 0) => {
  const [duration, setDuration] = useState(initialSeconds);
  const intervalRef = useRef(null);

  // Start/stop timer based on isRunning
  useEffect(() => {
    if (isRunning) {
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Reset timer
  const reset = useCallback(() => {
    setDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    duration,
    formattedDuration: formatDuration(duration),
    reset,
  };
};

export default useCallTimer;
