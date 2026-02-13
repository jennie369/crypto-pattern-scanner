/**
 * GEM Mobile - Widget Suggestion Card
 * Day 17-19: AI Chat → Dashboard Integration
 * Phase 2-3: Integration with widgetTriggerDetector
 *
 * Shows "Add to Dashboard?" suggestion in chat when AI detects
 * a widget-worthy response (goals, affirmations, I Ching, Tarot, etc.)
 * Uses design tokens for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { navigateToScreen } from '../../utils/navigationHelper';
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
import { supabase } from '../../services/supabase';
import { checkWidgetLimit } from '../../services/widgetFactoryService';
import {
  WIDGET_TYPES,
  getWidgetIcon as getTriggerIcon,
  getWidgetColor as getTriggerColor,
} from '../../utils/widgetTriggerDetector';
// Map widget types to life areas for InlineChatForm
const WIDGET_TO_LIFE_AREA = {
  'CRYSTAL_GRID': 'spiritual',
  'crystal': 'spiritual',
  'CROSS_DOMAIN_CARD': 'finance', // Trading Analysis → finance
  'goal': 'personal',
  'affirmation': 'personal',
};

// Widget types that require the inline form flow (affirmation + action plan selection)
const REQUIRES_FORM_FLOW = ['CRYSTAL_GRID', 'crystal', 'CROSS_DOMAIN_CARD'];

// Default rituals for each life area (auto-selected when none provided)
const DEFAULT_RITUALS = {
  finance: { id: 'gratitude-flow', title: 'Dòng Chảy Biết Ơn', subtitle: 'Thu hút thịnh vượng', color: '#FFD700' },
  crypto: { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Giữ bình tĩnh khi trading', color: '#667EEA' },
  career: { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước nguyện sự nghiệp', color: '#9D4EDD' },
  health: { id: 'cleansing-breath', title: 'Thở Thanh Lọc', subtitle: 'Thải độc cơ thể', color: '#667EEA' },
  relationships: { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Tăng tần số yêu thương', color: '#F093FB' },
  personal: { id: 'letter-to-universe', title: 'Thư Gửi Vũ Trụ', subtitle: 'Gửi ước mơ phát triển', color: '#9D4EDD' },
  spiritual: { id: 'heart-expansion', title: 'Mở Rộng Trái Tim', subtitle: 'Kết nối yêu thương', color: '#F093FB' },
};

const WidgetSuggestionCard = ({
  widgets,
  suggestionMessage,
  userId,
  onWidgetsCreated,
  onDismiss,
  onShowInlineForm, // NEW: Callback to show InlineChatForm in parent (GemMasterScreen)
}) => {
  const navigation = useNavigation();
  const [isCreating, setIsCreating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', buttons: [] });
  // State for inline form - passed to parent via callback
  const [pendingFormData, setPendingFormData] = useState(null);

  if (isDismissed || !widgets || widgets.length === 0) {
    return null;
  }

  // Custom Alert function (dark theme)
  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => {} }]) => {
    setAlertModal({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertModal({ visible: false, title: '', message: '', buttons: [] });
  };

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

  // Navigate to VisionBoard using helper - scroll to Goals section
  const navigateToVisionBoard = useCallback(() => {
    hideAlert();
    navigateToScreen(navigation, 'VisionBoard', { scrollToSection: 'goals' });
  }, [navigation]);

  // Navigate to Shop for upgrade using helper
  const navigateToShop = useCallback(() => {
    hideAlert();
    navigateToScreen(navigation, 'Shop');
  }, [navigation]);

  const handleAddToDashboard = async () => {
    if (!userId) {
      showAlert('Thông báo', 'Vui lòng đăng nhập để sử dụng tính năng này.');
      return;
    }

    // Check if any widget requires the inline form flow (Crystal/Trading)
    const primaryWidget = widgets[0];
    const widgetType = primaryWidget?.type;

    if (REQUIRES_FORM_FLOW.includes(widgetType) && onShowInlineForm) {
      // Call parent to show InlineChatForm instead of direct insert
      const lifeArea = WIDGET_TO_LIFE_AREA[widgetType] || 'personal';
      console.log('[WidgetSuggestionCard] Widget requires inline form:', widgetType, '→', lifeArea);

      // Dismiss this card and show inline form in parent
      setIsDismissed(true);
      onShowInlineForm({
        formType: 'goal',
        preSelectedArea: lifeArea,
        widgetType: widgetType,
      });
      return;
    }

    try {
      setIsCreating(true);

      // Check tier limit first
      const limitCheck = await checkWidgetLimit(userId);
      if (!limitCheck.canCreate) {
        showAlert(
          'Đạt giới hạn',
          `Bạn đã đạt giới hạn ${limitCheck.limit} mục tiêu cho ${limitCheck.tier}. Nâng cấp để tạo thêm!`,
          [
            { text: 'Để sau', onPress: hideAlert },
            { text: 'Nâng cấp TIER', onPress: navigateToShop },
          ]
        );
        return;
      }

      // Transform widgets to proper format for vision_board_widgets table
      // This table uses 'content' column (JSONB), NOT 'data' column
      const widgetsToInsert = widgets.map(w => {
        // Build content based on widget type
        let content = {};
        const widgetData = w.data || {};

        // Normalize legacy widget types to new format
        // Legacy types: GOAL_CARD, AFFIRMATION_CARD, ACTION_CHECKLIST, CRYSTAL_GRID
        const normalizedType = (() => {
          const type = w.type;
          if (type === 'GOAL_CARD' || type === 'CROSS_DOMAIN_CARD' || type === 'STATS_WIDGET') return 'goal';
          if (type === 'AFFIRMATION_CARD') return 'affirmation';
          if (type === 'ACTION_CHECKLIST') return 'habit';
          if (type === 'CRYSTAL_GRID') return 'crystal';
          return type; // Keep as-is for new types
        })();

        if (normalizedType === WIDGET_TYPES.AFFIRMATION || normalizedType === 'affirmation') {
          // Affirmations should be in { affirmations: [...], lifeArea } format
          content = {
            lifeArea: widgetData.lifeArea || 'personal', // Add lifeArea for grouping
            affirmations: Array.isArray(widgetData.affirmations)
              ? widgetData.affirmations
              : (typeof widgetData.affirmations === 'string'
                  ? [widgetData.affirmations]
                  : []),
          };
        } else if (normalizedType === WIDGET_TYPES.GOAL || normalizedType === 'goal') {
          // For goals, extract title from goalTitle (legacy) or goalText or w.title
          const goalTitle = widgetData.goalTitle || widgetData.goalText || w.title || 'Mục tiêu mới';
          const goalLifeArea = widgetData.lifeArea || 'personal';

          // Extract affirmations from widget data
          const affirmations = Array.isArray(widgetData.affirmations)
            ? widgetData.affirmations
            : [];

          // Extract action steps from widget data (actionSteps, habits, steps, etc.)
          const rawSteps = widgetData.actionSteps || widgetData.steps || widgetData.habits || [];
          const steps = Array.isArray(rawSteps)
            ? rawSteps.map((step, idx) => ({
                id: `step_${Date.now()}_${idx}`,
                title: typeof step === 'string' ? step : (step.text || step.title || step.name || ''),
                action_type: step.action_type || (idx < 2 ? 'daily' : idx < 3 ? 'weekly' : 'monthly'),
                completed: false,
              }))
            : [];

          // Auto-select a default ritual based on life area (so goals always have at least 1 ritual)
          const defaultRitual = DEFAULT_RITUALS[goalLifeArea] || DEFAULT_RITUALS.personal;
          const rituals = widgetData.rituals && widgetData.rituals.length > 0
            ? widgetData.rituals
            : [defaultRitual];

          content = {
            lifeArea: goalLifeArea,
            title: goalTitle, // Store title directly for easy access
            goals: [{
              id: `goal_${Date.now()}`,
              title: goalTitle,
              completed: false,
              timeline: widgetData.timeline || widgetData.targetDate || null,
              lifeArea: goalLifeArea,
              targetAmount: widgetData.targetAmount || null,
              currentAmount: widgetData.currentAmount || 0,
              rituals: rituals, // Include rituals in goal object
            }],
            // Include affirmations directly in content for VisionBoard to read
            affirmations: affirmations.length > 0 ? affirmations : undefined,
            // Include action steps directly in content for VisionBoard to read
            steps: steps.length > 0 ? steps : undefined,
            // Also store crystals if available
            crystals: widgetData.crystalRecommendations || widgetData.crystals || undefined,
            // Store rituals at content level for easy access
            rituals: rituals,
          };
        } else if (normalizedType === WIDGET_TYPES.STEPS || normalizedType === 'habit' || normalizedType === 'steps') {
          // For habits/steps, also check for widgetData.habits (legacy from ACTION_CHECKLIST)
          const items = widgetData.steps || widgetData.habits || widgetData.actionSteps || [];
          content = {
            lifeArea: widgetData.lifeArea || 'personal', // Add lifeArea for grouping
            habits: Array.isArray(items)
              ? items.map((item, i) => ({
                  id: `habit_${Date.now()}_${i}`,
                  title: item.text || item.name || item.title || (typeof item === 'string' ? item : ''),
                  completed: item.completed || item.done || false,
                }))
              : [],
          };
        } else if (normalizedType === WIDGET_TYPES.CRYSTAL || normalizedType === 'crystal') {
          content = {
            crystalName: widgetData.vietnameseName || widgetData.name || 'Crystal',
            purpose: widgetData.reason || widgetData.purpose || '',
            shopHandle: widgetData.shopHandle || null,
            // Also store crystal list if available (for CRYSTAL_GRID type)
            crystals: widgetData.crystals || null,
          };
        } else if (normalizedType === WIDGET_TYPES.ICHING || normalizedType === WIDGET_TYPES.TAROT) {
          content = widgetData;
        } else {
          content = widgetData;
        }

        // Get icon based on type
        const iconMap = {
          [WIDGET_TYPES.AFFIRMATION]: '✨',
          'affirmation': '✨',
          [WIDGET_TYPES.GOAL]: '🎯',
          'goal': '🎯',
          [WIDGET_TYPES.STEPS]: '📋',
          'habit': '📋',
          'steps': '📋',
          [WIDGET_TYPES.CRYSTAL]: '💎',
          'crystal': '💎',
          [WIDGET_TYPES.ICHING]: '☯️',
          [WIDGET_TYPES.TAROT]: '🃏',
          [WIDGET_TYPES.QUOTE]: '💬',
        };

        return {
          user_id: userId,
          type: normalizedType, // Use normalized type for consistent VisionBoard filtering
          title: w.title || getWidgetLabel(normalizedType),
          icon: iconMap[normalizedType] || '📌',
          content: content, // JSONB column
          is_active: true,
        };
      });

      // Debug: Log the widgets being inserted
      console.log('[WidgetSuggestionCard] Widgets to insert:', JSON.stringify(widgetsToInsert.map(w => ({
        type: w.type,
        title: w.title,
        content: JSON.stringify(w.content).substring(0, 200)
      })), null, 2));

      // Insert to vision_board_widgets table (NOT user_widgets)
      const { data: createdWidgets, error } = await supabase
        .from('vision_board_widgets')
        .insert(widgetsToInsert)
        .select();

      if (error) throw error;

      console.log('[WidgetSuggestionCard] Created widgets in vision_board_widgets:', createdWidgets?.length, createdWidgets?.map(w => w.type));

      // Success alert with navigation option
      showAlert(
        'Đã thêm!',
        `${createdWidgets?.length || 0} mục tiêu đã được thêm vào Vision Board của bạn.`,
        [
          { text: 'OK', onPress: hideAlert },
          { text: 'Xem Vision Board', onPress: navigateToVisionBoard },
        ]
      );

      if (onWidgetsCreated) {
        onWidgetsCreated(createdWidgets);
      }

      setIsDismissed(true);
    } catch (error) {
      console.error('[WidgetSuggestionCard] Error creating widgets:', error);
      showAlert('Lỗi', `Không thể tạo mục tiêu: ${error.message}`);
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
          <Text style={styles.headerText}>🎁 Thêm vào Vision Board?</Text>
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
        {suggestionMessage || 'Tôi có thể tạo mục tiêu theo dõi cho bạn.'}
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
            <Text style={styles.previewLabel}>+{widgets.length - 3} khác</Text>
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
          <Text style={styles.dismissText}>Bỏ qua</Text>
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
              <Text style={styles.addButtonText}>Thêm Mục Tiêu</Text>
              <ChevronRight size={TYPOGRAPHY.fontSize.xxl} color={COLORS.bgMid} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Dark Theme Alert Modal */}
      <Modal
        visible={alertModal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <Pressable style={styles.modalOverlay} onPress={hideAlert}>
          <View style={styles.modalContainer}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <Text style={styles.modalTitle}>{alertModal.title}</Text>

                {/* Modal Message */}
                <Text style={styles.modalMessage}>{alertModal.message}</Text>

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  {alertModal.buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalButton,
                        index === alertModal.buttons.length - 1 && styles.modalButtonPrimary,
                      ]}
                      onPress={() => {
                        button.onPress?.();
                      }}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          index === alertModal.buttons.length - 1 && styles.modalButtonTextPrimary,
                        ]}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  // Modal styles - Dark theme with gold accents
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: COLORS.glassBg || '#1a1a2e',
    borderRadius: SPACING.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.gold,
  },
  modalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textMuted,
  },
  modalButtonTextPrimary: {
    color: COLORS.bgMid,
  },
});

export default WidgetSuggestionCard;
