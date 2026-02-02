/**
 * TemplateOnboarding.js
 * First-time user onboarding for templates feature
 *
 * Created: 2026-02-02
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BookOpen,
  Target,
  CheckSquare,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react-native';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  COSMIC_GRADIENTS,
} from '../../../theme/cosmicTokens';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STORAGE_KEY = 'gem_template_onboarding_completed';

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    icon: BookOpen,
    title: 'Templates - Mau co san',
    description: 'Templates giup ban tao nhat ky va muc tieu co cau truc, theo phuong phap da duoc chung minh hieu qua.',
    color: COSMIC_COLORS.glow.cyan,
  },
  {
    icon: Target,
    title: 'Tu Nhat Ky thanh Muc Tieu',
    description: 'Khi viet nhat ky, tick vao hanh dong ban muon theo doi. Moi hanh dong se tu dong tro thanh mot Goal trong Vision Board.',
    color: COSMIC_COLORS.glow.gold,
  },
  {
    icon: CheckSquare,
    title: 'Theo doi tien do',
    description: 'Goal se lien ket voi nhat ky goc. Ban co the theo doi tien do va xem lai ly do ban dat muc tieu.',
    color: COSMIC_COLORS.glow.green,
  },
];

/**
 * TemplateOnboarding Component
 * @param {boolean} visible - Control visibility externally
 * @param {function} onComplete - Callback when onboarding completes
 * @param {boolean} forceShow - Force show even if already completed
 */
const TemplateOnboarding = ({
  visible: externalVisible,
  onComplete,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Check if onboarding should show
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (forceShow) {
        setVisible(true);
        return;
      }

      if (externalVisible !== undefined) {
        setVisible(externalVisible);
        return;
      }

      try {
        const completed = await AsyncStorage.getItem(STORAGE_KEY);
        if (!completed) {
          setVisible(true);
        }
      } catch (error) {
        console.error('[TemplateOnboarding] Error checking status:', error);
      }
    };

    checkOnboardingStatus();
  }, [externalVisible, forceShow]);

  // Animate on visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Animate step change
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / ONBOARDING_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Reset slide for new step
    slideAnim.setValue(30);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, progressAnim, slideAnim]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  // Handle skip
  const handleSkip = () => {
    handleComplete();
  };

  // Handle complete
  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      console.error('[TemplateOnboarding] Error saving status:', error);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onComplete?.();
    });
  };

  if (!visible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Background Gradient */}
          <LinearGradient
            colors={COSMIC_GRADIENTS.nebulaBg}
            style={styles.gradientBg}
          />

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <X size={22} color={COSMIC_COLORS.text.muted} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: step.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1}/{ONBOARDING_STEPS.length}
            </Text>
          </View>

          {/* Step Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: step.color + '20' },
              ]}
            >
              <IconComponent size={48} color={step.color} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStep && [
                    styles.stepDotActive,
                    { backgroundColor: step.color },
                  ],
                  index < currentStep && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: step.color }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {isLastStep ? 'Bat dau' : 'Tiep theo'}
            </Text>
            {isLastStep ? (
              <Sparkles size={18} color={COSMIC_COLORS.bgDeepSpace} />
            ) : (
              <ArrowRight size={18} color={COSMIC_COLORS.bgDeepSpace} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

/**
 * Hook to check if onboarding has been completed
 */
export const useTemplateOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(STORAGE_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('[useTemplateOnboarding] Error:', error);
        setHasCompletedOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('[useTemplateOnboarding] Reset error:', error);
    }
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    resetOnboarding,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: COSMIC_SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COSMIC_COLORS.bgCosmic,
    borderRadius: COSMIC_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.borderGlow,
    overflow: 'hidden',
    padding: COSMIC_SPACING.xl,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipButton: {
    position: 'absolute',
    top: COSMIC_SPACING.md,
    right: COSMIC_SPACING.md,
    padding: COSMIC_SPACING.sm,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COSMIC_COLORS.glass.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
  },
  content: {
    alignItems: 'center',
    paddingVertical: COSMIC_SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: COSMIC_SPACING.xl,
  },
  title: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xxl,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: COSMIC_SPACING.md,
  },
  description: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.md * 1.6,
    paddingHorizontal: COSMIC_SPACING.md,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.xl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COSMIC_COLORS.glass.border,
  },
  stepDotActive: {
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COSMIC_COLORS.text.muted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xl,
    borderRadius: COSMIC_RADIUS.round,
    gap: COSMIC_SPACING.sm,
  },
  actionButtonText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
    color: COSMIC_COLORS.bgDeepSpace,
  },
});

export default TemplateOnboarding;
