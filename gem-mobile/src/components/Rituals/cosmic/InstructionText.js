/**
 * InstructionText - PERFORMANCE OPTIMIZED
 * Replaced setTimeout with Reanimated callbacks
 * Smooth 60fps text animations
 */

import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import {
  COSMIC_COLORS,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

// ============================================
// MAIN COMPONENT
// ============================================

const InstructionText = ({
  text,
  variant = 'default', // 'default' | 'large' | 'small' | 'hint'
  color = COSMIC_COLORS.text.primary,
  glowColor = null,
  animate = true, // Fade in animation
  pulse = false, // Continuous pulse
  delay = 0,
  align = 'center',
  style,
}) => {
  // Animation values
  const opacity = useSharedValue(animate ? 0 : 1);
  const scale = useSharedValue(animate ? 0.95 : 1);
  const glowOpacity = useSharedValue(0.5);

  // Get variant styles
  const variantStyles = {
    default: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 28,
    },
    large: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 34,
    },
    small: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 22,
    },
    hint: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
      color: COSMIC_COLORS.text.hint,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  // Animation effects
  useEffect(() => {
    if (animate) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: COSMIC_TIMING.easing.smooth }));
      scale.value = withDelay(delay, withTiming(1, { duration: 400, easing: COSMIC_TIMING.easing.smooth }));
    }

    if (pulse) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.4, { duration: 1500, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      );
    }
  }, [animate, pulse, delay]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textColor = currentVariant.color || color;
  const shadowColor = glowColor || textColor;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {/* Glow layer */}
      {glowColor && (
        <Animated.View style={[styles.glowLayer, glowStyle]}>
          <Text
            style={[
              styles.glowText,
              {
                fontSize: currentVariant.fontSize,
                fontWeight: currentVariant.fontWeight,
                textAlign: align,
                color: 'transparent',
                textShadowColor: shadowColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              },
            ]}
          >
            {text}
          </Text>
        </Animated.View>
      )}

      {/* Main text */}
      <Text
        style={[
          styles.text,
          {
            fontSize: currentVariant.fontSize,
            fontWeight: currentVariant.fontWeight,
            lineHeight: currentVariant.lineHeight,
            color: textColor,
            textAlign: align,
            textShadowColor: glowColor ? shadowColor : 'transparent',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: glowColor ? 10 : 0,
          },
        ]}
      >
        {text}
      </Text>
    </Animated.View>
  );
};

// ============================================
// ANIMATED INSTRUCTION (with phase changes) - OPTIMIZED
// Uses Reanimated callbacks instead of setTimeout
// ============================================

export const AnimatedInstruction = ({
  instructions = [], // Array of { text, duration }
  variant = 'default',
  color,
  glowColor,
  onComplete,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const opacity = useSharedValue(1);
  const isTransitioning = React.useRef(false);

  // Move to next instruction (called from animation callback)
  const moveToNext = useCallback(() => {
    isTransitioning.current = false;
    setCurrentIndex(prev => prev + 1);
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  // Handle completion
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Schedule transition using Reanimated
  const scheduleTransition = useCallback((duration) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    // Use a "hold" animation that triggers callback after duration
    opacity.value = withSequence(
      // Hold at current opacity for duration
      withTiming(1, { duration: duration - 300 }),
      // Then fade out
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(moveToNext)();
        }
      })
    );
  }, [moveToNext]);

  React.useEffect(() => {
    if (currentIndex >= instructions.length) {
      handleComplete();
      return;
    }

    const instruction = instructions[currentIndex];
    scheduleTransition(instruction.duration);
  }, [currentIndex, instructions, scheduleTransition, handleComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (currentIndex >= instructions.length) return null;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <InstructionText
        text={instructions[currentIndex].text}
        variant={variant}
        color={color}
        glowColor={glowColor}
        animate={false}
      />
    </Animated.View>
  );
};

// ============================================
// STYLED VARIATIONS
// ============================================

export const TitleText = ({ text, color, style }) => (
  <InstructionText
    text={text}
    variant="large"
    color={color || COSMIC_COLORS.text.primary}
    glowColor={color}
    animate={true}
    style={style}
  />
);

export const SubtitleText = ({ text, style }) => (
  <InstructionText
    text={text}
    variant="default"
    color={COSMIC_COLORS.text.secondary}
    animate={true}
    delay={100}
    style={style}
  />
);

export const HintText = ({ text, style }) => (
  <InstructionText
    text={text}
    variant="hint"
    animate={true}
    delay={200}
    style={style}
  />
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowText: {
    position: 'absolute',
    width: '100%',
  },
  text: {
    position: 'relative',
    zIndex: 1,
  },
});

export default React.memo(InstructionText);
