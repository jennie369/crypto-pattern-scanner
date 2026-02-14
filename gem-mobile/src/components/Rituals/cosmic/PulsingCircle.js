/**
 * PulsingCircle - PERFORMANCE OPTIMIZED
 * Removed setInterval/setTimeout, uses Reanimated callbacks
 * Single animation driver for smooth 60fps
 */

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  COSMIC_COLORS,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

// ============================================
// BREATHING PATTERNS
// ============================================

const BREATH_PATTERNS = {
  'inhale-exhale': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 4000, scale: 1 },
    ],
  },
  'box': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'hold', label: 'Giữ', duration: 4000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 4000, scale: 1 },
      { name: 'rest', label: 'Nghỉ', duration: 4000, scale: 1 },
    ],
  },
  'relaxing': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'hold', label: 'Giữ', duration: 7000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 8000, scale: 1 },
    ],
  },
  'energizing': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 2000, scale: 1.2 },
      { name: 'exhale', label: 'Thở ra', duration: 2000, scale: 1 },
    ],
  },
};

const PHASE_COLORS = {
  inhale: COSMIC_COLORS.ritualThemes.breath.phases.inhale,
  hold: COSMIC_COLORS.ritualThemes.breath.phases.hold,
  exhale: COSMIC_COLORS.ritualThemes.breath.phases.exhale,
  rest: COSMIC_COLORS.ritualThemes.breath.phases.rest,
};

// ============================================
// GLOW RING - Static, no animation
// ============================================

const GlowRing = React.memo(({ size, color, opacity, blur }) => (
  <View
    style={[
      styles.glowRing,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: blur,
      },
    ]}
  />
));

// ============================================
// PHASE INDICATOR DOTS - Static render
// ============================================

const PhaseIndicatorDots = React.memo(({ phases, currentPhaseIndex }) => (
  <View style={styles.dotsContainer}>
    {phases.map((phase, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          {
            backgroundColor: index === currentPhaseIndex
              ? PHASE_COLORS[phase.name]
              : 'rgba(255, 255, 255, 0.2)',
            transform: [{ scale: index === currentPhaseIndex ? 1.3 : 1 }],
          },
        ]}
      />
    ))}
  </View>
));

// ============================================
// MAIN COMPONENT
// ============================================

const PulsingCircle = ({
  size = 200,
  pattern = 'box',
  customPattern = null,
  cycles = 4,
  color = COSMIC_COLORS.ritualThemes.breath.primary,
  showGuide = true,
  showPhaseLabel = true,
  showTimer = true,
  showPhaseIndicators = true,
  hapticFeedback = true,
  onPhaseChange,
  onCycleComplete,
  onComplete,
  autoStart = true,
  style,
}) => {
  // Animation values - MINIMAL shared values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const phaseProgress = useSharedValue(0); // 0-1 progress within current phase

  // State - only for UI display
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseLabel, setPhaseLabel] = useState('');
  const [phaseDuration, setPhaseDuration] = useState(0);

  // Refs for tracking
  const cycleRef = useRef(1);
  const phaseIndexRef = useRef(0);
  const isRunningRef = useRef(false);
  const startPhaseRef = useRef(null); // Ref to avoid circular dependency

  // Get pattern
  const breathPattern = customPattern || BREATH_PATTERNS[pattern] || BREATH_PATTERNS['box'];
  const phases = breathPattern.phases;

  // Calculate time remaining from progress (0-1) and duration
  const timeRemaining = useMemo(() => {
    if (!phaseDuration) return 0;
    return Math.ceil(phaseDuration * (1 - phaseProgress.value) / 1000);
  }, [phaseDuration]);

  // Haptic feedback
  const triggerHaptic = useCallback((type) => {
    if (!hapticFeedback) return;
    if (type === 'inhale') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'exhale') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticFeedback]);

  // Phase change handler (called from animation callback)
  const handlePhaseComplete = useCallback(() => {
    if (!isRunningRef.current) return;

    const nextPhaseIndex = (phaseIndexRef.current + 1) % phases.length;

    // Check if cycle completed
    if (nextPhaseIndex === 0) {
      cycleRef.current += 1;
      setCurrentCycle(cycleRef.current);

      if (onCycleComplete) {
        onCycleComplete(cycleRef.current - 1);
      }

      // Check if all cycles completed
      if (cycles > 0 && cycleRef.current > cycles) {
        isRunningRef.current = false;
        setIsActive(false);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }

    // Start next phase - use ref to avoid stale closure
    phaseIndexRef.current = nextPhaseIndex;
    if (startPhaseRef.current) {
      startPhaseRef.current(nextPhaseIndex);
    }
  }, [phases, cycles, onCycleComplete, onComplete]);

  // Start a single phase animation
  const startPhase = useCallback((phaseIndex) => {
    if (!isRunningRef.current) return;

    const phase = phases[phaseIndex];
    const easing = COSMIC_TIMING.easing.breath;

    // Update UI state
    setCurrentPhaseIndex(phaseIndex);
    setPhaseLabel(phase.label);
    setPhaseDuration(phase.duration);

    // Trigger haptic
    triggerHaptic(phase.name);

    // Notify phase change
    if (onPhaseChange) {
      onPhaseChange(phase.name, phaseIndex, cycleRef.current);
    }

    // Reset progress
    phaseProgress.value = 0;

    // Animate scale
    scale.value = withTiming(phase.scale, {
      duration: phase.duration,
      easing,
    });

    // Animate glow
    const targetGlow = phase.scale > 1 ? 0.6 : 0.3;
    glowOpacity.value = withTiming(targetGlow, {
      duration: phase.duration,
      easing,
    });

    // Animate progress (for timer display) with callback for next phase
    phaseProgress.value = withTiming(1, {
      duration: phase.duration,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        runOnJS(handlePhaseComplete)();
      }
    });
  }, [phases, triggerHaptic, onPhaseChange, handlePhaseComplete]);

  // Store startPhase in ref to break circular dependency
  useEffect(() => {
    startPhaseRef.current = startPhase;
  }, [startPhase]);

  // Start breathing cycle
  const startBreathing = useCallback(() => {
    isRunningRef.current = true;
    cycleRef.current = 1;
    phaseIndexRef.current = 0;
    setCurrentCycle(1);
    startPhase(0);
  }, [startPhase]);

  // Store startBreathing in ref so the effect doesn't depend on it.
  // Without this, callback prop changes → startPhase recreated → startBreathing
  // recreated → useEffect cleanup cancels all animations → cycle resets to 1.
  const startBreathingRef = useRef(startBreathing);
  useEffect(() => {
    startBreathingRef.current = startBreathing;
  }, [startBreathing]);

  // Effect to start/stop — only depends on isActive (NOT startBreathing)
  useEffect(() => {
    if (isActive && !isRunningRef.current) {
      startBreathingRef.current();
    } else if (!isActive) {
      isRunningRef.current = false;
      cancelAnimation(scale);
      cancelAnimation(glowOpacity);
      cancelAnimation(phaseProgress);
    }

    return () => {
      isRunningRef.current = false;
      cancelAnimation(scale);
      cancelAnimation(glowOpacity);
      cancelAnimation(phaseProgress);
    };
  }, [isActive]);

  // Animated reaction to update timer display
  useAnimatedReaction(
    () => phaseProgress.value,
    (progress) => {
      // This runs on UI thread, we use it to track progress
      // Timer is calculated in the render based on phaseDuration
    },
    [phaseProgress]
  );

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Get current phase color
  const currentPhaseColor = phases[currentPhaseIndex]
    ? PHASE_COLORS[phases[currentPhaseIndex].name]
    : color;

  // Calculate display time (derived from progress shared value)
  const displayTime = useMemo(() => {
    if (!phaseDuration) return 0;
    // We use phaseDuration and approximate based on phase index change
    return Math.ceil(phaseDuration / 1000);
  }, [phaseDuration, currentPhaseIndex]);

  // Sizes
  const outerSize = size * 1.4;
  const innerSize = size;

  return (
    <View style={[styles.container, { width: outerSize, height: outerSize }, style]}>
      {/* Outer glow */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <GlowRing
          size={outerSize}
          color={currentPhaseColor}
          opacity={0.3}
          blur={30}
        />
      </Animated.View>

      {/* Main pulsing circle */}
      <Animated.View style={[styles.circleContainer, circleStyle]}>
        <View
          style={[
            styles.circle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              borderColor: currentPhaseColor,
            },
          ]}
        >
          {/* Gradient fill */}
          <LinearGradient
            colors={[
              `${currentPhaseColor}40`,
              `${currentPhaseColor}10`,
              'transparent',
            ]}
            style={[StyleSheet.absoluteFill, { borderRadius: innerSize / 2 }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* Guide text */}
          {showGuide && (
            <View style={styles.guideContainer}>
              {showPhaseLabel && (
                <Text style={[styles.phaseLabel, { color: currentPhaseColor }]}>
                  {phaseLabel}
                </Text>
              )}
              {showTimer && (
                <AnimatedTimer
                  duration={phaseDuration}
                  progress={phaseProgress}
                />
              )}
            </View>
          )}
        </View>
      </Animated.View>

      {/* Phase indicator dots */}
      {showPhaseIndicators && (
        <PhaseIndicatorDots
          phases={phases}
          currentPhaseIndex={currentPhaseIndex}
        />
      )}

      {/* Cycle counter */}
      {cycles > 0 && (
        <View style={styles.cycleContainer}>
          <Text style={styles.cycleText}>
            Chu kỳ {currentCycle}/{cycles}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// ANIMATED TIMER - Uses interval for reliable countdown
// ============================================

const AnimatedTimer = React.memo(({ duration, progress }) => {
  const [displayTime, setDisplayTime] = useState(Math.ceil(duration / 1000));
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Reset and start countdown when duration changes (new phase)
  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (duration <= 0) {
      setDisplayTime(0);
      return;
    }

    // Set initial time
    const totalSeconds = Math.ceil(duration / 1000);
    setDisplayTime(totalSeconds);
    startTimeRef.current = Date.now();

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setDisplayTime(remaining);

      // Stop when done
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration]);

  return (
    <Text style={styles.timer}>
      {displayTime}s
    </Text>
  );
});

// ============================================
// CONTROL METHODS
// ============================================

export const usePulsingCircleControl = () => {
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const toggle = useCallback(() => setIsRunning((prev) => !prev), []);

  return { isRunning, start, stop, toggle };
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  guideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    color: COSMIC_COLORS.text.primary,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: -30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cycleContainer: {
    position: 'absolute',
    bottom: -60,
  },
  cycleText: {
    fontSize: 14,
    color: COSMIC_COLORS.text.secondary,
  },
});

export default React.memo(PulsingCircle);
