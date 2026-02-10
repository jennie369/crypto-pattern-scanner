/**
 * StreakBanner Component
 * Vision Board Gamification - Streak Display
 *
 * Features:
 * - Current streak count with flame icon
 * - Longest streak display
 * - Streak freeze indicator
 * - Press to open streak history modal
 *
 * Design: Liquid Glass theme, dark mode
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Award, Snowflake, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSettings } from '../../contexts/SettingsContext';

const StreakBanner = memo(({
  currentStreak = 0,
  longestStreak = 0,
  freezeCount = 0,
  isAtRisk = false,
  onPress,
}) => {
  // Streak tier for color coding
  const streakTier = useMemo(() => {
    if (currentStreak >= 100) return 'legendary';
    if (currentStreak >= 30) return 'gold';
    if (currentStreak >= 7) return 'silver';
    if (currentStreak >= 3) return 'bronze';
    return 'default';
  }, [currentStreak]);

  // Get tier color
  const getTierColor = () => {
    switch (streakTier) {
      case 'legendary': return COLORS.purple;
      case 'gold': return COLORS.gold;
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return COLORS.textMuted;
    }
  };

  const tierColor = getTierColor();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.container}
    >
      <BlurView intensity={GLASS.blur} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.4)']}
          style={styles.gradient}
        >
          {/* Left: Streak Count */}
          <View style={styles.streakSection}>
            <View style={[styles.flameContainer, { borderColor: tierColor }]}>
              <Flame
                size={28}
                color={currentStreak > 0 ? COLORS.gold : COLORS.textMuted}
                fill={currentStreak > 0 ? COLORS.gold : 'transparent'}
              />
            </View>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakCount, { color: tierColor }]}>
                {currentStreak}
              </Text>
              <Text style={styles.streakLabel}>
                ngày liên tiếp
              </Text>
            </View>
          </View>

          {/* Center: Stats */}
          <View style={styles.statsSection}>
            {/* Longest streak */}
            <View style={styles.statItem}>
              <Award size={16} color={COLORS.gold} />
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>kỷ lục</Text>
            </View>

            {/* Freeze count */}
            {freezeCount > 0 && (
              <View style={styles.statItem}>
                <Snowflake size={16} color={COLORS.cyan} />
                <Text style={styles.statValue}>{freezeCount}</Text>
                <Text style={styles.statLabel}>freeze</Text>
              </View>
            )}
          </View>

          {/* Right: Arrow */}
          <View style={styles.arrowSection}>
            {isAtRisk && (
              <View style={styles.riskBadge}>
                <Text style={styles.riskText}>Sắp mất</Text>
              </View>
            )}
            <ChevronRight size={20} color={COLORS.textMuted} />
          </View>
        </LinearGradient>
      </BlurView>

      {/* Glow effect for high streaks */}
      {currentStreak >= 7 && (
        <View style={[styles.glowEffect, { backgroundColor: tierColor }]} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: GLASS.borderRadius - GLASS.borderWidth,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Left section
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flameContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  streakInfo: {
    marginLeft: SPACING.md,
  },
  streakCount: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Center section
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Right section
  arrowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: SPACING.md,
  },
  riskBadge: {
    backgroundColor: COLORS.error + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  riskText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Glow effect
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
});

export default StreakBanner;
