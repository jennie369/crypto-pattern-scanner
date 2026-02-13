/**
 * VisionBoardContext - Vision Board 2.0
 * Centralized state management for Vision Board features
 * Created: December 10, 2025
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Import all services
import * as goalService from '../services/goalService';
import * as actionService from '../services/actionService';
import * as affirmationService from '../services/affirmationService';
import * as habitService from '../services/habitService';
import * as statsService from '../services/statsService';
import * as ritualService from '../services/ritualService';
import * as divinationService from '../services/divinationService';

const VisionBoardContext = createContext(null);

export const useVisionBoard = () => {
  const context = useContext(VisionBoardContext);
  if (!context) {
    throw new Error('useVisionBoard must be used within a VisionBoardProvider');
  }
  return context;
};

export const VisionBoardProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // ============ STATE ============
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Goals
  const [goals, setGoals] = useState([]);

  // Today's items
  const [todayActions, setTodayActions] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [todayAffirmations, setTodayAffirmations] = useState([]);
  const [todayRituals, setTodayRituals] = useState([]);

  // Stats
  const [stats, setStats] = useState(null);
  const [dailyScore, setDailyScore] = useState(0);

  // Divination
  const [recentReadings, setRecentReadings] = useState([]);

  // ============ LOAD DATA ============
  const loadAllData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [
        goalsData,
        actionsData,
        habitsData,
        affirmationsData,
        ritualsCompleted,
        fullStats,
        readings,
      ] = await Promise.all([
        goalService.getGoals(userId),
        actionService.getTodayActions(userId),
        habitService.getTodayHabits(userId),
        affirmationService.getTodayAffirmations(userId),
        ritualService.getTodayCompletions(userId),
        statsService.getFullStats(userId),
        divinationService.getRecentReadings(userId, 3),
      ]);

      setGoals(goalsData);
      setTodayActions(actionsData);
      setTodayHabits(habitsData);
      setTodayAffirmations(affirmationsData);
      setTodayRituals(ritualsCompleted);
      setStats(fullStats);
      setDailyScore(fullStats?.dailyScore || 0);
      setRecentReadings(readings);
    } catch (err) {
      console.error('[VisionBoardContext] loadAllData error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount and user change
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ============ ACTIONS ============

  // Refresh all data
  const refresh = useCallback(() => {
    return loadAllData();
  }, [loadAllData]);

  // Goal actions
  const addGoal = useCallback(async (goalData) => {
    if (!userId) return null;
    const newGoal = await goalService.createGoal(userId, goalData);
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  }, [userId]);

  const updateGoal = useCallback(async (goalId, updates) => {
    const updated = await goalService.updateGoal(goalId, updates);
    setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
    return updated;
  }, []);

  const completeGoal = useCallback(async (goalId) => {
    if (!userId) return null;
    const result = await goalService.completeGoal(goalId, userId);
    await refresh();
    return result;
  }, [userId, refresh]);

  // Action/Task actions
  const toggleAction = useCallback(async (actionId) => {
    if (!userId) return;
    await actionService.toggleAction(actionId, userId);
    const updated = await actionService.getTodayActions(userId);
    setTodayActions(updated);
    // Refresh stats
    const newStats = await statsService.getFullStats(userId);
    setStats(newStats);
    setDailyScore(newStats?.dailyScore || 0);
  }, [userId]);

  const addAction = useCallback(async (actionData) => {
    if (!userId) return null;
    const newAction = await actionService.createAction(userId, actionData);
    const updated = await actionService.getTodayActions(userId);
    setTodayActions(updated);
    return newAction;
  }, [userId]);

  // Habit actions
  const toggleHabit = useCallback(async (habitId) => {
    if (!userId) return;
    await habitService.toggleHabit(habitId, userId);
    const updated = await habitService.getTodayHabits(userId);
    setTodayHabits(updated);
    // Refresh stats
    const newStats = await statsService.getFullStats(userId);
    setStats(newStats);
    setDailyScore(newStats?.dailyScore || 0);
  }, [userId]);

  const addHabit = useCallback(async (habitData) => {
    if (!userId) return null;
    const newHabit = await habitService.createHabit(userId, habitData);
    const updated = await habitService.getTodayHabits(userId);
    setTodayHabits(updated);
    return newHabit;
  }, [userId]);

  // Affirmation actions
  const completeAffirmation = useCallback(async (affirmationId) => {
    if (!userId) return;
    await affirmationService.completeAffirmation(affirmationId, userId);
    const updated = await affirmationService.getTodayAffirmations(userId);
    setTodayAffirmations(updated);
    // Refresh stats
    const newStats = await statsService.getFullStats(userId);
    setStats(newStats);
    setDailyScore(newStats?.dailyScore || 0);
  }, [userId]);

  const addAffirmation = useCallback(async (affData) => {
    if (!userId) return null;
    const newAff = await affirmationService.createAffirmation(userId, affData);
    const updated = await affirmationService.getTodayAffirmations(userId);
    setTodayAffirmations(updated);
    return newAff;
  }, [userId]);

  // Ritual actions
  const completeRitual = useCallback(async (ritualSlug, content) => {
    if (!userId) return null;
    const result = await ritualService.completeRitual(userId, ritualSlug, content);
    const updated = await ritualService.getTodayCompletions(userId);
    setTodayRituals(updated);
    // Refresh stats
    const newStats = await statsService.getFullStats(userId);
    setStats(newStats);
    setDailyScore(newStats?.dailyScore || 0);
    return result;
  }, [userId]);

  // ============ COMPUTED VALUES ============

  const todayProgress = {
    actions: {
      completed: todayActions.filter(a => a.isCompletedToday).length,
      total: todayActions.length,
    },
    habits: {
      completed: todayHabits.filter(h => h.isCompletedToday).length,
      total: todayHabits.length,
    },
    affirmations: {
      completed: todayAffirmations.filter(a => a.isCompletedToday).length,
      total: todayAffirmations.length,
    },
    rituals: {
      completed: todayRituals.length,
      total: Object.keys(ritualService.RITUAL_TYPES).length,
    },
  };

  const userLevel = stats?.level || { level: 1, title: 'Người Mới Bắt Đầu', badge: '🌱' };

  // ============ CONTEXT VALUE ============
  const value = {
    // Loading state
    isLoading,
    error,
    refresh,

    // Goals
    goals,
    addGoal,
    updateGoal,
    completeGoal,

    // Today's items
    todayActions,
    todayHabits,
    todayAffirmations,
    todayRituals,

    // Actions
    toggleAction,
    addAction,
    toggleHabit,
    addHabit,
    completeAffirmation,
    addAffirmation,
    completeRitual,

    // Stats
    stats,
    dailyScore,
    userLevel,
    todayProgress,

    // Divination
    recentReadings,

    // Services (for direct access)
    services: {
      goalService,
      actionService,
      affirmationService,
      habitService,
      statsService,
      ritualService,
      divinationService,
    },
  };

  return (
    <VisionBoardContext.Provider value={value}>
      {children}
    </VisionBoardContext.Provider>
  );
};

export default VisionBoardContext;
