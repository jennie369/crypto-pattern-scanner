/**
 * StreakBadge.js
 * Badge component for displaying streak counts
 * Created: January 28, 2026
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

// Streak milestones with special styling
const STREAK_MILESTONES = {
  3: { color: '#FF9500', icon: 'flame', label: 'Mới bắt đầu' },
  7: { color: '#FF6B00', icon: 'flame', label: '1 tuần' },
  14: { color: '#FF4500', icon: 'flame', label: '2 tuần' },
  30: { color: '#FF2D00', icon: 'bonfire', label: '1 tháng' },
  60: { color: '#E91E63', icon: 'bonfire', label: '2 tháng' },
  90: { color: '#9C27B0', icon: 'bonfire', label: '3 tháng' },
  180: { color: '#673AB7', icon: 'rocket', label: '6 tháng' },
  365: { color: '#FFD700', icon: 'trophy', label: '1 năm' },
};

/**
 * Get milestone info for streak count
 */
const getMilestoneInfo = (streak) => {
  const milestones = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (streak >= milestone) {
      return STREAK_MILESTONES[milestone];
    }
  }

  return { color: COLORS.textMuted, icon: 'flame-outline', label: '' };
};

/**
 * StreakBadge Component
 */
const StreakBadge = ({
  streak = 0,
  size = 'medium', // 'small', 'medium', 'large'
  showLabel = false,
  showAnimation = true,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;

  // Milestone info
  const milestoneInfo = getMilestoneInfo(streak);

  // Animate on mount or streak change
  useEffect(() => {
    if (showAnimation && streak > 0) {
      // Bounce animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Fire flicker animation
      const fireAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fireAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(fireAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      fireAnimation.start();

      return () => fireAnimation.stop();
    }
  }, [streak, showAnimation, scaleAnim, fireAnim]);

  // Size configurations
  const sizeConfig = {
    small: { badge: 32, icon: 14, text: TYPOGRAPHY.fontSize.xs },
    medium: { badge: 48, icon: 20, text: TYPOGRAPHY.fontSize.sm },
    large: { badge: 64, icon: 28, text: TYPOGRAPHY.fontSize.lg },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Fire glow opacity
  const glowOpacity = fireAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  if (streak === 0) {
    return (
      <View style={[styles.emptyBadge, { width: config.badge, height: config.badge }, style]}>
        <Ionicons name="flame-outline" size={config.icon} color={COLORS.textMuted} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {/* Glow effect */}
      {streak >= 3 && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: config.badge + 16,
              height: config.badge + 16,
              borderRadius: (config.badge + 16) / 2,
              backgroundColor: milestoneInfo.color,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      {/* Badge */}
      <View
        style={[
          styles.badge,
          {
            width: config.badge,
            height: config.badge,
            borderRadius: config.badge / 2,
          },
        ]}
      >
        <LinearGradient
          colors={[milestoneInfo.color, adjustColor(milestoneInfo.color, -30)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons
            name={milestoneInfo.icon}
            size={config.icon}
            color={COLORS.white}
          />
        </LinearGradient>
      </View>

      {/* Streak count */}
      <View style={styles.countContainer}>
        <Text style={[styles.countText, { fontSize: config.text }]}>
          {streak}
        </Text>
      </View>

      {/* Label */}
      {showLabel && milestoneInfo.label && (
        <Text style={styles.label}>{milestoneInfo.label}</Text>
      )}
    </Animated.View>
  );
};

/**
 * Inline streak display
 */
export const StreakInline = ({ streak = 0, style }) => {
  if (streak === 0) {
    return null;
  }

  const milestoneInfo = getMilestoneInfo(streak);

  return (
    <View style={[styles.inlineContainer, style]}>
      <Ionicons
        name={milestoneInfo.icon}
        size={16}
        color={milestoneInfo.color}
      />
      <Text style={[styles.inlineText, { color: milestoneInfo.color }]}>
        {streak}
      </Text>
    </View>
  );
};

/**
 * Streak card with details
 */
export const StreakCard = ({
  streak = 0,
  bestStreak = 0,
  label = 'Streak hiện tại',
  style,
}) => {
  const milestoneInfo = getMilestoneInfo(streak);
  const nextMilestone = getNextMilestone(streak);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <StreakBadge streak={streak} size="large" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardStreak}>{streak} ngày</Text>
          {bestStreak > streak && (
            <Text style={styles.cardBest}>Kỷ lục: {bestStreak} ngày</Text>
          )}
        </View>
      </View>

      {nextMilestone && (
        <View style={styles.cardProgress}>
          <Text style={styles.progressLabel}>
            Còn {nextMilestone.remaining} ngày đến {nextMilestone.label}
          </Text>
        )}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${nextMilestone.progress}%`,
                  backgroundColor: milestoneInfo.color,
                },
              ]}
            />
          )}
          </View>
        )}
        </View>
      )}
    </View>
  );
};

/**
 * Get next milestone info
 */
const getNextMilestone = (streak) => {
  const milestones = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b);

  for (const milestone of milestones) {
    if (streak < milestone) {
      const info = STREAK_MILESTONES[milestone];
      const prevMilestone = milestones[milestones.indexOf(milestone) - 1] || 0;
      const progress = ((streak - prevMilestone) / (milestone - prevMilestone)) * 100;

      return {
        target: milestone,
        label: info.label,
        remaining: milestone - streak,
        progress: Math.round(progress),
      };
    }
  }

  return null;
};

/**
 * Adjust color brightness
 */
const adjustColor = (color, amount) => {
  // Simple hex color adjustment
  if (!color || !color.startsWith('#')) return color;

  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
  },
  countContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Card styles
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  cardStreak: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  cardBest: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  cardProgress: {
    marginTop: SPACING.md,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default StreakBadge;
