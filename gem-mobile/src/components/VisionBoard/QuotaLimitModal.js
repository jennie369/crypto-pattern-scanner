/**
 * QuotaLimitModal Component - Vision Board
 * Modal shown when user reaches quota limit
 * Created: December 14, 2025
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  AlertCircle,
  ArrowUp,
  X,
  Crown,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * QuotaLimitModal - Shown when user tries to create something beyond their quota
 * @param {boolean} visible - Modal visibility
 * @param {Function} onClose - Close handler
 * @param {Function} onUpgrade - Upgrade button handler
 * @param {Object} upgradeInfo - { message, nextTier, nextTierPrice, currentLimit, nextLimit, productId }
 * @param {string} itemType - 'goal', 'habit', 'affirmation', 'action'
 */
const QuotaLimitModal = ({
  visible = false,
  onClose,
  onUpgrade,
  upgradeInfo = {},
  itemType = 'item',
}) => {
  const {
    message = 'Bạn đã đạt giới hạn. Vui lòng nâng cấp để tạo thêm!',
    nextTier = 'Pro',
    nextTierPrice = '39.000đ/tháng',
    currentLimit = 0,
    nextLimit = -1,
    benefits = [],
  } = upgradeInfo;

  // Item type labels
  const itemLabels = {
    goal: 'mục tiêu',
    habit: 'thói quen',
    affirmation: 'khẳng định',
    action: 'hành động',
  };

  const itemLabel = itemLabels[itemType] || 'mục';

  // Format next limit
  const nextLimitText = nextLimit === -1 ? 'Không giới hạn' : nextLimit;

  // Default benefits if not provided
  const displayBenefits = benefits.length > 0 ? benefits : [
    `Tạo ${nextLimitText} ${itemLabel}`,
    'Phân tích chuyên sâu từ AI',
    'Hỗ trợ ưu tiên',
    'Nhiều tính năng premium khác',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
              <View style={styles.modal}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconCircle}>
                    <AlertCircle size={32} color={COLORS.warning} />
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Đã đạt giới hạn!</Text>

                {/* Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Current vs Next Comparison */}
                <View style={styles.comparisonContainer}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Hiện tại</Text>
                    <Text style={styles.comparisonValue}>{currentLimit} {itemLabel}</Text>
                  </View>
                  <View style={styles.comparisonArrow}>
                    <ArrowUp size={20} color={COLORS.gold} style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>
                  <View style={[styles.comparisonItem, styles.comparisonItemHighlight]}>
                    <Text style={styles.comparisonLabel}>{nextTier}</Text>
                    <Text style={[styles.comparisonValue, styles.comparisonValueHighlight]}>
                      {nextLimitText} {itemLabel}
                    </Text>
                  </View>
                </View>

                {/* Benefits */}
                <View style={styles.benefitsContainer}>
                  <View style={styles.benefitsHeader}>
                    <Crown size={16} color={COLORS.gold} />
                    <Text style={styles.benefitsTitle}>Lợi ích khi nâng cấp</Text>
                  </View>
                  {displayBenefits.slice(0, 4).map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Check size={14} color={COLORS.success} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Chỉ từ</Text>
                  <Text style={styles.priceValue}>{nextTierPrice}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={onUpgrade}
                    activeOpacity={0.8}
                  >
                    <Sparkles size={18} color={COLORS.background} />
                    <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.laterButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.laterButtonText}>Để sau</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/**
 * QuotaWarningBanner - Inline warning when approaching limit
 */
export const QuotaWarningBanner = ({
  remaining = 0,
  limit = 0,
  itemType = 'item',
  onUpgradePress,
}) => {
  if (remaining > 2 || remaining === -1) return null;

  const itemLabels = {
    goal: 'mục tiêu',
    habit: 'thói quen',
    affirmation: 'khẳng định',
    action: 'hành động',
  };

  const itemLabel = itemLabels[itemType] || 'mục';
  const isAtLimit = remaining <= 0;

  return (
    <TouchableOpacity
      style={[
        styles.warningBanner,
        isAtLimit && styles.warningBannerError,
      ]}
      onPress={onUpgradePress}
      activeOpacity={0.8}
    >
      <AlertCircle
        size={16}
        color={isAtLimit ? COLORS.error : COLORS.warning}
      />
      <Text
        style={[
          styles.warningText,
          isAtLimit && styles.warningTextError,
        ]}
      >
        {isAtLimit
          ? `Đã đạt giới hạn ${limit} ${itemLabel}. Nâng cấp để tạo thêm!`
          : `Còn ${remaining} ${itemLabel} có thể tạo`}
      </Text>
      {onUpgradePress && (
        <ArrowUp size={14} color={isAtLimit ? COLORS.error : COLORS.warning} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 360,
  },
  modal: {
    backgroundColor: GLASS.backgroundColor,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: GLASS.borderColor,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  comparisonItem: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    minWidth: 100,
  },
  comparisonItemHighlight: {
    backgroundColor: `${COLORS.gold}15`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  comparisonValueHighlight: {
    color: COLORS.gold,
  },
  comparisonArrow: {
    opacity: 0.5,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  buttonsContainer: {
    gap: SPACING.sm,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },
  laterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  laterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Warning banner styles
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    borderWidth: 1,
    borderColor: `${COLORS.warning}30`,
    borderRadius: 10,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  warningBannerError: {
    backgroundColor: `${COLORS.error}15`,
    borderColor: `${COLORS.error}30`,
  },
  warningText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
  },
  warningTextError: {
    color: COLORS.error,
  },
});

export default QuotaLimitModal;
