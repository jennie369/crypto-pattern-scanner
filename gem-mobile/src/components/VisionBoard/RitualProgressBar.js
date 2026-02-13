/**
 * RitualProgressBar.js
 * Animated progress bar for ritual completion
 * Created: January 28, 2026
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

/**
 * RitualProgressBar Component
 */
const RitualProgressBar = ({
  progress = 0, // 0-100
  total,
  completed,
  label,
  showPercentage = true,
  showCount = true,
  height = 8,
  animated = true,
  gradientColors,
  style,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Animate progress change
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(animatedWidth, {
          toValue: progress,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Glow effect when reaching 100%
        Animated.timing(glowOpacity, {
          toValue: progress >= 100 ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedWidth.setValue(progress);
      glowOpacity.setValue(progress >= 100 ? 1 : 0);
    }
  }, [progress, animated, animatedWidth, glowOpacity]);

  // Calculate percentage width
  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Default gradient colors
  const colors = gradientColors || [
    COLORS.primary,
    COLORS.gold,
  ];

  // Determine status color for text
  const getStatusColor = () => {
    if (progress >= 100) return COLORS.success;
    if (progress >= 50) return COLORS.gold;
    return COLORS.textSecondary;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header with label and count */}
      {(label || showCount) && (
        <View style={styles.header}>
          {label && (
            <Text style={styles.label}>{label}</Text>
          )}
          <View style={styles.statsRow}>
            {showCount && total !== undefined && (
              <Text style={[styles.count, { color: getStatusColor() }]}>
                {completed || 0}/{total}
              </Text>
            )}
            {showPercentage && (
              <Text style={[styles.percentage, { color: getStatusColor() }]}>
                {Math.round(progress)}%
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View style={[styles.progressContainer, { height }]}>
        {/* Background track */}
        <View style={[styles.track, { height }]} />

        {/* Animated fill */}
        <Animated.View
          style={[
            styles.fillContainer,
            { width: widthInterpolate, height },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>

        {/* Glow effect at 100% */}
        <Animated.View
          style={[
            styles.glow,
            { opacity: glowOpacity, height: height + 4 },
          ]}
        />

        {/* Shimmer effect */}
        {progress > 0 && progress < 100 && (
          <ShimmerEffect width={widthInterpolate} height={height} />
        )}
      </View>
    </View>
  );
};

/**
 * Shimmer effect overlay
 */
const ShimmerEffect = ({ width, height }) => {
  const shimmerPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerPosition, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerPosition]);

  const translateX = shimmerPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 200],
  });

  return (
    <Animated.View
      style={[
        styles.shimmerContainer,
        { width, height },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Circular progress variant
 */
export const CircularRitualProgress = ({
  progress = 0,
  size = 80,
  strokeWidth = 8,
  label,
  showPercentage = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const circumference = (size - strokeWidth) * Math.PI;
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />

      {/* SVG-like progress would need react-native-svg */}
      {/* For now, using a simple overlay approach */}

      {/* Center content */}
      <View style={styles.circularCenter}>
        {showPercentage && (
          <Text style={styles.circularPercentage}>
            {Math.round(progress)}%
          </Text>
        )}
        {label && (
          <Text style={styles.circularLabel}>{label}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * Mini progress indicator
 */
export const MiniProgress = ({ progress = 0, size = 16 }) => {
  const fillWidth = `${Math.min(progress, 100)}%`;

  return (
    <View style={[styles.miniContainer, { width: size * 3, height: size / 2 }]}>
      <View
        style={[
          styles.miniFill,
          {
            width: fillWidth,
            backgroundColor: progress >= 100 ? COLORS.success : COLORS.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  count: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  percentage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressContainer: {
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  fillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 100,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderRadius: 100,
    opacity: 0.3,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: 100,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 50,
  },
  shimmerGradient: {
    flex: 1,
  },

  // Circular styles
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTrack: {
    position: 'absolute',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circularCenter: {
    alignItems: 'center',
  },
  circularPercentage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  circularLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Mini styles
  miniContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 100,
  },
});

export default RitualProgressBar;
