/**
 * PriceRangeSlider.js - Price Range Slider Component
 * Dual-thumb slider for filtering products by price range
 * Used in FilterSheet for price filtering
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - (SPACING.lg * 4) - 40;
const THUMB_SIZE = 24;

const PriceRangeSlider = ({
  min = 0,
  max = 10000000,
  minValue,
  maxValue,
  step = 100000,
  onChange,
  style,
}) => {
  const [minVal, setMinVal] = useState(minValue || min);
  const [maxVal, setMaxVal] = useState(maxValue || max);

  // Format price in Vietnamese format
  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}tr`;
    }
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Convert value to position
  const valueToPosition = useCallback((value) => {
    return ((value - min) / (max - min)) * SLIDER_WIDTH;
  }, [min, max]);

  // Convert position to value
  const positionToValue = useCallback((position) => {
    const rawValue = (position / SLIDER_WIDTH) * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  // Pan responder for min thumb
  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = valueToPosition(minVal) + gestureState.dx;
      const newValue = positionToValue(newPosition);

      // Ensure min doesn't exceed max - step
      if (newValue < maxVal - step) {
        setMinVal(newValue);
        onChange?.({ min: newValue, max: maxVal });
      }
    },
  });

  // Pan responder for max thumb
  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = valueToPosition(maxVal) + gestureState.dx;
      const newValue = positionToValue(newPosition);

      // Ensure max doesn't go below min + step
      if (newValue > minVal + step) {
        setMaxVal(newValue);
        onChange?.({ min: minVal, max: newValue });
      }
    },
  });

  const minPosition = valueToPosition(minVal);
  const maxPosition = valueToPosition(maxVal);

  return (
    <View style={[styles.container, style]}>
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>
          {formatPrice(minVal)}
        </Text>
        <Text style={styles.separator}>-</Text>
        <Text style={styles.label}>
          {formatPrice(maxVal)}
        </Text>
      </View>

      {/* Slider Track */}
      <View style={styles.sliderContainer}>
        <View style={styles.track} />

        {/* Active Range */}
        <View
          style={[
            styles.activeTrack,
            {
              left: minPosition,
              width: maxPosition - minPosition,
            },
          ]}
        />

        {/* Min Thumb */}
        <View
          style={[styles.thumb, { left: minPosition - THUMB_SIZE / 2 }]}
          {...minPanResponder.panHandlers}
        >
          <View style={styles.thumbInner} />
        </View>

        {/* Max Thumb */}
        <View
          style={[styles.thumb, { left: maxPosition - THUMB_SIZE / 2 }]}
          {...maxPanResponder.panHandlers}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>

      {/* Min/Max Labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatPrice(min)}</Text>
        <Text style={styles.rangeLabel}>{formatPrice(max)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  separator: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    width: SLIDER_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  activeTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: COLORS.burgundy,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: COLORS.burgundy,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  rangeLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
});

export default PriceRangeSlider;
