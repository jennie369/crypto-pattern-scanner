/**
 * GEM Mobile - Inducement Warning Component
 * Display inducement/stop hunt detection warning
 *
 * Phase 2C: Compression + Inducement + Look Right
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Clock,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

// ═══════════════════════════════════════════════════════════
// INDUCEMENT BADGE (COMPACT)
// ═══════════════════════════════════════════════════════════

export const InducementBadge = memo(({ inducement, onPress }) => {
  if (!inducement?.hasInducement) return null;

  const { inducementType, quality, reversalConfirmed } = inducement;
  const isBullish = inducementType === 'bullish_inducement';
  const color = isBullish ? COLORS.success : COLORS.error;

  return (
    <TouchableOpacity
      style={[styles.badge, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AlertTriangle size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        {isBullish ? 'Bull' : 'Bear'} Inducement
      </Text>
      {reversalConfirmed && (
        <Check size={12} color={COLORS.success} />
      )}
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const InducementWarning = memo(({
  inducement,
  onInfoPress,
  showDetails = true,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!inducement?.hasInducement) {
    return null;
  }

  const {
    inducementType,
    sweepPercent,
    wickPercent,
    bodyPercent,
    hasReversal,
    reversalConfirmed,
    implication,
    recommendation,
    quality,
    inducementCandle,
    inducementPrice,
  } = inducement;

  const isBullish = inducementType === 'bullish_inducement';
  const mainColor = isBullish ? COLORS.success : COLORS.error;
  const TrendIcon = isBullish ? TrendingUp : TrendingDown;

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  return (
    <View style={[styles.container, { borderLeftColor: mainColor }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: mainColor + '20' }]}>
            <AlertTriangle size={18} color={mainColor} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                {isBullish ? 'Bullish Inducement' : 'Bearish Inducement'}
              </Text>
            </View>
            <Text style={styles.subtitle}>Stop Hunt Detected</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TrendIcon size={20} color={mainColor} />
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

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Sweep</Text>
          <Text style={[styles.metricValue, { color: mainColor }]}>
            {sweepPercent}%
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Wick</Text>
          <Text style={styles.metricValue}>{wickPercent}%</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Quality</Text>
          <Text style={[styles.metricValue, { color: quality === 'excellent' ? COLORS.gold : COLORS.textPrimary }]}>
            {quality}
          </Text>
        </View>
      </View>

      {/* Reversal Status */}
      <View style={[
        styles.reversalStatus,
        { backgroundColor: hasReversal ? COLORS.success + '10' : COLORS.warning + '10' }
      ]}>
        {reversalConfirmed ? (
          <View style={styles.reversalRow}>
            <Check size={14} color={COLORS.success} />
            <Text style={[styles.reversalText, { color: COLORS.success }]}>
              Reversal Confirmed - Entry opportunity!
            </Text>
          </View>
        ) : hasReversal ? (
          <View style={styles.reversalRow}>
            <Zap size={14} color={COLORS.success} />
            <Text style={[styles.reversalText, { color: COLORS.success }]}>
              Reversal forming - Monitor closely
            </Text>
          </View>
        ) : (
          <View style={styles.reversalRow}>
            <Clock size={14} color={COLORS.warning} />
            <Text style={[styles.reversalText, { color: COLORS.warning }]}>
              Waiting for reversal confirmation
            </Text>
          </View>
        )}
      </View>

      {/* Implication */}
      {showDetails && (
        <Text style={styles.implication}>{implication}</Text>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContainer}>
          {/* Inducement Price */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inducement Price</Text>
            <Text style={[styles.detailValue, { color: mainColor }]}>
              {formatPrice(inducementPrice)}
            </Text>
          </View>

          {/* Candle Details */}
          {inducementCandle && (
            <View style={styles.candleDetails}>
              <Text style={styles.candleTitle}>Inducement Candle</Text>
              <View style={styles.candleGrid}>
                <View style={styles.candleItem}>
                  <Text style={styles.candleLabel}>High</Text>
                  <Text style={styles.candleValue}>{formatPrice(inducementCandle.high)}</Text>
                </View>
                <View style={styles.candleItem}>
                  <Text style={styles.candleLabel}>Low</Text>
                  <Text style={styles.candleValue}>{formatPrice(inducementCandle.low)}</Text>
                </View>
                <View style={styles.candleItem}>
                  <Text style={styles.candleLabel}>Open</Text>
                  <Text style={styles.candleValue}>{formatPrice(inducementCandle.open)}</Text>
                </View>
                <View style={styles.candleItem}>
                  <Text style={styles.candleLabel}>Close</Text>
                  <Text style={styles.candleValue}>{formatPrice(inducementCandle.close)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Tip */}
          <View style={[styles.tipContainer, { borderLeftColor: mainColor }]}>
            <Text style={styles.tipText}>
              {isBullish
                ? 'Bullish inducement = Stops swept below → Smart Money mua vào. Tìm điểm BUY.'
                : 'Bearish inducement = Stops swept above → Smart Money bán ra. Tìm điểm SELL.'}
            </Text>
          </View>
        </View>
      )}

      {/* Recommendation */}
      <View style={[styles.recommendationBox, { backgroundColor: mainColor + '10' }]}>
        <Target size={14} color={mainColor} />
        <Text style={[styles.recommendationText, { color: mainColor }]}>
          {recommendation}
        </Text>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// COMPACT CARD VERSION
// ═══════════════════════════════════════════════════════════

export const InducementCard = memo(({ inducement, onPress }) => {
  if (!inducement?.hasInducement) return null;

  const { inducementType, quality, reversalConfirmed, sweepPercent } = inducement;
  const isBullish = inducementType === 'bullish_inducement';
  const color = isBullish ? COLORS.success : COLORS.error;
  const TrendIcon = isBullish ? TrendingUp : TrendingDown;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <AlertTriangle size={20} color={color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {isBullish ? 'Bull' : 'Bear'} Inducement
          </Text>
          <View style={styles.cardBadges}>
            {reversalConfirmed && (
              <View style={[styles.miniConfirmed, { backgroundColor: COLORS.success }]}>
                <Check size={10} color={COLORS.bgDarkest} />
              </View>
            )}
            <TrendIcon size={16} color={color} />
          </View>
        </View>
        <Text style={styles.cardSubtext}>
          Sweep {sweepPercent}% • {quality}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// LIQUIDITY POOL DISPLAY
// ═══════════════════════════════════════════════════════════

export const LiquidityPoolsDisplay = memo(({ pools, currentPrice }) => {
  if (!pools || pools.allPools?.length === 0) return null;

  const { buyStopPools, sellStopPools } = pools;

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  return (
    <View style={styles.poolsContainer}>
      <Text style={styles.poolsTitle}>Liquidity Pools</Text>

      {/* Buy Stops (Above) */}
      {buyStopPools?.slice(0, 3).map((pool, i) => (
        <View key={`buy-${i}`} style={styles.poolRow}>
          <View style={[styles.poolIndicator, { backgroundColor: COLORS.success }]} />
          <Text style={styles.poolLabel}>Buy Stops</Text>
          <Text style={styles.poolPrice}>{formatPrice(pool.level)}</Text>
          <Text style={[styles.poolStrength, { color: COLORS.success }]}>
            {pool.strength}
          </Text>
        </View>
      ))}

      {/* Current Price */}
      {currentPrice && (
        <View style={styles.currentPriceRow}>
          <Text style={styles.currentPriceLabel}>Current</Text>
          <Text style={styles.currentPriceValue}>{formatPrice(currentPrice)}</Text>
        </View>
      )}

      {/* Sell Stops (Below) */}
      {sellStopPools?.slice(0, 3).map((pool, i) => (
        <View key={`sell-${i}`} style={styles.poolRow}>
          <View style={[styles.poolIndicator, { backgroundColor: COLORS.error }]} />
          <Text style={styles.poolLabel}>Sell Stops</Text>
          <Text style={styles.poolPrice}>{formatPrice(pool.level)}</Text>
          <Text style={[styles.poolStrength, { color: COLORS.error }]}>
            {pool.strength}
          </Text>
        </View>
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

  // Metrics
  metricsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },

  // Reversal Status
  reversalStatus: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  reversalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  reversalText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Implication
  implication: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 16,
  },

  // Expanded
  expandedContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  candleDetails: {
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  candleTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  candleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  candleItem: {
    alignItems: 'center',
  },
  candleLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  candleValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  tipContainer: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Recommendation
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniConfirmed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Liquidity Pools
  poolsContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  poolsTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  poolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  poolIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  poolLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  poolPrice: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  poolStrength: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  currentPriceLabel: {
    fontSize: 10,
    color: COLORS.gold,
  },
  currentPriceValue: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '700',
  },
});

InducementWarning.displayName = 'InducementWarning';
InducementBadge.displayName = 'InducementBadge';
InducementCard.displayName = 'InducementCard';
LiquidityPoolsDisplay.displayName = 'LiquidityPoolsDisplay';

export default InducementWarning;
