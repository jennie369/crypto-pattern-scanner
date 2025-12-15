/**
 * GEM Mobile - Widget Factory Service
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Creates widgets from AI responses for Dashboard display.
 * Enforces tier limits for widget creation.
 *
 * Widget Types (matching user_widgets.type in database):
 * - goal: Goal tracking with progress
 * - affirmation: Daily affirmations
 * - habit: Task/habit tracking
 * - crystal: Crystal recommendations
 * - quote: Inspirational quotes
 * - tarot: Tarot reading summary
 */

import { supabase } from './supabase';
import responseDetectionService from './responseDetectionService';

// Tier limits for widgets
const WIDGET_LIMITS = {
  FREE: 3,
  TIER1: 10,
  PRO: 10,
  TIER2: 25,
  PREMIUM: 25,
  TIER3: -1, // Unlimited
  VIP: -1,
  ADMIN: -1,
};

// Map old widget types to new database types
const WIDGET_TYPE_MAP = {
  'GOAL_CARD': 'goal',
  'AFFIRMATION_CARD': 'affirmation',
  'ACTION_CHECKLIST': 'habit',
  'CRYSTAL_GRID': 'crystal',
  'CROSS_DOMAIN_CARD': 'goal',
  'STATS_WIDGET': 'goal',
  // From widgetTriggerDetector.js
  'steps': 'habit',
  'crystal': 'crystal',
  'affirmation': 'affirmation',
  'goal': 'goal',
  'iching': 'tarot',
  'tarot': 'tarot',
  'reminder': 'habit',
  'quote': 'quote',
};

/**
 * Generate UUID v4 format
 * Database expects proper UUID, not custom widget_xxx format
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class WidgetFactoryService {
  /**
   * Create widgets from AI response
   * @param {string} aiResponse - AI response text
   * @param {string} userQuery - User's query
   * @param {string} userId - User ID
   * @returns {Object|null} - Created widgets and detection data
   */
  async createWidgetsFromResponse(aiResponse, userQuery, userId) {
    // Detect response type
    const detection = responseDetectionService.detectResponseType(aiResponse, userQuery);

    // Use shouldSuggestDashboard which checks both rules and confidence threshold
    if (!detection || !responseDetectionService.shouldSuggestDashboard(detection)) {
      return null;
    }

    // Extract structured data
    const data = responseDetectionService.extractStructuredData(
      aiResponse,
      detection.type
    );

    // Create widgets based on type
    const widgets = [];

    switch (detection.type) {
      case 'MANIFESTATION_GOAL':
        // Create goal widget FIRST to get its ID
        const goalWidget = this.createGoalWidget(data, userId);
        if (goalWidget) {
          widgets.push(goalWidget);

          // Create affirmation widget LINKED to goal
          const affirmationWidget = this.createAffirmationWidget(data, userId, goalWidget.id);
          if (affirmationWidget) widgets.push(affirmationWidget);

          // Create action widget LINKED to goal
          const actionWidget = this.createActionChecklistWidget(data, userId, goalWidget.id);
          if (actionWidget) widgets.push(actionWidget);
        }
        break;

      case 'CRYSTAL_HEALING':
        const crystalWidget = this.createCrystalWidget(data, userId);
        if (crystalWidget) widgets.push(crystalWidget);
        break;

      case 'TRADING_ANALYSIS':
        const tradingWidget = this.createTradingWidget(data, userId);
        if (tradingWidget) widgets.push(tradingWidget);
        break;
    }

    return {
      widgets: widgets.filter(w => w !== null),
      detection,
      data,
      suggestionMessage: responseDetectionService.getWidgetSuggestionMessage(detection.type),
    };
  }

  /**
   * Create Goal Tracking widget
   * @param {Object} data - Extracted data
   * @param {string} userId - User ID
   * @returns {Object} - Goal widget
   */
  createGoalWidget(data, userId) {
    return {
      id: generateUUID(),
      user_id: userId,
      type: 'GOAL_CARD',
      title: data.goalTitle || 'Mục tiêu của bạn',
      data: {
        targetAmount: data.targetAmount || 100000000,
        currentAmount: 0,
        timeline: data.timeline || '6 tháng',
        targetDate: this.calculateTargetDate(data.timeline),
        affirmations: data.affirmations || [],
        crystals: data.crystalRecommendations || [],
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Affirmation widget
   * @param {Object} data - Extracted data
   * @param {string} userId - User ID
   * @param {string} goalId - Optional goal widget ID for linking
   * @returns {Object|null} - Affirmation widget
   */
  createAffirmationWidget(data, userId, goalId = null) {
    if (!data.affirmations || data.affirmations.length === 0) {
      return null;
    }

    return {
      id: generateUUID(),
      user_id: userId,
      type: 'AFFIRMATION_CARD',
      title: 'Daily Affirmations',
      data: {
        affirmations: data.affirmations,
        currentIndex: 0,
        completedToday: 0,
        streak: 0,
        lastCompletedDate: null,
        goalId: goalId, // Link to parent goal widget
      },
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Action Checklist widget
   * @param {Object} data - Extracted data
   * @param {string} userId - User ID
   * @param {string} goalId - Optional goal widget ID for linking
   * @returns {Object|null} - Checklist widget
   */
  createActionChecklistWidget(data, userId, goalId = null) {
    if (!data.actionSteps || data.actionSteps.length === 0) {
      return null;
    }

    return {
      id: generateUUID(),
      user_id: userId,
      type: 'ACTION_CHECKLIST',
      title: 'Action Plan',
      data: {
        tasks: data.actionSteps.map((step, index) => ({
          id: generateUUID(),
          title: step,
          completed: false,
          order: index,
        })),
        goalId: goalId, // Link to parent goal widget
      },
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Crystal Grid widget
   * @param {Object} data - Extracted data
   * @param {string} userId - User ID
   * @returns {Object} - Crystal widget
   */
  createCrystalWidget(data, userId) {
    return {
      id: generateUUID(),
      user_id: userId,
      type: 'CRYSTAL_GRID',
      title: 'Crystal Recommendations',
      data: {
        crystals: data.crystalNames || [],
        usageGuide: data.usageGuide || '',
        placement: data.placement || '',
        chakras: [],
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Trading Analysis widget
   * @param {Object} data - Extracted data
   * @param {string} userId - User ID
   * @returns {Object} - Trading widget
   */
  createTradingWidget(data, userId) {
    return {
      id: generateUUID(),
      user_id: userId,
      type: 'CROSS_DOMAIN_CARD',
      title: 'Trading Analysis',
      data: {
        mistakes: data.mistakes || [],
        insights: data.spiritualInsight || [],
        actionPlan: data.actionPlan || [],
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Stats widget (standalone)
   * @param {string} userId - User ID
   * @returns {Object} - Stats widget
   */
  createStatsWidget(userId) {
    return {
      id: generateUUID(),
      user_id: userId,
      type: 'STATS_WIDGET',
      title: 'Your Stats',
      data: {
        activeGoals: 0,
        streak: 0,
        affirmationsCompleted: 0,
        meditationMinutes: 0,
      },
      position: 99, // Always last
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Helper: Calculate target date from timeline
   * @param {string} timeline - Timeline string
   * @returns {string} - ISO date string
   */
  calculateTargetDate(timeline) {
    const now = new Date();
    const match = timeline?.match(/(\d+)\s*(tháng|months?|năm|years?|tuần|weeks?|ngày|days?)/i);

    if (!match) {
      // Default 6 months
      now.setMonth(now.getMonth() + 6);
      return now.toISOString();
    }

    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes('tháng') || unit.includes('month')) {
      now.setMonth(now.getMonth() + num);
    } else if (unit.includes('năm') || unit.includes('year')) {
      now.setFullYear(now.getFullYear() + num);
    } else if (unit.includes('tuần') || unit.includes('week')) {
      now.setDate(now.getDate() + (num * 7));
    } else if (unit.includes('ngày') || unit.includes('day')) {
      now.setDate(now.getDate() + num);
    }

    return now.toISOString();
  }

  /**
   * Get widget preview data for WidgetSuggestionCard
   * @param {Array} widgets - Created widgets
   * @returns {Object} - Preview data
   */
  getWidgetPreviewData(widgets) {
    if (!widgets || widgets.length === 0) {
      return null;
    }

    const previews = widgets.map(widget => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      icon: this.getWidgetIcon(widget.type),
      description: this.getWidgetDescription(widget),
    }));

    return {
      count: widgets.length,
      previews,
      primaryWidget: previews[0],
    };
  }

  /**
   * Get widget icon name (Lucide icon)
   * @param {string} widgetType
   * @returns {string}
   */
  getWidgetIcon(widgetType) {
    const icons = {
      'GOAL_CARD': 'target',
      'AFFIRMATION_CARD': 'sparkles',
      'ACTION_CHECKLIST': 'check-square',
      'CRYSTAL_GRID': 'gem',
      'CROSS_DOMAIN_CARD': 'trending-up',
      'STATS_WIDGET': 'bar-chart-2',
    };

    return icons[widgetType] || 'layout';
  }

  /**
   * Get widget description for preview
   * @param {Object} widget
   * @returns {string}
   */
  getWidgetDescription(widget) {
    switch (widget.type) {
      case 'GOAL_CARD':
        return `Theo dõi mục tiêu: ${widget.title}`;
      case 'AFFIRMATION_CARD':
        return `${widget.data.affirmations?.length || 0} affirmations`;
      case 'ACTION_CHECKLIST':
        return `${widget.data.tasks?.length || 0} bước hành động`;
      case 'CRYSTAL_GRID':
        return `${widget.data.crystals?.length || 0} loại đá`;
      case 'CROSS_DOMAIN_CARD':
        return 'Phân tích trading & spiritual';
      case 'STATS_WIDGET':
        return 'Thống kê hoạt động';
      default:
        return widget.title;
    }
  }
}

/**
 * Check if user can create more widgets based on tier
 */
const checkWidgetLimit = async (userId) => {
  try {
    // Get user tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('chatbot_tier, scanner_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('[WidgetFactory] Profile error:', profileError);
    }

    // Get highest tier
    const tier = profile?.chatbot_tier || profile?.scanner_tier || 'FREE';
    const limit = WIDGET_LIMITS[tier] ?? WIDGET_LIMITS.FREE;

    // Unlimited
    if (limit === -1) {
      return { canCreate: true, currentCount: 0, limit: -1, tier };
    }

    // Count current widgets
    const { count, error: countError } = await supabase
      .from('user_widgets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (countError) {
      console.warn('[WidgetFactory] Count error:', countError);
    }

    return {
      canCreate: (count || 0) < limit,
      currentCount: count || 0,
      limit,
      tier,
    };
  } catch (error) {
    console.error('[WidgetFactory] checkWidgetLimit error:', error);
    return { canCreate: false, currentCount: 0, limit: 0, tier: 'FREE', error: error.message };
  }
};

/**
 * Create a widget in database with tier limit check
 */
const createWidgetInDatabase = async (userId, widgetType, extractedData, sourceMessageId = null) => {
  try {
    // Check limit first
    const limitCheck = await checkWidgetLimit(userId);
    if (!limitCheck.canCreate) {
      return {
        success: false,
        error: `Bạn đã đạt giới hạn ${limitCheck.limit} mục tiêu cho ${limitCheck.tier}. Nâng cấp để tạo thêm!`,
        needsUpgrade: true,
        currentCount: limitCheck.currentCount,
        limit: limitCheck.limit,
      };
    }

    // Map widget type to database type
    const dbType = WIDGET_TYPE_MAP[widgetType] || widgetType;

    // Get next position
    const { data: maxPos } = await supabase
      .from('user_widgets')
      .select('position')
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (maxPos?.position || 0) + 1;

    // Generate title based on type
    const title = generateWidgetTitle(dbType, extractedData);

    // Create widget
    const { data: widget, error } = await supabase
      .from('user_widgets')
      .insert({
        user_id: userId,
        type: dbType,
        title,
        data: extractedData || {},
        settings: {
          created_from: sourceMessageId ? 'AI_CHAT' : 'MANUAL',
          source_message_id: sourceMessageId,
        },
        position: nextPosition,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[WidgetFactory] Created widget in DB:', widget.id, dbType);

    return {
      success: true,
      widget,
    };
  } catch (error) {
    console.error('[WidgetFactory] createWidgetInDatabase error:', error);
    return {
      success: false,
      error: error.message || 'Không thể tạo mục tiêu',
    };
  }
};

/**
 * Generate title for widget based on type and data
 */
const generateWidgetTitle = (widgetType, extractedData) => {
  switch (widgetType) {
    case 'goal':
      if (extractedData?.targetAmount) {
        const formatted = new Intl.NumberFormat('vi-VN').format(extractedData.targetAmount);
        return `Mục tiêu: ${formatted} VND`;
      }
      return extractedData?.goalTitle || 'Mục tiêu mới';

    case 'affirmation':
      return 'Khẳng định hàng ngày';

    case 'habit':
      const count = extractedData?.habits?.length || extractedData?.tasks?.length || extractedData?.steps?.length || 0;
      return count > 0 ? `Kế hoạch hành động (${count} bước)` : 'Thói quen mới';

    case 'crystal':
      if (extractedData?.purpose) {
        const purposes = {
          love: 'Tình yêu',
          wealth: 'Thịnh vượng',
          meditation: 'Thiền định',
          protection: 'Bảo vệ',
          general: 'Cân bằng',
        };
        return `Crystal Grid - ${purposes[extractedData.purpose] || 'Năng lượng'}`;
      }
      return 'Crystal Grid';

    case 'quote':
      return 'Lời khuyên từ Gem Master';

    case 'tarot':
      return 'Kết quả Tarot';

    default:
      return 'Mục tiêu mới';
  }
};

/**
 * Get user's widgets from database
 */
const getUserWidgetsFromDatabase = async (userId, type = null) => {
  try {
    let query = supabase
      .from('user_widgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[WidgetFactory] getUserWidgetsFromDatabase error:', error);
    return [];
  }
};

/**
 * Delete widget from database (soft delete)
 */
const deleteWidgetFromDatabase = async (widgetId) => {
  try {
    const { error } = await supabase
      .from('user_widgets')
      .update({ is_active: false })
      .eq('id', widgetId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[WidgetFactory] deleteWidgetFromDatabase error:', error);
    return { success: false, error: error.message };
  }
};

// Singleton instance
const widgetFactoryService = new WidgetFactoryService();

// Export instance and helper functions
export default widgetFactoryService;
export {
  checkWidgetLimit,
  createWidgetInDatabase,
  getUserWidgetsFromDatabase,
  deleteWidgetFromDatabase,
  generateWidgetTitle,
  WIDGET_LIMITS,
  WIDGET_TYPE_MAP,
};
