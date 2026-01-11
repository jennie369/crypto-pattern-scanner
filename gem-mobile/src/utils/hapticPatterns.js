/**
 * Haptic Patterns - Haptic feedback utilities for rituals
 * Uses expo-haptics for native haptic feedback
 */

import * as Haptics from 'expo-haptics';

// ============================================
// BASIC HAPTICS
// ============================================

export const HAPTIC_IMPACT = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  soft: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  rigid: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
};

export const HAPTIC_NOTIFICATION = {
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

export const HAPTIC_SELECTION = () => Haptics.selectionAsync();

// ============================================
// PATTERN SEQUENCES
// ============================================

/**
 * Play a sequence of haptics with delays
 * @param {Array} pattern - Array of { type, delay } objects
 */
export const playHapticSequence = async (pattern) => {
  for (const step of pattern) {
    if (step.delay) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
    if (step.type === 'light') await HAPTIC_IMPACT.light();
    else if (step.type === 'medium') await HAPTIC_IMPACT.medium();
    else if (step.type === 'heavy') await HAPTIC_IMPACT.heavy();
    else if (step.type === 'soft') await HAPTIC_IMPACT.soft();
    else if (step.type === 'success') await HAPTIC_NOTIFICATION.success();
    else if (step.type === 'selection') await HAPTIC_SELECTION();
  }
};

// ============================================
// RITUAL-SPECIFIC PATTERNS
// ============================================

export const HAPTIC_PATTERNS = {
  // Basic interactions
  tap: HAPTIC_IMPACT.light,
  press: HAPTIC_IMPACT.medium,
  longPress: HAPTIC_IMPACT.heavy,
  selection: HAPTIC_SELECTION,

  // Feedback
  success: HAPTIC_NOTIFICATION.success,
  warning: HAPTIC_NOTIFICATION.warning,
  error: HAPTIC_NOTIFICATION.error,

  // Breathing patterns
  breath: {
    inhale: () => HAPTIC_IMPACT.soft(),
    exhale: () => HAPTIC_IMPACT.soft(),
    hold: () => HAPTIC_IMPACT.light(),
    cycleComplete: () => HAPTIC_NOTIFICATION.success(),
  },

  // Heart patterns
  heartbeat: async () => {
    await HAPTIC_IMPACT.medium();
    await new Promise(resolve => setTimeout(resolve, 100));
    await HAPTIC_IMPACT.light();
    await new Promise(resolve => setTimeout(resolve, 400));
  },

  // Celebration patterns
  celebration: async () => {
    await HAPTIC_NOTIFICATION.success();
    await new Promise(resolve => setTimeout(resolve, 200));
    await HAPTIC_IMPACT.light();
    await new Promise(resolve => setTimeout(resolve, 100));
    await HAPTIC_IMPACT.light();
    await new Promise(resolve => setTimeout(resolve, 100));
    await HAPTIC_IMPACT.light();
  },

  victory: async () => {
    await HAPTIC_NOTIFICATION.success();
    await new Promise(resolve => setTimeout(resolve, 150));
    await HAPTIC_IMPACT.heavy();
  },

  // Energy patterns
  energy: {
    build: async (intensity = 1) => {
      const count = Math.ceil(intensity * 3);
      for (let i = 0; i < count; i++) {
        await HAPTIC_IMPACT.light();
        await new Promise(resolve => setTimeout(resolve, 100 - intensity * 30));
      }
    },
    release: () => HAPTIC_IMPACT.heavy(),
    pulse: () => HAPTIC_IMPACT.soft(),
  },

  // Fire patterns (for Burn ritual)
  fire: {
    ignite: () => HAPTIC_IMPACT.medium(),
    crackle: async () => {
      await HAPTIC_IMPACT.light();
      await new Promise(resolve => setTimeout(resolve, 50));
      await HAPTIC_IMPACT.light();
    },
    burn: () => HAPTIC_IMPACT.soft(),
  },

  // Water patterns (for Water ritual)
  water: {
    ripple: () => HAPTIC_IMPACT.soft(),
    flow: async () => {
      for (let i = 0; i < 3; i++) {
        await HAPTIC_IMPACT.soft();
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    },
    charge: () => HAPTIC_IMPACT.medium(),
  },

  // Cosmic patterns (for Letter and Star rituals)
  cosmic: {
    starSelect: () => HAPTIC_IMPACT.light(),
    shootingStar: async () => {
      await HAPTIC_IMPACT.light();
      await new Promise(resolve => setTimeout(resolve, 100));
      await HAPTIC_IMPACT.medium();
    },
    letterSend: async () => {
      await HAPTIC_IMPACT.medium();
      await new Promise(resolve => setTimeout(resolve, 500));
      await HAPTIC_IMPACT.soft();
    },
    wishGranted: () => HAPTIC_NOTIFICATION.success(),
  },

  // Gratitude patterns
  gratitude: {
    add: () => HAPTIC_IMPACT.light(),
    send: () => HAPTIC_IMPACT.medium(),
    complete: () => HAPTIC_NOTIFICATION.success(),
  },

  // Progress patterns
  progress: {
    step: () => HAPTIC_IMPACT.light(),
    milestone: () => HAPTIC_IMPACT.medium(),
    complete: () => HAPTIC_NOTIFICATION.success(),
  },

  // XP patterns
  xp: {
    tick: () => HAPTIC_IMPACT.light(),
    bonus: () => HAPTIC_IMPACT.medium(),
    levelUp: () => HAPTIC_NOTIFICATION.success(),
  },

  // Streak patterns
  streak: {
    maintain: () => HAPTIC_IMPACT.light(),
    increase: () => HAPTIC_IMPACT.medium(),
    record: async () => {
      await HAPTIC_NOTIFICATION.success();
      await new Promise(resolve => setTimeout(resolve, 200));
      await HAPTIC_IMPACT.heavy();
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Trigger haptic with safety check
 */
export const safeHaptic = async (hapticFn) => {
  try {
    await hapticFn();
  } catch (error) {
    // Silently fail - haptics may not be available
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Create a debounced haptic function
 */
export const createDebouncedHaptic = (hapticFn, delay = 100) => {
  let lastCall = 0;
  return async () => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      await safeHaptic(hapticFn);
    }
  };
};

/**
 * Create a throttled haptic function
 */
export const createThrottledHaptic = (hapticFn, interval = 50) => {
  let isThrottled = false;
  return async () => {
    if (!isThrottled) {
      isThrottled = true;
      await safeHaptic(hapticFn);
      setTimeout(() => {
        isThrottled = false;
      }, interval);
    }
  };
};

export default HAPTIC_PATTERNS;
