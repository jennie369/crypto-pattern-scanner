/**
 * LiveBadge Component
 * Animated "LIVE" indicator badge
 *
 * Features:
 * - Pulsing animation when live
 * - Different states (live, ended, scheduled)
 * - Compact and full variants
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

const LiveBadge = ({
  status = 'live',
  variant = 'full', // 'full' | 'compact'
  showIcon = true,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  const BADGE_STATES = useMemo(() => ({
    live: {
      label: 'LIVE',
      color: colors.error,
      icon: 'radio',
    },
    ended: {
      label: 'KẾT THÚC',
      color: colors.textSecondary,
      icon: 'checkmark-circle',
    },
    scheduled: {
      label: 'SẮP DIỄN RA',
      color: colors.warning,
      icon: 'time',
    },
    paused: {
      label: 'TẠM DỪNG',
      color: colors.warning,
      icon: 'pause-circle',
    },
  }), [colors]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: SPACING.md,
      borderWidth: 1,
      gap: SPACING.xs,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.xs,
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
      paddingHorizontal: SPACING.xs,
      borderRadius: SPACING.sm,
      gap: 4,
    },
    compactLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.white,
      letterSpacing: 0.5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.white,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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

export default LiveBadge;
