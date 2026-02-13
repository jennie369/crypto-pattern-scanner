// WidgetFactory Service
// Creates dashboard widgets and manifestation goals from AI responses

import { supabase } from '../lib/supabaseClient';
import { ResponseTypes } from './responseDetector';
import { DataExtractor } from './dataExtractor';

export class WidgetFactory {

  static dataExtractor = new DataExtractor();

  /**
   * Main entry point: Create widget from AI response
   * @param {string} userId - User ID
   * @param {string} aiResponse - Full AI response text
   * @param {Object} detectionResult - Result from ResponseDetector
   * @returns {Promise<Object>} Creation result with widgets and goal data
   */
  static async createFromAIResponse(userId, aiResponse, detectionResult) {
    const { type, confidence } = detectionResult;

    // Only create widgets for high-confidence detections
    if (confidence < 0.85) {
      return {
        success: false,
        message: 'Confidence too low to create widget',
        confidence
      };
    }

    try {
      switch(type) {
        case ResponseTypes.MANIFESTATION_GOAL:
          const data = this.dataExtractor.extractManifestationData(aiResponse);
          return await this.createManifestationPackage(userId, data, aiResponse);

        case ResponseTypes.CRYSTAL_RECOMMENDATION:
          const crystalData = this.dataExtractor.extractCrystals(aiResponse);
          return await this.createCrystalWidget(userId, crystalData, aiResponse);

        case ResponseTypes.AFFIRMATIONS_ONLY:
          const affirmations = this.dataExtractor.extractAffirmations(aiResponse);
          return await this.createAffirmationWidget(userId, affirmations);

        case ResponseTypes.TRADING_ANALYSIS:
          return await this.createTradingAnalysisWidget(userId, aiResponse);

        default:
          return {
            success: false,
            message: 'No widget type for this response',
            type
          };
      }
    } catch (error) {
      console.error('Error creating widget:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Manifestation Package (multiple widgets + goal)
   */
  static async createManifestationPackage(userId, data, fullResponse) {
    try {
      // 1. Create Goal in database
      const { data: goal, error: goalError } = await supabase
        .from('manifestation_goals')
        .insert({
          user_id: userId,
          title: data.goalTitle,
          category: this.detectCategory(data.goalTitle),
          target_amount: data.targetAmount,
          target_date: this.calculateTargetDate(data.timeline),
          affirmations: data.affirmations || [],
          action_steps: data.actionSteps || [],
          crystal_recommendations: data.crystalRecommendations || []
        })
        .select()
        .single();

      if (goalError) throw goalError;

      const createdWidgets = [];

      // 2. Create Goal Card Widget
      const { data: goalWidget, error: goalWidgetError } = await supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: 'GOAL_CARD',
          widget_size: 'LARGE',
          linked_goal_id: goal.id,
          widget_data: {
            title: data.goalTitle,
            targetAmount: data.targetAmount,
            currentAmount: 0,
            progress: 0,
            targetDate: this.calculateTargetDate(data.timeline),
            category: this.detectCategory(data.goalTitle)
          },
          position_order: 0,
          created_from: 'CHAT'
        })
        .select()
        .single();

      if (goalWidgetError) throw goalWidgetError;
      createdWidgets.push(goalWidget);

      // 3. Create Affirmation Widget (if has affirmations)
      if (data.affirmations && data.affirmations.length > 0) {
        const { data: affWidget, error: affWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'AFFIRMATION_CARD',
            widget_size: 'MEDIUM',
            linked_goal_id: goal.id,
            widget_data: {
              affirmations: data.affirmations,
              currentIndex: 0,
              completedToday: 0,
              streak: 0,
              lastCompletedDate: null
            },
            position_order: 1,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!affWidgetError) {
          createdWidgets.push(affWidget);
        }
      }

      // 4. Create Action Plan Widget (if has steps)
      if (data.actionSteps && data.actionSteps.length > 0) {
        const { data: actionWidget, error: actionWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'ACTION_PLAN',
            widget_size: 'LARGE',
            linked_goal_id: goal.id,
            widget_data: {
              steps: data.actionSteps,
              completedTasks: [],
              totalTasks: this.countTasks(data.actionSteps),
              currentWeek: 1
            },
            position_order: 2,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!actionWidgetError) {
          createdWidgets.push(actionWidget);
        }
      }

      // 5. Create Crystal Grid Widget (if has recommendations)
      if (data.crystalRecommendations && data.crystalRecommendations.length > 0) {
        const { data: cryWidget, error: cryWidgetError } = await supabase
          .from('dashboard_widgets')
          .insert({
            user_id: userId,
            widget_type: 'CRYSTAL_GRID',
            widget_size: 'MEDIUM',
            linked_goal_id: goal.id,
            widget_data: {
              crystals: data.crystalRecommendations,
              lastCleansed: null,
              nextCleanse: this.calculateNextCleanse()
            },
            position_order: 3,
            created_from: 'CHAT'
          })
          .select()
          .single();

        if (!cryWidgetError) {
          createdWidgets.push(cryWidget);
        }
      }

      // 6. Update Goal with widget_id
      await supabase
        .from('manifestation_goals')
        .update({ widget_id: goalWidget.id })
        .eq('id', goal.id);

      // 7. Create Daily Reminders
      await this.createReminders(userId, goal.id, data);

      // 8. Return package info
      return {
        success: true,
        goal: goal,
        widgets: createdWidgets,
        message: `✨ Đã tạo ${createdWidgets.length} widgets cho mục tiêu của bạn!`
      };

    } catch (error) {
      console.error('Error creating manifestation package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Crystal Widget
   */
  static async createCrystalWidget(userId, crystals, fullResponse) {
    try {
      const { data: widget, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: 'CRYSTAL_GRID',
          widget_size: 'MEDIUM',
          widget_data: {
            crystals: crystals,
            lastCleansed: null,
            nextCleanse: this.calculateNextCleanse(),
            fullRecommendation: fullResponse
          },
          position_order: 0,
          created_from: 'CHAT'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        widgets: [widget],
        message: '💎 Đã tạo Crystal Grid widget!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Affirmation Widget
   */
  static async createAffirmationWidget(userId, affirmations) {
    try {
      const { data: widget, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: 'AFFIRMATION_CARD',
          widget_size: 'MEDIUM',
          widget_data: {
            affirmations: affirmations,
            currentIndex: 0,
            completedToday: 0,
            streak: 0,
            lastCompletedDate: null
          },
          position_order: 0,
          created_from: 'CHAT'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        widgets: [widget],
        message: '✨ Đã tạo Affirmation widget!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Trading Analysis Widget
   */
  static async createTradingAnalysisWidget(userId, analysis) {
    try {
      const { data: widget, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          user_id: userId,
          widget_type: 'TRADING_ANALYSIS',
          widget_size: 'LARGE',
          widget_data: {
            analysis: analysis,
            createdDate: new Date().toISOString(),
            isResolved: false
          },
          position_order: 0,
          created_from: 'CHAT'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        widgets: [widget],
        message: '📊 Đã tạo Trading Analysis widget!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate target date from timeline
   */
  static calculateTargetDate(timeline) {
    const now = new Date();

    if (timeline.months) {
      now.setMonth(now.getMonth() + timeline.months);
    } else if (timeline.weeks) {
      now.setDate(now.getDate() + (timeline.weeks * 7));
    } else if (timeline.days) {
      now.setDate(now.getDate() + timeline.days);
    }

    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Calculate next crystal cleanse date (full moon)
   */
  static calculateNextCleanse() {
    const now = new Date();
    // Approximate next full moon (every 29.5 days)
    now.setDate(now.getDate() + 29);
    return now.toISOString().split('T')[0];
  }

  /**
   * Detect category from goal title
   */
  static detectCategory(title) {
    const titleLower = title.toLowerCase();

    if (titleLower.match(/tiền|income|revenue|triệu|tỷ|passive|thu nhập|kiếm|financial/)) {
      return 'FINANCIAL';
    }
    if (titleLower.match(/career|job|work|công việc|nghề nghiệp|promotion/)) {
      return 'CAREER';
    }
    if (titleLower.match(/health|healthy|sức khỏe|weight|fitness|exercise/)) {
      return 'HEALTH';
    }
    if (titleLower.match(/love|relationship|partner|tình yêu|yêu|marriage|dating/)) {
      return 'RELATIONSHIP';
    }

    return 'LIFESTYLE';
  }

  /**
   * Count total tasks in action plan
   */
  static countTasks(actionSteps) {
    return actionSteps.reduce((total, week) => {
      return total + (week.tasks ? week.tasks.length : 0);
    }, 0);
  }

  /**
   * Create Daily Reminders for goal
   */
  static async createReminders(userId, goalId, data) {
    const reminders = [
      {
        notification_type: 'AFFIRMATION',
        scheduled_time: '08:00:00',
        title: '🌅 Affirmations Buổi Sáng',
        message: 'Thời gian đọc affirmations cho ngày mới!',
        action_url: `/dashboard?goal=${goalId}`
      },
      {
        notification_type: 'CHECK_IN',
        scheduled_time: '12:00:00',
        title: '☕ Check-in Giữa Ngày',
        message: 'Bạn có thực hiện aligned action hôm nay chưa?',
        action_url: `/dashboard?goal=${goalId}`
      },
      {
        notification_type: 'VISUALIZATION',
        scheduled_time: '21:00:00',
        title: '🌙 Visualization Buổi Tối',
        message: 'Dành 10 phút visualize mục tiêu của bạn',
        action_url: `/dashboard?goal=${goalId}`
      }
    ];

    for (const reminder of reminders) {
      await supabase.from('scheduled_notifications').insert({
        user_id: userId,
        source_type: 'MANIFESTATION_GOAL',
        source_id: goalId,
        ...reminder,
        next_send_at: this.calculateNextSend(reminder.scheduled_time)
      });
    }
  }

  /**
   * Calculate next send time for notification
   */
  static calculateNextSend(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':');

    const next = new Date(now);
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If time already passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toISOString();
  }

  /**
   * Check if user has reached widget limit
   */
  static async checkWidgetLimit(userId, userTier) {
    const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

    // Unlimited for TIER3
    if (limits.maxWidgets === -1) return { canCreate: true, limit: -1, current: 0 };

    const { count, error } = await supabase
      .from('dashboard_widgets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_visible', true);

    if (error) {
      console.error('Error checking widget limit:', error);
      return { canCreate: false, error: error.message };
    }

    return {
      canCreate: count < limits.maxWidgets,
      limit: limits.maxWidgets,
      current: count
    };
  }

  /**
   * Check if user has reached goal limit
   */
  static async checkGoalLimit(userId, userTier) {
    const limits = WIDGET_LIMITS[userTier] || WIDGET_LIMITS.FREE;

    // Unlimited for TIER3
    if (limits.maxGoals === -1) return { canCreate: true, limit: -1, current: 0 };

    const { count, error } = await supabase
      .from('manifestation_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'ACTIVE');

    if (error) {
      console.error('Error checking goal limit:', error);
      return { canCreate: false, error: error.message };
    }

    return {
      canCreate: count < limits.maxGoals,
      limit: limits.maxGoals,
      current: count
    };
  }
}

// Export widget limits
export const WIDGET_LIMITS = {
  FREE: {
    maxWidgets: 3,
    maxGoals: 1,
    canCustomize: false,
    hasReminders: false
  },
  TIER1: {
    maxWidgets: 10,
    maxGoals: 3,
    canCustomize: true,
    hasReminders: true
  },
  TIER2: {
    maxWidgets: 25,
    maxGoals: 10,
    canCustomize: true,
    hasReminders: true
  },
  TIER3: {
    maxWidgets: -1, // Unlimited
    maxGoals: -1,
    canCustomize: true,
    hasReminders: true,
    advancedFeatures: true
  }
};
