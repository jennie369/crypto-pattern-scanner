/**
 * GEM Mobile - Alert System Onboarding Component
 * Phase 3C: 4-step onboarding for Smart Alerts
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Bell,
  Star,
  CheckCircle,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Target,
  AlertTriangle,
  Zap,
  Sparkles,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = 'alerts_onboarding_completed';

/**
 * Onboarding slides content
 */
const SLIDES = [
  {
    id: 'alerts_intro',
    icon: Bell,
    iconColor: COLORS.gold,
    title: 'Smart Alerts',
    titleVi: 'Cảnh Báo Thông Minh',
    description: 'Không bao giờ miss entry nữa!\n\nGEM Scanner sẽ alert bạn khi:\n• Price đến zone (FTB)\n• Có confirmation pattern\n• Zone bị phá vỡ',
    features: [
      {
        icon: Star,
        text: 'FTB Alerts - Entry tốt nhất',
        color: COLORS.gold,
      },
      {
        icon: CheckCircle,
        text: 'Confirmation Alerts',
        color: COLORS.success,
      },
      {
        icon: AlertTriangle,
        text: 'Zone Broken Alerts',
        color: COLORS.error,
      },
    ],
    tip: 'Setup alert và để GEM làm việc cho bạn',
  },
  {
    id: 'ftb_alert',
    icon: Star,
    iconColor: COLORS.gold,
    title: 'FTB Alerts',
    titleVi: 'Alert Quan Trọng Nhất',
    description: 'Khi price quay lại zone LẦN ĐẦU = FTB\n→ Entry TỐT NHẤT\n→ Alert ngay lập tức',
    features: [
      {
        icon: Star,
        text: 'Priority cao nhất',
        color: COLORS.gold,
      },
      {
        icon: Target,
        text: 'Alert khi price đến gần',
        color: COLORS.warning,
      },
      {
        icon: Zap,
        text: 'Alert khi price trong zone',
        color: COLORS.success,
      },
    ],
    tip: 'FTB + Confirmation = A+ Entry',
  },
  {
    id: 'confirmation_alert',
    icon: CheckCircle,
    iconColor: COLORS.success,
    title: 'Confirmation Alerts',
    titleVi: 'Alert Xác Nhận',
    description: 'Khi có confirmation pattern tại zone:\n\n✓ Engulfing\n✓ Pin Bar\n✓ Pin + Engulf Combo\n\n→ Alert với suggested action!',
    features: [
      {
        icon: CheckCircle,
        text: 'Pattern score hiển thị',
        color: COLORS.success,
      },
      {
        icon: Zap,
        text: 'Combo = Alert priority cao',
        color: COLORS.gold,
      },
      {
        icon: Target,
        text: 'Suggested BUY/SELL',
        color: COLORS.primary,
      },
    ],
    tip: 'Score 5+ = Highly actionable',
  },
  {
    id: 'settings',
    icon: Settings,
    iconColor: COLORS.textSecondary,
    title: 'Alert Settings',
    titleVi: 'Tùy Chỉnh Alerts',
    description: 'Customize theo ý bạn:\n\n• Chọn loại alert muốn nhận\n• Set quiet hours\n• Min Odds Score để alert\n• Tạo price level alerts',
    features: [
      {
        icon: Bell,
        text: 'Bật/tắt từng loại alert',
        color: COLORS.textSecondary,
      },
      {
        icon: Target,
        text: 'Set distance threshold',
        color: COLORS.primary,
      },
      {
        icon: Star,
        text: 'Min score để nhận alert',
        color: COLORS.gold,
      },
    ],
    tip: 'Chỉ nhận alerts bạn cần',
  },
];

/**
 * Main AlertOnboarding component
 */
const AlertOnboarding = ({ visible, onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  }, [currentSlide]);

  const handlePrevious = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
    onSkip?.();
  }, [onSkip]);

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {currentSlide + 1} / {SLIDES.length}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: slide.iconColor + '20' }]}>
              <IconComponent size={48} color={slide.iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.titleVi}>{slide.titleVi}</Text>

            {/* Description */}
            <Text style={styles.description}>{slide.description}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {slide.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <View key={index} style={styles.featureRow}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                      <FeatureIcon size={16} color={feature.color} />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                );
              })}
            </View>

            {/* Tip */}
            <View style={styles.tipContainer}>
              <Sparkles size={14} color={COLORS.gold} />
              <Text style={styles.tipText}>{slide.tip}</Text>
            </View>
          </ScrollView>

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentSlide > 0 ? (
              <TouchableOpacity
                onPress={handlePrevious}
                style={styles.navButtonSecondary}
              >
                <ArrowLeft size={18} color={COLORS.textPrimary} />
                <Text style={styles.navButtonSecondaryText}>Trước</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={styles.navButtonPrimary}
            >
              <Text style={styles.navButtonPrimaryText}>
                {isLastSlide ? 'Bắt đầu' : 'Tiếp theo'}
              </Text>
              {isLastSlide ? (
                <Check size={18} color={COLORS.bgDarkest} />
              ) : (
                <ArrowRight size={18} color={COLORS.bgDarkest} />
              )}
            </TouchableOpacity>
          </View>

          {/* Reward indicator */}
          <View style={styles.rewardContainer}>
            <Sparkles size={12} color={COLORS.gold} />
            <Text style={styles.rewardText}>+30 GEM khi hoàn thành</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Check if onboarding should be shown
 */
export const shouldShowAlertOnboarding = async () => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
    return completed !== 'true';
  } catch (error) {
    console.warn('Failed to check onboarding state:', error);
    return true;
  }
};

/**
 * Reset onboarding state (for testing)
 */
export const resetAlertOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to reset onboarding state:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: SPACING.lg,
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
  stepIndicator: {
    backgroundColor: COLORS.bgDarkest,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipButton: {
    padding: SPACING.xs,
  },

  // Content
  content: {
    flexGrow: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  titleVi: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Features
  featuresContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },

  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gold + '15',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.gold,
    flex: 1,
  },

  // Progress dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgDarkest,
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 24,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  navButtonPlaceholder: {
    flex: 1,
  },
  navButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
  },
  navButtonSecondaryText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  navButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
  },
  navButtonPrimaryText: {
    fontSize: 14,
    color: COLORS.bgDarkest,
    fontWeight: '700',
  },

  // Reward
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rewardText: {
    fontSize: 12,
    color: COLORS.gold,
  },
});

AlertOnboarding.displayName = 'AlertOnboarding';

export default AlertOnboarding;
