/**
 * GlassCard - Glassmorphism card component for rituals
 * Features blur effect, gradient borders, glow effects
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COSMIC_COLORS, GLASS_STYLES, COSMIC_RADIUS, COSMIC_SPACING } from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ============================================
// GLOW BORDER COMPONENT
// ============================================

const GlowBorder = React.memo(({ color, intensity, animated }) => {
  const opacity = useSharedValue(intensity);

  useEffect(() => {
    if (animated) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(intensity * 1.3, { duration: 2000, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(intensity * 0.7, { duration: 2000, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      );
    }
  }, [animated, intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.glowBorder, animatedStyle]}>
      <View
        style={[
          styles.glowBorderInner,
          {
            shadowColor: color,
            shadowOpacity: 0.6,
            shadowRadius: 15,
          },
        ]}
      />
    </Animated.View>
  );
});

// ============================================
// GRADIENT BORDER COMPONENT
// ============================================

const GradientBorder = React.memo(({ colors, width = 1 }) => (
  <View style={[styles.gradientBorderContainer, { padding: width }]}>
    <LinearGradient
      colors={colors}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  </View>
));

// ============================================
// MAIN COMPONENT
// ============================================

const GlassCard = ({
  variant = 'default', // 'default' | 'glow' | 'border' | 'subtle'
  glowColor = COSMIC_COLORS.glow.purple,
  glowIntensity = 0.5,
  animatedGlow = false,
  borderGradient = null, // Array of colors for gradient border
  borderWidth = 1,
  blurIntensity = 20,
  padding = COSMIC_SPACING.lg,
  borderRadius = COSMIC_RADIUS.lg,
  style,
  children,
}) => {
  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'glow':
        return {
          showGlow: true,
          borderColor: COSMIC_COLORS.glass.borderGlow,
          backgroundColor: COSMIC_COLORS.glass.bg,
        };
      case 'border':
        return {
          showGlow: false,
          borderColor: 'transparent',
          backgroundColor: COSMIC_COLORS.glass.bgLight,
          showGradientBorder: true,
        };
      case 'subtle':
        return {
          showGlow: false,
          borderColor: COSMIC_COLORS.glass.border,
          backgroundColor: COSMIC_COLORS.glass.bgDark,
        };
      default:
        return {
          showGlow: false,
          borderColor: COSMIC_COLORS.glass.border,
          backgroundColor: COSMIC_COLORS.glass.bg,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Glow effect layer */}
      {variantStyles.showGlow && (
        <GlowBorder
          color={glowColor}
          intensity={glowIntensity}
          animated={animatedGlow}
        />
      )}

      {/* Gradient border layer */}
      {variantStyles.showGradientBorder && borderGradient && (
        <GradientBorder colors={borderGradient} width={borderWidth} />
      )}

      {/* Main card with blur */}
      <View
        style={[
          styles.card,
          {
            borderRadius,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.showGradientBorder ? 0 : borderWidth,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Blur background - iOS only works well */}
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          // Android fallback - semi-transparent background
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: variantStyles.backgroundColor },
            ]}
          />
        )}

        {/* iOS needs additional overlay for color */}
        {Platform.OS === 'ios' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: variantStyles.backgroundColor },
            ]}
          />
        )}

        {/* Inner shadow for depth */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'transparent', 'transparent']}
          style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.3 }}
        />

        {/* Content */}
        <View style={[styles.content, { padding }]}>
          {children}
        </View>
      </View>
    </View>
  );
};

// ============================================
// GLASS INPUT CARD - Special variant for text inputs
// ============================================

export const GlassInputCard = ({
  glowColor = COSMIC_COLORS.glow.purple,
  focused = false,
  error = false,
  style,
  children,
}) => {
  const borderOpacity = useSharedValue(0.1);

  useEffect(() => {
    if (focused) {
      borderOpacity.value = withTiming(0.5, { duration: 200 });
    } else if (error) {
      borderOpacity.value = withTiming(0.8, { duration: 200 });
    } else {
      borderOpacity.value = withTiming(0.1, { duration: 200 });
    }
  }, [focused, error]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? `rgba(255, 100, 100, ${borderOpacity.value})`
      : glowColor.replace('0.5)', `${borderOpacity.value})`),
  }));

  return (
    <Animated.View
      style={[
        styles.inputCard,
        animatedBorderStyle,
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COSMIC_COLORS.glass.bgDark }]} />
      )}

      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(13, 13, 43, 0.4)' }]} />

      <View style={styles.inputContent}>
        {children}
      </View>
    </Animated.View>
  );
};

// ============================================
// GLASS BUTTON CARD - Pressable card variant
// ============================================

export const GlassButtonCard = ({
  onPress,
  glowColor = COSMIC_COLORS.glow.purple,
  disabled = false,
  style,
  children,
}) => {
  return (
    <GlassCard
      variant={disabled ? 'subtle' : 'glow'}
      glowColor={glowColor}
      glowIntensity={disabled ? 0.2 : 0.5}
      animatedGlow={!disabled}
      style={[disabled && styles.disabled, style]}
    >
      {children}
    </GlassCard>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  card: {
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  glowBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: COSMIC_RADIUS.lg + 2,
    zIndex: -1,
  },
  glowBorderInner: {
    flex: 1,
    borderRadius: COSMIC_RADIUS.lg + 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  gradientBorderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: COSMIC_RADIUS.lg,
    overflow: 'hidden',
    zIndex: 0,
  },
  inputCard: {
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputContent: {
    padding: COSMIC_SPACING.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default React.memo(GlassCard);
