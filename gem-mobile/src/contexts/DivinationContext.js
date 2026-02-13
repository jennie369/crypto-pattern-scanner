/**
 * DivinationContext - Divination/Tarot/IChing State Management
 * Split from VisionBoardContext for better performance
 * Created: January 27, 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as divinationService from '../services/divinationService';

const DivinationContext = createContext(null);

export const useDivination = () => {
  const context = useContext(DivinationContext);
  if (!context) {
    throw new Error('useDivination must be used within a DivinationProvider');
  }
  return context;
};

export const DivinationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [recentReadings, setRecentReadings] = useState([]);
  const [todayReading, setTodayReading] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load readings
  const loadReadings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get recent readings
      const recent = await divinationService.getRecentReadings(userId, 5).catch(() => []);
      setRecentReadings(recent || []);

      // Get today's reading from recent if exists
      const today = new Date().toDateString();
      const todayRead = (recent || []).find(r =>
        new Date(r.created_at).toDateString() === today
      );
      setTodayReading(todayRead || null);
    } catch (err) {
      console.error('[DivinationContext] Load error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load on mount
  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  // Save a new reading (note: use tarotService or ichingService directly for specific types)
  const saveReading = useCallback(async (readingData) => {
    if (!userId) return null;

    try {
      // Check if service has saveReading method
      if (typeof divinationService.saveReading === 'function') {
        const saved = await divinationService.saveReading(userId, readingData);
        await loadReadings();
        return saved;
      } else {
        // Fallback: just refresh readings list
        console.warn('[DivinationContext] saveReading not available in divinationService, refreshing list only');
        await loadReadings();
        return readingData;
      }
    } catch (err) {
      console.error('[DivinationContext] Save reading error:', err);
      throw err;
    }
  }, [userId, loadReadings]);

  // Get reading by ID
  const getReading = useCallback(async (readingId) => {
    try {
      return await divinationService.getReadingById(readingId);
    } catch (err) {
      console.error('[DivinationContext] Get reading error:', err);
      throw err;
    }
  }, []);

  // Computed values
  const hasReadingToday = useMemo(() => !!todayReading, [todayReading]);

  const readingsByType = useMemo(() => {
    const byType = { tarot: [], iching: [], numerology: [] };
    recentReadings.forEach(r => {
      const type = r.reading_type || 'tarot';
      if (byType[type]) {
        byType[type].push(r);
      }
    });
    return byType;
  }, [recentReadings]);

  // Context value
  const value = useMemo(() => ({
    // State
    recentReadings,
    todayReading,
    isLoading,
    error,

    // Actions
    saveReading,
    getReading,
    refresh: loadReadings,

    // Computed
    hasReadingToday,
    readingsByType,

    // Service access
    divinationService,
  }), [
    recentReadings,
    todayReading,
    isLoading,
    error,
    saveReading,
    getReading,
    loadReadings,
    hasReadingToday,
    readingsByType,
  ]);

  return (
    <DivinationContext.Provider value={value}>
      {children}
    </DivinationContext.Provider>
  );
};

export default DivinationContext;
