/**
 * CosmicBackground - Animated starry background for rituals
 * Features multi-layer gradients, twinkling stars, nebula clouds
 */

import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { COSMIC_COLORS, COSMIC_GRADIENTS, PARTICLE_CONFIGS } from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// STAR COMPONENT
// ============================================

const Star = React.memo(({ x, y, size, delay, duration }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.3, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COSMIC_COLORS.particles.star,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// NEBULA CLOUD COMPONENT
// ============================================

const NebulaCloud = React.memo(({ x, y, size, color, delay }) => {
  const opacity = useSharedValue(0.1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: 8000, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.1, { duration: 8000, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 10000, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(1, { duration: 10000, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.nebula,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});

// ============================================
// SPOTLIGHT COMPONENT
// ============================================

const Spotlight = React.memo(({ color, intensity }) => {
  const opacity = useSharedValue(intensity * 0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(intensity * 0.5, { duration: 4000, easing: COSMIC_TIMING.easing.gentle }),
        withTiming(intensity * 0.3, { duration: 4000, easing: COSMIC_TIMING.easing.gentle })
      ),
      -1,
      true
    );
  }, [intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.spotlightContainer, animatedStyle]}>
      <LinearGradient
        colors={[color, 'transparent']}
        style={styles.spotlight}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const CosmicBackground = ({
  variant = 'default', // 'default' | 'heart' | 'gratitude' | 'breath' | 'water' | 'letter' | 'burn' | 'star'
  accentColor = null, // Override color for spotlight
  starDensity = 'medium', // 'low' | 'medium' | 'high'
  showNebula = true,
  showSpotlight = true,
  animateStars = true,
  spotlightIntensity = 0.5,
  children,
}) => {
  // Get theme colors based on variant
  const themeColors = useMemo(() => {
    const themes = {
      default: { spotlight: COSMIC_COLORS.glow.purple, nebula: COSMIC_COLORS.particles.nebula },
      heart: { spotlight: COSMIC_COLORS.ritualThemes.heart.glow, nebula: 'rgba(255, 105, 180, 0.3)' },
      gratitude: { spotlight: COSMIC_COLORS.ritualThemes.gratitude.glow, nebula: 'rgba(255, 215, 0, 0.2)' },
      breath: { spotlight: COSMIC_COLORS.ritualThemes.breath.glow, nebula: 'rgba(0, 240, 255, 0.2)' },
      water: { spotlight: COSMIC_COLORS.ritualThemes.water.glow, nebula: 'rgba(65, 105, 225, 0.2)' },
      letter: { spotlight: COSMIC_COLORS.ritualThemes.letter.glow, nebula: 'rgba(168, 85, 247, 0.2)' },
      burn: { spotlight: COSMIC_COLORS.ritualThemes.burn.glow, nebula: 'rgba(255, 107, 53, 0.2)' },
      star: { spotlight: COSMIC_COLORS.ritualThemes.star.glow, nebula: 'rgba(255, 255, 255, 0.15)' },
    };
    return themes[variant] || themes.default;
  }, [variant]);

  // Generate stars based on density - OPTIMIZED: reduced counts significantly
  const stars = useMemo(() => {
    const counts = { low: 15, medium: 25, high: 40 }; // Reduced from 30/60/100
    const count = counts[starDensity] || 25;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 2 + 1, // 1-3px
      delay: Math.random() * 3000,
      duration: 3000 + Math.random() * 2000, // 3-5s (slower = less CPU)
    }));
  }, [starDensity]);

  // Generate nebula clouds
  const nebulaClouds = useMemo(() => {
    if (!showNebula) return [];

    return [
      { id: 0, x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.15, size: 200, delay: 0 },
      { id: 1, x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.3, size: 180, delay: 2000 },
      { id: 2, x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.7, size: 220, delay: 4000 },
      { id: 3, x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.85, size: 160, delay: 1000 },
    ];
  }, [showNebula]);

  const spotlightColor = accentColor || themeColors.spotlight;

  return (
    <View style={styles.container}>
      {/* Base gradient - Deep space */}
      <LinearGradient
        colors={COSMIC_GRADIENTS.deepSpace}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Secondary gradient - Cosmic overlay */}
      <LinearGradient
        colors={COSMIC_GRADIENTS.cosmicBg}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Nebula clouds layer */}
      {showNebula && nebulaClouds.map((cloud) => (
        <NebulaCloud
          key={cloud.id}
          x={cloud.x}
          y={cloud.y}
          size={cloud.size}
          color={themeColors.nebula}
          delay={cloud.delay}
        />
      ))}

      {/* Stars layer */}
      {animateStars && stars.map((star) => (
        <Star
          key={star.id}
          x={star.x}
          y={star.y}
          size={star.size}
          delay={star.delay}
          duration={star.duration}
        />
      ))}

      {/* Spotlight effect from top */}
      {showSpotlight && (
        <Spotlight color={spotlightColor} intensity={spotlightIntensity} />
      )}

      {/* Vignette effect */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.6)']}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Content */}
      {children}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
  },
  star: {
    position: 'absolute',
    shadowColor: COSMIC_COLORS.particles.star,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  nebula: {
    position: 'absolute',
    // Blur effect approximation - OPTIMIZED: removed shadow for performance
  },
  spotlightContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    pointerEvents: 'none',
  },
  spotlight: {
    flex: 1,
  },
});

export default React.memo(CosmicBackground);
