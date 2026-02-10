/**
 * ShopOnboarding.js - Shop Onboarding Component
 * Multi-step onboarding overlay for Shop features
 * Guides users through key features on first visit
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  Grid,
  Zap,
  Heart,
  Clock,
  CheckCircle,
  ChevronRight,
  X,
} from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import shopOnboardingService, { SHOP_ONBOARDING_STEPS } from '../../services/shopOnboardingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const ICON_MAP = {
  sparkles: Sparkles,
  grid: Grid,
  zap: Zap,
  heart: Heart,
  clock: Clock,
  'check-circle': CheckCircle,
};

const ShopOnboarding = ({ visible, onComplete, onSkip }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  // Load current step on mount
  useEffect(() => {
    const loadProgress = async () => {
      const stepIndex = await shopOnboardingService.getCurrentStepIndex();
      setCurrentStep(stepIndex);
      setIsLoading(false);
    };

    if (visible) {
      loadProgress();
    }
  }, [visible]);

  // Animate on visibility change
  useEffect(() => {
    if (visible && !isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate progress
      animateProgress();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, isLoading, currentStep]);

  // Animate progress bar
  const animateProgress = useCallback(() => {
    const progress = (currentStep + 1) / SHOP_ONBOARDING_STEPS.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

  // Handle next step
  const handleNext = async () => {
    const step = SHOP_ONBOARDING_STEPS[currentStep];
    await shopOnboardingService.markStepComplete(step.key);

    if (currentStep >= SHOP_ONBOARDING_STEPS.length - 1) {
      // Last step - complete onboarding
      await shopOnboardingService.completeOnboarding();
      onComplete?.();
    } else {
      // Move to next step
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle skip
  const handleSkip = async () => {
    await shopOnboardingService.skipOnboarding();
    onSkip?.();
  };

  // Get current step data
  const step = SHOP_ONBOARDING_STEPS[currentStep] || SHOP_ONBOARDING_STEPS[0];
  const IconComponent = ICON_MAP[step.icon] || Sparkles;
  const isLastStep = currentStep >= SHOP_ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
    },
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 24,
      padding: SPACING.xl,
      width: '100%',
      maxWidth: SCREEN_WIDTH - 48,
      ...(glass || {}),
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
    },
    skipButton: {
      position: 'absolute',
      top: SPACING.md,
      right: SPACING.md,
      padding: 8,
      zIndex: 10,
    },
    progressContainer: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      marginBottom: SPACING.lg,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.gold,
      borderRadius: 2,
    },
    stepIndicator: {
      alignSelf: 'center',
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 12,
      marginBottom: SPACING.lg,
    },
    stepText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.gold,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(255, 189, 89, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: SPACING.xl,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: SPACING.xl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.gold,
    },
    dotCompleted: {
      backgroundColor: 'rgba(255, 189, 89, 0.5)',
    },
    actions: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textMuted,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: 14,
      backgroundColor: colors.gold,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    primaryButtonFull: {
      flex: 1,
    },
    primaryButtonText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.bgDarkest,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!visible || isLoading) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Skip button (not on last step) */}
            {!isLastStep && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {currentStep + 1} / {SHOP_ONBOARDING_STEPS.length}
              </Text>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <IconComponent size={48} color={colors.gold} strokeWidth={1.5} />
            </View>

            {/* Content */}
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            {/* Dots indicator */}
            <View style={styles.dotsContainer}>
              {SHOP_ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                    index < currentStep && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {!isFirstStep && !isLastStep && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.secondaryButtonText}>Bỏ qua</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isLastStep && styles.primaryButtonFull,
                ]}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? 'Bắt đầu mua sắm' : 'Tiếp tục'}
                </Text>
                {!isLastStep && <ChevronRight size={18} color={colors.bgDarkest} />}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default ShopOnboarding;
