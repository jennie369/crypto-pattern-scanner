/**
 * useTemplateSettings Hook
 * Manages user template preferences and settings
 *
 * Created: 2026-02-02
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getOrCreateTemplateSettings,
  updateTemplateSettings,
} from '../services/templates/journalRoutingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CACHE_KEY = 'gem_template_settings_cache';

/**
 * useTemplateSettings Hook
 * @param {string} userId - User ID
 * @returns {Object} - Settings and actions
 */
export const useTemplateSettings = (userId) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default settings
  const defaultSettings = {
    favorite_templates: [],
    last_used_template: null,
    default_life_area: 'personal',
    show_tooltips: true,
    last_think_day_date: null,
  };

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!userId) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try local cache first
      const cached = await AsyncStorage.getItem(`${LOCAL_CACHE_KEY}_${userId}`);
      if (cached) {
        setSettings(JSON.parse(cached));
      }

      // Fetch from server
      const serverSettings = await getOrCreateTemplateSettings(userId);
      if (serverSettings) {
        setSettings(serverSettings);
        // Update cache
        await AsyncStorage.setItem(
          `${LOCAL_CACHE_KEY}_${userId}`,
          JSON.stringify(serverSettings)
        );
      }
    } catch (err) {
      console.error('[useTemplateSettings] Load error:', err);
      setError(err.message);
      // Use default if failed
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update settings
  const updateSettings = useCallback(async (updates) => {
    if (!userId) return { success: false };

    try {
      // Optimistic update
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Save to cache
      await AsyncStorage.setItem(
        `${LOCAL_CACHE_KEY}_${userId}`,
        JSON.stringify(newSettings)
      );

      // Save to server
      const result = await updateTemplateSettings(userId, updates);

      if (!result.success) {
        // Rollback on failure
        await loadSettings();
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('[useTemplateSettings] Update error:', err);
      // Rollback
      await loadSettings();
      return { success: false, error: err.message };
    }
  }, [userId, settings, loadSettings]);

  // Toggle favorite template
  const toggleFavorite = useCallback(async (templateId) => {
    const currentFavorites = settings?.favorite_templates || [];
    const isFavorite = currentFavorites.includes(templateId);

    const newFavorites = isFavorite
      ? currentFavorites.filter((id) => id !== templateId)
      : [...currentFavorites, templateId];

    return updateSettings({ favorite_templates: newFavorites });
  }, [settings, updateSettings]);

  // Set last used template
  const setLastUsedTemplate = useCallback(async (templateId) => {
    return updateSettings({ last_used_template: templateId });
  }, [updateSettings]);

  // Set default life area
  const setDefaultLifeArea = useCallback(async (lifeArea) => {
    return updateSettings({ default_life_area: lifeArea });
  }, [updateSettings]);

  // Toggle tooltips
  const toggleTooltips = useCallback(async () => {
    return updateSettings({ show_tooltips: !settings?.show_tooltips });
  }, [settings, updateSettings]);

  // Record Think Day usage
  const recordThinkDay = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return updateSettings({ last_think_day_date: today });
  }, [updateSettings]);

  // Check if should show Think Day prompt
  const shouldShowThinkDayPrompt = useCallback(() => {
    if (!settings?.last_think_day_date) return true;

    const lastDate = new Date(settings.last_think_day_date);
    const today = new Date();
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    // Prompt if more than 7 days since last Think Day
    return daysSince >= 7;
  }, [settings]);

  // Check if template is favorite
  const isFavorite = useCallback((templateId) => {
    return settings?.favorite_templates?.includes(templateId) || false;
  }, [settings]);

  return {
    // State
    settings: settings || defaultSettings,
    isLoading,
    error,

    // Getters
    favoriteTemplates: settings?.favorite_templates || [],
    lastUsedTemplate: settings?.last_used_template,
    defaultLifeArea: settings?.default_life_area || 'personal',
    showTooltips: settings?.show_tooltips !== false,
    lastThinkDayDate: settings?.last_think_day_date,

    // Actions
    updateSettings,
    toggleFavorite,
    setLastUsedTemplate,
    setDefaultLifeArea,
    toggleTooltips,
    recordThinkDay,

    // Helpers
    isFavorite,
    shouldShowThinkDayPrompt,
    refresh: loadSettings,
  };
};

/**
 * useTemplateUsageStats Hook
 * Tracks template usage statistics
 */
export const useTemplateUsageStats = (userId) => {
  const [stats, setStats] = useState({
    totalJournals: 0,
    totalGoals: 0,
    templateUsage: {},
    recentTemplates: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { supabase } = require('../services/supabase');

      // Get journal count by template
      const { data: journals, error: journalError } = await supabase
        .from('calendar_journal_entries')
        .select('template_id')
        .eq('user_id', userId)
        .not('template_id', 'is', null);

      if (journalError) throw journalError;

      // Get goals created from templates
      const { data: goals, error: goalError } = await supabase
        .from('vision_goals')
        .select('created_from_template')
        .eq('user_id', userId)
        .not('created_from_template', 'is', null);

      if (goalError) throw goalError;

      // Calculate template usage
      const templateUsage = {};
      journals?.forEach((j) => {
        const tid = j.template_id;
        templateUsage[tid] = (templateUsage[tid] || 0) + 1;
      });

      // Get recent templates
      const { data: recent } = await supabase
        .from('calendar_journal_entries')
        .select('template_id, created_at')
        .eq('user_id', userId)
        .not('template_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentTemplates = [...new Set(recent?.map((r) => r.template_id) || [])];

      setStats({
        totalJournals: journals?.length || 0,
        totalGoals: goals?.length || 0,
        templateUsage,
        recentTemplates,
      });
    } catch (err) {
      console.error('[useTemplateUsageStats] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getMostUsedTemplate = useCallback(() => {
    const { templateUsage } = stats;
    if (Object.keys(templateUsage).length === 0) return null;

    return Object.entries(templateUsage).reduce(
      (max, [templateId, count]) => (count > max.count ? { templateId, count } : max),
      { templateId: null, count: 0 }
    );
  }, [stats]);

  return {
    ...stats,
    isLoading,
    getMostUsedTemplate,
    refresh: loadStats,
  };
};

export default useTemplateSettings;
