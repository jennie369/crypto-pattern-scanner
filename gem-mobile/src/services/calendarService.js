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
   * Get all calendar data for a specific date (unified view)
   * Used by CalendarContext.getDayData()
   * @param {string} userId - User ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getDayCalendarData(userId, date) {
    try {
      console.log('[Calendar] getDayCalendarData:', { userId, date });

      // Fetch all data in parallel
      const [journalResult, dailyJournal, moodResult] = await Promise.all([
        // Get daily journal (rituals, readings, paper trades, etc.)
        this.getDailyJournal(userId, date),

        // Get calendar events for this date
        this.getDateEvents(userId, date),

        // Get mood data
        supabase
          .from('calendar_daily_mood')
          .select('*')
          .eq('user_id', userId)
          .eq('mood_date', date)
          .maybeSingle()
          .then(result => {
            console.log('[Calendar] Mood fetch result for date', date, ':', result.data ? 'found' : 'not found', result.data);
            return result;
          }),
      ]);

      // Get journal entries (from calendar_journal_entries table)
      const { data: journalEntries, error: journalError } = await supabase
        .from('calendar_journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', date)
        .order('created_at', { ascending: true });

      // DEBUG: Log journal entries query result
      console.log('[Calendar] Journal entries query:', {
        date,
        userId: userId?.substring(0, 8) + '...',
        entriesFound: journalEntries?.length || 0,
        error: journalError?.message || null,
        sampleEntry: journalEntries?.[0] ? {
          id: journalEntries[0].id,
          title: journalEntries[0].title,
          entry_date: journalEntries[0].entry_date,
        } : null,
      });

      if (journalError && journalError.code !== '42P01') {
        console.warn('[Calendar] Journal entries fetch error:', journalError);
      }

      // Get trading journal entries
      const { data: tradingEntries, error: tradingError } = await supabase
        .from('trading_journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('trade_date', date)
        .order('created_at', { ascending: true });

      if (tradingError && tradingError.code !== '42P01') {
        console.warn('[Calendar] Trading entries fetch error:', tradingError);
      }

      return {
        success: true,
        date,
        // Events from calendar_events table
        events: dailyJournal.events || [],
        // Journal entries from calendar_journal_entries
        journal: journalEntries || [],
        // Trading entries from trading_journal_entries
        trading: tradingEntries || [],
        // Mood data
        mood: moodResult.data || null,
        // Legacy: rituals, readings, paper trades from getDailyJournal
        rituals: journalResult.rituals || [],
        readings: journalResult.readings || [],
        paperTrades: journalResult.paperTrades || [],
        tradingJournal: journalResult.tradingJournal || [],
        // Summary
        totalActivities: (journalEntries?.length || 0) +
          (tradingEntries?.length || 0) +
          (journalResult.totalActivities || 0),
      };
    } catch (error) {
      console.error('[Calendar] getDayCalendarData error:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        journal: [],
        trading: [],
        mood: null,
        rituals: [],
        readings: [],
        paperTrades: [],
      };
    }
  }

  /**
   * Get calendar month markers for the heatmap
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>}
   */
  async getCalendarMonthMarkers(userId, year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      // Fetch all relevant data for the month in parallel
      const [journalResult, tradingResult, moodResult, eventsResult] = await Promise.all([
        // Journal entries
        supabase
          .from('calendar_journal_entries')
          .select('entry_date')
          .eq('user_id', userId)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate),

        // Trading entries
        supabase
          .from('trading_journal_entries')
          .select('trade_date, result')
          .eq('user_id', userId)
          .gte('trade_date', startDate)
          .lte('trade_date', endDate),

        // Mood data
        supabase
          .from('calendar_daily_mood')
          .select('mood_date, overall_mood_score')
          .eq('user_id', userId)
          .gte('mood_date', startDate)
          .lte('mood_date', endDate),

        // Calendar events
        this.getMonthEvents(userId, year, month),
      ]);

      // Build markers object: { 'YYYY-MM-DD': { hasJournal, hasTrade, hasMood, hasEvent, moodScore, tradeResult } }
      const markers = {};

      // Process journal entries
      (journalResult.data || []).forEach(entry => {
        const date = entry.entry_date;
        if (!markers[date]) markers[date] = {};
        markers[date].hasJournal = true;
        markers[date].journalCount = (markers[date].journalCount || 0) + 1;
      });

      // Process trading entries
      (tradingResult.data || []).forEach(entry => {
        const date = entry.trade_date;
        if (!markers[date]) markers[date] = {};
        markers[date].hasTrade = true;
        markers[date].tradeCount = (markers[date].tradeCount || 0) + 1;
        if (entry.result === 'win') {
          markers[date].tradeWins = (markers[date].tradeWins || 0) + 1;
        } else if (entry.result === 'loss') {
          markers[date].tradeLosses = (markers[date].tradeLosses || 0) + 1;
        }
      });

      // Process mood data
      (moodResult.data || []).forEach(entry => {
        const date = entry.mood_date;
        if (!markers[date]) markers[date] = {};
        markers[date].hasMood = true;
        markers[date].moodScore = entry.overall_mood_score;
      });

      // Process events
      (eventsResult.events || []).forEach(event => {
        const date = event.event_date;
        if (!markers[date]) markers[date] = {};
        markers[date].hasEvent = true;
        markers[date].eventCount = (markers[date].eventCount || 0) + 1;
      });

      return {
        success: true,
        markers,
        year,
        month,
      };
    } catch (error) {
      console.error('[Calendar] getCalendarMonthMarkers error:', error);
      return { success: false, markers: {}, error: error.message };
    }
  }

  /**
   * Get events by date range (alias for getEvents for consistency)
   * @param {string} userId - User ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>}
   */
  async getEventsByDateRange(userId, startDate, endDate) {
    const result = await this.getEvents(userId, startDate, endDate);
    return result.events || [];
  }

  /**
   * Get activities by date range for heatmap
   * @param {string} userId - User ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getActivitiesByDateRange(userId, startDate, endDate) {
    try {
      // Fetch all activities in parallel
      const [journalResult, tradingResult, ritualsResult, readingsResult] = await Promise.all([
        // Journal entries
        supabase
          .from('calendar_journal_entries')
          .select('entry_date')
          .eq('user_id', userId)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate),

        // Trading entries
        supabase
          .from('trading_journal_entries')
          .select('trade_date')
          .eq('user_id', userId)
          .gte('trade_date', startDate)
          .lte('trade_date', endDate),

        // Ritual completions
        supabase
          .from('vision_ritual_completions')
          .select('completed_at')
          .eq('user_id', userId)
          .gte('completed_at', `${startDate}T00:00:00`)
          .lte('completed_at', `${endDate}T23:59:59`),

        // Readings
        supabase
          .from('divination_readings')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`),
      ]);

      // Aggregate by date
      const activityByDate = {};

      // Journal entries
      (journalResult.data || []).forEach(entry => {
        const date = entry.entry_date;
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      });

      // Trading entries
      (tradingResult.data || []).forEach(entry => {
        const date = entry.trade_date;
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      });

      // Ritual completions
      (ritualsResult.data || []).forEach(entry => {
        const date = entry.completed_at?.split('T')[0];
        if (date) {
          activityByDate[date] = (activityByDate[date] || 0) + 1;
        }
      });

      // Readings
      (readingsResult.data || []).forEach(entry => {
        const date = entry.created_at?.split('T')[0];
        if (date) {
          activityByDate[date] = (activityByDate[date] || 0) + 1;
        }
      });

      // Convert to array format
      return Object.entries(activityByDate).map(([date, count]) => ({
        activity_date: date,
        activity_count: count,
      }));
    } catch (error) {
      console.error('[Calendar] getActivitiesByDateRange error:', error);
      return [];
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
