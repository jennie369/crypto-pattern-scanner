/**
 * GEM Mobile - Odds Enhancers Onboarding Modal
 * 5-step educational walkthrough for odds enhancers scoring system
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
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
  Zap,
  Clock,
  Star,
  TrendingUp,
  Globe,
  Layers,
  FastForward,
  Scale,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../utils/tokens';
import { GRADE_THRESHOLDS } from '../../constants/oddsEnhancersConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Storage key
const ONBOARDING_KEY = '@gem_odds_enhancers_onboarding';

// Onboarding slides
const SLIDES = [
  {
    id: 'welcome',
    title: 'Odds Enhancers',
    subtitle: 'Tăng win rate 10-12%',
    icon: Award,
    color: '#FFBD59',
    content: [
      '8 tiêu chí chấm điểm chất lượng zone',
      'Tổng điểm 0-16, grade A+ đến F',
      'Dựa trên RTM methodology đã chứng minh',
    ],
    tip: 'Zone grade A+ có win rate cao hơn 15% so với zone thường',
  },
  {
    id: 'criteria',
    title: '8 Tiêu Chí',
    subtitle: 'Mỗi tiêu chí 0-2 điểm',
    icon: Star,
    color: '#22C55E',
    content: [
      'Sức mạnh thoát ly (Departure Strength)',
      'Thời gian tại vùng (Time at Level)',
      'Độ tươi mới (Freshness)',
      'Biên lợi nhuận (Profit Margin)',
    ],
    tip: 'Tap vào mỗi tiêu chí để xem chi tiết cách tính điểm',
  },
  {
    id: 'criteria2',
    title: '8 Tiêu Chí (tiếp)',
    subtitle: 'Mỗi tiêu chí 0-2 điểm',
    icon: Target,
    color: '#3B82F6',
    content: [
      'Xu hướng lớn (Big Picture)',
      'Nguồn gốc zone (Zone Origin)',
      'Tốc độ tiếp cận (Arrival Speed)',
      'Tỷ lệ R:R (Risk/Reward)',
    ],
    tip: 'Các tiêu chí được tính tự động dựa trên data chart',
  },
  {
    id: 'grades',
    title: 'Hệ Thống Grade',
    subtitle: 'Từ A+ xuống F',
    icon: Layers,
    color: '#8B5CF6',
    content: [
      'A+ (14-16): Full size position - Xuất sắc',
      'A (12-13): 75% size - Tốt',
      'B (10-11): 50% size - Khá',
      'C (8-9): 25% size - Cần confluence',
      'D-F (<8): SKIP - Không trade',
    ],
    tip: 'Chỉ trade zone C+ trở lên để đảm bảo tỷ lệ thắng cao',
  },
  {
    id: 'freshness',
    title: 'Zone Freshness',
    subtitle: 'FTB = First Time Back',
    icon: Sparkles,
    color: '#EF4444',
    content: [
      'Mỗi test, ~35% orders bị fill',
      'FTB (0 test): 100% orders - Tốt nhất',
      '1-2 test: 42-65% orders - OK',
      '3+ test: <30% orders - Stale, SKIP',
    ],
    tip: 'Ưu tiên FTB zones! Zone stale có win rate thấp hơn 20%',
  },
];

/**
 * Check if onboarding should be shown
 */
export const shouldShowOddsEnhancersOnboarding = async () => {
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
export const resetOddsEnhancersOnboarding = async () => {
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
const Slide = ({ slide, index, currentIndex }) => {
  const IconComponent = slide.icon;
  const isActive = index === currentIndex;

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
        <IconComponent size={48} color={slide.color} />
      </View>

      {/* Title */}
      <Text style={styles.slideTitle}>{slide.title}</Text>
      <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

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
const OddsEnhancersOnboarding = ({
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
          <Slide
            slide={currentSlide}
            index={currentIndex}
            currentIndex={currentIndex}
          />

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && [styles.dotActive, { backgroundColor: currentSlide.color }],
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.footer}>
            {currentIndex > 0 ? (
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <ChevronLeft size={20} color={COLORS.text} />
                <Text style={styles.navButtonText}>Trước</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: currentSlide.color }]}
            >
              <Text style={styles.nextButtonText}>
                {isLastSlide ? 'Bắt đầu' : 'Tiếp'}
              </Text>
              {!isLastSlide && <ChevronRight size={20} color="#FFFFFF" />}
              {isLastSlide && <Award size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          {/* Reward hint */}
          {isLastSlide && (
            <View style={styles.rewardHint}>
              <Sparkles size={14} color="#FFBD59" />
              <Text style={styles.rewardText}>+25 GEM khi hoàn thành!</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  slideTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  slideSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.lg,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.border,
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
    color: COLORS.text,
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
    color: '#FFFFFF',
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
    color: '#FFBD59',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default OddsEnhancersOnboarding;
