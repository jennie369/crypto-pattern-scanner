/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMUNITY COMPARISON BAR
 * ROI Proof System - Phase D
 * Progress bar comparing user value vs community average
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

/**
 * CommunityComparisonBar Component
 *
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {number} props.userValue - User's value
 * @param {number} props.communityValue - Community average value
 * @param {string} props.prefix - Value prefix (e.g., '$')
 * @param {string} props.suffix - Value suffix (e.g., '%')
 * @param {boolean} props.isAboveAverage - Whether user is above average
 * @param {Object} props.style - Additional container styles
 */
const CommunityComparisonBar = ({
  label,
  userValue = 0,
  communityValue = 0,
  prefix = '',
  suffix = '',
  isAboveAverage = false,
  style,
}) => {
  // Calculate bar widths (normalized to max of 100%)
  const maxValue = Math.max(userValue, communityValue, 1);
  const userWidth = Math.min((userValue / maxValue) * 100, 100);
  const communityWidth = Math.min((communityValue / maxValue) * 100, 100);

  // Colors
  const userColor = isAboveAverage ? COLORS.success : COLORS.warning;
  const communityColor = 'rgba(255, 255, 255, 0.3)';

  // Format value
  const formatValue = (value) => {
    if (value == null) return '0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
    }
    if (absValue >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`;
    }
    return `${prefix}${value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`;
  };

  // Difference text
  const difference = userValue - communityValue;
  const differenceText = difference >= 0
    ? `+${formatValue(difference)}`
    : formatValue(difference);

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.differenceContainer}>
          <Text
            style={[
              styles.difference,
              { color: isAboveAverage ? COLORS.success : COLORS.error },
            ]}
          >
            {differenceText}
          </Text>
        </View>
      </View>

      {/* Bars container */}
      <View style={styles.barsContainer}>
        {/* User bar row */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Bạn</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${userWidth}%`,
                  backgroundColor: userColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.barValue, { color: userColor }]}>
            {formatValue(userValue)}
          </Text>
        </View>

        {/* Community bar row */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>TB</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${communityWidth}%`,
                  backgroundColor: communityColor,
                },
              ]}
            />
          </View>
          <Text style={styles.barValue}>
            {formatValue(communityValue)}
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * CommunityComparisonList Component
 * Renders a list of comparison bars
 */
export const CommunityComparisonList = ({
  comparisons = [],
  cohortName = 'Cộng đồng',
  style,
}) => {
  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <View style={[styles.listContainer, style]}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>So sánh với {cohortName}</Text>
      </View>

      {comparisons.map((comparison) => (
        <CommunityComparisonBar
          key={comparison.id}
          label={comparison.label}
          userValue={comparison.userValue}
          communityValue={comparison.communityValue}
          prefix={comparison.prefix}
          suffix={comparison.suffix}
          isAboveAverage={comparison.isAboveAverage}
          style={styles.comparisonItem}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  differenceContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  difference: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Bars
  barsContainer: {
    gap: SPACING.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    width: 30,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  barValue: {
    width: 60,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },

  // List
  listContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.55)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  listTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  comparisonItem: {
    marginBottom: SPACING.md,
  },
});

export default React.memo(CommunityComparisonBar);
