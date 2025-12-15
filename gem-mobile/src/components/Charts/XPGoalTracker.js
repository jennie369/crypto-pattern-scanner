/**
 * XP Goal Tracker Component
 * Level progress with XP tracking
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { LEVELS } from '../../services/progressCalculator';

const XPGoalTracker = ({
  totalXP = 0,
  currentLevel = 1,
  levelTitle = 'Người Mới Bắt Đầu',
  levelBadge = 'seedling',
  xpForCurrentLevel = 0,
  xpForNextLevel = 100,
  animated = true,
  showWeeklyXP = false,
  weeklyXP = 0,
  style,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Calculate progress percentage
  const xpInLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeededForLevel > 0
    ? Math.min(100, (xpInLevel / xpNeededForLevel) * 100)
    : 100;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated, animatedWidth]);

  const progressWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Get icon component
  const getBadgeIcon = () => {
    const iconMap = {
      seedling: 'Leaf',
      sprout: 'Sprout',
      tree: 'TreeDeciduous',
      star: 'Star',
      sword: 'Sword',
      shield: 'Shield',
      crown: 'Crown',
      gem: 'Gem',
      trident: 'Trident',
      galaxy: 'Sparkles',
      sparkles: 'Sparkles',
    };
    const iconName = iconMap[levelBadge] || 'Star';
    const IconComponent = Icons[iconName] || Icons.Star;
    return IconComponent;
  };

  const BadgeIcon = getBadgeIcon();
  const isMaxLevel = currentLevel >= LEVELS.length;

  return (
    <View style={[styles.container, style]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={GRADIENTS.gold}
            style={styles.badgeGradient}
          >
            <BadgeIcon size={20} color={COLORS.bgDarkest} />
          </LinearGradient>
        </View>

        <View style={styles.levelInfo}>
          <Text style={styles.levelLabel}>Level {currentLevel}</Text>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.xpValue}>{totalXP.toLocaleString()}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
            <LinearGradient
              colors={GRADIENTS.glassBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
          </Text>
          {!isMaxLevel && (
            <Text style={styles.nextLevelText}>
              Level {currentLevel + 1}
            </Text>
          )}
        </View>
      </View>

      {/* Weekly XP (optional) */}
      {showWeeklyXP && (
        <View style={styles.weeklyXPContainer}>
          <Icons.TrendingUp size={14} color={COLORS.success} />
          <Text style={styles.weeklyXPText}>
            +{weeklyXP.toLocaleString()} XP tuần này
          </Text>
        </View>
      )}
    </View>
  );
};

// Compact version for dashboard - NO container (parent provides container)
export const XPGoalTrackerCompact = ({
  totalXP = 0,
  currentLevel = 1,
  xpProgress = 0,
  style,
}) => {
  return (
    <View style={[styles.compactRow, style]}>
      <View style={styles.compactBadge}>
        <Icons.Gem size={16} color={COLORS.gold} />
      </View>
      <View style={styles.compactInfo}>
        <Text style={styles.compactLevel}>Lv.{currentLevel}</Text>
        <View style={styles.compactProgressBar}>
          <View
            style={[
              styles.compactProgressFill,
              { width: `${xpProgress}%` },
            ]}
          />
        </View>
      </View>
      <Text style={styles.compactXP}>{totalXP.toLocaleString()} XP</Text>
    </View>
  );
};

// Mini badge display
export const LevelBadge = ({
  level = 1,
  size = 'medium',
  showLabel = false,
}) => {
  const levelData = LEVELS.find(l => l.level === level) || LEVELS[0];
  const sizes = {
    small: { badge: 24, icon: 12, font: 10 },
    medium: { badge: 36, icon: 18, font: 12 },
    large: { badge: 48, icon: 24, font: 14 },
  };
  const s = sizes[size] || sizes.medium;

  const iconMap = {
    seedling: 'Leaf',
    sprout: 'Sprout',
    tree: 'TreeDeciduous',
    star: 'Star',
    sword: 'Sword',
    shield: 'Shield',
    crown: 'Crown',
    gem: 'Gem',
    trident: 'Trident',
    galaxy: 'Sparkles',
    sparkles: 'Sparkles',
  };
  const iconName = iconMap[levelData.badge] || 'Star';
  const IconComponent = Icons[iconName] || Icons.Star;

  return (
    <View style={styles.levelBadgeContainer}>
      <LinearGradient
        colors={GRADIENTS.gold}
        style={[
          styles.levelBadgeCircle,
          { width: s.badge, height: s.badge, borderRadius: s.badge / 2 },
        ]}
      >
        <IconComponent size={s.icon} color={COLORS.bgDarkest} />
      </LinearGradient>
      {showLabel && (
        <Text style={[styles.levelBadgeLabel, { fontSize: s.font }]}>
          Lv.{level}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelBadge: {
    marginRight: SPACING.md,
  },
  badgeGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  levelTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xxs,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  xpLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  nextLevelText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  weeklyXPContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyXPText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.sm,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactLevel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xxs,
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  compactXP: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },

  // Level badge styles
  levelBadgeContainer: {
    alignItems: 'center',
  },
  levelBadgeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeLabel: {
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.xxs,
  },
});

export default XPGoalTracker;
