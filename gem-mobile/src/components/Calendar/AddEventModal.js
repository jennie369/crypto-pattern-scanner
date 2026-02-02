/**
 * Add Event Modal Component
 * Modal for creating new calendar events
 * OPTIMIZED: Removed BlurView for better performance
 *
 * Created: January 2026
 * Updated: February 2026 - Performance optimization
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Switch,
  Animated,
} from 'react-native';
import * as Icons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, INPUT } from '../../utils/tokens';
import calendarService, { EVENT_SOURCE_TYPES } from '../../services/calendarService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Event color options
const COLOR_OPTIONS = [
  { color: '#6A5BFF', name: 'Tím' },
  { color: '#FFBD59', name: 'Vàng' },
  { color: '#3AF7A6', name: 'Xanh lá' },
  { color: '#00F0FF', name: 'Xanh dương' },
  { color: '#FF6B6B', name: 'Đỏ' },
  { color: '#F093FB', name: 'Hồng' },
];

// Life area options
const LIFE_AREA_OPTIONS = [
  { key: 'finance', label: 'Tài chính', icon: 'DollarSign' },
  { key: 'crypto', label: 'Crypto', icon: 'Bitcoin' },
  { key: 'relationships', label: 'Mối quan hệ', icon: 'Heart' },
  { key: 'career', label: 'Sự nghiệp', icon: 'Briefcase' },
  { key: 'health', label: 'Sức khỏe', icon: 'Activity' },
  { key: 'personal', label: 'Phát triển', icon: 'Star' },
];

// Memoized color option to prevent re-renders
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

// Memoized life area option
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
        color={isSelected ? '#FFFFFF' : COLORS.textMuted}
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

const AddEventModal = ({
  visible,
  date,
  userId,
  onClose,
  onEventCreated,
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].color);
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation for modal
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setSelectedColor(COLOR_OPTIONS[0].color);
      setSelectedLifeArea(null);
      setIsAllDay(true);
      setStartTime('');
      setEndTime('');
      setError(null);

      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

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

  // Handle create event
  const handleCreateEvent = useCallback(async () => {
    // Validate
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!userId) {
      setError('Không thể xác định người dùng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        date: date,
        sourceType: EVENT_SOURCE_TYPES.MANUAL,
        color: selectedColor,
        icon: 'calendar',
        lifeArea: selectedLifeArea,
        isAllDay: isAllDay,
        startTime: !isAllDay && startTime ? startTime : null,
        endTime: !isAllDay && endTime ? endTime : null,
        priority: 1,
        metadata: {
          created_from: 'calendar_modal',
        },
      };

      const result = await calendarService.createEvent(userId, eventData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onEventCreated?.(result.event);
        onClose();
      } else {
        setError(result.error || 'Không thể tạo sự kiện');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      console.error('[AddEventModal] Create error:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [title, description, date, userId, selectedColor, selectedLifeArea, isAllDay, startTime, endTime, onEventCreated, onClose]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Thêm sự kiện</Text>
              <Text style={styles.headerDate}>{formatDate(date)}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icons.X size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Form */}
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
                <Icons.AlertCircle size={16} color={COLORS.error} />
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
                placeholderTextColor={COLORS.textMuted}
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
                placeholderTextColor={COLORS.textMuted}
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

            {/* All day toggle - Using native Switch for better performance */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Icons.Clock size={18} color={COLORS.textMuted} />
                <Text style={styles.toggleLabel}>Cả ngày</Text>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={handleToggleAllDay}
                trackColor={{ false: COLORS.glassBg, true: COLORS.purple }}
                thumbColor={isAllDay ? '#FFFFFF' : COLORS.textMuted}
                ios_backgroundColor={COLORS.glassBg}
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
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <Icons.ArrowRight size={16} color={COLORS.textMuted} style={styles.timeArrow} />
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Kết thúc</Text>
                  <TextInput
                    style={styles.timeField}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            )}

            {/* Bottom spacer for keyboard */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleCreateEvent}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.bgDarkest} />
              ) : (
                <>
                  <Icons.Plus size={18} color={COLORS.bgDarkest} />
                  <Text style={styles.createButtonText}>Tạo sự kiện</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
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
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerDate: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  formContainer: {
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  formContent: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: INPUT.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: INPUT.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 70,
    maxHeight: 100,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
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
    gap: 8,
  },
  lifeAreaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  lifeAreaOptionSelected: {
    backgroundColor: COLORS.purple,
  },
  lifeAreaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  lifeAreaLabelSelected: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  timeField: {
    backgroundColor: INPUT.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  timeArrow: {
    marginHorizontal: 12,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    gap: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: COLORS.bgDarkest,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default memo(AddEventModal);
