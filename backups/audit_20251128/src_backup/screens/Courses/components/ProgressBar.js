/**
 * Gemral - Progress Bar Component
 * Visual progress indicator for courses
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const ProgressBar = ({
  progress = 0,
  height = 8,
  showLabel = true,
  showPercent = true,
  label = 'Tiến độ',
  color = COLORS.gold,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  style,
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      {/* Label Row */}
      {(showLabel || showPercent) && (
        <View style={styles.labelRow}>
          {showLabel && (
            <Text style={styles.label}>{label}</Text>
          )}
          {showPercent && (
            <Text style={[styles.percent, { color }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Compact Progress Bar (no labels)
 */
export const CompactProgressBar = ({
  progress = 0,
  height = 4,
  color = COLORS.gold,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.track, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            height,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

/**
 * Circular Progress Indicator
 */
export const CircularProgress = ({
  progress = 0,
  size = 60,
  strokeWidth = 6,
  color = COLORS.gold,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercent = true,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View style={styles.circularContainer}>
        {/* Background Circle */}
        <View
          style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        {/* For simplicity, using a styled view instead of SVG */}
        {/* In production, consider using react-native-svg for true circular progress */}

        {/* Percent Text */}
        {showPercent && (
          <View style={styles.circularTextContainer}>
            <Text style={[styles.circularPercent, { color }]}>
              {Math.round(clampedProgress)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  percent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  track: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },

  // Circular styles
  circularContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularTrack: {
    position: 'absolute',
  },
  circularTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  circularPercent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default ProgressBar;
