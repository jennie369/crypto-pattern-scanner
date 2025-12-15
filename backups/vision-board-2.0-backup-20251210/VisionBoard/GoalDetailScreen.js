/**
 * Goal Detail Screen
 * View and manage a specific goal with actions, milestones
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import visionBoardService from '../../services/visionBoardService';
import { ScoreRing } from '../../components/Charts';
import { MilestoneIndicator } from '../../components/VisionBoard';

// Life area configuration
const LIFE_AREA_CONFIG = {
  finance: { label: 'Tài chính', icon: 'Wallet', color: COLORS.gold },
  career: { label: 'Sự nghiệp', icon: 'Briefcase', color: COLORS.purple },
  health: { label: 'Sức khỏe', icon: 'Heart', color: COLORS.success },
  relationships: { label: 'Quan hệ', icon: 'Users', color: '#FF6B9D' },
  personal: { label: 'Cá nhân', icon: 'User', color: COLORS.cyan },
  spiritual: { label: 'Tâm linh', icon: 'Sparkles', color: COLORS.burgundy },
};

const GoalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { goalId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Goal data
  const [goal, setGoal] = useState(null);
  const [actions, setActions] = useState([]);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [newActionText, setNewActionText] = useState('');

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load goal data
  const loadGoal = useCallback(async () => {
    if (!userId || !goalId) return;

    try {
      // Get goal widget
      const { data: goalData, error } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setGoal(goalData);
      setEditTitle(goalData?.content?.title || '');

      // Get actions for this goal
      const { data: actionsData } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('widget_type', 'action')
        .eq('content->>parent_goal_id', goalId)
        .order('created_at', { ascending: true });

      setActions(actionsData || []);
    } catch (error) {
      console.error('[GoalDetail] Load error:', error);
    }
  }, [userId, goalId]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadGoal();
      setLoading(false);
    };
    if (userId && goalId) init();
  }, [userId, goalId, loadGoal]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoal();
    setRefreshing(false);
  };

  // Toggle action complete
  const handleToggleAction = async (action) => {
    try {
      const newCompleted = !action.is_completed;

      await supabase
        .from('vision_board_widgets')
        .update({
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq('id', action.id);

      // Update goal progress
      const totalActions = actions.length;
      const completedActions = actions.filter(a =>
        a.id === action.id ? newCompleted : a.is_completed
      ).length;
      const newProgress = totalActions > 0
        ? Math.round((completedActions / totalActions) * 100)
        : 0;

      await supabase
        .from('vision_board_widgets')
        .update({
          content: {
            ...goal.content,
            progress: newProgress,
          },
          is_completed: newProgress === 100,
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
        })
        .eq('id', goalId);

      await loadGoal();
    } catch (error) {
      console.error('[GoalDetail] Toggle action error:', error);
    }
  };

  // Add new action
  const handleAddAction = async () => {
    if (!newActionText.trim() || !userId) return;

    try {
      await supabase
        .from('vision_board_widgets')
        .insert({
          user_id: userId,
          widget_type: 'action',
          content: {
            title: newActionText.trim(),
            parent_goal_id: goalId,
            life_area: goal?.content?.life_area || 'personal',
          },
          is_completed: false,
        });

      setNewActionText('');
      await loadGoal();
    } catch (error) {
      console.error('[GoalDetail] Add action error:', error);
    }
  };

  // Delete action
  const handleDeleteAction = (action) => {
    Alert.alert(
      'Xóa hành động',
      `Bạn có chắc muốn xóa "${action.content?.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('vision_board_widgets')
                .delete()
                .eq('id', action.id);
              await loadGoal();
            } catch (error) {
              console.error('[GoalDetail] Delete action error:', error);
            }
          },
        },
      ]
    );
  };

  // Save goal edits
  const handleSaveGoal = async () => {
    if (!editTitle.trim()) return;

    try {
      await supabase
        .from('vision_board_widgets')
        .update({
          content: {
            ...goal.content,
            title: editTitle.trim(),
          },
        })
        .eq('id', goalId);

      setIsEditing(false);
      await loadGoal();
    } catch (error) {
      console.error('[GoalDetail] Save goal error:', error);
    }
  };

  // Delete goal
  const handleDeleteGoal = () => {
    Alert.alert(
      'Xóa mục tiêu',
      'Bạn có chắc muốn xóa mục tiêu này và tất cả hành động liên quan?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete actions first
              await supabase
                .from('vision_board_widgets')
                .delete()
                .eq('content->>parent_goal_id', goalId);

              // Delete goal
              await supabase
                .from('vision_board_widgets')
                .delete()
                .eq('id', goalId);

              navigation.goBack();
            } catch (error) {
              console.error('[GoalDetail] Delete goal error:', error);
            }
          },
        },
      ]
    );
  };

  // Get config
  const lifeArea = goal?.content?.life_area || 'personal';
  const config = LIFE_AREA_CONFIG[lifeArea] || LIFE_AREA_CONFIG.personal;
  const IconComponent = Icons[config.icon] || Icons.Target;
  const progress = goal?.content?.progress || 0;
  const deadline = goal?.content?.deadline;
  const isCompleted = goal?.is_completed;

  // Format deadline
  const formatDeadline = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icons.ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết mục tiêu</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icons.AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy mục tiêu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết mục tiêu</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Icons.Edit3 size={20} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.purple}
          />
        }
      >
        {/* Goal Card */}
        <View style={[styles.goalCard, { borderColor: `${config.color}50` }]}>
          {/* Status Badge */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icons.CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.completedText}>Hoàn thành</Text>
            </View>
          )}

          {/* Icon and Title */}
          <View style={styles.goalHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
              <IconComponent size={32} color={config.color} />
            </View>

            <View style={styles.goalInfo}>
              <Text style={[styles.lifeAreaLabel, { color: config.color }]}>
                {config.label}
              </Text>
              {isEditing ? (
                <TextInput
                  style={styles.titleInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Tên mục tiêu"
                  placeholderTextColor={COLORS.textMuted}
                />
              ) : (
                <Text style={styles.goalTitle}>{goal.content?.title || 'Mục tiêu'}</Text>
              )}
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressSection}>
            <ScoreRing
              score={progress}
              label="Tiến độ"
              size={120}
              gradientColors={[config.color, `${config.color}80`]}
            />
          </View>

          {/* Milestones */}
          <View style={styles.milestonesSection}>
            <Text style={styles.milestonesLabel}>Các mốc quan trọng</Text>
            <MilestoneIndicator progress={progress} />
          </View>

          {/* Deadline */}
          {deadline && (
            <View style={styles.deadlineSection}>
              <Icons.Calendar size={16} color={COLORS.textSecondary} />
              <Text style={styles.deadlineText}>
                Hạn chót: {formatDeadline(deadline)}
              </Text>
            </View>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveGoal}
              >
                <Icons.Check size={18} color={COLORS.bgDarkest} />
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteGoal}
              >
                <Icons.Trash2 size={18} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsSectionHeader}>
            <Icons.ListTodo size={18} color={COLORS.purple} />
            <Text style={styles.actionsSectionTitle}>Hành động</Text>
            <View style={styles.actionsCount}>
              <Text style={styles.actionsCountText}>
                {actions.filter(a => a.is_completed).length}/{actions.length}
              </Text>
            </View>
          </View>

          {/* Actions List */}
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionItem, action.is_completed && styles.actionItemCompleted]}
              onPress={() => handleToggleAction(action)}
              onLongPress={() => handleDeleteAction(action)}
            >
              <View style={[
                styles.checkbox,
                action.is_completed && styles.checkboxCompleted
              ]}>
                {action.is_completed && (
                  <Icons.Check size={14} color={COLORS.bgDarkest} />
                )}
              </View>
              <Text style={[
                styles.actionText,
                action.is_completed && styles.actionTextCompleted
              ]}>
                {action.content?.title || 'Hành động'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add Action Input */}
          <View style={styles.addActionContainer}>
            <TextInput
              style={styles.addActionInput}
              value={newActionText}
              onChangeText={setNewActionText}
              placeholder="Thêm hành động mới..."
              placeholderTextColor={COLORS.textMuted}
              onSubmitEditing={handleAddAction}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addActionButton, !newActionText.trim() && styles.addActionButtonDisabled]}
              onPress={handleAddAction}
              disabled={!newActionText.trim()}
            >
              <Icons.Plus size={20} color={newActionText.trim() ? COLORS.purple : COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Icons.Lightbulb size={18} color={COLORS.gold} />
          <Text style={styles.tipsText}>
            Giữ lâu vào một hành động để xóa. Hoàn thành tất cả hành động để đạt 100%!
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  editButton: {
    padding: SPACING.xs,
  },
  placeholder: {
    width: 32,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Goal Card
  goalCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  completedText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xxs,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalInfo: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  lifeAreaLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxs,
  },
  goalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: 28,
  },
  titleInput: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.purple,
    paddingVertical: SPACING.xs,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  milestonesSection: {
    marginBottom: SPACING.md,
  },
  milestonesLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginBottom: SPACING.sm,
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  deadlineText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.sm,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.bgDarkest,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },

  // Actions Section
  actionsSection: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginBottom: SPACING.lg,
  },
  actionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionsCount: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
  },
  actionsCountText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    flex: 1,
  },
  actionTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  addActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
  },
  addActionInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginRight: SPACING.sm,
  },
  addActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addActionButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tipsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default GoalDetailScreen;
