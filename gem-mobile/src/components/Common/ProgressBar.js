/**
 * GEM Academy - Linear Progress Bar
 * Theme-aware animated progress bar with gradient option
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../contexts/SettingsContext';

const ProgressBar = ({
  progress = 0, // 0-100 or 0-1
  height = 8,
  backgroundColor,
  fillColor,
  gradientColors = null, // ['#FFBD59', '#FFD700']
  borderRadius,
  animated = true,
  animationDuration = 500,
  style = {},
}) => {
  const { colors, settings } = useSettings();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Use theme-aware defaults
  const bgColor = backgroundColor || (settings.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)');
  const fill = fillColor || colors.gold;
  const radius = borderRadius ?? 9999; // full rounded by default

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

  const styles = useMemo(() => StyleSheet.create({
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
  }), []);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: bgColor,
          borderRadius: radius,
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
            borderRadius: radius,
          },
        ]}
      >
        {gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius: radius }]}
          />
        ) : (
          <View
            style={[
              styles.solidFill,
              { backgroundColor: fill, borderRadius: radius },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

export default ProgressBar;
