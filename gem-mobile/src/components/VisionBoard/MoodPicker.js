/**
 * MoodPicker.js
 * Modal component for mood selection in Calendar Smart Journal
 * Supports morning, midday, evening check-ins with energy/sleep tracking
 *
 * Created: January 28, 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Smile,
  Sparkles,
  Heart,
  Check,
  Meh,
  Battery,
  AlertCircle,
  Frown,
  Zap,
  Flame,
  X,
  Moon,
  Sun,
  Coffee,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, GLASS } from '../../theme';
import { MOODS, MOOD_FACTORS, CHECK_IN_TYPES, getCheckInPrompt } from '../../services/moodTrackingService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon mapping for moods
const MOOD_ICONS = {
  happy: Smile,
  excited: Sparkles,
  peaceful: Heart,
  content: Check,
  neutral: Meh,
  tired: Battery,
  anxious: AlertCircle,
  sad: Frown,
  stressed: Zap,
  angry: Flame,
};

// Energy levels
const ENERGY_LEVELS = [
  { id: 1, label: 'Rất thấp', emoji: '1' },
  { id: 2, label: 'Thấp', emoji: '2' },
  { id: 3, label: 'Trung bình', emoji: '3' },
  { id: 4, label: 'Cao', emoji: '4' },
  { id: 5, label: 'Rất cao', emoji: '5' },
];

// Sleep quality
const SLEEP_QUALITY = [
  { id: 1, label: 'Rất tệ', emoji: '1' },
  { id: 2, label: 'Tệ', emoji: '2' },
  { id: 3, label: 'Bình thường', emoji: '3' },
  { id: 4, label: 'Tốt', emoji: '4' },
  { id: 5, label: 'Tuyệt vời', emoji: '5' },
];

// Productivity levels (evening)
const PRODUCTIVITY_LEVELS = [
  { id: 1, label: 'Không hiệu quả', emoji: '1' },
  { id: 2, label: 'Ít hiệu quả', emoji: '2' },
  { id: 3, label: 'Trung bình', emoji: '3' },
  { id: 4, label: 'Hiệu quả', emoji: '4' },
  { id: 5, label: 'Rất hiệu quả', emoji: '5' },
];

/**
 * MoodPicker Component
 */
const MoodPicker = ({
  visible,
  onClose,
  onSave,
  checkInType = CHECK_IN_TYPES.MORNING,
  initialData = {},
  loading = false,
  mode = 'checkin', // 'checkin' or 'select' (simple mood selection)
}) => {
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState(initialData.mood || null);
  const [energy, setEnergy] = useState(initialData.energy || null);
  const [sleepQuality, setSleepQuality] = useState(initialData.sleep_quality || null);
  const [productivity, setProductivity] = useState(initialData.productivity || null);
  const [selectedFactors, setSelectedFactors] = useState(initialData.factors || []);
  const [note, setNote] = useState(initialData.note || '');
  const [highlight, setHighlight] = useState(initialData.highlight || '');
  const [lowlight, setLowlight] = useState(initialData.lowlight || '');
  const [gratitude, setGratitude] = useState(initialData.gratitude || '');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Reset state when modal opens/closes or check-in type changes
  useEffect(() => {
    if (visible) {
      setStep(0);
      setSelectedMood(initialData.mood || null);
      setEnergy(initialData.energy || null);
      setSleepQuality(initialData.sleep_quality || null);
      setProductivity(initialData.productivity || null);
      setSelectedFactors(initialData.factors || []);
      setNote(initialData.note || '');
      setHighlight(initialData.highlight || '');
      setLowlight(initialData.lowlight || '');
      setGratitude(initialData.gratitude || '');

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
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, initialData, checkInType]);

  // Get steps based on check-in type
  const getSteps = useCallback(() => {
    if (mode === 'select') {
      return ['mood'];
    }

    switch (checkInType) {
      case CHECK_IN_TYPES.MORNING:
        return ['mood', 'energy', 'sleep', 'factors', 'note'];
      case CHECK_IN_TYPES.MIDDAY:
        return ['mood', 'factors', 'note'];
      case CHECK_IN_TYPES.EVENING:
        return ['mood', 'productivity', 'factors', 'highlights', 'note'];
      default:
        return ['mood'];
    }
  }, [checkInType, mode]);

  const steps = getSteps();
  const totalSteps = steps.length;
  const currentStepName = steps[step];

  // Handle mood selection
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    if (mode === 'select') {
      handleSave({ mood: moodId });
    }
  };

  // Handle factor toggle
  const handleFactorToggle = (factorId) => {
    setSelectedFactors((prev) =>
      prev.includes(factorId)
        ? prev.filter((f) => f !== factorId)
        : [...prev, factorId]
    );
  };

  // Handle next step
  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  // Handle save
  const handleSave = (overrideData = null) => {
    const data = overrideData || {
      mood: selectedMood,
      energy: checkInType === CHECK_IN_TYPES.MORNING ? energy : undefined,
      sleep_quality: checkInType === CHECK_IN_TYPES.MORNING ? sleepQuality : undefined,
      productivity: checkInType === CHECK_IN_TYPES.EVENING ? productivity : undefined,
      factors: selectedFactors,
      note: note.trim() || undefined,
      highlight: checkInType === CHECK_IN_TYPES.EVENING ? highlight.trim() || undefined : undefined,
      lowlight: checkInType === CHECK_IN_TYPES.EVENING ? lowlight.trim() || undefined : undefined,
      gratitude: checkInType === CHECK_IN_TYPES.EVENING ? gratitude.trim() || undefined : undefined,
    };

    // Clean undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    onSave?.(data);
  };

  // Handle close with animation
  const handleClose = () => {
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
    ]).start(() => {
      onClose?.();
    });
  };

  // Check if can proceed
  const canProceed = () => {
    switch (currentStepName) {
      case 'mood':
        return !!selectedMood;
      case 'energy':
        return !!energy;
      case 'sleep':
        return !!sleepQuality;
      case 'productivity':
        return !!productivity;
      default:
        return true;
    }
  };

  // Render mood selection
  const renderMoodSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{getCheckInPrompt(checkInType)}</Text>

      <View style={styles.moodGrid}>
        {Object.values(MOODS).map((mood) => {
          const IconComponent = MOOD_ICONS[mood.id];
          const isSelected = selectedMood === mood.id;

          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                isSelected && { backgroundColor: mood.color + '30', borderColor: mood.color },
              ]}
              onPress={() => handleMoodSelect(mood.id)}
              activeOpacity={0.7}
            >
              {IconComponent && (
                <IconComponent
                  size={28}
                  color={isSelected ? mood.color : COLORS.textMuted}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              )}
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && { color: mood.color },
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render energy selection
  const renderEnergySelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Mức năng lượng của bạn?</Text>
      <Text style={styles.stepSubtitle}>Chọn mức năng lượng từ 1-5</Text>

      <View style={styles.levelRow}>
        {ENERGY_LEVELS.map((level) => {
          const isSelected = energy === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelItem,
                isSelected && styles.levelItemSelected,
              ]}
              onPress={() => setEnergy(level.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelEmoji, isSelected && styles.levelEmojiSelected]}>
                {level.emoji}
              </Text>
              <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render sleep quality
  const renderSleepQuality = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Moon size={24} color={COLORS.purple} />
        <Text style={styles.stepTitle}>Chất lượng giấc ngủ?</Text>
      </View>
      <Text style={styles.stepSubtitle}>Đêm qua bạn ngủ thế nào?</Text>

      <View style={styles.levelRow}>
        {SLEEP_QUALITY.map((level) => {
          const isSelected = sleepQuality === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelItem,
                isSelected && styles.levelItemSelected,
              ]}
              onPress={() => setSleepQuality(level.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelEmoji, isSelected && styles.levelEmojiSelected]}>
                {level.emoji}
              </Text>
              <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render productivity selection
  const renderProductivity = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Zap size={24} color={COLORS.gold} />
        <Text style={styles.stepTitle}>Hiệu quả làm việc hôm nay?</Text>
      </View>
      <Text style={styles.stepSubtitle}>Đánh giá mức độ hoàn thành công việc</Text>

      <View style={styles.levelRow}>
        {PRODUCTIVITY_LEVELS.map((level) => {
          const isSelected = productivity === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelItem,
                isSelected && styles.levelItemSelected,
              ]}
              onPress={() => setProductivity(level.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.levelEmoji, isSelected && styles.levelEmojiSelected]}>
                {level.emoji}
              </Text>
              <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render factors selection
  const renderFactors = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Điều gì ảnh hưởng đến bạn?</Text>
      <Text style={styles.stepSubtitle}>Chọn các yếu tố (tùy chọn)</Text>

      <Text style={styles.factorSectionTitle}>Tích cực</Text>
      <View style={styles.factorGrid}>
        {MOOD_FACTORS.filter((f) => f.category === 'positive').map((factor) => {
          const isSelected = selectedFactors.includes(factor.id);
          return (
            <TouchableOpacity
              key={factor.id}
              style={[
                styles.factorChip,
                isSelected && styles.factorChipSelected,
              ]}
              onPress={() => handleFactorToggle(factor.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.factorChipText,
                  isSelected && styles.factorChipTextSelected,
                ]}
              >
                {factor.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.factorSectionTitle, { marginTop: SPACING.md }]}>Tiêu cực</Text>
      <View style={styles.factorGrid}>
        {MOOD_FACTORS.filter((f) => f.category === 'negative').map((factor) => {
          const isSelected = selectedFactors.includes(factor.id);
          return (
            <TouchableOpacity
              key={factor.id}
              style={[
                styles.factorChip,
                isSelected && styles.factorChipSelectedNegative,
              ]}
              onPress={() => handleFactorToggle(factor.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.factorChipText,
                  isSelected && styles.factorChipTextSelected,
                ]}
              >
                {factor.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render highlights (evening)
  const renderHighlights = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Điểm nổi bật trong ngày</Text>

      <Text style={styles.inputLabel}>Điều tốt đẹp nhất hôm nay</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Vd: Hoàn thành dự án quan trọng..."
        placeholderTextColor={COLORS.textMuted}
        value={highlight}
        onChangeText={setHighlight}
        multiline
        maxLength={200}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Điều chưa tốt</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Vd: Mất tập trung vào buổi chiều..."
        placeholderTextColor={COLORS.textMuted}
        value={lowlight}
        onChangeText={setLowlight}
        multiline
        maxLength={200}
      />

      <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Biết ơn điều gì?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Vd: Cảm ơn gia đình, sức khỏe..."
        placeholderTextColor={COLORS.textMuted}
        value={gratitude}
        onChangeText={setGratitude}
        multiline
        maxLength={200}
      />
    </View>
  );

  // Render note
  const renderNote = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ghi chú thêm (tùy chọn)</Text>

      <TextInput
        style={[styles.textInput, { minHeight: 100 }]}
        placeholder="Viết thêm suy nghĩ của bạn..."
        placeholderTextColor={COLORS.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />

      <Text style={styles.charCount}>{note.length}/500</Text>
    </View>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStepName) {
      case 'mood':
        return renderMoodSelection();
      case 'energy':
        return renderEnergySelection();
      case 'sleep':
        return renderSleepQuality();
      case 'productivity':
        return renderProductivity();
      case 'factors':
        return renderFactors();
      case 'highlights':
        return renderHighlights();
      case 'note':
        return renderNote();
      default:
        return null;
    }
  };

  // Get check-in type icon
  const getCheckInIcon = () => {
    switch (checkInType) {
      case CHECK_IN_TYPES.MORNING:
        return <Sun size={20} color={COLORS.gold} />;
      case CHECK_IN_TYPES.MIDDAY:
        return <Coffee size={20} color={COLORS.cyan} />;
      case CHECK_IN_TYPES.EVENING:
        return <Moon size={20} color={COLORS.purple} />;
      default:
        return null;
    }
  };

  // Get check-in type label
  const getCheckInLabel = () => {
    switch (checkInType) {
      case CHECK_IN_TYPES.MORNING:
        return 'Buổi sáng';
      case CHECK_IN_TYPES.MIDDAY:
        return 'Giữa ngày';
      case CHECK_IN_TYPES.EVENING:
        return 'Buổi tối';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  {getCheckInIcon()}
                  <Text style={styles.headerTitle}>{getCheckInLabel()}</Text>
                </View>

                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Progress indicator */}
              {mode !== 'select' && totalSteps > 1 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${((step + 1) / totalSteps) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {step + 1}/{totalSteps}
                  </Text>
                </View>
              )}

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {renderStepContent()}
              </ScrollView>

              {/* Footer */}
              {mode !== 'select' && (
                <View style={styles.footer}>
                  {step > 0 ? (
                    <TouchableOpacity
                      onPress={handlePrev}
                      style={styles.backButton}
                    >
                      <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}

                  <TouchableOpacity
                    onPress={handleNext}
                    style={[
                      styles.nextButton,
                      !canProceed() && styles.nextButtonDisabled,
                    ]}
                    disabled={!canProceed() || loading}
                  >
                    <Text style={styles.nextButtonText}>
                      {step === totalSteps - 1 ? 'Lưu' : 'Tiếp'}
                    </Text>
                    <ChevronRight size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  stepContent: {},
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moodItem: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 4) / 5,
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  levelItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  levelItemSelected: {
    backgroundColor: COLORS.gold + '20',
    borderColor: COLORS.gold,
  },
  levelEmoji: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  levelEmojiSelected: {
    color: COLORS.gold,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  levelLabelSelected: {
    color: COLORS.gold,
  },
  factorSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  factorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  factorChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  factorChipSelected: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  factorChipSelectedNegative: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  factorChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  factorChipTextSelected: {
    color: COLORS.textPrimary,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    minHeight: 60,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
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
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
});

export default MoodPicker;
