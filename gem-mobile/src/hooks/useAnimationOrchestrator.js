/**
 * Animation Orchestrator Hook
 * Manage concurrent animations to prevent lag
 * Phase 2: VisionBoard Upgrade
 */

import { useCallback, useRef, useMemo } from 'react';
import { Animated } from 'react-native';
import useDevicePerformance from './useDevicePerformance';

const HOOK_NAME = '[useAnimationOrchestrator]';

/**
 * useAnimationOrchestrator Hook
 *
 * Manages concurrent animations to prevent performance issues on lower-end devices.
 * Automatically queues animations when too many are running.
 *
 * @param {number} customMaxConcurrent - Override max concurrent (optional)
 * @returns {object} Animation management functions
 *
 * @example
 * const { canStartAnimation, registerAnimation, queueAnimation } = useAnimationOrchestrator();
 *
 * // Check before starting
 * if (canStartAnimation()) {
 *   const cleanup = registerAnimation('my-animation');
 *   Animated.timing(value, config).start(() => cleanup());
 * }
 *
 * // Or use queueAnimation for automatic handling
 * queueAnimation((cleanup) => {
 *   Animated.timing(value, config).start(() => cleanup());
 * }, 'my-animation');
 */
const useAnimationOrchestrator = (customMaxConcurrent = null) => {
  const { features, isLowEnd } = useDevicePerformance();
  const maxConcurrent = customMaxConcurrent || features.maxConcurrentAnimations;

  // Track active animations
  const activeAnimations = useRef(new Set());
  const animationQueue = useRef([]);

  /**
   * Check if new animation can start
   * @returns {boolean}
   */
  const canStartAnimation = useCallback(() => {
    const canStart = activeAnimations.current.size < maxConcurrent;
    if (!canStart) {
      console.log(
        HOOK_NAME,
        'Animation blocked:',
        `(${activeAnimations.current.size}/${maxConcurrent})`
      );
    }
    return canStart;
  }, [maxConcurrent]);

  /**
   * Process queued animations when slots become available
   */
  const processQueue = useCallback(() => {
    while (animationQueue.current.length > 0 && activeAnimations.current.size < maxConcurrent) {
      const nextAnim = animationQueue.current.shift();
      if (nextAnim) {
        nextAnim();
      }
    }
  }, [maxConcurrent]);

  /**
   * Register animation start
   * @param {string} animationId - Unique ID for animation
   * @returns {function} Cleanup function to call when animation ends
   */
  const registerAnimation = useCallback(
    (animationId) => {
      const id = animationId || `anim_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      activeAnimations.current.add(id);

      console.log(
        HOOK_NAME,
        'Registered:',
        id,
        `(${activeAnimations.current.size}/${maxConcurrent})`
      );

      // Return cleanup function
      return () => {
        activeAnimations.current.delete(id);
        console.log(HOOK_NAME, 'Unregistered:', id);

        // Process queue if any
        processQueue();
      };
    },
    [maxConcurrent, processQueue]
  );

  /**
   * Queue animation if too many running
   * @param {function} animationFn - Function to run animation, receives cleanup as param
   * @param {string} animationId - Unique ID
   * @returns {boolean} true if started immediately, false if queued
   */
  const queueAnimation = useCallback(
    (animationFn, animationId) => {
      if (canStartAnimation()) {
        const cleanup = registerAnimation(animationId);
        animationFn(cleanup);
        return true;
      } else {
        console.log(HOOK_NAME, 'Queued animation:', animationId);
        animationQueue.current.push(() => {
          const cleanup = registerAnimation(animationId);
          animationFn(cleanup);
        });
        return false;
      }
    },
    [canStartAnimation, registerAnimation]
  );

  /**
   * Create managed Animated.timing
   * @param {Animated.Value} value
   * @param {object} config
   * @param {string} animationId
   * @returns {object} Animated timing with management
   */
  const createManagedTiming = useCallback(
    (value, config, animationId) => {
      return {
        start: (callback) => {
          queueAnimation((cleanup) => {
            Animated.timing(value, {
              ...config,
              useNativeDriver: config.useNativeDriver !== false,
            }).start((result) => {
              cleanup();
              callback?.(result);
            });
          }, animationId);
        },
      };
    },
    [queueAnimation]
  );

  /**
   * Create managed Animated.spring
   * @param {Animated.Value} value
   * @param {object} config
   * @param {string} animationId
   * @returns {object} Animated spring with management
   */
  const createManagedSpring = useCallback(
    (value, config, animationId) => {
      return {
        start: (callback) => {
          queueAnimation((cleanup) => {
            Animated.spring(value, {
              ...config,
              useNativeDriver: config.useNativeDriver !== false,
            }).start((result) => {
              cleanup();
              callback?.(result);
            });
          }, animationId);
        },
      };
    },
    [queueAnimation]
  );

  /**
   * Run animation only if device can handle it
   * Skips animation on low-end devices
   * @param {function} animationFn
   * @param {function} fallbackFn - Optional instant fallback
   */
  const runIfCapable = useCallback(
    (animationFn, fallbackFn) => {
      if (isLowEnd && fallbackFn) {
        fallbackFn();
      } else {
        animationFn();
      }
    },
    [isLowEnd]
  );

  /**
   * Get current animation stats
   */
  const getStats = useCallback(() => {
    return {
      activeCount: activeAnimations.current.size,
      queuedCount: animationQueue.current.length,
      maxConcurrent,
      isLowEnd,
    };
  }, [maxConcurrent, isLowEnd]);

  /**
   * Clear all animations (emergency stop)
   */
  const clearAll = useCallback(() => {
    activeAnimations.current.clear();
    animationQueue.current = [];
    console.log(HOOK_NAME, 'Cleared all animations');
  }, []);

  return {
    canStartAnimation,
    registerAnimation,
    queueAnimation,
    createManagedTiming,
    createManagedSpring,
    runIfCapable,
    getStats,
    clearAll,
    maxConcurrent,
    isLowEnd,
  };
};

export default useAnimationOrchestrator;
