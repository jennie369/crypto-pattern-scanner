/**
 * GEM Scanner - Onboarding Modal Component
 * 5-step carousel onboarding for Paper Trade
 */

import React, { memo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { ONBOARDING_STEPS, getTotalSteps } from '../../constants/onboardingSteps';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const OnboardingModal = ({
  visible = false,
  onComplete,
  onSkip,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const totalSteps = getTotalSteps();

  // Handle step navigation
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
      flatListRef.current?.scrollToIndex({ index: stepIndex, animated: true });
    }
  }, [totalSteps]);

  // Handle next
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      // Last step - complete onboarding
      onComplete?.();
    }
  }, [currentStep, totalSteps, goToStep, onComplete]);

  // Handle previous
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Handle skip
  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  // Handle scroll end
  const onScrollEnd = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / CARD_WIDTH);
    if (newIndex !== currentStep && newIndex >= 0 && newIndex < totalSteps) {
      setCurrentStep(newIndex);
    }
  }, [currentStep, totalSteps]);

  // Render step card
  const renderStepCard = useCallback(({ item: step, index }) => {
    const IconComponent = step.icon;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${step.iconColor}20` }]}>
            <IconComponent size={40} color={step.iconColor} />
          </View>

          {/* Step indicator */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Bước {step.stepNumber}/{totalSteps}
            </Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Features */}
          {step.features && step.features.length > 0 && (
            <View style={styles.featuresList}>
              {step.features.map((feature, fIndex) => (
                <View key={fIndex} style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Warning */}
          {step.warning && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={16} color={COLORS.warning} />
              <Text style={styles.warningText}>{step.warning}</Text>
            </View>
          )}

          {/* Tip */}
          {step.tip && (
            <View style={styles.tipContainer}>
              <Lightbulb size={16} color={COLORS.gold} />
              <Text style={styles.tipText}>{step.tip}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [totalSteps]);

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_STEPS}
          renderItem={renderStepCard}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
        />

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_STEPS.map((_, index) => {
            const inputRange = [
              (index - 1) * CARD_WIDTH,
              index * CARD_WIDTH,
              (index + 1) * CARD_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: index === currentStep ? COLORS.gold : COLORS.textMuted,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationRow}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonHidden]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={COLORS.textSecondary} />
            <Text style={styles.navButtonText}>Trước</Text>
          </TouchableOpacity>

          {/* Next/Complete Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaText}>
              {currentStepData?.ctaText || 'Tiếp theo'}
            </Text>
            {currentStep < totalSteps - 1 && (
              <ChevronRight size={20} color="#000" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  // Carousel
  carouselContent: {
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  // Icon
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  // Step Badge
  stepBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  // Title & Subtitle
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  // Description
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  // Features
  featuresList: {
    marginTop: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  // Warning
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 10,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.2)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.warning,
  },
  // Tip
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: SPACING.md,
    borderRadius: 10,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  // Progress Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  // Navigation
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    paddingBottom: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  navButtonHidden: {
    opacity: 0,
  },
  navButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    minWidth: 160,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});

export default memo(OnboardingModal);
