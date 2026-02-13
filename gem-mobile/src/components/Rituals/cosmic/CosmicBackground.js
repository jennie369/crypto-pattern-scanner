/**
 * CosmicBackground - PERFORMANCE OPTIMIZED
 * Uses single animation driver for all stars
 * Reduced particle count, eliminated individual animations
 */

import React, { useMemo, useEffect, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';

import { COSMIC_COLORS, COSMIC_GRADIENTS } from '../../../theme/cosmicTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Pre-calculate star positions once
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: 1 + Math.random() * 2, // 1-3px
      phase: Math.random() * Math.PI * 2, // Random phase offset
      speed: 0.5 + Math.random() * 0.5, // Speed multiplier
    });
  }
  return stars;
};

// Single animated star using shared driver
const AnimatedStar = memo(({ x, y, size, phase, speed, driver }) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Use sine wave with phase offset for twinkle
    const opacity = 0.3 + 0.7 * ((Math.sin((driver.value * speed) + phase) + 1) / 2);
    return { opacity };
  }, [driver, phase, speed]);

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
        },
        animatedStyle,
      ]}
    />
  );
});

// Static nebula - no animation needed for ambient clouds
const StaticNebula = memo(({ x, y, size, color }) => (
  <View
    style={[
      styles.nebula,
      {
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.15,
      },
    ]}
  />
));

// Simple spotlight with single animation
const AnimatedSpotlight = memo(({ color, intensity, driver }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = intensity * (0.3 + 0.1 * Math.sin(driver.value * 0.5));
    return { opacity };
  }, [driver, intensity]);

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

const CosmicBackground = ({
  variant = 'default',
  accentColor = null,
  starDensity = 'medium',
  showNebula = true,
  showSpotlight = true,
  animateStars = true,
  spotlightIntensity = 0.5,
  children,
}) => {
  // SINGLE animation driver for entire background
  const animationDriver = useSharedValue(0);

  useEffect(() => {
    // Single continuous animation - runs on UI thread
    animationDriver.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 6000,
        easing: Easing.linear,
      }),
      -1, // Infinite
      false // No reverse
    );
  }, []);

  // Theme colors
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

  // REDUCED star count - max 12 stars
  const stars = useMemo(() => {
    const counts = { low: 6, medium: 10, high: 12 };
    return generateStars(counts[starDensity] || 10);
  }, [starDensity]);

  // Static nebula positions
  const nebulaClouds = useMemo(() => {
    if (!showNebula) return [];
    return [
      { id: 0, x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.15, size: 200 },
      { id: 1, x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.3, size: 180 },
      { id: 2, x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.75, size: 220 },
    ];
  }, [showNebula]);

  const spotlightColor = accentColor || themeColors.spotlight;

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={COSMIC_GRADIENTS.deepSpace}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Secondary gradient overlay */}
      <LinearGradient
        colors={COSMIC_GRADIENTS.cosmicBg}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Static nebula clouds */}
      {nebulaClouds.map((cloud) => (
        <StaticNebula
          key={cloud.id}
          x={cloud.x}
          y={cloud.y}
          size={cloud.size}
          color={themeColors.nebula}
        />
      ))}

      {/* Stars - all driven by single animation */}
      {animateStars && stars.map((star) => (
        <AnimatedStar
          key={star.id}
          x={star.x}
          y={star.y}
          size={star.size}
          phase={star.phase}
          speed={star.speed}
          driver={animationDriver}
        />
      ))}

      {/* Spotlight */}
      {showSpotlight && (
        <AnimatedSpotlight
          color={spotlightColor}
          intensity={spotlightIntensity}
          driver={animationDriver}
        />
      )}

      {/* Vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.6)']}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
  },
  star: {
    position: 'absolute',
    backgroundColor: COSMIC_COLORS.particles.star,
  },
  nebula: {
    position: 'absolute',
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

export default memo(CosmicBackground);
