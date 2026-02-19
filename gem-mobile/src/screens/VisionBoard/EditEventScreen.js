/**
 * Edit Event Screen
 * Screen for editing existing calendar events
 *
 * Created: February 2026
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../../utils/tokens';
import {
  COSMIC_COLORS,
  COSMIC_GRADIENTS,
  COSMIC_SHADOWS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  GLASS_STYLES,
} from '../../theme/cosmicTokens';
import { supabase } from '../../services/supabase';
import calendarService from '../../services/calendarService';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Event color options (same as AddEventModal)
const COLOR_OPTIONS = [
  { color: '#6A5BFF', name: 'Tím' },
  { color: '#FFBD59', name: 'Vàng' },
  { color: '#3AF7A6', name: 'Xanh lá' },
  { color: '#00F0FF', name: 'Xanh dương' },
  { color: '#FF6B6B', name: 'Đỏ' },
  { color: '#F093FB', name: 'Hồng' },
];

// Life area options (same as AddEventModal)
const LIFE_AREA_OPTIONS = [
  { key: 'finance', label: 'Tài chính', icon: 'DollarSign' },
  { key: 'crypto', label: 'Crypto', icon: 'Bitcoin' },
  { key: 'relationships', label: 'Mối quan hệ', icon: 'Heart' },
  { key: 'career', label: 'Sự nghiệp', icon: 'Briefcase' },
  { key: 'health', label: 'Sức khỏe', icon: 'Activity' },
  { key: 'personal', label: 'Phát triển', icon: 'Star' },
];

// Memoized color option component
const ColorOption = memo(({ color, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.colorOption,
      { backgroundColor: color },
      isSelected && styles.colorOptionSelected,
    ]}
    onPress={() => onSelect(color)}
    activeOpacity={0.7}
  >
    {isSelected && <Icons.Check size={16} color="#fff" />}
  </TouchableOpacity>
));

// Memoized life area option component
const LifeAreaOption = memo(({ area, isSelected, onSelect }) => {
  const AreaIcon = Icons[area.icon] || Icons.Tag;
  return (
    <TouchableOpacity
      style={[
        styles.lifeAreaOption,
        isSelected && styles.lifeAreaOptionSelected,
      ]}
      onPress={() => onSelect(area.key)}
      activeOpacity={0.7}
    >
      <AreaIcon
        size={14}
        color={isSelected ? '#FFFFFF' : COSMIC_COLORS.text.muted}
      />
      <Text
        style={[
          styles.lifeAreaLabel,
          isSelected && styles.lifeAreaLabelSelected,
        ]}
      >
        {area.label}
      </Text>
    </TouchableOpacity>
  );
});

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params
  const { eventId, date } = route.params || {};

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Event data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].color);
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventDate, setEventDate] = useState(date || '');

  // Original event data for comparison
  const [originalEvent, setOriginalEvent] = useState(null);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[EditEventScreen] Force refresh received');
      setLoading(false);
      setSaving(false);
      setDeleting(false);
    });
    return () => listener.remove();
  }, []);

  // Initialize - get user and load event
  useEffect(() => {
    const init = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
        if (!user) {
          Alert.alert('Lỗi', 'Không thể xác định người dùng');
          navigation.goBack();
          return;
        }
        setUserId(user.id);

        // Load event data
        if (eventId) {
          await loadEvent(user.id, eventId);
        } else {
          setError('Không tìm thấy sự kiện');
          setLoading(false);
        }
      } catch (err) {
        console.error('[EditEventScreen] Init error:', err);
        setError(err.message || 'Đã xảy ra lỗi');
        setLoading(false);
      }
    };

    init();
  }, [eventId]);

  // Load event data from database
  const loadEvent = async (uid, eid) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eid)
        .eq('user_id', uid)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Không tìm thấy sự kiện');
      }

      // Populate form with event data
      setOriginalEvent(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setSelectedColor(data.color || COLOR_OPTIONS[0].color);
      setSelectedLifeArea(data.life_area || null);
      setIsAllDay(data.is_all_day !== false);
      setStartTime(data.start_time || '');
      setEndTime(data.end_time || '');
      setEventDate(data.event_date || date || '');

      console.log('[EditEventScreen] Event loaded:', data.id);
    } catch (err) {
      console.error('[EditEventScreen] Load event error:', err);
      setError(err.message || 'Không thể tải sự kiện');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Handlers
  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);
    Haptics.selectionAsync();
  }, []);

  const handleLifeAreaSelect = useCallback((key) => {
    setSelectedLifeArea(prev => prev === key ? null : key);
    Haptics.selectionAsync();
  }, []);

  const handleToggleAllDay = useCallback((value) => {
    setIsAllDay(value);
    Haptics.selectionAsync();
  }, []);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!originalEvent) return false;
    return (
      title !== (originalEvent.title || '') ||
      description !== (originalEvent.description || '') ||
      selectedColor !== (originalEvent.color || COLOR_OPTIONS[0].color) ||
      selectedLifeArea !== (originalEvent.life_area || null) ||
      isAllDay !== (originalEvent.is_all_day !== false) ||
      startTime !== (originalEvent.start_time || '') ||
      endTime !== (originalEvent.end_time || '')
    );
  }, [originalEvent, title, description, selectedColor, selectedLifeArea, isAllDay, startTime, endTime]);

  // Handle save event
  const handleSave = async () => {
    // Validate
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!userId || !eventId) {
      setError('Không thể xác định sự kiện');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updates = {
        title: title.trim(),
        description: description.trim() || null,
        color: selectedColor,
        lifeArea: selectedLifeArea,
        isAllDay: isAllDay,
        startTime: !isAllDay && startTime ? startTime : null,
        endTime: !isAllDay && endTime ? endTime : null,
      };

      const result = await calendarService.updateEvent(eventId, userId, updates);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
      } else {
        setError(result.error || 'Không thể cập nhật sự kiện');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      console.error('[EditEventScreen] Save error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete event
  const handleDelete = () => {
    Alert.alert(
      'Xóa sự kiện',
      'Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!userId || !eventId) {
      setError('Không thể xác định sự kiện');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const result = await calendarService.deleteEvent(eventId, userId);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
      } else {
        setError(result.error || 'Không thể xóa sự kiện');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      console.error('[EditEventScreen] Delete error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle back with unsaved changes warning
  const handleBack = () => {
    if (hasChanges()) {
      Alert.alert(
        'Thay đổi chưa lưu',
        'Bạn có thay đổi chưa lưu. Bạn có muốn thoát không?',
        [
          {
            text: 'Ở lại',
            style: 'cancel',
          },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COSMIC_GRADIENTS.cosmicBg}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={COSMIC_COLORS.glow.gold} />
        <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
      </View>
    );
  }

  // Error state (no event found)
  if (error && !originalEvent) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COSMIC_GRADIENTS.cosmicBg}
          style={StyleSheet.absoluteFill}
        />
        <Icons.AlertCircle size={48} color={COSMIC_COLORS.functional.error} />
        <Text style={styles.errorTitle}>Lỗi</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COSMIC_GRADIENTS.cosmicBg}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Icons.ArrowLeft size={24} color={COSMIC_COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Chỉnh sửa sự kiện</Text>
            <Text style={styles.headerDate}>{formatDate(eventDate)}</Text>
          </View>

          <View style={styles.headerButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icons.AlertCircle size={16} color={COSMIC_COLORS.functional.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Title input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Tiêu đề sự kiện..."
                placeholderTextColor={COSMIC_COLORS.text.muted}
                maxLength={100}
                returnKeyType="next"
              />
            </View>

            {/* Description input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Thêm mô tả chi tiết..."
                placeholderTextColor={COSMIC_COLORS.text.muted}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Color picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Màu sắc</Text>
              <View style={styles.colorPicker}>
                {COLOR_OPTIONS.map((option) => (
                  <ColorOption
                    key={option.color}
                    color={option.color}
                    isSelected={selectedColor === option.color}
                    onSelect={handleColorSelect}
                  />
                ))}
              </View>
            </View>

            {/* Life area picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lĩnh vực (tùy chọn)</Text>
              <View style={styles.lifeAreaPicker}>
                {LIFE_AREA_OPTIONS.map((area) => (
                  <LifeAreaOption
                    key={area.key}
                    area={area}
                    isSelected={selectedLifeArea === area.key}
                    onSelect={handleLifeAreaSelect}
                  />
                ))}
              </View>
            </View>

            {/* All day toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Icons.Clock size={18} color={COSMIC_COLORS.text.muted} />
                <Text style={styles.toggleLabel}>Cả ngày</Text>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={handleToggleAllDay}
                trackColor={{ false: COSMIC_COLORS.glass.bg, true: COSMIC_COLORS.glow.purple }}
                thumbColor={isAllDay ? '#FFFFFF' : COSMIC_COLORS.text.muted}
                ios_backgroundColor={COSMIC_COLORS.glass.bg}
              />
            </View>

            {/* Time inputs (if not all day) */}
            {!isAllDay && (
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Bắt đầu</Text>
                  <TextInput
                    style={styles.timeField}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor={COSMIC_COLORS.text.muted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <Icons.ArrowRight size={16} color={COSMIC_COLORS.text.muted} style={styles.timeArrow} />
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Kết thúc</Text>
                  <TextInput
                    style={styles.timeField}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:00"
                    placeholderTextColor={COSMIC_COLORS.text.muted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            )}

            {/* Spacer for buttons */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving || deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={COSMIC_COLORS.functional.error} />
            ) : (
              <Icons.Trash2 size={20} color={COSMIC_COLORS.functional.error} />
            )}
          </TouchableOpacity>

          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (saving || deleting) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || deleting}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COSMIC_COLORS.bgDeepSpace} />
            ) : (
              <>
                <Icons.Check size={18} color={COSMIC_COLORS.bgDeepSpace} />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
    gap: COSMIC_SPACING.lg,
  },
  loadingText: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    marginTop: COSMIC_SPACING.md,
  },
  errorTitle: {
    color: COSMIC_COLORS.text.primary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xl,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
    marginTop: COSMIC_SPACING.lg,
  },
  errorMessage: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: COSMIC_SPACING.xxl,
  },
  backButton: {
    marginTop: COSMIC_SPACING.xl,
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xl,
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  backButtonText: {
    color: COSMIC_COLORS.text.primary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COSMIC_COLORS.glass.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: COSMIC_COLORS.text.primary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.lg,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
  },
  headerDate: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: COSMIC_SPACING.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    padding: COSMIC_SPACING.md,
    borderRadius: COSMIC_RADIUS.md,
    marginBottom: COSMIC_SPACING.lg,
    gap: COSMIC_SPACING.sm,
  },
  errorText: {
    color: COSMIC_COLORS.functional.error,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    flex: 1,
  },
  inputGroup: {
    marginBottom: COSMIC_SPACING.lg,
  },
  inputLabel: {
    color: COSMIC_COLORS.text.secondary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    marginBottom: COSMIC_SPACING.sm,
  },
  titleInput: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.lg,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
  },
  input: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.md,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    color: COSMIC_COLORS.text.primary,
  },
  textArea: {
    minHeight: 70,
    maxHeight: 100,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  lifeAreaPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.sm,
  },
  lifeAreaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: COSMIC_SPACING.sm,
    paddingHorizontal: COSMIC_SPACING.md,
    borderRadius: COSMIC_RADIUS.lg,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    gap: COSMIC_SPACING.xs,
  },
  lifeAreaOptionSelected: {
    backgroundColor: COSMIC_COLORS.glow.purple,
  },
  lifeAreaLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  lifeAreaLabelSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: COSMIC_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.border,
    marginTop: COSMIC_SPACING.xs,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  toggleLabel: {
    color: COSMIC_COLORS.text.primary,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: COSMIC_SPACING.sm,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    color: COSMIC_COLORS.text.muted,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    marginBottom: COSMIC_SPACING.xs,
  },
  timeField: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    padding: COSMIC_SPACING.md,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
  },
  timeArrow: {
    marginHorizontal: COSMIC_SPACING.md,
    marginTop: COSMIC_SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: COSMIC_SPACING.xl,
    paddingVertical: COSMIC_SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? COSMIC_SPACING.xxl : COSMIC_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.border,
    gap: COSMIC_SPACING.md,
    backgroundColor: COSMIC_COLORS.bgCosmic,
  },
  deleteButton: {
    width: 52,
    height: 52,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: COSMIC_RADIUS.md,
    backgroundColor: COSMIC_COLORS.glow.gold,
    gap: COSMIC_SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COSMIC_COLORS.bgDeepSpace,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.base,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
  },
});

export default EditEventScreen;
