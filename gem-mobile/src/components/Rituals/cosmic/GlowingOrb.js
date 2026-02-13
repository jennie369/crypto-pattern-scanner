/**
 * GlowingOrb - PERFORMANCE OPTIMIZED
 * Single animation driver, removed setTimeout, simplified glow
 */

import React, { useEffect, useCallback, memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { COSMIC_COLORS } from '../../../theme/cosmicTokens';

// Simplified single ripple
const Ripple = memo(({ size, color, driver, index }) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Use driver to create wave effect with offset per ring
    const phase = driver.value + (index * 2);
    const progress = (phase % (Math.PI * 2)) / (Math.PI * 2);
    const scale = 1 + progress * 1.5;
    const opacity = 0.4 * (1 - progress);

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [driver, index]);

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

// Simple glow layer
const GlowLayer = memo(({ size, color, blur, driver, baseOpacity }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = baseOpacity + 0.15 * Math.sin(driver.value);
    return { opacity };
  }, [driver, baseOpacity]);

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
          shadowOpacity: 0.6,
          shadowRadius: blur,
        },
        animatedStyle,
      ]}
    />
  );
});

const GlowingOrb = ({
  size = 150,
  color = COSMIC_COLORS.ritualThemes.heart.primary,
  secondaryColor = null,
  gradient = null,
  icon = null,
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
  // SINGLE animation driver
  const animationDriver = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const secondary = secondaryColor || color;
  const gradientColors = gradient || [color, secondary, color];

  // Single continuous pulse animation
  useEffect(() => {
    if (!disabled) {
      animationDriver.value = withRepeat(
        withTiming(Math.PI * 2, {
          duration: pulseSpeed,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [disabled, pulseSpeed]);

  // Haptic feedback
  const triggerHaptic = useCallback((type = 'light') => {
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  // Gesture handlers
  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      pressScale.value = withTiming(0.95, { duration: 80 });
      runOnJS(triggerHaptic)('light');
    })
    .onEnd(() => {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(300)
    .onStart(() => {
      pressScale.value = withTiming(1.1, { duration: 300 });
      runOnJS(triggerHaptic)('medium');
      if (onLongPressStart) {
        runOnJS(onLongPressStart)();
      }
    })
    .onEnd(() => {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
      if (onLongPressEnd) {
        runOnJS(onLongPressEnd)();
      }
    })
    .onFinalize(() => {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });

  const composedGestures = Gesture.Exclusive(longPressGesture, tapGesture);

  // Animated container style
  const containerStyle = useAnimatedStyle(() => {
    const pulseScale = 1 + 0.05 * Math.sin(animationDriver.value);
    return {
      transform: [{ scale: pressScale.value * pulseScale }],
    };
  }, [animationDriver, pressScale]);

  // Sizes
  const outerGlowSize = size * 1.5;
  const midGlowSize = size * 1.25;
  const innerSize = size;

  return (
    <View style={[styles.container, { width: outerGlowSize, height: outerGlowSize }, style]}>
      {/* Ripples - only 2 instead of 3 */}
      {showRipples && [0, 1].map((index) => (
        <Ripple
          key={index}
          size={innerSize}
          color={color}
          driver={animationDriver}
          index={index}
        />
      ))}

      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.orbContainer, containerStyle]}>
          {/* Outer glow */}
          <GlowLayer
            size={outerGlowSize}
            color={color}
            blur={30}
            driver={animationDriver}
            baseOpacity={0.25 * glowIntensity}
          />

          {/* Mid glow */}
          <GlowLayer
            size={midGlowSize}
            color={secondary}
            blur={20}
            driver={animationDriver}
            baseOpacity={0.4 * glowIntensity}
          />

          {/* Inner orb */}
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
              style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 0.5 }}
            />

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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

export default memo(GlowingOrb);
