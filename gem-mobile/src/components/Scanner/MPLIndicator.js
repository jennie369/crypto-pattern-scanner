/**
 * GEM Mobile - MPL (Most Penetrated Level) Indicator Component
 * Phase 3B: Display MPL visualization and entry improvement
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Target,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Check,
  AlertCircle,
  BarChart2,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

/**
 * Main MPLIndicator component
 */
const MPLIndicator = memo(({ mpl, zone, showDetails = true }) => {
  if (!mpl) {
    return (
      <View style={styles.emptyContainer}>
        <Target size={16} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>MPL chưa tính được</Text>
      </View>
    );
  }

  const {
    mplPrice,
    penetrations,
    quality,
    improvement,
    recommendationVi,
  } = mpl;

  const qualityColor = quality === 'excellent'
    ? COLORS.success
    : quality === 'good'
      ? COLORS.gold
      : COLORS.warning;

  const qualityLabel = quality === 'excellent'
    ? 'Xuất sắc'
    : quality === 'good'
      ? 'Tốt'
      : 'Trung bình';

  return (
    <View style={[styles.container, { borderColor: qualityColor + '40' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Target size={16} color={qualityColor} />
        <Text style={styles.title}>MPL - Most Penetrated Level</Text>
        <View style={[styles.qualityBadge, { backgroundColor: qualityColor }]}>
          <Text style={styles.qualityText}>{qualityLabel}</Text>
        </View>
      </View>

      {showDetails && (
        <>
          {/* MPL Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>MPL Price</Text>
            <Text style={[styles.priceValue, { color: qualityColor }]}>
              {mplPrice?.toFixed(4)}
            </Text>
          </View>

          {/* Penetration count */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <BarChart2 size={14} color={COLORS.textSecondary} />
              <Text style={styles.statValue}>{penetrations}</Text>
              <Text style={styles.statLabel}>Penetrations</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <TrendingDown size={14} color={COLORS.success} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                -{improvement?.stopReductionPercent}%
              </Text>
              <Text style={styles.statLabel}>Stop giảm</Text>
            </View>
          </View>

          {/* Entry comparison */}
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Zone Entry</Text>
              <Text style={styles.comparisonValue}>
                {improvement?.originalEntry?.toFixed(4)}
              </Text>
            </View>

            <ArrowRight size={16} color={qualityColor} />

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>MPL Entry</Text>
              <Text style={[styles.comparisonValue, { color: qualityColor }]}>
                {improvement?.mplEntry?.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Recommendation */}
          <View style={styles.recommendationContainer}>
            {quality === 'excellent' || quality === 'good' ? (
              <Check size={14} color={qualityColor} />
            ) : (
              <AlertCircle size={14} color={qualityColor} />
            )}
            <Text style={[styles.recommendationText, { color: qualityColor }]}>
              {recommendationVi}
            </Text>
          </View>
        </>
      )}
    </View>
  );
});

/**
 * Compact MPL badge for list items
 */
export const MPLBadge = memo(({ mpl }) => {
  if (!mpl) return null;

  const qualityColor = mpl.quality === 'excellent'
    ? COLORS.success
    : mpl.quality === 'good'
      ? COLORS.gold
      : COLORS.warning;

  return (
    <View style={[styles.badge, { backgroundColor: qualityColor + '20' }]}>
      <Target size={12} color={qualityColor} />
      <Text style={[styles.badgeText, { color: qualityColor }]}>
        MPL {mpl.penetrations}x
      </Text>
    </View>
  );
});

/**
 * MPL improvement card showing R:R enhancement
 */
export const MPLImprovementCard = memo(({ mpl, zone, targetPrice }) => {
  if (!mpl || !zone || !targetPrice) return null;

  const originalEntry = zone.entryPrice;
  const mplEntry = mpl.mplPrice;
  const stopPrice = zone.stopPrice;

  const originalRisk = Math.abs(originalEntry - stopPrice);
  const mplRisk = Math.abs(mplEntry - stopPrice);

  const originalReward = Math.abs(targetPrice - originalEntry);
  const mplReward = Math.abs(targetPrice - mplEntry);

  const originalRR = originalRisk > 0 ? (originalReward / originalRisk) : 0;
  const mplRR = mplRisk > 0 ? (mplReward / mplRisk) : 0;

  const rrIncrease = mplRR - originalRR;
  const isImprovement = rrIncrease > 0;

  return (
    <View style={styles.improvementCard}>
      <Text style={styles.improvementTitle}>R:R với MPL</Text>

      <View style={styles.rrComparison}>
        {/* Original R:R */}
        <View style={styles.rrItem}>
          <Text style={styles.rrLabel}>Zone Entry</Text>
          <Text style={styles.rrValue}>{originalRR.toFixed(2)}</Text>
          <Text style={styles.rrSubtext}>R:R</Text>
        </View>

        {/* Arrow */}
        <View style={styles.rrArrow}>
          <ArrowRight size={20} color={isImprovement ? COLORS.success : COLORS.error} />
        </View>

        {/* MPL R:R */}
        <View style={styles.rrItem}>
          <Text style={styles.rrLabel}>MPL Entry</Text>
          <Text style={[styles.rrValue, { color: isImprovement ? COLORS.success : COLORS.error }]}>
            {mplRR.toFixed(2)}
          </Text>
          <Text style={styles.rrSubtext}>R:R</Text>
        </View>
      </View>

      {/* Improvement indicator */}
      <View style={[
        styles.improvementIndicator,
        { backgroundColor: isImprovement ? COLORS.success + '15' : COLORS.error + '15' },
      ]}>
        {isImprovement ? (
          <TrendingUp size={14} color={COLORS.success} />
        ) : (
          <TrendingDown size={14} color={COLORS.error} />
        )}
        <Text style={[
          styles.improvementText,
          { color: isImprovement ? COLORS.success : COLORS.error },
        ]}>
          {isImprovement ? '+' : ''}{rrIncrease.toFixed(2)} R:R
        </Text>
      </View>
    </View>
  );
});

/**
 * MPL penetration levels visualization
 */
export const MPLLevelsChart = memo(({ mpl }) => {
  if (!mpl?.allLevels) return null;

  const maxPenetrations = Math.max(...mpl.allLevels.map(l => l.penetrations));

  return (
    <View style={styles.levelsChart}>
      <Text style={styles.levelsTitle}>Penetration Levels</Text>

      {mpl.allLevels.slice(0, 5).map((level, index) => {
        const isMPL = level.price === mpl.mplPrice;
        const barWidth = maxPenetrations > 0
          ? (level.penetrations / maxPenetrations * 100)
          : 0;

        return (
          <View key={index} style={styles.levelRow}>
            <Text style={[styles.levelPrice, isMPL && styles.mplPrice]}>
              {level.price.toFixed(4)}
            </Text>
            <View style={styles.levelBarContainer}>
              <View style={[
                styles.levelBar,
                { width: `${barWidth}%` },
                isMPL && styles.mplBar,
              ]} />
            </View>
            <Text style={[styles.levelCount, isMPL && styles.mplCount]}>
              {level.penetrations}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },

  // Empty state
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  qualityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  qualityText: {
    fontSize: 10,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Comparison
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },

  // Recommendation
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendationText: {
    fontSize: 12,
    flex: 1,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Improvement card
  improvementCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  improvementTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  rrComparison: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rrItem: {
    flex: 1,
    alignItems: 'center',
  },
  rrLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  rrValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rrSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  rrArrow: {
    paddingHorizontal: SPACING.md,
  },
  improvementIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  improvementText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Levels chart
  levelsChart: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  levelsTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  levelPrice: {
    width: 70,
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  mplPrice: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  levelBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 4,
    marginHorizontal: SPACING.xs,
  },
  levelBar: {
    height: '100%',
    backgroundColor: COLORS.textMuted,
    borderRadius: 4,
  },
  mplBar: {
    backgroundColor: COLORS.gold,
  },
  levelCount: {
    width: 20,
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  mplCount: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});

MPLIndicator.displayName = 'MPLIndicator';
MPLBadge.displayName = 'MPLBadge';
MPLImprovementCard.displayName = 'MPLImprovementCard';
MPLLevelsChart.displayName = 'MPLLevelsChart';

export default MPLIndicator;
