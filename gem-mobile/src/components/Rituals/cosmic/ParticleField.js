/**
 * ParticleField - Animated particle system for rituals
 * Supports multiple particle variants: stars, sparkles, dust, hearts, fire, water
 */

import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { COSMIC_COLORS, PARTICLE_CONFIGS } from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// PARTICLE SHAPES
// ============================================

// OPTIMIZED: Simplified star shape - removed shadow for performance
const StarShape = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }}
  />
);

const SparkleShape = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
      fill={color}
    />
  </Svg>
);

const HeartShape = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
    />
  </Svg>
);

const FireShape = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 23c-4.97 0-9-4.03-9-9 0-3.53 2.31-6.74 5.37-8.8.71-.48 1.63.18 1.47 1.02-.35 1.84.39 3.73 2.01 4.89.36.26.85.07.95-.37.36-1.57 1.48-2.88 3.03-3.48.71-.27 1.45.32 1.32 1.06-.37 2.12.43 4.26 2.15 5.53.52.38 1.19-.07 1.19-.72 0-.26 0-.53-.02-.79-.02-.52.45-.92.95-.76C21.81 11.12 23 12.92 23 15c0 4.42-4.03 8-9 8z"
      fill={color}
    />
  </Svg>
);

const DropletShape = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"
      fill={color}
    />
  </Svg>
);

const DustShape = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: 0.6,
    }}
  />
);

// ============================================
// SINGLE PARTICLE COMPONENT
// ============================================

const Particle = React.memo(({
  id,
  x,
  y,
  size,
  color,
  shape,
  delay,
  duration,
  direction,
  distance,
  fadeIn = true,
  fadeOut = true,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(fadeIn ? 0 : 1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Movement animation
    const movementDuration = duration;

    if (direction === 'up') {
      translateY.value = withDelay(
        delay,
        withRepeat(
          withTiming(-distance, { duration: movementDuration, easing: Easing.linear }),
          -1,
          false
        )
      );
    } else if (direction === 'down') {
      translateY.value = withDelay(
        delay,
        withRepeat(
          withTiming(distance, { duration: movementDuration, easing: Easing.linear }),
          -1,
          false
        )
      );
    } else if (direction === 'float') {
      // Gentle floating motion
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-distance / 4, { duration: movementDuration / 2, easing: COSMIC_TIMING.easing.breath }),
            withTiming(distance / 4, { duration: movementDuration / 2, easing: COSMIC_TIMING.easing.breath })
          ),
          -1,
          true
        )
      );
      // Horizontal sway
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(distance / 6, { duration: movementDuration * 0.7, easing: COSMIC_TIMING.easing.breath }),
            withTiming(-distance / 6, { duration: movementDuration * 0.7, easing: COSMIC_TIMING.easing.breath })
          ),
          -1,
          true
        )
      );
    }

    // Opacity animation (twinkle)
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 3, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.3, { duration: duration / 3, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(0.8, { duration: duration / 3, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      )
    );

    // Scale pulse
    scale.value = withDelay(
      delay + 100,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle }),
          withTiming(1, { duration: duration / 2, easing: COSMIC_TIMING.easing.gentle })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Render shape based on type
  const renderShape = () => {
    switch (shape) {
      case 'star':
        return <StarShape size={size} color={color} />;
      case 'sparkle':
        return <SparkleShape size={size} color={color} />;
      case 'heart':
        return <HeartShape size={size} color={color} />;
      case 'fire':
        return <FireShape size={size} color={color} />;
      case 'water':
        return <DropletShape size={size} color={color} />;
      case 'dust':
      default:
        return <DustShape size={size} color={color} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: x, top: y },
        animatedStyle,
      ]}
    >
      {renderShape()}
    </Animated.View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

const ParticleField = ({
  count = 15, // OPTIMIZED: reduced from 30
  variant = 'stars', // 'stars' | 'sparkles' | 'dust' | 'hearts' | 'fire' | 'water' | 'golden' | 'energy'
  color = null, // Override color
  colors = null, // Array of colors for variety
  speed = 'medium', // 'slow' | 'medium' | 'fast'
  density = 'medium', // 'low' | 'medium' | 'high'
  direction = 'float', // 'up' | 'down' | 'float' | 'random'
  areaWidth = SCREEN_WIDTH,
  areaHeight = SCREEN_HEIGHT,
  style,
}) => {
  // Variant configurations
  const variantConfigs = {
    stars: {
      shapes: ['star'],
      colors: [COSMIC_COLORS.particles.star, COSMIC_COLORS.particles.starDim],
      sizeRange: [2, 4],
    },
    sparkles: {
      shapes: ['sparkle'],
      colors: [COSMIC_COLORS.particles.sparkle, COSMIC_COLORS.glow.gold],
      sizeRange: [8, 16],
    },
    dust: {
      shapes: ['dust'],
      colors: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'],
      sizeRange: [1, 3],
    },
    hearts: {
      shapes: ['heart'],
      colors: [
        COSMIC_COLORS.ritualThemes.heart.primary,
        COSMIC_COLORS.ritualThemes.heart.secondary,
        'rgba(255, 105, 180, 0.6)',
      ],
      sizeRange: [12, 20],
    },
    fire: {
      shapes: ['fire'],
      colors: [
        COSMIC_COLORS.ritualThemes.burn.fire.core,
        COSMIC_COLORS.ritualThemes.burn.fire.mid,
        COSMIC_COLORS.ritualThemes.burn.fire.ember,
      ],
      sizeRange: [10, 18],
    },
    water: {
      shapes: ['water'],
      colors: [
        COSMIC_COLORS.ritualThemes.water.primary,
        COSMIC_COLORS.ritualThemes.water.secondary,
        'rgba(65, 105, 225, 0.6)',
      ],
      sizeRange: [8, 14],
    },
    golden: {
      shapes: ['sparkle', 'star'],
      colors: [
        COSMIC_COLORS.ritualThemes.gratitude.primary,
        COSMIC_COLORS.ritualThemes.gratitude.glow,
        '#FFA500',
      ],
      sizeRange: [6, 14],
    },
    energy: {
      shapes: ['dust', 'star'],
      colors: [
        COSMIC_COLORS.glow.cyan,
        COSMIC_COLORS.glow.purple,
        'rgba(0, 240, 255, 0.5)',
      ],
      sizeRange: [2, 6],
    },
  };

  const config = variantConfigs[variant] || variantConfigs.stars;

  // Speed configurations
  const speedConfigs = {
    slow: { baseDuration: 12000, distance: 200 },
    medium: { baseDuration: 8000, distance: 300 },
    fast: { baseDuration: 4000, distance: 400 },
  };

  const speedConfig = speedConfigs[speed] || speedConfigs.medium;

  // Density adjustments - OPTIMIZED: reduced multipliers
  const densityMultiplier = {
    low: 0.4,
    medium: 0.7,
    high: 1,
  };

  const particleCount = Math.floor(count * (densityMultiplier[density] || 0.7));

  // Generate particles
  const particles = useMemo(() => {
    const particleColors = colors || color ? [color] : config.colors;
    const shapes = config.shapes;
    const [minSize, maxSize] = config.sizeRange;

    return Array.from({ length: particleCount }, (_, i) => {
      const particleDirection = direction === 'random'
        ? ['up', 'down', 'float'][Math.floor(Math.random() * 3)]
        : direction;

      return {
        id: i,
        x: Math.random() * areaWidth,
        y: Math.random() * areaHeight,
        size: minSize + Math.random() * (maxSize - minSize),
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * speedConfig.baseDuration,
        duration: speedConfig.baseDuration + Math.random() * 2000,
        direction: particleDirection,
        distance: speedConfig.distance,
      };
    });
  }, [particleCount, color, colors, variant, direction, speed, areaWidth, areaHeight]);

  return (
    <View style={[styles.container, { width: areaWidth, height: areaHeight }, style]} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

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
});

export default React.memo(ParticleField);
