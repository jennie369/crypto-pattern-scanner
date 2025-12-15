/**
 * Daily Score Card Component
 * Hero section with progress ring, streak, level, tasks
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { ScoreRing } from '../Charts/ProgressRing';

const DailyScoreCard = ({
  dailyScore = 0,
  tasksCompleted = 0,
  tasksTotal = 0,
  streakDays = 0,
  currentLevel = 1,
  levelTitle = 'Người Mới Bắt Đầu',
  comboCount = 0,
  xpToday = 0,
  style,
}) => {
  // Combo multiplier display
  const getComboMultiplier = () => {
    if (comboCount >= 3) return 'x2.0';
    if (comboCount >= 2) return 'x1.5';
    if (comboCount >= 1) return 'x1.25';
    return 'x1.0';
  };

  const isFullCombo = comboCount >= 3;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(106, 91, 255, 0.15)', 'rgba(0, 240, 255, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {/* Main content row */}
        <View style={styles.mainRow}>
          {/* Score Ring */}
          <View style={styles.scoreContainer}>
            <ScoreRing
              score={dailyScore}
              label="Điểm hôm nay"
              size={130}
              gradientColors={[COLORS.gold, COLORS.cyan]}
            />
          </View>

          {/* Stats column */}
          <View style={styles.statsColumn}>
            {/* Streak */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Icons.Flame size={18} color={COLORS.gold} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{streakDays}</Text>
                <Text style={styles.statLabel}>ngày streak</Text>
              </View>
            </View>

            {/* Level */}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                <Icons.Star size={18} color={COLORS.purple} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>Lv.{currentLevel}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{levelTitle}</Text>
              </View>
            </View>

            {/* Tasks */}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                <Icons.CheckCircle size={18} color={COLORS.success} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{tasksCompleted}/{tasksTotal}</Text>
                <Text style={styles.statLabel}>tasks</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom row - Combo & XP */}
        <View style={styles.bottomRow}>
          {/* Combo indicator */}
          <View style={[styles.comboBadge, isFullCombo && styles.comboBadgeActive]}>
            <Icons.Zap size={14} color={isFullCombo ? COLORS.bgDarkest : COLORS.gold} />
            <Text style={[styles.comboText, isFullCombo && styles.comboTextActive]}>
              Combo {getComboMultiplier()}
            </Text>
          </View>

          {/* XP earned today */}
          <View style={styles.xpBadge}>
            <Icons.Sparkles size={14} color={COLORS.cyan} />
            <Text style={styles.xpText}>+{xpToday} XP hôm nay</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Compact version for smaller displays
export const DailyScoreCardCompact = ({
  dailyScore = 0,
  streakDays = 0,
  comboCount = 0,
  style,
}) => {
  return (
    <View style={[styles.compactContainer, style]}>
      <View style={styles.compactScoreRow}>
        <ScoreRing
          score={dailyScore}
          size={60}
          strokeWidth={6}
          showPercentage={false}
          centerContent={
            <Text style={styles.compactScoreText}>{Math.round(dailyScore)}</Text>
          }
        />
        <View style={styles.compactStats}>
          <View style={styles.compactStatRow}>
            <Icons.Flame size={14} color={COLORS.gold} />
            <Text style={styles.compactStatText}>{streakDays} ngày</Text>
          </View>
          <View style={styles.compactStatRow}>
            <Icons.Zap size={14} color={comboCount >= 3 ? COLORS.success : COLORS.textMuted} />
            <Text style={styles.compactStatText}>
              Combo x{comboCount >= 3 ? '2.0' : comboCount >= 2 ? '1.5' : '1.0'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  gradientBg: {
    padding: SPACING.lg,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreContainer: {
    marginRight: SPACING.lg,
  },
  statsColumn: {
    flex: 1,
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  comboBadgeActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  comboText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.xs,
  },
  comboTextActive: {
    color: COLORS.bgDarkest,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    color: COLORS.cyan,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  compactScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactScoreText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactStats: {
    marginLeft: SPACING.md,
    gap: SPACING.xs,
  },
  compactStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStatText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.xs,
  },
});

export default DailyScoreCard;
