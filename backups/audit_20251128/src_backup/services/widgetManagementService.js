/**
 * GEM Mobile - Widget Management Service
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * CRUD operations for user widgets in Supabase.
 *
 * Tables:
 * - user_widgets: Widget data
 * - widget_progress: Progress tracking
 * - widget_interactions: User interactions
 */

import { supabase } from './supabase';

class WidgetManagementService {
  /**
   * Get user's widgets
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserWidgets(userId) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[WidgetManagement] Error fetching widgets:', error);
      return [];
    }
  }

  /**
   * Get single widget
   * @param {string} widgetId
   * @returns {Promise<Object|null>}
   */
  async getWidget(widgetId) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('id', widgetId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[WidgetManagement] Error fetching widget:', error);
      return null;
    }
  }

  /**
   * Create widget
   * @param {Object} widget
   * @returns {Promise<Object>}
   */
  async createWidget(widget) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert({
          ...widget,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[WidgetManagement] Created widget:', data.id);
      return data;
    } catch (error) {
      console.error('[WidgetManagement] Error creating widget:', error);
      throw error;
    }
  }

  /**
   * Create multiple widgets
   * @param {Array} widgets
   * @returns {Promise<Array>}
   */
  async createWidgets(widgets) {
    try {
      const widgetsWithTimestamps = widgets.map(w => ({
        ...w,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('user_widgets')
        .insert(widgetsWithTimestamps)
        .select();

      if (error) throw error;

      console.log('[WidgetManagement] Created', data.length, 'widgets');
      return data;
    } catch (error) {
      console.error('[WidgetManagement] Error creating widgets:', error);
      throw error;
    }
  }

  /**
   * Update widget
   * @param {string} widgetId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateWidget(widgetId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId)
        .select()
        .single();

      if (error) throw error;

      console.log('[WidgetManagement] Updated widget:', widgetId);
      return data;
    } catch (error) {
      console.error('[WidgetManagement] Error updating widget:', error);
      throw error;
    }
  }

  /**
   * Delete widget (soft delete)
   * @param {string} widgetId
   * @returns {Promise<boolean>}
   */
  async deleteWidget(widgetId) {
    try {
      const { error } = await supabase
        .from('user_widgets')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId);

      if (error) throw error;

      console.log('[WidgetManagement] Deleted widget:', widgetId);
      return true;
    } catch (error) {
      console.error('[WidgetManagement] Error deleting widget:', error);
      throw error;
    }
  }

  /**
   * Hard delete widget (permanent)
   * @param {string} widgetId
   * @returns {Promise<boolean>}
   */
  async hardDeleteWidget(widgetId) {
    try {
      const { error } = await supabase
        .from('user_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      console.log('[WidgetManagement] Hard deleted widget:', widgetId);
      return true;
    } catch (error) {
      console.error('[WidgetManagement] Error hard deleting widget:', error);
      throw error;
    }
  }

  /**
   * Update widget position
   * @param {string} widgetId
   * @param {number} newPosition
   * @returns {Promise<Object>}
   */
  async updateWidgetPosition(widgetId, newPosition) {
    return this.updateWidget(widgetId, { position: newPosition });
  }

  /**
   * Reorder widgets (batch update positions)
   * @param {Array} widgetPositions - Array of { id, position }
   * @returns {Promise<boolean>}
   */
  async reorderWidgets(widgetPositions) {
    try {
      const updates = widgetPositions.map(({ id, position }) =>
        supabase
          .from('user_widgets')
          .update({ position, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      await Promise.all(updates);

      console.log('[WidgetManagement] Reordered', widgetPositions.length, 'widgets');
      return true;
    } catch (error) {
      console.error('[WidgetManagement] Error reordering widgets:', error);
      throw error;
    }
  }

  /**
   * Track widget interaction
   * @param {string} widgetId
   * @param {string} userId
   * @param {string} interactionType - e.g., 'VIEW', 'UPDATE_PROGRESS', 'COMPLETE_TASK'
   * @param {Object} interactionData - Additional data
   * @returns {Promise<void>}
   */
  async trackInteraction(widgetId, userId, interactionType, interactionData = {}) {
    try {
      const { error } = await supabase
        .from('widget_interactions')
        .insert({
          widget_id: widgetId,
          user_id: userId,
          interaction_type: interactionType,
          interaction_data: interactionData,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      console.log('[WidgetManagement] Tracked interaction:', interactionType);
    } catch (error) {
      console.error('[WidgetManagement] Error tracking interaction:', error);
      // Don't throw - tracking failures shouldn't break the app
    }
  }

  /**
   * Update goal progress
   * @param {string} widgetId
   * @param {number} currentAmount
   * @returns {Promise<Object>}
   */
  async updateGoalProgress(widgetId, currentAmount) {
    const widget = await this.getWidget(widgetId);

    if (!widget || widget.type !== 'GOAL_CARD') {
      throw new Error('Invalid widget for progress update');
    }

    const targetAmount = widget.data.targetAmount;
    const percentage = (currentAmount / targetAmount) * 100;

    // Check for milestones
    const milestones = [10, 25, 50, 75, 90, 100];
    const previousPercentage = (widget.data.currentAmount / targetAmount) * 100;

    const newMilestone = milestones.find(m =>
      percentage >= m && previousPercentage < m
    );

    // Update widget
    await this.updateWidget(widgetId, {
      data: {
        ...widget.data,
        currentAmount,
      },
    });

    // Track progress in widget_progress table
    try {
      await supabase.from('widget_progress').insert({
        widget_id: widgetId,
        progress_date: new Date().toISOString().split('T')[0],
        current_value: currentAmount,
        target_value: targetAmount,
        percentage: percentage,
        milestones_hit: newMilestone ? [newMilestone] : [],
      });
    } catch (error) {
      console.error('[WidgetManagement] Error recording progress:', error);
    }

    return {
      newMilestone,
      percentage,
      currentAmount,
      targetAmount,
    };
  }

  /**
   * Complete affirmation
   * @param {string} widgetId
   * @param {number} affirmationIndex
   * @returns {Promise<Object>}
   */
  async completeAffirmation(widgetId, affirmationIndex) {
    const widget = await this.getWidget(widgetId);

    if (!widget || widget.type !== 'AFFIRMATION_CARD') {
      throw new Error('Invalid widget for affirmation completion');
    }

    const today = new Date().toISOString().split('T')[0];
    const lastDate = widget.data.lastCompletedDate;

    // Calculate new streak
    let newStreak = widget.data.streak || 0;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If same day, don't change streak
    } else {
      newStreak = 1;
    }

    const newCompletedToday = (widget.data.completedToday || 0) + 1;
    const nextIndex = (affirmationIndex + 1) % widget.data.affirmations.length;

    await this.updateWidget(widgetId, {
      data: {
        ...widget.data,
        completedToday: newCompletedToday,
        currentIndex: nextIndex,
        streak: newStreak,
        lastCompletedDate: today,
      },
    });

    // Track interaction
    await this.trackInteraction(
      widgetId,
      widget.user_id,
      'AFFIRMATION_COMPLETED',
      { affirmationIndex, streak: newStreak }
    );

    return {
      completedToday: newCompletedToday,
      streak: newStreak,
      nextIndex,
    };
  }

  /**
   * Toggle task completion
   * @param {string} widgetId
   * @param {string} taskId
   * @returns {Promise<Object>}
   */
  async toggleTask(widgetId, taskId) {
    const widget = await this.getWidget(widgetId);

    if (!widget || widget.type !== 'ACTION_CHECKLIST') {
      throw new Error('Invalid widget for task toggle');
    }

    const tasks = widget.data.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const completedCount = tasks.filter(t => t.completed).length;
    const allCompleted = completedCount === tasks.length;

    await this.updateWidget(widgetId, {
      data: {
        ...widget.data,
        tasks,
      },
    });

    // Track interaction
    await this.trackInteraction(
      widgetId,
      widget.user_id,
      'TASK_TOGGLED',
      { taskId, completed: tasks.find(t => t.id === taskId)?.completed }
    );

    return {
      completedCount,
      totalCount: tasks.length,
      allCompleted,
    };
  }

  /**
   * Get widget statistics for user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getWidgetStats(userId) {
    try {
      const widgets = await this.getUserWidgets(userId);

      const activeGoals = widgets.filter(w => w.type === 'GOAL_CARD').length;

      // Get affirmation streak (from most recent affirmation widget)
      const affirmationWidget = widgets.find(w => w.type === 'AFFIRMATION_CARD');
      const streak = affirmationWidget?.data.streak || 0;

      // Count completed affirmations (from interactions)
      const { count: affirmationsCount } = await supabase
        .from('widget_interactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('interaction_type', 'AFFIRMATION_COMPLETED');

      return {
        activeGoals,
        streak,
        affirmationsCompleted: affirmationsCount || 0,
        totalWidgets: widgets.length,
      };
    } catch (error) {
      console.error('[WidgetManagement] Error getting stats:', error);
      return {
        activeGoals: 0,
        streak: 0,
        affirmationsCompleted: 0,
        totalWidgets: 0,
      };
    }
  }

  /**
   * Reset daily counters (call at midnight)
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async resetDailyCounters(userId) {
    try {
      const widgets = await this.getUserWidgets(userId);

      const affirmationWidgets = widgets.filter(w => w.type === 'AFFIRMATION_CARD');

      for (const widget of affirmationWidgets) {
        await this.updateWidget(widget.id, {
          data: {
            ...widget.data,
            completedToday: 0,
          },
        });
      }

      console.log('[WidgetManagement] Reset daily counters for user:', userId);
    } catch (error) {
      console.error('[WidgetManagement] Error resetting counters:', error);
    }
  }
}

export default new WidgetManagementService();
