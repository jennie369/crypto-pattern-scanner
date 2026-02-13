/**
 * DayTimeline.js
 * Timeline view for daily activities
 * Created: January 28, 2026
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

// Activity types with icons and colors
const ACTIVITY_TYPES = {
  ritual: {
    icon: 'sparkles',
    color: COLORS.gold,
    label: 'Nghi thức',
  },
  habit: {
    icon: 'refresh',
    color: COLORS.primary,
    label: 'Thói quen',
  },
  goal: {
    icon: 'flag',
    color: COLORS.success,
    label: 'Mục tiêu',
  },
  affirmation: {
    icon: 'heart',
    color: COLORS.pink || '#FF6B9D',
    label: 'Khẳng định',
  },
  divination: {
    icon: 'moon',
    color: COLORS.purple || '#9D6BFF',
    label: 'Bói toán',
  },
};

/**
 * Timeline item component
 */
const TimelineItem = ({ activity, isFirst, isLast }) => {
  const type = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.ritual;
  const time = activity.completedAt
    ? new Date(activity.completedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <View style={styles.timelineItem}>
      {/* Time column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* Connector line */}
      <View style={styles.connectorColumn}>
        {!isFirst && <View style={styles.connectorLine} />}
        <View style={[styles.connectorDot, { backgroundColor: type.color }]}>
          <Ionicons name={type.icon} size={12} color={COLORS.white} />
        </View>
        {!isLast && <View style={styles.connectorLine} />}
      </View>

      {/* Content column */}
      <View style={styles.contentColumn}>
        <View style={[styles.contentCard, { borderLeftColor: type.color }]}>
          <Text style={styles.activityLabel}>{type.label}</Text>
          <Text style={styles.activityTitle} numberOfLines={2}>
            {activity.title || activity.name}
          </Text>
          {activity.note && (
            <Text style={styles.activityNote} numberOfLines={1}>
              {activity.note}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * Empty state when no activities
 */
const EmptyTimeline = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
    <Text style={styles.emptyText}>Chưa có hoạt động nào hôm nay</Text>
    <Text style={styles.emptySubtext}>
      Hoàn thành nghi thức để bắt đầu!
    </Text>
  </View>
);

/**
 * DayTimeline Component
 */
const DayTimeline = ({
  activities = [],
  date,
  showHeader = true,
  maxItems,
}) => {
  // Sort activities by time
  const sortedActivities = useMemo(() => {
    const sorted = [...activities].sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeA - timeB;
    });

    if (maxItems && sorted.length > maxItems) {
      return sorted.slice(0, maxItems);
    }

    return sorted;
  }, [activities, maxItems]);

  // Format date for header
  const dateLabel = useMemo(() => {
    if (!date) return 'Hôm nay';

    const today = new Date();
    const targetDate = new Date(date);

    if (
      today.getDate() === targetDate.getDate() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getFullYear() === targetDate.getFullYear()
    ) {
      return 'Hôm nay';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      yesterday.getDate() === targetDate.getDate() &&
      yesterday.getMonth() === targetDate.getMonth() &&
      yesterday.getFullYear() === targetDate.getFullYear()
    ) {
      return 'Hôm qua';
    }

    return targetDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [date]);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{dateLabel}</Text>
          <Text style={styles.activityCount}>
            {activities.length} hoạt động
          </Text>
        </View>
      )}

      {sortedActivities.length === 0 ? (
        <EmptyTimeline />
      ) : (
        <ScrollView
          style={styles.timeline}
          showsVerticalScrollIndicator={false}
        >
          {sortedActivities.map((activity, index) => (
            <TimelineItem
              key={activity.id || index}
              activity={activity}
              isFirst={index === 0}
              isLast={index === sortedActivities.length - 1}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  activityCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  timeline: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: SPACING.sm,
    paddingTop: 4,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  connectorColumn: {
    width: 30,
    alignItems: 'center',
  },
  connectorLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentColumn: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderLeftWidth: 3,
  },
  activityLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  activityNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});

export default DayTimeline;
