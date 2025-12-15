/**
 * GoalSetupQuestionnaire - Vision Board 2.0
 * Multi-step questionnaire for deeper goal personalization
 *
 * Flow:
 * Step 1: Xác nhận mục tiêu (scenario title hoặc custom)
 * Step 2: "Vì sao bạn muốn đạt mục tiêu này?"
 * Step 3: "Deadline bạn muốn đạt?"
 * Step 4: "Cảm xúc khi đạt được?"
 * Step 5: "Thử thách lớn nhất?"
 * → Generate personalized affirmations + actions
 *
 * Created: December 11, 2025
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Target,
  Heart,
  Calendar,
  Sparkles,
  Shield,
  Check,
  Loader,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Design tokens
const COLORS = {
  bgDark: '#05040B',
  bgMid: '#0F0A1F',
  bgCard: '#1A1425',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  gold: '#FFBD59',
  green: '#3AF7A6',
  purple: '#A855F7',
  pink: '#EC4899',
  cyan: '#00F0FF',
  border: 'rgba(255,255,255,0.1)',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Questionnaire steps configuration
const QUESTIONNAIRE_STEPS = [
  {
    id: 'confirm',
    icon: Target,
    color: COLORS.gold,
    title: 'Mục tiêu của bạn',
    question: 'Bạn có thể điều chỉnh mục tiêu cho phù hợp với mình:',
    placeholder: 'VD: Tiết kiệm 100 triệu trong 6 tháng',
    inputType: 'text',
  },
  {
    id: 'why',
    icon: Heart,
    color: COLORS.pink,
    title: 'Động lực',
    question: 'Vì sao bạn muốn đạt mục tiêu này?',
    subtitle: 'Hiểu rõ "vì sao" giúp bạn kiên trì hơn',
    placeholder: 'VD: Để có quỹ khẩn cấp cho gia đình...',
    inputType: 'textarea',
    suggestions: [
      'Để gia đình được an toàn',
      'Để tự do tài chính',
      'Để chứng minh bản thân',
      'Để có cuộc sống tốt hơn',
    ],
  },
  {
    id: 'deadline',
    icon: Calendar,
    color: COLORS.cyan,
    title: 'Thời gian',
    question: 'Bạn muốn đạt được trong bao lâu?',
    subtitle: 'Deadline rõ ràng tạo động lực hành động',
    inputType: 'options',
    options: [
      { value: 30, label: '1 tháng', emoji: '⚡' },
      { value: 60, label: '2 tháng', emoji: '🎯' },
      { value: 90, label: '3 tháng', emoji: '🌟' },
      { value: 180, label: '6 tháng', emoji: '💪' },
      { value: 365, label: '1 năm', emoji: '🏆' },
    ],
  },
  {
    id: 'emotion',
    icon: Sparkles,
    color: COLORS.purple,
    title: 'Cảm xúc',
    question: 'Bạn sẽ cảm thấy thế nào khi đạt được?',
    subtitle: 'Visualization cảm xúc tăng sức mạnh manifestation',
    placeholder: 'VD: Tự hào, nhẹ nhõm, tự tin...',
    inputType: 'textarea',
    suggestions: [
      'Tự hào và hạnh phúc',
      'Tự tin và mạnh mẽ',
      'Nhẹ nhõm và an tâm',
      'Hứng khởi và tràn đầy năng lượng',
    ],
  },
  {
    id: 'challenge',
    icon: Shield,
    color: COLORS.green,
    title: 'Thử thách',
    question: 'Thử thách lớn nhất của bạn là gì?',
    subtitle: 'Biết trước khó khăn giúp chuẩn bị tốt hơn',
    placeholder: 'VD: Thiếu thời gian, dễ bỏ cuộc...',
    inputType: 'textarea',
    suggestions: [
      'Thiếu thời gian',
      'Dễ nản chí, bỏ cuộc',
      'Không có người hỗ trợ',
      'Chưa biết bắt đầu từ đâu',
    ],
  },
];

/**
 * GoalSetupQuestionnaire Component
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close callback
 * @param {function} onComplete - Complete callback with personalized data
 * @param {object} scenario - Selected scenario from goal_scenarios
 * @param {string} lifeArea - Life area key
 */
const GoalSetupQuestionnaire = ({
  visible,
  onClose,
  onComplete,
  scenario,
  lifeArea,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    confirm: '',
    why: '',
    deadline: 90,
    emotion: '',
    challenge: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Initialize with scenario title
  useEffect(() => {
    if (visible && scenario?.title) {
      setAnswers(prev => ({
        ...prev,
        confirm: scenario.title,
      }));
      setCurrentStep(0);
      slideAnim.setValue(0);
    }
  }, [visible, scenario]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / QUESTIONNAIRE_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handle next step with animation
  const handleNext = useCallback(() => {
    if (currentStep < QUESTIONNAIRE_STEPS.length - 1) {
      Vibration.vibrate(10);
      Animated.timing(slideAnim, {
        toValue: -(currentStep + 1) * SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - generate personalized content
      handleGenerate();
    }
  }, [currentStep]);

  // Handle previous step
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      Vibration.vibrate(10);
      Animated.timing(slideAnim, {
        toValue: -(currentStep - 1) * SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Update answer for current step
  const updateAnswer = useCallback((stepId, value) => {
    setAnswers(prev => ({
      ...prev,
      [stepId]: value,
    }));
  }, []);

  // Generate personalized content
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    Vibration.vibrate(50);

    try {
      // Generate personalized affirmations based on answers
      const personalizedAffirmations = generatePersonalizedAffirmations(
        scenario,
        answers,
        lifeArea
      );

      // Generate personalized action steps based on answers
      const personalizedActions = generatePersonalizedActions(
        scenario,
        answers,
        lifeArea
      );

      // Callback with all data
      onComplete({
        goalTitle: answers.confirm,
        lifeArea,
        deadline: answers.deadline,
        questionnaire: answers,
        affirmations: personalizedAffirmations,
        actionSteps: personalizedActions,
        originalScenario: scenario,
      });
    } catch (error) {
      console.error('[GoalSetupQuestionnaire] Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [scenario, answers, lifeArea, onComplete]);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const step = QUESTIONNAIRE_STEPS[currentStep];
    const answer = answers[step.id];

    if (step.inputType === 'options') {
      return answer !== null && answer !== undefined;
    }
    return answer && answer.trim().length > 0;
  }, [currentStep, answers]);

  // Render step content
  const renderStepContent = useCallback((step, index) => {
    const Icon = step.icon;
    const answer = answers[step.id];

    return (
      <View key={step.id} style={styles.stepContainer}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <View style={[styles.stepIconContainer, { backgroundColor: `${step.color}20` }]}>
            <Icon size={28} color={step.color} />
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>{step.question}</Text>
        {step.subtitle && (
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        )}

        {/* Input based on type */}
        {step.inputType === 'text' && (
          <TextInput
            style={styles.textInput}
            value={answer}
            onChangeText={(text) => updateAnswer(step.id, text)}
            placeholder={step.placeholder}
            placeholderTextColor={COLORS.textMuted}
            multiline={false}
          />
        )}

        {step.inputType === 'textarea' && (
          <>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={answer}
              onChangeText={(text) => updateAnswer(step.id, text)}
              placeholder={step.placeholder}
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
            {step.suggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Gợi ý:</Text>
                <View style={styles.suggestionsList}>
                  {step.suggestions.map((suggestion, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionChip}
                      onPress={() => updateAnswer(step.id, suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {step.inputType === 'options' && (
          <View style={styles.optionsContainer}>
            {step.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  answer === option.value && styles.optionCardSelected,
                ]}
                onPress={() => updateAnswer(step.id, option.value)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  answer === option.value && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                {answer === option.value && (
                  <Check size={18} color={COLORS.gold} style={styles.optionCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }, [answers, updateAnswer]);

  // Reset when modal closes
  const handleClose = useCallback(() => {
    setCurrentStep(0);
    slideAnim.setValue(0);
    setAnswers({
      confirm: '',
      why: '',
      deadline: 90,
      emotion: '',
      challenge: '',
    });
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1}/{QUESTIONNAIRE_STEPS.length}
              </Text>
            </View>
          </View>

          {/* Steps Carousel */}
          <Animated.View
            style={[
              styles.stepsCarousel,
              {
                width: SCREEN_WIDTH * QUESTIONNAIRE_STEPS.length,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {QUESTIONNAIRE_STEPS.map((step, index) => renderStepContent(step, index))}
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
                <ArrowLeft size={20} color={COLORS.textSecondary} />
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButtonPlaceholder} />
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !isCurrentStepValid() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!isCurrentStepValid() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader size={20} color={COLORS.bgDark} />
                  <Text style={styles.nextButtonText}>Đang tạo...</Text>
                </>
              ) : currentStep === QUESTIONNAIRE_STEPS.length - 1 ? (
                <>
                  <Sparkles size={20} color={COLORS.bgDark} />
                  <Text style={styles.nextButtonText}>Tạo mục tiêu</Text>
                </>
              ) : (
                <>
                  <Text style={styles.nextButtonText}>Tiếp tục</Text>
                  <ArrowRight size={20} color={COLORS.bgDark} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/**
 * Generate personalized affirmations based on questionnaire answers
 */
function generatePersonalizedAffirmations(scenario, answers, lifeArea) {
  const baseAffirmations = scenario?.affirmations || [];
  const personalizedList = [];

  // Add base affirmations
  if (Array.isArray(baseAffirmations)) {
    personalizedList.push(...baseAffirmations);
  }

  // Add personalized affirmations based on "why"
  if (answers.why) {
    const whyLower = answers.why.toLowerCase();

    if (whyLower.includes('gia đình') || whyLower.includes('con')) {
      personalizedList.push('Gia đình là động lực lớn nhất của tôi');
      personalizedList.push('Tôi làm điều này vì những người tôi yêu thương');
    }
    if (whyLower.includes('tự do') || whyLower.includes('độc lập')) {
      personalizedList.push('Tự do đang đến gần tôi mỗi ngày');
      personalizedList.push('Tôi xứng đáng được sống cuộc đời tự do');
    }
    if (whyLower.includes('chứng minh') || whyLower.includes('thành công')) {
      personalizedList.push('Tôi có khả năng đạt được mọi điều tôi muốn');
      personalizedList.push('Thành công là định mệnh của tôi');
    }
  }

  // Add emotion-based affirmations
  if (answers.emotion) {
    const emotionLower = answers.emotion.toLowerCase();

    if (emotionLower.includes('tự hào')) {
      personalizedList.push('Tôi tự hào về hành trình của mình');
    }
    if (emotionLower.includes('tự tin')) {
      personalizedList.push('Mỗi ngày tôi càng tự tin hơn');
    }
    if (emotionLower.includes('hạnh phúc') || emotionLower.includes('vui')) {
      personalizedList.push('Hạnh phúc đang tràn ngập cuộc sống tôi');
    }
    if (emotionLower.includes('nhẹ nhõm') || emotionLower.includes('an tâm')) {
      personalizedList.push('Tôi cảm thấy nhẹ nhõm và bình an');
    }
  }

  // Add challenge-overcoming affirmations
  if (answers.challenge) {
    const challengeLower = answers.challenge.toLowerCase();

    if (challengeLower.includes('thời gian')) {
      personalizedList.push('Tôi sử dụng thời gian một cách khôn ngoan');
    }
    if (challengeLower.includes('bỏ cuộc') || challengeLower.includes('nản')) {
      personalizedList.push('Tôi kiên trì và không bao giờ bỏ cuộc');
      personalizedList.push('Mỗi khó khăn chỉ làm tôi mạnh mẽ hơn');
    }
    if (challengeLower.includes('hỗ trợ') || challengeLower.includes('một mình')) {
      personalizedList.push('Tôi có đủ sức mạnh bên trong để thành công');
    }
  }

  // Remove duplicates and limit
  const uniqueAffirmations = [...new Set(personalizedList)];
  return uniqueAffirmations.slice(0, 6);
}

/**
 * Generate personalized action steps based on questionnaire answers
 */
function generatePersonalizedActions(scenario, answers, lifeArea) {
  const baseActions = scenario?.action_steps || [];
  const personalizedList = [];

  // Add base actions
  if (Array.isArray(baseActions)) {
    baseActions.forEach((action, index) => {
      personalizedList.push({
        id: `action_${Date.now()}_${index}`,
        title: typeof action === 'string' ? action : action.step || action.title,
        description: action.description || '',
        action_type: index < 2 ? 'daily' : (index < 4 ? 'weekly' : 'one_time'),
      });
    });
  }

  // Add personalized actions based on challenge
  if (answers.challenge) {
    const challengeLower = answers.challenge.toLowerCase();

    if (challengeLower.includes('thời gian')) {
      personalizedList.push({
        id: `action_time_${Date.now()}`,
        title: 'Lập kế hoạch thời gian mỗi sáng',
        description: 'Dành 5 phút mỗi sáng để lên kế hoạch',
        action_type: 'daily',
      });
    }
    if (challengeLower.includes('bỏ cuộc') || challengeLower.includes('nản')) {
      personalizedList.push({
        id: `action_motivation_${Date.now()}`,
        title: 'Review lý do "vì sao" khi nản chí',
        description: 'Đọc lại động lực của mình mỗi khi muốn bỏ cuộc',
        action_type: 'weekly',
      });
    }
    if (challengeLower.includes('bắt đầu')) {
      personalizedList.push({
        id: `action_start_${Date.now()}`,
        title: 'Bắt đầu với bước nhỏ nhất có thể',
        description: 'Chỉ cần làm 5 phút để khởi động',
        action_type: 'daily',
      });
    }
  }

  // Add deadline-based milestone action
  if (answers.deadline) {
    const milestoneWeeks = Math.floor(answers.deadline / 30);
    personalizedList.push({
      id: `action_milestone_${Date.now()}`,
      title: `Review tiến độ mỗi ${milestoneWeeks > 1 ? milestoneWeeks + ' tuần' : 'tuần'}`,
      description: 'Đánh giá tiến trình và điều chỉnh nếu cần',
      action_type: 'weekly',
    });
  }

  // Ensure proper action_type distribution
  return personalizedList.slice(0, 7).map((action, index) => ({
    ...action,
    action_type: action.action_type || (index < 2 ? 'daily' : 'weekly'),
  }));
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: COLORS.bgMid,
    marginHorizontal: SPACING.lg,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Steps Carousel
  stepsCarousel: {
    flexDirection: 'row',
  },
  stepContainer: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },

  // Step Header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Question
  question: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },

  // Text Input
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: SPACING.md,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Options
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.gold,
  },
  optionCheck: {
    marginLeft: SPACING.sm,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  backButtonPlaceholder: {
    width: 80,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.bgDark,
  },
});

export default GoalSetupQuestionnaire;
