/**
 * GEM Mobile - Price Lines Overlay
 * Issue #15: Entry/SL/TP lines on chart
 * Renders price level indicators as overlay on TradingView chart
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Target, Shield, Crosshair } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPrice } from '../../utils/formatters';

/**
 * Price Lines Overlay Component
 * Displays Entry, Stop Loss, and Take Profit lines on chart
 */
const PriceLines = ({
  pattern,
  chartHeight = 350,
  priceRange, // { min, max }
  showLabels = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
    },

    lineContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    line: {
      flex: 1,
      height: 2,
    },

    entryLine: {
      backgroundColor: '#3B82F6',
    },

    slLine: {
      backgroundColor: '#EF4444',
    },

    tpLine: {
      backgroundColor: '#22C55E',
    },

    labelContainer: {
      position: 'absolute',
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      gap: 4,
    },

    entryLabelContainer: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },

    slLabelContainer: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },

    tpLabelContainer: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },

    label: {
      fontSize: 10,
      fontWeight: '600',
    },

    entryLabel: {
      color: '#3B82F6',
    },

    slLabel: {
      color: '#EF4444',
    },

    tpLabel: {
      color: '#22C55E',
    },

    directionBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },

    longBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },

    shortBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },

    directionText: {
      fontSize: 12,
      fontWeight: '700',
    },

    longText: {
      color: '#22C55E',
    },

    shortText: {
      color: '#EF4444',
    },

    rrBadge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },

    rrLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },

    rrValue: {
      fontSize: 12,
      fontWeight: '700',
      color: '#22C55E',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!pattern || !priceRange) return null;

  const { entry, stopLoss, direction } = pattern;
  // FIXED: Support ALL takeProfit field names: target, takeProfit1, takeProfit, targets[]
  const takeProfit = pattern.target || pattern.takeProfit1 || pattern.takeProfit || pattern.targets?.[0];
  const { min, max } = priceRange;

  // Calculate Y position from price
  const priceToY = (price) => {
    if (max === min) return chartHeight / 2;
    const percentage = (price - min) / (max - min);
    return chartHeight * (1 - percentage); // Invert because Y starts from top
  };

  // Calculate if prices are within visible range
  const isInRange = (price) => price >= min && price <= max;

  // Get line positions
  const entryY = priceToY(entry);
  const slY = priceToY(stopLoss);
  const tpY = priceToY(takeProfit);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Entry Line */}
      {isInRange(entry) && (
        <View style={[styles.lineContainer, { top: entryY }]}>
          <View style={[styles.line, styles.entryLine]} />
          {showLabels && (
            <View style={[styles.labelContainer, styles.entryLabelContainer]}>
              <Crosshair size={10} color="#3B82F6" />
              <Text style={[styles.label, styles.entryLabel]}>
                ENTRY ${formatPrice(entry)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Stop Loss Line */}
      {isInRange(stopLoss) && (
        <View style={[styles.lineContainer, { top: slY }]}>
          <View style={[styles.line, styles.slLine]} />
          {showLabels && (
            <View style={[styles.labelContainer, styles.slLabelContainer]}>
              <Shield size={10} color="#EF4444" />
              <Text style={[styles.label, styles.slLabel]}>
                SL ${formatPrice(stopLoss)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Take Profit Line */}
      {isInRange(takeProfit) && (
        <View style={[styles.lineContainer, { top: tpY }]}>
          <View style={[styles.line, styles.tpLine]} />
          {showLabels && (
            <View style={[styles.labelContainer, styles.tpLabelContainer]}>
              <Target size={10} color="#22C55E" />
              <Text style={[styles.label, styles.tpLabel]}>
                TP ${formatPrice(takeProfit)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Direction Badge - Top Left */}
      <View style={[
        styles.directionBadge,
        direction === 'LONG' ? styles.longBadge : styles.shortBadge,
      ]}>
        {direction === 'LONG' ? (
          <TrendingUp size={14} color="#22C55E" />
        ) : (
          <TrendingDown size={14} color="#EF4444" />
        )}
        <Text style={[
          styles.directionText,
          direction === 'LONG' ? styles.longText : styles.shortText,
        ]}>
          {direction}
        </Text>
      </View>

      {/* Risk/Reward Info - Bottom Right */}
      <View style={styles.rrBadge}>
        <Text style={styles.rrLabel}>R:R</Text>
        <Text style={styles.rrValue}>
          1:{calculateRR(pattern).toFixed(2).replace('.', ',')}
        </Text>
      </View>
    </View>
  );
};

/**
 * Calculate Risk:Reward ratio
 */
const calculateRR = (pattern) => {
  const tp = pattern?.takeProfit1 || pattern?.takeProfit || pattern?.targets?.[0];
  if (!pattern?.entry || !pattern?.stopLoss || !tp) return 0;

  const { entry, stopLoss } = pattern;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(tp - entry);

  if (risk === 0) return 0;
  return reward / risk;
};

/**
 * Compact Price Lines - Shows as badges instead of lines
 * Use when overlay on chart is not possible
 */
export const PriceLevelsBadge = ({ pattern }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const badgeStyles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(0,0,0,0.4)'),
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
    },

    directionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: SPACING.sm,
    },

    longBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },

    shortBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },

    directionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    longText: {
      color: '#22C55E',
    },

    shortText: {
      color: '#EF4444',
    },

    pricesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    priceItem: {
      alignItems: 'center',
      gap: 2,
    },

    priceLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },

    priceValue: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    blueText: {
      color: '#3B82F6',
    },

    greenText: {
      color: '#22C55E',
    },

    redText: {
      color: '#EF4444',
    },

    yellowText: {
      color: '#FFD700',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!pattern) return null;

  const { entry, stopLoss, direction } = pattern;
  // FIXED: Support ALL takeProfit field names: target, takeProfit1, takeProfit, targets[]
  const takeProfit = pattern.target || pattern.takeProfit1 || pattern.takeProfit || pattern.targets?.[0];
  const rr = calculateRR(pattern);

  return (
    <View style={badgeStyles.container}>
      {/* Direction */}
      <View style={[
        badgeStyles.directionBadge,
        direction === 'LONG' ? badgeStyles.longBadge : badgeStyles.shortBadge,
      ]}>
        {direction === 'LONG' ? (
          <TrendingUp size={12} color="#22C55E" />
        ) : (
          <TrendingDown size={12} color="#EF4444" />
        )}
        <Text style={[
          badgeStyles.directionText,
          direction === 'LONG' ? badgeStyles.longText : badgeStyles.shortText,
        ]}>
          {direction}
        </Text>
      </View>

      {/* Price Levels */}
      <View style={badgeStyles.pricesRow}>
        <View style={badgeStyles.priceItem}>
          <Crosshair size={12} color="#3B82F6" />
          <Text style={badgeStyles.priceLabel}>Entry</Text>
          <Text style={[badgeStyles.priceValue, badgeStyles.blueText]}>
            ${formatPrice(entry)}
          </Text>
        </View>

        <View style={badgeStyles.priceItem}>
          <Target size={12} color="#22C55E" />
          <Text style={badgeStyles.priceLabel}>TP</Text>
          <Text style={[badgeStyles.priceValue, badgeStyles.greenText]}>
            ${formatPrice(takeProfit)}
          </Text>
        </View>

        <View style={badgeStyles.priceItem}>
          <Shield size={12} color="#EF4444" />
          <Text style={badgeStyles.priceLabel}>SL</Text>
          <Text style={[badgeStyles.priceValue, badgeStyles.redText]}>
            ${formatPrice(stopLoss)}
          </Text>
        </View>

        <View style={badgeStyles.priceItem}>
          <Text style={badgeStyles.priceLabel}>R:R</Text>
          <Text style={[
            badgeStyles.priceValue,
            rr >= 2 ? badgeStyles.greenText : badgeStyles.yellowText,
          ]}>
            1:{rr.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PriceLines;
