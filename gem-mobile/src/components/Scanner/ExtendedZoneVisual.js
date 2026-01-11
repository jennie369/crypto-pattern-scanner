/**
 * GEM Mobile - Extended Zone Visual Component
 * Phase 3B: Display extended zone visualization with original vs extended boundaries
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Maximize2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

/**
 * Main ExtendedZoneVisual component
 */
const ExtendedZoneVisual = memo(({ zone, showDetails = true }) => {
  if (!zone?.isExtended) {
    return null;
  }

  const {
    originalStopPrice,
    stopPrice,
    entryPrice,
    zoneType,
    extension,
    extensionCount = 1,
  } = zone;

  const isHFZ = zoneType === 'HFZ';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Maximize2 size={16} color={COLORS.warning} />
        <Text style={styles.title}>Extended Zone</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>+{extensionCount}</Text>
        </View>
      </View>

      {showDetails && (
        <>
          {/* Visual representation */}
          <View style={styles.visualContainer}>
            {/* Original zone */}
            <View style={[styles.zoneBar, styles.originalZone]}>
              <Text style={styles.zoneLabel}>Original</Text>
              <View style={styles.priceRange}>
                <Text style={styles.priceText}>
                  {isHFZ ? originalStopPrice?.toFixed(4) : entryPrice?.toFixed(4)}
                </Text>
                <View style={styles.rangeLine} />
                <Text style={styles.priceText}>
                  {isHFZ ? entryPrice?.toFixed(4) : originalStopPrice?.toFixed(4)}
                </Text>
              </View>
            </View>

            {/* Extension arrow */}
            <View style={styles.extensionArrow}>
              {isHFZ ? (
                <ArrowUp size={20} color={COLORS.warning} />
              ) : (
                <ArrowDown size={20} color={COLORS.warning} />
              )}
            </View>

            {/* Extended zone */}
            <View style={[styles.zoneBar, styles.extendedZone]}>
              <Text style={styles.zoneLabel}>Extended</Text>
              <View style={styles.priceRange}>
                <Text style={[styles.priceText, styles.extendedPrice]}>
                  {isHFZ ? stopPrice?.toFixed(4) : entryPrice?.toFixed(4)}
                </Text>
                <View style={[styles.rangeLine, styles.extendedLine]} />
                <Text style={[styles.priceText, styles.extendedPrice]}>
                  {isHFZ ? entryPrice?.toFixed(4) : stopPrice?.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Extension</Text>
              <Text style={styles.statValue}>+{extension?.extensionPercent || '0'}%</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>New Width</Text>
              <Text style={styles.statValue}>{zone.zoneWidth?.toFixed(4)}</Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <AlertCircle size={14} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Stop loss di chuyển đến {stopPrice?.toFixed(4)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
});

/**
 * Compact extended zone badge
 */
export const ExtendedZoneBadge = memo(({ zone }) => {
  if (!zone?.isExtended) return null;

  const extensionPercent = zone.extension?.extensionPercent || '0';
  const isHigh = parseFloat(extensionPercent) > 50;

  return (
    <View style={[styles.badge, isHigh && styles.badgeHigh]}>
      <Maximize2 size={12} color={isHigh ? COLORS.error : COLORS.warning} />
      <Text style={[styles.badgeText, isHigh && styles.badgeTextHigh]}>
        +{extensionPercent}%
      </Text>
    </View>
  );
});

/**
 * Extension indicator for list items
 */
export const ExtensionIndicator = memo(({ isExtended, extensionCount = 0 }) => {
  if (!isExtended) return null;

  return (
    <View style={styles.indicator}>
      <Maximize2 size={10} color={COLORS.warning} />
      {extensionCount > 1 && (
        <Text style={styles.indicatorCount}>x{extensionCount}</Text>
      )}
    </View>
  );
});

/**
 * Extended zone comparison card
 */
export const ExtendedZoneCompare = memo(({ zone }) => {
  if (!zone?.isExtended) return null;

  const { originalStopPrice, stopPrice, entryPrice, zoneType, extension } = zone;
  const isHFZ = zoneType === 'HFZ';

  const originalWidth = extension?.originalWidth || 0;
  const newWidth = extension?.newWidth || zone.zoneWidth || 0;
  const riskIncrease = originalWidth > 0
    ? ((newWidth - originalWidth) / originalWidth * 100)
    : 0;

  return (
    <View style={styles.compareCard}>
      <Text style={styles.compareTitle}>Risk Comparison</Text>

      <View style={styles.compareRow}>
        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Original Risk</Text>
          <Text style={styles.compareValue}>{originalWidth.toFixed(4)}</Text>
          <Text style={styles.compareSubtext}>100% position</Text>
        </View>

        <View style={styles.compareDivider}>
          {isHFZ ? (
            <TrendingUp size={16} color={COLORS.warning} />
          ) : (
            <TrendingDown size={16} color={COLORS.warning} />
          )}
        </View>

        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Extended Risk</Text>
          <Text style={[styles.compareValue, { color: COLORS.warning }]}>
            {newWidth.toFixed(4)}
          </Text>
          <Text style={styles.compareSubtext}>
            {riskIncrease > 20
              ? `${(100 / (1 + riskIncrease / 100)).toFixed(0)}% position`
              : '100% position'}
          </Text>
        </View>
      </View>

      {riskIncrease > 20 && (
        <View style={styles.adjustmentNote}>
          <AlertCircle size={12} color={COLORS.warning} />
          <Text style={styles.adjustmentText}>
            Giảm position size để giữ risk cố định
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  countText: {
    fontSize: 10,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },

  // Visual representation
  visualContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  zoneBar: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  originalZone: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  extendedZone: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  zoneLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  priceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  extendedPrice: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  rangeLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  extendedLine: {
    backgroundColor: COLORS.warning,
  },
  extensionArrow: {
    alignItems: 'center',
    paddingVertical: SPACING.xxs,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning + '30',
  },
  warningText: {
    fontSize: 11,
    color: COLORS.warning,
    flex: 1,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeHigh: {
    backgroundColor: COLORS.error + '20',
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
  },
  badgeTextHigh: {
    color: COLORS.error,
  },

  // Indicator
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  indicatorCount: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '600',
  },

  // Compare card
  compareCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  compareTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareItem: {
    flex: 1,
    alignItems: 'center',
  },
  compareDivider: {
    paddingHorizontal: SPACING.md,
  },
  compareLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  compareValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  compareSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  adjustmentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  adjustmentText: {
    fontSize: 11,
    color: COLORS.warning,
    flex: 1,
  },
});

ExtendedZoneVisual.displayName = 'ExtendedZoneVisual';
ExtendedZoneBadge.displayName = 'ExtendedZoneBadge';
ExtensionIndicator.displayName = 'ExtensionIndicator';
ExtendedZoneCompare.displayName = 'ExtendedZoneCompare';

export default ExtendedZoneVisual;
