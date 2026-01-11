/**
 * useCameraSwitch Hook
 * Manages camera front/back switching
 */

import { useState, useCallback } from 'react';
import { webrtcService } from '../services/webrtcService';
import * as Haptics from 'expo-haptics';

/**
 * useCameraSwitch Hook
 * Quản lý camera front/back
 */
export const useCameraSwitch = () => {
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);

  const switchCamera = useCallback(async () => {
    if (isSwitching) return { success: false, error: 'Already switching' };

    setIsSwitching(true);
    setError(null);

    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Ignore haptic errors
    }

    try {
      const result = await webrtcService.switchCamera();

      if (result !== null) {
        setIsFrontCamera(result);
        return { success: true, isFrontCamera: result };
      } else {
        const err = 'Không thể chuyển camera';
        setError(err);
        return { success: false, error: err };
      }
    } catch (err) {
      console.error('[useCameraSwitch] Error:', err);
      const errorMsg = err.message || 'Lỗi chuyển camera';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSwitching(false);
    }
  }, [isSwitching]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isFrontCamera,
    isSwitching,
    error,
    switchCamera,
    resetError,
  };
};

export default useCameraSwitch;
