/**
 * Vision Board Context
 * Provides global state for Vision Board feature
 *
 * @fileoverview Combined context for goals, habits, affirmations, and stats
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getGoals,
  getGoalsSummary,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  toggleAction,
  toggleMilestone,
} from '../services/visionBoard/goalService';
import {
  getHabits,
  getHabitsSummary,
  getTodaysHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkHabit,
  uncheckHabit,
} from '../services/visionBoard/habitService';
import {
  getAffirmations,
  getAffirmationsSummary,
  getTodaysAffirmation,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation,
  toggleFavorite,
  logReading,
  seedDefaultAffirmations,
} from '../services/visionBoard/affirmationService';
import {
  getUserStats,
  getDailyScore,
  getDashboardStats,
  saveDailySummary,
} from '../services/visionBoard/statsService';
import {
  getAllQuotas,
  getEffectiveTier,
} from '../services/visionBoard/tierService';

const VisionBoardContext = createContext({});

export const useVisionBoard = () => useContext(VisionBoardContext);

export const VisionBoardProvider = ({ children }) => {
  const { user, profile } = useAuth();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [affirmations, setAffirmations] = useState([]);
  const [todaysAffirmation, setTodaysAffirmation] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [dailyScore, setDailyScore] = useState(null);
  const [quotas, setQuotas] = useState(null);

  // Filters
  const [selectedLifeArea, setSelectedLifeArea] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Derived tier
  const tier = useMemo(() => {
    return getEffectiveTier(profile);
  }, [profile]);

  // ==================== DATA LOADING ====================

  /**
   * Load all Vision Board data
   */
  const loadAllData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parallel fetch all data
      const [
        goalsResult,
        habitsResult,
        affirmationsResult,
        todaysAffResult,
        statsResult,
        dailyScoreResult,
        quotasResult,
      ] = await Promise.all([
        getGoals(user.id, { lifeArea: selectedLifeArea }),
        getHabits(user.id),
        getAffirmations(user.id),
        getTodaysAffirmation(user.id),
        getUserStats(user.id),
        getDailyScore(user.id),
        getAllQuotas(user.id, tier),
      ]);

      setGoals(goalsResult.data || []);
      setHabits(habitsResult.data || []);
      setAffirmations(affirmationsResult.data || []);
      setTodaysAffirmation(todaysAffResult.data);
      setUserStats(statsResult.data);
      setDailyScore(dailyScoreResult.data);
      setQuotas(quotasResult);

      // Seed default affirmations for new users
      if (!affirmationsResult.data?.length) {
        const { data: seeded } = await seedDefaultAffirmations(user.id);
        if (seeded?.length) {
          setAffirmations(seeded);
          const { data: newTodaysAff } = await getTodaysAffirmation(user.id);
          setTodaysAffirmation(newTodaysAff);
        }
      }
    } catch (err) {
      console.error('Error loading Vision Board data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tier, selectedLifeArea]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== GOAL OPERATIONS ====================

  const handleCreateGoal = useCallback(async (goalData) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await createGoal(user.id, goalData, tier);
    if (!result.error) {
      setGoals((prev) => [result.data, ...prev]);
      // Refresh quotas
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleUpdateGoal = useCallback(async (goalId, updates) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await updateGoal(goalId, updates, user.id);
    if (!result.error) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...result.data } : g))
      );
    }
    return result;
  }, [user?.id]);

  const handleDeleteGoal = useCallback(async (goalId, hardDelete = false) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await deleteGoal(goalId, user.id, hardDelete);
    if (result.success) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      // Refresh quotas
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleCompleteGoal = useCallback(async (goalId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await completeGoal(goalId, user.id);
    if (!result.error) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...result.data, progress: 100 } : g))
      );
      // Refresh stats for XP update
      const { data: newStats } = await getUserStats(user.id);
      setUserStats(newStats);
    }
    return result;
  }, [user?.id]);

  const handleToggleAction = useCallback(async (actionId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await toggleAction(actionId, user.id);
    if (!result.error) {
      // Refresh goals to update progress
      const { data: updatedGoals } = await getGoals(user.id, { lifeArea: selectedLifeArea });
      setGoals(updatedGoals || []);
      // Refresh stats for XP update
      if (result.xpAwarded > 0) {
        const { data: newStats } = await getUserStats(user.id);
        setUserStats(newStats);
      }
    }
    return result;
  }, [user?.id, selectedLifeArea]);

  const handleToggleMilestone = useCallback(async (milestoneId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await toggleMilestone(milestoneId, user.id);
    if (!result.error) {
      // Refresh goals to update progress
      const { data: updatedGoals } = await getGoals(user.id, { lifeArea: selectedLifeArea });
      setGoals(updatedGoals || []);
      // Refresh stats for XP update
      if (result.xpAwarded > 0) {
        const { data: newStats } = await getUserStats(user.id);
        setUserStats(newStats);
      }
    }
    return result;
  }, [user?.id, selectedLifeArea]);

  // ==================== HABIT OPERATIONS ====================

  const handleCreateHabit = useCallback(async (habitData) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await createHabit(user.id, habitData, tier);
    if (!result.error) {
      setHabits((prev) => [result.data, ...prev]);
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleUpdateHabit = useCallback(async (habitId, updates) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await updateHabit(habitId, updates, user.id);
    if (!result.error) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...result.data } : h))
      );
    }
    return result;
  }, [user?.id]);

  const handleDeleteHabit = useCallback(async (habitId, hardDelete = false) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await deleteHabit(habitId, user.id, hardDelete);
    if (result.success) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleCheckHabit = useCallback(async (habitId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await checkHabit(habitId, user.id);
    if (!result.error) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...result.data, completedToday: true } : h))
      );
      // Refresh daily score and stats
      const [newDailyScore, newStats] = await Promise.all([
        getDailyScore(user.id),
        getUserStats(user.id),
      ]);
      setDailyScore(newDailyScore.data);
      setUserStats(newStats.data);
    }
    return result;
  }, [user?.id]);

  const handleUncheckHabit = useCallback(async (habitId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await uncheckHabit(habitId, user.id);
    if (!result.error) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...result.data, completedToday: false } : h))
      );
      // Refresh daily score
      const { data: newDailyScore } = await getDailyScore(user.id);
      setDailyScore(newDailyScore);
    }
    return result;
  }, [user?.id]);

  // ==================== AFFIRMATION OPERATIONS ====================

  const handleCreateAffirmation = useCallback(async (affirmationData) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await createAffirmation(user.id, affirmationData, tier);
    if (!result.error) {
      setAffirmations((prev) => [result.data, ...prev]);
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleUpdateAffirmation = useCallback(async (affirmationId, updates) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await updateAffirmation(affirmationId, updates, user.id);
    if (!result.error) {
      setAffirmations((prev) =>
        prev.map((a) => (a.id === affirmationId ? { ...a, ...result.data } : a))
      );
    }
    return result;
  }, [user?.id]);

  const handleDeleteAffirmation = useCallback(async (affirmationId, hardDelete = false) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await deleteAffirmation(affirmationId, user.id, hardDelete);
    if (result.success) {
      setAffirmations((prev) => prev.filter((a) => a.id !== affirmationId));
      const newQuotas = await getAllQuotas(user.id, tier);
      setQuotas(newQuotas);
    }
    return result;
  }, [user?.id, tier]);

  const handleToggleFavorite = useCallback(async (affirmationId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await toggleFavorite(affirmationId, user.id);
    if (!result.error) {
      setAffirmations((prev) =>
        prev.map((a) => (a.id === affirmationId ? { ...a, ...result.data } : a))
      );
    }
    return result;
  }, [user?.id]);

  const handleLogReading = useCallback(async (affirmationId) => {
    if (!user?.id) return { error: new Error('Not authenticated') };

    const result = await logReading(affirmationId, user.id);
    if (!result.error && result.xpAwarded > 0) {
      // Refresh stats for XP update
      const { data: newStats } = await getUserStats(user.id);
      setUserStats(newStats);
    }
    return result;
  }, [user?.id]);

  // ==================== UTILITY FUNCTIONS ====================

  const refreshDailyScore = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getDailyScore(user.id);
    setDailyScore(data);
  }, [user?.id]);

  const refreshStats = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getUserStats(user.id);
    setUserStats(data);
  }, [user?.id]);

  const saveDailyProgress = useCallback(async () => {
    if (!user?.id) return;
    await saveDailySummary(user.id);
  }, [user?.id]);

  // ==================== DERIVED DATA ====================

  const todaysHabits = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    return habits.filter((habit) => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (habit.frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (habit.frequency === 'custom' && habit.custom_days) {
        return habit.custom_days.includes(dayOfWeek);
      }
      return true;
    });
  }, [habits]);

  const completedHabitsToday = useMemo(() => {
    return todaysHabits.filter((h) => h.completedToday).length;
  }, [todaysHabits]);

  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'active' && !g.is_archived);
  }, [goals]);

  const filteredGoals = useMemo(() => {
    let filtered = goals;

    if (selectedLifeArea) {
      filtered = filtered.filter((g) => g.life_area === selectedLifeArea);
    }

    if (!showCompleted) {
      filtered = filtered.filter((g) => g.status !== 'completed');
    }

    return filtered;
  }, [goals, selectedLifeArea, showCompleted]);

  // ==================== CONTEXT VALUE ====================

  const value = useMemo(() => ({
    // State
    loading,
    error,
    tier,

    // Goals
    goals,
    filteredGoals,
    activeGoals,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    completeGoal: handleCompleteGoal,
    toggleAction: handleToggleAction,
    toggleMilestone: handleToggleMilestone,

    // Habits
    habits,
    todaysHabits,
    completedHabitsToday,
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    checkHabit: handleCheckHabit,
    uncheckHabit: handleUncheckHabit,

    // Affirmations
    affirmations,
    todaysAffirmation,
    createAffirmation: handleCreateAffirmation,
    updateAffirmation: handleUpdateAffirmation,
    deleteAffirmation: handleDeleteAffirmation,
    toggleFavorite: handleToggleFavorite,
    logReading: handleLogReading,

    // Stats
    userStats,
    dailyScore,
    quotas,
    refreshStats,
    refreshDailyScore,
    saveDailyProgress,

    // Filters
    selectedLifeArea,
    setSelectedLifeArea,
    showCompleted,
    setShowCompleted,

    // Refresh
    refresh: loadAllData,
  }), [
    loading,
    error,
    tier,
    goals,
    filteredGoals,
    activeGoals,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleCompleteGoal,
    handleToggleAction,
    handleToggleMilestone,
    habits,
    todaysHabits,
    completedHabitsToday,
    handleCreateHabit,
    handleUpdateHabit,
    handleDeleteHabit,
    handleCheckHabit,
    handleUncheckHabit,
    affirmations,
    todaysAffirmation,
    handleCreateAffirmation,
    handleUpdateAffirmation,
    handleDeleteAffirmation,
    handleToggleFavorite,
    handleLogReading,
    userStats,
    dailyScore,
    quotas,
    refreshStats,
    refreshDailyScore,
    saveDailyProgress,
    selectedLifeArea,
    showCompleted,
    loadAllData,
  ]);

  return (
    <VisionBoardContext.Provider value={value}>
      {children}
    </VisionBoardContext.Provider>
  );
};

export default VisionBoardContext;
