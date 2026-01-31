/**
 * CalendarHeatMap.js
 * Heat map visualization for calendar activities
 * Created: January 27, 2026
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

// Heat map color scale
const HEAT_COLORS = [
  'rgba(255, 255, 255, 0.05)', // 0 activities
  'rgba(106, 91, 255, 0.2)',   // 1 activity
  'rgba(106, 91, 255, 0.4)',   // 2 activities
  'rgba(106, 91, 255, 0.6)',   // 3 activities
  'rgba(106, 91, 255, 0.8)',   // 4 activities
  'rgba(106, 91, 255, 1.0)',   // 5+ activities
];

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const CELL_SIZE = 36;
const CELL_GAP = 4;

/**
 * Get color based on activity count
 */
const getHeatColor = (count) => {
  if (count === 0) return HEAT_COLORS[0];
  if (count === 1) return HEAT_COLORS[1];
  if (count === 2) return HEAT_COLORS[2];
  if (count === 3) return HEAT_COLORS[3];
  if (count === 4) return HEAT_COLORS[4];
  return HEAT_COLORS[5];
};

/**
 * DayCell component
 */
const DayCell = ({ day, count, isToday, isSelected, onPress }) => {
  if (!day) {
    return <View style={styles.emptyCell} />;
  }

  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        { backgroundColor: getHeatColor(count) },
        isToday && styles.todayCell,
        isSelected && styles.selectedCell,
      ]}
      onPress={() => onPress?.(day)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.dayText,
        count > 2 && styles.dayTextLight,
        isToday && styles.todayText,
      ]}>
        {day}
      </Text>
      {count > 0 && (
        <View style={styles.activityDot} />
      )}
    </TouchableOpacity>
  );
};

/**
 * CalendarHeatMap Component
 */
const CalendarHeatMap = ({
  year,
  month,
  activities = {}, // { 'YYYY-MM-DD': count }
  selectedDate,
  onSelectDate,
  showLegend = true,
}) => {
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, count: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        count: activities[dateStr] || 0,
      });
    }

    return days;
  }, [year, month, activities]);

  // Check if a date is today
  const today = new Date();
  const isToday = (day) => {
    return year === today.getFullYear() &&
           month === today.getMonth() &&
           day === today.getDate();
  };

  // Check if a date is selected
  const isSelected = (dateStr) => {
    return selectedDate === dateStr;
  };

  // Month name
  const monthName = new Date(year, month).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* Month header */}
      <Text style={styles.monthTitle}>{monthName}</Text>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, index) => (
          <DayCell
            key={index}
            day={item.day}
            count={item.count}
            isToday={item.day && isToday(item.day)}
            isSelected={item.dateStr && isSelected(item.dateStr)}
            onPress={() => item.dateStr && onSelectDate?.(item.dateStr)}
          />
        ))}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Ít</Text>
          {HEAT_COLORS.map((color, index) => (
            <View
              key={index}
              style={[styles.legendBox, { backgroundColor: color }]}
            />
          ))}
          <Text style={styles.legendLabel}>Nhiều</Text>
        )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  monthTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekdayCell: {
    width: CELL_SIZE,
    marginHorizontal: CELL_GAP / 2,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    margin: CELL_GAP / 2,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_GAP / 2,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dayTextLight: {
    color: COLORS.textPrimary,
  },
  todayText: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  activityDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
});

export default CalendarHeatMap;
