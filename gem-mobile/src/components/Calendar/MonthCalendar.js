/**
 * Month Calendar Component
 * Full month view with event dots
 *
 * Created: December 9, 2025
 * Updated: December 10, 2025 - Calendar System 2.0 UI
 * Part of Vision Board 2.0 Redesign
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vietnamese weekday names
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Vietnamese weekday full names
const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Vietnamese month names
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

// Calendar event source types and their display config
const EVENT_SOURCE_CONFIG = {
  goal_deadline: {
    color: COLORS.burgundy || '#8B1C3A',
    icon: 'Target',
    label: 'Deadline',
    priority: 1,
  },
  action_due: {
    color: COLORS.gold,
    icon: 'CheckSquare',
    label: 'Hành động',
    priority: 2,
  },
  habit_schedule: {
    color: COLORS.success,
    icon: 'Repeat',
    label: 'Thói quen',
    priority: 3,
  },
  divination_reading: {
    color: COLORS.purple,
    icon: 'Sparkles',
    label: 'Bói toán',
    priority: 4,
  },
  checkin: {
    color: COLORS.success,
    icon: 'CalendarCheck',
    label: 'Điểm danh',
    priority: 5,
  },
  course_lesson: {
    color: '#3B82F6',
    icon: 'BookOpen',
    label: 'Bài học',
    priority: 6,
  },
};

const MonthCalendar = ({
  eventsByDate = {}, // { '2025-12-09': [event1, event2], ... }
  selectedDate = null,
  onDateSelect = () => {},
  onMonthChange = () => {},
  onEventComplete = () => {},
  onAddEvent = () => {},
  initialDate = new Date(),
  showHeader = true,
  showLegend = true,
  compact = false,
  style,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, day: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = eventsByDate[dateString] || [];
      const hasDeadline = events.some(e => e.source_type === 'goal_deadline');
      days.push({
        date: dateString,
        day,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
        events,
        hasDeadline,
      });
    }

    return days;
  }, [currentMonth, today, selectedDate, eventsByDate]);

  // Navigate months
  const goToPreviousMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  }, [currentMonth, onMonthChange]);

  const goToNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
  }, [currentMonth, onMonthChange]);

  const goToToday = useCallback(() => {
    const todayDate = new Date();
    const newMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth);
    onDateSelect(today);
  }, [today, onMonthChange, onDateSelect]);

  // Handle day press - show modal with day details
  const handleDayPress = useCallback((item) => {
    if (!item.date) return;
    onDateSelect(item.date);
    if (item.events.length > 0) {
      setSelectedDayData(item);
      setDayModalVisible(true);
    }
  }, [onDateSelect]);

  // Get event display info (dots or indicators)
  const getEventIndicators = (events, hasDeadline) => {
    if (!events || events.length === 0) return { dots: [], showDeadline: false };

    // Group by source type
    const types = [...new Set(events.map(e => e.source_type))];
    const dots = types.slice(0, 3).map(type => {
      const config = EVENT_SOURCE_CONFIG[type];
      return config?.color || COLORS.gold;
    });

    return { dots, showDeadline: hasDeadline };
  };

  // Format date for modal title
  const formatDateTitle = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dayOfWeek = WEEKDAYS_FULL[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const cellSize = compact ? 36 : 44;

  return (
    <View style={[styles.container, style]}>
      {/* Header with month navigation */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            style={styles.navButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icons.ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToToday} style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icons.ChevronRight size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={[styles.weekdayCell, { width: cellSize }]}>
            <Text
              style={[
                styles.weekdayText,
                index === 0 && styles.weekdayTextSunday,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, index) => {
          const { dots, showDeadline } = getEventIndicators(item.events, item.hasDeadline);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                { width: cellSize, height: cellSize },
                item.isToday && styles.dayCellToday,
                item.isSelected && styles.dayCellSelected,
                showDeadline && styles.dayCellDeadline,
              ]}
              onPress={() => handleDayPress(item)}
              disabled={!item.date}
            >
              {item.day && (
                <>
                  <Text
                    style={[
                      styles.dayText,
                      compact && styles.dayTextCompact,
                      item.isToday && styles.dayTextToday,
                      item.isSelected && styles.dayTextSelected,
                      showDeadline && styles.dayTextDeadline,
                    ]}
                  >
                    {item.day}
                  </Text>

                  {/* Event dots */}
                  {dots.length > 0 && (
                    <View style={styles.eventDotsContainer}>
                      {dots.map((color, i) => (
                        <View
                          key={i}
                          style={[styles.eventDot, { backgroundColor: color }]}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
            <Text style={styles.legendText}>Việc cần làm</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotMultiple]}>
              <View style={[styles.legendDotInner, { backgroundColor: COLORS.gold }]} />
              <View style={[styles.legendDotInner, { backgroundColor: COLORS.purple }]} />
            </View>
            <Text style={styles.legendText}>Nhiều việc</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.burgundy || '#8B1C3A' }]} />
            <Text style={styles.legendText}>Deadline</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendTodayBox} />
            <Text style={styles.legendText}>Hôm nay</Text>
          </View>
        </View>
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={dayModalVisible}
        onClose={() => setDayModalVisible(false)}
        dateString={selectedDayData?.date}
        events={selectedDayData?.events || []}
        onEventComplete={onEventComplete}
        onAddEvent={onAddEvent}
      />
    </View>
  );
};

// Day Detail Modal Component
const DayDetailModal = ({
  visible,
  onClose,
  dateString,
  events = [],
  onEventComplete,
  onAddEvent,
}) => {
  // Format date title
  const formatDateTitle = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dayOfWeek = WEEKDAYS_FULL[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  // Sort events by priority
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const priorityA = EVENT_SOURCE_CONFIG[a.source_type]?.priority || 99;
      const priorityB = EVENT_SOURCE_CONFIG[b.source_type]?.priority || 99;
      return priorityA - priorityB;
    });
  }, [events]);

  // Get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      Target: Icons.Target,
      CheckSquare: Icons.CheckSquare,
      Repeat: Icons.Repeat,
      Sparkles: Icons.Sparkles,
      CalendarCheck: Icons.CalendarCheck,
      BookOpen: Icons.BookOpen,
    };
    return iconMap[iconName] || Icons.Calendar;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>{formatDateTitle(dateString)}</Text>
              <Text style={styles.modalSubtitle}>
                {events.length} việc cần làm
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Icons.X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Events List */}
          <ScrollView style={styles.modalEventsList} showsVerticalScrollIndicator={false}>
            {sortedEvents.map((event, index) => {
              const config = EVENT_SOURCE_CONFIG[event.source_type] || {};
              const IconComponent = getIconComponent(config.icon);
              const isDeadline = event.source_type === 'goal_deadline';

              return (
                <View
                  key={event.id || index}
                  style={[
                    styles.modalEventCard,
                    isDeadline && styles.modalEventCardDeadline,
                  ]}
                >
                  <View style={styles.modalEventHeader}>
                    <View style={[styles.modalEventIcon, { backgroundColor: `${config.color || COLORS.gold}20` }]}>
                      <IconComponent size={16} color={config.color || COLORS.gold} />
                    </View>
                    <View style={styles.modalEventInfo}>
                      <Text style={styles.modalEventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      {event.description && (
                        <Text style={styles.modalEventDesc} numberOfLines={1}>
                          {event.description}
                        </Text>
                      )}
                    </View>
                    {isDeadline && (
                      <View style={styles.modalEventBadge}>
                        <Text style={styles.modalEventBadgeText}>Quan trọng</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalEventFooter}>
                    <View style={styles.modalEventMeta}>
                      <View style={[styles.modalEventTag, { backgroundColor: `${config.color || COLORS.gold}20` }]}>
                        <Text style={[styles.modalEventTagText, { color: config.color || COLORS.gold }]}>
                          {config.label || 'Sự kiện'}
                        </Text>
                      </View>
                      {event.xp_reward && (
                        <Text style={styles.modalEventXP}>+{event.xp_reward} XP</Text>
                      )}
                    </View>

                    {!event.is_completed && onEventComplete && (
                      <TouchableOpacity
                        style={styles.modalEventCompleteBtn}
                        onPress={() => onEventComplete(event)}
                      >
                        <Icons.Check size={16} color="#000" />
                      </TouchableOpacity>
                    )}
                    {event.is_completed && (
                      <Icons.CheckCircle size={20} color={COLORS.success} />
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Add Event Button */}
          {onAddEvent && (
            <TouchableOpacity
              style={styles.modalAddEventBtn}
              onPress={() => {
                onClose();
                onAddEvent(dateString);
              }}
            >
              <Icons.Plus size={18} color={COLORS.purple} />
              <Text style={styles.modalAddEventText}>Thêm sự kiện</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Compact version for dashboard widget - NO nested container (parent provides container)
export const MonthCalendarCompact = ({
  eventsByDate = {},
  selectedDate = null,
  onDateSelect = () => {},
  onViewFullCalendar = () => {},
  showLegend = false,
  style,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, day: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateString,
        day,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
        events: eventsByDate[dateString] || [],
      });
    }
    return days;
  }, [currentMonth, today, selectedDate, eventsByDate]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  const getEventDots = (events) => {
    if (!events || events.length === 0) return [];
    const colors = [...new Set(events.map(e => e.color || COLORS.gold))];
    return colors.slice(0, 3);
  };

  const cellSize = 36;

  return (
    <View style={style}>
      {/* Month navigation row */}
      <View style={styles.compactMonthNav}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Icons.ChevronLeft size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.compactMonthTitle}>
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Icons.ChevronRight size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={[styles.weekdayCell, { width: cellSize }]}>
            <Text style={[styles.weekdayText, index === 0 && styles.weekdayTextSunday]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              { width: cellSize, height: cellSize },
              item.isToday && styles.dayCellToday,
              item.isSelected && styles.dayCellSelected,
            ]}
            onPress={() => item.date && onDateSelect(item.date)}
            disabled={!item.date}
          >
            {item.day && (
              <>
                <Text
                  style={[
                    styles.dayTextCompact,
                    item.isToday && styles.dayTextToday,
                    item.isSelected && styles.dayTextSelected,
                  ]}
                >
                  {item.day}
                </Text>
                {item.events.length > 0 && (
                  <View style={styles.eventDotsContainer}>
                    {getEventDots(item.events).map((color, i) => (
                      <View key={i} style={[styles.eventDot, { backgroundColor: color }]} />
                    ))}
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
            <Text style={styles.legendText}>Việc cần làm</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.burgundy || '#8B1C3A' }]} />
            <Text style={styles.legendText}>Deadline</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendTodayBox} />
            <Text style={styles.legendText}>Hôm nay</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Calendar event item for lists
export const CalendarEventItem = ({
  event,
  onPress,
  onComplete,
  showDate = false,
}) => {
  const getIcon = () => {
    const iconMap = {
      target: Icons.Target,
      'check-circle': Icons.CheckCircle,
      repeat: Icons.Repeat,
      sparkles: Icons.Sparkles,
      calendar: Icons.Calendar,
    };
    const IconComponent = iconMap[event.icon] || Icons.Calendar;
    return IconComponent;
  };

  const EventIcon = getIcon();

  return (
    <TouchableOpacity
      style={[
        styles.eventItem,
        event.is_completed && styles.eventItemCompleted,
      ]}
      onPress={() => onPress?.(event)}
    >
      <View style={[styles.eventIconContainer, { backgroundColor: `${event.color || COLORS.gold}20` }]}>
        <EventIcon size={16} color={event.color || COLORS.gold} />
      </View>

      <View style={styles.eventContent}>
        <Text
          style={[
            styles.eventTitle,
            event.is_completed && styles.eventTitleCompleted,
          ]}
          numberOfLines={1}
        >
          {event.title}
        </Text>
        {showDate && event.event_date && (
          <Text style={styles.eventDate}>
            {new Date(event.event_date).toLocaleDateString('vi-VN')}
          </Text>
        )}
      </View>

      {onComplete && !event.is_completed && (
        <TouchableOpacity
          onPress={() => onComplete(event)}
          style={styles.completeButton}
        >
          <Icons.Circle size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {event.is_completed && (
        <Icons.CheckCircle size={20} color={COLORS.success} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.xs,
  },
  monthTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekdayCell: {
    alignItems: 'center',
  },
  weekdayText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  weekdayTextSunday: {
    color: COLORS.error,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xxs,
    borderRadius: SPACING.sm,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  dayCellSelected: {
    backgroundColor: COLORS.purple,
  },
  dayCellDeadline: {
    backgroundColor: `${COLORS.burgundy || '#8B1C3A'}20`,
  },
  dayText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dayTextCompact: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dayTextToday: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dayTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dayTextDeadline: {
    color: COLORS.burgundy || '#8B1C3A',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  eventDotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 2,
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Legend styles
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotMultiple: {
    flexDirection: 'row',
    width: 14,
    height: 8,
    borderRadius: 0,
    backgroundColor: 'transparent',
    gap: 2,
  },
  legendDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendTodayBox: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },

  // Day Detail Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDarkest || '#1a1a2e',
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xxs,
  },
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  modalEventsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  modalEventCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  modalEventCardDeadline: {
    borderColor: COLORS.burgundy || '#8B1C3A',
    borderLeftWidth: 4,
  },
  modalEventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  modalEventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEventInfo: {
    flex: 1,
  },
  modalEventTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: 20,
  },
  modalEventDesc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xxs,
  },
  modalEventBadge: {
    backgroundColor: `${COLORS.burgundy || '#8B1C3A'}30`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.xs,
  },
  modalEventBadgeText: {
    color: COLORS.burgundy || '#8B1C3A',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modalEventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalEventTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.xs,
  },
  modalEventTagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  modalEventXP: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modalEventCompleteBtn: {
    backgroundColor: COLORS.gold,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: SPACING.md,
    borderStyle: 'dashed',
  },
  modalAddEventText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Compact styles
  compactContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  compactTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  compactMonthTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  compactMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Event item styles
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  eventItemCompleted: {
    opacity: 0.6,
  },
  eventIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  eventTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  eventDate: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xxs,
  },
  completeButton: {
    padding: SPACING.xs,
  },
});

export default MonthCalendar;
