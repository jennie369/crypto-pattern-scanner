/**
 * GEM Mobile - Entry Method Selector Component
 * Phase 3A: Choose between Set & Forget vs Confirmation entry methods
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Crosshair,
  CheckCircle,
  Info,
  Star,
  Target,
  AlertCircle,
  ChevronRight,
  X,
  Zap,
  Clock,
  Shield,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

/**
 * Entry method configurations
 */
const ENTRY_METHODS = {
  set_and_forget: {
    id: 'set_and_forget',
    name: 'Set & Forget',
    nameVi: 'Đặt & Quên',
    icon: Target,
    color: COLORS.primary,
    description: 'Đặt order tại zone và để thị trường làm việc',
    descriptionVi: 'Entry ngay tại zone edge, không cần confirmation',
    pros: [
      'Không bỏ lỡ entry',
      'Dễ thực hiện',
      'Không cần theo dõi liên tục',
    ],
    cons: [
      'Có thể bị stop hunt',
      'Win rate thấp hơn 5-10%',
      'Cần zone chất lượng cao',
    ],
    bestFor: 'Grade A+ zones, FTB opportunities, stacked zones',
    minGrade: 'A', // Minimum grade required
    winRateAdjustment: -5, // Win rate adjustment %
  },
  confirmation: {
    id: 'confirmation',
    name: 'Confirmation',
    nameVi: 'Xác Nhận',
    icon: CheckCircle,
    color: COLORS.success,
    description: 'Đợi confirmation pattern trước khi entry',
    descriptionVi: 'Entry sau khi có Engulfing, Pin Bar, hoặc Combo',
    pros: [
      'Win rate cao hơn 5-10%',
      'Tránh được stop hunt',
      'Entry chắc chắn hơn',
    ],
    cons: [
      'Có thể bỏ lỡ entry',
      'Cần theo dõi chart',
      'Đòi hỏi kỹ năng đọc nến',
    ],
    bestFor: 'All zones, especially Grade B-C zones',
    minGrade: 'C', // Any grade acceptable
    winRateAdjustment: +5, // Win rate adjustment %
  },
};

/**
 * Main EntryMethodSelector component
 */
const EntryMethodSelector = memo(({
  selectedMethod = 'confirmation',
  onSelect,
  zoneGrade = 'B',
  disabled = false,
  showDetails = true,
  compact = false,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleSelect = useCallback((methodId) => {
    if (!disabled) {
      onSelect?.(methodId);
    }
  }, [disabled, onSelect]);

  // Compact mode - just pills
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {Object.values(ENTRY_METHODS).map((method) => {
          const isSelected = selectedMethod === method.id;
          const IconComponent = method.icon;

          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.compactPill,
                isSelected && { backgroundColor: method.color + '30', borderColor: method.color },
                disabled && styles.disabled,
              ]}
              onPress={() => handleSelect(method.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <IconComponent size={14} color={isSelected ? method.color : COLORS.textMuted} />
              <Text style={[
                styles.compactText,
                isSelected && { color: method.color },
              ]}>
                {method.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Entry Method</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
          <Info size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Method Options */}
      <View style={styles.optionsContainer}>
        {Object.values(ENTRY_METHODS).map((method) => {
          const isSelected = selectedMethod === method.id;
          const IconComponent = method.icon;
          const isRecommended = getRecommendation(zoneGrade) === method.id;

          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.optionCard,
                isSelected && { borderColor: method.color, backgroundColor: method.color + '10' },
                disabled && styles.disabled,
              ]}
              onPress={() => handleSelect(method.id)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: method.color }]}>
                  <Star size={10} color={COLORS.white} />
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}

              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: method.color + '20' }]}>
                <IconComponent size={24} color={method.color} />
              </View>

              {/* Content */}
              <View style={styles.optionContent}>
                <Text style={[styles.optionName, isSelected && { color: method.color }]}>
                  {method.name}
                </Text>
                <Text style={styles.optionNameVi}>{method.nameVi}</Text>
                {showDetails && (
                  <Text style={styles.optionDescription} numberOfLines={2}>
                    {method.descriptionVi}
                  </Text>
                )}
              </View>

              {/* Selection indicator */}
              <View style={[
                styles.selectionIndicator,
                isSelected && { backgroundColor: method.color, borderColor: method.color },
              ]}>
                {isSelected && <CheckCircle size={14} color={COLORS.white} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Win Rate Comparison */}
      {showDetails && (
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>Win Rate Impact</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Target size={14} color={COLORS.primary} />
              <Text style={styles.comparisonLabel}>Set & Forget</Text>
              <Text style={[styles.comparisonValue, { color: COLORS.warning }]}>
                Base - 5%
              </Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonItem}>
              <CheckCircle size={14} color={COLORS.success} />
              <Text style={styles.comparisonLabel}>Confirmation</Text>
              <Text style={[styles.comparisonValue, { color: COLORS.success }]}>
                Base + 5%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Info Modal */}
      <EntryMethodInfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </View>
  );
});

/**
 * Get recommendation based on zone grade
 */
const getRecommendation = (grade) => {
  if (['A+', 'A'].includes(grade)) {
    return 'set_and_forget';
  }
  return 'confirmation';
};

/**
 * Entry Method Info Modal
 */
const EntryMethodInfoModal = memo(({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Entry Methods Explained</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {Object.values(ENTRY_METHODS).map((method) => {
              const IconComponent = method.icon;

              return (
                <View key={method.id} style={styles.methodSection}>
                  {/* Method Header */}
                  <View style={styles.methodHeader}>
                    <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                      <IconComponent size={24} color={method.color} />
                    </View>
                    <View>
                      <Text style={[styles.methodName, { color: method.color }]}>
                        {method.name}
                      </Text>
                      <Text style={styles.methodNameVi}>{method.nameVi}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.methodDescription}>{method.description}</Text>

                  {/* Pros */}
                  <View style={styles.prosConsSection}>
                    <View style={styles.prosConsHeader}>
                      <CheckCircle size={14} color={COLORS.success} />
                      <Text style={[styles.prosConsTitle, { color: COLORS.success }]}>
                        Ưu điểm
                      </Text>
                    </View>
                    {method.pros.map((pro, index) => (
                      <Text key={index} style={styles.prosConsItem}>• {pro}</Text>
                    ))}
                  </View>

                  {/* Cons */}
                  <View style={styles.prosConsSection}>
                    <View style={styles.prosConsHeader}>
                      <AlertCircle size={14} color={COLORS.warning} />
                      <Text style={[styles.prosConsTitle, { color: COLORS.warning }]}>
                        Nhược điểm
                      </Text>
                    </View>
                    {method.cons.map((con, index) => (
                      <Text key={index} style={styles.prosConsItem}>• {con}</Text>
                    ))}
                  </View>

                  {/* Best For */}
                  <View style={styles.bestForSection}>
                    <Zap size={14} color={COLORS.gold} />
                    <Text style={styles.bestForText}>
                      <Text style={styles.bestForLabel}>Phù hợp: </Text>
                      {method.bestFor}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Recommendation Section */}
            <View style={styles.recommendationSection}>
              <View style={styles.recommendationHeader}>
                <Star size={16} color={COLORS.gold} />
                <Text style={styles.recommendationTitle}>Khuyến nghị</Text>
              </View>
              <Text style={styles.recommendationText}>
                • Zone Grade A+/A: Set & Forget OK{'\n'}
                • Zone Grade B/C: Nên dùng Confirmation{'\n'}
                • FTB + Stacked: Set & Forget{'\n'}
                • Pin + Engulf Combo: Entry ngay
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

/**
 * Entry Method Badge - compact display
 */
export const EntryMethodBadge = memo(({ method, size = 'md' }) => {
  const config = ENTRY_METHODS[method] || ENTRY_METHODS.confirmation;
  const IconComponent = config.icon;

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <IconComponent size={iconSize} color={config.color} />
      <Text style={[styles.badgeText, { color: config.color, fontSize }]}>
        {config.name}
      </Text>
    </View>
  );
});

/**
 * Entry Method Inline - minimal display
 */
export const EntryMethodInline = memo(({ method }) => {
  const config = ENTRY_METHODS[method] || ENTRY_METHODS.confirmation;
  const IconComponent = config.icon;

  return (
    <View style={styles.inlineContainer}>
      <IconComponent size={14} color={config.color} />
      <Text style={[styles.inlineText, { color: config.color }]}>
        {config.nameVi}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoButton: {
    padding: SPACING.xs,
  },

  // Options
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendedText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  optionNameVi: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Comparison
  comparisonContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  comparisonTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  comparisonLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },

  // Compact mode
  compactContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.bgDarkest,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.glassBg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    padding: SPACING.lg,
  },

  // Method section in modal
  methodSection: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
  },
  methodNameVi: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  methodDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },

  // Pros/Cons
  prosConsSection: {
    marginBottom: SPACING.sm,
  },
  prosConsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  prosConsTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  prosConsItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    lineHeight: 18,
  },

  // Best for
  bestForSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  bestForText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gold,
    lineHeight: 18,
  },
  bestForLabel: {
    fontWeight: '600',
  },

  // Recommendation section
  recommendationSection: {
    backgroundColor: COLORS.bgDarkest,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  recommendationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontWeight: '600',
  },

  // Inline
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

EntryMethodSelector.displayName = 'EntryMethodSelector';
EntryMethodBadge.displayName = 'EntryMethodBadge';
EntryMethodInline.displayName = 'EntryMethodInline';
EntryMethodInfoModal.displayName = 'EntryMethodInfoModal';

export default EntryMethodSelector;
