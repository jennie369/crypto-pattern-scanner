/**
 * GEM Mobile - Widget Suggestion Card
 * Day 17-19: AI Chat → Dashboard Integration
 * Phase 2-3: Integration with widgetTriggerDetector
 *
 * Shows "Add to Dashboard?" suggestion in chat when AI detects
 * a widget-worthy response (goals, affirmations, I Ching, Tarot, etc.)
 * Uses design tokens for consistent styling.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  CheckSquare,
  Gem,
  TrendingUp,
  ChevronRight,
  X,
  Plus,
  Heart,
  Hexagon,
  Bell,
  Quote,
  ListChecks,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import widgetManagementService from '../../services/widgetManagementService';
import {
  WIDGET_TYPES,
  getWidgetIcon as getTriggerIcon,
  getWidgetColor as getTriggerColor,
} from '../../utils/widgetTriggerDetector';

const WidgetSuggestionCard = ({
  widgets,
  suggestionMessage,
  userId,
  onWidgetsCreated,
  onDismiss,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !widgets || widgets.length === 0) {
    return null;
  }

  const getWidgetIcon = (widgetType) => {
    const icons = {
      // Legacy types
      'GOAL_CARD': Target,
      'AFFIRMATION_CARD': Sparkles,
      'ACTION_CHECKLIST': CheckSquare,
      'CRYSTAL_GRID': Gem,
      'CROSS_DOMAIN_CARD': TrendingUp,
      'STATS_WIDGET': LayoutDashboard,
      // New widgetTriggerDetector types
      [WIDGET_TYPES.STEPS]: ListChecks,
      [WIDGET_TYPES.CRYSTAL]: Gem,
      [WIDGET_TYPES.AFFIRMATION]: Heart,
      [WIDGET_TYPES.GOAL]: Target,
      [WIDGET_TYPES.ICHING]: Hexagon,
      [WIDGET_TYPES.TAROT]: Sparkles,
      [WIDGET_TYPES.REMINDER]: Bell,
      [WIDGET_TYPES.QUOTE]: Quote,
    };
    return icons[widgetType] || LayoutDashboard;
  };

  const getWidgetLabel = (widgetType) => {
    const labels = {
      // Legacy types
      'GOAL_CARD': 'Goal Tracker',
      'AFFIRMATION_CARD': 'Affirmations',
      'ACTION_CHECKLIST': 'Action Plan',
      'CRYSTAL_GRID': 'Crystal Grid',
      'CROSS_DOMAIN_CARD': 'Trading Analysis',
      'STATS_WIDGET': 'Stats',
      // New widgetTriggerDetector types
      [WIDGET_TYPES.STEPS]: 'Bước hành động',
      [WIDGET_TYPES.CRYSTAL]: 'Crystal',
      [WIDGET_TYPES.AFFIRMATION]: 'Affirmation',
      [WIDGET_TYPES.GOAL]: 'Mục tiêu',
      [WIDGET_TYPES.ICHING]: 'Quẻ Dịch',
      [WIDGET_TYPES.TAROT]: 'Tarot',
      [WIDGET_TYPES.REMINDER]: 'Nhắc nhở',
      [WIDGET_TYPES.QUOTE]: 'Câu nói',
    };
    return labels[widgetType] || 'Widget';
  };

  // Get widget color - use trigger detector colors for new types
  const getWidgetColor = (widgetType) => {
    // Check if it's a new type from widgetTriggerDetector
    if (Object.values(WIDGET_TYPES).includes(widgetType)) {
      return getTriggerColor(widgetType);
    }
    return COLORS.gold;
  };

  const handleAddToDashboard = async () => {
    try {
      setIsCreating(true);

      // Add user_id to each widget
      const widgetsWithUser = widgets.map(w => ({
        ...w,
        user_id: userId,
      }));

      // Create widgets in database
      const createdWidgets = await widgetManagementService.createWidgets(widgetsWithUser);

      console.log('[WidgetSuggestionCard] Created widgets:', createdWidgets.length);

      if (onWidgetsCreated) {
        onWidgetsCreated(createdWidgets);
      }

      setIsDismissed(true);
    } catch (error) {
      console.error('[WidgetSuggestionCard] Error creating widgets:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LayoutDashboard size={SPACING.xl} color={COLORS.gold} />
          <Text style={styles.headerText}>Add to Dashboard?</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={SPACING.xl} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Suggestion Message */}
      <Text style={styles.suggestionMessage}>
        {suggestionMessage || 'Tôi có thể tạo widgets theo dõi cho bạn.'}
      </Text>

      {/* Widget Previews */}
      <View style={styles.previewsContainer}>
        {widgets.slice(0, 3).map((widget, index) => {
          const IconComponent = getWidgetIcon(widget.type);
          const iconColor = getWidgetColor(widget.type);
          return (
            <View key={widget.id || index} style={styles.previewItem}>
              <IconComponent size={TYPOGRAPHY.fontSize.xxl} color={iconColor} />
              <Text style={styles.previewLabel} numberOfLines={1}>
                {getWidgetLabel(widget.type)}
              </Text>
            </View>
          );
        })}
        {widgets.length > 3 && (
          <View style={styles.previewItem}>
            <Plus size={TYPOGRAPHY.fontSize.xxl} color={COLORS.textMuted} />
            <Text style={styles.previewLabel}>+{widgets.length - 3} more</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.dismissTextButton}
          onPress={handleDismiss}
          disabled={isCreating}
        >
          <Text style={styles.dismissText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToDashboard}
          disabled={isCreating}
          activeOpacity={0.8}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={COLORS.bgMid} />
          ) : (
            <>
              <Plus size={TYPOGRAPHY.fontSize.xxl} color={COLORS.bgMid} />
              <Text style={styles.addButtonText}>Add to Dashboard</Text>
              <ChevronRight size={TYPOGRAPHY.fontSize.xxl} color={COLORS.bgMid} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
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
    gap: SPACING.sm,
  },
  headerText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  suggestionMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  previewsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.sm,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dismissTextButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  dismissText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },
});

export default WidgetSuggestionCard;
