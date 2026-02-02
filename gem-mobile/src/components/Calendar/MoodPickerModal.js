/**
 * Mood Picker Modal Component
 * Modal for tracking daily mood (morning, evening, overall)
 *
 * Created: February 1, 2026
 * Part of Calendar Smart Journal System
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_GRADIENTS,
  COSMIC_SHADOWS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  GLASS_STYLES,
} from '../../theme/cosmicTokens';
import {
  saveMoodCheckIn,
  getMoodForDate,
  CHECK_IN_TYPES,
  getOrCreateTodayMood,
} from '../../services/moodTrackingService';
import { useAuth } from '../../contexts/AuthContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Mood options with emojis - Vietnamese labels
const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊', label: 'Vui vẻ', score: 5, color: COSMIC_COLORS.functional.success },
  { id: 'sad', emoji: '😢', label: 'Buồn', score: 2, color: '#6B7280' },
  { id: 'angry', emoji: '😠', label: 'Tức giận', score: 1, color: '#FF6B6B' },
  { id: 'anxious', emoji: '😰', label: 'Lo lắng', score: 2, color: COSMIC_COLORS.functional.warning },
  { id: 'calm', emoji: '😌', label: 'Bình yên', score: 4, color: COSMIC_COLORS.glow.cyan },
  { id: 'excited', emoji: '🤩', label: 'Hưng khởi', score: 5, color: COSMIC_COLORS.glow.gold },
  { id: 'tired', emoji: '😴', label: 'Mệt mỏi', score: 2, color: '#9CA3AF' },
  { id: 'neutral', emoji: '🤔', label: 'Bình thường', score: 3, color: COSMIC_COLORS.glow.purple },
];

// Check-in type labels - Vietnamese
const CHECK_IN_LABELS = {
  [CHECK_IN_TYPES.MORNING]: 'Buổi sáng',
  [CHECK_IN_TYPES.EVENING]: 'Buổi tối',
  overall: 'Tổng quan',
};

const MoodPickerModal = ({
  visible,
  onClose,
  date,
  existingMood = null,
  onMoodSaved,
}) => {
  const { user, userTier, userRole } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(CHECK_IN_TYPES.MORNING);
  const [morningMood, setMorningMood] = useState(null);
  const [eveningMood, setEveningMood] = useState(null);
  const [overallMood, setOverallMood] = useState(null);
  const [dayHighlight, setDayHighlight] = useState('');
  const [gratitudeNotes, setGratitudeNotes] = useState('');
  const [morningNote, setMorningNote] = useState('');
  const [eveningNote, setEveningNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing mood data
  useEffect(() => {
    if (visible && existingMood) {
      setMorningMood(existingMood.morning_mood || null);
      setEveningMood(existingMood.evening_mood || null);
      setOverallMood(existingMood.overall_mood || null);
      setDayHighlight(existingMood.day_highlight || '');
      setGratitudeNotes(existingMood.evening_gratitude || '');
      setMorningNote(existingMood.morning_note || '');
      setEveningNote(existingMood.evening_note || '');
    } else if (visible && !existingMood && date && user) {
      loadMoodForDate();
    }
  }, [visible, existingMood, date, user]);

  // Load mood for date
  const loadMoodForDate = async () => {
    if (!user?.id || !date) return;

    setIsLoading(true);
    try {
      const result = await getMoodForDate(user.id, date);
      if (result.success && result.data) {
        setMorningMood(result.data.morning_mood || null);
        setEveningMood(result.data.evening_mood || null);
        setOverallMood(result.data.overall_mood || null);
        setDayHighlight(result.data.day_highlight || '');
        setGratitudeNotes(result.data.evening_gratitude || '');
        setMorningNote(result.data.morning_note || '');
        setEveningNote(result.data.evening_note || '');
      }
    } catch (error) {
      console.error('[MoodPickerModal] Error loading mood:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state on close
  const handleClose = useCallback(() => {
    setMorningMood(null);
    setEveningMood(null);
    setOverallMood(null);
    setDayHighlight('');
    setGratitudeNotes('');
    setMorningNote('');
    setEveningNote('');
    setActiveTab(CHECK_IN_TYPES.MORNING);
    onClose();
  }, [onClose]);

  // Handle mood selection
  const handleMoodSelect = useCallback((moodId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (activeTab) {
      case CHECK_IN_TYPES.MORNING:
        setMorningMood(moodId);
        break;
      case CHECK_IN_TYPES.EVENING:
        setEveningMood(moodId);
        break;
      case 'overall':
        setOverallMood(moodId);
        break;
    }
  }, [activeTab]);

  // Get current mood for active tab
  const getCurrentMood = () => {
    switch (activeTab) {
      case CHECK_IN_TYPES.MORNING:
        return morningMood;
      case CHECK_IN_TYPES.EVENING:
        return eveningMood;
      case 'overall':
        return overallMood;
      default:
        return null;
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let saveSuccess = false;
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log('[MoodPickerModal] Saving mood data:', { morningMood, eveningMood, overallMood, targetDate });

      // Save morning mood if set
      if (morningMood) {
        console.log('[MoodPickerModal] Saving morning mood for date:', targetDate);
        const result = await saveMoodCheckIn(
          user.id,
          CHECK_IN_TYPES.MORNING,
          {
            mood: morningMood,
            note: morningNote,
          },
          userTier,
          userRole,
          targetDate
        );
        console.log('[MoodPickerModal] Morning mood save result:', result);
        if (result.success) saveSuccess = true;
      }

      // Save evening mood if set
      if (eveningMood) {
        console.log('[MoodPickerModal] Saving evening mood for date:', targetDate);
        const result = await saveMoodCheckIn(
          user.id,
          CHECK_IN_TYPES.EVENING,
          {
            mood: eveningMood,
            note: eveningNote,
            gratitude: gratitudeNotes,
            highlight: dayHighlight,
          },
          userTier,
          userRole,
          targetDate
        );
        console.log('[MoodPickerModal] Evening mood save result:', result);
        if (result.success) saveSuccess = true;
      }

      // Save overall mood if user is on overall tab and selected a mood
      // This works even if existing morningMood/eveningMood data was loaded
      if (activeTab === 'overall' && overallMood) {
        console.log('[MoodPickerModal] Saving overall mood for date:', targetDate);
        // Save as morning mood since overall is just a single selection
        const result = await saveMoodCheckIn(
          user.id,
          CHECK_IN_TYPES.MORNING,
          {
            mood: overallMood,
            note: dayHighlight || '',
          },
          userTier,
          userRole,
          targetDate
        );
        console.log('[MoodPickerModal] Overall mood save result:', result);
        if (result.success) saveSuccess = true;
      }
      // Also save overall mood if no tab-specific moods were set/changed
      else if (overallMood && !morningMood && !eveningMood) {
        console.log('[MoodPickerModal] Saving overall mood (fallback) for date:', targetDate);
        const result = await saveMoodCheckIn(
          user.id,
          CHECK_IN_TYPES.MORNING,
          {
            mood: overallMood,
            note: dayHighlight || '',
          },
          userTier,
          userRole,
          targetDate
        );
        console.log('[MoodPickerModal] Overall mood (fallback) save result:', result);
        if (result.success) saveSuccess = true;
      }

      if (saveSuccess) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onMoodSaved?.();
        handleClose();
      } else {
        console.error('[MoodPickerModal] No mood data was saved - no mood selected');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('[MoodPickerModal] Error saving mood:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Hôm nay';
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${day}/${month}`;
  };

  // Check if we have any mood data to save
  const hasData = morningMood || eveningMood || overallMood || dayHighlight.trim() || gratitudeNotes.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COSMIC_COLORS.bgMystic, COSMIC_COLORS.bgCosmic, COSMIC_COLORS.bgDeepSpace]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icons.Smile size={24} color={COSMIC_COLORS.glow.gold} />
              <View>
                <Text style={styles.headerTitle}>Ghi nhận tâm trạng</Text>
                <Text style={styles.headerSubtitle}>{formatDate(date)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icons.X size={24} color={COSMIC_COLORS.text.muted} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COSMIC_COLORS.glow.purple} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === CHECK_IN_TYPES.MORNING && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(CHECK_IN_TYPES.MORNING)}
                >
                  <Icons.Sunrise size={16} color={activeTab === CHECK_IN_TYPES.MORNING ? COSMIC_COLORS.glow.gold : COSMIC_COLORS.text.muted} />
                  <Text style={[
                    styles.tabText,
                    activeTab === CHECK_IN_TYPES.MORNING && styles.tabTextActive,
                  ]}>
                    Buổi sáng
                  </Text>
                  {morningMood && (
                    <Text style={styles.tabEmoji}>
                      {MOOD_OPTIONS.find(m => m.id === morningMood)?.emoji}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === CHECK_IN_TYPES.EVENING && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(CHECK_IN_TYPES.EVENING)}
                >
                  <Icons.Moon size={16} color={activeTab === CHECK_IN_TYPES.EVENING ? COSMIC_COLORS.glow.purple : COSMIC_COLORS.text.muted} />
                  <Text style={[
                    styles.tabText,
                    activeTab === CHECK_IN_TYPES.EVENING && styles.tabTextActive,
                  ]}>
                    Buổi tối
                  </Text>
                  {eveningMood && (
                    <Text style={styles.tabEmoji}>
                      {MOOD_OPTIONS.find(m => m.id === eveningMood)?.emoji}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Mood Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {activeTab === CHECK_IN_TYPES.MORNING
                    ? 'Bạn cảm thấy thế nào sáng nay?'
                    : 'Bạn cảm thấy thế nào tối nay?'}
                </Text>
                <View style={styles.moodGrid}>
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = getCurrentMood() === mood.id;
                    return (
                      <TouchableOpacity
                        key={mood.id}
                        style={[
                          styles.moodItem,
                          isSelected && styles.moodItemSelected,
                          isSelected && { borderColor: mood.color },
                        ]}
                        onPress={() => handleMoodSelect(mood.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={[
                          styles.moodLabel,
                          isSelected && { color: mood.color },
                        ]}>
                          {mood.label}
                        </Text>
                        {isSelected && (
                          <View style={[styles.selectedIndicator, { backgroundColor: mood.color }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Note for current mood */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {activeTab === CHECK_IN_TYPES.MORNING
                    ? 'Ghi chú buổi sáng (tùy chọn)'
                    : 'Ghi chú buổi tối (tùy chọn)'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    activeTab === CHECK_IN_TYPES.MORNING
                      ? 'Viết vài dòng về cảm xúc sáng nay...'
                      : 'Viết vài dòng về cảm xúc tối nay...'
                  }
                  placeholderTextColor={COSMIC_COLORS.text.hint}
                  value={activeTab === CHECK_IN_TYPES.MORNING ? morningNote : eveningNote}
                  onChangeText={activeTab === CHECK_IN_TYPES.MORNING ? setMorningNote : setEveningNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Day Highlight - Show only in evening tab */}
              {activeTab === CHECK_IN_TYPES.EVENING && (
                <>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icons.Lightbulb size={18} color={COSMIC_COLORS.glow.gold} />
                      <Text style={styles.sectionTitle}>Điểm nổi bật trong ngày</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Điều gì tốt đẹp nhất đã xảy ra hôm nay?"
                      placeholderTextColor={COSMIC_COLORS.text.hint}
                      value={dayHighlight}
                      onChangeText={setDayHighlight}
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Gratitude Notes */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icons.Heart size={18} color={COSMIC_COLORS.ritualThemes.heart.primary} />
                      <Text style={styles.sectionTitle}>Ghi chú biết ơn</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Hôm nay bạn biết ơn điều gì?"
                      placeholderTextColor={COSMIC_COLORS.text.hint}
                      value={gratitudeNotes}
                      onChangeText={setGratitudeNotes}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}

              {/* Spacer for keyboard */}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !hasData && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasData || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COSMIC_COLORS.bgDeepSpace} />
              ) : (
                <>
                  <Icons.Check size={14} color={COSMIC_COLORS.bgDeepSpace} />
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    borderTopLeftRadius: COSMIC_RADIUS.xxl,
    borderTopRightRadius: COSMIC_RADIUS.xxl,
    maxHeight: SCREEN_HEIGHT * 0.80,
    paddingBottom: Platform.OS === 'ios' ? 40 : 60,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.borderGlow,
    borderBottomWidth: 0,
    ...COSMIC_SHADOWS.glowMedium,
    shadowColor: COSMIC_COLORS.glow.purple,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: COSMIC_SPACING.xl,
    paddingTop: COSMIC_SPACING.lg,
  },
  loadingContainer: {
    padding: COSMIC_SPACING.huge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    marginTop: COSMIC_SPACING.md,
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.md,
    marginBottom: COSMIC_SPACING.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.lg,
    borderRadius: COSMIC_RADIUS.lg,
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  tabActive: {
    borderColor: COSMIC_COLORS.glow.purple,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  tabText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabEmoji: {
    fontSize: 16,
  },
  // Section styles
  section: {
    marginBottom: COSMIC_SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
    marginBottom: COSMIC_SPACING.sm,
  },
  sectionTitle: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: COSMIC_SPACING.md,
  },
  // Mood grid styles
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.md,
  },
  moodItem: {
    width: (SCREEN_WIDTH - COSMIC_SPACING.xl * 2 - COSMIC_SPACING.md * 3) / 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glass.border,
    position: 'relative',
  },
  moodItemSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: COSMIC_SPACING.xs,
  },
  moodLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    width: '60%',
    height: 3,
    borderRadius: 2,
  },
  // Text input styles
  textInput: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.lg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.lg,
    color: '#FFFFFF',
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    minHeight: 80,
  },
  // Action button styles
  actionContainer: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.sm,
  },
  cancelButton: {
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.lg,
    borderRadius: COSMIC_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.xl,
    borderRadius: COSMIC_RADIUS.md,
    backgroundColor: COSMIC_COLORS.glow.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: COSMIC_SPACING.xs,
  },
  saveButtonDisabled: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    opacity: 0.5,
  },
  saveButtonText: {
    color: COSMIC_COLORS.bgDeepSpace,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
});

export default MoodPickerModal;
