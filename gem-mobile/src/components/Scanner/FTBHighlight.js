/**
 * GEM Mobile - FTB (First Time Back) Highlight Component
 * Display FTB status with visual indicators
 *
 * Phase 2B: FTB Tracking UI
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Star,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

// ═══════════════════════════════════════════════════════════
// FTB BADGE (Compact)
// ═══════════════════════════════════════════════════════════

export const FTBBadge = memo(({ ftbStatus, size = 'medium' }) => {
  if (!ftbStatus) return null;

  const { isFirstTimeBack, testCount, ftbQuality } = ftbStatus;
  const color = getFTBColor(ftbQuality);
  const stars = ftbStatus.stars || (isFirstTimeBack ? 5 : 4 - testCount);

  const sizeConfig = {
    small: { iconSize: 10, fontSize: 9, padding: 4, starSize: 8 },
    medium: { iconSize: 12, fontSize: 10, padding: 6, starSize: 10 },
    large: { iconSize: 14, fontSize: 12, padding: 8, starSize: 12 },
  };
  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', padding: config.padding }]}>
      {isFirstTimeBack ? (
        <Sparkles size={config.iconSize} color={color} />
      ) : (
        <Clock size={config.iconSize} color={color} />
      )}
      <Text style={[styles.badgeText, { color, fontSize: config.fontSize }]}>
        {isFirstTimeBack ? 'FTB' : `T${testCount}`}
      </Text>
      <View style={styles.starRow}>
        {[...Array(Math.min(stars, 5))].map((_, i) => (
          <Star key={i} size={config.starSize} color={color} fill={color} />
        ))}
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// FTB STATUS CARD
// ═══════════════════════════════════════════════════════════

const FTBHighlight = memo(({
  zone,
  ftbStatus,
  onPress,
  showDetails = true,
  style,
}) => {
  if (!ftbStatus) return null;

  const {
    isFirstTimeBack,
    isFTB,
    testCount,
    priceStatus,
    ftbQuality,
    recommendation,
    tradingAdvice,
    correctApproach,
  } = ftbStatus;

  const color = getFTBColor(ftbQuality);
  const TrendIcon = zone?.tradingBias === 'BUY' ? TrendingUp : TrendingDown;
  const trendColor = zone?.tradingBias === 'BUY' ? COLORS.success : COLORS.error;

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  return (
    <View style={[styles.container, { borderColor: color }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            {isFirstTimeBack ? (
              <Sparkles size={18} color={COLORS.bgDarkest} />
            ) : (
              <Clock size={18} color={COLORS.bgDarkest} />
            )}
          </View>
          <View>
            <Text style={styles.title}>
              {isFirstTimeBack ? 'First Time Back' : `Tested ${testCount}x`}
            </Text>
            <Text style={[styles.quality, { color }]}>
              {ftbQuality?.charAt(0).toUpperCase() + ftbQuality?.slice(1) || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Stars */}
        <View style={styles.starsContainer}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              color={i < (ftbStatus.stars || 5) ? color : COLORS.textMuted}
              fill={i < (ftbStatus.stars || 5) ? color : 'transparent'}
            />
          ))}
        </View>
      </View>

      {showDetails && (
        <>
          {/* Price Status */}
          <View style={styles.priceStatusContainer}>
            <View style={styles.priceStatusRow}>
              <Text style={styles.priceLabel}>Distance to Zone</Text>
              <Text style={[styles.priceValue, { color }]}>
                {priceStatus?.distancePercent || '0.00'}%
              </Text>
            </View>

            <View style={styles.statusBadges}>
              {priceStatus?.isInZone && (
                <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
                  <Target size={12} color={COLORS.success} />
                  <Text style={[styles.statusBadgeText, { color: COLORS.success }]}>
                    Trong Zone
                  </Text>
                </View>
              )}
              {priceStatus?.isApproaching && !priceStatus?.isInZone && (
                <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
                  <ArrowRight size={12} color={COLORS.warning} />
                  <Text style={[styles.statusBadgeText, { color: COLORS.warning }]}>
                    Đang tiến đến
                  </Text>
                </View>
              )}
              {correctApproach && (
                <View style={[styles.statusBadge, { backgroundColor: trendColor + '20' }]}>
                  <TrendIcon size={12} color={trendColor} />
                  <Text style={[styles.statusBadgeText, { color: trendColor }]}>
                    Đúng hướng
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Recommendation */}
          <View style={[styles.recommendationContainer, { backgroundColor: color + '10' }]}>
            <Text style={[styles.recommendationText, { color }]}>
              {recommendation}
            </Text>
          </View>

          {/* Trading Advice */}
          <View style={styles.adviceContainer}>
            {isFirstTimeBack ? (
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
            ) : testCount <= 2 ? (
              <AlertTriangle size={14} color={COLORS.warning} />
            ) : (
              <AlertTriangle size={14} color={COLORS.error} />
            )}
            <Text style={styles.adviceText}>{tradingAdvice}</Text>
          </View>

          {/* Orders Remaining Indicator */}
          <View style={styles.ordersContainer}>
            <Text style={styles.ordersLabel}>Estimated Orders Remaining</Text>
            <View style={styles.ordersBar}>
              <View
                style={[
                  styles.ordersFill,
                  {
                    width: `${getOrdersRemaining(testCount)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.ordersPercent, { color }]}>
              ~{getOrdersRemaining(testCount)}%
            </Text>
          </View>
        </>
      )}

      {/* Action Button */}
      {onPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: color }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>
            {isFirstTimeBack ? 'Trade FTB Now' : 'Xem Chi Tiết'}
          </Text>
          <ArrowRight size={16} color={COLORS.bgDarkest} />
        </TouchableOpacity>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// FTB FRESHNESS TIER DISPLAY
// ═══════════════════════════════════════════════════════════

export const FreshnessTierDisplay = memo(({ testCount, style }) => {
  const tier = getFreshnessTier(testCount);

  return (
    <View style={[styles.tierContainer, { borderColor: tier.color }, style]}>
      <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
      <Text style={[styles.tierLabel, { color: tier.color }]}>
        {tier.label}
      </Text>
      <Text style={styles.tierOrders}>
        ~{tier.ordersRemaining}% orders
      </Text>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// FTB OPPORTUNITY CARD
// ═══════════════════════════════════════════════════════════

export const FTBOpportunityCard = memo(({ opportunity, onPress }) => {
  if (!opportunity?.ftbStatus) return null;

  const { ftbStatus } = opportunity;
  const color = getFTBColor(ftbStatus.ftbQuality);
  const isBullish = opportunity.zoneType === 'LFZ' || opportunity.tradingBias === 'BUY';

  return (
    <TouchableOpacity
      style={[styles.opportunityCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.opportunityHeader}>
        <Text style={styles.opportunitySymbol}>{opportunity.symbol}</Text>
        <FTBBadge ftbStatus={ftbStatus} size="small" />
      </View>

      <View style={styles.opportunityInfo}>
        <View style={styles.opportunityRow}>
          <Text style={styles.opportunityLabel}>Entry</Text>
          <Text style={[styles.opportunityValue, { color: isBullish ? COLORS.success : COLORS.error }]}>
            {opportunity.entryPrice?.toFixed?.(2) || '-'}
          </Text>
        </View>
        <View style={styles.opportunityRow}>
          <Text style={styles.opportunityLabel}>Distance</Text>
          <Text style={styles.opportunityValue}>
            {ftbStatus.priceStatus?.distancePercent || 0}%
          </Text>
        </View>
      </View>

      <Text style={[styles.opportunityRec, { color }]}>
        {ftbStatus.recommendation}
      </Text>
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// FTB SUMMARY CARD
// ═══════════════════════════════════════════════════════════

export const FTBSummaryCard = memo(({ summary, style }) => {
  if (!summary) return null;

  return (
    <View style={[styles.summaryCard, style]}>
      <View style={styles.summaryHeader}>
        <Sparkles size={18} color={COLORS.gold} />
        <Text style={styles.summaryTitle}>FTB Summary</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.gold }]}>
            {summary.ftb || 0}
          </Text>
          <Text style={styles.summaryLabel}>FTB</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {summary.testedOnce || 0}
          </Text>
          <Text style={styles.summaryLabel}>1x Test</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            {summary.testedTwice || 0}
          </Text>
          <Text style={styles.summaryLabel}>2x Test</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>
            {summary.stale || 0}
          </Text>
          <Text style={styles.summaryLabel}>Stale</Text>
        </View>
      </View>

      <View style={styles.summaryFooter}>
        <Text style={styles.ftbPercent}>
          FTB Rate: <Text style={{ color: COLORS.gold }}>{summary.ftbPercent || 0}%</Text>
        </Text>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const getFTBColor = (quality) => {
  switch (quality) {
    case 'perfect':
      return COLORS.gold;
    case 'excellent':
      return COLORS.gold;
    case 'good':
      return COLORS.success;
    case 'tested':
      return COLORS.warning;
    default:
      return COLORS.textSecondary;
  }
};

const getOrdersRemaining = (testCount) => {
  if (testCount === 0) return 100;
  if (testCount === 1) return 70;
  if (testCount === 2) return 50;
  return 30;
};

const getFreshnessTier = (testCount) => {
  if (testCount === 0) {
    return {
      tier: 'virgin',
      label: 'First Time Back',
      color: COLORS.gold,
      ordersRemaining: 100,
    };
  }
  if (testCount === 1) {
    return {
      tier: 'fresh',
      label: 'Tested Once',
      color: COLORS.success,
      ordersRemaining: 70,
    };
  }
  if (testCount === 2) {
    return {
      tier: 'used',
      label: 'Tested Twice',
      color: COLORS.warning,
      ordersRemaining: 50,
    };
  }
  return {
    tier: 'stale',
    label: 'Multiple Tests',
    color: COLORS.error,
    ordersRemaining: 30,
  };
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontWeight: '700',
  },
  starRow: {
    flexDirection: 'row',
    gap: 1,
  },

  // Container
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quality: {
    fontSize: 12,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },

  // Price status
  priceStatusContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  priceStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Recommendation
  recommendationContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Advice
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
  },
  adviceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  // Orders bar
  ordersContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  ordersLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  ordersBar: {
    height: 6,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ordersFill: {
    height: '100%',
    borderRadius: 3,
  },
  ordersPercent: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
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

  // Tier display
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierOrders: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // Opportunity card
  opportunityCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opportunitySymbol: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  opportunityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  opportunityRow: {
    alignItems: 'center',
  },
  opportunityLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  opportunityValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  opportunityRec: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },

  // Summary card
  summaryCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  summaryTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  summaryFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBg,
    alignItems: 'center',
  },
  ftbPercent: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

FTBHighlight.displayName = 'FTBHighlight';
FTBBadge.displayName = 'FTBBadge';
FreshnessTierDisplay.displayName = 'FreshnessTierDisplay';
FTBOpportunityCard.displayName = 'FTBOpportunityCard';
FTBSummaryCard.displayName = 'FTBSummaryCard';

export default FTBHighlight;
