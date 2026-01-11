/**
 * ProgressBar.js - Sales Progress Component
 * Shows sold percentage with animated fill
 * Used in FlashSaleCard to display product popularity
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const ProgressBar = ({
  sold = 0,
  total = 100,
  showLabel = true,
  height = 6,
  style,
  animated = true,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = total > 0 ? Math.min((sold / total) * 100, 100) : 0;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated, animatedWidth]);

  // Determine color based on percentage
  const getProgressColor = () => {
    if (percentage >= 80) return COLORS.error; // Almost sold out - urgent
    if (percentage >= 50) return COLORS.warning; // Selling fast
    return COLORS.burgundy; // Normal
  };

  const progressColor = getProgressColor();

  // Interpolate width
  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Progress track */}
      <View style={[styles.track, { height }]}>
        {/* Progress fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolate,
              height,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            Đã bán {sold}
          </Text>
          {percentage >= 70 && (
            <Text style={[styles.urgentText, { color: progressColor }]}>
              Sắp hết!
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  labelText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  urgentText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default ProgressBar;
