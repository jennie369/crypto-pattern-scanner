/**
 * JournalDetailScreen.js
 * Display journal entry with template formatting
 * Shows linked goals with navigation
 *
 * Created: 2026-02-02
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Target,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  Link,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  COSMIC_GRADIENTS,
} from '../../theme/cosmicTokens';

// Context
import { useAuth } from '../../contexts/AuthContext';

// Services
import { getJournalWithLinkedGoals, createGoalFromJournalAction } from '../../services/templates/journalRoutingService';
import { getTemplate, TEMPLATES, LIFE_AREAS, FIELD_TYPES } from '../../services/templates/journalTemplates';
import { supabase } from '../../services/supabase';

/**
 * JournalDetailScreen Component
 */
const JournalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { journalId } = route.params || {};
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [journal, setJournal] = useState(null);
  const [linkedGoals, setLinkedGoals] = useState([]);
  const [error, setError] = useState(null);

  // Fetch journal data
  const fetchJournal = useCallback(async () => {
    if (!journalId) {
      setError('Journal ID not provided');
      setLoading(false);
      return;
    }

    try {
      const result = await getJournalWithLinkedGoals(user?.id, journalId);
      if (result.journal) {
        setJournal(result.journal);
        setLinkedGoals(result.linkedGoals || []);
        setError(null);
      } else {
        setError('Journal not found');
      }
    } catch (err) {
      console.error('[JournalDetailScreen] Fetch error:', err);
      setError(err.message || 'Failed to load journal');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [journalId, user?.id]);

  useEffect(() => {
    fetchJournal();
  }, [fetchJournal]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJournal();
  }, [fetchJournal]);

  // Handle delete
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xóa nhật ký',
      linkedGoals.length > 0
        ? `Nhật ký này liên kết với ${linkedGoals.length} mục tiêu. Bạn có chắc muốn xóa?`
        : 'Bạn có chắc muốn xóa nhật ký này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('calendar_journal_entries')
                .delete()
                .eq('id', journalId);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            } catch (err) {
              console.error('[JournalDetailScreen] Delete error:', err);
              Alert.alert('Lỗi', 'Không thể xóa nhật ký. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [journalId, linkedGoals.length, navigation]);

  // Handle create goal from action
  const handleCreateGoalFromAction = useCallback(async (action) => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await createGoalFromJournalAction(
        user?.id,
        journalId,
        action.id,
        action.lifeArea || 'personal'
      );

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Refresh to show new linked goal
        fetchJournal();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể tạo goal');
      }
    } catch (err) {
      console.error('[JournalDetailScreen] Create goal error:', err);
      Alert.alert('Lỗi', 'Không thể tạo goal. Vui lòng thử lại.');
    }
  }, [user?.id, journalId, fetchJournal]);

  // Get template
  const template = journal?.template_id ? getTemplate(journal.template_id) : null;
  const templateData = journal?.template_data || {};

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render field value based on type
  const renderFieldValue = (field, value) => {
    if (value === undefined || value === null) return null;

    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.TEXTAREA:
        return <Text style={styles.fieldValue}>{value}</Text>;

      case FIELD_TYPES.SLIDER:
        const labels = field.labels || {};
        return (
          <View style={styles.sliderValue}>
            <Text style={styles.sliderNumber}>{value}</Text>
            {labels[value] && <Text style={styles.sliderLabel}>{labels[value]}</Text>}
          </View>
        );

      case FIELD_TYPES.LIFE_AREA:
        const area = LIFE_AREAS[value];
        return area ? (
          <View style={styles.lifeAreaBadge}>
            <Text style={styles.lifeAreaText}>{area.name}</Text>
          </View>
        ) : null;

      case FIELD_TYPES.CHECKLIST:
        if (!Array.isArray(value)) return null;
        return (
          <View style={styles.checklistContainer}>
            {value.map((item, index) => (
              <View key={item.id || index} style={styles.checklistItem}>
                {item.completed ? (
                  <CheckCircle2 size={16} color={COSMIC_COLORS.functional.success} />
                ) : (
                  <Circle size={16} color={COSMIC_COLORS.text.muted} />
                )}
                <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        );

      case FIELD_TYPES.ACTION_LIST:
        if (!Array.isArray(value)) return null;
        return (
          <View style={styles.actionListContainer}>
            {value.map((action, index) => {
              const isLinked = linkedGoals.some((g) => g.source_action_id === action.id);
              return (
                <View key={action.id || index} style={styles.actionItem}>
                  <View style={styles.actionContent}>
                    {action.checked ? (
                      <Target size={16} color={COSMIC_COLORS.glow.gold} />
                    ) : (
                      <Circle size={16} color={COSMIC_COLORS.text.muted} />
                    )}
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionText}>{action.text}</Text>
                      {action.lifeArea && (
                        <Text style={styles.actionLifeArea}>
                          {LIFE_AREAS[action.lifeArea]?.name || action.lifeArea}
                        </Text>
                      )}
                    </View>
                  </View>

                  {action.checked && !isLinked && (
                    <TouchableOpacity
                      style={styles.createGoalButton}
                      onPress={() => handleCreateGoalFromAction(action)}
                    >
                      <Plus size={14} color={COSMIC_COLORS.glow.gold} />
                      <Text style={styles.createGoalText}>Tạo Goal</Text>
                    </TouchableOpacity>
                  )}

                  {isLinked && (
                    <View style={styles.linkedBadge}>
                      <Link size={12} color={COSMIC_COLORS.functional.success} />
                      <Text style={styles.linkedText}>Đã liên kết</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );

      default:
        return <Text style={styles.fieldValue}>{String(value)}</Text>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient colors={COSMIC_GRADIENTS.cosmicBg} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COSMIC_COLORS.glow.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !journal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient colors={COSMIC_GRADIENTS.cosmicBg} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft size={24} color={COSMIC_COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Không tìm thấy nhật ký'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchJournal}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={COSMIC_GRADIENTS.cosmicBg} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={COSMIC_COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
              <Trash2 size={20} color={COSMIC_COLORS.functional.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COSMIC_COLORS.glow.gold}
            />
          }
        >
          {/* Template Badge */}
          {template && (
            <View style={styles.templateBadge}>
              <FileText size={14} color={COSMIC_COLORS.glow.purple} />
              <Text style={styles.templateBadgeText}>{template.name}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>
            {templateData.title || template?.name || 'Nhật ký'}
          </Text>

          {/* Date/Time */}
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Calendar size={14} color={COSMIC_COLORS.text.muted} />
              <Text style={styles.dateText}>{formatDate(journal.created_at)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Clock size={14} color={COSMIC_COLORS.text.muted} />
              <Text style={styles.dateText}>{formatTime(journal.created_at)}</Text>
            </View>
          </View>

          {/* Linked Goals Section */}
          {linkedGoals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mục tiêu liên kết</Text>
              <View style={styles.linkedGoalsContainer}>
                {linkedGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.linkedGoalCard}
                    onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
                  >
                    <View style={styles.linkedGoalIcon}>
                      <Target size={16} color={COSMIC_COLORS.glow.gold} />
                    </View>
                    <View style={styles.linkedGoalContent}>
                      <Text style={styles.linkedGoalTitle} numberOfLines={1}>
                        {goal.title}
                      </Text>
                      <Text style={styles.linkedGoalArea}>
                        {LIFE_AREAS[goal.life_area]?.name || goal.life_area}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={COSMIC_COLORS.text.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Template Fields */}
          {template?.fields?.map((field) => {
            const value = templateData[field.id];
            if (value === undefined || value === null || value === '') return null;
            if (Array.isArray(value) && value.length === 0) return null;

            return (
              <View key={field.id} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {renderFieldValue(field, value)}
              </View>
            );
          })}

          {/* Entry Point */}
          {journal.source_entry_point && (
            <View style={styles.entryPointContainer}>
              <Text style={styles.entryPointText}>
                Tạo từ: {journal.source_entry_point === 'gemmaster' ? 'GEM Master' :
                  journal.source_entry_point === 'visionboard' ? 'Vision Board' :
                    journal.source_entry_point === 'calendar' ? 'Calendar' :
                      journal.source_entry_point}
              </Text>
            </View>
          )}

          <View style={{ height: COSMIC_SPACING.huge }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.md,
  },
  backButton: {
    padding: COSMIC_SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.sm,
  },
  headerButton: {
    padding: COSMIC_SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: COSMIC_SPACING.md,
  },
  loadingText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: COSMIC_SPACING.xl,
  },
  errorText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
    marginBottom: COSMIC_SPACING.lg,
  },
  retryButton: {
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xl,
    backgroundColor: COSMIC_COLORS.glow.gold,
    borderRadius: COSMIC_RADIUS.round,
  },
  retryText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.bgDeepSpace,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: COSMIC_SPACING.lg,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
    backgroundColor: COSMIC_COLORS.glow.purple + '20',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_RADIUS.round,
    alignSelf: 'flex-start',
    marginBottom: COSMIC_SPACING.md,
  },
  templateBadgeText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.glow.purple,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  title: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xxl,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.md,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: COSMIC_SPACING.lg,
    marginBottom: COSMIC_SPACING.xl,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xs,
  },
  dateText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
  },
  section: {
    marginBottom: COSMIC_SPACING.xl,
  },
  sectionTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.md,
  },
  linkedGoalsContainer: {
    gap: COSMIC_SPACING.sm,
  },
  linkedGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glow.gold + '30',
    padding: COSMIC_SPACING.md,
    gap: COSMIC_SPACING.md,
  },
  linkedGoalIcon: {
    width: 32,
    height: 32,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedGoalContent: {
    flex: 1,
  },
  linkedGoalTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.primary,
  },
  linkedGoalArea: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.xxs,
  },
  fieldContainer: {
    marginBottom: COSMIC_SPACING.lg,
  },
  fieldLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.secondary,
    marginBottom: COSMIC_SPACING.sm,
  },
  fieldValue: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.md * 1.6,
  },
  sliderValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  sliderNumber: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xxl,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.bold,
    color: COSMIC_COLORS.glow.gold,
  },
  sliderLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.secondary,
  },
  lifeAreaBadge: {
    backgroundColor: COSMIC_COLORS.glow.purple + '20',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    borderRadius: COSMIC_RADIUS.md,
    alignSelf: 'flex-start',
  },
  lifeAreaText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.glow.purple,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  checklistContainer: {
    gap: COSMIC_SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: COSMIC_SPACING.sm,
  },
  checklistText: {
    flex: 1,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.md * 1.5,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: COSMIC_COLORS.text.muted,
  },
  actionListContainer: {
    gap: COSMIC_SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.md,
    padding: COSMIC_SPACING.md,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: COSMIC_SPACING.sm,
    flex: 1,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
  },
  actionLifeArea: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.xxs,
  },
  createGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xxs,
    backgroundColor: COSMIC_COLORS.glow.gold + '20',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_RADIUS.sm,
  },
  createGoalText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.glow.gold,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xxs,
    backgroundColor: COSMIC_COLORS.functional.success + '20',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: COSMIC_RADIUS.sm,
  },
  linkedText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.xs,
    color: COSMIC_COLORS.functional.success,
  },
  entryPointContainer: {
    marginTop: COSMIC_SPACING.xl,
    paddingTop: COSMIC_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COSMIC_COLORS.glass.border,
  },
  entryPointText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.hint,
    textAlign: 'center',
  },
});

export default JournalDetailScreen;
