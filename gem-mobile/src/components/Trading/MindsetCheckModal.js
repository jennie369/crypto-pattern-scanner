/**
 * MindsetCheckModal Component
 * 3-Step Trading Psychology Assessment Flow
 *
 * Step 1: Emotional Assessment (5 questions)
 * Step 2: Score Review with breakdown
 * Step 3: Recommendation and actions
 *
 * Created: December 13, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Brain,
  ChevronRight,
  ChevronLeft,
  Zap,
  Moon,
  AlertTriangle,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wind,
  MessageCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import mindsetAdvisorService, { SCORE_COLORS } from '../../services/mindsetAdvisorService';
import ScoreGauge from './ScoreGauge';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mood options
const MOOD_OPTIONS = [
  { value: 'calm', label: 'Bình tĩnh', icon: '😌', color: SCORE_COLORS.ready },
  { value: 'neutral', label: 'Trung lập', icon: '😐', color: SCORE_COLORS.prepare },
  { value: 'anxious', label: 'Lo âu', icon: '😰', color: SCORE_COLORS.caution },
  { value: 'excited', label: 'Phấn khích', icon: '🤩', color: SCORE_COLORS.caution },
];

// Energy levels
const ENERGY_LEVELS = [
  { value: 1, label: 'Rất thấp', emoji: '😴' },
  { value: 2, label: 'Thấp', emoji: '😪' },
  { value: 3, label: 'Bình thường', emoji: '😊' },
  { value: 4, label: 'Cao', emoji: '😄' },
  { value: 5, label: 'Rất cao', emoji: '🔥' },
];

// Sleep quality options
const SLEEP_OPTIONS = [
  { value: 'good', label: 'Tốt', icon: '🌙', color: SCORE_COLORS.ready },
  { value: 'average', label: 'Bình thường', icon: '😴', color: SCORE_COLORS.prepare },
  { value: 'poor', label: 'Không tốt', icon: '😫', color: SCORE_COLORS.stop },
];

const MindsetCheckModal = ({
  visible,
  pattern = null,
  sourceScreen = 'paper_trade_modal',
  onClose,
  onResult,
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logId, setLogId] = useState(null);

  // Emotional responses
  const [mood, setMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(null);
  const [fomoLevel, setFomoLevel] = useState(3);
  const [revengeTradingUrge, setRevengeTradingUrge] = useState(1);

  // Animation
  const slideAnim = useState(new Animated.Value(0))[0];

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStep(1);
      setResult(null);
      setLogId(null);
      setMood(null);
      setEnergyLevel(3);
      setSleepQuality(null);
      setFomoLevel(3);
      setRevengeTradingUrge(1);
      slideAnim.setValue(0);
    }
  }, [visible]);

  // Animate step transition
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: (step - 1) * -SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [step]);

  // Check if step 1 is complete
  const isStep1Complete = mood && sleepQuality;

  // Calculate score
  const handleCalculate = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const emotionalResponses = {
        mood,
        energyLevel,
        sleepQuality,
        fomoLevel,
        revengeTradingUrge,
      };

      const context = {
        patternSymbol: pattern?.symbol,
        patternType: pattern?.type,
        patternTimeframe: pattern?.timeframe,
        sourceScreen,
      };

      const assessment = await mindsetAdvisorService.calculateMindsetScore(
        user.id,
        emotionalResponses,
        context
      );

      if (assessment.success) {
        setResult(assessment);

        // Log to database
        const logResult = await mindsetAdvisorService.logAssessment(
          user.id,
          assessment
        );
        if (logResult.logged) {
          setLogId(logResult.id);
        }

        // Move to step 2
        setStep(2);
      }
    } catch (error) {
      console.error('[MindsetCheck] Calculate error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user decision
  const handleDecision = async (decision) => {
    if (logId) {
      await mindsetAdvisorService.updateDecision(
        logId,
        decision,
        decision === 'proceed'
      );
    }

    // Pass result to parent
    if (onResult) {
      onResult({
        score: result?.totalScore,
        recommendation: result?.recommendation,
        decision,
        proceeded: decision === 'proceed',
      });
    }

    // Close modal first
    onClose();

    // Navigate based on decision
    if (decision === 'consult') {
      // Navigate to GemMaster chat với context về mindset score
      // Build comprehensive message with all context for GemMaster to understand
      const scoreLevel = result?.recommendation === 'ready' ? 'tốt' :
                         result?.recommendation === 'prepare' ? 'trung bình' :
                         result?.recommendation === 'caution' ? 'cần thận trọng' : 'nên dừng lại';

      const breakdown = result?.breakdown;
      const breakdownInfo = breakdown ? `
- Cảm xúc: ${breakdown.emotional?.score || 0}/100 (${breakdown.emotional?.weighted || 0} điểm)
- Lịch sử trade: ${breakdown.history?.score || 0}/100 (${breakdown.history?.weighted || 0} điểm)
- Kỷ luật: ${breakdown.discipline?.score || 0}/100 (${breakdown.discipline?.weighted || 0} điểm)` : '';

      const patternInfo = pattern ? `

Pattern đang xem xét: ${pattern.symbol} - ${pattern.type} (${pattern.timeframe || 'không rõ timeframe'})` : '';

      const fullPrompt = `Tôi vừa kiểm tra tâm thế trading và cần lời khuyên:

📊 Điểm tâm thế: ${Math.round(result?.totalScore || 0)}/100 (${scoreLevel})
${breakdownInfo}${patternInfo}

Bạn có lời khuyên gì cho tôi? Tôi có nên trade lúc này không?`;

      setTimeout(() => {
        navigation.navigate('GemMaster', {
          screen: 'GemMasterChat',
          params: {
            // Use initialPrompt (not initialMessage) - this is what GemMasterScreen expects
            initialPrompt: fullPrompt,
          },
        });
      }, 300);
    } else if (decision === 'breathe') {
      // Navigate to Breathing exercise
      setTimeout(() => {
        navigation.navigate('Wellness', {
          screen: 'BreathingExercise',
        });
      }, 300);
    }
  };

  // Render Step 1: Emotional Assessment
  const renderStep1 = () => (
    <ScrollView
      style={styles.stepContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.stepContentInner}
    >
      {/* Header */}
      <View style={styles.stepHeader}>
        <Brain size={32} color={COLORS.gold} />
        <Text style={styles.stepTitle}>Đánh giá cảm xúc</Text>
        <Text style={styles.stepSubtitle}>Trả lời 5 câu hỏi ngắn</Text>
      </View>

      {/* Question 1: Mood */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>1. Tâm trạng hiện tại của bạn?</Text>
        <View style={styles.optionsGrid}>
          {MOOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                mood === option.value && styles.optionButtonActive,
                mood === option.value && { borderColor: option.color },
              ]}
              onPress={() => setMood(option.value)}
            >
              <Text style={styles.optionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  mood === option.value && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 2: Energy Level */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>2. Mức năng lượng?</Text>
        <View style={styles.sliderContainer}>
          {ENERGY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.sliderOption,
                energyLevel === level.value && styles.sliderOptionActive,
              ]}
              onPress={() => setEnergyLevel(level.value)}
            >
              <Text style={styles.sliderEmoji}>{level.emoji}</Text>
              <Text
                style={[
                  styles.sliderValue,
                  energyLevel === level.value && styles.sliderValueActive,
                ]}
              >
                {level.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sliderLabel}>
          {ENERGY_LEVELS.find((l) => l.value === energyLevel)?.label}
        </Text>
      </View>

      {/* Question 3: Sleep Quality */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>3. Giấc ngủ đêm qua?</Text>
        <View style={styles.optionsRow}>
          {SLEEP_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButtonRow,
                sleepQuality === option.value && styles.optionButtonActive,
                sleepQuality === option.value && { borderColor: option.color },
              ]}
              onPress={() => setSleepQuality(option.value)}
            >
              <Text style={styles.optionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  sleepQuality === option.value && { color: option.color },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 4: FOMO Level */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>4. Mức độ FOMO với cơ hội này?</Text>
        <Text style={styles.questionHint}>1 = Không FOMO, 5 = Rất FOMO</Text>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.sliderOption,
                fomoLevel === level && styles.sliderOptionWarning,
              ]}
              onPress={() => setFomoLevel(level)}
            >
              <Text
                style={[
                  styles.sliderValue,
                  fomoLevel === level && styles.sliderValueWarning,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 5: Revenge Trading */}
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>5. Muốn "gỡ" từ lệnh trước?</Text>
        <Text style={styles.questionHint}>1 = Không, 5 = Rất muốn</Text>
        <View style={styles.sliderContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.sliderOption,
                revengeTradingUrge === level && styles.sliderOptionDanger,
              ]}
              onPress={() => setRevengeTradingUrge(level)}
            >
              <Text
                style={[
                  styles.sliderValue,
                  revengeTradingUrge === level && styles.sliderValueDanger,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          !isStep1Complete && styles.primaryButtonDisabled,
        ]}
        onPress={handleCalculate}
        disabled={!isStep1Complete || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Tính điểm tâm thế</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Step 2: Score Review
  const renderStep2 = () => (
    <ScrollView
      style={styles.stepContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.stepContentInner}
    >
      {/* Score Gauge */}
      <View style={styles.gaugeContainer}>
        <ScoreGauge
          score={result?.totalScore || 0}
          size={200}
          breakdown={result?.breakdown}
          showBreakdown={true}
        />
      </View>

      {/* Score Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Chi tiết điểm số</Text>

        {/* Emotional */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.breakdownDot, { backgroundColor: '#FF6B9D' }]} />
            <Text style={styles.breakdownLabel}>Cảm xúc</Text>
          </View>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownScore}>
              {result?.breakdown?.emotional?.score || 0}
            </Text>
            <Text style={styles.breakdownWeight}>x40%</Text>
            <Text style={styles.breakdownWeighted}>
              = {result?.breakdown?.emotional?.weighted || 0}
            </Text>
          </View>
        </View>

        {/* History */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.breakdownDot, { backgroundColor: '#6A5BFF' }]} />
            <Text style={styles.breakdownLabel}>Lịch sử trade</Text>
          </View>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownScore}>
              {result?.breakdown?.history?.score || 0}
            </Text>
            <Text style={styles.breakdownWeight}>x30%</Text>
            <Text style={styles.breakdownWeighted}>
              = {result?.breakdown?.history?.weighted || 0}
            </Text>
          </View>
        </View>

        {/* Discipline */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.breakdownDot, { backgroundColor: '#00F0FF' }]} />
            <Text style={styles.breakdownLabel}>Kỷ luật</Text>
          </View>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownScore}>
              {result?.breakdown?.discipline?.score || 0}
            </Text>
            <Text style={styles.breakdownWeight}>x30%</Text>
            <Text style={styles.breakdownWeighted}>
              = {result?.breakdown?.discipline?.weighted || 0}
            </Text>
          </View>
        </View>

        {/* Details */}
        {result?.breakdown?.discipline?.details && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Hôm nay:</Text>
            <View style={styles.detailsBadges}>
              {result.breakdown.discipline.details.affirmationDone && (
                <View style={styles.detailBadge}>
                  <CheckCircle size={12} color={COLORS.success} />
                  <Text style={styles.detailText}>Affirmation</Text>
                </View>
              )}
              {result.breakdown.discipline.details.habitDone && (
                <View style={styles.detailBadge}>
                  <CheckCircle size={12} color={COLORS.success} />
                  <Text style={styles.detailText}>Habit</Text>
                </View>
              )}
              {result.breakdown.discipline.details.goalDone && (
                <View style={styles.detailBadge}>
                  <CheckCircle size={12} color={COLORS.success} />
                  <Text style={styles.detailText}>Goal</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep(3)}
      >
        <Text style={styles.primaryButtonText}>Xem khuyến nghị</Text>
        <ChevronRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Step 3: Recommendation
  const renderStep3 = () => {
    const rec = result?.recommendation || 'prepare';
    const color = SCORE_COLORS[rec] || SCORE_COLORS.prepare;

    const iconMap = {
      ready: CheckCircle,
      prepare: AlertTriangle,
      caution: AlertTriangle,
      stop: XCircle,
    };
    const Icon = iconMap[rec] || AlertTriangle;

    return (
      <ScrollView
        style={styles.stepContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.stepContentInner}
      >
        {/* Recommendation Header */}
        <View style={[styles.recHeader, { borderColor: color }]}>
          <View style={[styles.recIconContainer, { backgroundColor: `${color}20` }]}>
            <Icon size={48} color={color} />
          </View>
          <Text style={[styles.recTitle, { color }]}>
            {result?.recommendationMessage}
          </Text>
          <Text style={styles.recScore}>
            Điểm tâm thế: {result?.totalScore}/100
          </Text>
        </View>

        {/* Suggestions */}
        {result?.suggestions?.length > 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Gợi ý cho bạn:</Text>
            {result.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <View style={[styles.suggestionDot, { backgroundColor: color }]} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pattern Info */}
        {pattern && (
          <View style={styles.patternInfo}>
            <Text style={styles.patternLabel}>Pattern:</Text>
            <Text style={styles.patternValue}>
              {pattern.symbol} - {pattern.type}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {rec === 'ready' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleDecision('proceed')}
              >
                <TrendingUp size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonTextPrimary}>Tiếp tục Trade</Text>
              </TouchableOpacity>
            </>
          ) : rec === 'prepare' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => handleDecision('breathe')}
              >
                <Wind size={20} color={COLORS.gold} />
                <Text style={styles.actionButtonTextSecondary}>Làm Breathing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonOutline]}
                onPress={() => handleDecision('proceed')}
              >
                <Text style={styles.actionButtonTextOutline}>Vẫn tiếp tục</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => handleDecision('consult')}
              >
                <MessageCircle size={20} color={COLORS.gold} />
                <Text style={styles.actionButtonTextSecondary}>Hỏi GemMaster</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={() => handleDecision('skip')}
              >
                <XCircle size={20} color={COLORS.error} />
                <Text style={[styles.actionButtonTextOutline, { color: COLORS.error }]}>
                  Bỏ qua cơ hội
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Redo Assessment */}
        <TouchableOpacity
          style={styles.redoButton}
          onPress={() => setStep(1)}
        >
          <RefreshCw size={16} color={COLORS.textMuted} />
          <Text style={styles.redoText}>Đánh giá lại</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.overlay} tint="dark">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(step - 1)}
                >
                  <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle}>Kiểm Tra Tâm Thế</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  step >= s && styles.stepDotActive,
                  step === s && styles.stepDotCurrent,
                ]}
              />
            ))}
          </View>

          {/* Steps Content */}
          <View style={styles.contentArea}>
            <Animated.View
              style={[
                styles.stepsContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <View style={styles.stepWrapper}>{renderStep1()}</View>
              <View style={styles.stepWrapper}>{renderStep2()}</View>
              <View style={styles.stepWrapper}>{renderStep3()}</View>
            </Animated.View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: 'rgba(10, 12, 40, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  backButton: {
    padding: 4,
    marginRight: 4,
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  closeButton: {
    padding: 4,
  },

  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  stepDotActive: {
    backgroundColor: COLORS.gold,
  },

  stepDotCurrent: {
    width: 24,
    borderRadius: 4,
  },

  contentArea: {
    flex: 1,
    overflow: 'hidden',
  },

  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 3,
  },

  stepWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  stepContentInner: {
    paddingBottom: SPACING.xxxl,
  },

  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },

  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  questionCard: {
    marginBottom: SPACING.xl,
  },

  questionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  questionHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  optionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    alignItems: 'center',
  },

  optionButtonRow: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    alignItems: 'center',
  },

  optionButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: COLORS.gold,
  },

  optionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },

  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },

  sliderOption: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    alignItems: 'center',
  },

  sliderOptionActive: {
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    borderColor: COLORS.success,
  },

  sliderOptionWarning: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: COLORS.gold,
  },

  sliderOptionDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderColor: COLORS.error,
  },

  sliderEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },

  sliderValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
  },

  sliderValueActive: {
    color: COLORS.success,
  },

  sliderValueWarning: {
    color: COLORS.gold,
  },

  sliderValueDanger: {
    color: COLORS.error,
  },

  sliderLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    borderRadius: 14,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Step 2 styles
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },

  breakdownCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  breakdownTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },

  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  breakdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  breakdownScore: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    minWidth: 30,
    textAlign: 'right',
  },

  breakdownWeight: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  breakdownWeighted: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    minWidth: 40,
    textAlign: 'right',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  detailsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  detailsBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },

  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  detailText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },

  // Step 3 styles
  recHeader: {
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    borderWidth: 2,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  recIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  recTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  recScore: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  suggestionsCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },

  suggestionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  patternInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  patternLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  patternValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  actionButtons: {
    gap: SPACING.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },

  actionButtonPrimary: {
    backgroundColor: COLORS.burgundy,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  actionButtonDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },

  actionButtonTextPrimary: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  actionButtonTextSecondary: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  actionButtonTextOutline: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  redoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },

  redoText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default MindsetCheckModal;
