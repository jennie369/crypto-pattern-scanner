/**
 * useStreak Hook
 *
 * Wraps streakService for easy use in React components.
 * Provides streak count, level, weekly progress calendar,
 * longest streak, and a daily check-in action.
 *
 * @example
 * const {
 *   streakCount, level, weeklyProgress, longestStreak,
 *   loading, error, refreshStreak, checkIn
 * } = useStreak('chat');
 *
 * @param {string} [streakType='chat'] - The streak type to track.
 *   One of: 'chat', 'ritual', 'meditation', 'gratitude',
 *           'affirmation', 'divination', 'general'
 *
 * @returns {Object} Streak state and actions
 * @property {number} streakCount - Current consecutive day count
 * @property {number} longestStreak - All-time longest streak
 * @property {number} level - Current gamification level (1-8)
 * @property {string} levelName - Display name for current level
 * @property {string} levelColor - Color associated with current level
 * @property {string} levelIcon - Icon name for current level
 * @property {number} totalPoints - Total XP points earned
 * @property {Object} nextLevelInfo - Info about next level progression
 * @property {Array} badges - All badges with earned/unearned status
 * @property {number} earnedBadgesCount - Number of badges earned
 * @property {number} totalBadges - Total number of available badges
 * @property {Array} weeklyProgress - Last 7 days with completion status
 * @property {Object|null} streakRisk - Whether streak is at risk of breaking
 * @property {Object} streaksByType - All streak types for the user
 * @property {boolean} completedToday - Whether user already checked in today
 * @property {boolean} loading - Whether data is being fetched
 * @property {string|null} error - Error message if fetch failed
 * @property {Function} refreshStreak - Re-fetch all streak data
 * @property {Function} checkIn - Record today's activity (daily check-in)
 * @property {Function} awardXP - Award bonus XP to the user
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import streakService, { STREAK_TYPES, LEVELS, BADGES } from '../services/streakService';

/**
 * Default state returned when no user is logged in or data hasn't loaded yet.
 */
const DEFAULT_STATE = {
  streakCount: 0,
  longestStreak: 0,
  level: 1,
  levelName: '',
  levelColor: '#90EE90',
  levelIcon: 'seedling',
  totalPoints: 0,
  nextLevelInfo: null,
  badges: [],
  earnedBadgesCount: 0,
  totalBadges: Object.keys(BADGES).length,
  streaksByType: {},
  streakStartDate: null,
  lastActivityDate: null,
  completedToday: false,
  streakRisk: null,
};

/**
 * Build a weekly progress array for the last 7 days.
 * Each entry contains { date, dayName, isToday, completed }.
 *
 * @param {string|null} lastActivityDate - ISO date string of last activity
 * @param {number} currentStreak - Current streak count
 * @returns {Array<Object>} Array of 7 day objects
 */
function buildWeeklyProgress(lastActivityDate, currentStreak) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const week = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = i === 0;

    // Determine if this day was completed:
    // If we have a streak of N days ending on lastActivityDate,
    // then the streak covers [lastActivityDate - (N-1)..lastActivityDate]
    let completed = false;

    if (lastActivityDate && currentStreak > 0) {
      const lastDate = new Date(lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);

      const streakStartDate = new Date(lastDate);
      streakStartDate.setDate(streakStartDate.getDate() - (currentStreak - 1));

      completed = date >= streakStartDate && date <= lastDate;
    }

    week.push({
      date: dateStr,
      dayOfWeek: date.getDay(),
      dayName: dayNames[date.getDay()],
      isToday,
      completed,
    });
  }

  return week;
}

export function useStreak(streakType = STREAK_TYPES.CHAT) {
  const { user } = useAuth();
  const [data, setData] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Fetch gamification summary and streak risk from the service.
   * Uses try/finally to guarantee loading state is cleared.
   */
  const refreshStreak = useCallback(async () => {
    if (!user?.id) {
      setData(DEFAULT_STATE);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch gamification summary and streak risk in parallel
      const [summary, risk] = await Promise.all([
        streakService.getGamificationSummary(user.id),
        streakService.checkStreakRisk(user.id, streakType),
      ]);

      if (!mountedRef.current) return;

      if (!summary) {
        setError('Failed to load streak data');
        return;
      }

      // Determine if user already completed today
      const today = new Date().toISOString().split('T')[0];
      const completedToday = summary.lastActivityDate === today;

      setData({
        streakCount: summary.currentStreak || 0,
        longestStreak: summary.longestStreak || 0,
        level: summary.level || 1,
        levelName: summary.levelName || LEVELS[0].name,
        levelColor: summary.levelColor || LEVELS[0].color,
        levelIcon: summary.levelIcon || LEVELS[0].icon,
        totalPoints: summary.totalPoints || 0,
        nextLevelInfo: {
          isMaxLevel: summary.isMaxLevel || false,
          nextLevel: summary.nextLevel || null,
          nextLevelName: summary.nextLevelName || null,
          pointsToNext: summary.pointsToNext || 0,
          progress: summary.progress || 0,
          progressPercent: summary.progressPercent || 0,
        },
        badges: summary.badges || [],
        earnedBadgesCount: summary.earnedBadgesCount || 0,
        totalBadges: summary.totalBadges || Object.keys(BADGES).length,
        streaksByType: summary.streaksByType || {},
        streakStartDate: summary.streakStartDate || null,
        lastActivityDate: summary.lastActivityDate || null,
        completedToday,
        streakRisk: risk,
      });
    } catch (err) {
      console.error('[useStreak] refreshStreak error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Unexpected error loading streak data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, streakType]);

  /**
   * Record today's daily check-in for the current streak type.
   * Updates local state immediately on success, then refreshes full data.
   *
   * @param {string|null} [ritualId=null] - Optional ritual ID for ritual-type streaks
   * @returns {Promise<Object>} Result with success, streak, newBadges, xpEarned, etc.
   */
  const checkIn = useCallback(async (ritualId = null) => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const result = await streakService.recordActivity(user.id, streakType, ritualId);

      if (!mountedRef.current) return result;

      if (result.success) {
        // Optimistic update for immediate feedback
        setData(prev => ({
          ...prev,
          streakCount: result.streak || prev.streakCount,
          longestStreak: result.longestStreak || prev.longestStreak,
          level: result.level || prev.level,
          levelName: result.levelName || prev.levelName,
          totalPoints: result.totalPoints || prev.totalPoints,
          completedToday: true,
        }));

        // Then refresh full data in background for badge/level consistency
        refreshStreak();
      }

      return result;
    } catch (err) {
      console.error('[useStreak] checkIn error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, streakType, refreshStreak]);

  /**
   * Award bonus XP to the user (e.g., for completing special tasks).
   *
   * @param {number} xp - Amount of XP to award
   * @param {string} [reason='bonus'] - Reason for the XP award
   * @returns {Promise<Object>} Result with success, newTotal, newLevel
   */
  const awardXP = useCallback(async (xp, reason = 'bonus') => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!xp || xp <= 0) {
      return { success: false, error: 'XP must be a positive number' };
    }

    try {
      const result = await streakService.awardBonusXP(user.id, xp, reason);

      if (!mountedRef.current) return result;

      if (result.success) {
        // Refresh to get updated level/points
        await refreshStreak();
      }

      return result;
    } catch (err) {
      console.error('[useStreak] awardXP error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, refreshStreak]);

  /**
   * Computed: weekly progress calendar for the last 7 days.
   */
  const weeklyProgress = useMemo(() => {
    return buildWeeklyProgress(data.lastActivityDate, data.streakCount);
  }, [data.lastActivityDate, data.streakCount]);

  /**
   * Computed: number of active days in the last 7 days.
   */
  const weeklyActiveCount = useMemo(() => {
    return weeklyProgress.filter(day => day.completed).length;
  }, [weeklyProgress]);

  /**
   * Computed: whether the streak is at risk of breaking today.
   */
  const isAtRisk = useMemo(() => {
    return data.streakRisk?.atRisk === true && !data.completedToday;
  }, [data.streakRisk, data.completedToday]);

  /**
   * Computed: urgency level ('low', 'medium', 'high') or null.
   */
  const riskUrgency = useMemo(() => {
    if (!isAtRisk) return null;
    return data.streakRisk?.urgency || null;
  }, [isAtRisk, data.streakRisk]);

  // Fetch data on mount and when user/streakType changes
  useEffect(() => {
    if (user?.id) {
      refreshStreak();
    } else {
      setData(DEFAULT_STATE);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, refreshStreak]);

  return {
    // Core streak data
    streakCount: data.streakCount,
    longestStreak: data.longestStreak,
    completedToday: data.completedToday,
    streakStartDate: data.streakStartDate,
    lastActivityDate: data.lastActivityDate,

    // Gamification
    level: data.level,
    levelName: data.levelName,
    levelColor: data.levelColor,
    levelIcon: data.levelIcon,
    totalPoints: data.totalPoints,
    nextLevelInfo: data.nextLevelInfo,

    // Badges
    badges: data.badges,
    earnedBadgesCount: data.earnedBadgesCount,
    totalBadges: data.totalBadges,

    // Weekly view
    weeklyProgress,
    weeklyActiveCount,

    // Risk
    streakRisk: data.streakRisk,
    isAtRisk,
    riskUrgency,

    // All streak types
    streaksByType: data.streaksByType,

    // State
    loading,
    error,

    // Actions
    refreshStreak,
    checkIn,
    awardXP,
  };
}

export default useStreak;
