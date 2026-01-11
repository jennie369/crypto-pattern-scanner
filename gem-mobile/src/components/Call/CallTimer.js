/**
 * CallTimer Component
 * Displays call duration
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * CallTimer - Duration display component
 * @param {Object} props
 * @param {string} props.duration - Formatted duration string (MM:SS or HH:MM:SS)
 * @param {string} props.status - Status text (e.g., "Đang gọi...")
 * @param {boolean} props.showStatus - Whether to show status instead of timer
 * @param {'large' | 'medium' | 'small'} props.size - Timer size
 */
const CallTimer = ({
  duration = '00:00',
  status,
  showStatus = false,
  size = 'large',
}) => {
  const displayText = showStatus && status ? status : duration;

  const sizeStyles = {
    large: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      color: COLORS.gold,
    },
    medium: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      color: COLORS.textPrimary,
    },
    small: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: COLORS.textSecondary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.timer, sizeStyles[size]]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});

export default CallTimer;
