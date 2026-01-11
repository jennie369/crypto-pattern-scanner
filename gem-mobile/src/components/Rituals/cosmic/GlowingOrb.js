/**
 * GlowingOrb - Central ritual orb with multi-layer glow and animations
 * Features pulse, glow, press feedback, and ripple effects
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { COSMIC_COLORS, COSMIC_SHADOWS } from '../../../theme/cosmicTokens';
import { COSMIC_TIMING, ANIMATION_PRESETS } from '../../../utils/cosmicAnimations';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ============================================
// RIPPLE COMPONENT
// ============================================

const Ripple = React.memo(({ size, color, index, active }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      const delay = index * 200;
      setTimeout(() => {
        scale.value = 1;
        opacity.value = 0.4;
        scale.value = withTiming(2.5, { duration: 1000, easing: COSMIC_TIMING.easing.smoothOut });
        opacity.value = withTiming(0, { duration: 1000, easing: COSMIC_TIMING.easing.smoothOut });
      }, delay);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// GLOW LAYER COMPONENT
// ============================================

const GlowLayer = React.memo(({ size, color, blur, animatedOpacity }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.glowLayer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: blur,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const GlowingOrb = ({
  size = 150,
  color = COSMIC_COLORS.ritualThemes.heart.primary,
  secondaryColor = null,
  gradient = null, // Array of colors for gradient
  icon = null, // React element (e.g., Lucide icon)
  iconSize = 60,
  pulseSpeed = 2000,
  glowIntensity = 1,
  disabled = false,
  onPress,
  onLongPress,
  onLongPressStart,
  onLongPressEnd,
  showRipples = true,
  style,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const outerGlowOpacity = useSharedValue(0.3);
  const rippleActive = useSharedValue(false);
  const isLongPressing = useSharedValue(false);

  // Secondary color fallback
  const secondary = secondaryColor || color;

  // Gradient colors fallback
  const gradientColors = gradient || [color, secondary, color];

  // Start pulse animation
  useEffect(() => {
    if (!disabled) {
      // Pulse scale
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.cosmic }),
          withTiming(1, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.cosmic })
        ),
        -1,
        true
      );

      // Glow intensity animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8 * glowIntensity, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.5 * glowIntensity, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      );

      // Outer glow animation
      outerGlowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4 * glowIntensity, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.2 * glowIntensity, { duration: pulseSpeed / 2, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      );
    }
  }, [disabled, pulseSpeed, glowIntensity]);

  // Haptic feedback
  const triggerHaptic = useCallback((type = 'light') => {
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'heavy') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      scale.value = withTiming(0.95, { duration: 100 });
      runOnJS(triggerHaptic)('light');
    })
    .onEnd(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      if (showRipples) {
        rippleActive.value = !rippleActive.value;
      }
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(300)
    .onStart(() => {
      isLongPressing.value = true;
      scale.value = withTiming(1.15, { duration: 500, easing: COSMIC_TIMING.easing.smoothOut });
      runOnJS(triggerHaptic)('medium');
      if (onLongPressStart) {
        runOnJS(onLongPressStart)();
      }
    })
    .onEnd(() => {
      isLongPressing.value = false;
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
      if (onLongPressEnd) {
        runOnJS(onLongPressEnd)();
      }
    })
    .onFinalize(() => {
      isLongPressing.value = false;
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      if (onLongPressEnd) {
        runOnJS(onLongPressEnd)();
      }
    });

  const composedGestures = Gesture.Exclusive(longPressGesture, tapGesture);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
    ],
  }));

  // Sizes
  const outerGlowSize = size * 1.6;
  const midGlowSize = size * 1.3;
  const innerSize = size;

  return (
    <View style={[styles.container, { width: outerGlowSize, height: outerGlowSize }, style]}>
      {/* Ripple effects */}
      {showRipples && [0, 1, 2].map((index) => (
        <Ripple
          key={index}
          size={innerSize}
          color={color}
          index={index}
          active={rippleActive.value}
        />
      ))}

      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.orbContainer, containerStyle]}>
          {/* Outer glow layer */}
          <GlowLayer
            size={outerGlowSize}
            color={color}
            blur={40}
            animatedOpacity={outerGlowOpacity}
          />

          {/* Mid glow layer */}
          <GlowLayer
            size={midGlowSize}
            color={secondary}
            blur={25}
            animatedOpacity={glowOpacity}
          />

          {/* Inner orb with gradient */}
          <View style={[styles.innerOrb, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
            <LinearGradient
              colors={gradientColors}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Highlight */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 0.5 }}
            />

            {/* Inner shadow */}
            <View style={styles.innerShadow} />

            {/* Icon */}
            {icon && (
              <View style={styles.iconContainer}>
                {React.cloneElement(icon, {
                  size: iconSize,
                  color: COSMIC_COLORS.text.primary,
                  strokeWidth: 1.5,
                })}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
  innerOrb: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android elevation
    elevation: 8,
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 2,
  },
});

export default React.memo(GlowingOrb);
