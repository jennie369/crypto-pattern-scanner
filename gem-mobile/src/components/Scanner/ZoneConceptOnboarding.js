/**
 * GEM Mobile - Zone Concept Onboarding
 * Educational modal explaining zone boundaries vs single price line
 *
 * Key Concepts:
 * - Why zones > lines
 * - Entry = near price (where price first touches)
 * - Stop = far price (invalidation level)
 * - HFZ vs LFZ differences
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BORDER_RADIUS } from '../../utils/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = '@gem_zone_onboarding_seen';

const STEPS = [
  {
    id: 'intro',
    title: 'Tại sao dùng Zone?',
    subtitle: 'Thay vì đường line đơn lẻ',
    icon: Lightbulb,
    iconColor: COLORS.gold,
    content: [
      {
        type: 'comparison',
        old: {
          title: 'Cách cũ: Line đơn',
          points: [
            'Chỉ có 1 giá duy nhất',
            'Khó xác định entry chính xác',
            'Không biết đặt stop ở đâu',
          ],
          color: COLORS.error,
        },
        new: {
          title: 'Cách mới: Zone',
          points: [
            'Có Entry + Stop rõ ràng',
            'Vùng giá thay vì 1 điểm',
            'Quản lý risk tốt hơn',
          ],
          color: COLORS.success,
        },
      },
    ],
    tip: 'Zone cho phép bạn có kế hoạch giao dịch rõ ràng với entry và stop xác định trước.',
  },
  {
    id: 'entry_stop',
    title: 'Entry & Stop',
    subtitle: 'Hai biên của zone',
    icon: Target,
    iconColor: COLORS.gold,
    content: [
      {
        type: 'definition',
        items: [
          {
            icon: Target,
            iconColor: COLORS.gold,
            title: 'Entry Price (Giá vào lệnh)',
            description: 'Biên "gần" của zone - nơi giá chạm đầu tiên khi tiến vào vùng.',
          },
          {
            icon: Shield,
            iconColor: COLORS.textSecondary,
            title: 'Stop Price (Giá stop loss)',
            description: 'Biên "xa" của zone - mức giá mà nếu bị phá vỡ, tín hiệu không còn hợp lệ.',
          },
        ],
      },
    ],
    tip: '"Gần" và "xa" là tương đối với hướng giá đang di chuyển.',
  },
  {
    id: 'hfz',
    title: 'Vùng Cung (HFZ)',
    subtitle: 'High Frequency Zone - Supply',
    icon: TrendingDown,
    iconColor: COLORS.error,
    content: [
      {
        type: 'zone_explain',
        zoneType: 'HFZ',
        color: COLORS.error,
        direction: 'Giá đi từ dưới lên',
        bias: 'SELL',
        rules: [
          { label: 'Entry', value: 'LOW của pause', description: 'Biên dưới - giá chạm trước' },
          { label: 'Stop', value: 'HIGH của pause', description: 'Biên trên - mức invalidation' },
        ],
        visual: {
          topLabel: 'STOP (HIGH)',
          bottomLabel: 'ENTRY (LOW)',
          arrow: 'up',
        },
      },
    ],
    tip: 'HFZ là vùng giá có lực bán mạnh. Kỳ vọng giá sẽ giảm sau khi chạm zone.',
  },
  {
    id: 'lfz',
    title: 'Vùng Cầu (LFZ)',
    subtitle: 'Low Frequency Zone - Demand',
    icon: TrendingUp,
    iconColor: COLORS.success,
    content: [
      {
        type: 'zone_explain',
        zoneType: 'LFZ',
        color: COLORS.success,
        direction: 'Giá đi từ trên xuống',
        bias: 'BUY',
        rules: [
          { label: 'Entry', value: 'HIGH của pause', description: 'Biên trên - giá chạm trước' },
          { label: 'Stop', value: 'LOW của pause', description: 'Biên dưới - mức invalidation' },
        ],
        visual: {
          topLabel: 'ENTRY (HIGH)',
          bottomLabel: 'STOP (LOW)',
          arrow: 'down',
        },
      },
    ],
    tip: 'LFZ là vùng giá có lực mua mạnh. Kỳ vọng giá sẽ tăng sau khi chạm zone.',
  },
  {
    id: 'strength',
    title: 'Độ mạnh Pattern',
    subtitle: 'Không phải pattern nào cũng như nhau',
    icon: Zap,
    iconColor: COLORS.purple,
    content: [
      {
        type: 'strength_ranking',
        items: [
          {
            patterns: ['UPD', 'DPU'],
            stars: 5,
            context: 'Đảo chiều',
            winRate: '70-72%',
            description: 'Mạnh nhất - Đảo chiều trend',
            color: COLORS.gold,
          },
          {
            patterns: ['H&S', 'Double Top/Bottom'],
            stars: 4,
            context: 'Classic',
            winRate: '67-72%',
            description: 'Rất mạnh - Patterns cổ điển',
            color: COLORS.success,
          },
          {
            patterns: ['DPD', 'UPU'],
            stars: 3,
            context: 'Tiếp diễn',
            winRate: '56-58%',
            description: 'Trung bình - Tiếp diễn trend',
            color: COLORS.warning,
          },
        ],
      },
    ],
    tip: 'Ưu tiên giao dịch với patterns đảo chiều (5 sao) để có win rate cao nhất.',
  },
];

const ZoneConceptOnboarding = memo(({
  visible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.warn('[ZoneOnboarding] Error saving completion:', error);
    }
    onComplete?.();
    onClose?.();
  }, [onClose, onComplete]);

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.warn('[ZoneOnboarding] Error saving skip:', error);
    }
    onClose?.();
  }, [onClose]);

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  const renderContent = () => {
    return step.content.map((content, idx) => {
      switch (content.type) {
        case 'comparison':
          return (
            <View key={idx} style={styles.comparisonContainer}>
              {/* Old Way */}
              <View style={[styles.comparisonBox, { borderColor: content.old.color + '40' }]}>
                <View style={[styles.comparisonHeader, { backgroundColor: content.old.color + '20' }]}>
                  <X size={16} color={content.old.color} />
                  <Text style={[styles.comparisonTitle, { color: content.old.color }]}>
                    {content.old.title}
                  </Text>
                </View>
                {content.old.points.map((point, i) => (
                  <View key={i} style={styles.comparisonPoint}>
                    <View style={[styles.pointDot, { backgroundColor: content.old.color }]} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>

              {/* New Way */}
              <View style={[styles.comparisonBox, { borderColor: content.new.color + '40' }]}>
                <View style={[styles.comparisonHeader, { backgroundColor: content.new.color + '20' }]}>
                  <CheckCircle size={16} color={content.new.color} />
                  <Text style={[styles.comparisonTitle, { color: content.new.color }]}>
                    {content.new.title}
                  </Text>
                </View>
                {content.new.points.map((point, i) => (
                  <View key={i} style={styles.comparisonPoint}>
                    <View style={[styles.pointDot, { backgroundColor: content.new.color }]} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          );

        case 'definition':
          return (
            <View key={idx} style={styles.definitionContainer}>
              {content.items.map((item, i) => (
                <View key={i} style={styles.definitionItem}>
                  <View style={[styles.definitionIcon, { backgroundColor: item.iconColor + '20' }]}>
                    <item.icon size={24} color={item.iconColor} />
                  </View>
                  <View style={styles.definitionContent}>
                    <Text style={styles.definitionTitle}>{item.title}</Text>
                    <Text style={styles.definitionDesc}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          );

        case 'zone_explain':
          return (
            <View key={idx} style={styles.zoneExplainContainer}>
              {/* Zone Info Header */}
              <View style={styles.zoneInfoRow}>
                <Text style={styles.zoneInfoLabel}>Hướng giá:</Text>
                <Text style={styles.zoneInfoValue}>{content.direction}</Text>
              </View>
              <View style={styles.zoneInfoRow}>
                <Text style={styles.zoneInfoLabel}>Xu hướng:</Text>
                <Text style={[styles.zoneInfoValue, { color: content.color }]}>
                  {content.bias}
                </Text>
              </View>

              {/* Visual Zone */}
              <View style={styles.zoneVisual}>
                <View style={[styles.zoneVisualBox, { borderColor: content.color }]}>
                  <Text style={[styles.zoneVisualLabel, styles.zoneVisualTop]}>
                    {content.visual.topLabel}
                  </Text>
                  <View style={[styles.zoneVisualFill, { backgroundColor: content.color + '30' }]} />
                  <Text style={[styles.zoneVisualLabel, styles.zoneVisualBottom]}>
                    {content.visual.bottomLabel}
                  </Text>
                </View>
                {content.visual.arrow === 'up' ? (
                  <TrendingUp size={32} color={COLORS.textMuted} style={styles.zoneVisualArrow} />
                ) : (
                  <TrendingDown size={32} color={COLORS.textMuted} style={styles.zoneVisualArrow} />
                )}
              </View>

              {/* Rules */}
              <View style={styles.rulesContainer}>
                {content.rules.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <View style={[styles.ruleLabelBadge, {
                      backgroundColor: rule.label === 'Entry' ? COLORS.gold + '20' : COLORS.textSecondary + '20'
                    }]}>
                      <Text style={[styles.ruleLabelText, {
                        color: rule.label === 'Entry' ? COLORS.gold : COLORS.textSecondary
                      }]}>
                        {rule.label}
                      </Text>
                    </View>
                    <View style={styles.ruleContent}>
                      <Text style={styles.ruleValue}>{rule.value}</Text>
                      <Text style={styles.ruleDesc}>{rule.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );

        case 'strength_ranking':
          return (
            <View key={idx} style={styles.strengthContainer}>
              {content.items.map((item, i) => (
                <View key={i} style={[styles.strengthItem, { borderLeftColor: item.color }]}>
                  <View style={styles.strengthHeader}>
                    <View style={styles.strengthPatterns}>
                      {item.patterns.map((p, pi) => (
                        <View key={pi} style={[styles.patternBadge, { backgroundColor: item.color + '20' }]}>
                          <Text style={[styles.patternBadgeText, { color: item.color }]}>{p}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.strengthStars}>
                      {Array.from({ length: item.stars }).map((_, si) => (
                        <Text key={si} style={styles.starEmoji}>⭐</Text>
                      ))}
                    </View>
                  </View>
                  <View style={styles.strengthMeta}>
                    <Text style={styles.strengthContext}>{item.context}</Text>
                    <Text style={styles.strengthDot}>•</Text>
                    <Text style={styles.strengthWinRate}>{item.winRate}</Text>
                  </View>
                  <Text style={styles.strengthDesc}>{item.description}</Text>
                </View>
              ))}
            </View>
          );

        default:
          return null;
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    i === currentStep && styles.stepDotActive,
                    i < currentStep && styles.stepDotCompleted,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentInner}
            showsVerticalScrollIndicator={false}
          >
            {/* Step Header */}
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconContainer, { backgroundColor: step.iconColor + '20' }]}>
                <StepIcon size={32} color={step.iconColor} />
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            </View>

            {/* Step Content */}
            {renderContent()}

            {/* Tip */}
            <View style={styles.tipContainer}>
              <AlertTriangle size={16} color={COLORS.warning} />
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handlePrev}
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={20} color={currentStep === 0 ? COLORS.textMuted : COLORS.textPrimary} />
              <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                Trước
              </Text>
            </TouchableOpacity>

            <Text style={styles.stepCounter}>
              {currentStep + 1} / {STEPS.length}
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navButton, styles.navButtonPrimary]}
            >
              <Text style={styles.navButtonTextPrimary}>
                {currentStep === STEPS.length - 1 ? 'Hoàn tất' : 'Tiếp'}
              </Text>
              <ChevronRight size={20} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Helper to check if onboarding should be shown
export const checkShouldShowZoneOnboarding = async () => {
  try {
    const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
    return seen !== 'true';
  } catch {
    return true;
  }
};

// Helper to reset onboarding (for testing)
export const resetZoneOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.warn('[ZoneOnboarding] Error resetting:', error);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted + '40',
  },
  stepDotActive: {
    backgroundColor: COLORS.gold,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },

  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xxs,
  },

  // Comparison styles
  comparisonContainer: {
    gap: SPACING.md,
  },
  comparisonBox: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  comparisonTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  comparisonPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pointText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Definition styles
  definitionContainer: {
    gap: SPACING.md,
  },
  definitionItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  definitionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  definitionContent: {
    flex: 1,
  },
  definitionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  definitionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Zone explain styles
  zoneExplainContainer: {
    gap: SPACING.md,
  },
  zoneInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textMuted + '20',
  },
  zoneInfoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  zoneInfoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  zoneVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.md,
  },
  zoneVisualBox: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  zoneVisualFill: {
    ...StyleSheet.absoluteFillObject,
  },
  zoneVisualLabel: {
    position: 'absolute',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
  },
  zoneVisualTop: {
    top: -10,
    left: 4,
  },
  zoneVisualBottom: {
    bottom: -10,
    left: 4,
  },
  zoneVisualArrow: {
    opacity: 0.5,
  },
  rulesContainer: {
    gap: SPACING.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  ruleLabelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  ruleLabelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  ruleContent: {
    flex: 1,
  },
  ruleValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  ruleDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Strength styles
  strengthContainer: {
    gap: SPACING.sm,
  },
  strengthItem: {
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  strengthPatterns: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  patternBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  patternBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  strengthStars: {
    flexDirection: 'row',
  },
  starEmoji: {
    fontSize: 12,
  },
  strengthMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  strengthContext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  strengthDot: {
    color: COLORS.textMuted,
  },
  strengthWinRate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  strengthDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Tip styles
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.md,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Footer styles
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.textMuted + '20',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.gold,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  navButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  navButtonTextPrimary: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  stepCounter: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

ZoneConceptOnboarding.displayName = 'ZoneConceptOnboarding';

export default ZoneConceptOnboarding;
