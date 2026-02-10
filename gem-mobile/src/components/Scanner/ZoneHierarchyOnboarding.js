/**
 * GEM Mobile - Zone Hierarchy Onboarding Modal
 * 5-step educational walkthrough for zone hierarchy system
 *
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Crown,
  Target,
  Flag,
  Circle,
  Layers,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Award,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../../contexts/SettingsContext';
import { ZONE_HIERARCHY } from '../../constants/zoneHierarchyConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Storage key
const ONBOARDING_KEY = '@gem_zone_hierarchy_onboarding';

/**
 * Check if onboarding should be shown
 */
export const shouldShowZoneHierarchyOnboarding = async () => {
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
export const resetZoneHierarchyOnboarding = async () => {
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
const Slide = ({ slide, colors, SPACING }) => {
  const IconComponent = slide.icon;

  // Get stars count for current slide
  const getStarsCount = () => {
    switch (slide.id) {
      case 'dp': return 5;
      case 'ftr': return 4;
      case 'fl': return 3;
      case 'regular': return 2;
      default: return 0;
    }
  };

  const starsCount = getStarsCount();

  const styles = useMemo(() => StyleSheet.create({
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
      marginBottom: SPACING.sm,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: SPACING.sm,
    },
    slideTitle: {
      color: colors.text,
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
      color: colors.text,
      fontSize: 13,
      flex: 1,
      lineHeight: 18,
    },
    tipContainer: {
      width: '100%',
      borderLeftWidth: 3,
      paddingLeft: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontStyle: 'italic',
    },
  }), [colors, SPACING]);

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
      {/* Icon with stars */}
      <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
        <IconComponent
          size={48}
          color={slide.color}
          fill={slide.id === 'dp' ? slide.color : 'transparent'}
        />
      </View>

      {/* Stars */}
      {starsCount > 0 && (
        <View style={styles.starsContainer}>
          {[...Array(starsCount)].map((_, i) => (
            <Star key={i} size={16} color={slide.color} fill={slide.color} />
          ))}
        </View>
      )}

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
const ZoneHierarchyOnboarding = ({
  visible,
  onComplete,
  onSkip,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Onboarding slides with dynamic colors
  const SLIDES = useMemo(() => [
    {
      id: 'intro',
      title: 'Thứ Bậc Zone',
      subtitle: 'Không phải zone nào cũng như nhau!',
      icon: Layers,
      color: colors.primary || '#FFBD59',
      content: [
        'GEM phân loại zones theo thứ bậc từ mạnh đến yếu',
        'Zone mạnh hơn = Xác suất thành công cao hơn',
        'Ưu tiên trade zone cao cấp trước',
      ],
      tip: 'Trade smart, không phải trade nhiều!',
    },
    {
      id: 'dp',
      title: 'Decision Point (DP)',
      subtitle: '⭐⭐⭐⭐⭐ - Zone mạnh nhất',
      icon: Crown,
      color: ZONE_HIERARCHY.DECISION_POINT.color,
      content: [
        'Origin của major move (>3%)',
        'Nơi Smart Money ra quyết định quan trọng',
        'Move từ DP phải impulsive (mạnh, nhanh)',
        'Đây là zone bạn MUỐN trade',
      ],
      tip: 'DP có win rate cao nhất - ưu tiên số 1!',
    },
    {
      id: 'ftr',
      title: 'Fail To Return (FTR)',
      subtitle: '⭐⭐⭐⭐ - Trend confirmation',
      icon: Target,
      color: ZONE_HIERARCHY.FTR.color,
      content: [
        'Zone sau khi phá S/R thành công',
        'Price không quay lại được vùng cũ',
        'Smart Money đang add positions',
        'Xác nhận trend continuation',
      ],
      tip: 'FTR = Smart Money đã commit với direction',
    },
    {
      id: 'fl',
      title: 'Flag Limit (FL)',
      subtitle: '⭐⭐⭐ - Quick continuation',
      icon: Flag,
      color: ZONE_HIERARCHY.FLAG_LIMIT.color,
      content: [
        'Zone trong trend với base chỉ 1-2 nến',
        'Pause ngắn trong impulsive move',
        'Khi FL bị engulf = Price đến FL tiếp',
        'Pattern: UPU (bullish) hoặc DPD (bearish)',
      ],
      tip: 'FL giúp đặt limit orders chính xác trong trend',
    },
    {
      id: 'regular',
      title: 'Regular Zone',
      subtitle: '⭐⭐ - Cần thêm confluence',
      icon: Circle,
      color: ZONE_HIERARCHY.REGULAR.color,
      content: [
        'Zone thông thường, không có đặc điểm đặc biệt',
        'Cần confluence: HTF alignment, FTB, high odds score',
        'Trade với size nhỏ hơn',
        'Skip nếu có zone cao cấp hơn available',
      ],
      tip: 'Regular zones chỉ trade khi không có lựa chọn tốt hơn',
    },
  ], [colors]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 24,
      padding: SPACING.lg,
      width: '100%',
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    stepText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    skipButton: {
      padding: 8,
      margin: -8,
    },
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
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 24,
    },
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
      color: colors.text,
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
      borderRadius: 12,
    },
    nextButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
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
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Slide content */}
          <Slide slide={currentSlide} colors={colors} SPACING={SPACING} />

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
                <ChevronLeft size={20} color={colors.text} />
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
              {!isLastSlide && <ChevronRight size={20} color="#FFFFFF" />}
              {isLastSlide && <Award size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          {/* Reward hint */}
          {isLastSlide && (
            <View style={styles.rewardHint}>
              <Star size={14} color="#FFBD59" fill="#FFBD59" />
              <Text style={styles.rewardText}>+30 GEM khi hoàn thành!</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default ZoneHierarchyOnboarding;
