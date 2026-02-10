/**
 * GEM Academy - Achievement Card
 * Badge-style achievement display with progress
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame, BookOpen, Trophy, Medal, Award, Star, Zap, GraduationCap,
  Crown, Target, CheckSquare, Layers, Lock
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import CircularProgress from '../Common/CircularProgress';

// Icon mapping
const ACHIEVEMENT_ICONS = {
  Flame,
  BookOpen,
  Trophy,
  Medal,
  Award,
  Star,
  Zap,
  GraduationCap,
  Crown,
  Target,
  CheckSquare,
  Layers,
};

const BORDER_RADIUS = { lg: 16, md: 12, sm: 8, xs: 4 };

const AchievementCard = ({
  achievement,
  userProgress = 0,
  isUnlocked = false,
  isNew = false,
  onPress,
  compact = false,
  style = {},
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      marginBottom: SPACING.md,
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
    },
    badgeContainer: {
      position: 'relative',
      marginRight: SPACING.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.error,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    newText: {
      fontSize: 8,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    newDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.error,
      borderWidth: 2,
      borderColor: colors.bgDarkest,
    },
    content: {
      flex: 1,
      marginRight: SPACING.md,
    },
    name: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xxs,
    },
    textLocked: {
      color: colors.textMuted,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      lineHeight: 18,
      marginBottom: SPACING.sm,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.xs,
      marginRight: SPACING.sm,
    },
    categoryText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      textTransform: 'capitalize',
    },
    xpReward: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.gold,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    progressContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50,
    },
    progressText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    unlockedBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
    },
    unlockedText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    lockOverlay: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: colors.bgDarkest,
      borderRadius: 8,
      padding: 2,
    },
    // Compact mode
    compactContainer: {
      alignItems: 'center',
      width: 80,
      padding: SPACING.sm,
    },
    compactBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      marginBottom: SPACING.xs,
      position: 'relative',
    },
    compactName: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textPrimary,
      textAlign: 'center',
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!achievement) return null;

  const {
    name = 'Achievement',
    description = '',
    icon = 'Trophy',
    color = colors.gold,
    requirement_value = 1,
    xp_reward = 0,
    category = 'general',
  } = achievement;

  const IconComponent = ACHIEVEMENT_ICONS[icon] || Trophy;
  const progressPercent = isUnlocked ? 100 : Math.min((userProgress / requirement_value) * 100, 99);

  const gradientBackground = settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)');

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <View style={[
          styles.compactBadge,
          isUnlocked
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }
        ]}>
          <IconComponent
            size={24}
            color={isUnlocked ? colors.bgDarkest : colors.textMuted}
            strokeWidth={2}
          />
          {isNew && <View style={styles.newDot} />}
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={12} color={colors.textMuted} strokeWidth={2.5} />
            </View>
          )}
        </View>
        <Text style={[styles.compactName, !isUnlocked && styles.textLocked]} numberOfLines={2}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <LinearGradient
        colors={
          isUnlocked
            ? [`${color}30`, `${color}10`]
            : [gradientBackground, gradientBackground]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Left: Progress circle with icon */}
        <View style={styles.badgeContainer}>
          <CircularProgress
            progress={progressPercent}
            size={56}
            strokeWidth={4}
            progressColor={color}
            backgroundColor="rgba(255, 255, 255, 0.1)"
          >
            <View style={[
              styles.iconCircle,
              isUnlocked
                ? { backgroundColor: color }
                : { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            ]}>
              <IconComponent
                size={20}
                color={isUnlocked ? colors.bgDarkest : colors.textMuted}
                strokeWidth={2.5}
              />
            </View>
          </CircularProgress>
          {isNew && <View style={styles.newBadge}><Text style={styles.newText}>NEW</Text></View>}
        </View>

        {/* Middle: Content */}
        <View style={styles.content}>
          <Text style={[styles.name, !isUnlocked && styles.textLocked]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.footer}>
            <View style={[styles.categoryBadge, { backgroundColor: `${color}20` }]}>
              <Text style={[styles.categoryText, { color }]}>{category}</Text>
            </View>
            {xp_reward > 0 && (
              <Text style={styles.xpReward}>+{xp_reward} XP</Text>
            )}
          </View>
        </View>

        {/* Right: Progress text */}
        <View style={styles.progressContainer}>
          {isUnlocked ? (
            <View style={[styles.unlockedBadge, { backgroundColor: `${color}30` }]}>
              <Text style={[styles.unlockedText, { color }]}>100%</Text>
            </View>
          ) : (
            <Text style={styles.progressText}>
              {userProgress}/{requirement_value}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default AchievementCard;
