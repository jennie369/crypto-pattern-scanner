/**
 * Progress Ring Component
 * Circular progress indicator with SVG
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
  size = 120,
  strokeWidth = 10,
  progress = 0, // 0-100
  color = COLORS.gold,
  gradientColors = [COLORS.gold, COLORS.cyan],
  useGradient = true,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  centerContent = null, // Custom center content
  showPercentage = true,
  animated = true,
  duration = 800,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, duration, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const gradientId = `progressGradient_${size}`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          {useGradient && (
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          )}
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {centerContent || (
          showPercentage && (
            <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
          )
        )}
      </View>
    </View>
  );
};

// Preset sizes
export const ProgressRingSmall = (props) => (
  <ProgressRing size={60} strokeWidth={6} {...props} />
);

export const ProgressRingMedium = (props) => (
  <ProgressRing size={100} strokeWidth={8} {...props} />
);

export const ProgressRingLarge = (props) => (
  <ProgressRing size={140} strokeWidth={12} {...props} />
);

// Score Ring with label
export const ScoreRing = ({
  score = 0,
  label = 'Điểm',
  size = 120,
  ...props
}) => (
  <ProgressRing
    size={size}
    progress={score}
    centerContent={
      <View style={styles.scoreCenterContent}>
        <Text style={[styles.scoreValue, { fontSize: size * 0.25 }]}>
          {Math.round(score)}
        </Text>
        <Text style={[styles.scoreLabel, { fontSize: size * 0.1 }]}>
          {label}
        </Text>
      </View>
    }
    {...props}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreCenterContent: {
    alignItems: 'center',
  },
  scoreValue: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.xxs,
  },
});

export default ProgressRing;
