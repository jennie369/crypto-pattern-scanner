/**
 * GEM Academy - Daily Quest Card
 * Single quest card with progress and claim button
 * Vietnamese text with fallback translations
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, PlayCircle, CheckSquare, Target, Layers, Gift, Check } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import ProgressBar from '../Common/ProgressBar';

// Icon mapping
const QUEST_ICONS = {
  BookOpen,
  PlayCircle,
  CheckSquare,
  Target,
  Layers,
  Gift,
};

const BORDER_RADIUS = { lg: 16, md: 12, sm: 8, full: 9999 };

// Vietnamese fallback translations for quest codes (in case DB has no diacritics)
const QUEST_TRANSLATIONS = {
  complete_1_lesson: { name: 'Hoàn thành 1 bài học', description: 'Hoàn thành 1 bài học bất kỳ' },
  complete_2_lessons: { name: 'Hoàn thành 2 bài học', description: 'Hoàn thành 2 bài học bất kỳ' },
  watch_10_min: { name: 'Xem video 10 phút', description: 'Xem ít nhất 10 phút video' },
  watch_20_min: { name: 'Xem video 20 phút', description: 'Xem ít nhất 20 phút video' },
  pass_quiz: { name: 'Vượt qua 1 quiz', description: 'Hoàn thành và vượt qua 1 bài quiz' },
  pass_quiz_80: { name: 'Điểm cao quiz', description: 'Đạt ít nhất 80% trong 1 bài quiz' },
  complete_module: { name: 'Hoàn thành 1 module', description: 'Hoàn thành tất cả bài trong 1 module' },
};

// Helper to check if text has proper Vietnamese diacritics
const hasVietnameseDiacritics = (text) => {
  const diacriticPattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  return diacriticPattern.test(text);
};

const DailyQuestCard = ({
  quest,
  progress = 0,
  isCompleted = false,
  isClaimed = false,
  onClaim,
  claiming = false,
  style = {},
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Difficulty colors - using colors from context
  const DIFFICULTY_COLORS = useMemo(() => ({
    easy: colors.success,
    medium: colors.gold,
    hard: '#FF6B35',
  }), [colors]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      marginBottom: SPACING.sm,
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      marginRight: SPACING.md,
    },
    content: {
      flex: 1,
      marginRight: SPACING.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xxs,
    },
    name: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      flex: 1,
      marginRight: SPACING.sm,
    },
    xpBadge: {
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: BORDER_RADIUS.sm,
    },
    xpText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginBottom: SPACING.sm,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      marginLeft: SPACING.sm,
      minWidth: 35,
    },
    actionContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    claimButton: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: colors.gold,
      justifyContent: 'center',
      alignItems: 'center',
    },
    claimedBadge: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: 'rgba(58, 247, 166, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.success,
    },
    lockedBadge: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    lockedText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!quest) return null;

  const {
    code = '',
    name: dbName = 'Quest',
    description: dbDesc = '',
    icon = 'BookOpen',
    requirement_value = 1,
    xp_reward = 10,
    difficulty = 'easy',
  } = quest;

  // Use Vietnamese fallback if DB text lacks diacritics
  const fallback = QUEST_TRANSLATIONS[code];
  const name = (fallback && !hasVietnameseDiacritics(dbName)) ? fallback.name : dbName;
  const description = (fallback && !hasVietnameseDiacritics(dbDesc)) ? fallback.description : dbDesc;

  const IconComponent = QUEST_ICONS[icon] || BookOpen;
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || colors.gold;
  const progressPercent = Math.min((progress / requirement_value) * 100, 100);
  const canClaim = isCompleted && !isClaimed;

  const gradientBackground = settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)');

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[gradientBackground, gradientBackground]}
        style={styles.gradient}
      >
        {/* Left: Icon */}
        <View style={[styles.iconContainer, { borderColor: difficultyColor }]}>
          <IconComponent size={20} color={difficultyColor} strokeWidth={2} />
        </View>

        {/* Middle: Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{xp_reward} XP</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progressPercent}
              height={6}
              fillColor={isCompleted ? colors.success : difficultyColor}
              backgroundColor="rgba(255, 255, 255, 0.1)"
            />
            <Text style={styles.progressText}>
              {Math.min(progress, requirement_value)}/{requirement_value}
            </Text>
          </View>
        </View>

        {/* Right: Action */}
        <View style={styles.actionContainer}>
          {isClaimed ? (
            <View style={styles.claimedBadge}>
              <Check size={16} color={colors.success} strokeWidth={3} />
            </View>
          ) : canClaim ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={onClaim}
              disabled={claiming}
              activeOpacity={0.7}
            >
              {claiming ? (
                <ActivityIndicator size="small" color={colors.bgDarkest} />
              ) : (
                <Gift size={18} color={colors.bgDarkest} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>{Math.round(progressPercent)}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default DailyQuestCard;
