/**
 * TarotOnboarding Component
 * First-time user onboarding tooltips for Tarot features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Layers,
  Shuffle,
  BookOpen,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = 'tarot_onboarding_completed';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Chào mừng đến với Tarot',
    description: 'Khám phá các trải bài Tarot đa dạng và nhận được thông điệp từ vũ trụ cho cuộc sống của bạn.',
    tip: 'Hơn 10 kiểu trải bài khác nhau',
  },
  {
    id: 'spreads',
    icon: Layers,
    title: 'Chọn kiểu trải bài',
    description: 'Từ trải 1 lá đơn giản đến Celtic Cross 10 lá phức tạp. Mỗi kiểu phù hợp cho câu hỏi khác nhau.',
    tip: 'Trải bài Trading dành riêng cho trader',
  },
  {
    id: 'shuffle',
    icon: Shuffle,
    title: 'Xào bài và rút',
    description: 'Tập trung vào câu hỏi của bạn khi xào bài. Chạm vào bộ bài để rút từng lá một.',
    tip: 'Có thể lật lá ngược (reversed)',
  },
  {
    id: 'interpret',
    icon: BookOpen,
    title: 'Giải bài AI',
    description: 'AI sẽ phân tích từng lá bài và đưa ra lời giải toàn diện dựa trên vị trí và câu hỏi của bạn.',
    tip: 'Gợi ý đá năng lượng và affirmations',
  },
];

const TarotOnboarding = ({
  visible: forcedVisible,
  onComplete,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (forceShow) {
        setVisible(true);
        return;
      }

      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (completed === 'true') {
          setHasCompleted(true);
        } else {
          setVisible(true);
        }
      } catch (err) {
        console.error('[TarotOnboarding] Error checking status:', err);
        setVisible(true);
      }
    };

    checkOnboardingStatus();
  }, [forceShow]);

  // Use forced visibility if provided
  useEffect(() => {
    if (forcedVisible !== undefined) {
      setVisible(forcedVisible);
    }
  }, [forcedVisible]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompleted(true);
    } catch (err) {
      console.error('[TarotOnboarding] Error saving status:', err);
    }
    setVisible(false);
    onComplete?.();
  };

  if (!visible || hasCompleted) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[COLORS.bgMid, COLORS.bgDarkest]}
            style={styles.background}
          />

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={GRADIENTS.glassBorder}
              style={styles.iconGradient}
            >
              <IconComponent size={48} color={COLORS.gold} />
            </LinearGradient>
          </View>

          {/* Content */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Sparkles size={16} color={COLORS.cyan} />
            <Text style={styles.tipText}>{step.tip}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {!isLastStep && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Bỏ qua</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextText}>
                  {isLastStep ? 'Bắt đầu' : 'Tiếp theo'}
                </Text>
                {!isLastStep && (
                  <ChevronRight size={20} color={COLORS.textPrimary} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Static method to reset onboarding (for testing)
TarotOnboarding.reset = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('[TarotOnboarding] Onboarding reset');
  } catch (err) {
    console.error('[TarotOnboarding] Error resetting:', err);
  }
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
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    padding: SPACING.xl,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.purple,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  skipButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  nextButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  nextText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
});

export default TarotOnboarding;
