/**
 * GEM Mobile - Decision Point Card Component
 * Display Decision Point pattern - origin of major move
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
  Crown,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowRight,
  Info,
  Zap,
  Target,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import { ZONE_HIERARCHY } from '../../constants/zoneHierarchyConfig';
import ZoneHierarchyBadge from './ZoneHierarchyBadge';

const DecisionPointCard = memo(({
  pattern,
  onPress,
  onInfoPress,
  showDetails = true,
  compact = false,
  style,
}) => {
  if (!pattern || !pattern.isDecisionPoint) return null;

  const isBullish = pattern.tradingBias === 'BUY' || pattern.zoneType === 'LFZ';
  const config = ZONE_HIERARCHY.DECISION_POINT;

  const TrendIcon = isBullish ? TrendingUp : TrendingDown;
  const trendColor = isBullish ? '#22C55E' : '#EF4444';

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderLeftColor: config.color }, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View style={[styles.compactIcon, { backgroundColor: config.color }]}>
            <Crown size={14} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.compactTitle}>Decision Point</Text>
            <Text style={[styles.compactBias, { color: trendColor }]}>
              {isBullish ? 'BULLISH' : 'BEARISH'} | {pattern.dpMovePercent}% move
            </Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <View style={styles.starBadge}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={8} color={config.color} fill={config.color} />
            ))}
          </View>
          <ArrowRight size={14} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { borderTopColor: config.color }, style]}>
      {/* Premium badge */}
      <View style={[styles.premiumBanner, { backgroundColor: config.color }]}>
        <Crown size={14} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.premiumText}>STRONGEST ZONE</Text>
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} color="#FFFFFF" fill="#FFFFFF" />
          ))}
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: config.colorLight }]}>
            <Crown size={24} color={config.color} fill={config.color} />
          </View>
          <View>
            <Text style={styles.title}>Decision Point</Text>
            <View style={styles.subtitleRow}>
              <TrendIcon size={14} color={trendColor} />
              <Text style={[styles.subtitle, { color: trendColor }]}>
                {isBullish ? 'Bullish' : 'Bearish'} Origin
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
          {/* Move Info - Highlighted */}
          <View style={[styles.moveSection, { backgroundColor: config.colorLight }]}>
            <View style={styles.moveHeader}>
              <Zap size={16} color={config.color} />
              <Text style={[styles.moveTitle, { color: config.color }]}>
                Impulsive Move
              </Text>
            </View>
            <View style={styles.moveGrid}>
              <View style={styles.moveItem}>
                <Text style={styles.moveLabel}>Move Size</Text>
                <Text style={[styles.moveValue, { color: config.color }]}>
                  {formatPrice(pattern.dpMoveSize)}
                </Text>
              </View>
              <View style={styles.moveItem}>
                <Text style={styles.moveLabel}>Move %</Text>
                <Text style={[styles.moveValue, { color: config.color }]}>
                  {pattern.dpMovePercent}%
                </Text>
              </View>
              <View style={styles.moveItem}>
                <Text style={styles.moveLabel}>Multiple</Text>
                <Text style={[styles.moveValue, { color: config.color }]}>
                  {pattern.dpMoveMultiple}x
                </Text>
              </View>
            </View>
          </View>

          {/* Zone Info */}
          <View style={styles.zoneSection}>
            <Text style={styles.sectionTitle}>Origin Zone</Text>
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
              <View style={styles.zoneItem}>
                <Text style={styles.zoneLabel}>Candles</Text>
                <Text style={styles.zoneValue}>
                  {pattern.originCandleCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Structure Info */}
          <View style={styles.structureSection}>
            <Text style={styles.sectionTitle}>Structure</Text>
            <View style={styles.structureRow}>
              <View style={styles.structureItem}>
                <Target size={14} color={COLORS.textSecondary} />
                <Text style={styles.structureLabel}>Move Start</Text>
                <Text style={styles.structureValue}>
                  {formatPrice(pattern.structure?.moveStart)}
                </Text>
              </View>
              <View style={styles.structureArrow}>
                <ArrowRight size={16} color={trendColor} />
              </View>
              <View style={styles.structureItem}>
                <Zap size={14} color={trendColor} />
                <Text style={styles.structureLabel}>Move End</Text>
                <Text style={[styles.structureValue, { color: trendColor }]}>
                  {formatPrice(pattern.structure?.moveEnd)}
                </Text>
              </View>
            </View>
          </View>

          {/* Confidence */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.sectionTitle}>Confidence</Text>
              <Text style={[styles.confidenceValue, { color: config.color }]}>
                {pattern.confidence?.toFixed(0) || 85}%
              </Text>
            </View>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${pattern.confidence || 85}%`,
                    backgroundColor: config.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Tip */}
          <View style={[styles.tipContainer, { borderLeftColor: config.color }]}>
            <Text style={styles.tipText}>
              DP = Nơi Smart Money ra quyết định. Zone này có xác suất thành công
              cao nhất. Entry {isBullish ? 'tại đỉnh' : 'tại đáy'} zone, Stop{' '}
              {isBullish ? 'dưới đáy' : 'trên đỉnh'} zone + buffer.
            </Text>
          </View>
        </>
      )}

      {/* Action */}
      {onPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: config.color }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>Trade This DP</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderTopWidth: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Premium banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoButton: {
    padding: 8,
    margin: -8,
  },

  // Move section
  moveSection: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  moveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  moveTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  moveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moveItem: {
    alignItems: 'center',
    gap: 4,
  },
  moveLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  moveValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Zone section
  zoneSection: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 10,
  },
  zoneValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Structure section
  structureSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  structureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  structureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  structureLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  structureValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  structureArrow: {
    paddingHorizontal: SPACING.sm,
  },

  // Confidence
  confidenceSection: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Tip
  tipContainer: {
    borderLeftWidth: 3,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
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
    margin: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    borderLeftWidth: 3,
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
    gap: SPACING.sm,
  },
  starBadge: {
    flexDirection: 'row',
    gap: 1,
  },
});

DecisionPointCard.displayName = 'DecisionPointCard';

export default DecisionPointCard;
