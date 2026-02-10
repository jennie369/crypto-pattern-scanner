/**
 * QuotaBar Component - Vision Board
 * Displays quota usage with progress bar
 * Created: December 14, 2025
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUp, Crown, Infinity } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * QuotaBar - Shows current/limit usage with progress bar
 * @param {Object} quota - { remaining, limit, isUnlimited, displayText }
 * @param {string} label - Label for the quota (e.g., "Mục tiêu", "Thói quen")
 * @param {Function} onUpgradePress - Called when upgrade button pressed
 * @param {string} tierName - Current tier name (e.g., "Free", "Pro")
 * @param {string} tierColor - Tier color
 * @param {boolean} showUpgrade - Whether to show upgrade button
 */
const QuotaBar = ({
  quota = {},
  label = 'Quota',
  onUpgradePress,
  tierName = 'Free',
  tierColor = COLORS.gold,
  showUpgrade = true,
}) => {
  const { remaining = 0, limit = 0, isUnlimited = false, displayText = '' } = quota;

  // Calculate usage
  const used = isUnlimited ? 0 : Math.max(0, limit - remaining);
  const percentage = isUnlimited ? 0 : limit > 0 ? (used / limit) * 100 : 0;

  // Determine color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return COLORS.success;
    if (percentage >= 100) return COLORS.error;
    if (percentage >= 80) return COLORS.warning;
    if (percentage >= 50) return COLORS.gold;
    return COLORS.success;
  };

  const progressColor = getProgressColor();
  const isAtLimit = !isUnlimited && remaining <= 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.tierBadge, { backgroundColor: `${tierColor}20` }]}>
            <Crown size={10} color={tierColor} />
            <Text style={[styles.tierText, { color: tierColor }]}>{tierName}</Text>
          </View>
        </View>

        <View style={styles.countRow}>
          {isUnlimited ? (
            <View style={styles.unlimitedBadge}>
              <Infinity size={14} color={COLORS.success} />
              <Text style={styles.unlimitedText}>Không giới hạn</Text>
            </View>
          ) : (
            <Text style={[styles.count, isAtLimit && styles.countError]}>
              {used}/{limit}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar (not shown for unlimited) */}
      {!isUnlimited && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, percentage)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Upgrade Button (shown when at or near limit) */}
      {showUpgrade && isAtLimit && onUpgradePress && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <ArrowUp size={14} color={COLORS.background} />
          <Text style={styles.upgradeText}>Nâng cấp</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * QuotaBarCompact - Smaller inline version
 */
export const QuotaBarCompact = ({
  quota = {},
  label = '',
  onPress,
}) => {
  const { remaining = 0, limit = 0, isUnlimited = false } = quota;
  const used = isUnlimited ? 0 : Math.max(0, limit - remaining);
  const percentage = isUnlimited ? 0 : limit > 0 ? (used / limit) * 100 : 0;
  const isAtLimit = !isUnlimited && remaining <= 0;

  return (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {label && <Text style={styles.compactLabel}>{label}</Text>}

      {isUnlimited ? (
        <View style={styles.compactUnlimited}>
          <Infinity size={12} color={COLORS.success} />
        </View>
      ) : (
        <>
          <View style={styles.compactProgress}>
            <View
              style={[
                styles.compactFill,
                {
                  width: `${Math.min(100, percentage)}%`,
                  backgroundColor: isAtLimit ? COLORS.error : COLORS.gold,
                },
              ]}
            />
          </View>
          <Text style={[styles.compactCount, isAtLimit && styles.countError]}>
            {used}/{limit}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * QuotaSummaryCard - Shows all Vision Board quotas
 */
export const QuotaSummaryCard = ({
  quotaSummary = {},
  onUpgradePress,
}) => {
  const { goals, actions, affirmations, habits, tierName, tierColor } = quotaSummary;

  const items = [
    { label: 'Mục tiêu', quota: goals, key: 'goals' },
    { label: 'Hành động/mục tiêu', quota: actions, key: 'actions' },
    { label: 'Khẳng định', quota: affirmations, key: 'affirmations' },
    { label: 'Thói quen', quota: habits, key: 'habits' },
  ];

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Quota Vision Board</Text>
        <View style={[styles.tierBadge, { backgroundColor: `${tierColor}20` }]}>
          <Crown size={12} color={tierColor} />
          <Text style={[styles.tierText, { color: tierColor }]}>{tierName}</Text>
        </View>
      </View>

      {items.map(({ label, quota, key }) => (
        <View key={key} style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{label}</Text>
          {quota?.isUnlimited ? (
            <View style={styles.unlimitedBadge}>
              <Infinity size={12} color={COLORS.success} />
              <Text style={styles.unlimitedTextSmall}>Unlimited</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.summaryValue,
                quota?.remaining <= 0 && styles.countError,
              ]}
            >
              {quota?.displayText || '-'}
            </Text>
          )}
        </View>
      ))}

      {onUpgradePress && (
        <TouchableOpacity
          style={styles.upgradeButtonFull}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <ArrowUp size={16} color={COLORS.background} />
          <Text style={styles.upgradeTextFull}>Nâng cấp để tạo thêm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  countError: {
    color: COLORS.error,
  },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlimitedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },
  unlimitedTextSmall: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 4,
  },
  upgradeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  compactLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  compactProgress: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    maxWidth: 60,
  },
  compactFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  compactUnlimited: {
    opacity: 0.7,
  },

  // Summary card styles
  summaryCard: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  upgradeButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  upgradeTextFull: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },
});

export default QuotaBar;
