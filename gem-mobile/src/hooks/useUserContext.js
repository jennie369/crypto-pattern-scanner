// src/hooks/useUserContext.js
// ============================================================
// USER CONTEXT HOOK
// Manage user context for AI personalization
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import userContextService from '../services/userContextService';

const HOOK_NAME = '[useUserContext]';

/**
 * Hook to manage user context for AI
 * @param {string} userId - User ID
 * @param {object} options - Configuration options
 * @returns {object} - Context state and handlers
 */
export const useUserContext = (userId, options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // Refresh every 5 minutes
  } = options;

  const [context, setContext] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tierInfo, setTierInfo] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Fetch all user context data
  const fetchContext = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      console.log(HOOK_NAME, 'No userId, skipping fetch');
      return;
    }

    console.log(HOOK_NAME, 'Fetching context for user:', userId, 'force:', forceRefresh);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [contextString, profileData, tierData, insightsData] = await Promise.all([
        userContextService.getCachedUserContext(userId, forceRefresh),
        userContextService.getUserBasicProfile(userId),
        userContextService.getUserTierInfo(userId),
        userContextService.getUserInsights(userId),
      ]);

      if (!mountedRef.current) return;

      setContext(contextString);
      setProfile(profileData);
      setTierInfo(tierData);
      setInsights(insightsData || []);
      setLastRefreshed(new Date());

      console.log(HOOK_NAME, 'Context fetched successfully');
    } catch (err) {
      console.error(HOOK_NAME, 'Error fetching context:', err.message);
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  // Force refresh context
  const refresh = useCallback(async () => {
    console.log(HOOK_NAME, 'Force refresh context');
    await userContextService.invalidateUserContextCache(userId);
    await fetchContext(true);
  }, [userId, fetchContext]);

  // Save insight
  const saveInsight = useCallback(async (insight) => {
    if (!userId || !insight) {
      console.warn(HOOK_NAME, 'Cannot save insight - missing data');
      return false;
    }

    console.log(HOOK_NAME, 'Saving insight:', insight.type);

    try {
      const success = await userContextService.saveUserInsight(userId, insight);

      if (success && mountedRef.current) {
        // Refresh insights
        const newInsights = await userContextService.getUserInsights(userId);
        setInsights(newInsights || []);
      }

      return success;
    } catch (err) {
      console.error(HOOK_NAME, 'Error saving insight:', err.message);
      return false;
    }
  }, [userId]);

  // Save conversation topic
  const saveTopic = useCallback(async (topicData) => {
    if (!userId || !topicData) {
      console.warn(HOOK_NAME, 'Cannot save topic - missing data');
      return false;
    }

    console.log(HOOK_NAME, 'Saving topic:', topicData.topic);

    try {
      return await userContextService.saveConversationTopic(userId, topicData);
    } catch (err) {
      console.error(HOOK_NAME, 'Error saving topic:', err.message);
      return false;
    }
  }, [userId]);

  // Get context string for AI prompt
  const getContextForPrompt = useCallback(() => {
    return context || '**USER CONTEXT:** Không có thông tin user.';
  }, [context]);

  // Initial fetch and interval setup
  useEffect(() => {
    mountedRef.current = true;

    if (userId) {
      // Initial fetch
      fetchContext();

      // Set up auto-refresh interval
      if (autoRefresh && refreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchContext(false);
        }, refreshInterval);
      }
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, autoRefresh, refreshInterval]);

  return {
    // State
    context,
    profile,
    tierInfo,
    insights,
    isLoading,
    lastRefreshed,
    error,

    // Computed
    userName: profile?.preferred_name || 'bạn',
    userTier: tierInfo?.scanner_tier || 'FREE',
    chatbotTier: tierInfo?.chatbot_tier || 'FREE',
    isPremium: tierInfo?.is_premium || false,
    transformationDays: profile?.transformation_days || 0,

    // Actions
    refresh,
    saveInsight,
    saveTopic,
    getContextForPrompt,
  };
};

export default useUserContext;
