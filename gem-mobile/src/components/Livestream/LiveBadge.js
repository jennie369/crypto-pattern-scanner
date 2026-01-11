/**
 * LiveBadge Component
 * Animated "LIVE" indicator badge
 *
 * Features:
 * - Pulsing animation when live
 * - Different states (live, ended, scheduled)
 * - Compact and full variants
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens, { COLORS } from '../../utils/tokens';

const BADGE_STATES = {
  live: {
    label: 'LIVE',
    color: COLORS.error,
    icon: 'radio',
  },
  ended: {
    label: 'K\u1EBET TH\xDAC',
    color: tokens.colors.textSecondary,
    icon: 'checkmark-circle',
  },
  scheduled: {
    label: 'S\u1EAEP DI\u1EC4N RA',
    color: COLORS.warning,
    icon: 'time',
  },
  paused: {
    label: 'T\u1EA0M D\u1EEBNG',
    color: COLORS.warning,
    icon: 'pause-circle',
  },
};

const LiveBadge = ({
  status = 'live',
  variant = 'full', // 'full' | 'compact'
  showIcon = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // Start pulse animation for live status
  useEffect(() => {
    if (status === 'live') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();
      blink.start();

      return () => {
        pulse.stop();
        blink.stop();
      };
    }
  }, [status]);

  const stateConfig = BADGE_STATES[status] || BADGE_STATES.ended;
  const isLive = status === 'live';

  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { backgroundColor: stateConfig.color },
          isLive && { transform: [{ scale: pulseAnim }] },
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.dot,
            isLive && { opacity: dotOpacity },
          ]}
        />
        <Text style={styles.compactLabel}>{stateConfig.label}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: stateConfig.color + '20', borderColor: stateConfig.color },
        isLive && { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={stateConfig.icon}
          size={14}
          color={stateConfig.color}
        />
      )}

      {isLive && (
        <Animated.View
          style={[
            styles.liveDot,
            { backgroundColor: stateConfig.color, opacity: dotOpacity },
          ]}
        />
      )}

      <Text style={[styles.label, { color: stateConfig.color }]}>
        {stateConfig.label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
  },
  label: {
    fontSize: tokens.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    gap: 4,
  },
  compactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: tokens.colors.white,
    letterSpacing: 0.5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: tokens.colors.white,
  },
});

export default LiveBadge;
