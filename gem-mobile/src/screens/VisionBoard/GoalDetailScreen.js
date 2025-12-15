/**
 * Goal Detail Screen - Vision Board 2.0
 * View and manage a specific goal with actions grouped by type
 *
 * Features:
 * - Actions grouped by type: daily, weekly, monthly, one_time
 * - XP tracking on completion
 * - Auto-reset indicators
 * - Add new actions with type selection
 *
 * Created: December 9, 2025
 * Updated: December 11, 2025 - Action types + XP tracking
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
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import CustomAlert from '../../components/Common/CustomAlert';
import { ScoreRing } from '../../components/Charts';
import { MilestoneIndicator } from '../../components/VisionBoard';
import AddActionModal from '../../components/VisionBoard/AddActionModal';

// Import action service for XP tracking
import {
  toggleActionWithLog,
  createActionWithType,
  getGoalActionsGrouped,
} from '../../services/actionService';

// Life area configuration
const LIFE_AREA_CONFIG = {
  finance: { label: 'Tài chính', icon: 'Wallet', color: COLORS.gold },
  career: { label: 'Sự nghiệp', icon: 'Briefcase', color: COLORS.purple },
  health: { label: 'Sức khỏe', icon: 'Heart', color: COLORS.success },
  relationships: { label: 'Quan hệ', icon: 'Users', color: '#FF6B9D' },
  personal: { label: 'Cá nhân', icon: 'User', color: COLORS.cyan },
  spiritual: { label: 'Tâm linh', icon: 'Sparkles', color: COLORS.burgundy },
};

// Action type configuration
const ACTION_TYPE_CONFIG = {
  daily: {
    label: 'Hàng ngày',
    icon: 'Repeat',
    color: '#3AF7A6',
    bgColor: 'rgba(58, 247, 166, 0.15)',
    description: 'Reset mỗi ngày',
  },
  weekly: {
    label: 'Hàng tuần',
    icon: 'Calendar',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    description: 'Reset mỗi 7 ngày',
  },
  monthly: {
    label: 'Hàng tháng',
    icon: 'CalendarDays',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    description: 'Reset mỗi 30 ngày',
  },
  one_time: {
    label: 'Một lần',
    icon: 'Check',
    color: '#FFBD59',
    bgColor: 'rgba(255, 189, 89, 0.15)',
    description: 'Hoàn thành 1 lần',
  },
};

const GoalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { goalId } = route.params || {};
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Goal data
  const [goal, setGoal] = useState(null);
  const [groupedActions, setGroupedActions] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    one_time_pending: [],
    one_time_completed: [],
  });

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Add action modal
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  // Alert
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  // XP earned feedback
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpFeedback, setShowXpFeedback] = useState(false);

  // Load goal and actions
  const loadGoalData = useCallback(async () => {
    if (!user?.id || !goalId) return;

    try {
      // First try to load from vision_goals table (new structure)
      let { data: goalData, error: goalError } = await supabase
        .from('vision_goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

      // If not found in vision_goals, try vision_board_widgets (legacy)
      if (goalError || !goalData) {
        const { data: widgetData } = await supabase
          .from('vision_board_widgets')
          .select('*')
          .eq('id', goalId)
          .eq('user_id', user.id)
          .single();

        if (widgetData) {
          // Convert widget to goal format
          const content = typeof widgetData.content === 'string'
            ? JSON.parse(widgetData.content)
            : widgetData.content;

          goalData = {
            id: widgetData.id,
            user_id: widgetData.user_id,
            title: widgetData.title || content?.title || content?.goals?.[0]?.title,
            life_area: content?.lifeArea || 'personal',
            progress_percent: content?.progress || 0,
            created_at: widgetData.created_at,
            _isLegacy: true,
            _content: content,
          };
        }
      }

      if (!goalData) {
        console.log('[GoalDetail] Goal not found');
        setLoading(false);
        return;
      }

      setGoal(goalData);
      setEditTitle(goalData.title || '');

      // Load actions - try RPC first, then fallback
      try {
        const { data: rpcResult } = await supabase.rpc('get_goal_actions_grouped', {
          p_user_id: user.id,
          p_goal_id: goalId,
        });

        if (rpcResult) {
          setGroupedActions({
            daily: rpcResult.daily || [],
            weekly: rpcResult.weekly || [],
            monthly: rpcResult.monthly || [],
            one_time_pending: rpcResult.one_time_pending || [],
            one_time_completed: rpcResult.one_time_completed || [],
          });
        }
      } catch (rpcError) {
        console.log('[GoalDetail] RPC not available, using fallback');

        // Fallback: Load from vision_actions directly
        const { data: actionsData } = await supabase
          .from('vision_actions')
          .select('*')
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (actionsData) {
          const grouped = {
            daily: actionsData.filter(a => a.action_type === 'daily'),
            weekly: actionsData.filter(a => a.action_type === 'weekly'),
            monthly: actionsData.filter(a => a.action_type === 'monthly'),
            one_time_pending: actionsData.filter(a => a.action_type === 'one_time' && !a.is_completed),
            one_time_completed: actionsData.filter(a => a.action_type === 'one_time' && a.is_completed),
          };
          setGroupedActions(grouped);
        } else {
          // Try legacy widget actions
          if (goalData._isLegacy && goalData._content?.steps) {
            const legacyActions = goalData._content.steps.map((step, i) => ({
              id: step.id || `legacy_${i}`,
              title: step.title || step,
              action_type: step.action_type || 'daily',
              is_completed: step.completed || false,
              _isLegacy: true,
            }));

            setGroupedActions({
              daily: legacyActions.filter(a => a.action_type === 'daily'),
              weekly: legacyActions.filter(a => a.action_type === 'weekly'),
              monthly: legacyActions.filter(a => a.action_type === 'monthly'),
              one_time_pending: legacyActions.filter(a => a.action_type === 'one_time' && !a.is_completed),
              one_time_completed: legacyActions.filter(a => a.action_type === 'one_time' && a.is_completed),
            });
          }
        }
      }
    } catch (error) {
      console.error('[GoalDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, goalId]);

  // Initial load
  useEffect(() => {
    if (user?.id && goalId) {
      loadGoalData();
    }
  }, [user?.id, goalId, loadGoalData]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoalData();
    setRefreshing(false);
  };

  // Toggle action with XP tracking
  const handleToggleAction = async (action) => {
    if (!user?.id) return;

    Vibration.vibrate(10);

    try {
      const result = await toggleActionWithLog(user.id, action.id, action.is_completed);

      if (result.success) {
        // Show XP feedback if earned
        if (result.xpEarned > 0) {
          setXpEarned(result.xpEarned);
          setShowXpFeedback(true);
          setTimeout(() => setShowXpFeedback(false), 2000);
        }

        // Reload data
        await loadGoalData();
      }
    } catch (error) {
      console.error('[GoalDetail] Toggle action error:', error);
      // Fallback for legacy actions
      if (action._isLegacy) {
        // Handle legacy toggle
        await loadGoalData();
      }
    }
  };

  // Add new action
  const handleAddAction = async (actionData) => {
    if (!user?.id || !goalId) return;

    setSavingAction(true);

    try {
      const result = await createActionWithType(user.id, goalId, {
        title: actionData.title,
        action_type: actionData.action_type,
      });

      if (result.success) {
        setShowAddActionModal(false);
        await loadGoalData();

        setAlertConfig({
          visible: true,
          type: 'success',
          title: 'Đã thêm!',
          message: `Hành động "${actionData.title}" đã được thêm.`,
          buttons: [{ text: 'OK', style: 'primary' }],
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[GoalDetail] Add action error:', error);
      setAlertConfig({
        visible: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể thêm hành động. Vui lòng thử lại.',
        buttons: [{ text: 'OK', style: 'primary' }],
      });
    } finally {
      setSavingAction(false);
    }
  };

  // Delete action
  const handleDeleteAction = (action) => {
    setAlertConfig({
      visible: true,
      type: 'warning',
      title: 'Xóa hành động',
      message: `Bạn có chắc muốn xóa "${action.title}"?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('vision_actions')
                .delete()
                .eq('id', action.id);
              await loadGoalData();
            } catch (error) {
              console.error('[GoalDetail] Delete action error:', error);
            }
          },
        },
      ],
    });
  };

  // Calculate progress
  const calculateProgress = () => {
    const allActions = [
      ...groupedActions.daily,
      ...groupedActions.weekly,
      ...groupedActions.monthly,
      ...groupedActions.one_time_pending,
      ...groupedActions.one_time_completed,
    ];

    if (allActions.length === 0) return 0;

    const completed = allActions.filter(a => a.is_completed).length;
    return Math.round((completed / allActions.length) * 100);
  };

  // Get config
  const lifeArea = goal?.life_area || 'personal';
  const config = LIFE_AREA_CONFIG[lifeArea] || LIFE_AREA_CONFIG.personal;
  const IconComponent = Icons[config.icon] || Icons.Target;
  const progress = goal?.progress_percent || calculateProgress();

  // Render action group
  const renderActionGroup = (title, actions, actionType) => {
    if (!actions || actions.length === 0) return null;

    const typeConfig = ACTION_TYPE_CONFIG[actionType] || ACTION_TYPE_CONFIG.daily;
    const TypeIcon = Icons[typeConfig.icon] || Icons.Check;

    return (
      <View style={styles.actionGroup}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <View style={[styles.groupIconContainer, { backgroundColor: typeConfig.bgColor }]}>
            <TypeIcon size={16} color={typeConfig.color} />
          </View>
          <Text style={[styles.groupTitle, { color: typeConfig.color }]}>{title}</Text>
          <Text style={styles.groupCount}>
            {actions.filter(a => a.is_completed).length}/{actions.length}
          </Text>
        </View>

        {/* Actions */}
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionItem, action.is_completed && styles.actionItemCompleted]}
            onPress={() => handleToggleAction(action)}
            onLongPress={() => handleDeleteAction(action)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              action.is_completed && [styles.checkboxCompleted, { backgroundColor: typeConfig.color }]
            ]}>
              {action.is_completed && (
                <Icons.Check size={14} color={COLORS.bgDarkest} />
              )}
            </View>
            <View style={styles.actionContent}>
              <Text style={[
                styles.actionText,
                action.is_completed && styles.actionTextCompleted
              ]}>
                {action.title}
              </Text>
              {!action.is_completed && actionType !== 'one_time' && (
                <Text style={[styles.actionHint, { color: typeConfig.color }]}>
                  {typeConfig.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
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

      {/* XP Feedback */}
      {showXpFeedback && (
        <View style={styles.xpFeedback}>
          <Icons.Sparkles size={18} color={COLORS.gold} />
          <Text style={styles.xpFeedbackText}>+{xpEarned} XP</Text>
        </View>
      )}

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
          {/* Icon and Title */}
          <View style={styles.goalHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
              <IconComponent size={32} color={config.color} />
            </View>

            <View style={styles.goalInfo}>
              <Text style={[styles.lifeAreaLabel, { color: config.color }]}>
                {config.label}
              </Text>
              <Text style={styles.goalTitle}>{goal.title || 'Mục tiêu'}</Text>
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressSection}>
            <ScoreRing
              score={progress}
              label="Tiến độ"
              size={100}
              gradientColors={[config.color, `${config.color}80`]}
            />
          </View>

          {/* Milestones */}
          <View style={styles.milestonesSection}>
            <MilestoneIndicator progress={progress} />
          </View>
        </View>

        {/* Actions Sections - Grouped by Type */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionsSectionHeader}>
            <Icons.ListTodo size={20} color={COLORS.textPrimary} />
            <Text style={styles.actionsSectionTitle}>Kế hoạch hành động</Text>
          </View>

          {renderActionGroup('Hàng ngày', groupedActions.daily, 'daily')}
          {renderActionGroup('Hàng tuần', groupedActions.weekly, 'weekly')}
          {renderActionGroup('Hàng tháng', groupedActions.monthly, 'monthly')}
          {renderActionGroup('Cần làm', groupedActions.one_time_pending, 'one_time')}
          {groupedActions.one_time_completed.length > 0 && (
            renderActionGroup('Đã hoàn thành', groupedActions.one_time_completed, 'one_time')
          )}

          {/* Empty State */}
          {Object.values(groupedActions).flat().length === 0 && (
            <View style={styles.emptyActions}>
              <Icons.ClipboardList size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyActionsText}>
                Chưa có hành động nào. Thêm hành động để bắt đầu!
              </Text>
            </View>
          )}

          {/* Add Action Button */}
          <TouchableOpacity
            style={styles.addActionButton}
            onPress={() => setShowAddActionModal(true)}
          >
            <Icons.Plus size={20} color={COLORS.gold} />
            <Text style={styles.addActionText}>Thêm hành động</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Icons.Info size={16} color={COLORS.cyan} />
          <Text style={styles.tipsText}>
            Hành động hàng ngày sẽ tự reset mỗi ngày mới. Giữ lâu để xóa.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Action Modal */}
      <AddActionModal
        visible={showAddActionModal}
        onClose={() => setShowAddActionModal(false)}
        onSave={handleAddAction}
        goalTitle={goal?.title}
        isLoading={savingAction}
      />

      {/* Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false })}
      />
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

  // XP Feedback
  xpFeedback: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    zIndex: 100,
    gap: SPACING.xs,
  },
  xpFeedbackText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalInfo: {
    flex: 1,
  },
  lifeAreaLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 2,
  },
  goalTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  milestonesSection: {
    marginTop: SPACING.sm,
  },

  // Actions Container
  actionsContainer: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  actionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  actionsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Action Group
  actionGroup: {
    marginBottom: SPACING.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groupIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  groupTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    flex: 1,
  },
  groupCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Action Item
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  actionItemCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    borderWidth: 0,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  actionTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  actionHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 2,
  },

  // Empty State
  emptyActions: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyActionsText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Add Action Button
  addActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  addActionText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  tipsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 18,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default GoalDetailScreen;
