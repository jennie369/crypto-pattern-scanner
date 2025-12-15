/**
 * useGamification Hook
 * Vision Board Gamification - React Hook for gamification state
 *
 * Features:
 * - Load and cache gamification data
 * - Track completions for 4 categories (affirmation, habit, goal, action)
 * - Handle achievement unlocks
 * - Manage streak freeze
 * - Support for 4-category combo system
 *
 * Updated: December 11, 2025 - Added 'action' category
 *
 * Usage:
 * const {
 *   dailyStatus,
 *   streak,
 *   habitGrid,
 *   achievements,
 *   trackCategory,
 *   refreshData,
 *   newAchievement,
 *   dismissAchievement,
 * } = useGamification(userId);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import gamificationService from '../services/gamificationService';

const useGamification = (userId) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states (4 categories: affirmation, habit, goal, action)
  const [dailyStatus, setDailyStatus] = useState({
    affirmationDone: false,
    habitDone: false,
    goalDone: false,
    actionDone: false,
    comboCount: 0,
    multiplier: 1.0,
  });

  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    freezeCount: 0,
  });

  const [allStreaks, setAllStreaks] = useState({});
  const [habitGrid, setHabitGrid] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Achievement modal state
  const [newAchievement, setNewAchievement] = useState(null);

  // Prevent duplicate fetches
  const isFetchingRef = useRef(false);

  /**
   * Load all gamification data
   */
  const loadData = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const summary = await gamificationService.getGamificationSummary(userId);

      if (summary.success) {
        setDailyStatus({
          affirmationDone: summary.daily?.affirmationDone || false,
          habitDone: summary.daily?.habitDone || false,
          goalDone: summary.daily?.goalDone || false,
          actionDone: summary.daily?.actionDone || false,
          comboCount: summary.daily?.comboCount || 0,
          multiplier: summary.daily?.multiplier || 1.0,
        });

        setStreak({
          currentStreak: summary.streak?.currentStreak || 0,
          longestStreak: summary.streak?.longestStreak || 0,
          totalCompletions: summary.streak?.totalCompletions || 0,
          freezeCount: summary.allStreaks?.combo?.freezeCount || 0,
        });

        setAllStreaks(summary.allStreaks || {});
        setHabitGrid(summary.habitGrid || []);
        setAchievements(summary.achievements || []);
        setTotalPoints(summary.totalPoints || 0);
        setError(null);
      } else {
        setError('Failed to load gamification data');
      }
    } catch (err) {
      console.error('[useGamification] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  /**
   * Refresh data (pull to refresh or focus refresh)
   * Force refresh bypasses the isFetchingRef to ensure data is always fresh
   */
  const refreshData = useCallback(async (force = true) => {
    // Reset fetching ref to allow refresh
    if (force) {
      isFetchingRef.current = false;
    }
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  /**
   * Track category completion
   * @param {string} category - 'affirmation' | 'habit' | 'goal' | 'action'
   */
  const trackCategory = useCallback(async (category) => {
    if (!userId) return { success: false };

    try {
      const result = await gamificationService.trackCompletion(userId, category);

      if (result.success) {
        // Update local state immediately (4 categories)
        setDailyStatus(prev => ({
          ...prev,
          affirmationDone: result.affirmation_done ?? prev.affirmationDone,
          habitDone: result.habit_done ?? prev.habitDone,
          goalDone: result.goal_done ?? prev.goalDone,
          actionDone: result.action_done ?? prev.actionDone,
          comboCount: result.combo_count ?? prev.comboCount,
          multiplier: result.multiplier ?? prev.multiplier,
        }));

        // Check for new achievements
        if (result.newAchievements?.length > 0) {
          // Show first achievement
          setNewAchievement(result.newAchievements[0]);
        }

        // If full combo (3 or 4 categories), refresh streak data
        if (result.is_full_combo || result.is_full_combo_4) {
          const streakData = await gamificationService.getStreak(userId, 'combo');
          if (streakData.success) {
            setStreak(prev => ({
              ...prev,
              currentStreak: streakData.currentStreak,
              longestStreak: Math.max(prev.longestStreak, streakData.currentStreak),
            }));
          }
        }

        return { success: true, ...result };
      }

      return { success: false };
    } catch (err) {
      console.error('[useGamification] Track error:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  /**
   * Dismiss achievement modal
   */
  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  /**
   * Use streak freeze
   */
  const useFreeze = useCallback(async () => {
    if (!userId) return { success: false };

    try {
      const result = await gamificationService.useStreakFreeze(userId, 'combo');

      if (result.success) {
        setStreak(prev => ({
          ...prev,
          freezeCount: result.remainingFreezes,
        }));
      }

      return result;
    } catch (err) {
      console.error('[useGamification] Use freeze error:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  /**
   * Check if streak is at risk (not completed today and had previous streak)
   */
  const isStreakAtRisk = useCallback(() => {
    // If no streak, nothing to lose
    if (streak.currentStreak === 0) return false;

    // If already completed full combo today (3 or 4 categories), safe
    if (dailyStatus.comboCount >= 3) return false;

    // Check if last completion was yesterday
    // (Would need last_completion_date from backend for accurate check)
    return true;
  }, [streak.currentStreak, dailyStatus.comboCount]);

  return {
    // Loading states
    loading,
    refreshing,
    error,

    // Data
    dailyStatus,
    streak,
    allStreaks,
    habitGrid,
    achievements,
    totalPoints,

    // Actions
    trackCategory,
    refreshData,
    useFreeze,

    // Achievement modal
    newAchievement,
    dismissAchievement,

    // Helpers
    isStreakAtRisk: isStreakAtRisk(),
  };
};

export default useGamification;
