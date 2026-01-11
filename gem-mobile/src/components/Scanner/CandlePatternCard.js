/**
 * GEM Mobile - Candle Pattern Card Component
 * Phase 3A: Detailed view of candlestick confirmation patterns
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sunrise,
  Sunset,
  Check,
  Target,
  Shield,
  BarChart2,
  Clock,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { getConfirmationStrength } from '../../constants/confirmationConfig';

// Map pattern IDs to icons
const PATTERN_ICONS = {
  bullish_engulfing: TrendingUp,
  bearish_engulfing: TrendingDown,
  bullish_pin_bar: ArrowUp,
  bearish_pin_bar: ArrowDown,
  bullish_hammer: ArrowUp,
  shooting_star: ArrowDown,
  morning_star: Sunrise,
  evening_star: Sunset,
  inside_bar: Minus,
  doji: Minus,
};

/**
 * Main CandlePatternCard component
 */
const CandlePatternCard = memo(({ confirmation, showTradingLevels = true }) => {
  if (!confirmation) {
    return (
      <View style={styles.emptyCard}>
        <Info size={24} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Chưa phát hiện pattern confirmation</Text>
        <Text style={styles.emptyHint}>
          Đợi price action tại zone để nhận confirmation signal
        </Text>
      </View>
    );
  }

  const {
    patternId,
    pattern,
    type,
    score,
    strength,
    confirmationCandle,
    entryPrice,
    stopLoss,
    engulfRatio,
    wickBodyRatio,
    bodyPercent,
    dojiType,
    dojiTypeVi,
    note,
    detectedAt,
  } = confirmation;

  const IconComponent = PATTERN_ICONS[patternId] || Check;
  const strengthConfig = getConfirmationStrength(score);
  const isBullish = type === 'bullish';
  const isBearish = type === 'bearish';
  const typeColor = isBullish ? COLORS.success : isBearish ? COLORS.error : COLORS.gold;

  return (
    <View style={[styles.card, { borderColor: typeColor + '40' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: typeColor + '20' }]}>
          <IconComponent size={24} color={typeColor} />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.patternName, { color: typeColor }]}>
            {pattern?.nameVi || patternId}
          </Text>
          <Text style={styles.patternEnglish}>
            {pattern?.name || patternId}
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: strengthConfig.color }]}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>điểm</Text>
        </View>
      </View>

      {/* Description */}
      {pattern?.description && (
        <View style={styles.descriptionRow}>
          <Info size={14} color={COLORS.textSecondary} />
          <Text style={styles.descriptionText}>{pattern.description}</Text>
        </View>
      )}

      {/* Metrics */}
      <View style={styles.metricsGrid}>
        {/* Strength */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Độ mạnh</Text>
          <View style={styles.metricValueRow}>
            <View style={[styles.strengthDot, { backgroundColor: strengthConfig.color }]} />
            <Text style={[styles.metricValue, { color: strengthConfig.color }]}>
              {strengthConfig.label}
            </Text>
          </View>
        </View>

        {/* Type */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Loại</Text>
          <Text style={[styles.metricValue, { color: typeColor }]}>
            {isBullish ? 'Tăng' : isBearish ? 'Giảm' : 'Trung tính'}
          </Text>
        </View>

        {/* Reliability */}
        {pattern?.reliability && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Độ tin cậy</Text>
            <Text style={styles.metricValue}>{pattern.reliability}%</Text>
          </View>
        )}

        {/* Pattern-specific metrics */}
        {engulfRatio && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Tỷ lệ nuốt</Text>
            <Text style={styles.metricValue}>{engulfRatio}%</Text>
          </View>
        )}

        {wickBodyRatio && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Râu/Body</Text>
            <Text style={styles.metricValue}>{wickBodyRatio}x</Text>
          </View>
        )}

        {bodyPercent && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Body %</Text>
            <Text style={styles.metricValue}>{bodyPercent}%</Text>
          </View>
        )}

        {dojiType && (
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Loại Doji</Text>
            <Text style={styles.metricValue}>{dojiTypeVi || dojiType}</Text>
          </View>
        )}
      </View>

      {/* Trading Levels */}
      {showTradingLevels && (entryPrice || stopLoss) && (
        <View style={styles.tradingSection}>
          <Text style={styles.sectionTitle}>Mức giao dịch</Text>

          <View style={styles.tradingLevels}>
            {entryPrice && (
              <View style={styles.levelItem}>
                <View style={[styles.levelIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <Target size={14} color={COLORS.success} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>Entry</Text>
                  <Text style={[styles.levelValue, { color: COLORS.success }]}>
                    {typeof entryPrice === 'number' ? entryPrice.toFixed(4) : entryPrice}
                  </Text>
                </View>
              </View>
            )}

            {stopLoss && (
              <View style={styles.levelItem}>
                <View style={[styles.levelIcon, { backgroundColor: COLORS.error + '20' }]}>
                  <Shield size={14} color={COLORS.error} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>Stop Loss</Text>
                  <Text style={[styles.levelValue, { color: COLORS.error }]}>
                    {typeof stopLoss === 'number' ? stopLoss.toFixed(4) : stopLoss}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Note */}
      {note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )}

      {/* Timestamp */}
      {detectedAt && (
        <View style={styles.timestampRow}>
          <Clock size={12} color={COLORS.textMuted} />
          <Text style={styles.timestampText}>
            Phát hiện: {new Date(detectedAt).toLocaleString('vi-VN')}
          </Text>
        </View>
      )}
    </View>
  );
});

/**
 * Compact pattern list item
 */
export const CandlePatternListItem = memo(({ confirmation, onPress }) => {
  if (!confirmation) return null;

  const {
    patternId,
    pattern,
    type,
    score,
  } = confirmation;

  const IconComponent = PATTERN_ICONS[patternId] || Check;
  const strengthConfig = getConfirmationStrength(score);
  const isBullish = type === 'bullish';
  const isBearish = type === 'bearish';
  const typeColor = isBullish ? COLORS.success : isBearish ? COLORS.error : COLORS.gold;

  return (
    <View style={styles.listItem}>
      <View style={[styles.listIconCircle, { backgroundColor: typeColor + '20' }]}>
        <IconComponent size={16} color={typeColor} />
      </View>

      <View style={styles.listContent}>
        <Text style={[styles.listPatternName, { color: typeColor }]}>
          {pattern?.nameVi || patternId}
        </Text>
        <Text style={styles.listStrength}>{strengthConfig.label}</Text>
      </View>

      <View style={[styles.listScore, { backgroundColor: strengthConfig.color }]}>
        <Text style={styles.listScoreText}>{score}</Text>
      </View>
    </View>
  );
});

/**
 * Pattern summary for quick view
 */
export const PatternSummary = memo(({ patterns }) => {
  if (!patterns || patterns.length === 0) {
    return (
      <View style={styles.summaryEmpty}>
        <Text style={styles.summaryEmptyText}>Chưa có confirmation</Text>
      </View>
    );
  }

  const totalScore = patterns.reduce((sum, p) => sum + (p.score || 0), 0);
  const strength = getConfirmationStrength(totalScore);
  const bestPattern = patterns[0];

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <BarChart2 size={16} color={strength.color} />
        <Text style={[styles.summaryTitle, { color: strength.color }]}>
          {patterns.length} Pattern{patterns.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.summaryStats}>
        <View style={styles.summaryStat}>
          <Text style={styles.summaryStatLabel}>Tổng điểm</Text>
          <Text style={[styles.summaryStatValue, { color: strength.color }]}>
            {totalScore}
          </Text>
        </View>

        <View style={styles.summaryStat}>
          <Text style={styles.summaryStatLabel}>Tốt nhất</Text>
          <Text style={styles.summaryStatValue}>
            {bestPattern?.pattern?.nameVi || bestPattern?.patternId}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Main card
  card: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  patternName: {
    fontSize: 18,
    fontWeight: '700',
  },
  patternEnglish: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.bgDarkest,
    opacity: 0.7,
  },

  // Description
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricItem: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    minWidth: '30%',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Trading section
  tradingSection: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  tradingLevels: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  levelItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  levelValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Note
  noteContainer: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    paddingLeft: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Timestamp
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'flex-end',
  },
  timestampText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
  },
  listIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listPatternName: {
    fontSize: 13,
    fontWeight: '600',
  },
  listStrength: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  listScore: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.xs,
  },
  listScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },

  // Summary
  summaryContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  summaryEmpty: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryEmptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  summaryStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

CandlePatternCard.displayName = 'CandlePatternCard';
CandlePatternListItem.displayName = 'CandlePatternListItem';
PatternSummary.displayName = 'PatternSummary';

export default CandlePatternCard;
