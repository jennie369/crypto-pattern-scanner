/**
 * Calendar Service
 * CRUD operations for calendar events
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import { supabase } from './supabase';

// Event source types
export const EVENT_SOURCE_TYPES = {
  GOAL_DEADLINE: 'goal_deadline',
  ACTION_DUE: 'action_due',
  HABIT_DAILY: 'habit_daily',
  DIVINATION: 'divination',
  MANUAL: 'manual',
};

// Default colors per source type
export const SOURCE_TYPE_COLORS = {
  goal_deadline: '#6A5BFF', // Purple
  action_due: '#FFBD59', // Gold
  habit_daily: '#3AF7A6', // Green
  divination: '#9C0612', // Burgundy
  manual: '#00F0FF', // Cyan
};

// Default icons per source type
export const SOURCE_TYPE_ICONS = {
  goal_deadline: 'target',
  action_due: 'check-circle',
  habit_daily: 'repeat',
  divination: 'sparkles',
  manual: 'calendar',
};

class CalendarService {
  /**
   * Get calendar events for a date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getEvents(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase.rpc('get_calendar_events', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        if (error.code === '42883' || error.message?.includes('does not exist')) {
          // Fallback to direct query
          return this.getEventsDirectQuery(userId, startDate, endDate);
        }
        throw error;
      }

      return { success: true, events: data || [] };
    } catch (error) {
      console.error('[Calendar] Get events error:', error);
      return { success: false, events: [], error: error.message };
    }
  }

  /**
   * Direct query fallback for getting events
   * @param {string} userId - User ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>}
   */
  async getEventsDirectQuery(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          return { success: true, events: [] };
        }
        throw error;
      }

      return { success: true, events: data || [] };
    } catch (error) {
      console.error('[Calendar] Direct query error:', error);
      return { success: false, events: [], error: error.message };
    }
  }

  /**
   * Get events for a specific month
   * @param {string} userId - User ID
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>}
   */
  async getMonthEvents(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    return this.getEvents(userId, startDate, endDate);
  }

  /**
   * Get calendar events for a month (accepts Date object)
   * This is the method CalendarScreen expects
   * @param {string} userId - User ID
   * @param {Date} monthDate - Date object representing the month
   * @returns {Promise<Array>} - Array of events
   */
  async getCalendarEvents(userId, monthDate) {
    try {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1; // getMonth() returns 0-11
      const result = await this.getMonthEvents(userId, year, month);
      return result.events || [];
    } catch (error) {
      console.error('[Calendar] getCalendarEvents error:', error);
      return [];
    }
  }

  /**
   * Get events for today
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getTodayEvents(userId) {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents(userId, today, today);
  }

  /**
   * Get events for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getDateEvents(userId, date) {
    return this.getEvents(userId, date, date);
  }

  /**
   * Create a manual event
   * Handles table not existing gracefully
   * @param {string} userId - User ID
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>}
   */
  async createEvent(userId, eventData) {
    try {
      console.log('[Calendar] Creating event:', eventData.title);

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          title: eventData.title,
          description: eventData.description,
          source_type: eventData.sourceType || EVENT_SOURCE_TYPES.MANUAL,
          source_id: eventData.sourceId || null,
          event_date: eventData.date,
          start_time: eventData.startTime || null,
          end_time: eventData.endTime || null,
          is_all_day: eventData.isAllDay !== false,
          is_recurring: eventData.isRecurring || false,
          recurrence_rule: eventData.recurrenceRule || null,
          color: eventData.color || SOURCE_TYPE_COLORS[eventData.sourceType] || '#FFBD59',
          icon: eventData.icon || SOURCE_TYPE_ICONS[eventData.sourceType] || 'calendar',
          life_area: eventData.lifeArea || null,
          priority: eventData.priority || 1,
          reminder_minutes: eventData.reminderMinutes || null,
          metadata: eventData.metadata || {},
        })
        .select()
        .single();

      if (error) {
        // Handle table not existing (42P01) or other expected errors gracefully
        if (error.code === '42P01') {
          console.warn('[Calendar] Table calendar_events does not exist yet');
          return { success: false, error: 'Table not ready', code: error.code };
        }
        // Handle RLS policy errors
        if (error.code === '42501' || error.message?.includes('policy')) {
          console.warn('[Calendar] RLS policy blocked insert:', error.message);
          return { success: false, error: 'Permission denied', code: error.code };
        }
        throw error;
      }

      console.log('[Calendar] Event created successfully:', data?.id);
      return { success: true, event: data };
    } catch (error) {
      console.error('[Calendar] Create event error:', error?.message || error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async updateEvent(eventId, userId, updates) {
    try {
      const updateData = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date !== undefined) updateData.event_date = updates.date;
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
      if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.isCompleted !== undefined) {
        updateData.is_completed = updates.isCompleted;
        if (updates.isCompleted) {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, event: data };
    } catch (error) {
      console.error('[Calendar] Update event error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete a calendar event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async completeEvent(eventId, userId) {
    try {
      const { data, error } = await supabase.rpc('complete_calendar_event', {
        p_event_id: eventId,
        p_user_id: userId,
      });

      if (error) {
        if (error.code === '42883') {
          // Fallback to direct update
          return this.updateEvent(eventId, userId, { isCompleted: true });
        }
        throw error;
      }

      return { success: data };
    } catch (error) {
      console.error('[Calendar] Complete event error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async deleteEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Calendar] Delete event error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync widget to calendar event
   * @param {string} userId - User ID
   * @param {Object} widget - Widget data
   * @returns {Promise<Object>}
   */
  async syncWidgetToCalendar(userId, widget) {
    try {
      const eventDate = widget.content?.deadline || widget.content?.due_date;
      if (!eventDate) {
        return { success: true, message: 'No date to sync' };
      }

      const sourceType = widget.widget_type === 'goal'
        ? EVENT_SOURCE_TYPES.GOAL_DEADLINE
        : widget.widget_type === 'habit'
          ? EVENT_SOURCE_TYPES.HABIT_DAILY
          : EVENT_SOURCE_TYPES.ACTION_DUE;

      const { data, error } = await supabase.rpc('sync_calendar_event', {
        p_user_id: userId,
        p_source_type: sourceType,
        p_source_id: widget.id,
        p_title: widget.content?.title || 'Untitled',
        p_event_date: eventDate,
        p_description: widget.content?.description,
        p_life_area: widget.content?.life_area,
        p_icon: widget.content?.icon || SOURCE_TYPE_ICONS[sourceType],
        p_color: widget.content?.color || SOURCE_TYPE_COLORS[sourceType],
        p_is_recurring: widget.widget_type === 'habit',
        p_recurrence_rule: widget.widget_type === 'habit' ? 'DAILY' : null,
        p_metadata: JSON.stringify({
          widget_type: widget.widget_type,
          xp_reward: widget.content?.xp_reward || 0,
        }),
      });

      if (error) {
        if (error.code === '42883') {
          console.log('[Calendar] sync_calendar_event not ready');
          return { success: true };
        }
        throw error;
      }

      return { success: true, eventId: data };
    } catch (error) {
      console.error('[Calendar] Sync widget error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete events by source widget
   * @param {string} userId - User ID
   * @param {string} sourceType - Source type
   * @param {string} sourceId - Source widget ID
   * @returns {Promise<Object>}
   */
  async deleteEventsBySource(userId, sourceType, sourceId) {
    try {
      const { data, error } = await supabase.rpc('delete_calendar_events_by_source', {
        p_user_id: userId,
        p_source_type: sourceType,
        p_source_id: sourceId,
      });

      if (error) {
        if (error.code === '42883') {
          // Fallback to direct delete
          const { error: deleteError } = await supabase
            .from('calendar_events')
            .delete()
            .eq('user_id', userId)
            .eq('source_type', sourceType)
            .eq('source_id', sourceId);

          if (deleteError && deleteError.code !== '42P01') {
            throw deleteError;
          }
          return { success: true };
        }
        throw error;
      }

      return { success: true, deletedCount: data };
    } catch (error) {
      console.error('[Calendar] Delete by source error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get events grouped by date for month view
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @param {number} month - Month
   * @returns {Promise<Object>}
   */
  async getMonthEventsGrouped(userId, year, month) {
    const result = await this.getMonthEvents(userId, year, month);

    if (!result.success) return result;

    // Group events by date
    const grouped = {};
    (result.events || []).forEach(event => {
      const date = event.event_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return { success: true, eventsByDate: grouped };
  }

  /**
   * Get events grouped by date for a date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getEventsGroupedByRange(userId, startDate, endDate) {
    const result = await this.getEvents(userId, startDate, endDate);

    if (!result.success) return result;

    // Group events by date
    const grouped = {};
    (result.events || []).forEach(event => {
      const date = event.event_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return { success: true, eventsByDate: grouped };
  }

  /**
   * Generate recurring events for display
   * (Does not persist - just for calendar visualization)
   * @param {Object} event - Recurring event
   * @param {string} startDate - Start of range
   * @param {string} endDate - End of range
   * @returns {Array}
   */
  generateRecurringInstances(event, startDate, endDate) {
    if (!event.is_recurring || !event.recurrence_rule) {
      return [event];
    }

    const instances = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const eventStart = new Date(event.event_date);

    // Simple implementation for DAILY recurrence
    if (event.recurrence_rule === 'DAILY') {
      const current = new Date(Math.max(eventStart, start));
      while (current <= end) {
        instances.push({
          ...event,
          event_date: current.toISOString().split('T')[0],
          is_instance: true,
          original_event_id: event.id,
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (event.recurrence_rule === 'WEEKLY') {
      const current = new Date(Math.max(eventStart, start));
      while (current <= end) {
        if (current.getDay() === eventStart.getDay()) {
          instances.push({
            ...event,
            event_date: current.toISOString().split('T')[0],
            is_instance: true,
            original_event_id: event.id,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } else {
      instances.push(event);
    }

    return instances;
  }

  /**
   * Get daily journal data - rituals, readings, trades, and actions for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getDailyJournal(userId, date) {
    try {
      // Fetch all data in parallel for better performance
      const [ritualsResult, readingsResult, paperTradesResult, tradingJournalResult, actionsResult] = await Promise.all([
        // 1. Ritual completions
        // Note: In vision_rituals, 'id' IS the slug (VARCHAR primary key)
        supabase
          .from('vision_ritual_completions')
          .select('*, ritual:vision_rituals(id, name)')
          .eq('user_id', userId)
          .gte('completed_at', `${date}T00:00:00`)
          .lte('completed_at', `${date}T23:59:59.999`)
          .order('completed_at', { ascending: true }),

        // 2. Divination readings
        supabase
          .from('divination_readings')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', `${date}T00:00:00`)
          .lte('created_at', `${date}T23:59:59.999`)
          .order('created_at', { ascending: true }),

        // 3. Paper trades
        supabase
          .from('paper_trades')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', `${date}T00:00:00`)
          .lte('created_at', `${date}T23:59:59.999`)
          .order('created_at', { ascending: true }),

        // 4. Trading journal entries
        supabase
          .from('trading_journal_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('trade_date', date)
          .order('created_at', { ascending: true }),

        // 5. Completed actions for the date
        // Note: Actions are stored in vision_board_widgets.content, not a separate table
        // For now, return empty result - actions are shown via widget content
        Promise.resolve({ data: [], error: null }),
      ]);

      // Handle errors gracefully (tables may not exist)
      // Error codes: 42P01 = relation does not exist, PGRST205 = table not found in schema cache
      const isTableNotFoundError = (err) => err?.code === '42P01' || err?.code === 'PGRST205';

      if (ritualsResult.error && !isTableNotFoundError(ritualsResult.error)) {
        console.warn('[Calendar] Rituals fetch error:', ritualsResult.error);
      }
      if (readingsResult.error && !isTableNotFoundError(readingsResult.error)) {
        console.warn('[Calendar] Readings fetch error:', readingsResult.error);
      }
      if (paperTradesResult.error && !isTableNotFoundError(paperTradesResult.error)) {
        console.warn('[Calendar] Paper trades fetch error:', paperTradesResult.error);
      }
      if (tradingJournalResult.error && !isTableNotFoundError(tradingJournalResult.error)) {
        console.warn('[Calendar] Trading journal fetch error:', tradingJournalResult.error);
      }
      if (actionsResult.error && !isTableNotFoundError(actionsResult.error)) {
        console.warn('[Calendar] Actions fetch error:', actionsResult.error);
      }

      // Map ritual_slug from joined ritual data
      // Note: In vision_rituals, the 'id' field IS the slug (VARCHAR)
      const mappedRituals = (ritualsResult.data || []).map(r => ({
        ...r,
        ritual_slug: r.ritual?.slug || r.ritual?.id || r.ritual_id,
        ritual_name: r.ritual?.name,
      }));

      // Map actions with goal title
      const mappedActions = (actionsResult.data || []).map(a => ({
        ...a,
        goal_title: a.goal?.title,
      }));

      const rituals = mappedRituals || [];
      const readings = readingsResult.data || [];
      const paperTrades = paperTradesResult.data || [];
      const tradingJournal = tradingJournalResult.data || [];
      const actions = mappedActions || [];

      return {
        success: true,
        rituals,
        readings,
        paperTrades,
        tradingJournal,
        actions,
        totalActivities: rituals.length + readings.length + paperTrades.length + tradingJournal.length + actions.length,
      };
    } catch (error) {
      console.error('[Calendar] Get daily journal error:', error);
      return {
        success: false,
        rituals: [],
        readings: [],
        paperTrades: [],
        tradingJournal: [],
        actions: [],
        error: error.message,
      };
    }
  }

  /**
   * Get journal summary for a month (for calendar dots/indicators)
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>}
   */
  async getMonthJournalSummary(userId, year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      // Fetch ritual completions for the month
      const { data: rituals, error: ritualsError } = await supabase
        .from('vision_ritual_completions')
        .select('completed_at, ritual_slug')
        .eq('user_id', userId)
        .gte('completed_at', `${startDate}T00:00:00`)
        .lte('completed_at', `${endDate}T23:59:59`);

      if (ritualsError && ritualsError.code !== '42P01') {
        console.warn('[Calendar] Month rituals fetch error:', ritualsError);
      }

      // Fetch readings for the month
      const { data: readings, error: readingsError } = await supabase
        .from('divination_readings')
        .select('created_at, reading_type')
        .eq('user_id', userId)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      if (readingsError && readingsError.code !== '42P01') {
        console.warn('[Calendar] Month readings fetch error:', readingsError);
      }

      // Group by date
      const journalByDate = {};

      (rituals || []).forEach(r => {
        const date = r.completed_at.split('T')[0];
        if (!journalByDate[date]) {
          journalByDate[date] = { rituals: 0, readings: 0 };
        }
        journalByDate[date].rituals++;
      });

      (readings || []).forEach(r => {
        const date = r.created_at.split('T')[0];
        if (!journalByDate[date]) {
          journalByDate[date] = { rituals: 0, readings: 0 };
        }
        journalByDate[date].readings++;
      });

      return { success: true, journalByDate };
    } catch (error) {
      console.error('[Calendar] Get month journal summary error:', error);
      return { success: false, journalByDate: {}, error: error.message };
    }
  }
}

export default new CalendarService();
