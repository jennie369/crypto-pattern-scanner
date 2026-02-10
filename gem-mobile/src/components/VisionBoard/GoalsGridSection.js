/**
 * GoalsGridSection - Grid layout cho Vision Board Redesign
 *
 * Thay thế accordion layout bằng grid 2 cột thumbnail
 * Hỗ trợ:
 * - Category filter chips
 * - Grid thumbnail cards (max 6 on main screen)
 * - Navigate đến GoalDetailScreen
 * - "Xem tất cả" button for viewing all goals
 * - Empty state
 *
 * Created: January 30, 2026
 * Vision Board Redesign - Grid Layout
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Target, Plus, HelpCircle, ChevronRight, MoreVertical, Trash2, X, Check, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import GoalThumbnailCard from './GoalThumbnailCard';
import { ControlledTooltip } from './Tooltip';

// ========== CONSTANTS ==========
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12; // Gap between columns - must match GoalThumbnailCard
const MAX_VISIBLE_GOALS = 6; // Maximum goals to show on main screen

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
const CATEGORY_ORDER = ['all', 'finance', 'career', 'health', 'relationships', 'personal', 'spiritual'];

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
 * Helper to extract life area from widget
 */
const extractLifeArea = (widget) => {
  const content = parseWidgetContent(widget);
  return (
    widget?.life_area ||
    content?.lifeArea ||
    content?.life_area ||
    content?.metadata?.lifeArea ||
    'personal'
  ).toLowerCase();
};

/**
 * Helper to extract title from widget
 * Priority: actual goal text from content > widget title (with prefix stripped)
 */
const extractTitle = (widget) => {
  const content = parseWidgetContent(widget);
  // Priority: actual goal text from content > widget title
  const rawTitle = (
    content?.goals?.[0]?.title ||
    content?.goals?.[0]?.text ||
    content?.goalText ||
    content?.text ||
    widget?.title ||
    content?.title ||
    'Mục tiêu'
  );

  // Strip "Mục tiêu: " prefix from legacy titles that used life area as title
  return rawTitle.startsWith('Mục tiêu: ')
    ? rawTitle.replace('Mục tiêu: ', '')
    : rawTitle;
};

/**
 * Helper to extract cover image from widget
 */
const extractCoverImage = (widget) => {
  const content = parseWidgetContent(widget);
  return (
    widget?.cover_image ||
    content?.cover_image ||
    content?.coverImage ||
    content?.image_url ||
    content?.imageUrl ||
    null
  );
};

/**
 * Helper to extract progress from widget
 */
const extractProgress = (widget) => {
  const content = parseWidgetContent(widget);
  const progress = widget?.progress_percent || content?.progress || content?.progress_percent || 0;
  return Math.min(100, Math.max(0, progress));
};

/**
 * GoalsGridSection Component
 *
 * @param {Object} props
 * @param {Object} props.groupedByLifeArea - Grouped widgets data từ VisionBoardScreen
 * @param {string} props.selectedCategory - Currently selected category filter
 * @param {Function} props.onCategoryChange - Handler khi thay đổi category
 * @param {Function} props.onGoalPress - Handler khi bấm vào goal thumbnail
 * @param {Function} props.onAddGoal - Handler khi bấm thêm mục tiêu
 * @param {Function} props.onDeleteGoal - Handler khi xóa mục tiêu
 * @param {Object} props.navigation - Navigation object
 */
const GoalsGridSection = ({
  groupedByLifeArea,
  selectedCategory = 'all',
  onCategoryChange,
  onGoalPress,
  onAddGoal,
  onDeleteGoal,
  navigation,
}) => {
  // ========== THEME ==========
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // ========== STATE ==========
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedGoalIds, setSelectedGoalIds] = useState(new Set());
  const [orderedGoalIds, setOrderedGoalIds] = useState(null); // Track custom order

  // ========== STYLES ==========
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginTop: SPACING.lg,
    },

    sectionHeader: {
      marginBottom: SPACING.sm,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },

    sectionTitle: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 1,
    },

    headerRightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },

    headerButton: {
      padding: 6,
      borderRadius: 8,
    },

    editModeHint: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: SPACING.xs,
    },

    categoryChipsContainer: {
      marginVertical: SPACING.md,
      paddingVertical: SPACING.sm,
    },

    categoryChipsContent: {
      paddingRight: SPACING.lg,
      paddingVertical: SPACING.xs,
      gap: SPACING.sm,
    },

    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 24,
      height: 44,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : 'rgba(30, 35, 60, 0.6)',
      marginRight: SPACING.sm,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.2)',
      gap: SPACING.xs,
    },

    categoryChipActive: {
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },

    categoryChipText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
    },

    categoryChipTextActive: {
      color: colors.textPrimary,
    },

    categoryChipBadge: {
      marginLeft: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.08)',
      minWidth: 24,
      alignItems: 'center',
    },

    categoryChipBadgeActive: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
    },

    categoryChipCount: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 16,
    },

    categoryChipCountActive: {
      color: colors.textPrimary,
    },

    gridContainer: {
      paddingTop: SPACING.sm,
    },

    gridRow: {
      justifyContent: 'flex-start',
      gap: CARD_GAP,
    },

    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING.xl * 2,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : 'rgba(30, 35, 60, 0.4)',
      borderRadius: 16,
      marginTop: SPACING.sm,
    },

    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
      textAlign: 'center',
    },

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },

    addButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },

    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.sm,
      borderRadius: 12,
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.3)',
    },

    viewAllText: {
      color: '#8B5CF6',
      fontSize: 14,
      fontWeight: '600',
      marginRight: SPACING.xs,
    },

    goalItemWrapper: {
      position: 'relative',
    },

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

    deleteSelectedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.md,
      borderRadius: 12,
      backgroundColor: '#DC2626',
      gap: SPACING.sm,
    },

    deleteSelectedText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },

    dragHint: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 4,
      fontStyle: 'italic',
    },

    doneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#8B5CF6',
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },

    doneButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },

    reorderContainer: {
      paddingTop: SPACING.sm,
    },

    reorderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : 'rgba(30, 35, 60, 0.6)',
      borderRadius: 12,
      padding: SPACING.sm,
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
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginVertical: 2,
    },

    reorderCardContainer: {
      flex: 1,
    },

    reorderTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // ========== EXTRACT ALL GOALS ==========
  const allGoals = useMemo(() => {
    const goals = [];
    const groups = groupedByLifeArea?.groups || {};

    Object.entries(groups).forEach(([lifeArea, group]) => {
      const goalWidgets = group?.goalWidgets || [];
      goalWidgets.forEach((widget) => {
        if (!widget?.id) return;

        // Normalize widget data for GoalThumbnailCard
        goals.push({
          id: widget.id,
          title: extractTitle(widget),
          cover_image: extractCoverImage(widget),
          life_area: lifeArea,
          progress_percent: extractProgress(widget),
          updated_at: widget.updated_at,
          created_at: widget.created_at,
          // Keep original data for navigation
          _originalWidget: widget,
        });
      });
    });

    // Sort by newest first (updated_at or created_at)
    goals.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0);
      const dateB = new Date(b.updated_at || b.created_at || 0);
      return dateB - dateA;
    });

    return goals;
  }, [groupedByLifeArea?.groups]);

  // ========== FILTERED GOALS ==========
  const filteredGoals = useMemo(() => {
    let filtered = allGoals;
    if (selectedCategory !== 'all') {
      filtered = allGoals.filter((g) =>
        g.life_area?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

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
  }, [allGoals, selectedCategory, orderedGoalIds]);

  // ========== VISIBLE GOALS (max 6) ==========
  const visibleGoals = useMemo(() => {
    return filteredGoals.slice(0, MAX_VISIBLE_GOALS);
  }, [filteredGoals]);

  const hasMoreGoals = filteredGoals.length > MAX_VISIBLE_GOALS;
  const remainingCount = filteredGoals.length - MAX_VISIBLE_GOALS;

  // ========== CATEGORY COUNTS ==========
  const categoryCounts = useMemo(() => {
    const counts = { all: allGoals.length };
    allGoals.forEach((g) => {
      const area = g.life_area || 'personal';
      counts[area] = (counts[area] || 0) + 1;
    });
    return counts;
  }, [allGoals]);

  // ========== HANDLERS ==========
  const handleGoalPress = useCallback((goal) => {
    // If in edit mode, toggle selection instead of navigating
    if (isEditMode) {
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

    if (onGoalPress) {
      onGoalPress(goal);
    } else if (navigation) {
      // Pass full goal data for instant display in GoalDetailScreen
      // This eliminates loading state when navigating
      const goalDataForNav = {
        id: goal.id,
        title: goal.title,
        cover_image: goal.cover_image,
        life_area: goal.life_area,
        progress_percent: goal.progress_percent,
        _isLegacy: true, // Goals from VisionBoard widgets are legacy
        _content: goal._originalWidget?.content || {},
        ...(goal._originalWidget || {}),
      };
      navigation.navigate('GoalDetail', {
        goalId: goal.id,
        goalData: goalDataForNav, // Pass full goal data for instant display
      });
    }
  }, [onGoalPress, navigation, isEditMode]);

  const handleCategoryPress = useCallback((category) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  }, [onCategoryChange]);

  const handleAddGoal = useCallback(() => {
    if (onAddGoal) {
      onAddGoal();
    }
  }, [onAddGoal]);

  // Toggle edit mode
  const handleToggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - clear selections
      setSelectedGoalIds(new Set());
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode]);

  // Delete selected goals - no confirmation, delete directly
  const handleDeleteSelected = useCallback(async () => {
    if (selectedGoalIds.size === 0) return;

    // Delete each selected goal directly
    for (const goalId of selectedGoalIds) {
      if (onDeleteGoal) {
        await onDeleteGoal(goalId);
      }
    }
    // Exit edit mode and clear selections
    setSelectedGoalIds(new Set());
    setIsEditMode(false);
  }, [selectedGoalIds, onDeleteGoal]);

  // Handle long press to enter reorder mode
  const handleLongPress = useCallback((goal) => {
    if (isEditMode) return; // Don't enter reorder mode if in edit mode
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Initialize order from current filtered goals
    setOrderedGoalIds(filteredGoals.map(g => g.id));
    setIsDragMode(true);
  }, [isEditMode, filteredGoals]);

  // Move goal up in order
  const handleMoveUp = useCallback((goalId) => {
    Haptics.selectionAsync();
    setOrderedGoalIds(prev => {
      if (!prev) return prev;
      const idx = prev.indexOf(goalId);
      if (idx <= 0) return prev; // Already at top
      const newOrder = [...prev];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      return newOrder;
    });
  }, []);

  // Move goal down in order
  const handleMoveDown = useCallback((goalId) => {
    Haptics.selectionAsync();
    setOrderedGoalIds(prev => {
      if (!prev) return prev;
      const idx = prev.indexOf(goalId);
      if (idx >= prev.length - 1) return prev; // Already at bottom
      const newOrder = [...prev];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      return newOrder;
    });
  }, []);

  // Exit reorder mode
  const handleExitDragMode = useCallback(() => {
    setIsDragMode(false);
    // Order is already saved in orderedGoalIds state
    console.log('[GoalsGrid] Order saved:', orderedGoalIds);
  }, [orderedGoalIds]);

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
        // Skip categories with 0 items (except 'all')
        if (count === 0 && catId !== 'all') return null;

        const isActive = selectedCategory === catId;
        const label = LIFE_AREA_LABELS[catId] || catId;

        return (
          <TouchableOpacity
            key={catId}
            style={[
              styles.categoryChip,
              isActive && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(catId)}
            activeOpacity={0.7}
          >
            <Target
              size={12}
              color={isActive ? '#8B5CF6' : colors.textMuted}
            />
            <Text
              style={[
                styles.categoryChipText,
                isActive && styles.categoryChipTextActive,
              ]}
            >
              {label}
            </Text>
            <View
              style={[
                styles.categoryChipBadge,
                isActive && styles.categoryChipBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipCount,
                  isActive && styles.categoryChipCountActive,
                ]}
              >
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ========== RENDER EMPTY STATE ==========
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Target size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>
        {selectedCategory === 'all'
          ? 'Chưa có mục tiêu nào'
          : `Chưa có mục tiêu ${LIFE_AREA_LABELS[selectedCategory] || selectedCategory}`}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddGoal}
        activeOpacity={0.8}
      >
        <Plus size={16} color={colors.textPrimary} />
        <Text style={styles.addButtonText}>Thêm mục tiêu</Text>
      </TouchableOpacity>
    </View>
  );

  // ========== RENDER GRID ==========
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
        {/* Selection overlay in edit mode - touchable to toggle selection */}
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

  const keyExtractor = useCallback((item) => item.id?.toString() || Math.random().toString(), []);

  // ========== MAIN RENDER ==========
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Target size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>
            {isDragMode ? 'SẮP XẾP MỤC TIÊU' : isEditMode ? 'CHỌN MỤC TIÊU' : 'MỤC TIÊU CỦA TÔI'}
          </Text>

          {/* Right side buttons */}
          <View style={styles.headerRightButtons}>
            {isDragMode ? (
              <>
                {/* Done button for drag mode */}
                <TouchableOpacity
                  onPress={handleExitDragMode}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.headerButton, styles.doneButton]}
                >
                  <Check size={18} color="#FFFFFF" />
                  <Text style={styles.doneButtonText}>Xong</Text>
                </TouchableOpacity>
              </>
            ) : isEditMode ? (
              <>
                {/* Cancel button */}
                <TouchableOpacity
                  onPress={handleToggleEditMode}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.headerButton}
                >
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Help button */}
                <TouchableOpacity
                  onPress={() => setShowTooltip(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.headerButton}
                >
                  <HelpCircle size={16} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Three-dot menu for edit mode */}
                {allGoals.length > 0 && onDeleteGoal && (
                  <TouchableOpacity
                    onPress={handleToggleEditMode}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.headerButton}
                  >
                    <MoreVertical size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Mode hints */}
        {isDragMode && (
          <Text style={styles.editModeHint}>
            Giữ và kéo để sắp xếp thứ tự mục tiêu
          </Text>
        )}
        {isEditMode && (
          <Text style={styles.editModeHint}>
            Bấm vào mục tiêu để chọn • {selectedGoalIds.size} đã chọn
          </Text>
        )}
        {!isDragMode && !isEditMode && allGoals.length > 0 && (
          <Text style={styles.dragHint}>
            Nhấn giữ thumbnail để sắp xếp lại
          </Text>
        )}
      </View>

      {/* Category Filter Chips - hide in drag mode */}
      {!isDragMode && renderCategoryChips()}

      {/* Goals Grid or Empty State */}
      {filteredGoals.length > 0 ? (
        <>
          {isDragMode ? (
            // Reorder list with move up/down buttons
            <View style={styles.reorderContainer}>
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
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // Normal grid view
            <FlatList
              data={visibleGoals}
              keyExtractor={keyExtractor}
              renderItem={renderGoalItem}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* View All Button - hide in edit/drag mode */}
          {hasMoreGoals && !isEditMode && !isDragMode && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation?.navigate('AllGoals', { selectedCategory })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>
                Xem tất cả ({remainingCount} mục tiêu khác)
              </Text>
              <ChevronRight size={18} color="#8B5CF6" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        renderEmptyState()
      )}

      {/* Delete Selected Button - show when in edit mode with selections */}
      {isEditMode && selectedGoalIds.size > 0 && (
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
      )}

      {/* Tooltip */}
      <ControlledTooltip
        visible={showTooltip}
        onClose={() => setShowTooltip(false)}
        title="Mục tiêu Vision Board"
        content="Bấm vào thumbnail để xem chi tiết mục tiêu, theo dõi tiến độ và quản lý kế hoạch hành động. Sử dụng bộ lọc danh mục để tìm kiếm nhanh."
        position={{ top: 200, left: 20 }}
      />
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    // No paddingHorizontal here - parent ScrollView already has padding: SPACING.md
  },

  sectionHeader: {
    marginBottom: SPACING.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  sectionTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  headerButton: {
    padding: 6,
    borderRadius: 8,
  },

  editModeHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.xs,
  },

  // Category Chips - Larger, more readable style
  categoryChipsContainer: {
    marginVertical: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  categoryChipsContent: {
    paddingRight: SPACING.lg,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 24,
    height: 44,
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    gap: SPACING.xs,
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
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    minWidth: 24,
    alignItems: 'center',
  },

  categoryChipBadgeActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },

  categoryChipCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },

  categoryChipCountActive: {
    color: COLORS.textPrimary,
  },

  // Grid
  gridContainer: {
    paddingTop: SPACING.sm,
  },

  gridRow: {
    justifyContent: 'flex-start',
    gap: CARD_GAP,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    backgroundColor: 'rgba(30, 35, 60, 0.4)',
    borderRadius: 16,
    marginTop: SPACING.sm,
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },

  addButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },

  viewAllText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },

  // Goal Item
  goalItemWrapper: {
    position: 'relative',
  },

  // Selection overlay for edit mode
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: CARD_GAP, // Account for card's marginBottom
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

  // Delete Selected Button
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    gap: SPACING.sm,
  },

  deleteSelectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Reorder mode styles
  dragHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },

  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },

  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  reorderContainer: {
    paddingTop: SPACING.sm,
  },

  reorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(30, 35, 60, 0.6)',
    borderRadius: 12,
    padding: SPACING.sm,
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
    fontWeight: '500',
  },
});

export default memo(GoalsGridSection);
