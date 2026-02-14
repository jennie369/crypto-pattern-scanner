/**
 * @deprecated P1-10/P1-11: MERGED BACK INTO VisionBoardContext
 *
 * GoalContext was a strict subset of VisionBoardContext (goals + todayActions only).
 * Having both caused duplicate data fetches and potential state divergence.
 * All unique features (deleteGoal, activeGoals, completedGoals, actionProgress)
 * have been moved to VisionBoardContext.
 *
 * USE: import { useVisionBoard } from './VisionBoardContext' instead.
 *
 * This file is preserved for reference only. It is NOT imported anywhere.
 * Safe to delete in a future cleanup pass.
 *
 * GoalContext - Goal State Management (DEPRECATED)
 * Split from VisionBoardContext for better performance
 * Created: January 27, 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as goalService from '../services/goalService';
import * as actionService from '../services/actionService';

const GoalContext = createContext(null);

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
};

export const GoalProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [goals, setGoals] = useState([]);
  const [todayActions, setTodayActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load goals and actions
  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [goalsData, actionsData] = await Promise.all([
        goalService.getGoals(userId),
        actionService.getTodayActions(userId),
      ]);

      setGoals(goalsData || []);
      setTodayActions(actionsData || []);
    } catch (err) {
      console.error('[GoalContext] Load error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Goal actions
  const addGoal = useCallback(async (goalData) => {
    if (!userId) return null;

    try {
      const newGoal = await goalService.createGoal(userId, goalData);
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      console.error('[GoalContext] Add goal error:', err);
      throw err;
    }
  }, [userId]);

  const updateGoal = useCallback(async (goalId, updates) => {
    try {
      const updated = await goalService.updateGoal(goalId, updates);
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
      return updated;
    } catch (err) {
      console.error('[GoalContext] Update goal error:', err);
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (goalId) => {
    try {
      await goalService.deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error('[GoalContext] Delete goal error:', err);
      throw err;
    }
  }, []);

  const completeGoal = useCallback(async (goalId) => {
    if (!userId) return null;

    try {
      const result = await goalService.completeGoal(goalId, userId);
      await loadData();
      return result;
    } catch (err) {
      console.error('[GoalContext] Complete goal error:', err);
      throw err;
    }
  }, [userId, loadData]);

  // Action actions
  const addAction = useCallback(async (actionData) => {
    if (!userId) return null;

    try {
      const newAction = await actionService.createAction(userId, actionData);
      const updated = await actionService.getTodayActions(userId);
      setTodayActions(updated || []);
      return newAction;
    } catch (err) {
      console.error('[GoalContext] Add action error:', err);
      throw err;
    }
  }, [userId]);

  const toggleAction = useCallback(async (actionId) => {
    if (!userId) return;

    try {
      await actionService.toggleAction(actionId, userId);
      const updated = await actionService.getTodayActions(userId);
      setTodayActions(updated || []);
    } catch (err) {
      console.error('[GoalContext] Toggle action error:', err);
      throw err;
    }
  }, [userId]);

  // Computed values
  const activeGoals = useMemo(() =>
    goals.filter(g => g.status === 'active'),
  [goals]);

  const completedGoals = useMemo(() =>
    goals.filter(g => g.status === 'completed'),
  [goals]);

  const actionProgress = useMemo(() => ({
    completed: todayActions.filter(a => a.isCompletedToday).length,
    total: todayActions.length,
    percentage: todayActions.length > 0
      ? Math.round((todayActions.filter(a => a.isCompletedToday).length / todayActions.length) * 100)
      : 0,
  }), [todayActions]);

  // Context value
  const value = useMemo(() => ({
    // State
    goals,
    todayActions,
    isLoading,
    error,

    // Goal actions
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,

    // Action actions
    addAction,
    toggleAction,

    // Computed
    activeGoals,
    completedGoals,
    actionProgress,

    // Refresh
    refresh: loadData,

    // Service access
    goalService,
    actionService,
  }), [
    goals,
    todayActions,
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    addAction,
    toggleAction,
    activeGoals,
    completedGoals,
    actionProgress,
    loadData,
  ]);

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
};

export default GoalContext;
