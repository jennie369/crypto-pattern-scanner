/**
 * GEM Mobile - Confirmation Patterns Onboarding Modal
 * Phase 3A: 4-step educational walkthrough for candlestick confirmation patterns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Check,
  TrendingUp,
  ArrowUp,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  X,
  Award,
  Star,
  Maximize2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Storage key
const ONBOARDING_KEY = '@gem_confirmation_patterns_onboarding';

// Onboarding slides
const SLIDES = [
  {
    id: 'confirmation_intro',
    title: 'Confirmation Patterns',
    subtitle: 'Entry chính xác hơn!',
    icon: Check,
    color: COLORS.gold,
    content: [
      'Sau khi price vào zone, chờ CONFIRMATION trước khi entry',
      'Confirmation = Nến cho thấy price sẽ reverse',
      'Không có confirmation = Không entry!',
      'Giảm false entries, tăng win rate.',
    ],
    tip: 'Zone + Confirmation = High probability trade.',
  },
  {
    id: 'engulfing',
    title: 'Engulfing Pattern',
    subtitle: 'Nuốt chửng đối phương!',
    icon: Maximize2,
    color: COLORS.success,
    content: [
      'Nến hiện tại "nuốt trọn" body nến trước đó',
      'Bullish Engulfing = BUY signal (3-4 điểm)',
      'Bearish Engulfing = SELL signal (3-4 điểm)',
      'Engulfing càng lớn = Signal càng mạnh!',
    ],
    tip: 'Entry tại close của engulfing candle. Stop dưới/trên low/high.',
  },
  {
    id: 'pin_bar',
    title: 'Pin Bar / Rejection',
    subtitle: 'Rejection mạnh mẽ!',
    icon: ArrowUp,
    color: COLORS.gold,
    content: [
      'Nến có râu dài, body nhỏ (< 35% range)',
      'Râu dưới dài = Rejection từ dưới = BUY',
      'Râu trên dài = Rejection từ trên = SELL',
      'Hammer (sau downtrend) / Shooting Star (sau uptrend)',
    ],
    tip: 'Râu càng dài so với body = Rejection càng mạnh.',
  },
  {
    id: 'scoring',
    title: 'Confirmation Score',
    subtitle: 'Chấm điểm để quyết định!',
    icon: BarChart2,
    color: COLORS.success,
    content: [
      'Engulfing / Morning Star / Evening Star: 3-4 điểm',
      'Pin Bar / Hammer / Shooting Star: 2-3 điểm',
      'Inside Bar / Doji: 1 điểm',
      'Score >= 3 = Entry với confidence cao!',
    ],
    tip: 'Strong (≥5): Full size. Moderate (3-4): 75%. Weak (1-2): Skip hoặc 50%.',
  },
];

/**
 * Check if onboarding should be shown
 */
export const shouldShowConfirmationOnboarding = async () => {
  try {
    const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
    return !seen;
  } catch {
    return true;
  }
};

/**
 * Reset onboarding (for testing)
 */
export const resetConfirmationOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

/**
 * Mark onboarding as completed
 */
const markOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
};

/**
 * Single slide component
 */
const Slide = ({ slide }) => {
  const IconComponent = slide.icon;

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
        <IconComponent
          size={48}
          color={slide.color}
        />
      </View>

      {/* Title */}
      <Text style={styles.slideTitle}>{slide.title}</Text>
      <Text style={[styles.slideSubtitle, { color: slide.color }]}>
        {slide.subtitle}
      </Text>

      {/* Content */}
      <View style={styles.contentList}>
        {slide.content.map((item, i) => (
          <View key={i} style={styles.contentItem}>
            <Check size={16} color={slide.color} />
            <Text style={styles.contentText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Tip */}
      <View style={[styles.tipContainer, { borderLeftColor: slide.color }]}>
        <Text style={styles.tipText}>{slide.tip}</Text>
      </View>
    </View>
  );
};

/**
 * Main Onboarding Modal
 */
const ConfirmationOnboarding = ({
  visible,
  onComplete,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = async () => {
    await markOnboardingComplete();
    onComplete?.();
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    onSkip?.();
  };

  const currentSlide = SLIDES[currentIndex];
  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepText}>
              {currentIndex + 1} / {SLIDES.length}
            </Text>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Slide content */}
          <Slide slide={currentSlide} />

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((slide, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && [
                    styles.dotActive,
                    { backgroundColor: currentSlide.color },
                  ],
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.footer}>
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <ChevronLeft size={20} color={COLORS.textPrimary} />
                <Text style={styles.navButtonText}>Trước</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.nextButton,
                { backgroundColor: currentSlide.color },
              ]}
            >
              <Text style={styles.nextButtonText}>
                {isLastSlide ? 'Hoàn thành' : 'Tiếp'}
              </Text>
              {!isLastSlide && <ChevronRight size={20} color={COLORS.bgDarkest} />}
              {isLastSlide && <Award size={20} color={COLORS.bgDarkest} />}
            </TouchableOpacity>
          </View>

          {/* Reward hint */}
          {isLastSlide && (
            <View style={styles.rewardHint}>
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.rewardText}>+45 GEM khi hoàn thành!</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
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
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  skipButton: {
    padding: 8,
    margin: -8,
  },

  // Slide
  slide: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  slideTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  // Content list
  contentList: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  contentText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Tip
  tipContainer: {
    width: '100%',
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    width: 24,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  navButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  navButtonPlaceholder: {
    width: 80,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  nextButtonText: {
    color: COLORS.bgDarkest,
    fontSize: 14,
    fontWeight: '600',
  },

  // Reward hint
  rewardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  rewardText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '500',
  },
});

ConfirmationOnboarding.displayName = 'ConfirmationOnboarding';

export default ConfirmationOnboarding;
