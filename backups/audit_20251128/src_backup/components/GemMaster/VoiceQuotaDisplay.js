/**
 * GEM Mobile - Voice Quota Display Component
 * Day 11-12: Voice Input Implementation
 *
 * FEATURES:
 * - Shows remaining voice messages for FREE users
 * - Shows "Unlimited" for TIER1+ users
 * - Upgrade prompt when quota is low or exhausted
 *
 * Uses design tokens from DESIGN_TOKENS.md
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Mic, Crown, AlertCircle, CheckCircle } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * Voice Quota Display - Shows remaining voice messages
 * @param {Object} props
 * @param {Object} props.quotaInfo - { isUnlimited, used, limit, remaining, displayText }
 * @param {Function} props.onUpgradePress - Called when upgrade button is pressed
 * @param {boolean} props.compact - Show compact version
 */
const VoiceQuotaDisplay = ({
  quotaInfo = { isUnlimited: false, used: 0, limit: 3, remaining: 3 },
  onUpgradePress,
  compact = false,
}) => {
  const { isUnlimited, used, limit, remaining } = quotaInfo;

  // Determine status and styling
  const getStatus = () => {
    if (isUnlimited) {
      return {
        type: 'unlimited',
        color: COLORS.success,
        bgColor: 'rgba(58, 247, 166, 0.1)',
        borderColor: 'rgba(58, 247, 166, 0.3)',
        icon: CheckCircle,
        text: 'Không giới hạn',
      };
    }

    if (remaining === 0) {
      return {
        type: 'exhausted',
        color: COLORS.error,
        bgColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.3)',
        icon: AlertCircle,
        text: 'Đã hết lượt',
      };
    }

    if (remaining <= 1) {
      return {
        type: 'low',
        color: COLORS.warning,
        bgColor: 'rgba(255, 189, 89, 0.1)',
        borderColor: 'rgba(255, 189, 89, 0.3)',
        icon: AlertCircle,
        text: `Còn ${remaining} lượt`,
      };
    }

    return {
      type: 'normal',
      color: COLORS.cyan,
      bgColor: 'rgba(0, 240, 255, 0.1)',
      borderColor: 'rgba(0, 240, 255, 0.2)',
      icon: Mic,
      text: `${remaining}/${limit} lượt`,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Compact version - just shows remaining count
  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: status.bgColor }]}>
        <StatusIcon size={12} color={status.color} />
        <Text style={[styles.compactText, { color: status.color }]}>
          {isUnlimited ? '∞' : remaining}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: status.borderColor }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: status.bgColor }]}>
          <StatusIcon size={16} color={status.color} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.label}>Voice Input</Text>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>

        {/* Progress bar (for FREE users only) */}
        {!isUnlimited && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(remaining / limit) * 100}%`,
                    backgroundColor: status.color,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Upgrade button (when quota is low or exhausted) */}
        {!isUnlimited && remaining <= 1 && onUpgradePress && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgradePress}
          >
            <Crown size={12} color={COLORS.gold} />
            <Text style={styles.upgradeText}>Nâng cấp</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exhausted message */}
      {!isUnlimited && remaining === 0 && (
        <View style={styles.exhaustedMessage}>
          <Text style={styles.exhaustedText}>
            Nâng cấp lên PRO để dùng voice không giới hạn!
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Voice Quota Badge - Small badge for input area
 */
export const VoiceQuotaBadge = ({
  quotaInfo = { isUnlimited: false, remaining: 3, limit: 3 },
  onPress,
}) => {
  const { isUnlimited, remaining, limit } = quotaInfo;

  if (isUnlimited) {
    return (
      <TouchableOpacity style={styles.badgeUnlimited} onPress={onPress}>
        <Mic size={10} color={COLORS.success} />
        <Text style={styles.badgeUnlimitedText}>∞</Text>
      </TouchableOpacity>
    );
  }

  const isLow = remaining <= 1;
  const isExhausted = remaining === 0;

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        isExhausted && styles.badgeExhausted,
        isLow && !isExhausted && styles.badgeLow,
      ]}
      onPress={onPress}
    >
      <Mic size={10} color={isExhausted ? COLORS.error : isLow ? COLORS.warning : COLORS.cyan} />
      <Text
        style={[
          styles.badgeText,
          isExhausted && styles.badgeTextExhausted,
          isLow && !isExhausted && styles.badgeTextLow,
        ]}
      >
        {remaining}/{limit}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Voice Quota Warning Modal Content
 * For displaying when user tries to use voice with no quota
 */
export const VoiceQuotaWarning = ({
  onUpgrade,
  onDismiss,
}) => {
  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningIconContainer}>
        <AlertCircle size={32} color={COLORS.error} />
      </View>

      <Text style={styles.warningTitle}>Đã hết lượt Voice Input</Text>

      <Text style={styles.warningDescription}>
        Bạn đã sử dụng hết 3 lượt voice miễn phí hôm nay.
        Nâng cấp lên PRO để dùng không giới hạn!
      </Text>

      <View style={styles.warningFeatures}>
        <View style={styles.warningFeatureItem}>
          <CheckCircle size={14} color={COLORS.success} />
          <Text style={styles.warningFeatureText}>Voice không giới hạn</Text>
        </View>
        <View style={styles.warningFeatureItem}>
          <CheckCircle size={14} color={COLORS.success} />
          <Text style={styles.warningFeatureText}>15 câu hỏi/ngày</Text>
        </View>
        <View style={styles.warningFeatureItem}>
          <CheckCircle size={14} color={COLORS.success} />
          <Text style={styles.warningFeatureText}>Phân tích chuyên sâu</Text>
        </View>
      </View>

      <View style={styles.warningActions}>
        <TouchableOpacity
          style={styles.warningUpgradeButton}
          onPress={onUpgrade}
        >
          <Crown size={16} color="#000" />
          <Text style={styles.warningUpgradeText}>Nâng cấp PRO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.warningDismissButton}
          onPress={onDismiss}
        >
          <Text style={styles.warningDismissText}>Để sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  progressContainer: {
    width: 60,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  upgradeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  exhaustedMessage: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  exhaustedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Compact version
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  compactText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 8,
  },
  badgeLow: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  badgeExhausted: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  badgeTextLow: {
    color: COLORS.warning,
  },
  badgeTextExhausted: {
    color: COLORS.error,
  },
  badgeUnlimited: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    borderRadius: 8,
  },
  badgeUnlimitedText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },

  // Warning modal
  warningContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  warningDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  warningFeatures: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  warningFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  warningFeatureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  warningActions: {
    width: '100%',
    gap: SPACING.sm,
  },
  warningUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  warningUpgradeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#000',
  },
  warningDismissButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  warningDismissText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default VoiceQuotaDisplay;
