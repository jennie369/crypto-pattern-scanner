/**
 * Gemral - Schedule Message Sheet Component
 * Bottom sheet for scheduling messages to send later
 *
 * Features:
 * - Date picker
 * - Time picker
 * - Quick presets (tonight, tomorrow, etc.)
 * - Timezone display
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const SHEET_HEIGHT = 480;

// Quick schedule presets
const getPresets = () => {
  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);
  if (tonight <= now) tonight.setDate(tonight.getDate() + 1);

  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(9, 0, 0, 0);

  const tomorrowAfternoon = new Date(now);
  tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
  tomorrowAfternoon.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);

  return [
    { label: 'Tonight at 8 PM', date: tonight, icon: 'moon-outline' },
    { label: 'Tomorrow morning', date: tomorrowMorning, icon: 'sunny-outline' },
    { label: 'Tomorrow afternoon', date: tomorrowAfternoon, icon: 'partly-sunny-outline' },
    { label: 'Next week', date: nextWeek, icon: 'calendar-outline' },
  ];
};

const ScheduleMessageSheet = memo(({
  visible,
  onClose,
  onSchedule,
}) => {
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Presets
  const presets = getPresets();

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Reset state when opened
  useEffect(() => {
    if (visible) {
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(0, 0, 0);
      setSelectedDate(defaultTime);
    }
  }, [visible]);

  // Open animation
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(preset.date);
  }, []);

  // Handle date change
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
    }
  };

  // Handle time change
  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours(), time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  // Handle schedule
  const handleSchedule = useCallback(async () => {
    if (scheduling) return;

    // Validate date is in future
    if (selectedDate <= new Date()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setScheduling(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onSchedule?.(selectedDate);
      handleClose();
    } catch (error) {
      console.error('Error scheduling message:', error);
    } finally {
      setScheduling(false);
    }
  }, [selectedDate, scheduling, onSchedule, handleClose]);

  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if date is valid (in future)
  const isValidDate = selectedDate > new Date();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={40} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="calendar" size={24} color={COLORS.cyan} />
            <Text style={styles.title}>Schedule Message</Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Presets */}
            <Text style={styles.sectionTitle}>Quick Options</Text>
            <View style={styles.presets}>
              {presets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.presetItem,
                    selectedDate.getTime() === preset.date.getTime() && styles.presetItemSelected,
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={preset.icon}
                    size={18}
                    color={selectedDate.getTime() === preset.date.getTime() ? COLORS.cyan : COLORS.textMuted}
                  />
                  <Text style={[
                    styles.presetLabel,
                    selectedDate.getTime() === preset.date.getTime() && styles.presetLabelSelected,
                  ]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date/Time */}
            <Text style={styles.sectionTitle}>Custom Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.cyan} />
                <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={20} color={COLORS.cyan} />
                <Text style={styles.dateTimeText}>{formatTime(selectedDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Summary */}
            <View style={styles.summary}>
              <Ionicons name="send" size={18} color={COLORS.textMuted} />
              <Text style={styles.summaryText}>
                Will be sent {formatDate(selectedDate)} at {formatTime(selectedDate)}
              </Text>
            </View>
          </ScrollView>

          {/* Schedule Button */}
          <TouchableOpacity
            style={[styles.scheduleButton, !isValidDate && styles.scheduleButtonDisabled]}
            onPress={handleSchedule}
            disabled={!isValidDate || scheduling}
            activeOpacity={0.8}
          >
            <Ionicons name="time" size={20} color={COLORS.textPrimary} />
            <Text style={styles.scheduleButtonText}>
              {scheduling ? 'Scheduling...' : 'Schedule Message'}
            </Text>
          </TouchableOpacity>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              themeVariant="dark"
            />
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant="dark"
            />
          )}
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

ScheduleMessageSheet.displayName = 'ScheduleMessageSheet';

export default ScheduleMessageSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Presets
  presets: {
    gap: SPACING.xs,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    gap: SPACING.sm,
  },
  presetItemSelected: {
    backgroundColor: 'rgba(0, 221, 235, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  presetLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  presetLabelSelected: {
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Date Time
  dateTimeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 221, 235, 0.3)',
  },
  dateTimeText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Summary
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Schedule Button
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cyan,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  scheduleButtonDisabled: {
    backgroundColor: 'rgba(0, 221, 235, 0.3)',
  },
  scheduleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
