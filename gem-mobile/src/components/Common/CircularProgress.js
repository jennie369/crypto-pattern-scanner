/**
 * GEM Academy - Circular Progress Indicator
 * SVG-based circular progress with animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../utils/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({
  progress = 0, // 0-100 or 0-1
  size = 60,
  strokeWidth = 6,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  progressColor = COLORS.gold,
  gradientColors = null, // ['#FFBD59', '#FFD700']
  animated = true,
  animationDuration = 500,
  children = null,
  style = {},
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Normalize progress to 0-100
  const normalizedProgress = progress > 1 ? progress : progress * 100;
  const clampedProgress = Math.min(Math.max(normalizedProgress, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: clampedProgress,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      animatedProgress.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationDuration, animatedProgress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {gradientColors && (
          <Defs>
            <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </SvgGradient>
          </Defs>
        )}

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={gradientColors ? 'url(#progressGradient)' : progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Center content */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
