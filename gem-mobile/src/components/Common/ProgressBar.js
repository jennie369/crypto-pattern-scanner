/**
 * GEM Academy - Linear Progress Bar
 * Animated progress bar with gradient option
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS } from '../../utils/tokens';

const ProgressBar = ({
  progress = 0, // 0-100 or 0-1
  height = 8,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  fillColor = COLORS.gold,
  gradientColors = null, // ['#FFBD59', '#FFD700']
  borderRadius = BORDER_RADIUS.full,
  animated = true,
  animationDuration = 500,
  style = {},
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Normalize progress to 0-100
  const normalizedProgress = progress > 1 ? progress : progress * 100;
  const clampedProgress = Math.min(Math.max(normalizedProgress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationDuration, animatedWidth]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthInterpolate,
            height: '100%',
            borderRadius,
          },
        ]}
      >
        {gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius }]}
          />
        ) : (
          <View
            style={[
              styles.solidFill,
              { backgroundColor: fillColor, borderRadius },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  solidFill: {
    flex: 1,
  },
});

export default ProgressBar;
