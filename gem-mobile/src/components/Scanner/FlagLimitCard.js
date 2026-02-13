/**
 * GEM Mobile - Flag Limit Card Component
 * Display Flag Limit pattern with zone visualization
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Flag,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { ZONE_HIERARCHY } from '../../constants/zoneHierarchyConfig';
import ZoneHierarchyBadge from './ZoneHierarchyBadge';

const FlagLimitCard = memo(({
  pattern,
  onPress,
  onInfoPress,
  showDetails = true,
  compact = false,
  style,
}) => {
  if (!pattern || !pattern.isFlagLimit) return null;

  const isBullish = pattern.tradingBias === 'BUY' || pattern.zoneType === 'LFZ';
  const config = ZONE_HIERARCHY.FLAG_LIMIT;

  const TrendIcon = isBullish ? TrendingUp : TrendingDown;
  const trendColor = isBullish ? '#22C55E' : '#EF4444';

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View style={[styles.compactIcon, { backgroundColor: config.colorLight }]}>
            <Flag size={14} color={config.color} />
          </View>
          <View>
            <Text style={styles.compactTitle}>Flag Limit</Text>
            <Text style={[styles.compactBias, { color: trendColor }]}>
              {isBullish ? 'BULLISH' : 'BEARISH'}
            </Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactCandles}>
            {pattern.baseCandleCount} nến
          </Text>
          <ArrowRight size={14} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: config.colorLight }]}>
            <Flag size={20} color={config.color} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Flag Limit</Text>
              <ZoneHierarchyBadge
                hierarchy="FLAG_LIMIT"
                size="small"
                showStars={true}
                showLabel={false}
              />
            </View>
            <View style={styles.subtitleRow}>
              <TrendIcon size={14} color={trendColor} />
              <Text style={[styles.subtitle, { color: trendColor }]}>
                {isBullish ? 'Bullish' : 'Bearish'} Continuation
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
          <Info size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {showDetails && (
        <>
          {/* Zone Info */}
          <View style={styles.zoneSection}>
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneSectionTitle}>Zone Boundaries</Text>
              <View style={styles.candlesBadge}>
                <Clock size={12} color={COLORS.textSecondary} />
                <Text style={styles.candlesText}>
                  {pattern.baseCandleCount} candle base
                </Text>
              </View>
            </View>

            <View style={styles.zoneGrid}>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneLabel}>Entry</Text>
                <Text style={[styles.zoneValue, { color: trendColor }]}>
                  {formatPrice(pattern.entryPrice)}
                </Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneLabel}>Stop</Text>
                <Text style={styles.zoneValue}>
                  {formatPrice(pattern.stopPrice)}
                </Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneLabel}>Width</Text>
                <Text style={styles.zoneValue}>
                  {pattern.zoneWidthPercent}%
                </Text>
              </View>
            </View>
          </View>

          {/* FL Specific Info */}
          <View style={styles.flSection}>
            <Text style={styles.zoneSectionTitle}>Flag Limit Levels</Text>
            <View style={styles.flGrid}>
              <View style={styles.flItem}>
                <View style={[styles.flLine, { backgroundColor: config.color }]} />
                <View>
                  <Text style={styles.flLabel}>Upper FL</Text>
                  <Text style={styles.flValue}>
                    {formatPrice(pattern.upperFlagLimit)}
                  </Text>
                </View>
              </View>
              <View style={styles.flItem}>
                <View style={[styles.flLine, { backgroundColor: COLORS.border }]} />
                <View>
                  <Text style={styles.flLabel}>Lower FL</Text>
                  <Text style={styles.flValue}>
                    {formatPrice(pattern.lowerFlagLimit)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Movement Info */}
          <View style={styles.movementSection}>
            <View style={styles.movementItem}>
              <Text style={styles.movementLabel}>Move Before</Text>
              <Text style={[styles.movementValue, { color: trendColor }]}>
                {isBullish ? '+' : '-'}
                {pattern.upMoveBeforePause || pattern.downMoveBeforePause}%
              </Text>
            </View>
            <View style={styles.movementDivider} />
            <View style={styles.movementItem}>
              <Text style={styles.movementLabel}>Continuation</Text>
              <Text style={[styles.movementValue, { color: trendColor }]}>
                +{pattern.continuationAfterPause}%
              </Text>
            </View>
            <View style={styles.movementDivider} />
            <View style={styles.movementItem}>
              <Text style={styles.movementLabel}>Confidence</Text>
              <Text style={styles.movementValue}>
                {pattern.confidence?.toFixed(0) || 75}%
              </Text>
            </View>
          </View>

          {/* Tip */}
          <View style={[styles.tipContainer, { borderLeftColor: config.color }]}>
            <Text style={styles.tipText}>
              FL = Continuation pattern. Entry at {isBullish ? 'lower' : 'upper'} FL,
              Stop vượt {isBullish ? 'lower' : 'upper'} FL.
              Target: FL tiếp theo trong trend.
            </Text>
          </View>
        </>
      )}

      {/* Action */}
      {onPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: config.colorLight }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: config.color }]}>
            Xem Chi Tiết
          </Text>
          <ArrowRight size={16} color={config.color} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  infoButton: {
    padding: 8,
    margin: -8,
  },

  // Zone section
  zoneSection: {
    gap: SPACING.sm,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  candlesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  candlesText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  zoneGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneItem: {
    alignItems: 'center',
    gap: 4,
  },
  zoneLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  zoneValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // FL section
  flSection: {
    gap: SPACING.sm,
  },
  flGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  flLine: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  flLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  flValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Movement section
  movementSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  movementItem: {
    alignItems: 'center',
    gap: 2,
  },
  movementLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  movementValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  movementDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },

  // Tip
  tipContainer: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Action
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  compactBias: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactCandles: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});

FlagLimitCard.displayName = 'FlagLimitCard';

export default FlagLimitCard;
