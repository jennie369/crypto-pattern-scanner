/**
 * RitualContext - Ritual State Management
 * Split from VisionBoardContext for better performance
 * Created: January 27, 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as ritualService from '../services/ritualService';
import { canAccessRitual, getAccessibleRituals, getLockedRituals, getTierDisplayName, RITUAL_METADATA } from '../screens/VisionBoard/rituals';

const RitualContext = createContext(null);

export const useRitual = () => {
  const context = useContext(RitualContext);
  if (!context) {
    throw new Error('useRitual must be used within a RitualProvider');
  }
  return context;
};

export const RitualProvider = ({ children }) => {
  const { user, profile, userTier, isAdmin, isManager } = useAuth();
  const userId = user?.id;

  // Get effective tier for access control
  const getEffectiveTier = useCallback(() => {
    // Check for Admin/Manager bypass
    if (isAdmin || isManager) {
      return isAdmin ? 'ADMIN' : 'MANAGER';
    }
    const role = profile?.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'MANAGER') {
      return role;
    }
    // Check all tier types (purchasing any unlocks rituals)
    const chatbotTier = profile?.chatbot_tier?.toUpperCase();
    const scannerTier = profile?.scanner_tier?.toUpperCase();
    const courseTier = profile?.course_tier?.toUpperCase();
    const baseTier = userTier?.toUpperCase();

    const tiers = [chatbotTier, scannerTier, courseTier, baseTier].filter(Boolean);
    const tierPriority = { 'FREE': 0, 'TIER1': 1, 'TIER2': 2, 'TIER3': 3, 'ADMIN': 999, 'MANAGER': 999 };

    let highestTier = 'FREE';
    for (const t of tiers) {
      if ((tierPriority[t] || 0) > (tierPriority[highestTier] || 0)) {
        highestTier = t;
      }
    }
    return highestTier;
  }, [profile, userTier, isAdmin, isManager]);

  // State
  const [todayRituals, setTodayRituals] = useState([]);
  const [ritualStreak, setRitualStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load today's ritual completions
  const loadRituals = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get today's completions
      const completions = await ritualService.getTodayCompletions(userId).catch(() => []);
      setTodayRituals(completions || []);

      // Get streak from user progress
      const progress = await ritualService.getUserRitualProgress(userId).catch(() => null);
      setRitualStreak(progress?.currentStreak || progress?.streak || 0);
    } catch (err) {
      console.error('[RitualContext] Load error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadRituals();
  }, [loadRituals]);

  // Complete a ritual
  const completeRitual = useCallback(async (ritualSlug, content) => {
    if (!userId) return null;

    try {
      const result = await ritualService.completeRitual(userId, ritualSlug, content);

      // Refresh completions
      const updated = await ritualService.getTodayCompletions(userId);
      setTodayRituals(updated || []);

      // Update streak
      if (result?.newStreak) {
        setRitualStreak(result.newStreak);
      }

      return result;
    } catch (err) {
      console.error('[RitualContext] Complete error:', err);
      throw err;
    }
  }, [userId]);

  // Check if a specific ritual is completed today
  const isRitualCompletedToday = useCallback((ritualSlug) => {
    return todayRituals.some(r => r.ritual_slug === ritualSlug);
  }, [todayRituals]);

  // Check if user can access a specific ritual
  const canUserAccessRitual = useCallback((ritualId) => {
    const effectiveTier = getEffectiveTier();
    return canAccessRitual(effectiveTier, ritualId);
  }, [getEffectiveTier]);

  // Get required tier for a ritual
  const getRequiredTierForRitual = useCallback((ritualId) => {
    const meta = RITUAL_METADATA[ritualId];
    return meta?.requiredTier || 'TIER1';
  }, []);

  // Get all accessible rituals for user
  const userAccessibleRituals = useMemo(() => {
    const effectiveTier = getEffectiveTier();
    return getAccessibleRituals(effectiveTier);
  }, [getEffectiveTier]);

  // Get all locked rituals for user
  const userLockedRituals = useMemo(() => {
    const effectiveTier = getEffectiveTier();
    return getLockedRituals(effectiveTier);
  }, [getEffectiveTier]);

  // Get available rituals (not completed today AND accessible)
  const availableRituals = useMemo(() => {
    const allRituals = Object.keys(ritualService.RITUAL_TYPES || {});
    const completedSlugs = todayRituals.map(r => r.ritual_slug);
    const effectiveTier = getEffectiveTier();

    return allRituals.filter(slug =>
      !completedSlugs.includes(slug) && canAccessRitual(effectiveTier, slug)
    );
  }, [todayRituals, getEffectiveTier]);

  // Progress
  const ritualProgress = useMemo(() => ({
    completed: todayRituals.length,
    total: Object.keys(ritualService.RITUAL_TYPES || {}).length,
    percentage: Math.round((todayRituals.length / Object.keys(ritualService.RITUAL_TYPES || {}).length) * 100) || 0,
  }), [todayRituals]);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    todayRituals,
    ritualStreak,
    isLoading,
    error,

    // Actions
    completeRitual,
    refresh: loadRituals,

    // Computed
    isRitualCompletedToday,
    availableRituals,
    ritualProgress,

    // Access Control
    canUserAccessRitual,
    getRequiredTierForRitual,
    userAccessibleRituals,
    userLockedRituals,
    getEffectiveTier,
    getTierDisplayName,

    // Service access
    ritualService,
  }), [
    todayRituals,
    ritualStreak,
    isLoading,
    error,
    completeRitual,
    loadRituals,
    isRitualCompletedToday,
    availableRituals,
    ritualProgress,
    canUserAccessRitual,
    getRequiredTierForRitual,
    userAccessibleRituals,
    userLockedRituals,
    getEffectiveTier,
  ]);

  return (
    <RitualContext.Provider value={value}>
      {children}
    </RitualContext.Provider>
  );
};

export default RitualContext;
