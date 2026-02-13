/**
 * ReactionOnboarding Component
 * Modal shown first time user sees the reaction feature
 *
 * Features:
 * - 3 steps: intro, long-press instruction, selection instruction
 * - Animated step transitions
 * - Saves completion to AsyncStorage
 * - Skip button available
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, ChevronRight, Hand, MousePointer } from 'lucide-react-native';
import ReactionIcon from './ReactionIcon';
import { REACTION_ORDER, REACTION_CONFIG, REACTION_SIZES } from '../../constants/reactions';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORAGE_KEY = '@gem:reaction_onboarding_seen';

/**
 * Onboarding step content
 */
const STEPS = [
  {
    id: 'intro',
    title: 'Cảm xúc mới!',
    description: 'Bạn có thể thể hiện nhiều cảm xúc khác nhau với bài viết. Không chỉ "Thích" nữa!',
    showReactions: true,
  },
  {
    id: 'long-press',
    title: 'Giữ để chọn',
    description: 'Nhấn giữ nút thả cảm xúc để mở bảng chọn cảm xúc. Giữ khoảng 1 giây.',
    icon: Hand,
    iconAnimation: 'pulse',
  },
  {
    id: 'select',
    title: 'Chọn cảm xúc',
    description: 'Kéo ngón tay đến cảm xúc bạn muốn và thả ra. Hoặc chạm vào cảm xúc để chọn.',
    icon: MousePointer,
    iconAnimation: 'slide',
  },
];

/**
 * ReactionOnboarding - First-time user modal
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide modal (controlled externally)
 * @param {Function} props.onComplete - Callback when onboarding completes
 * @param {Function} props.onSkip - Callback when user skips
 * @param {boolean} props.forceShow - Ignore saved state and force show
 */
const ReactionOnboarding = ({
  visible: externalVisible = false,
  onComplete,
  onSkip,
  forceShow = false,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Animation values
  const progress = useSharedValue(0);

  /**
   * Check if onboarding has been seen
   */
  useEffect(() => {
    const checkOnboardingSeen = async () => {
      try {
        if (forceShow) {
          setShouldShow(true);
          return;
        }

        const seen = await AsyncStorage.getItem(STORAGE_KEY);
        if (seen !== 'true') {
          setShouldShow(true);
        }
      } catch (err) {
        console.error('[ReactionOnboarding] Check storage error:', err);
        setShouldShow(false);
      }
    };

    checkOnboardingSeen();
  }, [forceShow]);

  /**
   * Handle external visibility control
   */
  useEffect(() => {
    if (externalVisible && shouldShow) {
      setVisible(true);
      setCurrentStep(0);
    }
  }, [externalVisible, shouldShow]);

  /**
   * Update progress animation
   */
  useEffect(() => {
    progress.value = withSpring((currentStep + 1) / STEPS.length, {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep, progress]);

  /**
   * Mark onboarding as seen
   */
  const markAsSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {
      console.error('[ReactionOnboarding] Save storage error:', err);
    }
  }, []);

  /**
   * Handle next step
   */
  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      markAsSeen();
      setVisible(false);
      onComplete?.();
    }
  }, [currentStep, markAsSeen, onComplete]);

  /**
   * Handle skip
   */
  const handleSkip = useCallback(() => {
    markAsSeen();
    setVisible(false);
    onSkip?.();
  }, [markAsSeen, onSkip]);

  /**
   * Progress bar animated style
   */
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  /**
   * Render current step content
   */
  const renderStepContent = () => {
    const step = STEPS[currentStep];
    const IconComponent = step.icon;

    return (
      <Animated.View
        key={step.id}
        entering={SlideInRight.springify().damping(18)}
        exiting={SlideOutLeft.springify().damping(18)}
        style={styles.stepContent}
      >
        {/* Step icon or reactions display */}
        <View style={styles.stepVisual}>
          {step.showReactions ? (
            <View style={styles.reactionsRow}>
              {REACTION_ORDER.map((type, index) => (
                <Animated.View
                  key={type}
                  entering={FadeIn.delay(index * 100)}
                >
                  <ReactionIcon
                    type={type}
                    size={40}
                    showAnimation
                    index={index}
                  />
                </Animated.View>
              ))}
            </View>
          ) : IconComponent ? (
            <View style={styles.iconContainer}>
              <IconComponent
                size={64}
                color={COLORS.gold}
                strokeWidth={1.5}
              />
            </View>
          ) : null}
        </View>

        {/* Step text */}
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </Animated.View>
    );
  };

  if (!visible) return null;

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleSkip} />

        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.modalContainer}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint="dark"
            style={styles.blurView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Bỏ qua</Text>
              </Pressable>
              <Pressable onPress={handleSkip} style={styles.closeButton}>
                <X size={24} color={COLORS.textMuted} />
              </Pressable>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1}/{STEPS.length}
              </Text>
            </View>

            {/* Step content */}
            <View style={styles.contentContainer}>
              {renderStepContent()}
            </View>

            {/* Navigation buttons */}
            <View style={styles.footer}>
              <Pressable
                onPress={handleNext}
                style={[styles.nextButton, isLastStep && styles.completeButton]}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Bắt đầu' : 'Tiếp theo'}
                </Text>
                {!isLastStep && (
                  <ChevronRight size={20} color={COLORS.bgDark} />
                )}
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
  },
  blurView: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(15, 16, 48, 0.98)' : 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  skipButton: {
    padding: SPACING.xs,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'right',
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 240,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepVisual: {
    marginBottom: SPACING.lg,
    minHeight: 80,
    justifyContent: 'center',
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 24,
    gap: SPACING.xs,
  },
  completeButton: {
    backgroundColor: COLORS.success || '#4CAF50',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
});

export default memo(ReactionOnboarding);
