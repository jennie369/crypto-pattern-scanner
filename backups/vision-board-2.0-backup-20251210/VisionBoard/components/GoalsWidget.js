/**
 * GoalsWidget - Daily goals checklist với progress bar
 *
 * Features:
 * - Checklist daily goals
 * - Progress bar
 * - Add new goal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import alertService from '../../../services/alertService';
import {
  Target,
  Check,
  Circle,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { supabase } from '../../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const GoalsWidget = ({ onUpdate }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Try to get today's goals
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (error) {
        // Table might not exist, use default goals
        setGoals([
          { id: 1, text: 'Học xong module 3 khóa trading', completed: false },
          { id: 2, text: 'Thiền 15 phút buổi sáng', completed: true },
          { id: 3, text: 'Đọc 10 trang sách', completed: false },
        ]);
      } else {
        setGoals(data || []);
      }
    } catch (error) {
      console.error('[GoalsWidget] Load error:', error);
      // Fallback to default
      setGoals([
        { id: 1, text: 'Học xong module 3 khóa trading', completed: false },
        { id: 2, text: 'Thiền 15 phút buổi sáng', completed: true },
        { id: 3, text: 'Đọc 10 trang sách', completed: false },
      ]);
    }
    setLoading(false);
  };

  const toggleGoal = async (goalId) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    setGoals(updatedGoals);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const goal = updatedGoals.find(g => g.id === goalId);
      await supabase
        .from('daily_goals')
        .update({ completed: goal.completed })
        .eq('id', goalId);

      onUpdate?.();
    } catch (error) {
      console.error('[GoalsWidget] Toggle error:', error);
    }
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_goals')
        .insert({
          user_id: user.id,
          date: today,
          text: newGoalText.trim(),
          completed: false,
        })
        .select()
        .single();

      if (error) {
        // Fallback to local
        setGoals([...goals, {
          id: Date.now(),
          text: newGoalText.trim(),
          completed: false,
        }]);
      } else {
        setGoals([...goals, data]);
      }

      setNewGoalText('');
      setShowAddGoal(false);
      onUpdate?.();
    } catch (error) {
      console.error('[GoalsWidget] Add error:', error);
      // Local fallback
      setGoals([...goals, {
        id: Date.now(),
        text: newGoalText.trim(),
        completed: false,
      }]);
      setNewGoalText('');
      setShowAddGoal(false);
    }
  };

  const deleteGoal = async (goalId) => {
    alertService.warning(
      'Xóa mục tiêu',
      'Bạn có chắc muốn xóa mục tiêu này?',
      [
        { text: 'Hủy' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setGoals(goals.filter(g => g.id !== goalId));

            try {
              await supabase
                .from('daily_goals')
                .delete()
                .eq('id', goalId);
              onUpdate?.();
            } catch (error) {
              console.error('[GoalsWidget] Delete error:', error);
            }
          },
        },
      ]
    );
  };

  // Calculate progress
  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Target size={20} color={COLORS.success} />
        <Text style={styles.headerTitle}>Mục tiêu hôm nay</Text>
      </View>

      {/* Goals List */}
      <View style={styles.goalsList}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={({ pressed }) => [
              styles.goalItem,
              pressed && { opacity: 0.7, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            ]}
            onPress={() => {
              console.log('[GoalsWidget] Goal toggled:', goal.id);
              toggleGoal(goal.id);
            }}
            onLongPress={() => {
              console.log('[GoalsWidget] Goal delete:', goal.id);
              deleteGoal(goal.id);
            }}
            delayLongPress={500}
          >
            <View style={[
              styles.checkbox,
              goal.completed && styles.checkboxChecked,
            ]}>
              {goal.completed ? (
                <Check size={14} color="#1a1a1a" />
              ) : (
                <Circle size={14} color={COLORS.textMuted} />
              )}
            </View>
            <Text style={[
              styles.goalText,
              goal.completed && styles.goalTextCompleted,
            ]}>
              {goal.text}
            </Text>
          </Pressable>
        ))}

        {/* Add Goal Input */}
        {showAddGoal ? (
          <View style={styles.addGoalContainer}>
            <TextInput
              style={styles.addGoalInput}
              placeholder="Nhập mục tiêu mới..."
              placeholderTextColor={COLORS.textMuted}
              value={newGoalText}
              onChangeText={setNewGoalText}
              onSubmitEditing={addGoal}
              autoFocus
            />
            <Pressable
              style={({ pressed }) => [
                styles.addGoalButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                console.log('[GoalsWidget] Add goal pressed');
                addGoal();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Check size={18} color={COLORS.success} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.addGoalTrigger,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              console.log('[GoalsWidget] Show add goal');
              setShowAddGoal(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={16} color={COLORS.success} />
            <Text style={styles.addGoalTriggerText}>Thêm mục tiêu</Text>
          </Pressable>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress:</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Tip */}
      <Text style={styles.tip}>
        Nhấn giữ để xóa mục tiêu
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.success,
  },
  goalsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  addGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addGoalInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  addGoalButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
  },
  addGoalTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  addGoalTriggerText: {
    fontSize: 14,
    color: COLORS.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    minWidth: 40,
    textAlign: 'right',
  },
  tip: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});

export default GoalsWidget;
