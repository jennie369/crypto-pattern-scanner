/**
 * OnboardingOverlay.js
 * Feature onboarding overlay with step-by-step highlights
 * For Calendar Smart Journal first-time user experience
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
  TrendingUp,
  Smile,
  Calendar,
  Target,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default Calendar onboarding steps
export const CALENDAR_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Chao mung den Calendar',
    content: 'Day la noi ban theo doi cam xuc, nhat ky, giao dich va tien do moi ngay.',
    icon: Calendar,
    targetId: null, // No highlight, just intro
  },
  {
    id: 'mood',
    title: 'Check-in cam xuc',
    content: 'Ghi lai cam xuc buoi sang va buoi toi de hieu ban than hon.',
    icon: Smile,
    targetId: 'mood-checkin-banner',
  },
  {
    id: 'journal',
    title: 'Viet nhat ky',
    content: 'Ghi lai suy nghi, biet on, hoac ghi chu muc tieu bat cu luc nao.',
    icon: BookOpen,
    targetId: 'quick-action-journal',
  },
  {
    id: 'trading',
    title: 'Nhat ky giao dich',
    content: 'Theo doi giao dich, tinh toan P/L, va danh gia ky luat.',
    icon: TrendingUp,
    targetId: 'quick-action-trade',
  },
  {
    id: 'calendar',
    title: 'Xem lich',
    content: 'Nhan vao bat ky ngay nao de xem chi tiet hoat dong.',
    icon: Calendar,
    targetId: 'calendar-heatmap',
  },
  {
    id: 'complete',
    title: 'Ban da san sang!',
    content: 'Bat dau ghi lai hanh trinh cua ban ngay hom nay.',
    icon: Sparkles,
    targetId: null,
  },
];

/**
 * OnboardingOverlay Component
 */
const OnboardingOverlay = ({
  visible,
  onClose,
  onComplete,
  steps = CALENDAR_ONBOARDING_STEPS,
  targetRefs = {}, // Map of targetId to ref positions
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Get target position for highlight
  const targetPosition = step?.targetId ? targetRefs[step.targetId] : null;

  // Animate on mount/step change
  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(30);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  // Handle next
  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLast, onComplete]);

  // Handle previous
  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirst]);

  // Handle skip
  const handleSkip = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Calculate tooltip position based on target
  const getTooltipPosition = () => {
    if (!targetPosition) {
      // Center of screen
      return {
        top: SCREEN_HEIGHT * 0.35,
        centered: true,
      };
    }

    const { top, height } = targetPosition;
    const targetBottom = top + height;

    // If target is in upper half, show tooltip below
    if (top < SCREEN_HEIGHT / 2) {
      return {
        top: targetBottom + SPACING.lg,
        centered: false,
      };
    }

    // If target is in lower half, show tooltip above
    return {
      top: top - 180,
      centered: false,
    };
  };

  const tooltipPosition = getTooltipPosition();
  const IconComponent = step?.icon || Sparkles;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Dark overlay with hole for highlight */}
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={() => {}} // Prevent dismiss on tap
        >
          {/* Highlight area */}
          {targetPosition && (
            <View
              style={[
                styles.highlight,
                {
                  top: targetPosition.top - 8,
                  left: targetPosition.left - 8,
                  width: targetPosition.width + 16,
                  height: targetPosition.height + 16,
                  borderRadius: targetPosition.borderRadius || BORDER_RADIUS.md,
                },
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Tooltip card */}
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              top: tooltipPosition.top,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
            tooltipPosition.centered && styles.tooltipCentered,
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive,
                  index < currentStep && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <IconComponent size={32} color={COLORS.gold} />
          </View>

          {/* Content */}
          <Text style={styles.title}>{step?.title}</Text>
          <Text style={styles.content}>{step?.content}</Text>

          {/* Navigation */}
          <View style={styles.navigation}>
            {/* Skip/Back button */}
            {isFirst ? (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Bo qua</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
                <ChevronLeft size={18} color={COLORS.textMuted} />
              )}
                <Text style={styles.prevText}>Quay lai</Text>
              )}
              </TouchableOpacity>
            )}

            {/* Next/Complete button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>
                {isLast ? 'Bat dau' : 'Tiep theo'}
              </Text>
              <ChevronRight size={18} color={COLORS.bgDarkest} />
            )}
            </TouchableOpacity>
          )}
          </View>

          {/* Progress text */}
          <Text style={styles.progressText}>
            {currentStep + 1} / {totalSteps}
          </Text>
        )}
        </Animated.View>
      </View>
    )}
    </Modal>
  );
};

/**
 * FeatureHighlight - Single feature highlight component
 */
export const FeatureHighlight = ({
  visible,
  onDismiss,
  title,
  description,
  targetPosition,
  icon: IconComponent = Sparkles,
  buttonText = 'Da hieu',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const tooltipTop = targetPosition
    ? targetPosition.top > SCREEN_HEIGHT / 2
      ? targetPosition.top - 150
      : targetPosition.top + targetPosition.height + SPACING.md
    : SCREEN_HEIGHT * 0.35;

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.featureOverlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {/* Highlight */}
        {targetPosition && (
          <View
            style={[
              styles.featureHighlight,
              {
                top: targetPosition.top - 4,
                left: targetPosition.left - 4,
                width: targetPosition.width + 8,
                height: targetPosition.height + 8,
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.featureTooltip,
            { top: tooltipTop, opacity: fadeAnim },
          ]}
        >
          <View style={styles.featureIconRow}>
            <View style={styles.featureIcon}>
              <IconComponent size={20} color={COLORS.gold} />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
          </View>

          <Text style={styles.featureDescription}>{description}</Text>

          <TouchableOpacity style={styles.featureButton} onPress={onDismiss}>
            <Text style={styles.featureButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * Hook to manage onboarding state
 */
export const useOnboarding = (key, defaultShow = true) => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(!defaultShow);
  const [showOnboarding, setShowOnboarding] = useState(defaultShow);

  // Load from storage on mount
  useEffect(() => {
    // In a real app, load from AsyncStorage
    // For now, just use state
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
    // Save to AsyncStorage
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasSeenOnboarding(false);
    setShowOnboarding(true);
  }, []);

  return {
    hasSeenOnboarding,
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
    setShowOnboarding,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  overlayTouchable: {
    flex: 1,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tooltipCentered: {
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
    zIndex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: COLORS.gold,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.gold + '60',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
    marginBottom: SPACING.lg,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xxs,
  },
  prevText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  nextText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  // Feature highlight styles
  featureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  featureHighlight: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  featureTooltip: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
    marginBottom: SPACING.md,
  },
  featureButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  featureButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default OnboardingOverlay;
