/**
 * HabitContext - Habit & Affirmation State Management
 * Split from VisionBoardContext for better performance
 * Created: January 27, 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as habitService from '../services/habitService';
import * as affirmationService from '../services/affirmationService';

const HabitContext = createContext(null);

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [todayHabits, setTodayHabits] = useState([]);
  const [todayAffirmations, setTodayAffirmations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [habitsData, affirmationsData] = await Promise.all([
        habitService.getTodayHabits(userId),
        affirmationService.getTodayAffirmations(userId),
      ]);

      setTodayHabits(habitsData || []);
      setTodayAffirmations(affirmationsData || []);
    } catch (err) {
      console.error('[HabitContext] Load error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Habit actions
  const addHabit = useCallback(async (habitData) => {
    if (!userId) return null;

    try {
      const newHabit = await habitService.createHabit(userId, habitData);
      const updated = await habitService.getTodayHabits(userId);
      setTodayHabits(updated || []);
      return newHabit;
    } catch (err) {
      console.error('[HabitContext] Add habit error:', err);
      throw err;
    }
  }, [userId]);

  const toggleHabit = useCallback(async (habitId) => {
    if (!userId) return;

    try {
      await habitService.toggleHabit(habitId, userId);
      const updated = await habitService.getTodayHabits(userId);
      setTodayHabits(updated || []);
    } catch (err) {
      console.error('[HabitContext] Toggle habit error:', err);
      throw err;
    }
  }, [userId]);

  const deleteHabit = useCallback(async (habitId) => {
    try {
      await habitService.deleteHabit(habitId);
      setTodayHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('[HabitContext] Delete habit error:', err);
      throw err;
    }
  }, []);

  // Affirmation actions
  const addAffirmation = useCallback(async (affData) => {
    if (!userId) return null;

    try {
      const newAff = await affirmationService.createAffirmation(userId, affData);
      const updated = await affirmationService.getTodayAffirmations(userId);
      setTodayAffirmations(updated || []);
      return newAff;
    } catch (err) {
      console.error('[HabitContext] Add affirmation error:', err);
      throw err;
    }
  }, [userId]);

  const completeAffirmation = useCallback(async (affirmationId) => {
    if (!userId) return;

    try {
      await affirmationService.completeAffirmation(affirmationId, userId);
      const updated = await affirmationService.getTodayAffirmations(userId);
      setTodayAffirmations(updated || []);
    } catch (err) {
      console.error('[HabitContext] Complete affirmation error:', err);
      throw err;
    }
  }, [userId]);

  // Computed values
  const habitProgress = useMemo(() => ({
    completed: todayHabits.filter(h => h.isCompletedToday).length,
    total: todayHabits.length,
    percentage: todayHabits.length > 0
      ? Math.round((todayHabits.filter(h => h.isCompletedToday).length / todayHabits.length) * 100)
      : 0,
  }), [todayHabits]);

  const affirmationProgress = useMemo(() => ({
    completed: todayAffirmations.filter(a => a.isCompletedToday).length,
    total: todayAffirmations.length,
    percentage: todayAffirmations.length > 0
      ? Math.round((todayAffirmations.filter(a => a.isCompletedToday).length / todayAffirmations.length) * 100)
      : 0,
  }), [todayAffirmations]);

  // Context value
  const value = useMemo(() => ({
    // State
    todayHabits,
    todayAffirmations,
    isLoading,
    error,

    // Habit actions
    addHabit,
    toggleHabit,
    deleteHabit,

    // Affirmation actions
    addAffirmation,
    completeAffirmation,

    // Computed
    habitProgress,
    affirmationProgress,

    // Refresh
    refresh: loadData,

    // Service access
    habitService,
    affirmationService,
  }), [
    todayHabits,
    todayAffirmations,
    isLoading,
    error,
    addHabit,
    toggleHabit,
    deleteHabit,
    addAffirmation,
    completeAffirmation,
    habitProgress,
    affirmationProgress,
    loadData,
  ]);

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
};

export default HabitContext;
