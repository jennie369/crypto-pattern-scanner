/**
 * GlowButton - Glowing CTA button for rituals
 * Features gradient background, glow effect, press animation
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import {
  COSMIC_COLORS,
  COSMIC_RADIUS,
  COSMIC_SPACING,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================
// BUTTON VARIANTS
// ============================================

const VARIANTS = {
  primary: {
    gradient: [COSMIC_COLORS.glow.purple, COSMIC_COLORS.glow.cyan],
    textColor: COSMIC_COLORS.text.primary,
    glowColor: COSMIC_COLORS.glow.purple,
  },
  heart: {
    gradient: COSMIC_COLORS.ritualThemes.heart.gradient,
    textColor: COSMIC_COLORS.text.primary,
    glowColor: COSMIC_COLORS.ritualThemes.heart.glow,
  },
  gratitude: {
    gradient: COSMIC_COLORS.ritualThemes.gratitude.gradient,
    textColor: COSMIC_COLORS.bgDeepSpace,
    glowColor: COSMIC_COLORS.ritualThemes.gratitude.glow,
  },
  breath: {
    gradient: COSMIC_COLORS.ritualThemes.breath.gradient,
    textColor: COSMIC_COLORS.bgDeepSpace,
    glowColor: COSMIC_COLORS.ritualThemes.breath.glow,
  },
  water: {
    gradient: COSMIC_COLORS.ritualThemes.water.gradient,
    textColor: COSMIC_COLORS.text.primary,
    glowColor: COSMIC_COLORS.ritualThemes.water.glow,
  },
  letter: {
    gradient: COSMIC_COLORS.ritualThemes.letter.gradient,
    textColor: COSMIC_COLORS.text.primary,
    glowColor: COSMIC_COLORS.ritualThemes.letter.glow,
  },
  burn: {
    gradient: COSMIC_COLORS.ritualThemes.burn.gradient,
    textColor: COSMIC_COLORS.text.primary,
    glowColor: COSMIC_COLORS.ritualThemes.burn.glow,
  },
  star: {
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0'],
    textColor: COSMIC_COLORS.bgDeepSpace,
    glowColor: COSMIC_COLORS.ritualThemes.star.glow,
  },
  ghost: {
    gradient: ['transparent', 'transparent'],
    textColor: COSMIC_COLORS.text.primary,
    glowColor: 'transparent',
    borderColor: COSMIC_COLORS.glass.border,
  },
  outline: {
    gradient: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
    textColor: COSMIC_COLORS.text.primary,
    glowColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: COSMIC_COLORS.glass.border,
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

const GlowButton = ({
  label,
  icon = null, // Lucide icon element
  iconPosition = 'left', // 'left' | 'right'
  variant = 'primary',
  customGradient = null,
  customGlowColor = null,
  size = 'medium', // 'small' | 'medium' | 'large'
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  style,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  // Get variant styles
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const gradientColors = customGradient || variantStyle.gradient;
  const glowColor = customGlowColor || variantStyle.glowColor;
  const textColor = variantStyle.textColor;
  const borderColor = variantStyle.borderColor;

  // Size configurations
  const sizeConfig = {
    small: {
      paddingVertical: COSMIC_SPACING.sm,
      paddingHorizontal: COSMIC_SPACING.md,
      fontSize: 14,
      iconSize: 16,
      borderRadius: COSMIC_RADIUS.md,
    },
    medium: {
      paddingVertical: COSMIC_SPACING.md,
      paddingHorizontal: COSMIC_SPACING.lg,
      fontSize: 16,
      iconSize: 20,
      borderRadius: COSMIC_RADIUS.lg,
    },
    large: {
      paddingVertical: COSMIC_SPACING.lg,
      paddingHorizontal: COSMIC_SPACING.xl,
      fontSize: 18,
      iconSize: 24,
      borderRadius: COSMIC_RADIUS.xl,
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle press
  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  // Gesture handler
  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onStart(() => {
      scale.value = withTiming(0.95, { duration: 100, easing: COSMIC_TIMING.easing.smooth });
      glowOpacity.value = withTiming(0.9, { duration: 100 });
      runOnJS(triggerHaptic)();
    })
    .onEnd(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      glowOpacity.value = withTiming(0.6, { duration: 200 });
      runOnJS(handlePress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      glowOpacity.value = withTiming(0.6, { duration: 200 });
    });

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;
    return React.cloneElement(icon, {
      size: currentSize.iconSize,
      color: textColor,
      strokeWidth: 2,
    });
  };

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.container,
          { borderRadius: currentSize.borderRadius },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          containerStyle,
          style,
        ]}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              borderRadius: currentSize.borderRadius,
              backgroundColor: glowColor,
              shadowColor: glowColor,
            },
            glowStyle,
          ]}
        />

        {/* Button background */}
        <View
          style={[
            styles.buttonWrapper,
            {
              borderRadius: currentSize.borderRadius,
              borderColor: borderColor || 'transparent',
              borderWidth: borderColor ? 1 : 0,
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={[
              styles.button,
              {
                paddingVertical: currentSize.paddingVertical,
                paddingHorizontal: currentSize.paddingHorizontal,
                borderRadius: currentSize.borderRadius,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Inner highlight */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'transparent']}
              style={[StyleSheet.absoluteFill, { opacity: 0.5, borderRadius: currentSize.borderRadius }]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
            />

            {/* Content */}
            <View style={styles.content}>
              {loading ? (
                <ActivityIndicator color={textColor} size="small" />
              ) : (
                <>
                  {icon && iconPosition === 'left' && (
                    <View style={styles.iconLeft}>{renderIcon()}</View>
                  )}
                  {label && (
                    <Text
                      style={[
                        styles.label,
                        {
                          fontSize: currentSize.fontSize,
                          color: textColor,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  )}
                  {icon && iconPosition === 'right' && (
                    <View style={styles.iconRight}>{renderIcon()}</View>
                  )}
                </>
              )}
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

// ============================================
// ICON BUTTON VARIANT
// ============================================

export const GlowIconButton = ({
  icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);

  const sizeConfig = {
    small: { size: 36, iconSize: 18 },
    medium: { size: 48, iconSize: 24 },
    large: { size: 60, iconSize: 30 },
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      scale.value = withTiming(0.9, { duration: 100 });
      runOnJS(triggerHaptic)();
    })
    .onEnd(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      if (onPress) {
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.iconButton,
          {
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
          },
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={variantStyle.gradient}
          style={[StyleSheet.absoluteFill, { borderRadius: config.size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {React.cloneElement(icon, {
          size: config.iconSize,
          color: variantStyle.textColor,
          strokeWidth: 2,
        })}
      </Animated.View>
    </GestureDetector>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonWrapper: {
    overflow: 'hidden',
  },
  button: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: COSMIC_SPACING.sm,
  },
  iconRight: {
    marginLeft: COSMIC_SPACING.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default React.memo(GlowButton);
