/**
 * Zoom Indicator Component
 * Shows current zoom level
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { memo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../../utils/tokens';

/**
 * ZoomIndicator - Display zoom level
 *
 * @param {Object} props
 * @param {number} props.scale - Current zoom scale
 * @param {boolean} props.visible - Force visibility
 */
const ZoomIndicator = ({ scale, visible }) => {
  const opacity = useSharedValue(0);

  // Show indicator when scale changes
  useEffect(() => {
    if (scale !== 1) {
      opacity.value = withTiming(1, { duration: 100 });

      // Hide after delay
      opacity.value = withDelay(1500, withTiming(0, { duration: 300 }));
    }
  }, [scale]);

  // Force visible
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  // Format percentage
  const percentage = Math.round(scale * 100);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{percentage}%</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -30,
    width: 60,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(ZoomIndicator);
