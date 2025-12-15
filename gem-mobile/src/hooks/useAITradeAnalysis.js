/**
 * useAITradeAnalysis - Hook for AI Sư Phụ trade analysis
 * Analyzes trades before/after execution, manages blocking state
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Vibration } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import gemMasterAIService, { AI_MOODS } from '../services/gemMasterAIService';
import karmaService from '../services/karmaService';

const useAITradeAnalysis = () => {
  const { user } = useAuth();

  // AI State
  const [aiState, setAIState] = useState({
    mood: 'calm',
    message: null,
    isBlocked: false,
    blockInfo: null,
    requireUnlock: false,
    showMessage: false,
    scenario: null,
    unlockOptions: [],
  });

  // Loading states
  const [analyzing, setAnalyzing] = useState(false);

  // Track original SL for detecting modifications
  const originalSLRef = useRef(null);

  // Load initial block status
  useEffect(() => {
    if (user?.id) {
      checkBlockStatus();
    }
  }, [user?.id]);

  // Check if user is currently blocked
  const checkBlockStatus = useCallback(async () => {
    try {
      if (!user?.id) return;

      const blockInfo = await gemMasterAIService.checkUserBlocked(user.id);
      if (blockInfo?.blocked) {
        setAIState(prev => ({
          ...prev,
          isBlocked: true,
          blockInfo,
          mood: 'warning',
          message: blockInfo.message || 'Bạn đang bị khóa giao dịch',
          requireUnlock: blockInfo.require_unlock,
          unlockOptions: gemMasterAIService.getUnlockOptions(blockInfo.reason),
        }));
      }
    } catch (error) {
      console.error('[useAITradeAnalysis] Check block error:', error);
    }
  }, [user?.id]);

  /**
   * Analyze trade BEFORE execution
   * Returns { allowed, reason, message, mood }
   */
  const analyzeBeforeTrade = useCallback(async (trade, context = {}) => {
    if (!user?.id) {
      return { allowed: true, reason: null, message: null, mood: 'calm' };
    }

    setAnalyzing(true);

    try {
      // Store original SL for tracking
      originalSLRef.current = trade.stopLoss;

      // Call AI service to analyze
      const result = await gemMasterAIService.analyzeBeforeTrade(user.id, trade, context);

      if (!result.allowed) {
        // Trigger vibration based on mood
        const moodConfig = AI_MOODS[result.mood] || AI_MOODS.warning;
        if (moodConfig.vibration) {
          Vibration.vibrate(moodConfig.vibration);
        }

        setAIState({
          mood: result.mood,
          message: result.message,
          isBlocked: result.blocked || false,
          blockInfo: result.blockInfo || null,
          requireUnlock: result.requireUnlock || false,
          showMessage: true,
          scenario: result.scenario,
          unlockOptions: result.unlockOptions || [],
        });
      } else {
        // Trade allowed - calm mood
        setAIState(prev => ({
          ...prev,
          mood: 'calm',
          message: null,
          showMessage: false,
          scenario: null,
        }));
      }

      return result;
    } catch (error) {
      console.error('[useAITradeAnalysis] Analyze before error:', error);
      // Allow trade on error to not block user
      return { allowed: true, reason: null, message: null, mood: 'calm' };
    } finally {
      setAnalyzing(false);
    }
  }, [user?.id]);

  /**
   * Analyze trade AFTER execution
   * Updates karma based on trade discipline
   */
  const analyzeAfterTrade = useCallback(async (trade, context = {}) => {
    if (!user?.id) return;

    try {
      const result = await gemMasterAIService.analyzeAfterTrade(user.id, trade, context);

      if (result.karmaChange) {
        // Update mood based on karma change
        const newMood = result.karmaChange > 0 ? 'proud' : 'warning';

        setAIState(prev => ({
          ...prev,
          mood: newMood,
          message: result.message || null,
          showMessage: !!result.message,
        }));
      }

      return result;
    } catch (error) {
      console.error('[useAITradeAnalysis] Analyze after error:', error);
    }
  }, [user?.id]);

  /**
   * Track SL changes during trade setup
   * Detects if user moves SL wider (against discipline)
   */
  const trackSLChange = useCallback((newSL, direction = 'LONG') => {
    if (!originalSLRef.current) return { violation: false };

    const originalSL = originalSLRef.current;

    // Check if SL was moved wider (more room for loss)
    let isWider = false;

    if (direction === 'LONG') {
      // For LONG, SL below entry - wider means lower SL
      isWider = newSL < originalSL;
    } else {
      // For SHORT, SL above entry - wider means higher SL
      isWider = newSL > originalSL;
    }

    if (isWider) {
      setAIState(prev => ({
        ...prev,
        mood: 'warning',
        message: 'Sư Phụ thấy bạn đang dời Stoploss ra xa. Đây là dấu hiệu của việc không chấp nhận thua cuộc. Hãy cân nhắc kỹ!',
        showMessage: true,
        scenario: 'sl_moved_wider',
      }));

      return { violation: true, type: 'sl_moved_wider' };
    }

    return { violation: false };
  }, []);

  /**
   * Dismiss AI message
   */
  const dismissMessage = useCallback(() => {
    setAIState(prev => ({
      ...prev,
      showMessage: false,
      message: null,
    }));
  }, []);

  /**
   * Complete unlock action
   */
  const completeUnlock = useCallback(async (unlockId, karmaBonus = 0) => {
    if (!user?.id || !aiState.blockInfo) return;

    try {
      setAnalyzing(true);

      // Call service to unlock
      await gemMasterAIService.unlockUser(user.id, unlockId);

      // Award karma bonus if applicable
      if (karmaBonus > 0) {
        await karmaService.updateKarma(user.id, karmaBonus, `unlock_${unlockId}`, {
          detail: `Mở khóa qua ${unlockId}`,
        });
      }

      // Reset state
      setAIState({
        mood: 'proud',
        message: 'Chúc mừng! Bạn đã mở khóa thành công. Hãy giao dịch kỷ luật nhé!',
        isBlocked: false,
        blockInfo: null,
        requireUnlock: false,
        showMessage: true,
        scenario: null,
        unlockOptions: [],
      });

      return { success: true };
    } catch (error) {
      console.error('[useAITradeAnalysis] Unlock error:', error);
      return { success: false, error: error.message };
    } finally {
      setAnalyzing(false);
    }
  }, [user?.id, aiState.blockInfo]);

  /**
   * Get current AI mood color
   */
  const getMoodColor = useCallback(() => {
    return AI_MOODS[aiState.mood]?.color || AI_MOODS.calm.color;
  }, [aiState.mood]);

  /**
   * Get mood animation type
   */
  const getMoodAnimation = useCallback(() => {
    return AI_MOODS[aiState.mood]?.animation || 'pulse_slow';
  }, [aiState.mood]);

  return {
    // State
    aiState,
    analyzing,

    // Methods
    analyzeBeforeTrade,
    analyzeAfterTrade,
    trackSLChange,
    dismissMessage,
    completeUnlock,
    checkBlockStatus,

    // Helpers
    getMoodColor,
    getMoodAnimation,
  };
};

export default useAITradeAnalysis;
