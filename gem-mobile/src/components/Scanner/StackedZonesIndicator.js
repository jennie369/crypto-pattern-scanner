/**
 * GEM Mobile - Stacked Zones Indicator Component
 * Display stacked zones confluence with expandable details
 *
 * Phase 2B: Stacked Zones UI
 */

import React, { memo, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Crown,
  Flag,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

const getQualityColor = (quality, colors) => {
  switch (quality) {
    case 'exceptional':
      return colors.gold;
    case 'excellent':
      return colors.success;
    case 'good':
      return colors.info;
    default:
      return colors.textSecondary;
  }
};

const getHierarchyShortName = (hierarchy) => {
  const h = hierarchy?.toUpperCase?.() || hierarchy;
  switch (h) {
    case 'DECISION_POINT':
      return 'DP';
    case 'FTR':
      return 'FTR';
    case 'FLAG_LIMIT':
      return 'FL';
    default:
      return '';
  }
};

// ═══════════════════════════════════════════════════════════
// COMPACT VERSION
// ═══════════════════════════════════════════════════════════

const StackedZonesCompact = memo(({ stackedZone, onPress }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 8,
      borderWidth: 1,
      padding: SPACING.sm,
    },
    compactText: {
      fontSize: 12,
      fontWeight: '600',
    },
    scoreBadge: {
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    scoreText: {
      fontSize: 10,
      color: colors.bgDarkest,
      fontWeight: '700',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const { stackedCount, confluenceScore, quality } = stackedZone;
  const qualityColor = getQualityColor(quality, colors);

  return (
    <TouchableOpacity
      style={[styles.compactContainer, { borderColor: qualityColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Layers size={14} color={qualityColor} />
      <Text style={[styles.compactText, { color: qualityColor }]}>
        {stackedCount} Zones
      </Text>
      <View style={[styles.scoreBadge, { backgroundColor: qualityColor }]}>
        <Text style={styles.scoreText}>{confluenceScore}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const StackedZonesIndicator = memo(({
  stackedZone,
  onPress,
  compact = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [showDetails, setShowDetails] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    // Main container
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      borderWidth: 2,
      padding: SPACING.md,
      marginVertical: SPACING.xs,
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    qualityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 8,
    },
    qualityText: {
      fontSize: 10,
      color: colors.bgDarkest,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    // Score
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    scoreLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    scoreValue: {
      fontSize: 20,
      fontWeight: '700',
    },

    // Direction
    directionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.xs,
    },
    directionText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Timeframes
    timeframesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
    },
    timeframeBadge: {
      backgroundColor: colors.bgDarkest,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 8,
    },
    timeframeText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },

    // Recommendation
    recommendationContainer: {
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      borderRadius: 8,
    },
    recommendationText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },

    // Details
    detailsContainer: {
      marginTop: SPACING.md,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    detailsTitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: SPACING.xs,
    },
    zoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    zoneDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    zoneTimeframe: {
      fontSize: 11,
      color: colors.textPrimary,
      fontWeight: '600',
      width: 35,
    },
    zoneType: {
      fontSize: 11,
      color: colors.textSecondary,
      width: 30,
    },
    zonePattern: {
      fontSize: 11,
      color: colors.textMuted,
      flex: 1,
    },
    hierarchyBadge: {
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    hierarchyText: {
      fontSize: 9,
      color: colors.gold,
      fontWeight: '600',
    },

    // Action button
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
    },
    actionText: {
      fontSize: 13,
      color: colors.bgDarkest,
      fontWeight: '600',
    },

    // Empty state
    emptyContainer: {
      alignItems: 'center',
      padding: SPACING.xl,
      gap: SPACING.sm,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    emptySubtext: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },

    // List
    listContainer: {
      gap: SPACING.sm,
    },

    // Summary card
    summaryCard: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.gold + '30',
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    summaryTitle: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: SPACING.sm,
    },
    summaryItem: {
      alignItems: 'center',
      gap: 2,
    },
    summaryValue: {
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    summaryLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
    avgConfluence: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    avgLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    avgValue: {
      fontSize: 14,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!stackedZone?.isStacked) {
    return null;
  }

  const {
    stackedCount,
    confluenceScore,
    zones,
    timeframes,
    quality,
    recommendation,
    zoneType,
    tradingBias,
  } = stackedZone;

  const qualityColor = getQualityColor(quality, colors);
  const TrendIcon = tradingBias === 'BUY' ? TrendingUp : TrendingDown;
  const trendColor = tradingBias === 'BUY' ? colors.success : colors.error;

  if (compact) {
    return <StackedZonesCompact stackedZone={stackedZone} onPress={onPress} />;
  }

  return (
    <View style={[styles.container, { borderColor: qualityColor }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowDetails(!showDetails)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: qualityColor + '20' }]}>
            <Layers size={20} color={qualityColor} />
          </View>
          <View>
            <Text style={styles.title}>Stacked Zones</Text>
            <Text style={styles.subtitle}>
              {stackedCount} zones chồng lên nhau
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.qualityBadge, { backgroundColor: qualityColor }]}>
            <Star size={12} color={colors.bgDarkest} fill={colors.bgDarkest} />
            <Text style={styles.qualityText}>{quality}</Text>
          </View>
          {showDetails ? (
            <ChevronUp size={20} color={colors.textMuted} />
          ) : (
            <ChevronDown size={20} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Confluence Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Confluence Score</Text>
        <Text style={[styles.scoreValue, { color: qualityColor }]}>
          {confluenceScore}
        </Text>
      </View>

      {/* Direction */}
      <View style={styles.directionRow}>
        <TrendIcon size={16} color={trendColor} />
        <Text style={[styles.directionText, { color: trendColor }]}>
          {tradingBias} ({zoneType})
        </Text>
      </View>

      {/* Timeframes */}
      <View style={styles.timeframesContainer}>
        {(timeframes || []).map((tf, index) => (
          <View key={tf} style={styles.timeframeBadge}>
            <Text style={styles.timeframeText}>{tf}</Text>
          </View>
        ))}
      </View>

      {/* Recommendation */}
      <View style={[styles.recommendationContainer, { backgroundColor: qualityColor + '15' }]}>
        <Text style={[styles.recommendationText, { color: qualityColor }]}>
          {recommendation}
        </Text>
      </View>

      {/* Details Expansion */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Component Zones</Text>
          {(zones || []).map((zone, index) => (
            <View key={index} style={styles.zoneRow}>
              <View
                style={[
                  styles.zoneDot,
                  { backgroundColor: zone.zoneType === 'HFZ' ? colors.error : colors.success },
                ]}
              />
              <Text style={styles.zoneTimeframe}>{zone.timeframe || 'N/A'}</Text>
              <Text style={styles.zoneType}>{zone.zoneType || 'Zone'}</Text>
              <Text style={styles.zonePattern} numberOfLines={1}>
                {zone.pattern || zone.patternType || '-'}
              </Text>
              {zone.zoneHierarchy && zone.zoneHierarchy !== 'REGULAR' && zone.zoneHierarchy !== 'regular' && (
                <View style={[styles.hierarchyBadge, { backgroundColor: colors.gold + '20' }]}>
                  <Text style={styles.hierarchyText}>
                    {getHierarchyShortName(zone.zoneHierarchy)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Action Button */}
      {onPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: qualityColor }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Target size={16} color={colors.bgDarkest} />
          <Text style={styles.actionText}>Trade Confluence</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// STACKED ZONES LIST
// ═══════════════════════════════════════════════════════════

export const StackedZonesList = memo(({ stackedZones, onZonePress }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    emptyContainer: {
      alignItems: 'center',
      padding: SPACING.xl,
      gap: SPACING.sm,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    emptySubtext: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    listContainer: {
      gap: SPACING.sm,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!stackedZones || stackedZones.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Layers size={32} color={colors.textMuted} />
        <Text style={styles.emptyText}>Không có Stacked Zones</Text>
        <Text style={styles.emptySubtext}>
          Stacked zones xuất hiện khi nhiều zones chồng lên nhau
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {stackedZones.map((zone, index) => (
        <StackedZonesIndicator
          key={index}
          stackedZone={zone}
          onPress={() => onZonePress?.(zone)}
        />
      ))}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// STACKED ZONES SUMMARY CARD
// ═══════════════════════════════════════════════════════════

export const StackedZonesSummary = memo(({ summary, style }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    summaryCard: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.gold + '30',
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    summaryTitle: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: SPACING.sm,
    },
    summaryItem: {
      alignItems: 'center',
      gap: 2,
    },
    summaryValue: {
      fontSize: 18,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    summaryLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
    avgConfluence: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    avgLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    avgValue: {
      fontSize: 14,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!summary || summary.total === 0) return null;

  return (
    <View style={[styles.summaryCard, style]}>
      <View style={styles.summaryHeader}>
        <Layers size={18} color={colors.gold} />
        <Text style={styles.summaryTitle}>Stacked Zones</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.gold }]}>
            {summary.exceptional || 0}
          </Text>
          <Text style={styles.summaryLabel}>A+</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {summary.excellent || 0}
          </Text>
          <Text style={styles.summaryLabel}>A</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.info }]}>
            {summary.good || 0}
          </Text>
          <Text style={styles.summaryLabel}>B</Text>
        </View>
      </View>

      <View style={styles.avgConfluence}>
        <Text style={styles.avgLabel}>Avg Confluence</Text>
        <Text style={[styles.avgValue, { color: colors.gold }]}>
          {summary.avgConfluence || 0}
        </Text>
      </View>
    </View>
  );
});

StackedZonesIndicator.displayName = 'StackedZonesIndicator';
StackedZonesCompact.displayName = 'StackedZonesCompact';
StackedZonesList.displayName = 'StackedZonesList';
StackedZonesSummary.displayName = 'StackedZonesSummary';

export default StackedZonesIndicator;
