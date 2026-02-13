/**
 * DailySummaryCard.js
 * Daily summary card for Calendar Smart Journal
 * Shows mood, XP, completed items, trading P/L
 *
 * Created: January 28, 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Smile,
  Frown,
  Meh,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Flame,
  Sparkles,
  ChevronRight,
  BookOpen,
  Heart,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../theme';
import { MOODS, getMoodById } from '../../services/moodTrackingService';

// Mood icon mapping
const MOOD_ICONS = {
  happy: Smile,
  excited: Sparkles,
  peaceful: Heart,
  content: CheckCircle2,
  neutral: Meh,
  tired: Meh,
  anxious: Meh,
  sad: Frown,
  stressed: Frown,
  angry: Frown,
};

/**
 * DailySummaryCard Component
 */
const DailySummaryCard = ({
  data = {},
  mood = null,
  loading = false,
  isToday = false,
  onPress,
  compact = false,
}) => {
  const {
    totalXP = 0,
    goalsCompleted = 0,
    goalsTotal = 0,
    habitsCompleted = 0,
    habitsTotal = 0,
    ritualsCompleted = 0,
    ritualsTotal = 0,
    journalCount = 0,
    tradingCount = 0,
    tradingPnL = null,
    tradingWins = 0,
    tradingLosses = 0,
    streak = 0,
    dailyScore = 0,
  } = data;

  // Get mood data
  const moodData = mood ? getMoodById(mood.overall_mood || mood) : null;
  const MoodIcon = moodData ? MOOD_ICONS[moodData.id] || Meh : null;

  // Calculate completion percentage
  const totalItems = goalsTotal + habitsTotal + ritualsTotal;
  const completedItems = goalsCompleted + habitsCompleted + ritualsCompleted;
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.container, styles.containerCompact]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={styles.compactContent}>
          {/* Mood */}
          {moodData && MoodIcon && (
            <View style={[styles.compactMood, { backgroundColor: moodData.color + '20' }]}>
              <MoodIcon size={16} color={moodData.color} />
            )}
            </View>
          )}

          {/* Score */}
          <View style={styles.compactScore}>
            <Text style={styles.compactScoreValue}>{dailyScore}</Text>
            <Text style={styles.compactScoreLabel}>Diem</Text>
          </View>

          {/* Completion */}
          <View style={styles.compactStat}>
            <Text style={styles.compactStatValue}>{completedItems}/{totalItems}</Text>
            <Text style={styles.compactStatLabel}>Hoan thanh</Text>
          </View>

          {/* XP */}
          <View style={styles.compactStat}>
            <Text style={[styles.compactStatValue, { color: COLORS.gold }]}>+{totalXP}</Text>
            <Text style={styles.compactStatLabel}>XP</Text>
          </View>

          {/* Trading P/L */}
          {tradingCount > 0 && tradingPnL !== null && (
            <View style={styles.compactStat}>
              <Text
                style={[
                  styles.compactStatValue,
                  { color: tradingPnL >= 0 ? COLORS.success : COLORS.error },
                ]}
              >
                {tradingPnL >= 0 ? '+' : ''}{tradingPnL.toFixed(1)}%
              </Text>
              <Text style={styles.compactStatLabel}>P/L</Text>
            </View>
          )}
        </View>

        {onPress && <ChevronRight size={16} color={COLORS.textMuted} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Mood indicator */}
          {moodData && MoodIcon && (
            <View style={[styles.moodBadge, { backgroundColor: moodData.color + '20' }]}>
              <MoodIcon size={20} color={moodData.color} />
              <Text style={[styles.moodLabel, { color: moodData.color }]}>
                {moodData.label}
              </Text>
            )}
            </View>
          )}

          {/* Streak */}
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Flame size={14} color={COLORS.gold} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>

        {/* Daily score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{dailyScore}</Text>
          <Text style={styles.scoreLabel}>Diem ngay</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {/* Goals */}
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.purple + '20' }]}>
            <Target size={16} color={COLORS.purple} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>
              {goalsCompleted}/{goalsTotal}
            </Text>
            <Text style={styles.statLabel}>Muc tieu</Text>
          </View>
        </View>

        {/* Habits */}
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.cyan + '20' }]}>
            <CheckCircle2 size={16} color={COLORS.cyan} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>
              {habitsCompleted}/{habitsTotal}
            </Text>
            <Text style={styles.statLabel}>Thoi quen</Text>
          </View>
        </View>

        {/* Rituals */}
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.gold + '20' }]}>
            <Sparkles size={16} color={COLORS.gold} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>
              {ritualsCompleted}/{ritualsTotal}
            </Text>
            <Text style={styles.statLabel}>Rituals</Text>
          </View>
        </View>

        {/* XP */}
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.success + '20' }]}>
            <TrendingUp size={16} color={COLORS.success} />
          </View>
          <View style={styles.statText}>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>+{totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
      </View>

      {/* Journal & Trading row */}
      {(journalCount > 0 || tradingCount > 0) && (
        <View style={styles.secondaryRow}>
          {/* Journal entries */}
          {journalCount > 0 && (
            <View style={styles.secondaryItem}>
              <BookOpen size={14} color={COLORS.purple} />
              <Text style={styles.secondaryText}>
                {journalCount} ghi chep
              </Text>
            </View>
          )}

          {/* Trading */}
          {tradingCount > 0 && (
            <View style={styles.secondaryItem}>
              {tradingPnL !== null && tradingPnL >= 0 ? (
                <TrendingUp size={14} color={COLORS.success} />
              ) : (
                <TrendingDown size={14} color={COLORS.error} />
              )}
              <Text style={styles.secondaryText}>
                {tradingCount} lenh
                {tradingPnL !== null && (
                  <Text
                    style={{
                      color: tradingPnL >= 0 ? COLORS.success : COLORS.error,
                    }}
                  >
                    {' '}({tradingPnL >= 0 ? '+' : ''}{tradingPnL.toFixed(1)}%)
                  </Text>
                )}
              </Text>
              {(tradingWins > 0 || tradingLosses > 0) && (
                <Text style={styles.winLossText}>
                  {tradingWins}W/{tradingLosses}L
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Completion progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{completionPercent}% hoan thanh</Text>
      </View>

      {/* Today indicator */}
      {isToday && (
        <View style={styles.todayIndicator}>
          <Text style={styles.todayText}>Hom nay</Text>
        )}
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * MiniDailySummary - Ultra compact summary for calendar cells
 */
export const MiniDailySummary = ({ mood, xp, completion }) => {
  const moodData = mood ? getMoodById(mood) : null;

  return (
    <View style={styles.miniContainer}>
      {moodData && (
        <View
          style={[
            styles.miniMoodDot,
            { backgroundColor: moodData.color },
          ]}
        />
      )}
      {xp > 0 && (
        <Text style={styles.miniXP}>+{xp}</Text>
      )}
    </View>
  );
};

/**
 * WeeklySummaryCard - Summary for the week
 */
export const WeeklySummaryCard = ({
  data = {},
  onPress,
}) => {
  const {
    totalXP = 0,
    avgScore = 0,
    completionRate = 0,
    bestDay = null,
    tradingPnL = null,
    streakDays = 0,
  } = data;

  return (
    <TouchableOpacity
      style={styles.weeklyContainer}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Text style={styles.weeklyTitle}>Tuan nay</Text>

      <View style={styles.weeklyStatsGrid}>
        <View style={styles.weeklyStat}>
          <Text style={styles.weeklyStatValue}>{avgScore.toFixed(0)}</Text>
          <Text style={styles.weeklyStatLabel}>TB diem</Text>
        </View>

        <View style={styles.weeklyStat}>
          <Text style={[styles.weeklyStatValue, { color: COLORS.gold }]}>+{totalXP}</Text>
          <Text style={styles.weeklyStatLabel}>XP</Text>
        </View>

        <View style={styles.weeklyStat}>
          <Text style={styles.weeklyStatValue}>{completionRate}%</Text>
          <Text style={styles.weeklyStatLabel}>Hoan thanh</Text>
        </View>

        {tradingPnL !== null && (
          <View style={styles.weeklyStat}>
            <Text
              style={[
                styles.weeklyStatValue,
                { color: tradingPnL >= 0 ? COLORS.success : COLORS.error },
              ]}
            >
              {tradingPnL >= 0 ? '+' : ''}{tradingPnL.toFixed(1)}%
            </Text>
            <Text style={styles.weeklyStatLabel}>P/L</Text>
          </View>
        )}
      </View>

      {streakDays > 0 && (
        <View style={styles.weeklyStreak}>
          <Flame size={14} color={COLORS.gold} />
          <Text style={styles.weeklyStreakText}>
            Streak {streakDays} ngay lien tiep
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  containerCompact: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingPlaceholder: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  streakText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    gap: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  secondaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  winLossText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    minWidth: 70,
    textAlign: 'right',
  },
  todayIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.gold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  todayText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Compact styles
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  compactMood: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactScore: {
    alignItems: 'center',
  },
  compactScoreValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  compactScoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  compactStat: {
    alignItems: 'center',
  },
  compactStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  compactStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Mini styles
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  miniMoodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniXP: {
    fontSize: 8,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Weekly styles
  weeklyContainer: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  weeklyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  weeklyStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  weeklyStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  weeklyStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  weeklyStreakText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
});

export default DailySummaryCard;
