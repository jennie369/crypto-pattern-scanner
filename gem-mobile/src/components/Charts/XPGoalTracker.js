/**
 * XP Goal Tracker Component
 * Level progress with XP tracking
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { LEVELS } from '../../services/progressCalculator';

const XPGoalTracker = ({
  totalXP = 0,
  currentLevel = 1,
  levelTitle = 'Nguoi Moi Bat Dau',
  levelBadge = 'seedling',
  xpForCurrentLevel = 0,
  xpForNextLevel = 100,
  animated = true,
  showWeeklyXP = false,
  weeklyXP = 0,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: glass.borderRadius,
      padding: SPACING.lg,
      borderWidth: glass.borderWidth,
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
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    levelTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginTop: SPACING.xxs,
    },
    xpContainer: {
      alignItems: 'flex-end',
    },
    xpValue: {
      color: colors.gold,
      fontSize: TYPOGRAPHY.fontSize.display,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    xpLabel: {
      color: colors.textMuted,
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
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
    nextLevelText: {
      color: colors.purple,
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
      color: colors.success,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginLeft: SPACING.xs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
            colors={gradients.gold}
            style={styles.badgeGradient}
          >
            <BadgeIcon size={20} color={colors.bgDarkest} />
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
              colors={gradients.glassBorder}
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
          <Icons.TrendingUp size={14} color={colors.success} />
          <Text style={styles.weeklyXPText}>
            +{weeklyXP.toLocaleString()} XP tuan nay
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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
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
      color: colors.textPrimary,
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
      backgroundColor: colors.gold,
      borderRadius: 2,
    },
    compactXP: {
      color: colors.gold,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginLeft: SPACING.sm,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.compactRow, style]}>
      <View style={styles.compactBadge}>
        <Icons.Gem size={16} color={colors.gold} />
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

// Inline compact version - single row with all info, minimal height
export const XPGoalTrackerInline = ({
  totalXP = 0,
  currentLevel = 1,
  levelTitle = 'Nguoi Moi Bat Dau',
  levelBadge = 'seedling',
  xpForCurrentLevel = 0,
  xpForNextLevel = 100,
  showWeeklyXP = false,
  weeklyXP = 0,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    inlineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
    },
    inlineBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm,
    },
    inlineInfo: {
      flex: 1,
    },
    inlineLevelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    inlineLevelText: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    inlineTitleText: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    inlineProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.xxs,
      gap: SPACING.xs,
    },
    inlineProgressBar: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    inlineProgressFill: {
      height: '100%',
      backgroundColor: colors.gold,
      borderRadius: 2,
    },
    inlineXPText: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.fontSize.xxs,
      minWidth: 50,
      textAlign: 'right',
    },
    inlineXPContainer: {
      alignItems: 'flex-end',
      marginLeft: SPACING.sm,
    },
    inlineXPValue: {
      color: colors.gold,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    inlineWeeklyXP: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: 2,
    },
    inlineWeeklyText: {
      color: colors.success,
      fontSize: TYPOGRAPHY.fontSize.xxs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Calculate progress
  const xpInLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeededForLevel > 0
    ? Math.min(100, (xpInLevel / xpNeededForLevel) * 100)
    : 100;

  // Get icon
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

  return (
    <View style={[styles.inlineContainer, style]}>
      {/* Badge + Level Info */}
      <View style={styles.inlineBadge}>
        <IconComponent size={16} color={colors.gold} />
      </View>

      <View style={styles.inlineInfo}>
        <View style={styles.inlineLevelRow}>
          <Text style={styles.inlineLevelText}>Level {currentLevel}</Text>
          <Text style={styles.inlineTitleText}>{levelTitle}</Text>
        </View>
        <View style={styles.inlineProgressRow}>
          <View style={styles.inlineProgressBar}>
            <View style={[styles.inlineProgressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.inlineXPText}>{xpInLevel}/{xpNeededForLevel}</Text>
        </View>
      </View>

      {/* Total XP */}
      <View style={styles.inlineXPContainer}>
        <Text style={styles.inlineXPValue}>{totalXP}</Text>
        {showWeeklyXP && weeklyXP > 0 && (
          <View style={styles.inlineWeeklyXP}>
            <Icons.TrendingUp size={10} color={colors.success} />
            <Text style={styles.inlineWeeklyText}>+{weeklyXP}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Mini badge display
export const LevelBadge = ({
  level = 1,
  size = 'medium',
  showLabel = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    levelBadgeContainer: {
      alignItems: 'center',
    },
    levelBadgeCircle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    levelBadgeLabel: {
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      marginTop: SPACING.xxs,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
        colors={gradients.gold}
        style={[
          styles.levelBadgeCircle,
          { width: s.badge, height: s.badge, borderRadius: s.badge / 2 },
        ]}
      >
        <IconComponent size={s.icon} color={colors.bgDarkest} />
      </LinearGradient>
      {showLabel && (
        <Text style={[styles.levelBadgeLabel, { fontSize: s.font }]}>
          Lv.{level}
        </Text>
      )}
    </View>
  );
};

export default XPGoalTracker;
