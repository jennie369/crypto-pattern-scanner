/**
 * Vision Board Service
 * CRUD operations for widgets, goals, actions, affirmations, habits
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import { supabase } from './supabase';

// Life areas for categorization
export const LIFE_AREAS = {
  finance: { label: 'Tài chính', icon: 'wallet', color: '#FFBD59' },
  career: { label: 'Sự nghiệp', icon: 'briefcase', color: '#6A5BFF' },
  health: { label: 'Sức khỏe', icon: 'heart', color: '#3AF7A6' },
  relationships: { label: 'Quan hệ', icon: 'users', color: '#FF6B9D' },
  personal: { label: 'Cá nhân', icon: 'user', color: '#00F0FF' },
  spiritual: { label: 'Tâm linh', icon: 'sparkles', color: '#9C0612' },
};

// Widget types
export const WIDGET_TYPES = {
  GOAL: 'goal',
  ACTION: 'action',
  AFFIRMATION: 'affirmation',
  HABIT: 'habit',
};

class VisionBoardService {
  /**
   * Get all widgets for user
   * @param {string} userId - User ID
   * @param {string} widgetType - Optional filter by type
   * @returns {Promise<Object>}
   */
  async getWidgets(userId, widgetType = null) {
    try {
      let query = supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (widgetType) {
        query = query.eq('widget_type', widgetType);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('[VisionBoard] vision_board_widgets table not ready');
          return { success: true, widgets: [] };
        }
        throw error;
      }

      return { success: true, widgets: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get widgets error:', error);
      return { success: false, widgets: [], error: error.message };
    }
  }

  /**
   * Get goals with progress calculation
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getGoalsWithProgress(userId) {
    try {
      const { data, error } = await supabase.rpc('get_goals_with_progress', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          console.log('[VisionBoard] get_goals_with_progress not ready');
          // Fallback to direct query
          return this.getWidgets(userId, WIDGET_TYPES.GOAL);
        }
        throw error;
      }

      return { success: true, goals: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get goals error:', error);
      return { success: false, goals: [], error: error.message };
    }
  }

  /**
   * Get today's tasks (actions due today)
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getTodayTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('widget_type', 'action')
        .eq('is_completed', false)
        .or(`content->due_date.eq.${today},content->due_date.is.null`)
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        if (error.code === '42P01') {
          return { success: true, tasks: [] };
        }
        throw error;
      }

      return { success: true, tasks: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get today tasks error:', error);
      return { success: false, tasks: [], error: error.message };
    }
  }

  /**
   * Get today's affirmations
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getTodayAffirmations(userId) {
    try {
      const { data, error } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('widget_type', 'affirmation')
        .eq('is_completed', false)
        .order('created_at', { ascending: true })
        .limit(5);

      if (error) {
        if (error.code === '42P01') {
          return { success: true, affirmations: [] };
        }
        throw error;
      }

      return { success: true, affirmations: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get affirmations error:', error);
      return { success: false, affirmations: [], error: error.message };
    }
  }

  /**
   * Create a new widget
   * @param {string} userId - User ID
   * @param {string} widgetType - Widget type
   * @param {Object} content - Widget content
   * @returns {Promise<Object>}
   */
  async createWidget(userId, widgetType, content) {
    try {
      const { data, error } = await supabase
        .from('vision_board_widgets')
        .insert({
          user_id: userId,
          widget_type: widgetType,
          content,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Sync to calendar if applicable
      if (content?.deadline || content?.due_date) {
        await this.syncToCalendar(userId, data);
      }

      return { success: true, widget: data };
    } catch (error) {
      console.error('[VisionBoard] Create widget error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a widget
   * @param {string} widgetId - Widget ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async updateWidget(widgetId, updates) {
    try {
      const { data, error } = await supabase
        .from('vision_board_widgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, widget: data };
    } catch (error) {
      console.error('[VisionBoard] Update widget error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete a widget with XP reward
   * @param {string} widgetId - Widget ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async completeWidget(widgetId, userId) {
    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc('complete_widget_with_xp', {
        p_widget_id: widgetId,
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          // Fallback to simple update
          const { data: widget, error: updateError } = await supabase
            .from('vision_board_widgets')
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq('id', widgetId)
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) throw updateError;

          return {
            success: true,
            widget,
            xp_awarded: null,
            achievements_unlocked: [],
          };
        }
        throw error;
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('[VisionBoard] Complete widget error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a widget
   * @param {string} widgetId - Widget ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteWidget(widgetId, userId) {
    try {
      // First get widget to check for calendar sync
      const { data: widget } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('id', widgetId)
        .eq('user_id', userId)
        .single();

      // Delete widget
      const { error } = await supabase
        .from('vision_board_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', userId);

      if (error) throw error;

      // Delete calendar events linked to this widget
      if (widget) {
        await this.deleteCalendarEventsBySource(userId, widget.widget_type, widgetId);
      }

      return { success: true };
    } catch (error) {
      console.error('[VisionBoard] Delete widget error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get goal scenarios (pre-built templates)
   * @param {string} lifeArea - Optional filter by life area
   * @returns {Promise<Object>}
   */
  async getGoalScenarios(lifeArea = null) {
    try {
      let query = supabase
        .from('goal_scenarios')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (lifeArea) {
        query = query.eq('life_area', lifeArea);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') {
          return { success: true, scenarios: [] };
        }
        throw error;
      }

      return { success: true, scenarios: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get scenarios error:', error);
      return { success: false, scenarios: [], error: error.message };
    }
  }

  /**
   * Create goal from scenario
   * @param {string} userId - User ID
   * @param {Object} scenario - Scenario data
   * @param {Object} customData - User customizations
   * @returns {Promise<Object>}
   */
  async createGoalFromScenario(userId, scenario, customData = {}) {
    try {
      const content = {
        title: customData.title || scenario.title,
        description: customData.description || scenario.description,
        life_area: scenario.life_area,
        deadline: customData.deadline,
        progress: 0,
        milestones: scenario.milestones || [],
        suggested_actions: scenario.suggested_actions || [],
        suggested_affirmations: scenario.suggested_affirmations || [],
        icon: scenario.icon,
        color: scenario.color,
      };

      // Create goal
      const goalResult = await this.createWidget(userId, WIDGET_TYPES.GOAL, content);

      if (!goalResult.success) {
        return goalResult;
      }

      // Optionally create actions from suggestions
      if (customData.createActions && scenario.suggested_actions?.length > 0) {
        for (const action of scenario.suggested_actions) {
          await this.createWidget(userId, WIDGET_TYPES.ACTION, {
            title: action.title,
            description: action.description,
            goal_id: goalResult.widget.id,
            life_area: scenario.life_area,
            xp_reward: 20,
          });
        }
      }

      // Optionally create affirmations from suggestions
      if (customData.createAffirmations && scenario.suggested_affirmations?.length > 0) {
        for (const affirmation of scenario.suggested_affirmations) {
          await this.createWidget(userId, WIDGET_TYPES.AFFIRMATION, {
            text: affirmation,
            goal_id: goalResult.widget.id,
            life_area: scenario.life_area,
          });
        }
      }

      return { success: true, goal: goalResult.widget };
    } catch (error) {
      console.error('[VisionBoard] Create from scenario error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get life area scores for radar chart
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getLifeAreaScores(userId) {
    try {
      const { data, error } = await supabase.rpc('get_life_area_scores', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          // Fallback: calculate from widgets
          const { widgets } = await this.getWidgets(userId);
          return this.calculateLifeAreaScores(widgets);
        }
        throw error;
      }

      return { success: true, scores: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get life area scores error:', error);
      return { success: false, scores: [], error: error.message };
    }
  }

  /**
   * Calculate life area scores from widgets (fallback)
   * @param {Array} widgets - All user widgets
   * @returns {Object}
   */
  calculateLifeAreaScores(widgets) {
    const scores = {};

    Object.keys(LIFE_AREAS).forEach(area => {
      scores[area] = {
        life_area: area,
        score: 0,
        total_widgets: 0,
        completed_widgets: 0,
        active_goals: 0,
        completed_goals: 0,
      };
    });

    widgets.forEach(w => {
      const area = w.content?.life_area || 'personal';
      if (scores[area]) {
        scores[area].total_widgets += 1;
        if (w.is_completed) {
          scores[area].completed_widgets += 1;
        }
        if (w.widget_type === 'goal') {
          if (w.is_completed) {
            scores[area].completed_goals += 1;
          } else {
            scores[area].active_goals += 1;
          }
        }
      }
    });

    // Calculate scores
    Object.keys(scores).forEach(area => {
      const s = scores[area];
      if (s.total_widgets > 0) {
        s.score = Math.round((s.completed_widgets / s.total_widgets) * 100);
      }
    });

    return { success: true, scores: Object.values(scores) };
  }

  /**
   * Get weekly progress for bar chart
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getWeeklyProgress(userId) {
    try {
      const { data, error } = await supabase.rpc('get_weekly_progress', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, progress: [] };
        }
        throw error;
      }

      return { success: true, progress: data || [] };
    } catch (error) {
      console.error('[VisionBoard] Get weekly progress error:', error);
      return { success: false, progress: [], error: error.message };
    }
  }

  /**
   * Get today overview (dashboard data)
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getTodayOverview(userId) {
    try {
      const { data, error } = await supabase.rpc('get_vision_today_overview', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          // Fallback to individual queries
          const [tasks, affirmations, goals] = await Promise.all([
            this.getTodayTasks(userId),
            this.getTodayAffirmations(userId),
            this.getGoalsWithProgress(userId),
          ]);

          return {
            success: true,
            overview: {
              today: {
                date: new Date().toISOString().split('T')[0],
                actions_completed: 0,
                affirmations_completed: 0,
                habits_completed: 0,
                combo_count: 0,
                xp_earned: 0,
                daily_score: 0,
              },
              streak: { current: 0, longest: 0 },
              level: { total_xp: 0, current_level: 1, xp_to_next: 100 },
              today_tasks: tasks.tasks || [],
              affirmations: affirmations.affirmations || [],
            },
          };
        }
        throw error;
      }

      return { success: true, overview: data };
    } catch (error) {
      console.error('[VisionBoard] Get today overview error:', error);
      return { success: false, overview: null, error: error.message };
    }
  }

  /**
   * Get stats overview
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getStatsOverview(userId) {
    try {
      const { data, error } = await supabase.rpc('get_stats_overview', {
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          return { success: true, stats: null };
        }
        throw error;
      }

      return { success: true, stats: data };
    } catch (error) {
      console.error('[VisionBoard] Get stats error:', error);
      return { success: false, stats: null, error: error.message };
    }
  }

  /**
   * Sync widget to calendar
   * @param {string} userId - User ID
   * @param {Object} widget - Widget data
   * @returns {Promise<Object>}
   */
  async syncToCalendar(userId, widget) {
    try {
      const eventDate = widget.content?.deadline || widget.content?.due_date;
      if (!eventDate) return { success: true };

      const sourceType = widget.widget_type === 'goal' ? 'goal_deadline' : 'action_due';

      const { data, error } = await supabase.rpc('sync_calendar_event', {
        p_user_id: userId,
        p_source_type: sourceType,
        p_source_id: widget.id,
        p_title: widget.content?.title || 'Untitled',
        p_event_date: eventDate,
        p_description: widget.content?.description,
        p_life_area: widget.content?.life_area,
        p_icon: widget.content?.icon || 'calendar',
        p_color: widget.content?.color || '#FFBD59',
      });

      if (error) {
        if (error.code === '42883') {
          console.log('[VisionBoard] sync_calendar_event not ready');
          return { success: true };
        }
        throw error;
      }

      return { success: true, eventId: data };
    } catch (error) {
      console.error('[VisionBoard] Sync to calendar error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete calendar events by source
   * @param {string} userId - User ID
   * @param {string} sourceType - Source type
   * @param {string} sourceId - Source widget ID
   * @returns {Promise<Object>}
   */
  async deleteCalendarEventsBySource(userId, sourceType, sourceId) {
    try {
      const { data, error } = await supabase.rpc('delete_calendar_events_by_source', {
        p_user_id: userId,
        p_source_type: sourceType === 'goal' ? 'goal_deadline' : 'action_due',
        p_source_id: sourceId,
      });

      if (error) {
        if (error.code === '42883') {
          return { success: true };
        }
        throw error;
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      console.error('[VisionBoard] Delete calendar events error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new VisionBoardService();
