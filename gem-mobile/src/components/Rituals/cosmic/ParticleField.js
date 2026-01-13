/**
 * ParticleField - PERFORMANCE OPTIMIZED
 * Single animation driver, NO SVG, simple shapes only
 */

import React, { useMemo, useEffect, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { COSMIC_COLORS } from '../../../theme/cosmicTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Pre-generate particle data
const generateParticles = (count, areaWidth, areaHeight, config) => {
  const particles = [];
  const [minSize, maxSize] = config.sizeRange;

  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * areaWidth,
      y: Math.random() * areaHeight,
      size: minSize + Math.random() * (maxSize - minSize),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      // Animation params - pre-calculated
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseOpacity: Math.random() * Math.PI * 2,
      speedX: 0.3 + Math.random() * 0.4,
      speedY: 0.5 + Math.random() * 0.5,
      amplitude: 10 + Math.random() * 20,
    });
  }
  return particles;
};

// Single particle using shared driver - NO SVG
const FloatingParticle = memo(({
  x, y, size, color,
  phaseX, phaseY, phaseOpacity,
  speedX, speedY, amplitude,
  driver, shape
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const t = driver.value;
    // Simple sine wave motion
    const translateX = Math.sin(t * speedX + phaseX) * amplitude * 0.5;
    const translateY = Math.sin(t * speedY + phaseY) * amplitude;
    const opacity = 0.3 + 0.6 * ((Math.sin(t * 0.8 + phaseOpacity) + 1) / 2);
    const scale = 0.8 + 0.3 * ((Math.sin(t * 0.5 + phaseOpacity) + 1) / 2);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    };
  }, [driver, phaseX, phaseY, phaseOpacity, speedX, speedY, amplitude]);

  // Simple shape - circle or heart (CSS only, no SVG)
  const shapeStyle = shape === 'heart' ? styles.heart : styles.circle;

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: x, top: y },
        animatedStyle,
      ]}
    >
      <View
        style={[
          shapeStyle,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: shape === 'heart' ? size * 0.3 : size / 2,
          },
        ]}
      />
    </Animated.View>
  );
});

// Variant configs - simplified
const VARIANT_CONFIGS = {
  stars: {
    colors: [COSMIC_COLORS.particles.star, 'rgba(255, 255, 255, 0.6)'],
    sizeRange: [2, 4],
    shape: 'circle',
  },
  sparkles: {
    colors: [COSMIC_COLORS.glow.gold, 'rgba(255, 215, 0, 0.7)'],
    sizeRange: [4, 8],
    shape: 'circle',
  },
  dust: {
    colors: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'],
    sizeRange: [1, 3],
    shape: 'circle',
  },
  hearts: {
    colors: [
      COSMIC_COLORS.ritualThemes.heart.primary,
      COSMIC_COLORS.ritualThemes.heart.secondary,
      'rgba(255, 105, 180, 0.6)',
    ],
    sizeRange: [8, 14],
    shape: 'heart',
  },
  fire: {
    colors: [
      COSMIC_COLORS.ritualThemes.burn.fire?.core || '#FF6B35',
      COSMIC_COLORS.ritualThemes.burn.fire?.mid || '#FF8C42',
      '#FFA500',
    ],
    sizeRange: [6, 12],
    shape: 'circle',
  },
  water: {
    colors: [
      COSMIC_COLORS.ritualThemes.water.primary,
      COSMIC_COLORS.ritualThemes.water.secondary,
      'rgba(65, 105, 225, 0.6)',
    ],
    sizeRange: [5, 10],
    shape: 'circle',
  },
  golden: {
    colors: [
      COSMIC_COLORS.ritualThemes.gratitude.primary,
      COSMIC_COLORS.ritualThemes.gratitude.glow,
      '#FFA500',
    ],
    sizeRange: [4, 10],
    shape: 'circle',
  },
  energy: {
    colors: [
      COSMIC_COLORS.glow.cyan,
      COSMIC_COLORS.glow.purple,
      'rgba(0, 240, 255, 0.5)',
    ],
    sizeRange: [2, 5],
    shape: 'circle',
  },
};

const ParticleField = ({
  count = 8, // REDUCED default
  variant = 'stars',
  color = null,
  colors = null,
  speed = 'medium',
  density = 'medium',
  direction = 'float',
  areaWidth = SCREEN_WIDTH,
  areaHeight = SCREEN_HEIGHT,
  style,
}) => {
  // Single animation driver
  const animationDriver = useSharedValue(0);

  useEffect(() => {
    const duration = speed === 'slow' ? 10000 : speed === 'fast' ? 4000 : 7000;
    animationDriver.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [speed]);

  // Config
  const config = useMemo(() => {
    const baseConfig = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.stars;
    return {
      ...baseConfig,
      colors: colors || (color ? [color] : baseConfig.colors),
    };
  }, [variant, color, colors]);

  // Density multiplier - REDUCED
  const densityMultiplier = { low: 0.4, medium: 0.6, high: 0.8 };
  const particleCount = Math.max(4, Math.floor(count * (densityMultiplier[density] || 0.6)));

  // Generate particles
  const particles = useMemo(() => {
    return generateParticles(particleCount, areaWidth, areaHeight, config);
  }, [particleCount, areaWidth, areaHeight, config]);

  return (
    <View
      style={[styles.container, { width: areaWidth, height: areaHeight }, style]}
      pointerEvents="none"
    >
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          {...particle}
          driver={animationDriver}
          shape={config.shape}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
  circle: {
    // Simple circle
  },
  heart: {
    // Heart shape approximation using rotation
    transform: [{ rotate: '-45deg' }],
  },
});

export default memo(ParticleField);
