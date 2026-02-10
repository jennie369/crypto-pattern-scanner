/**
 * Today Tasks List Component
 * Today's tasks with checkbox and XP reward
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// Life area colors
const LIFE_AREA_COLORS = {
  finance: COLORS.gold,
  career: COLORS.purple,
  health: COLORS.success,
  relationships: '#FF6B9D',
  personal: COLORS.cyan,
  spiritual: COLORS.burgundy,
};

const TodayTasksList = ({
  tasks = [],
  onTaskPress,
  onTaskComplete,
  onViewAll,
  maxItems = 5,
  style,
}) => {
  const displayTasks = tasks.slice(0, maxItems);
  const remainingCount = Math.max(0, tasks.length - maxItems);

  const renderTask = ({ item, index }) => (
    <TaskItem
      key={item.id}
      task={item}
      onPress={() => onTaskPress?.(item)}
      onComplete={() => onTaskComplete?.(item)}
      isLast={index === displayTasks.length - 1}
    />
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icons.ListTodo size={18} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Việc cần làm hôm nay</Text>
        </View>
        {onViewAll && tasks.length > 0 && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Icons.ChevronRight size={14} color={COLORS.purple} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons.CheckCircle size={40} color={COLORS.success} />
          <Text style={styles.emptyTitle}>Tuyệt vời!</Text>
          <Text style={styles.emptyText}>Bạn đã hoàn thành tất cả tasks hôm nay</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={displayTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {remainingCount > 0 && (
            <TouchableOpacity onPress={onViewAll} style={styles.moreButton}>
              <Text style={styles.moreText}>+{remainingCount} tasks khác</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

// Individual task item
export const TaskItem = ({
  task,
  onPress,
  onComplete,
  showXP = true,
  isLast = false,
}) => {
  const lifeAreaColor = LIFE_AREA_COLORS[task.content?.life_area] || COLORS.purple;
  const xpReward = task.content?.xp_reward || 20;
  const isCompleted = task.is_completed;

  return (
    <TouchableOpacity
      style={[styles.taskItem, isCompleted && styles.taskItemCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxCompleted,
          { borderColor: lifeAreaColor },
        ]}
        onPress={onComplete}
      >
        {isCompleted && (
          <Icons.Check size={14} color={COLORS.bgDarkest} />
        )}
      </TouchableOpacity>

      {/* Task content */}
      <View style={styles.taskContent}>
        <Text
          style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
          numberOfLines={1}
        >
          {task.content?.title || 'Untitled Task'}
        </Text>

        {task.content?.life_area && (
          <View style={styles.taskMeta}>
            <View
              style={[styles.lifeAreaDot, { backgroundColor: lifeAreaColor }]}
            />
            <Text style={styles.lifeAreaText}>
              {getLifeAreaLabel(task.content.life_area)}
            </Text>
          </View>
        )}
      </View>

      {/* XP reward */}
      {showXP && !isCompleted && (
        <View style={styles.xpBadge}>
          <Icons.Sparkles size={12} color={COLORS.gold} />
          <Text style={styles.xpText}>+{xpReward}</Text>
        </View>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <Icons.CheckCircle size={20} color={COLORS.success} />
      )}
    </TouchableOpacity>
  );
};

// Helper function
const getLifeAreaLabel = (area) => {
  // 6 lĩnh vực cuộc sống theo kịch bản demo
  const labels = {
    finance: 'Tài chính',
    career: 'Sự nghiệp',
    health: 'Sức khỏe',
    relationships: 'Tình yêu',
    personal: 'Cá nhân',
    spiritual: 'Tâm thức',
  };
  return labels[area] || area;
};

// Compact task list (for widgets)
export const TodayTasksCompact = ({
  tasks = [],
  onTaskComplete,
  maxItems = 3,
}) => {
  const incompleteTasks = tasks.filter(t => !t.is_completed).slice(0, maxItems);

  if (incompleteTasks.length === 0) {
    return (
      <View style={styles.compactEmpty}>
        <Icons.CheckCircle size={20} color={COLORS.success} />
        <Text style={styles.compactEmptyText}>Hoàn thành!</Text>
      </View>
    );
  }

  return (
    <View style={styles.compactContainer}>
      {incompleteTasks.map((task, index) => (
        <TouchableOpacity
          key={task.id}
          style={[
            styles.compactTask,
            index < incompleteTasks.length - 1 && styles.compactTaskBorder,
          ]}
          onPress={() => onTaskComplete?.(task)}
        >
          <Icons.Circle size={16} color={COLORS.textMuted} />
          <Text style={styles.compactTaskText} numberOfLines={1}>
            {task.content?.title || 'Task'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
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
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.xs,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
  },
  lifeAreaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  lifeAreaText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  xpText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.xxs,
  },
  moreButton: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.sm,
  },
  moreText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Compact styles
  compactContainer: {
    gap: SPACING.xs,
  },
  compactTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  compactTaskBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  compactTaskText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  compactEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  compactEmptyText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
});

export default TodayTasksList;
