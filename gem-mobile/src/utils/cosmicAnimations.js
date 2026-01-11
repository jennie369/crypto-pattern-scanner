/**
 * Cosmic Animations - Animation utilities for Rituals Cosmic Glassmorphism
 * Uses react-native-reanimated for 60fps native animations
 */

import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

// ============================================
// TIMING CONFIGURATIONS
// ============================================

export const COSMIC_TIMING = {
  // Easing functions
  easing: {
    smooth: Easing.bezier(0.4, 0.0, 0.2, 1),
    smoothIn: Easing.bezier(0.4, 0.0, 1, 1),
    smoothOut: Easing.bezier(0.0, 0.0, 0.2, 1),
    bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
    elastic: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    cosmic: Easing.bezier(0.25, 0.1, 0.25, 1),
    breath: Easing.bezier(0.37, 0, 0.63, 1), // Sine-like for breathing
    gentle: Easing.bezier(0.4, 0.0, 0.6, 1),
  },

  // Duration presets (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    medium: 500,
    slow: 800,
    verySlow: 1200,
    breath: 4000,
    ritual: 2000,
  },

  // Spring configs
  spring: {
    gentle: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
      mass: 0.8,
    },
    snappy: {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    },
    slow: {
      damping: 20,
      stiffness: 50,
      mass: 1.5,
    },
  },
};

// ============================================
// PULSE ANIMATIONS
// ============================================

/**
 * Creates a continuous pulse animation
 * @param {SharedValue} value - Reanimated shared value
 * @param {Object} options - Animation options
 * @returns {void} Starts the animation
 */
export const createPulseAnimation = (value, options = {}) => {
  const {
    min = 1,
    max = 1.08,
    duration = 2000,
    easing = COSMIC_TIMING.easing.cosmic,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(max, { duration: duration / 2, easing }),
      withTiming(min, { duration: duration / 2, easing })
    ),
    -1, // Infinite repeat
    true // Reverse
  );
};

/**
 * Creates a heartbeat pulse pattern
 */
export const createHeartbeatAnimation = (value, options = {}) => {
  const {
    scale = 1.15,
    duration = 800,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(scale, { duration: duration * 0.15, easing: COSMIC_TIMING.easing.smoothOut }),
      withTiming(1, { duration: duration * 0.15, easing: COSMIC_TIMING.easing.smoothIn }),
      withTiming(scale * 0.9, { duration: duration * 0.1, easing: COSMIC_TIMING.easing.smoothOut }),
      withTiming(1, { duration: duration * 0.1, easing: COSMIC_TIMING.easing.smoothIn }),
      withDelay(duration * 0.5, withTiming(1, { duration: 0 }))
    ),
    -1,
    false
  );
};

// ============================================
// GLOW ANIMATIONS
// ============================================

/**
 * Creates a glow intensity animation
 */
export const createGlowAnimation = (value, options = {}) => {
  const {
    min = 0.5,
    max = 1,
    duration = 2500,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(max, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle }),
      withTiming(min, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle })
    ),
    -1,
    true
  );
};

/**
 * Creates a shimmer effect
 */
export const createShimmerAnimation = (value, options = {}) => {
  const {
    duration = 3000,
  } = options;

  'worklet';
  value.value = withRepeat(
    withTiming(1, { duration, easing: Easing.linear }),
    -1,
    false
  );
};

// ============================================
// FLOAT ANIMATIONS
// ============================================

/**
 * Creates a floating/levitating animation
 */
export const createFloatAnimation = (value, options = {}) => {
  const {
    distance = 10,
    duration = 3000,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(distance, { duration: duration / 2, easing: COSMIC_TIMING.easing.breath }),
      withTiming(-distance, { duration: duration / 2, easing: COSMIC_TIMING.easing.breath })
    ),
    -1,
    true
  );
};

/**
 * Creates a gentle sway animation (horizontal)
 */
export const createSwayAnimation = (value, options = {}) => {
  const {
    amount = 5,
    duration = 4000,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(amount, { duration: duration / 2, easing: COSMIC_TIMING.easing.breath }),
      withTiming(-amount, { duration: duration / 2, easing: COSMIC_TIMING.easing.breath })
    ),
    -1,
    true
  );
};

// ============================================
// BREATH ANIMATIONS
// ============================================

/**
 * Breathing animation with callback for phase changes
 * @param {SharedValue} value - Scale value
 * @param {Object} options - Animation options
 */
export const createBreathAnimation = (value, options = {}) => {
  const {
    inhaleScale = 1.3,
    exhaleScale = 1,
    inhaleDuration = 4000,
    holdDuration = 0,
    exhaleDuration = 4000,
    restDuration = 0,
    cycles = -1, // -1 for infinite
    onPhaseChange = null,
  } = options;

  'worklet';

  const sequence = [];

  // Inhale
  sequence.push(
    withTiming(inhaleScale, {
      duration: inhaleDuration,
      easing: COSMIC_TIMING.easing.breath,
    })
  );

  // Hold (if specified)
  if (holdDuration > 0) {
    sequence.push(withDelay(holdDuration, withTiming(inhaleScale, { duration: 0 })));
  }

  // Exhale
  sequence.push(
    withTiming(exhaleScale, {
      duration: exhaleDuration,
      easing: COSMIC_TIMING.easing.breath,
    })
  );

  // Rest (if specified)
  if (restDuration > 0) {
    sequence.push(withDelay(restDuration, withTiming(exhaleScale, { duration: 0 })));
  }

  value.value = withRepeat(withSequence(...sequence), cycles, false);
};

/**
 * Box breathing pattern (4-4-4-4)
 */
export const createBoxBreathAnimation = (value, options = {}) => {
  return createBreathAnimation(value, {
    inhaleScale: options.maxScale || 1.3,
    exhaleScale: options.minScale || 1,
    inhaleDuration: 4000,
    holdDuration: 4000,
    exhaleDuration: 4000,
    restDuration: 4000,
    cycles: options.cycles || 4,
    onPhaseChange: options.onPhaseChange,
  });
};

/**
 * Relaxing breath pattern (4-7-8)
 */
export const createRelaxingBreathAnimation = (value, options = {}) => {
  const baseDuration = 1000; // 1 second base unit

  return createBreathAnimation(value, {
    inhaleScale: options.maxScale || 1.3,
    exhaleScale: options.minScale || 1,
    inhaleDuration: baseDuration * 4,
    holdDuration: baseDuration * 7,
    exhaleDuration: baseDuration * 8,
    restDuration: 0,
    cycles: options.cycles || 4,
    onPhaseChange: options.onPhaseChange,
  });
};

// ============================================
// PARTICLE ANIMATIONS
// ============================================

/**
 * Creates animation for individual particle
 */
export const createParticleAnimation = (index, count, options = {}) => {
  const {
    duration = 8000,
    delay = 0,
    direction = 'up', // 'up', 'down', 'random'
  } = options;

  // Stagger particles
  const particleDelay = (index / count) * duration;

  return {
    translateY: {
      duration,
      delay: delay + particleDelay,
      direction,
    },
    opacity: {
      duration: duration / 4,
      delay: delay + particleDelay,
    },
  };
};

/**
 * Creates twinkling star animation
 */
export const createTwinkleAnimation = (value, options = {}) => {
  const {
    minOpacity = 0.3,
    maxOpacity = 1,
    duration = 2000,
    delay = 0,
  } = options;

  'worklet';
  value.value = withDelay(
    delay,
    withRepeat(
      withSequence(
        withTiming(maxOpacity, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle }),
        withTiming(minOpacity, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle })
      ),
      -1,
      true
    )
  );
};

// ============================================
// PRESS/INTERACTION ANIMATIONS
// ============================================

/**
 * Creates press feedback animation
 */
export const createPressAnimation = (scale, options = {}) => {
  const {
    pressed = 0.95,
    duration = 100,
  } = options;

  'worklet';
  return withTiming(pressed, {
    duration,
    easing: COSMIC_TIMING.easing.smooth,
  });
};

/**
 * Creates press release animation
 */
export const createReleaseAnimation = (scale, options = {}) => {
  const {
    normal = 1,
  } = options;

  'worklet';
  return withSpring(normal, COSMIC_TIMING.spring.bouncy);
};

/**
 * Creates long press expanding animation
 */
export const createLongPressAnimation = (value, options = {}) => {
  const {
    targetScale = 1.2,
    duration = 500,
  } = options;

  'worklet';
  value.value = withTiming(targetScale, {
    duration,
    easing: COSMIC_TIMING.easing.smoothOut,
  });
};

// ============================================
// SUCCESS/CELEBRATION ANIMATIONS
// ============================================

/**
 * Creates success burst animation
 */
export const createSuccessAnimation = (value, options = {}) => {
  const {
    targetScale = 1.5,
    duration = 600,
    onComplete = null,
  } = options;

  'worklet';
  value.value = withSequence(
    withTiming(targetScale, {
      duration: duration * 0.4,
      easing: COSMIC_TIMING.easing.bounce,
    }),
    withTiming(1, {
      duration: duration * 0.6,
      easing: COSMIC_TIMING.easing.elastic,
    })
  );
};

/**
 * Creates confetti/sparkle burst animation
 */
export const createSparkleAnimation = (value, index, options = {}) => {
  const {
    count = 12,
    radius = 100,
    duration = 1000,
  } = options;

  const angle = (index / count) * Math.PI * 2;
  const targetX = Math.cos(angle) * radius;
  const targetY = Math.sin(angle) * radius;

  return {
    translateX: targetX,
    translateY: targetY,
    duration,
    delay: index * 30,
  };
};

/**
 * Creates XP counter animation
 */
export const createCounterAnimation = (value, options = {}) => {
  const {
    from = 0,
    to = 100,
    duration = 1500,
  } = options;

  'worklet';
  value.value = withTiming(to, {
    duration,
    easing: COSMIC_TIMING.easing.smoothOut,
  });
};

// ============================================
// RIPPLE ANIMATIONS
// ============================================

/**
 * Creates ripple effect animation
 */
export const createRippleAnimation = (value, options = {}) => {
  const {
    targetScale = 3,
    duration = 800,
  } = options;

  'worklet';
  value.value = withTiming(targetScale, {
    duration,
    easing: COSMIC_TIMING.easing.smoothOut,
  });
};

/**
 * Creates multiple expanding rings
 */
export const createExpandingRingsAnimation = (values, options = {}) => {
  const {
    targetScale = 2,
    duration = 1000,
    staggerDelay = 200,
  } = options;

  'worklet';
  values.forEach((value, index) => {
    value.value = withDelay(
      index * staggerDelay,
      withTiming(targetScale, {
        duration,
        easing: COSMIC_TIMING.easing.smoothOut,
      })
    );
  });
};

// ============================================
// TRANSITION ANIMATIONS
// ============================================

/**
 * Creates fade in animation
 */
export const createFadeInAnimation = (value, options = {}) => {
  const {
    duration = 300,
    delay = 0,
  } = options;

  'worklet';
  value.value = withDelay(
    delay,
    withTiming(1, {
      duration,
      easing: COSMIC_TIMING.easing.smooth,
    })
  );
};

/**
 * Creates fade out animation
 */
export const createFadeOutAnimation = (value, options = {}) => {
  const {
    duration = 300,
    delay = 0,
  } = options;

  'worklet';
  value.value = withDelay(
    delay,
    withTiming(0, {
      duration,
      easing: COSMIC_TIMING.easing.smooth,
    })
  );
};

/**
 * Creates slide up animation
 */
export const createSlideUpAnimation = (value, options = {}) => {
  const {
    from = 50,
    to = 0,
    duration = 400,
    delay = 0,
  } = options;

  'worklet';
  value.value = from;
  value.value = withDelay(
    delay,
    withSpring(to, COSMIC_TIMING.spring.gentle)
  );
};

/**
 * Creates scale entrance animation
 */
export const createScaleEntranceAnimation = (value, options = {}) => {
  const {
    from = 0.8,
    to = 1,
    duration = 400,
    delay = 0,
  } = options;

  'worklet';
  value.value = from;
  value.value = withDelay(
    delay,
    withSpring(to, COSMIC_TIMING.spring.bouncy)
  );
};

// ============================================
// RITUAL-SPECIFIC ANIMATIONS
// ============================================

/**
 * Creates energy flow animation (for Water Manifest)
 */
export const createEnergyFlowAnimation = (value, options = {}) => {
  const {
    duration = 2000,
  } = options;

  'worklet';
  value.value = withRepeat(
    withTiming(1, {
      duration,
      easing: Easing.linear,
    }),
    -1,
    false
  );
};

/**
 * Creates flame flicker animation (for Burn Release)
 */
export const createFlameFlickerAnimation = (value, options = {}) => {
  const {
    minScale = 0.9,
    maxScale = 1.1,
    duration = 150,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(maxScale, { duration: duration * 0.4, easing: Easing.linear }),
      withTiming(minScale, { duration: duration * 0.3, easing: Easing.linear }),
      withTiming(1, { duration: duration * 0.3, easing: Easing.linear })
    ),
    -1,
    false
  );
};

/**
 * Creates paper burn animation (for Burn Release)
 */
export const createBurnAnimation = (value, options = {}) => {
  const {
    duration = 5000,
  } = options;

  'worklet';
  value.value = withTiming(1, {
    duration,
    easing: COSMIC_TIMING.easing.smoothOut,
  });
};

/**
 * Creates shooting star animation (for Star Wish)
 */
export const createShootingStarAnimation = (translateX, translateY, opacity, options = {}) => {
  const {
    startX = -100,
    startY = 100,
    endX = 400,
    endY = -100,
    duration = 1500,
    delay = 0,
  } = options;

  'worklet';
  translateX.value = startX;
  translateY.value = startY;
  opacity.value = 0;

  translateX.value = withDelay(delay, withTiming(endX, { duration, easing: Easing.linear }));
  translateY.value = withDelay(delay, withTiming(endY, { duration, easing: Easing.linear }));
  opacity.value = withDelay(
    delay,
    withSequence(
      withTiming(1, { duration: duration * 0.2 }),
      withTiming(1, { duration: duration * 0.6 }),
      withTiming(0, { duration: duration * 0.2 })
    )
  );
};

/**
 * Creates letter flying animation (for Letter to Universe)
 */
export const createLetterFlyAnimation = (translateY, scale, opacity, options = {}) => {
  const {
    duration = 3000,
    delay = 0,
  } = options;

  'worklet';
  translateY.value = withDelay(
    delay,
    withTiming(-500, {
      duration,
      easing: COSMIC_TIMING.easing.smoothIn,
    })
  );

  scale.value = withDelay(
    delay,
    withSequence(
      withTiming(1.1, { duration: duration * 0.2, easing: COSMIC_TIMING.easing.smoothOut }),
      withTiming(0.3, { duration: duration * 0.8, easing: COSMIC_TIMING.easing.smoothIn })
    )
  );

  opacity.value = withDelay(
    delay + duration * 0.7,
    withTiming(0, { duration: duration * 0.3 })
  );
};

/**
 * Creates god rays animation (for Letter to Universe)
 */
export const createGodRaysAnimation = (value, options = {}) => {
  const {
    duration = 4000,
  } = options;

  'worklet';
  value.value = withRepeat(
    withSequence(
      withTiming(1, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle }),
      withTiming(0.5, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle })
    ),
    -1,
    true
  );
};

// ============================================
// INTERPOLATION HELPERS
// ============================================

/**
 * Creates interpolated color value
 */
export const interpolateColor = (value, inputRange, outputRange) => {
  'worklet';
  return interpolate(
    value,
    inputRange,
    outputRange.map((_, i) => i),
    Extrapolation.CLAMP
  );
};

/**
 * Creates interpolated scale with opacity
 */
export const interpolateScaleOpacity = (progress, options = {}) => {
  const {
    scaleRange = [0.8, 1],
    opacityRange = [0, 1],
  } = options;

  'worklet';
  return {
    scale: interpolate(progress.value, [0, 1], scaleRange, Extrapolation.CLAMP),
    opacity: interpolate(progress.value, [0, 1], opacityRange, Extrapolation.CLAMP),
  };
};

// ============================================
// ANIMATION CLEANUP
// ============================================

/**
 * Cancels animation on shared value
 */
export const cancelCosmicAnimation = (value) => {
  'worklet';
  cancelAnimation(value);
};

/**
 * Resets shared value to initial
 */
export const resetAnimation = (value, initial = 0) => {
  'worklet';
  cancelAnimation(value);
  value.value = initial;
};

// ============================================
// ANIMATION PRESETS
// ============================================

export const ANIMATION_PRESETS = {
  // Orb animations
  orbPulse: {
    min: 1,
    max: 1.08,
    duration: 2000,
  },
  orbGlow: {
    min: 0.6,
    max: 1,
    duration: 2500,
  },

  // Button animations
  buttonPress: {
    pressed: 0.95,
    duration: 100,
  },

  // Particle animations
  starTwinkle: {
    minOpacity: 0.3,
    maxOpacity: 1,
    duration: 2000,
  },

  // Breath animations
  breathNormal: {
    inhaleScale: 1.3,
    exhaleScale: 1,
    inhaleDuration: 4000,
    exhaleDuration: 4000,
  },
  breathBox: {
    inhaleScale: 1.3,
    exhaleScale: 1,
    inhaleDuration: 4000,
    holdDuration: 4000,
    exhaleDuration: 4000,
    restDuration: 4000,
  },
  breathRelaxing: {
    inhaleScale: 1.3,
    exhaleScale: 1,
    inhaleDuration: 4000,
    holdDuration: 7000,
    exhaleDuration: 8000,
    restDuration: 0,
  },

  // Celebration animations
  successBurst: {
    targetScale: 1.5,
    duration: 600,
  },
  sparkleExplosion: {
    count: 12,
    radius: 100,
    duration: 1000,
  },

  // Transition animations
  fadeIn: {
    duration: 300,
    delay: 0,
  },
  slideUp: {
    from: 50,
    to: 0,
    duration: 400,
  },
  scaleEntrance: {
    from: 0.8,
    to: 1,
    duration: 400,
  },
};

export default {
  COSMIC_TIMING,
  ANIMATION_PRESETS,
  // Pulse
  createPulseAnimation,
  createHeartbeatAnimation,
  // Glow
  createGlowAnimation,
  createShimmerAnimation,
  // Float
  createFloatAnimation,
  createSwayAnimation,
  // Breath
  createBreathAnimation,
  createBoxBreathAnimation,
  createRelaxingBreathAnimation,
  // Particle
  createParticleAnimation,
  createTwinkleAnimation,
  // Press
  createPressAnimation,
  createReleaseAnimation,
  createLongPressAnimation,
  // Success
  createSuccessAnimation,
  createSparkleAnimation,
  createCounterAnimation,
  // Ripple
  createRippleAnimation,
  createExpandingRingsAnimation,
  // Transition
  createFadeInAnimation,
  createFadeOutAnimation,
  createSlideUpAnimation,
  createScaleEntranceAnimation,
  // Ritual-specific
  createEnergyFlowAnimation,
  createFlameFlickerAnimation,
  createBurnAnimation,
  createShootingStarAnimation,
  createLetterFlyAnimation,
  createGodRaysAnimation,
  // Helpers
  interpolateColor,
  interpolateScaleOpacity,
  cancelCosmicAnimation,
  resetAnimation,
};
