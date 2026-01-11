/**
 * GEM Mobile - Hidden FTR Panel Component
 * Display Hidden FTR zone refinement information
 *
 * Phase 2B: Hidden FTR UI
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Search,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

// ═══════════════════════════════════════════════════════════
// COMPACT BADGE
// ═══════════════════════════════════════════════════════════

export const HiddenFTRBadge = memo(({ hiddenFTR, onPress }) => {
  if (!hiddenFTR?.isHiddenFTR) return null;

  const quality = hiddenFTR.quality || 'good';
  const color = quality === 'excellent' ? COLORS.gold : COLORS.success;

  return (
    <TouchableOpacity
      style={[styles.badge, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Search size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        Hidden FTR {hiddenFTR.hiddenFTRTimeframe}
      </Text>
      <View style={[styles.reductionBadge, { backgroundColor: color }]}>
        <Text style={styles.reductionText}>
          -{hiddenFTR.refinement?.widthReduction}%
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN PANEL COMPONENT
// ═══════════════════════════════════════════════════════════

const HiddenFTRPanel = memo(({
  hiddenFTR,
  onUseRefinedEntry,
  onInfoPress,
  showDetails = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!hiddenFTR?.isHiddenFTR) return null;

  const {
    parentZone,
    hiddenFTRTimeframe,
    refinement,
    recommendation,
    quality,
    entryPrice,
    stopPrice,
    tradingBias,
  } = hiddenFTR;

  const qualityColor = quality === 'excellent' ? COLORS.gold : COLORS.success;
  const TrendIcon = tradingBias === 'BUY' ? TrendingUp : TrendingDown;
  const trendColor = tradingBias === 'BUY' ? COLORS.success : COLORS.error;

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  return (
    <View style={[styles.container, { borderLeftColor: qualityColor }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: qualityColor + '20' }]}>
            <Search size={18} color={qualityColor} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Hidden FTR</Text>
              <View style={[styles.tfBadge, { backgroundColor: qualityColor }]}>
                <Text style={styles.tfText}>{hiddenFTRTimeframe}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Refined from {parentZone?.timeframe} zone
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {onInfoPress && (
            <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
              <Info size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          {expanded ? (
            <ChevronUp size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={18} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Refinement Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Width Reduction</Text>
          <Text style={[styles.statValue, { color: qualityColor }]}>
            -{refinement?.widthReduction || 0}%
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>R:R Improvement</Text>
          <Text style={[styles.statValue, { color: qualityColor }]}>
            {refinement?.rrImprovement || '1x'}
          </Text>
        </View>
      </View>

      {/* Entry Comparison */}
      {showDetails && (
        <View style={styles.comparisonContainer}>
          {/* Original Zone */}
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Original ({parentZone?.timeframe})</Text>
            <View style={styles.comparisonValues}>
              <Text style={styles.priceLabel}>
                Entry: {formatPrice(parentZone?.entryPrice)}
              </Text>
              <Text style={styles.priceLabel}>
                Width: {formatPrice(refinement?.originalWidth)}
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <ArrowRight size={16} color={qualityColor} />
            <Text style={[styles.arrowLabel, { color: qualityColor }]}>Refined</Text>
          </View>

          {/* Refined Zone */}
          <View style={[styles.comparisonRow, styles.refinedRow, { borderColor: qualityColor }]}>
            <Text style={[styles.comparisonLabel, { color: qualityColor }]}>
              Hidden FTR ({hiddenFTRTimeframe})
            </Text>
            <View style={styles.comparisonValues}>
              <Text style={[styles.priceLabel, { color: trendColor }]}>
                Entry: {formatPrice(entryPrice)}
              </Text>
              <Text style={styles.priceLabel}>
                Width: {formatPrice(refinement?.refinedWidth)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Recommendation */}
      <View style={[styles.recommendationContainer, { backgroundColor: qualityColor + '10' }]}>
        <Zap size={14} color={qualityColor} />
        <Text style={[styles.recommendationText, { color: qualityColor }]}>
          {recommendation}
        </Text>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Zone Boundaries</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Entry</Text>
              <Text style={[styles.detailValue, { color: trendColor }]}>
                {formatPrice(entryPrice)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stop</Text>
              <Text style={styles.detailValue}>
                {formatPrice(stopPrice)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Width</Text>
              <Text style={styles.detailValue}>
                {formatPrice(refinement?.refinedWidth)}
              </Text>
            </View>
          </View>

          <View style={[styles.tipContainer, { borderLeftColor: qualityColor }]}>
            <Text style={styles.tipText}>
              Hidden FTR giúp giảm stop loss và tăng R:R.
              Entry tại {tradingBias === 'BUY' ? 'đỉnh' : 'đáy'} Hidden FTR zone.
            </Text>
          </View>
        </View>
      )}

      {/* Action Button */}
      {onUseRefinedEntry && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: qualityColor }]}
          onPress={() => onUseRefinedEntry(hiddenFTR)}
          activeOpacity={0.7}
        >
          <Target size={16} color={COLORS.bgDarkest} />
          <Text style={styles.actionText}>Dùng Entry Refined</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// NESTED ZONES LIST
// ═══════════════════════════════════════════════════════════

export const NestedZonesList = memo(({ nestedZones, onZonePress }) => {
  if (!nestedZones || nestedZones.length === 0) {
    return null;
  }

  return (
    <View style={styles.nestedContainer}>
      <Text style={styles.nestedTitle}>Nested Zones (Zone-in-Zone)</Text>
      {nestedZones.map((nested, index) => (
        <TouchableOpacity
          key={index}
          style={styles.nestedRow}
          onPress={() => onZonePress?.(nested)}
          activeOpacity={0.7}
        >
          <View style={styles.nestedInfo}>
            <Text style={styles.nestedParent}>
              {nested.parentZone?.timeframe} → {nested.childZone?.timeframe}
            </Text>
            <Text style={styles.nestedRefinement}>
              -{nested.refinementPercent}% refinement
            </Text>
          </View>
          <View style={[styles.strengthBadge, { backgroundColor: COLORS.gold + '20' }]}>
            <Text style={styles.strengthText}>
              +{nested.confluenceStrength}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reductionBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  reductionText: {
    fontSize: 9,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },

  // Container
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 3,
    padding: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tfBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  tfText: {
    fontSize: 9,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoButton: {
    padding: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.glassBg,
  },

  // Comparison
  comparisonContainer: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  comparisonRow: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  refinedRow: {
    borderWidth: 1,
  },
  comparisonLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  arrowLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Recommendation
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendationText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },

  // Details
  detailsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBg,
  },
  detailsTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tipContainer: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Action button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.bgDarkest,
    fontWeight: '600',
  },

  // Nested zones
  nestedContainer: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  nestedTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  nestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  nestedInfo: {
    flex: 1,
  },
  nestedParent: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  nestedRefinement: {
    fontSize: 10,
    color: COLORS.success,
  },
  strengthBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  strengthText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '600',
  },
});

HiddenFTRPanel.displayName = 'HiddenFTRPanel';
HiddenFTRBadge.displayName = 'HiddenFTRBadge';
NestedZonesList.displayName = 'NestedZonesList';

export default HiddenFTRPanel;
