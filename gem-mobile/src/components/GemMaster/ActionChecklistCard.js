/**
 * GEM Mobile - Action Checklist Card Widget
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Displays action items with toggle functionality.
 * Uses design tokens for consistent styling.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Square, CheckSquare, Plus, MoreVertical, ListChecks } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import widgetManagementService from '../../services/widgetManagementService';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

const ActionChecklistCard = ({ widget, onTaskToggle, isHighlighted }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { alert, AlertComponent } = useCustomAlert();

  const { tasks } = widget.data;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Clean text: remove markdown ** and ***
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/\*{1,3}/g, '').trim();
  };

  const handleToggleTask = async (taskId) => {
    try {
      const result = await widgetManagementService.toggleTask(widget.id, taskId);

      if (onTaskToggle) {
        onTaskToggle();
      }

      // Check if all completed
      if (result.allCompleted) {
        alert({
          type: 'success',
          title: 'All Done!',
          message: 'Bạn đã hoàn thành tất cả tasks! Amazing work!',
        });
      }
    } catch (error) {
      console.error('[ActionChecklistCard] Error toggling task:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể cập nhật task' });
    }
  };

  // Handle add new task
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      alert({ type: 'error', title: 'Lỗi', message: 'Vui lòng nhập nội dung task' });
      return;
    }

    try {
      const newTask = {
        id: `task_${Date.now()}`,
        title: newTaskTitle.trim(),
        completed: false,
        order: tasks.length,
      };

      const updatedTasks = [...tasks, newTask];

      await widgetManagementService.updateWidget(widget.id, {
        data: {
          ...widget.data,
          tasks: updatedTasks,
        },
      });

      setNewTaskTitle('');
      setShowAddTask(false);

      if (onTaskToggle) {
        onTaskToggle();
      }
    } catch (error) {
      console.error('[ActionChecklistCard] Error adding task:', error);
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể thêm task' });
    }
  };

  // Handle 3 dots menu
  const handleMenuPress = () => {
    alert({
      type: 'info',
      title: widget.title,
      message: 'Chọn hành động',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '➕ Thêm task',
          onPress: () => setShowAddTask(true)
        },
        {
          text: '🗑️ Xóa checklist',
          style: 'destructive',
          onPress: handleDeleteWidget
        }
      ],
    });
  };

  // Handle delete widget
  const handleDeleteWidget = () => {
    alert({
      type: 'warning',
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa checklist này?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await widgetManagementService.deleteWidget(widget.id);
              if (onTaskToggle) onTaskToggle();
            } catch (error) {
              alert({ type: 'error', title: 'Lỗi', message: 'Không thể xóa checklist' });
            }
          }
        }
      ],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ListChecks size={SPACING.xl} color={COLORS.gold} />
          <Text style={styles.title}>{widget.title}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <MoreVertical size={SPACING.xl} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tasks */}
      <View style={styles.tasksContainer}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => handleToggleTask(task.id)}
            activeOpacity={0.7}
          >
            {task.completed ? (
              <CheckSquare size={SPACING.xxl} color={COLORS.success} />
            ) : (
              <Square size={SPACING.xxl} color={COLORS.textSubtle} />
            )}
            <Text
              style={[
                styles.taskText,
                task.completed && styles.taskTextCompleted,
              ]}
              numberOfLines={2}
            >
              {cleanText(task.title)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Progress: <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text> completed
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {/* Add Task Input */}
      {showAddTask ? (
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.addTaskInput}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder="Nhập nội dung task mới..."
            placeholderTextColor={COLORS.textSubtle}
            autoFocus
            onSubmitEditing={handleAddTask}
          />
          <View style={styles.addTaskActions}>
            <TouchableOpacity
              style={styles.saveTaskButton}
              onPress={handleAddTask}
            >
              <Text style={styles.saveTaskText}>Thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelTaskButton}
              onPress={() => {
                setShowAddTask(false);
                setNewTaskTitle('');
              }}
            >
              <Text style={styles.cancelTaskText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Add Task Button */
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddTask(true)}
          activeOpacity={0.7}
        >
          <Plus size={TYPOGRAPHY.fontSize.xxl} color={COLORS.gold} />
          <Text style={styles.addButtonText}>Thêm Task</Text>
        </TouchableOpacity>
      )}
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  tasksContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
  },
  taskText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  taskTextCompleted: {
    color: COLORS.textSubtle,
    textDecorationLine: 'line-through',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  progressCount: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  // Add Task Input styles
  addTaskContainer: {
    gap: SPACING.sm,
  },
  addTaskInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  addTaskActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  saveTaskButton: {
    flex: 1,
    backgroundColor: COLORS.gold,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  saveTaskText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
  cancelTaskButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
  },
  cancelTaskText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
});

export default ActionChecklistCard;
