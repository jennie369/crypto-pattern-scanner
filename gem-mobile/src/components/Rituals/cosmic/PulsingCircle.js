/**
 * PulsingCircle - Breathing indicator with multiple patterns
 * Supports box breathing (4-4-4-4), relaxing (4-7-8), and custom patterns
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  COSMIC_COLORS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

// ============================================
// BREATHING PATTERNS
// ============================================

const BREATH_PATTERNS = {
  // Simple inhale-exhale
  'inhale-exhale': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 4000, scale: 1 },
    ],
  },
  // Box breathing: 4-4-4-4
  'box': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'hold', label: 'Giữ', duration: 4000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 4000, scale: 1 },
      { name: 'rest', label: 'Nghỉ', duration: 4000, scale: 1 },
    ],
  },
  // Relaxing breath: 4-7-8
  'relaxing': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 4000, scale: 1.3 },
      { name: 'hold', label: 'Giữ', duration: 7000, scale: 1.3 },
      { name: 'exhale', label: 'Thở ra', duration: 8000, scale: 1 },
    ],
  },
  // Energizing breath: 2-2-2
  'energizing': {
    phases: [
      { name: 'inhale', label: 'Hít vào', duration: 2000, scale: 1.2 },
      { name: 'exhale', label: 'Thở ra', duration: 2000, scale: 1 },
    ],
  },
};

// Phase colors
const PHASE_COLORS = {
  inhale: COSMIC_COLORS.ritualThemes.breath.phases.inhale,
  hold: COSMIC_COLORS.ritualThemes.breath.phases.hold,
  exhale: COSMIC_COLORS.ritualThemes.breath.phases.exhale,
  rest: COSMIC_COLORS.ritualThemes.breath.phases.rest,
};

// ============================================
// GLOW RING COMPONENT
// ============================================

const GlowRing = React.memo(({ size, color, opacity, blur }) => {
  return (
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
  );
});

// ============================================
// PHASE INDICATOR DOTS
// ============================================

const PhaseIndicatorDots = React.memo(({ phases, currentPhaseIndex }) => {
  return (
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
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const PulsingCircle = ({
  size = 200,
  pattern = 'box', // 'inhale-exhale' | 'box' | 'relaxing' | 'energizing' | custom
  customPattern = null, // { phases: [...] }
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
  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const currentColor = useSharedValue(color);

  // State
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState('');

  // Refs
  const timerRef = useRef(null);
  const cycleRef = useRef(1);
  const phaseIndexRef = useRef(0);

  // Get pattern
  const breathPattern = customPattern || BREATH_PATTERNS[pattern] || BREATH_PATTERNS['box'];
  const phases = breathPattern.phases;

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

  // Update phase info
  const updatePhaseInfo = useCallback((phase, index) => {
    setCurrentPhaseIndex(index);
    setPhaseLabel(phase.label);
    setPhaseTimeRemaining(Math.ceil(phase.duration / 1000));

    if (onPhaseChange) {
      onPhaseChange(phase.name, index, cycleRef.current);
    }
  }, [onPhaseChange]);

  // Run animation for a single phase
  const runPhase = useCallback((phase, index) => {
    'worklet';
    const easing = COSMIC_TIMING.easing.breath;

    // Scale animation
    scale.value = withTiming(phase.scale, {
      duration: phase.duration,
      easing,
    });

    // Glow animation
    const targetGlow = phase.scale > 1 ? 0.6 : 0.3;
    glowOpacity.value = withTiming(targetGlow, {
      duration: phase.duration,
      easing,
    });
  }, []);

  // Run breathing cycle
  const runBreathingCycle = useCallback(() => {
    if (!isActive) return;

    const runNextPhase = (phaseIndex) => {
      if (!isActive) return;

      const phase = phases[phaseIndex];
      phaseIndexRef.current = phaseIndex;

      // Update UI
      runOnJS(updatePhaseInfo)(phase, phaseIndex);
      runOnJS(triggerHaptic)(phase.name);

      // Run animation
      runPhase(phase, phaseIndex);

      // Start countdown timer
      let timeLeft = Math.ceil(phase.duration / 1000);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setPhaseTimeRemaining(Math.max(0, timeLeft));
      }, 1000);

      // Schedule next phase
      setTimeout(() => {
        clearInterval(timerRef.current);

        const nextPhaseIndex = (phaseIndex + 1) % phases.length;

        // Check if cycle completed
        if (nextPhaseIndex === 0) {
          cycleRef.current += 1;
          setCurrentCycle(cycleRef.current);

          if (onCycleComplete) {
            onCycleComplete(cycleRef.current - 1);
          }

          // Check if all cycles completed
          if (cycles > 0 && cycleRef.current > cycles) {
            setIsActive(false);
            if (onComplete) {
              onComplete();
            }
            return;
          }
        }

        // Run next phase
        runNextPhase(nextPhaseIndex);
      }, phase.duration);
    };

    // Start from first phase
    runNextPhase(0);
  }, [isActive, phases, cycles, onCycleComplete, onComplete, runPhase, updatePhaseInfo, triggerHaptic]);

  // Start/stop effect
  useEffect(() => {
    if (isActive) {
      cycleRef.current = 1;
      phaseIndexRef.current = 0;
      setCurrentCycle(1);
      runBreathingCycle();
    }

    return () => {
      clearInterval(timerRef.current);
      cancelAnimation(scale);
      cancelAnimation(glowOpacity);
    };
  }, [isActive]);

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

  // Calculate sizes
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
        {/* Background circle */}
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
                <Text style={styles.timer}>
                  {phaseTimeRemaining}s
                </Text>
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
// CONTROL METHODS (for external control)
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
