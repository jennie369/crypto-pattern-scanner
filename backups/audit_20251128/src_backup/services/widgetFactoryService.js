/**
 * GEM Mobile - Widget Factory Service
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Creates widgets from AI responses for Dashboard display.
 *
 * Widget Types:
 * - GOAL_CARD: Goal tracking with progress
 * - AFFIRMATION_CARD: Daily affirmations
 * - ACTION_CHECKLIST: Task list
 * - CRYSTAL_GRID: Crystal recommendations
 * - CROSS_DOMAIN_CARD: Trading analysis
 * - STATS_WIDGET: User statistics
 */

import responseDetectionService from './responseDetectionService';

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

    if (!detection || !detection.rules.suggestDashboard) {
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
        const goalWidget = this.createGoalWidget(data, userId);
        if (goalWidget) widgets.push(goalWidget);

        const affirmationWidget = this.createAffirmationWidget(data, userId);
        if (affirmationWidget) widgets.push(affirmationWidget);

        const actionWidget = this.createActionChecklistWidget(data, userId);
        if (actionWidget) widgets.push(actionWidget);
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
   * @returns {Object|null} - Affirmation widget
   */
  createAffirmationWidget(data, userId) {
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
   * @returns {Object|null} - Checklist widget
   */
  createActionChecklistWidget(data, userId) {
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

export default new WidgetFactoryService();
