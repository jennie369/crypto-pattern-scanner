/**
 * GEM Mobile - Zone Hierarchy Badge Component
 * Display zone hierarchy level with visual indicator
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Crown,
  Target,
  Flag,
  Circle,
  Star,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';
import {
  ZONE_HIERARCHY,
  getHierarchyByLevel,
  getHierarchyByName,
} from '../../constants/zoneHierarchyConfig';

// Icon mapping
const ICON_MAP = {
  Crown: Crown,
  Target: Target,
  Flag: Flag,
  Circle: Circle,
};

/**
 * Main Zone Hierarchy Badge
 */
const ZoneHierarchyBadge = memo(({
  hierarchy,
  hierarchyLevel,
  size = 'medium',
  showStars = true,
  showLabel = true,
  onPress,
  style,
}) => {
  // Get config from hierarchy name or level
  const config = hierarchy
    ? getHierarchyByName(hierarchy)
    : getHierarchyByLevel(hierarchyLevel);

  if (!config) return null;

  const sizeConfig = {
    small: { iconSize: 12, fontSize: 10, padding: 4, starSize: 8 },
    medium: { iconSize: 16, fontSize: 12, padding: 6, starSize: 10 },
    large: { iconSize: 20, fontSize: 14, padding: 8, starSize: 12 },
  };

  const sizes = sizeConfig[size] || sizeConfig.medium;
  const IconComponent = ICON_MAP[config.icon] || Circle;

  const renderStars = () => {
    if (!showStars) return null;

    return (
      <View style={styles.starsContainer}>
        {[...Array(config.stars)].map((_, i) => (
          <Star
            key={i}
            size={sizes.starSize}
            color={config.color}
            fill={config.color}
          />
        ))}
      </View>
    );
  };

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.colorLight || config.color + '20',
          padding: sizes.padding,
        },
        style,
      ]}
    >
      <IconComponent
        size={sizes.iconSize}
        color={config.color}
        fill={config.level === 1 ? config.color : 'transparent'}
      />

      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: sizes.fontSize,
            },
          ]}
        >
          {config.shortName}
        </Text>
      )}

      {renderStars()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(config)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

/**
 * Compact inline version
 */
export const HierarchyInline = memo(({ hierarchy, showDescription = false, style }) => {
  const config = getHierarchyByName(hierarchy) || ZONE_HIERARCHY.REGULAR;
  const IconComponent = ICON_MAP[config.icon] || Circle;

  return (
    <View style={[styles.inlineContainer, style]}>
      <View style={[styles.inlineDot, { backgroundColor: config.color }]} />
      <Text style={[styles.inlineText, { color: config.color }]}>
        {config.shortName}
      </Text>
      {showDescription && (
        <Text style={styles.inlineDescription}>- {config.nameVi}</Text>
      )}
    </View>
  );
});

/**
 * Full hierarchy display (for tooltips/modals)
 */
export const HierarchyLegend = memo(({ currentHierarchy, onItemPress, style }) => {
  return (
    <View style={[styles.legendContainer, style]}>
      <Text style={styles.legendTitle}>Thứ Bậc Zone</Text>

      {Object.entries(ZONE_HIERARCHY).map(([key, config]) => {
        const IconComponent = ICON_MAP[config.icon] || Circle;
        const isActive = currentHierarchy === key;

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.legendRow,
              isActive && { backgroundColor: config.colorLight },
            ]}
            onPress={() => onItemPress?.(key, config)}
            activeOpacity={onItemPress ? 0.7 : 1}
            disabled={!onItemPress}
          >
            <View style={[styles.legendIconContainer, { backgroundColor: config.color }]}>
              <IconComponent
                size={16}
                color="#FFFFFF"
                fill={config.level === 1 ? '#FFFFFF' : 'transparent'}
              />
            </View>
            <View style={styles.legendContent}>
              <View style={styles.legendHeader}>
                <Text style={[styles.legendName, { color: config.color }]}>
                  {config.shortName} - {config.name}
                </Text>
                <View style={styles.legendStars}>
                  {[...Array(config.stars)].map((_, i) => (
                    <Star key={i} size={10} color={config.color} fill={config.color} />
                  ))}
                </View>
              </View>
              <Text style={styles.legendDescription}>{config.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

/**
 * Hierarchy comparison bar (shows all levels)
 */
export const HierarchyBar = memo(({ activeLevel = 4, style }) => {
  const levels = Object.values(ZONE_HIERARCHY).sort((a, b) => a.level - b.level);

  return (
    <View style={[styles.barContainer, style]}>
      {levels.map(config => {
        const isActive = config.level === activeLevel;
        const isPassed = config.level < activeLevel;

        return (
          <View
            key={config.level}
            style={[
              styles.barSegment,
              {
                backgroundColor: isActive
                  ? config.color
                  : isPassed
                  ? config.color + '40'
                  : COLORS.border,
              },
            ]}
          >
            {isActive && (
              <Text style={styles.barLabel}>{config.shortName}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
});

/**
 * Hierarchy stats card
 */
export const HierarchyStatsCard = memo(({ stats, style }) => {
  if (!stats) return null;

  return (
    <View style={[styles.statsCard, style]}>
      <Text style={styles.statsTitle}>Zone Distribution</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: ZONE_HIERARCHY.DECISION_POINT.color }]} />
          <Text style={styles.statLabel}>DP</Text>
          <Text style={styles.statValue}>{stats.decisionPoints}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: ZONE_HIERARCHY.FTR.color }]} />
          <Text style={styles.statLabel}>FTR</Text>
          <Text style={styles.statValue}>{stats.ftrZones}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: ZONE_HIERARCHY.FLAG_LIMIT.color }]} />
          <Text style={styles.statLabel}>FL</Text>
          <Text style={styles.statValue}>{stats.flagLimits}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: ZONE_HIERARCHY.REGULAR.color }]} />
          <Text style={styles.statLabel}>REG</Text>
          <Text style={styles.statValue}>{stats.regularZones}</Text>
        </View>
      </View>

      <View style={styles.statsPremium}>
        <Text style={styles.statsPremiumLabel}>Premium Zones</Text>
        <Text style={styles.statsPremiumValue}>{stats.premiumPercent}%</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Main badge
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  label: {
    fontWeight: '700',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },

  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  inlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inlineDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Legend styles
  legendContainer: {
    gap: SPACING.sm,
  },
  legendTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  legendIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContent: {
    flex: 1,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendStars: {
    flexDirection: 'row',
    gap: 1,
  },
  legendDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Bar styles
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  barSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Stats card
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statsPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsPremiumLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statsPremiumValue: {
    color: ZONE_HIERARCHY.DECISION_POINT.color,
    fontSize: 14,
    fontWeight: '600',
  },
});

ZoneHierarchyBadge.displayName = 'ZoneHierarchyBadge';
HierarchyInline.displayName = 'HierarchyInline';
HierarchyLegend.displayName = 'HierarchyLegend';
HierarchyBar.displayName = 'HierarchyBar';
HierarchyStatsCard.displayName = 'HierarchyStatsCard';

export default ZoneHierarchyBadge;
