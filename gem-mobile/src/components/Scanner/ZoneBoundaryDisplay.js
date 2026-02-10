/**
 * GEM Mobile - Zone Boundary Display
 * Visual display of zone boundaries (entry + stop)
 *
 * GEM Method Zone Rules:
 * - HFZ: Entry = LOW (near), Stop = HIGH (far)
 * - LFZ: Entry = HIGH (near), Stop = LOW (far)
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Target, Shield, Info, AlertTriangle, Check } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const ZoneBoundaryDisplay = memo(({
  zone,
  currentPrice,
  showRiskReward = true,
  showDistance = true,
  compact = false,
  onInfoPress,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      borderWidth: 1,
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
      gap: SPACING.xs,
    },
    compactLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    compactPrice: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      fontFamily: 'monospace',
      flex: 1,
    },
    compactWidth: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    zoneType: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    zoneBias: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
    },
    widthBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: 8,
    },
    widthBadgeText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    boundariesContainer: {
      gap: SPACING.sm,
    },
    boundaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    boundaryLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    labelText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
    },
    labelTextSmall: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    priceText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: 'monospace',
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    priceTextSmall: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: 'monospace',
    },
    entryPrice: {
      color: colors.gold,
    },
    stopPrice: {
      color: colors.textPrimary,
    },
    zoneBarContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xs,
    },
    zoneBar: {
      width: '80%',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    zoneBarFill: {
      height: '100%',
      opacity: 0.6,
    },
    zoneWidthText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      marginTop: SPACING.xxs,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      backgroundColor: colors.warning + '15',
      borderRadius: 8,
      flexWrap: 'wrap',
    },
    warningText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.warning,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    suggestionText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textMuted,
      width: '100%',
      marginTop: SPACING.xxs,
    },
    rrContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.textMuted + '20',
      flexWrap: 'wrap',
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
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    rrCheckContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rrWarning: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.error,
      fontStyle: 'italic',
    },
    distanceContainer: {
      marginTop: SPACING.sm,
      alignItems: 'center',
    },
    distanceText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      padding: SPACING.md,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!zone) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không có dữ liệu zone</Text>
      </View>
    );
  }

  const {
    zoneType,
    entryPrice,
    stopPrice,
    stopLossPrice,
    zoneWidth,
    zoneWidthPercent,
    riskReward,
    distanceToZone,
    zoneValidation,
  } = zone;

  const isHFZ = zoneType === 'HFZ';
  const zoneColor = isHFZ ? colors.error : colors.success;
  const ZoneIcon = isHFZ ? TrendingDown : TrendingUp;

  // Format price based on magnitude
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '—';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toFixed(8);
  };

  // Compact mode for list items
  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderLeftColor: zoneColor }]}>
        <View style={styles.compactRow}>
          <ZoneIcon size={14} color={zoneColor} />
          <Text style={[styles.compactLabel, { color: zoneColor }]}>{zoneType}</Text>
          <Text style={styles.compactPrice}>
            {formatPrice(entryPrice)} - {formatPrice(stopPrice)}
          </Text>
          {zoneWidthPercent && (
            <Text style={styles.compactWidth}>({zoneWidthPercent}%)</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: zoneColor + '40' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: zoneColor + '20' }]}>
            <ZoneIcon size={18} color={zoneColor} />
          </View>
          <View>
            <Text style={[styles.zoneType, { color: zoneColor }]}>
              {isHFZ ? 'Vùng Cung (HFZ)' : 'Vùng Cầu (LFZ)'}
            </Text>
            <Text style={styles.zoneBias}>
              Xu hướng: {isHFZ ? 'SELL' : 'BUY'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {zoneWidthPercent && (
            <View style={[styles.widthBadge, { backgroundColor: zoneColor + '20' }]}>
              <Text style={[styles.widthBadgeText, { color: zoneColor }]}>
                {zoneWidthPercent}%
              </Text>
            </View>
          )}
          {onInfoPress && (
            <TouchableOpacity
              onPress={onInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Zone Boundaries */}
      <View style={styles.boundariesContainer}>
        {/* Entry Price */}
        <View style={styles.boundaryRow}>
          <View style={styles.boundaryLabel}>
            <Target size={16} color={colors.gold} />
            <Text style={styles.labelText}>Giá Entry</Text>
          </View>
          <Text style={[styles.priceText, styles.entryPrice]}>
            {formatPrice(entryPrice)}
          </Text>
        </View>

        {/* Visual Zone Bar */}
        <View style={styles.zoneBarContainer}>
          <View style={[styles.zoneBar, { backgroundColor: zoneColor + '20' }]}>
            <View
              style={[
                styles.zoneBarFill,
                {
                  backgroundColor: zoneColor,
                  width: '100%',
                },
              ]}
            />
          </View>
          <Text style={styles.zoneWidthText}>
            Zone: {formatPrice(zoneWidth)}
          </Text>
        </View>

        {/* Stop Price */}
        <View style={styles.boundaryRow}>
          <View style={styles.boundaryLabel}>
            <Shield size={16} color={colors.textSecondary} />
            <Text style={styles.labelText}>Giá Stop</Text>
          </View>
          <Text style={[styles.priceText, styles.stopPrice]}>
            {formatPrice(stopPrice)}
          </Text>
        </View>

        {/* Stop Loss with buffer */}
        {stopLossPrice && (
          <View style={styles.boundaryRow}>
            <View style={styles.boundaryLabel}>
              <View style={{ width: 16 }} />
              <Text style={styles.labelTextSmall}>SL (có buffer)</Text>
            </View>
            <Text style={[styles.priceTextSmall, { color: colors.error }]}>
              {formatPrice(stopLossPrice)}
            </Text>
          </View>
        )}
      </View>

      {/* Zone Validation Warning */}
      {zoneValidation && !zoneValidation.isValid && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={14} color={colors.warning} />
          <Text style={styles.warningText}>{zoneValidation.reason}</Text>
          {zoneValidation.suggestion && (
            <Text style={styles.suggestionText}>{zoneValidation.suggestion}</Text>
          )}
        </View>
      )}

      {zoneValidation?.isExtended && (
        <View style={styles.warningContainer}>
          <AlertTriangle size={14} color={colors.warning} />
          <Text style={styles.warningText}>{zoneValidation.reason}</Text>
          {zoneValidation.suggestion && (
            <Text style={styles.suggestionText}>{zoneValidation.suggestion}</Text>
          )}
        </View>
      )}

      {/* Risk/Reward */}
      {showRiskReward && riskReward && (
        <View style={styles.rrContainer}>
          <Text style={styles.rrLabel}>Risk:Reward</Text>
          <View
            style={[
              styles.rrBadge,
              {
                backgroundColor: riskReward.isGood
                  ? colors.success + '20'
                  : riskReward.isAcceptable
                    ? colors.warning + '20'
                    : colors.error + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.rrText,
                {
                  color: riskReward.isGood
                    ? colors.success
                    : riskReward.isAcceptable
                      ? colors.warning
                      : colors.error,
                },
              ]}
            >
              {riskReward.ratioDisplay}
            </Text>
          </View>
          {riskReward.isGood && (
            <View style={styles.rrCheckContainer}>
              <Check size={14} color={colors.success} />
            </View>
          )}
          {!riskReward.isAcceptable && (
            <Text style={styles.rrWarning}>Cần tối thiểu 1:2</Text>
          )}
        </View>
      )}

      {/* Distance to Zone */}
      {showDistance && distanceToZone && (
        <View style={styles.distanceContainer}>
          {distanceToZone.isInZone ? (
            <Text style={[styles.distanceText, { color: colors.gold }]}>
              Giá đang TRONG zone
            </Text>
          ) : distanceToZone.isApproaching ? (
            <Text style={[styles.distanceText, { color: colors.warning }]}>
              Giá đang tiến gần ({distanceToZone.percent}%)
            </Text>
          ) : (
            <Text style={styles.distanceText}>
              Cách zone: {distanceToZone.percent}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

ZoneBoundaryDisplay.displayName = 'ZoneBoundaryDisplay';

export default ZoneBoundaryDisplay;
