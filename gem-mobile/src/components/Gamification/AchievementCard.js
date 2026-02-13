/**
 * GEM Academy - Achievement Card
 * Badge-style achievement display with progress
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame, BookOpen, Trophy, Medal, Award, Star, Zap, GraduationCap,
  Crown, Target, CheckSquare, Layers, Lock
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
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

const AchievementCard = ({
  achievement,
  userProgress = 0,
  isUnlocked = false,
  isNew = false,
  onPress,
  compact = false,
  style = {},
}) => {
  if (!achievement) return null;

  const {
    name = 'Achievement',
    description = '',
    icon = 'Trophy',
    color = COLORS.gold,
    requirement_value = 1,
    xp_reward = 0,
    category = 'general',
  } = achievement;

  const IconComponent = ACHIEVEMENT_ICONS[icon] || Trophy;
  const progressPercent = isUnlocked ? 100 : Math.min((userProgress / requirement_value) * 100, 99);

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
            color={isUnlocked ? COLORS.bgDarkest : COLORS.textMuted}
            strokeWidth={2}
          />
          {isNew && <View style={styles.newDot} />}
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Lock size={12} color={COLORS.textMuted} strokeWidth={2.5} />
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
            : ['rgba(15, 16, 48, 0.7)', 'rgba(15, 16, 48, 0.5)']
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
                color={isUnlocked ? COLORS.bgDarkest : COLORS.textMuted}
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

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    fontSize: 8,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  newDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },
  content: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  textLocked: {
    color: COLORS.textMuted,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
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
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.bgDarkest,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default AchievementCard;
