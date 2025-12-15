/**
 * Gemral - Boosted Badge Component
 * Feature #7: Boost Post
 * Visual badge for boosted posts
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Zap, TrendingUp, Star, Crown, Flame } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/tokens';

const BADGE_TYPES = {
  basic: {
    icon: Zap,
    label: 'Duoc quan tam',
    color: COLORS.cyan,
    bgColor: 'rgba(0, 240, 255, 0.15)',
  },
  standard: {
    icon: TrendingUp,
    label: 'Dang hot',
    color: COLORS.purple,
    bgColor: 'rgba(106, 91, 255, 0.15)',
  },
  premium: {
    icon: Star,
    label: 'Trending',
    color: COLORS.gold,
    bgColor: 'rgba(255, 189, 89, 0.15)',
  },
  ultra: {
    icon: Crown,
    label: 'Viral',
    color: COLORS.burgundy,
    bgColor: 'rgba(156, 6, 18, 0.2)',
  },
  default: {
    icon: Flame,
    label: 'Promoted',
    color: COLORS.success,
    bgColor: 'rgba(58, 247, 166, 0.15)',
  },
};

const BoostedBadge = ({
  packageType = 'default',
  showLabel = true,
  size = 'normal', // 'small', 'normal', 'large'
  animated = true,
  style,
}) => {
  const badge = BADGE_TYPES[packageType] || BADGE_TYPES.default;
  const IconComponent = badge.icon;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const sizes = {
    small: { icon: 10, text: TYPOGRAPHY.fontSize.xs, padding: 4 },
    normal: { icon: 12, text: TYPOGRAPHY.fontSize.sm, padding: 6 },
    large: { icon: 14, text: TYPOGRAPHY.fontSize.md, padding: 8 },
  };

  const currentSize = sizes[size] || sizes.normal;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: badge.bgColor,
          paddingHorizontal: showLabel ? currentSize.padding * 1.5 : currentSize.padding,
          paddingVertical: currentSize.padding,
          transform: animated ? [{ scale: pulseAnim }] : [],
        },
        style,
      ]}
    >
      <IconComponent size={currentSize.icon} color={badge.color} />
      {showLabel && (
        <Text style={[styles.label, { fontSize: currentSize.text, color: badge.color }]}>
          {badge.label}
        </Text>
      )}
    </Animated.View>
  );
};

/**
 * Mini boost indicator (just icon)
 */
export const BoostIndicator = ({ packageType = 'default', size = 16 }) => {
  const badge = BADGE_TYPES[packageType] || BADGE_TYPES.default;
  const IconComponent = badge.icon;

  return (
    <View style={[styles.indicator, { backgroundColor: badge.bgColor }]}>
      <IconComponent size={size} color={badge.color} />
    </View>
  );
};

/**
 * Boost stats badge (shows remaining time)
 */
export const BoostStatsBadge = ({ packageType, expiresAt, impressions = 0 }) => {
  const badge = BADGE_TYPES[packageType] || BADGE_TYPES.default;
  const IconComponent = badge.icon;

  const getRemainingTime = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Het han';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    return `${hours}h`;
  };

  return (
    <View style={[styles.statsBadge, { borderColor: badge.color }]}>
      <IconComponent size={12} color={badge.color} />
      <Text style={[styles.statsText, { color: badge.color }]}>
        {impressions > 0 && `${impressions.toLocaleString()} views • `}
        {getRemainingTime()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: SPACING.xs,
  },
  label: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    gap: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default BoostedBadge;
