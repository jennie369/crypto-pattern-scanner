/**
 * GEM Mobile - Quasimodo Pattern Card
 * Displays QM pattern with structure and key levels
 *
 * Phase 1B: Quasimodo Display Component
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Repeat,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const QMPatternCard = memo(({
  qmPattern,
  onPress,
  showDetails = true,
  compact = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      borderLeftWidth: 4,
      padding: SPACING.md,
      marginVertical: SPACING.xs,
    },
    compactContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 8,
      borderLeftWidth: 3,
      padding: SPACING.sm,
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    compactIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactContent: {
      flex: 1,
    },
    compactTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    compactSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      fontFamily: 'monospace',
    },
    compactRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    starsRowCompact: {
      flexDirection: 'row',
    },
    starSmall: {
      fontSize: 8,
    },
    bosConfirmedCompact: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    patternName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: 2,
    },
    star: {
      fontSize: 10,
    },
    winRate: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
    },
    biasBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    biasText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    bosContainer: {
      marginBottom: SPACING.sm,
    },
    bosConfirmed: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.success + '15',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    bosText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.success,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    bosPrice: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.success,
      fontFamily: 'monospace',
    },
    bosPending: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.warning + '15',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    bosTextPending: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.warning,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      marginBottom: SPACING.xs,
    },
    structureContainer: {
      marginBottom: SPACING.md,
    },
    structureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    structurePoint: {
      alignItems: 'center',
      flex: 1,
    },
    headPoint: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: 8,
    },
    structureLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    structurePrice: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
      fontFamily: 'monospace',
    },
    structureArrow: {
      paddingHorizontal: SPACING.xs,
    },
    arrow: {
      color: colors.textMuted,
      fontSize: 12,
    },

    levelsContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 8,
      padding: SPACING.sm,
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    levelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    levelRowLast: {
      marginTop: SPACING.xs,
      paddingTop: SPACING.xs,
      borderTopWidth: 1,
      borderTopColor: colors.textMuted + '20',
    },
    levelLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    levelText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    levelTextSmall: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    levelTextMuted: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    levelPrice: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
      fontFamily: 'monospace',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    levelPriceSmall: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: 'monospace',
    },
    levelPriceMuted: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      fontFamily: 'monospace',
    },

    rrContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    rrLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    rrBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    rrText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    distanceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.textMuted + '20',
    },
    distanceLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    distanceValue: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    currentPriceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.xs,
    },
    currentPriceLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    currentPriceValue: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
      fontFamily: 'monospace',
    },

    viewDetailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: SPACING.sm,
    },
    viewDetailText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!qmPattern) {
    return null;
  }

  const {
    pattern,
    config,
    qmlPrice,
    mplPrice,
    entryPrice,
    stopLossPrice,
    targetPrice,
    leftShoulder,
    head,
    rightShoulder,
    bos,
    qmlToMPLPercent,
    distanceToQMLPercent,
    tradingBias,
    zoneType,
    riskReward,
    currentPrice,
  } = qmPattern;

  const isBearish = pattern === 'QUASIMODO_BEARISH';
  const mainColor = isBearish ? colors.error : colors.success;
  const TrendIcon = isBearish ? TrendingDown : TrendingUp;

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '—';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  // Compact mode for list items
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { borderLeftColor: mainColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactRow}>
          <View style={[styles.compactIcon, { backgroundColor: mainColor + '20' }]}>
            <Repeat size={14} color={mainColor} />
          </View>
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle}>
              {config?.name || 'Quasimodo'}
            </Text>
            <Text style={styles.compactSubtitle}>
              QML: {formatPrice(qmlPrice)}
            </Text>
          </View>
          <View style={styles.compactRight}>
            <View style={styles.starsRowCompact}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.starSmall}>⭐</Text>
              ))}
            </View>
            {bos?.confirmed && (
              <View style={styles.bosConfirmedCompact}>
                <CheckCircle size={10} color={colors.success} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: mainColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: mainColor + '20' }]}>
            <Repeat size={20} color={mainColor} />
          </View>
          <View>
            <Text style={styles.patternName}>
              {config?.fullName || 'Quasimodo'}
            </Text>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Text key={i} style={styles.star}>⭐</Text>
              ))}
              <Text style={styles.winRate}>
                {Math.round((config?.winRate || 0.75) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.biasBadge, { backgroundColor: mainColor + '20' }]}>
          <TrendIcon size={12} color={mainColor} />
          <Text style={[styles.biasText, { color: mainColor }]}>{tradingBias}</Text>
        </View>
      </View>

      {/* BOS Confirmation */}
      <View style={styles.bosContainer}>
        {bos?.confirmed ? (
          <View style={styles.bosConfirmed}>
            <CheckCircle size={14} color={colors.success} />
            <Text style={styles.bosText}>BOS Xác nhận</Text>
            <Text style={styles.bosPrice}>@ {formatPrice(bos.price)}</Text>
          </View>
        ) : (
          <View style={styles.bosPending}>
            <AlertTriangle size={14} color={colors.warning} />
            <Text style={styles.bosTextPending}>Chờ BOS xác nhận</Text>
          </View>
        )}
      </View>

      {showDetails && (
        <>
          {/* Structure Visualization */}
          <View style={styles.structureContainer}>
            <Text style={styles.sectionTitle}>Cấu Trúc Pattern</Text>
            <View style={styles.structureRow}>
              <View style={styles.structurePoint}>
                <Text style={styles.structureLabel}>LS</Text>
                <Text style={styles.structurePrice}>
                  {formatPrice(leftShoulder?.price)}
                </Text>
              </View>
              <View style={styles.structureArrow}>
                <Text style={styles.arrow}>→</Text>
              </View>
              <View style={[styles.structurePoint, styles.headPoint]}>
                <Text style={[styles.structureLabel, { color: mainColor }]}>HEAD</Text>
                <Text style={[styles.structurePrice, { color: mainColor }]}>
                  {formatPrice(head?.price)}
                </Text>
              </View>
              <View style={styles.structureArrow}>
                <Text style={styles.arrow}>→</Text>
              </View>
              <View style={styles.structurePoint}>
                <Text style={styles.structureLabel}>RS</Text>
                <Text style={styles.structurePrice}>
                  {rightShoulder ? formatPrice(rightShoulder.price) : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Key Levels */}
          <View style={styles.levelsContainer}>
            {/* QML - Entry */}
            <View style={styles.levelRow}>
              <View style={styles.levelLabel}>
                <Target size={16} color={colors.gold} />
                <Text style={styles.levelText}>QML (Entry)</Text>
              </View>
              <Text style={[styles.levelPrice, { color: colors.gold }]}>
                {formatPrice(qmlPrice)}
              </Text>
            </View>

            {/* MPL - Stop Reference */}
            <View style={styles.levelRow}>
              <View style={styles.levelLabel}>
                <Shield size={16} color={colors.error} />
                <Text style={styles.levelText}>MPL (Stop Ref)</Text>
              </View>
              <Text style={styles.levelPrice}>{formatPrice(mplPrice)}</Text>
            </View>

            {/* Stop Loss */}
            <View style={styles.levelRow}>
              <View style={styles.levelLabel}>
                <View style={{ width: 16 }} />
                <Text style={styles.levelTextSmall}>Stop Loss</Text>
              </View>
              <Text style={[styles.levelPriceSmall, { color: colors.error }]}>
                {formatPrice(stopLossPrice)}
              </Text>
            </View>

            {/* Target */}
            {targetPrice && (
              <View style={styles.levelRow}>
                <View style={styles.levelLabel}>
                  <View style={{ width: 16 }} />
                  <Text style={styles.levelTextSmall}>Target (1:2)</Text>
                </View>
                <Text style={[styles.levelPriceSmall, { color: colors.success }]}>
                  {formatPrice(targetPrice)}
                </Text>
              </View>
            )}

            {/* QML to MPL Distance */}
            <View style={[styles.levelRow, styles.levelRowLast]}>
              <Text style={styles.levelTextMuted}>QML → MPL</Text>
              <Text style={styles.levelPriceMuted}>{qmlToMPLPercent}%</Text>
            </View>
          </View>

          {/* Risk Reward */}
          {riskReward && (
            <View style={styles.rrContainer}>
              <Text style={styles.rrLabel}>Risk:Reward</Text>
              <View style={[
                styles.rrBadge,
                { backgroundColor: riskReward.isAcceptable ? colors.success + '20' : colors.warning + '20' }
              ]}>
                <Text style={[
                  styles.rrText,
                  { color: riskReward.isAcceptable ? colors.success : colors.warning }
                ]}>
                  {riskReward.ratioDisplay}
                </Text>
              </View>
            </View>
          )}

          {/* Distance to Entry */}
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>Khoảng cách đến QML:</Text>
            <Text style={[
              styles.distanceValue,
              {
                color: Math.abs(parseFloat(distanceToQMLPercent)) < 1
                  ? colors.warning
                  : colors.textSecondary
              }
            ]}>
              {distanceToQMLPercent}%
            </Text>
          </View>

          {/* Current Price */}
          <View style={styles.currentPriceContainer}>
            <Text style={styles.currentPriceLabel}>Giá hiện tại:</Text>
            <Text style={styles.currentPriceValue}>{formatPrice(currentPrice)}</Text>
          </View>
        </>
      )}

      {/* View Detail Arrow */}
      {onPress && (
        <View style={styles.viewDetailContainer}>
          <Text style={styles.viewDetailText}>Xem chi tiết</Text>
          <ChevronRight size={16} color={colors.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
});

QMPatternCard.displayName = 'QMPatternCard';

export default QMPatternCard;
