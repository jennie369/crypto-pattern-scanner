/**
 * CalendarContext - Calendar & Stats State Management
 * Split from VisionBoardContext for better performance
 * Created: January 27, 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as statsService from '../services/statsService';
import calendarService from '../services/calendarService';
import * as calendarJournalService from '../services/calendarJournalService';
import * as tradingJournalService from '../services/tradingJournalService';
import * as moodTrackingService from '../services/moodTrackingService';

const CalendarContext = createContext(null);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [stats, setStats] = useState(null);
  const [dailyScore, setDailyScore] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthActivities, setMonthActivities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar Smart Journal state
  const [dayData, setDayData] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [tradingEntries, setTradingEntries] = useState([]);
  const [moodData, setMoodData] = useState(null);
  const [monthMarkers, setMonthMarkers] = useState({});

  // Load stats
  const loadStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fullStats = await statsService.getFullStats(userId);
      setStats(fullStats);
      setDailyScore(fullStats?.dailyScore || 0);
    } catch (err) {
      console.error('[CalendarContext] Load stats error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load calendar events for a date range
  const loadCalendarEvents = useCallback(async (startDate, endDate) => {
    if (!userId) return [];

    try {
      const events = await calendarService.getEventsByDateRange(userId, startDate, endDate);
      setCalendarEvents(events || []);
      return events || [];
    } catch (err) {
      console.error('[CalendarContext] Load events error:', err);
      return [];
    }
  }, [userId]);

  // Load month activities for heatmap
  const loadMonthActivities = useCallback(async (year, month) => {
    if (!userId) return {};

    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const activities = await calendarService.getActivitiesByDateRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Convert to heatmap format: { 'YYYY-MM-DD': count }
      const heatmapData = {};
      (activities || []).forEach(a => {
        const dateKey = a.activity_date || a.date;
        if (dateKey) {
          heatmapData[dateKey] = (heatmapData[dateKey] || 0) + (a.activity_count || 1);
        }
      });

      setMonthActivities(prev => ({
        ...prev,
        [`${year}-${month}`]: heatmapData,
      }));

      return heatmapData;
    } catch (err) {
      console.error('[CalendarContext] Load month activities error:', err);
      return {};
    }
  }, [userId]);

  // Get events for selected date
  const getEventsForDate = useCallback(async (date) => {
    if (!userId) return { rituals: [], readings: [], events: [] };

    try {
      const journal = await calendarService.getDailyJournal(userId, date);
      return journal || { rituals: [], readings: [], events: [] };
    } catch (err) {
      console.error('[CalendarContext] Get events error:', err);
      return { rituals: [], readings: [], events: [] };
    }
  }, [userId]);

  // ============ CALENDAR SMART JOURNAL METHODS ============

  /**
   * Get all calendar data for a specific date (unified view)
   * @param {string} date - Date (YYYY-MM-DD)
   */
  const getDayData = useCallback(async (date) => {
    if (!userId) return null;

    try {
      const result = await calendarService.getDayCalendarData(userId, date);
      if (result.success) {
        setDayData(result);
        setJournalEntries(result.journal || []);
        setTradingEntries(result.trading || []);
        setMoodData(result.mood);
      }
      return result;
    } catch (err) {
      console.error('[CalendarContext] Get day data error:', err);
      return null;
    }
  }, [userId]);

  /**
   * Refresh journal entries for a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   */
  const refreshJournalEntries = useCallback(async (date) => {
    if (!userId) return [];

    try {
      const result = await calendarJournalService.getEntriesForDate(userId, date);
      // Service returns { success, data } not { entries }
      const entries = result?.data || [];
      setJournalEntries(entries);
      return entries;
    } catch (err) {
      console.error('[CalendarContext] Refresh journal entries error:', err);
      return [];
    }
  }, [userId]);

  /**
   * Refresh trading entries for a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   */
  const refreshTradingEntries = useCallback(async (date) => {
    if (!userId) return [];

    try {
      const result = await tradingJournalService.getTradingEntriesForDate(userId, date);
      // Service returns { success, data } not { entries }
      const entries = result?.data || [];
      setTradingEntries(entries);
      return entries;
    } catch (err) {
      console.error('[CalendarContext] Refresh trading entries error:', err);
      return [];
    }
  }, [userId]);

  /**
   * Refresh mood data for a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   */
  const refreshMoodData = useCallback(async (date) => {
    if (!userId) return null;

    try {
      const result = await moodTrackingService.getMoodForDate(userId, date);
      // Service returns { success, data } not { mood }
      setMoodData(result?.data || null);
      return result?.data || null;
    } catch (err) {
      console.error('[CalendarContext] Refresh mood data error:', err);
      return null;
    }
  }, [userId]);

  /**
   * Get calendar month markers for the heatmap
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   */
  const getMonthMarkers = useCallback(async (year, month) => {
    if (!userId) return [];

    try {
      const result = await calendarService.getCalendarMonthMarkers(userId, year, month);
      if (result.success) {
        setMonthMarkers(prev => ({
          ...prev,
          [`${year}-${month}`]: result.markers,
        }));
      }
      return result.markers || [];
    } catch (err) {
      console.error('[CalendarContext] Get month markers error:', err);
      return [];
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh stats (called after actions in other contexts)
  const refreshStats = useCallback(async () => {
    if (!userId) return;

    try {
      const fullStats = await statsService.getFullStats(userId);
      setStats(fullStats);
      setDailyScore(fullStats?.dailyScore || 0);
    } catch (err) {
      console.error('[CalendarContext] Refresh stats error:', err);
    }
  }, [userId]);

  // Computed values
  const userLevel = useMemo(() =>
    stats?.level || { level: 1, title: 'Nguoi Moi Bat Dau', badge: '🌱' },
  [stats]);

  const streaks = useMemo(() => ({
    current: stats?.currentStreak || 0,
    best: stats?.bestStreak || 0,
    rituals: stats?.ritualStreak || 0,
    habits: stats?.habitStreak || 0,
  }), [stats]);

  const totalXP = useMemo(() => stats?.totalXp || 0, [stats]);

  // Context value
  const value = useMemo(() => ({
    // State
    stats,
    dailyScore,
    calendarEvents,
    selectedDate,
    monthActivities,
    isLoading,
    error,

    // Calendar Smart Journal state
    dayData,
    journalEntries,
    tradingEntries,
    moodData,
    monthMarkers,

    // Actions
    setSelectedDate,
    loadCalendarEvents,
    loadMonthActivities,
    getEventsForDate,
    refreshStats,
    refresh: loadStats,

    // Calendar Smart Journal actions
    getDayData,
    refreshJournalEntries,
    refreshTradingEntries,
    refreshMoodData,
    getMonthMarkers,

    // Computed
    userLevel,
    streaks,
    totalXP,

    // Service access
    statsService,
    calendarService,
    calendarJournalService,
    tradingJournalService,
    moodTrackingService,
  }), [
    stats,
    dailyScore,
    calendarEvents,
    selectedDate,
    monthActivities,
    isLoading,
    error,
    dayData,
    journalEntries,
    tradingEntries,
    moodData,
    monthMarkers,
    loadCalendarEvents,
    loadMonthActivities,
    getEventsForDate,
    refreshStats,
    loadStats,
    getDayData,
    refreshJournalEntries,
    refreshTradingEntries,
    refreshMoodData,
    getMonthMarkers,
    userLevel,
    streaks,
    totalXP,
  ]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext;
