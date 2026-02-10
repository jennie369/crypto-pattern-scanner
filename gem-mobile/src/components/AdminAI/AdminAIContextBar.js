/**
 * GEM AI Trading Brain - Context Bar Component
 * Displays current trading context (symbol, timeframe, price, patterns)
 * Includes position selector for switching between open positions
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Layers, Activity, Briefcase, ChevronRight } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPrice } from '../../utils/formatters';

const AdminAIContextBar = ({
  symbol = 'BTCUSDT',
  timeframe = '4h',
  currentPrice,
  priceChange,
  patternCount = 0,
  zoneCount = 0,
  trend,
  // Position selector props
  positions = [],
  selectedPositionIndex = -1,
  onSelectPosition,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const isPositive = priceChange >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const hasPositions = positions.length > 0;

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    symbolSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    symbol: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: '700',
      color: colors.gold,
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
      color: colors.purple,
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
      color: colors.textPrimary,
    },
    priceLoading: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
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
      color: colors.success,
    },
    changeTextNegative: {
      color: colors.error,
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
      color: colors.textSecondary,
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
      color: colors.textPrimary,
    },

    // Position selector row
    positionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: SPACING.md,
      paddingRight: SPACING.xs,
      paddingBottom: SPACING.sm,
      gap: SPACING.xs,
    },
    positionLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    positionLabelText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.gold,
    },
    positionScrollContent: {
      gap: SPACING.xs,
      paddingRight: SPACING.md,
    },
    positionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    positionChipSelected: {
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      borderColor: 'rgba(255, 189, 89, 0.4)',
    },
    positionChipLong: {
      backgroundColor: 'rgba(58, 247, 166, 0.12)',
      borderColor: 'rgba(58, 247, 166, 0.3)',
    },
    positionChipShort: {
      backgroundColor: 'rgba(255, 107, 107, 0.12)',
      borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    positionChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
    },
    positionChipTextSelected: {
      color: colors.textPrimary,
    },
    positionChipSymbol: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    positionChipDirection: {
      width: 14,
      height: 14,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    directionLong: {
      backgroundColor: 'rgba(58, 247, 166, 0.25)',
    },
    directionShort: {
      backgroundColor: 'rgba(255, 107, 107, 0.25)',
    },
    positionChipDirectionText: {
      fontSize: 8,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    positionChipPnl: {
      fontSize: 9,
      fontWeight: '700',
    },
    pnlPositive: {
      color: colors.success,
    },
    pnlNegative: {
      color: colors.error,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.wrapper}>
      {/* Main context row */}
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
                  <TrendIcon size={10} color={isPositive ? colors.success : colors.error} />
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
              <Activity size={12} color={colors.purple} />
              <Text style={styles.statText}>{patternCount}</Text>
            </View>
          )}
          {zoneCount > 0 && (
            <View style={styles.statBadge}>
              <Layers size={12} color={colors.cyan} />
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

      {/* Position selector row */}
      {hasPositions && (
        <View style={styles.positionRow}>
          <View style={styles.positionLabel}>
            <Briefcase size={12} color={colors.gold} />
            <Text style={styles.positionLabelText}>{positions.length}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.positionScrollContent}
          >
            {/* "All" chip */}
            <TouchableOpacity
              style={[
                styles.positionChip,
                selectedPositionIndex === -1 && styles.positionChipSelected,
              ]}
              onPress={() => onSelectPosition?.(-1)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.positionChipText,
                selectedPositionIndex === -1 && styles.positionChipTextSelected,
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {/* Individual position chips */}
            {positions.map((pos, index) => {
              const isSelected = selectedPositionIndex === index;
              const isLong = (pos.side || pos.direction) === 'LONG';
              const pnlAmount = pos.pnlAmount || 0;
              const isProfit = pnlAmount >= 0;

              return (
                <TouchableOpacity
                  key={pos.symbol + index}
                  style={[
                    styles.positionChip,
                    isSelected && styles.positionChipSelected,
                    isSelected && isLong && styles.positionChipLong,
                    isSelected && !isLong && styles.positionChipShort,
                  ]}
                  onPress={() => onSelectPosition?.(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.positionChipSymbol,
                    isSelected && styles.positionChipTextSelected,
                  ]}>
                    {pos.symbol?.replace('USDT', '')}
                  </Text>
                  <View style={[
                    styles.positionChipDirection,
                    isLong ? styles.directionLong : styles.directionShort,
                  ]}>
                    <Text style={styles.positionChipDirectionText}>
                      {isLong ? 'L' : 'S'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.positionChipPnl,
                    isProfit ? styles.pnlPositive : styles.pnlNegative,
                  ]}>
                    {isProfit ? '+' : ''}{pnlAmount.toFixed(2)}$
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AdminAIContextBar;
