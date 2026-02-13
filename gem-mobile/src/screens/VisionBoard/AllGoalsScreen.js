/**
 * AllGoalsScreen - Full screen view of all goals
 *
 * Displays all goals in a scrollable grid with category filter
 * Navigated to from GoalsGridSection "Xem tất cả" button
 *
 * Features:
 * - Category filter chips
 * - Grid thumbnail view
 * - Multi-select delete mode
 * - Reorder mode with move up/down
 *
 * Created: February 1, 2026
 */

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Target,
  ArrowLeft,
  Trash2,
  MoreVertical,
  X,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { GoalThumbnailCard } from '../../components/VisionBoard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// ========== CONSTANTS ==========
const CARD_GAP = 12;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Life area labels (Vietnamese)
const LIFE_AREA_LABELS = {
  all: 'Tất cả',
  finance: 'Tài chính',
  career: 'Sự nghiệp',
  health: 'Sức khỏe',
  relationships: 'Tình yêu',
  personal: 'Cá nhân',
  spiritual: 'Tâm thức',
  general: 'Chung',
  crypto: 'Crypto',
};

// Category order for display
const CATEGORY_ORDER = ['all', 'finance', 'career', 'health', 'relationships', 'personal', 'spiritual', 'crypto'];

/**
 * Helper to parse widget content
 */
const parseWidgetContent = (widget) => {
  if (!widget) return {};
  if (typeof widget.content === 'string') {
    try {
      return JSON.parse(widget.content);
    } catch {
      return {};
    }
  }
  return widget.content || {};
};

/**
 * AllGoalsScreen Component
 */
const AllGoalsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const initialCategory = route?.params?.selectedCategory || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit/Reorder modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState(new Set());
  const [orderedGoalIds, setOrderedGoalIds] = useState(null);

  // ========== LOAD GOALS ==========
  const loadGoals = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Load from both vision_board_widgets (legacy) and vision_goals (new)
      const [widgetsResult, goalsResult] = await Promise.all([
        supabase
          .from('vision_board_widgets')
          .select('*')
          .eq('user_id', user.id)
          .in('type', ['GOAL_CARD', 'goal'])
          .eq('is_active', true)
          .order('updated_at', { ascending: false }),
        supabase
          .from('vision_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
      ]);

      if (widgetsResult.error) throw widgetsResult.error;

      // Transform legacy widgets
      const legacyGoals = (widgetsResult.data || []).map((widget) => {
        const content = parseWidgetContent(widget);
        const rawTitle = content?.goals?.[0]?.title
          || content?.goals?.[0]?.text
          || content?.goalText
          || content?.text
          || widget.title
          || content?.title
          || 'Mục tiêu';
        const title = rawTitle.startsWith('Mục tiêu: ')
          ? rawTitle.replace('Mục tiêu: ', '')
          : rawTitle;
        return {
          id: widget.id,
          title,
          cover_image: widget.cover_image || content?.cover_image || content?.coverImage || null,
          life_area: (widget.life_area || content?.lifeArea || content?.life_area || 'personal').toLowerCase(),
          progress_percent: widget.progress_percent || content?.progress || 0,
          updated_at: widget.updated_at,
          created_at: widget.created_at,
          _isLegacy: true,
          _originalWidget: widget,
        };
      });

      // Transform new vision_goals
      const newGoals = (goalsResult.data || []).map((goal) => ({
        id: goal.id,
        title: goal.title || 'Mục tiêu',
        cover_image: goal.cover_image,
        life_area: (goal.life_area || 'personal').toLowerCase(),
        progress_percent: goal.progress_percent || 0,
        updated_at: goal.updated_at,
        created_at: goal.created_at,
        _isLegacy: false,
        _originalGoal: goal,
      }));

      // Merge and deduplicate (prefer new goals if same id)
      const allGoals = [...newGoals, ...legacyGoals];
      const seenIds = new Set();
      const uniqueGoals = allGoals.filter((g) => {
        if (seenIds.has(g.id)) return false;
        seenIds.add(g.id);
        return true;
      });

      // Sort by updated_at
      uniqueGoals.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      setGoals(uniqueGoals);
    } catch (err) {
      console.error('[AllGoalsScreen] Error loading goals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // ========== FILTERED GOALS ==========
  const filteredGoals = useMemo(() => {
    let filtered = selectedCategory === 'all' ? goals : goals.filter((g) => g.life_area === selectedCategory);

    // Apply custom order if exists
    if (orderedGoalIds && orderedGoalIds.length > 0) {
      const orderMap = new Map(orderedGoalIds.map((id, idx) => [id, idx]));
      filtered = [...filtered].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
        return orderA - orderB;
      });
    }

    return filtered;
  }, [goals, selectedCategory, orderedGoalIds]);

  // ========== CATEGORY COUNTS ==========
  const categoryCounts = useMemo(() => {
    const counts = { all: goals.length };
    goals.forEach((g) => {
      const area = g.life_area || 'personal';
      counts[area] = (counts[area] || 0) + 1;
    });
    return counts;
  }, [goals]);

  // ========== HANDLERS ==========
  const handleGoalPress = useCallback((goal) => {
    if (isEditMode) {
      // Toggle selection
      Haptics.selectionAsync();
      setSelectedGoalIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(goal.id)) {
          newSet.delete(goal.id);
        } else {
          newSet.add(goal.id);
        }
        return newSet;
      });
      return;
    }

    navigation.navigate('GoalDetail', {
      goalId: goal.id,
      goalData: {
        ...goal,
        _isLegacy: true,
        _content: goal._originalWidget?.content || {},
      },
    });
  }, [navigation, isEditMode]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals();
  }, [loadGoals]);

  // Edit mode handlers
  const handleToggleEditMode = useCallback(() => {
    if (isEditMode) {
      setSelectedGoalIds(new Set());
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedGoalIds.size === 0) return;

    try {
      for (const goalId of selectedGoalIds) {
        await supabase
          .from('vision_board_widgets')
          .delete()
          .eq('id', goalId)
          .eq('user_id', user.id);
      }

      setGoals((prev) => prev.filter((g) => !selectedGoalIds.has(g.id)));
      setSelectedGoalIds(new Set());
      setIsEditMode(false);
    } catch (err) {
      console.error('[AllGoalsScreen] Delete error:', err);
    }
  }, [selectedGoalIds, user?.id]);

  // Reorder handlers
  const handleEnterReorderMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOrderedGoalIds(filteredGoals.map((g) => g.id));
    setIsReorderMode(true);
  }, [filteredGoals]);

  const handleExitReorderMode = useCallback(() => {
    setIsReorderMode(false);
  }, []);

  const handleMoveUp = useCallback((goalId) => {
    Haptics.selectionAsync();
    setOrderedGoalIds((prev) => {
      if (!prev) return prev;
      const idx = prev.indexOf(goalId);
      if (idx <= 0) return prev;
      const newOrder = [...prev];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      return newOrder;
    });
  }, []);

  const handleMoveDown = useCallback((goalId) => {
    Haptics.selectionAsync();
    setOrderedGoalIds((prev) => {
      if (!prev) return prev;
      const idx = prev.indexOf(goalId);
      if (idx >= prev.length - 1) return prev;
      const newOrder = [...prev];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      return newOrder;
    });
  }, []);

  const handleLongPress = useCallback((goal) => {
    if (!isEditMode && !isReorderMode) {
      handleEnterReorderMode();
    }
  }, [isEditMode, isReorderMode, handleEnterReorderMode]);

  // ========== RENDER CATEGORY CHIPS ==========
  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryChipsContainer}
      contentContainerStyle={styles.categoryChipsContent}
    >
      {CATEGORY_ORDER.map((catId) => {
        const count = categoryCounts[catId] || 0;
        if (count === 0 && catId !== 'all') return null;

        const isActive = selectedCategory === catId;
        const label = LIFE_AREA_LABELS[catId] || catId;

        return (
          <TouchableOpacity
            key={catId}
            style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(catId)}
            activeOpacity={0.7}
          >
            <Target size={12} color={isActive ? '#8B5CF6' : COLORS.textMuted} />
            <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
              {label}
            </Text>
            <View style={[styles.categoryChipBadge, isActive && styles.categoryChipBadgeActive]}>
              <Text style={[styles.categoryChipCount, isActive && styles.categoryChipCountActive]}>
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ========== RENDER GOAL ITEM ==========
  const renderGoalItem = useCallback(({ item, index }) => {
    const isSelected = selectedGoalIds.has(item.id);

    return (
      <View style={styles.goalItemWrapper}>
        <GoalThumbnailCard
          goal={item}
          index={index}
          onPress={handleGoalPress}
          onLongPress={!isEditMode ? handleLongPress : undefined}
        />
        {/* Selection overlay in edit mode */}
        {isEditMode && (
          <TouchableOpacity
            style={[styles.selectionOverlay, isSelected && styles.selectionOverlaySelected]}
            onPress={() => handleGoalPress(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Check size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [handleGoalPress, handleLongPress, isEditMode, selectedGoalIds]);

  // ========== RENDER REORDER LIST ==========
  const renderReorderList = () => (
    <ScrollView
      style={styles.reorderScrollView}
      contentContainerStyle={[styles.reorderContainer, { paddingBottom: insets.bottom + 100 }]}
    >
      {filteredGoals.map((goal, index) => (
        <View key={goal.id} style={styles.reorderItem}>
          <View style={styles.reorderControls}>
            <TouchableOpacity
              style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
              onPress={() => handleMoveUp(goal.id)}
              disabled={index === 0}
            >
              <ChevronUp size={20} color={index === 0 ? COLORS.textMuted : '#8B5CF6'} />
            </TouchableOpacity>
            <Text style={styles.reorderIndex}>{index + 1}</Text>
            <TouchableOpacity
              style={[styles.reorderButton, index === filteredGoals.length - 1 && styles.reorderButtonDisabled]}
              onPress={() => handleMoveDown(goal.id)}
              disabled={index === filteredGoals.length - 1}
            >
              <ChevronDown size={20} color={index === filteredGoals.length - 1 ? COLORS.textMuted : '#8B5CF6'} />
            </TouchableOpacity>
          </View>
          <View style={styles.reorderCardContainer}>
            <Text style={styles.reorderTitle} numberOfLines={2}>{goal.title}</Text>
            <Text style={styles.reorderSubtitle}>{Math.round(goal.progress_percent || 0)}% hoàn thành</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const keyExtractor = useCallback((item) => item.id?.toString(), []);

  // ========== RENDER EMPTY STATE ==========
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Target size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {selectedCategory === 'all' ? 'Chưa có mục tiêu nào' : `Chưa có mục tiêu ${LIFE_AREA_LABELS[selectedCategory]}`}
      </Text>
      <Text style={styles.emptySubtitle}>
        Hãy tạo mục tiêu đầu tiên của bạn để bắt đầu hành trình
      </Text>
    </View>
  );

  // ========== MAIN RENDER ==========
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with SafeAreaView */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <LinearGradient
          colors={['#1A1D2E', '#0D0F1A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Target size={24} color="#8B5CF6" />
              <Text style={styles.headerTitle}>
                {isReorderMode ? 'Sắp Xếp' : isEditMode ? 'Chọn Mục Tiêu' : 'Tất Cả Mục Tiêu'}
              </Text>
            </View>

            {/* Right side buttons */}
            <View style={styles.headerRightButtons}>
              {isReorderMode ? (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleExitReorderMode}
                >
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.doneButtonText}>Xong</Text>
                </TouchableOpacity>
              ) : isEditMode ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleToggleEditMode}
                >
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : (
                goals.length > 0 && (
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={handleToggleEditMode}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MoreVertical size={22} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Mode hints */}
          {isReorderMode && (
            <Text style={styles.modeHint}>Bấm mũi tên để di chuyển thứ tự</Text>
          )}
          {isEditMode && (
            <Text style={styles.modeHint}>Bấm vào mục tiêu để chọn • {selectedGoalIds.size} đã chọn</Text>
          )}
          {!isEditMode && !isReorderMode && goals.length > 0 && (
            <Text style={styles.modeHint}>Nhấn giữ để sắp xếp lại</Text>
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* Category Filter - hide in reorder mode */}
      {!isReorderMode && renderCategoryChips()}

      {/* Goals Count - hide in reorder mode */}
      {!isReorderMode && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredGoals.length} mục tiêu
            {selectedCategory !== 'all' && ` trong ${LIFE_AREA_LABELS[selectedCategory]}`}
          </Text>
        </View>
      )}

      {/* Goals Grid or Reorder List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : filteredGoals.length > 0 ? (
        isReorderMode ? (
          renderReorderList()
        ) : (
          <FlatList
            data={filteredGoals}
            keyExtractor={keyExtractor}
            renderItem={renderGoalItem}
            numColumns={2}
            contentContainerStyle={[styles.gridContainer, { paddingBottom: insets.bottom + 100 }]}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )
      ) : (
        renderEmptyState()
      )}

      {/* Delete Selected Button */}
      {isEditMode && selectedGoalIds.size > 0 && (
        <View style={[styles.deleteButtonContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.deleteSelectedButton}
            onPress={handleDeleteSelected}
            activeOpacity={0.8}
          >
            <Trash2 size={18} color="#FFFFFF" />
            <Text style={styles.deleteSelectedText}>
              Xóa {selectedGoalIds.size} mục tiêu đã chọn
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F1A',
  },

  // Header
  safeHeader: {
    backgroundColor: '#1A1D2E',
  },
  headerGradient: {
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    minHeight: 50,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRightButtons: {
    width: 44,
    alignItems: 'flex-end',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modeHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },

  // Category Chips
  categoryChipsContainer: {
    paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(30, 35, 60, 0.4)',
  },
  categoryChipsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    gap: 6,
    height: 44,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  categoryChipText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  categoryChipTextActive: {
    color: COLORS.textPrimary,
  },
  categoryChipBadge: {
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  categoryChipBadgeActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryChipCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  categoryChipCountActive: {
    color: COLORS.textPrimary,
  },

  // Count
  countContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  countText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  // Grid
  gridContainer: {
    paddingHorizontal: SPACING.md,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: CARD_GAP,
  },
  goalItemWrapper: {
    marginBottom: CARD_GAP,
    position: 'relative',
  },

  // Selection overlay
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: CARD_GAP,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  selectionOverlaySelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  // Reorder
  reorderScrollView: {
    flex: 1,
  },
  reorderContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  reorderControls: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reorderButton: {
    padding: 4,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderIndex: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 2,
  },
  reorderCardContainer: {
    flex: 1,
  },
  reorderTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  reorderSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },

  // Delete Button
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(13, 15, 26, 0.95)',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    gap: SPACING.sm,
  },
  deleteSelectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default memo(AllGoalsScreen);
