/**
 * Progress Ring Component
 * Circular progress indicator with SVG
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSettings } from '../../contexts/SettingsContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
  size = 120,
  strokeWidth = 10,
  progress = 0, // 0-100
  color,
  gradientColors,
  useGradient = true,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  centerContent = null, // Custom center content
  showPercentage = true,
  animated = true,
  duration = 800,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Use theme colors for defaults
  const effectiveColor = color || colors.gold;
  const effectiveGradientColors = gradientColors || [colors.gold, colors.cyan];

  const styles = useMemo(() => StyleSheet.create({
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
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
              <Stop offset="0%" stopColor={effectiveGradientColors[0]} />
              <Stop offset="100%" stopColor={effectiveGradientColors[1]} />
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
          stroke={useGradient ? `url(#${gradientId})` : effectiveColor}
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
  label = 'Diem',
  size = 120,
  ...props
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    scoreCenterContent: {
      alignItems: 'center',
    },
    scoreValue: {
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    scoreLabel: {
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginTop: SPACING.xxs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
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
};

export default ProgressRing;
