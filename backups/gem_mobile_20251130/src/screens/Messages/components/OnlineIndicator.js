/**
 * Gemral - Online Indicator Component
 * Animated green dot showing online status
 *
 * Features:
 * - Green dot for online status
 * - Optional pulse animation
 * - Different sizes
 * - Last seen text option
 */

import React, { useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

// Services
import presenceService from '../../../services/presenceService';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const OnlineIndicator = memo(({
  status, // 'online', 'away', 'offline'
  lastSeen,
  size = 'md', // 'sm', 'md', 'lg'
  showPulse = true,
  showText = false,
  style,
}) => {
  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  const isOnline = status === 'online';
  const isAway = status === 'away';

  useEffect(() => {
    if (isOnline && showPulse) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isOnline, showPulse, pulseAnim, opacityAnim]);

  // Size configurations
  const sizes = {
    sm: { dot: 8, pulse: 16, border: 2 },
    md: { dot: 10, pulse: 20, border: 2 },
    lg: { dot: 14, pulse: 28, border: 3 },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Get color based on status
  const getColor = () => {
    if (isOnline) return COLORS.success;
    if (isAway) return COLORS.warning;
    return COLORS.textMuted;
  };

  // Get status text
  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (isAway) return 'Away';
    if (lastSeen) return presenceService.formatLastSeen(lastSeen);
    return 'Offline';
  };

  const dotColor = getColor();

  return (
    <View style={[styles.container, style]}>
      {/* Pulse ring (only for online) */}
      {isOnline && showPulse && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: sizeConfig.pulse,
              height: sizeConfig.pulse,
              borderRadius: sizeConfig.pulse / 2,
              backgroundColor: dotColor,
              opacity: opacityAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Main dot */}
      <View
        style={[
          styles.dot,
          {
            width: sizeConfig.dot,
            height: sizeConfig.dot,
            borderRadius: sizeConfig.dot / 2,
            backgroundColor: dotColor,
            borderWidth: sizeConfig.border,
          },
        ]}
      />

      {/* Status text */}
      {showText && (
        <Text style={styles.statusText}>{getStatusText()}</Text>
      )}
    </View>
  );
});

OnlineIndicator.displayName = 'OnlineIndicator';

export default OnlineIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pulseRing: {
    position: 'absolute',
  },

  dot: {
    borderColor: COLORS.bgDarkest,
  },

  statusText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});
