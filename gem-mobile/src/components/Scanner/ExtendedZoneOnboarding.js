/**
 * GEM Mobile - Extended Zone + MPL Onboarding Component
 * Phase 3B: 3-step onboarding for Extended Zones, MPL, and Pin+Engulf Combo
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
  Maximize2,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart2,
  Sparkles,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = 'extended_zones_mpl_onboarding_completed';

/**
 * Onboarding slides content
 */
const SLIDES = [
  {
    id: 'extended_zones',
    icon: Maximize2,
    iconColor: COLORS.warning,
    title: 'Extended Zones',
    titleVi: 'Zone Mở Rộng',
    description: 'Khi giá tạo new high/low trong zone, biên của zone tự động mở rộng để bao gồm extreme mới.',
    features: [
      {
        icon: TrendingUp,
        text: 'HFZ mở rộng khi có new high',
        color: COLORS.error,
      },
      {
        icon: TrendingDown,
        text: 'LFZ mở rộng khi có new low',
        color: COLORS.success,
      },
      {
        icon: AlertCircle,
        text: 'Stop loss di chuyển theo biên mới',
        color: COLORS.warning,
      },
    ],
    tip: 'Entry price giữ nguyên, chỉ stop loss thay đổi',
  },
  {
    id: 'mpl',
    icon: Target,
    iconColor: COLORS.gold,
    title: 'MPL - Most Penetrated Level',
    titleVi: 'Mức Xuyên Thủng Nhiều Nhất',
    description: 'MPL là mức giá trong zone có nhiều wick xuyên qua nhất - nơi Smart Money đặt nhiều lệnh nhất.',
    features: [
      {
        icon: BarChart2,
        text: 'Tìm mức giá có nhiều penetration nhất',
        color: COLORS.gold,
      },
      {
        icon: Target,
        text: 'Entry tại MPL = stop loss chặt hơn',
        color: COLORS.success,
      },
      {
        icon: TrendingUp,
        text: 'Cải thiện R:R đáng kể',
        color: COLORS.primary,
      },
    ],
    tip: 'MPL xuất sắc có 5+ penetrations',
  },
  {
    id: 'pin_engulf_combo',
    icon: Zap,
    iconColor: COLORS.success,
    title: 'Pin + Engulf Combo',
    titleVi: 'Combo Siêu Mạnh',
    description: 'Khi Pin Bar và Engulfing xuất hiện cùng nhau tại zone = signal xác nhận cực mạnh với độ tin cậy 85%+.',
    features: [
      {
        icon: Sparkles,
        text: 'Pin → Engulf: 85% reliability',
        color: COLORS.gold,
      },
      {
        icon: Zap,
        text: 'Pin + Engulf cùng nến: 90% reliability',
        color: COLORS.success,
      },
      {
        icon: Check,
        text: 'A+ Entry với stop chặt',
        color: COLORS.primary,
      },
    ],
    tip: 'Ưu tiên combo hơn single pattern',
  },
];

/**
 * Main ExtendedZoneOnboarding component
 */
const ExtendedZoneOnboarding = ({ visible, onComplete, onSkip }) => {
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
                {isLastSlide ? 'Hoàn tất' : 'Tiếp theo'}
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
            <Text style={styles.rewardText}>+50 GEM khi hoàn thành</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Check if onboarding should be shown
 */
export const shouldShowExtendedZoneOnboarding = async () => {
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
export const resetExtendedZoneOnboarding = async () => {
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

ExtendedZoneOnboarding.displayName = 'ExtendedZoneOnboarding';

export default ExtendedZoneOnboarding;
