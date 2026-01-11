/**
 * CountdownTimer.js - Flash Sale Countdown Component
 * Displays countdown timer with HH:MM:SS format
 * Used in FlashSaleSection for limited-time offers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const CountdownTimer = ({
  endTime,
  onExpire,
  size = 'medium',
  style,
  showLabels = true,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: false,
    };
  }, [endTime]);

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, calculateTimeLeft, onExpire]);

  // Format number with leading zero
  const formatNumber = (num) => String(num).padStart(2, '0');

  // Size configurations
  const sizeConfig = {
    small: {
      boxSize: 28,
      fontSize: TYPOGRAPHY.fontSize.md,
      separatorSize: TYPOGRAPHY.fontSize.sm,
      labelSize: 8,
    },
    medium: {
      boxSize: 36,
      fontSize: TYPOGRAPHY.fontSize.lg,
      separatorSize: TYPOGRAPHY.fontSize.md,
      labelSize: 9,
    },
    large: {
      boxSize: 48,
      fontSize: TYPOGRAPHY.fontSize.xxl,
      separatorSize: TYPOGRAPHY.fontSize.lg,
      labelSize: 10,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  if (timeLeft.isExpired) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.expiredText}>Đã kết thúc</Text>
      </View>
    );
  }

  const TimeBox = ({ value, label }) => (
    <View style={styles.timeBoxContainer}>
      <View style={[styles.timeBox, {
        width: config.boxSize,
        height: config.boxSize,
        borderRadius: config.boxSize / 4,
      }]}>
        <Text style={[styles.timeValue, { fontSize: config.fontSize }]}>
          {formatNumber(value)}
        </Text>
      </View>
      {showLabels && (
        <Text style={[styles.timeLabel, { fontSize: config.labelSize }]}>
          {label}
        </Text>
      )}
    </View>
  );

  const Separator = () => (
    <Text style={[styles.separator, { fontSize: config.separatorSize }]}>:</Text>
  );

  return (
    <View style={[styles.container, style]}>
      <TimeBox value={timeLeft.hours} label="Giờ" />
      <Separator />
      <TimeBox value={timeLeft.minutes} label="Phút" />
      <Separator />
      <TimeBox value={timeLeft.seconds} label="Giây" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBoxContainer: {
    alignItems: 'center',
  },
  timeBox: {
    backgroundColor: COLORS.burgundy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timeLabel: {
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  separator: {
    color: COLORS.burgundy,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginHorizontal: SPACING.xs,
    marginBottom: 12, // Align with time boxes when labels shown
  },
  expiredText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default CountdownTimer;
