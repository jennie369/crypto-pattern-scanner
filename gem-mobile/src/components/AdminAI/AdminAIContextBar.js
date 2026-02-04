/**
 * GEM AI Trading Brain - Context Bar Component
 * Displays current trading context (symbol, timeframe, price, patterns)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Layers, Activity } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { formatPrice } from '../../utils/formatters';

const AdminAIContextBar = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  currentPrice,
  priceChange,
  patternCount = 0,
  zoneCount = 0,
  trend,
}) => {
  const isPositive = priceChange >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <View style={styles.container}>
      {/* Symbol & Timeframe */}
      <View style={styles.symbolSection}>
        <Text style={styles.symbol}>{symbol.replace('USDT', '')}</Text>
        <View style={styles.timeframeBadge}>
          <Text style={styles.timeframeText}>{timeframe}</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceSection}>
        {currentPrice ? (
          <>
            <Text style={styles.price}>${formatPrice(currentPrice)}</Text>
            {priceChange !== null && priceChange !== undefined && (
              <View style={[styles.changeBadge, isPositive ? styles.changeBadgePositive : styles.changeBadgeNegative]}>
                <TrendIcon size={10} color={isPositive ? COLORS.success : COLORS.error} />
                <Text style={[styles.changeText, isPositive ? styles.changeTextPositive : styles.changeTextNegative]}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.priceLoading}>Loading...</Text>
        )}
      </View>

      {/* Pattern & Zone Count */}
      <View style={styles.statsSection}>
        {patternCount > 0 && (
          <View style={styles.statBadge}>
            <Activity size={12} color={COLORS.purple} />
            <Text style={styles.statText}>{patternCount}</Text>
          </View>
        )}
        {zoneCount > 0 && (
          <View style={styles.statBadge}>
            <Layers size={12} color={COLORS.cyan} />
            <Text style={styles.statText}>{zoneCount}</Text>
          </View>
        )}
      </View>

      {/* Trend indicator */}
      {trend && (
        <View style={[
          styles.trendBadge,
          trend === 'uptrend' && styles.trendBadgeUp,
          trend === 'downtrend' && styles.trendBadgeDown,
          trend === 'sideways' && styles.trendBadgeSideways,
        ]}>
          <Text style={styles.trendText}>
            {trend === 'uptrend' ? '↑' : trend === 'downtrend' ? '↓' : '→'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  symbolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  symbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  timeframeBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeframeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.purple,
  },
  priceSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  priceLoading: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeBadgePositive: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
  },
  changeBadgeNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  changeTextPositive: {
    color: COLORS.success,
  },
  changeTextNegative: {
    color: COLORS.error,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  trendBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  trendBadgeUp: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
  },
  trendBadgeDown: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  trendBadgeSideways: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default AdminAIContextBar;
