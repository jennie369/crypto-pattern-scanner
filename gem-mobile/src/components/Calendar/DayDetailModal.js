/**
 * Day Detail Modal Component
 * Modal showing events for a selected date
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Icons from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';
import { CalendarEventItem } from './MonthCalendar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vietnamese day names
const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const DayDetailModal = ({
  visible,
  date,
  events = [],
  onClose,
  onEventPress,
  onEventComplete,
  onAddEvent,
}) => {
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const dayName = DAY_NAMES[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return { dayName, day, month, full: `${day}/${month}` };
  };

  const dateInfo = formatDate(date);

  // Group events by source type
  const groupedEvents = events.reduce((acc, event) => {
    const type = event.source_type || 'manual';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {});

  // Source type labels
  const sourceTypeLabels = {
    goal_deadline: 'Deadline Mục Tiêu',
    action_due: 'Hành Động',
    habit_daily: 'Thói Quen',
    divination: 'Bói Toán',
    manual: 'Sự Kiện',
  };

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.modalContainer}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Text style={styles.dayName}>{dateInfo.dayName}</Text>
                <Text style={styles.dateNumber}>{dateInfo.day}</Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Hôm nay</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerActions}>
                {onAddEvent && (
                  <TouchableOpacity
                    onPress={() => onAddEvent(date)}
                    style={styles.addButton}
                  >
                    <Icons.Plus size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icons.X size={24} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Events list */}
            <ScrollView
              style={styles.eventsList}
              showsVerticalScrollIndicator={false}
            >
              {events.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icons.CalendarX size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>Không có sự kiện nào</Text>
                  {onAddEvent && (
                    <TouchableOpacity
                      onPress={() => onAddEvent(date)}
                      style={styles.emptyAddButton}
                    >
                      <Icons.Plus size={16} color={COLORS.purple} />
                      <Text style={styles.emptyAddText}>Thêm sự kiện</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                Object.entries(groupedEvents).map(([type, typeEvents]) => (
                  <View key={type} style={styles.eventGroup}>
                    <Text style={styles.groupTitle}>
                      {sourceTypeLabels[type] || type}
                    </Text>
                    {typeEvents.map((event) => (
                      <CalendarEventItem
                        key={event.id}
                        event={event}
                        onPress={onEventPress}
                        onComplete={onEventComplete}
                      />
                    ))}
                  </View>
                ))
              )}

              {/* Summary stats */}
              {events.length > 0 && (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.filter(e => e.is_completed).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Hoàn thành</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.filter(e => !e.is_completed).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Còn lại</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {events.length}
                    </Text>
                    <Text style={styles.summaryLabel}>Tổng</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

// Quick add event button (floating)
export const AddEventFAB = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icons.Plus size={24} color={COLORS.bgDarkest} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 34, // Safe area
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateContainer: {
    flex: 1,
  },
  dayName: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dateNumber: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: 40,
  },
  todayBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  todayText: {
    color: COLORS.bgDarkest,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  eventsList: {
    padding: SPACING.lg,
  },
  eventGroup: {
    marginBottom: SPACING.lg,
  },
  groupTitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  emptyAddText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  summaryItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // FAB styles
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DayDetailModal;
