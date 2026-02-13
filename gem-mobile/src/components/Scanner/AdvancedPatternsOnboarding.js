/**
 * GEM Mobile - Advanced Patterns Onboarding
 * Educational modal for Quasimodo and FTR patterns
 *
 * Phase 1B: Quasimodo + FTR Detection
 *
 * Shows when user first encounters advanced patterns
 * 5-step carousel explaining QM and FTR concepts
 */

import React, { memo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Target,
  Shield,
  Zap,
  RefreshCw,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BORDER_RADIUS } from '../../utils/tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORAGE_KEY = '@gem_advanced_patterns_onboarding_seen';

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'intro',
    title: 'Advanced Patterns',
    subtitle: 'Nâng cao kỹ năng trading',
    content:
      'Chào mừng bạn đến với Advanced Patterns! Đây là những pattern có độ chính xác cao nhất trong GEM Method.',
    highlights: [
      { icon: 'Award', text: 'Quasimodo: 5 sao - 73-75% win rate', color: COLORS.gold },
      { icon: 'Zap', text: 'FTR: 4 sao - 66-68% win rate', color: COLORS.success },
      { icon: 'Target', text: 'Zone Trading: Entry & Stop chính xác', color: COLORS.purple },
    ],
    bgGradient: [COLORS.purple + '30', COLORS.purple + '10'],
  },
  {
    id: 'quasimodo',
    title: 'Quasimodo Pattern',
    subtitle: 'Pattern đảo chiều mạnh nhất',
    content:
      'Quasimodo (QM) là biến thể của Head & Shoulders nhưng mạnh hơn. Bắt đỉnh/đáy với độ chính xác cao.',
    diagram: {
      type: 'qm_bearish',
      labels: [
        { name: 'LS', description: 'Left Shoulder' },
        { name: 'HEAD', description: 'Đỉnh cao nhất' },
        { name: 'RS', description: 'Right Shoulder (thấp hơn HEAD)' },
        { name: 'BOS', description: 'Break of Structure (xác nhận)' },
      ],
    },
    highlights: [
      { icon: 'Target', text: 'Entry: Tại QML (Higher Low trước Head)', color: COLORS.gold },
      { icon: 'Shield', text: 'Stop: Trên MPL (Head) + buffer', color: COLORS.error },
      { icon: 'CheckCircle', text: 'Confirm: Đợi BOS trước khi vào lệnh', color: COLORS.success },
    ],
    bgGradient: [COLORS.error + '30', COLORS.error + '10'],
  },
  {
    id: 'qm_levels',
    title: 'QML & MPL Levels',
    subtitle: 'Điểm entry và stop loss',
    content:
      'QML (Quasimodo Level) là điểm entry tối ưu. MPL (Maximum Pain Level) là điểm invalidation.',
    keyPoints: [
      {
        title: 'QML - Entry Point',
        description: 'Higher Low trước Head (bearish) hoặc Lower High trước Head (bullish)',
        icon: 'Target',
        color: COLORS.gold,
      },
      {
        title: 'MPL - Stop Level',
        description: 'Giá của Head. Nếu giá vượt qua, pattern thất bại',
        icon: 'Shield',
        color: COLORS.error,
      },
      {
        title: 'BOS - Confirmation',
        description: 'Lower Low (bearish) hoặc Higher High (bullish) xác nhận đảo chiều',
        icon: 'CheckCircle',
        color: COLORS.success,
      },
    ],
    bgGradient: [COLORS.gold + '30', COLORS.gold + '10'],
  },
  {
    id: 'ftr',
    title: 'FTR Pattern',
    subtitle: 'Fail To Return - Continuation',
    content:
      'FTR xảy ra khi giá phá S/R rồi không quay lại được. Vùng base trở thành demand/supply mới.',
    diagram: {
      type: 'ftr_bullish',
      labels: [
        { name: 'Resistance', description: 'Level bị phá' },
        { name: 'Break', description: 'Giá vượt lên trên' },
        { name: 'Base', description: 'Pullback không chạm lại resistance' },
        { name: 'Confirm', description: 'New high xác nhận FTR' },
      ],
    },
    highlights: [
      { icon: 'ArrowUpRight', text: 'Bullish FTR: Phá resistance, base thành demand', color: COLORS.success },
      { icon: 'ArrowDownRight', text: 'Bearish FTR: Phá support, base thành supply', color: COLORS.error },
      { icon: 'RefreshCw', text: 'FTB (First Time Back): Lần đầu test = tốt nhất', color: COLORS.gold },
    ],
    bgGradient: [COLORS.success + '30', COLORS.success + '10'],
  },
  {
    id: 'summary',
    title: 'Sẵn sàng!',
    subtitle: 'Bắt đầu trading với Advanced Patterns',
    content:
      'Bạn đã hiểu cơ bản về Quasimodo và FTR. Hãy thực hành với Paper Trade trước khi trade thật!',
    tips: [
      'Luôn đợi BOS xác nhận trước khi vào lệnh QM',
      'FTR zone fresh (chưa test) có xác suất cao nhất',
      'Risk management: Chỉ risk 1-2% mỗi trade',
      'Combine với Multi-timeframe để tăng độ chính xác',
    ],
    reward: {
      type: 'gem',
      amount: 20,
      message: 'Hoàn thành onboarding!',
    },
    bgGradient: [COLORS.cyan + '30', COLORS.cyan + '10'],
  },
];

const AdvancedPatternsOnboarding = memo(({
  visible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalSteps = ONBOARDING_STEPS.length;
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const animateTransition = useCallback((callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(callback, 150);
  }, [fadeAnim]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      animateTransition(() => {
        setCurrentStep((prev) => prev + 1);
      });
    }
  }, [isLastStep, animateTransition]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      animateTransition(() => {
        setCurrentStep((prev) => prev - 1);
      });
    }
  }, [isFirstStep, animateTransition]);

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      onComplete?.();
      onClose?.();
    } catch (error) {
      console.error('[AdvancedPatternsOnboarding] Save error:', error);
      onClose?.();
    }
  }, [onClose, onComplete]);

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      onClose?.();
    } catch (error) {
      console.error('[AdvancedPatternsOnboarding] Skip error:', error);
      onClose?.();
    }
  }, [onClose]);

  // Render icon by name
  const renderIcon = (iconName, size = 20, color = COLORS.textPrimary) => {
    const icons = {
      Award: <Award size={size} color={color} />,
      Zap: <Zap size={size} color={color} />,
      Target: <Target size={size} color={color} />,
      Shield: <Shield size={size} color={color} />,
      CheckCircle: <CheckCircle size={size} color={color} />,
      ArrowUpRight: <ArrowUpRight size={size} color={color} />,
      ArrowDownRight: <ArrowDownRight size={size} color={color} />,
      RefreshCw: <RefreshCw size={size} color={color} />,
      TrendingDown: <TrendingDown size={size} color={color} />,
      TrendingUp: <TrendingUp size={size} color={color} />,
      Info: <Info size={size} color={color} />,
    };
    return icons[iconName] || null;
  };

  // Render QM diagram
  const renderQMDiagram = () => (
    <View style={styles.diagramContainer}>
      <View style={styles.qmDiagram}>
        {/* LS */}
        <View style={[styles.qmPoint, { bottom: '40%', left: '10%' }]}>
          <View style={[styles.qmDot, { backgroundColor: COLORS.purple }]} />
          <Text style={styles.qmLabel}>LS</Text>
        </View>
        {/* HEAD */}
        <View style={[styles.qmPoint, { bottom: '75%', left: '35%' }]}>
          <View style={[styles.qmDot, { backgroundColor: COLORS.error }]} />
          <Text style={styles.qmLabel}>HEAD</Text>
        </View>
        {/* QML */}
        <View style={[styles.qmPoint, { bottom: '30%', left: '25%' }]}>
          <View style={[styles.qmDot, { backgroundColor: COLORS.gold }]} />
          <Text style={[styles.qmLabel, { color: COLORS.gold }]}>QML</Text>
        </View>
        {/* RS */}
        <View style={[styles.qmPoint, { bottom: '55%', left: '60%' }]}>
          <View style={[styles.qmDot, { backgroundColor: COLORS.purple }]} />
          <Text style={styles.qmLabel}>RS</Text>
        </View>
        {/* BOS */}
        <View style={[styles.qmPoint, { bottom: '20%', left: '85%' }]}>
          <View style={[styles.qmDot, { backgroundColor: COLORS.success }]} />
          <Text style={[styles.qmLabel, { color: COLORS.success }]}>BOS</Text>
        </View>
        {/* Trend line */}
        <View style={styles.qmLine} />
      </View>
    </View>
  );

  // Render FTR diagram
  const renderFTRDiagram = () => (
    <View style={styles.diagramContainer}>
      <View style={styles.ftrDiagram}>
        {/* Resistance line */}
        <View style={styles.ftrResistanceLine}>
          <Text style={styles.ftrLineLabel}>Resistance</Text>
        </View>
        {/* Break point */}
        <View style={[styles.ftrPoint, { bottom: '60%', left: '30%' }]}>
          <View style={[styles.ftrDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.ftrLabel}>Break</Text>
        </View>
        {/* Base zone */}
        <View style={styles.ftrBaseZone}>
          <Text style={styles.ftrZoneLabel}>Base Zone</Text>
        </View>
        {/* Confirmation */}
        <View style={[styles.ftrPoint, { bottom: '70%', left: '75%' }]}>
          <View style={[styles.ftrDot, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.ftrLabel}>Confirm</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                    index < currentStep && styles.progressDotComplete,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.content}</Text>

            {/* Diagram */}
            {step.diagram?.type === 'qm_bearish' && renderQMDiagram()}
            {step.diagram?.type === 'ftr_bullish' && renderFTRDiagram()}

            {/* Highlights */}
            {step.highlights && (
              <View style={styles.highlightsContainer}>
                {step.highlights.map((highlight, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <View style={[styles.highlightIcon, { backgroundColor: highlight.color + '20' }]}>
                      {renderIcon(highlight.icon, 18, highlight.color)}
                    </View>
                    <Text style={styles.highlightText}>{highlight.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Key Points */}
            {step.keyPoints && (
              <View style={styles.keyPointsContainer}>
                {step.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <View style={[styles.keyPointIcon, { backgroundColor: point.color + '20' }]}>
                      {renderIcon(point.icon, 20, point.color)}
                    </View>
                    <View style={styles.keyPointContent}>
                      <Text style={[styles.keyPointTitle, { color: point.color }]}>
                        {point.title}
                      </Text>
                      <Text style={styles.keyPointDescription}>{point.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {step.tips && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips</Text>
                {step.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <CheckCircle size={14} color={COLORS.success} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Reward */}
            {step.reward && (
              <View style={styles.rewardContainer}>
                <Award size={24} color={COLORS.gold} />
                <Text style={styles.rewardText}>
                  +{step.reward.amount} GEM - {step.reward.message}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigation}>
            {!isFirstStep ? (
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <ChevronLeft size={20} color={COLORS.textSecondary} />
                <Text style={styles.navButtonText}>Trước</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navButton} />
            )}

            <Text style={styles.stepIndicator}>
              {currentStep + 1} / {totalSteps}
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navButton, styles.navButtonPrimary]}
            >
              <Text style={styles.navButtonTextPrimary}>
                {isLastStep ? 'Hoàn thành' : 'Tiếp'}
              </Text>
              {!isLastStep && <ChevronRight size={20} color={COLORS.gold} />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

// Check if onboarding should be shown
export const shouldShowAdvancedPatternsOnboarding = async () => {
  try {
    const seen = await AsyncStorage.getItem(STORAGE_KEY);
    return seen !== 'true';
  } catch {
    return true;
  }
};

// Reset onboarding (for testing)
export const resetAdvancedPatternsOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[AdvancedPatternsOnboarding] Reset error:', error);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    backgroundColor: GLASS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.purple + '40',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted + '30',
  },
  progressDotActive: {
    backgroundColor: COLORS.gold,
    width: 20,
  },
  progressDotComplete: {
    backgroundColor: COLORS.success,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Diagrams
  diagramContainer: {
    height: 120,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  qmDiagram: {
    flex: 1,
    position: 'relative',
  },
  qmPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  qmDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  qmLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  qmLine: {
    position: 'absolute',
    bottom: '25%',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: COLORS.textMuted + '30',
  },
  ftrDiagram: {
    flex: 1,
    position: 'relative',
  },
  ftrResistanceLine: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.error + '60',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: SPACING.sm,
  },
  ftrLineLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    position: 'absolute',
    top: -14,
    left: SPACING.sm,
  },
  ftrPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  ftrDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ftrLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ftrBaseZone: {
    position: 'absolute',
    bottom: '30%',
    left: '40%',
    width: '30%',
    height: 30,
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ftrZoneLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },

  // Highlights
  highlightsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Key Points
  keyPointsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  keyPointItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  keyPointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPointContent: {
    flex: 1,
  },
  keyPointTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xxs,
  },
  keyPointDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Tips
  tipsContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Reward
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.gold + '15',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  rewardText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.textMuted + '20',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.gold + '20',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  navButtonTextPrimary: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  stepIndicator: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

AdvancedPatternsOnboarding.displayName = 'AdvancedPatternsOnboarding';

export default AdvancedPatternsOnboarding;
