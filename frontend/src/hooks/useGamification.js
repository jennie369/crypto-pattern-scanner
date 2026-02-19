/**
 * useGamification Hook
 *
 * Wraps gamificationService for easy use in React components.
 * Provides user level, XP, achievements, daily quest status, and actions
 * like completing quests and tracking activities.
 *
 * @example
 * const {
 *   level, xp, xpToNext, achievements, dailyQuests,
 *   loading, error, refreshGamification, completeQuest
 * } = useGamification();
 *
 * @returns {Object} Gamification state and actions
 * @property {number} level - Current user level (1-8)
 * @property {string} levelName - Display name for current level
 * @property {number} xp - Total XP points accumulated
 * @property {number} xpToNext - XP remaining until next level
 * @property {number} xpProgress - Progress to next level (0-1)
 * @property {Array} achievements - List of unlocked achievements
 * @property {number} totalPoints - Total achievement points
 * @property {Object} dailyQuests - Daily completion status per category
 * @property {number} comboCount - Number of categories completed today
 * @property {number} multiplier - Current combo multiplier
 * @property {Object} streak - Current combo streak info
 * @property {Object} allStreaks - All streak types with their data
 * @property {Array} habitGrid - Last 35 days of habit grid data
 * @property {boolean} loading - Whether data is being fetched
 * @property {string|null} error - Error message if fetch failed
 * @property {Function} refreshGamification - Re-fetch all gamification data
 * @property {Function} completeQuest - Mark a category as completed
 * @property {Function} trackWellness - Track a wellness activity
 * @property {Function} trackSocial - Track a social activity
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService, { ACHIEVEMENTS, TRACKING_CATEGORIES } from '../services/gamificationService';

/**
 * Default state returned when no user is logged in or data hasn't loaded yet.
 */
const DEFAULT_STATE = {
  level: 1,
  levelName: '',
  xp: 0,
  xpToNext: 0,
  xpProgress: 0,
  achievements: [],
  totalPoints: 0,
  dailyQuests: {
    affirmationDone: false,
    habitDone: false,
    goalDone: false,
    actionDone: false,
  },
  comboCount: 0,
  multiplier: 1.0,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    lastCompletionDate: null,
  },
  allStreaks: {},
  habitGrid: [],
  wellness: null,
  social: null,
};

export function useGamification() {
  const { user, profile } = useAuth();
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
   * Fetch full gamification profile from the service.
   * Uses try/finally to guarantee loading state is cleared.
   */
  const refreshGamification = useCallback(async () => {
    if (!user?.id) {
      setData(DEFAULT_STATE);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await gamificationService.getFullGamificationProfile(user.id);

      if (!mountedRef.current) return;

      if (!result.success) {
        setError(result.error || 'Failed to load gamification data');
        // Still set partial data so UI doesn't break
        setData(prev => ({ ...prev }));
        return;
      }

      // Compute level info from streakService-style points
      // The gamification service returns totalPoints from achievements
      const totalPoints = result.totalPoints || 0;

      setData({
        level: result.streak?.currentLevel || 1,
        levelName: result.streak?.levelName || '',
        xp: totalPoints,
        xpToNext: 0, // Computed from streakService if available
        xpProgress: 0,
        achievements: result.achievements || [],
        totalPoints,
        dailyQuests: {
          affirmationDone: result.daily?.affirmationDone || false,
          habitDone: result.daily?.habitDone || false,
          goalDone: result.daily?.goalDone || false,
          actionDone: result.daily?.actionDone || false,
        },
        comboCount: result.daily?.comboCount || 0,
        multiplier: result.daily?.multiplier || 1.0,
        streak: {
          currentStreak: result.streak?.currentStreak || 0,
          longestStreak: result.streak?.longestStreak || 0,
          totalCompletions: result.streak?.totalCompletions || 0,
          lastCompletionDate: result.streak?.lastCompletionDate || null,
        },
        allStreaks: result.allStreaks || {},
        habitGrid: result.habitGrid || [],
        wellness: result.wellness || null,
        social: result.social || null,
      });
    } catch (err) {
      console.error('[useGamification] refreshGamification error:', err);
      if (mountedRef.current) {
        setError(err.message || 'Unexpected error loading gamification data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  /**
   * Complete a daily quest category.
   *
   * @param {string} category - One of: 'affirmation', 'habit', 'goal', 'action'
   * @returns {Promise<Object>} Result with success flag, newAchievements, etc.
   */
  const completeQuest = useCallback(async (category) => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!TRACKING_CATEGORIES.includes(category)) {
      return { success: false, error: `Invalid category: ${category}. Must be one of: ${TRACKING_CATEGORIES.join(', ')}` };
    }

    try {
      const result = await gamificationService.trackCompletion(user.id, category);

      if (!mountedRef.current) return result;

      if (result.success) {
        // Refresh data to get updated state
        await refreshGamification();
      }

      return result;
    } catch (err) {
      console.error('[useGamification] completeQuest error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, refreshGamification]);

  /**
   * Track a wellness activity (tarot, iching, meditation).
   *
   * @param {string} activityType - One of: 'tarot', 'iching', 'meditation'
   * @param {Object} [metadata={}] - Optional metadata for the activity
   * @returns {Promise<Object>} Result with success flag, newAchievements, etc.
   */
  const trackWellness = useCallback(async (activityType, metadata = {}) => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const result = await gamificationService.trackWellnessActivity(user.id, activityType, metadata);

      if (!mountedRef.current) return result;

      if (result.success) {
        await refreshGamification();
      }

      return result;
    } catch (err) {
      console.error('[useGamification] trackWellness error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, refreshGamification]);

  /**
   * Track a social activity (post, comment, like, gift, referral, etc.).
   *
   * @param {string} activityType - E.g., 'post', 'comment', 'like_given', 'gift_sent', etc.
   * @returns {Promise<Object>} Result with success flag, newAchievements, stats
   */
  const trackSocial = useCallback(async (activityType) => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const result = await gamificationService.trackSocialActivity(user.id, activityType);

      if (!mountedRef.current) return result;

      if (result.success) {
        await refreshGamification();
      }

      return result;
    } catch (err) {
      console.error('[useGamification] trackSocial error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, refreshGamification]);

  /**
   * Computed: number of daily quests completed today (out of 4).
   */
  const questsCompletedToday = useMemo(() => {
    const { affirmationDone, habitDone, goalDone, actionDone } = data.dailyQuests;
    return [affirmationDone, habitDone, goalDone, actionDone].filter(Boolean).length;
  }, [data.dailyQuests]);

  /**
   * Computed: whether all 4 daily quests are completed (perfect day).
   */
  const isPerfectDay = useMemo(() => {
    return questsCompletedToday === 4;
  }, [questsCompletedToday]);

  /**
   * Computed: list of all available achievements with unlocked status.
   */
  const allAchievements = useMemo(() => {
    const unlockedIds = new Set(data.achievements.map(a => a.id));
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: data.achievements.find(a => a.id === achievement.id)?.unlockedAt || null,
    }));
  }, [data.achievements]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      refreshGamification();
    } else {
      setData(DEFAULT_STATE);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, refreshGamification]);

  return {
    // Core gamification data
    level: data.level,
    levelName: data.levelName,
    xp: data.xp,
    xpToNext: data.xpToNext,
    xpProgress: data.xpProgress,
    totalPoints: data.totalPoints,

    // Achievements
    achievements: data.achievements,
    allAchievements,

    // Daily quests
    dailyQuests: data.dailyQuests,
    comboCount: data.comboCount,
    multiplier: data.multiplier,
    questsCompletedToday,
    isPerfectDay,

    // Streaks
    streak: data.streak,
    allStreaks: data.allStreaks,

    // Habit grid (GitHub-style)
    habitGrid: data.habitGrid,

    // Wellness & social
    wellness: data.wellness,
    social: data.social,

    // State
    loading,
    error,

    // Actions
    refreshGamification,
    completeQuest,
    trackWellness,
    trackSocial,
  };
}

export default useGamification;
