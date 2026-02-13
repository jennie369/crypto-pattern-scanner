/**
 * Gemral - Schedule Picker Component
 * Feature #16: Date/time picker for scheduling posts
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BUTTON } from '../utils/tokens';

const SchedulePicker = ({
  visible,
  onClose,
  onSchedule,
  initialDate = null,
  minDate = new Date(),
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [step, setStep] = useState('date'); // 'date' | 'time'

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setSelectedHour(initialDate.getHours());
      setSelectedMinute(initialDate.getMinutes());
    }
  }, [initialDate]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ day, date });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return; // Can't select past dates

    setSelectedDate(date);
    setStep('time');
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleConfirm = () => {
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(selectedHour, selectedMinute, 0, 0);

    if (scheduledDate <= new Date()) {
      // Show error - can't schedule in the past
      return;
    }

    onSchedule?.(scheduledDate);
    onClose?.();
  };

  const formatMonthYear = (date) => {
    const months = [
      'Thang 1', 'Thang 2', 'Thang 3', 'Thang 4',
      'Thang 5', 'Thang 6', 'Thang 7', 'Thang 8',
      'Thang 9', 'Thang 10', 'Thang 11', 'Thang 12',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === 'date' ? 'Chon ngay' : 'Chon gio'}
            </Text>
            <View style={styles.headerRight}>
              {step === 'time' && (
                <TouchableOpacity
                  onPress={() => setStep('date')}
                  style={styles.backButton}
                >
                  <Calendar size={20} color={COLORS.cyan} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {step === 'date' ? (
            <>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                  <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                  <ChevronRight size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Weekday Headers */}
              <View style={styles.weekdayRow}>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <Text key={day} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {generateCalendarDays().map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isToday(item.date) && styles.dayCellToday,
                      isSelected(item.date) && styles.dayCellSelected,
                      isPast(item.date) && styles.dayCellPast,
                    ]}
                    onPress={() => handleDateSelect(item.date)}
                    disabled={!item.day || isPast(item.date)}
                  >
                    {item.day && (
                      <Text
                        style={[
                          styles.dayText,
                          isToday(item.date) && styles.dayTextToday,
                          isSelected(item.date) && styles.dayTextSelected,
                          isPast(item.date) && styles.dayTextPast,
                        ]}
                      >
                        {item.day}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Time Picker */}
              <View style={styles.timeContainer}>
                {/* Hour Selection */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Gio</Text>
                  <ScrollView
                    style={styles.timeScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeItem,
                          selectedHour === hour && styles.timeItemSelected,
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.timeItemText,
                            selectedHour === hour && styles.timeItemTextSelected,
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minute Selection */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Phut</Text>
                  <ScrollView
                    style={styles.timeScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeItem,
                          selectedMinute === minute && styles.timeItemSelected,
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text
                          style={[
                            styles.timeItemText,
                            selectedMinute === minute && styles.timeItemTextSelected,
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Selected DateTime Preview */}
              <View style={styles.previewContainer}>
                <Clock size={16} color={COLORS.cyan} />
                <Text style={styles.previewText}>
                  {selectedDate.toLocaleDateString('vi-VN')} luc{' '}
                  {selectedHour.toString().padStart(2, '0')}:
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Check size={20} color={COLORS.textPrimary} />
                <Text style={styles.confirmButtonText}>Xac nhan lich hen</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  backButton: {
    padding: SPACING.xs,
  },
  // Month Navigation
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  // Weekdays
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  dayCellSelected: {
    backgroundColor: COLORS.purple,
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  dayTextToday: {
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  dayTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  dayTextPast: {
    color: COLORS.textMuted,
  },
  // Time Picker
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  timeScroll: {
    height: 150,
    width: 80,
  },
  timeItem: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  timeItemSelected: {
    backgroundColor: COLORS.purple,
  },
  timeItemText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textSecondary,
  },
  timeItemTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  timeSeparator: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
  },
  // Preview
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 10,
    marginBottom: SPACING.lg,
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.cyan,
  },
  // Confirm Button
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: BUTTON.borderRadius,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default SchedulePicker;
