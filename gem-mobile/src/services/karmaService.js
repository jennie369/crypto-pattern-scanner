/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KARMA SERVICE
 * Manages karma points, levels, history, and benefits
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KARMA_CACHE_KEY = '@gem_karma_cache';
const KARMA_LEVELS_KEY = '@gem_karma_levels';
const KARMA_ACTIONS_KEY = '@gem_karma_actions';

// Karma level thresholds (fallback if DB not available)
export const KARMA_LEVEL_THRESHOLDS = {
  novice: { min: 0, max: 199, name: 'Tập sự', icon: 'UserX', color: '#6B7280' },
  student: { min: 200, max: 499, name: 'Học viên', icon: 'GraduationCap', color: '#3B82F6' },
  warrior: { min: 500, max: 799, name: 'Chiến binh', icon: 'Sword', color: '#F59E0B' },
  master: { min: 800, max: 999, name: 'Bậc thầy', icon: 'Crown', color: '#8B5CF6' },
  guardian: { min: 1000, max: 9999, name: 'Bảo hộ', icon: 'Shield', color: '#FFD700' },
};

// Level order for comparison
const LEVEL_ORDER = ['novice', 'student', 'warrior', 'master', 'guardian'];

class KarmaService {
  // Cache
  cachedKarma = null;
  cachedLevels = null;
  cachedActions = null;
  lastFetch = null;

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Initialize service - load cached data
   */
  async initialize() {
    try {
      // Load levels and actions config
      await this.loadLevelsConfig();
      await this.loadActionsConfig();

      // Load cached karma
      const cached = await AsyncStorage.getItem(KARMA_CACHE_KEY);
      if (cached) {
        this.cachedKarma = JSON.parse(cached);
      }

      console.log('[KarmaService] Initialized');
    } catch (error) {
      console.error('[KarmaService] Initialize error:', error);
    }
  }

  /**
   * Load karma levels config from DB or cache
   */
  async loadLevelsConfig() {
    try {
      // Try cache first
      const cached = await AsyncStorage.getItem(KARMA_LEVELS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) { // 24h cache
          this.cachedLevels = parsed.data;
          return this.cachedLevels;
        }
      }

      // Fetch from DB
      const { data, error } = await supabase
        .from('karma_levels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      this.cachedLevels = data || [];

      // Cache
      await AsyncStorage.setItem(KARMA_LEVELS_KEY, JSON.stringify({
        data: this.cachedLevels,
        timestamp: Date.now(),
      }));

      return this.cachedLevels;
    } catch (error) {
      console.error('[KarmaService] Load levels error:', error);
      // Fallback to hardcoded
      this.cachedLevels = Object.entries(KARMA_LEVEL_THRESHOLDS).map(([id, level]) => ({
        id,
        name_vi: level.name,
        min_karma: level.min,
        max_karma: level.max,
        icon: level.icon,
        color: level.color,
      }));
      return this.cachedLevels;
    }
  }

  /**
   * Load karma actions config from DB or cache
   */
  async loadActionsConfig() {
    try {
      const cached = await AsyncStorage.getItem(KARMA_ACTIONS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          this.cachedActions = parsed.data;
          return this.cachedActions;
        }
      }

      const { data, error } = await supabase
        .from('karma_actions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      this.cachedActions = data || [];

      await AsyncStorage.setItem(KARMA_ACTIONS_KEY, JSON.stringify({
        data: this.cachedActions,
        timestamp: Date.now(),
      }));

      return this.cachedActions;
    } catch (error) {
      console.error('[KarmaService] Load actions error:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET KARMA
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get current user's karma with full level info
   */
  async getUserKarma(userId, forceRefresh = false) {
    try {
      if (!userId) {
        console.warn('[KarmaService] getUserKarma: No userId provided');
        return { success: false, error: 'No user ID' };
      }

      // Return cache if fresh (< 30 seconds)
      if (!forceRefresh && this.cachedKarma && this.lastFetch) {
        if (Date.now() - this.lastFetch < 30000) {
          return { success: true, data: this.cachedKarma };
        }
      }

      // Fetch from RPC
      const { data, error } = await supabase.rpc('get_user_karma_full', {
        p_user_id: userId,
      });

      if (error) throw error;

      // Enrich with level info
      const karma = {
        ...data,
        progress: this.calculateLevelProgress(data?.karma_points ?? 200, data?.karma_level || 'student'),
        nextLevel: this.getNextLevel(data?.karma_level || 'student'),
        pointsToNextLevel: this.getPointsToNextLevel(data?.karma_points ?? 200, data?.karma_level || 'student'),
      };

      // Cache
      this.cachedKarma = karma;
      this.lastFetch = Date.now();
      await AsyncStorage.setItem(KARMA_CACHE_KEY, JSON.stringify(karma));

      return { success: true, data: karma };
    } catch (error) {
      console.error('[KarmaService] Get karma error:', error);

      // Return cached if available
      if (this.cachedKarma) {
        return { success: true, data: this.cachedKarma, fromCache: true };
      }

      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Get karma leaderboard
   */
  async getLeaderboard(limit = 20) {
    try {
      const { data, error } = await supabase.rpc('get_karma_leaderboard', {
        p_limit: limit,
      });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('[KarmaService] Leaderboard error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  /**
   * Get karma history for user
   */
  async getKarmaHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, actionType = null } = options;

      let query = supabase
        .from('karma_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[KarmaService] History error:', error);
      return { success: false, error: error?.message || 'Unknown error', data: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UPDATE KARMA
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Update user karma (main method)
   */
  async updateKarma(userId, change, actionType, options = {}) {
    try {
      const {
        actionDetail = null,
        tradeId = null,
        aiInteractionId = null,
        metadata = {}
      } = options;

      const { data, error } = await supabase.rpc('update_user_karma', {
        p_user_id: userId,
        p_change: change,
        p_action_type: actionType,
        p_action_detail: actionDetail,
        p_trade_id: tradeId,
        p_ai_interaction_id: aiInteractionId,
        p_metadata: metadata,
      });

      if (error) throw error;

      // Invalidate cache
      this.cachedKarma = null;
      this.lastFetch = null;

      // Refresh karma
      await this.getUserKarma(userId, true);

      return { success: true, data };
    } catch (error) {
      console.error('[KarmaService] Update karma error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Award karma for specific action
   */
  async awardKarma(userId, actionId, options = {}) {
    try {
      // Find action config
      const action = this.cachedActions?.find(a => a.id === actionId);

      if (!action) {
        console.warn('[KarmaService] Action not found:', actionId);
        return { success: false, error: 'Action not found' };
      }

      // Check daily limit
      if (action.daily_limit) {
        const todayCount = await this.getActionCountToday(userId, actionId);
        if (todayCount >= action.daily_limit) {
          console.log('[KarmaService] Daily limit reached for:', actionId);
          return { success: false, error: 'Daily limit reached', limitReached: true };
        }
      }

      return await this.updateKarma(userId, action.karma_change, actionId, {
        actionDetail: action.name_vi,
        ...options,
      });
    } catch (error) {
      console.error('[KarmaService] Award karma error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Get count of specific action today
   */
  async getActionCountToday(userId, actionType) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { count, error } = await supabase
        .from('karma_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', actionType)
        .gte('created_at', `${today}T00:00:00Z`);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[KarmaService] Get action count error:', error);
      return 0;
    }
  }

  /**
   * Update discipline streak
   */
  async updateDisciplineStreak(userId, isDisciplined) {
    try {
      const { data, error } = await supabase.rpc('update_discipline_streak', {
        p_user_id: userId,
        p_is_disciplined: isDisciplined,
      });

      if (error) throw error;

      // If streak bonus earned, update karma
      if (data?.streak_bonus > 0) {
        const streakAction = `win_streak_${data.new_streak}`;
        await this.updateKarma(userId, data.streak_bonus, streakAction, {
          actionDetail: `Chuỗi kỷ luật ${data.new_streak} ngày`,
          metadata: { streak: data.new_streak },
        });
      }

      // If streak broken, apply penalty
      if (data?.streak_broken) {
        await this.updateKarma(userId, -20, 'streak_break', {
          actionDetail: `Mất chuỗi kỷ luật ${data.previous_streak} ngày`,
          metadata: { previous_streak: data.previous_streak },
        });
      }

      // Invalidate cache
      this.cachedKarma = null;
      this.lastFetch = null;

      return { success: true, data };
    } catch (error) {
      console.error('[KarmaService] Update streak error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Increment trades today counter
   */
  async incrementTradesToday(userId) {
    try {
      const { data, error } = await supabase.rpc('increment_trades_today', {
        p_user_id: userId,
      });

      if (error) throw error;

      return { success: true, tradesCount: data };
    } catch (error) {
      console.error('[KarmaService] Increment trades error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LEVEL HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get level from karma points
   */
  getLevelFromPoints(points) {
    const safePoints = points ?? 0;
    if (safePoints >= 1000) return 'guardian';
    if (safePoints >= 800) return 'master';
    if (safePoints >= 500) return 'warrior';
    if (safePoints >= 200) return 'student';
    return 'novice';
  }

  /**
   * Calculate progress within current level (0-100)
   */
  calculateLevelProgress(points, currentLevel) {
    const safePoints = points ?? 0;
    const thresholds = KARMA_LEVEL_THRESHOLDS[currentLevel];
    if (!thresholds) return 0;

    const min = thresholds.min;
    const max = thresholds.max;

    if (currentLevel === 'guardian') {
      // Guardian has no max, show points above 1000
      return Math.min(100, ((safePoints - 1000) / 500) * 100);
    }

    const range = max - min + 1;
    const progress = ((safePoints - min) / range) * 100;

    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Get next level info
   */
  getNextLevel(currentLevel) {
    const currentIndex = LEVEL_ORDER.indexOf(currentLevel);

    if (currentIndex >= LEVEL_ORDER.length - 1) {
      return null; // Already at max
    }

    const nextLevelId = LEVEL_ORDER[currentIndex + 1];
    return {
      id: nextLevelId,
      ...KARMA_LEVEL_THRESHOLDS[nextLevelId],
    };
  }

  /**
   * Get points needed to reach next level
   */
  getPointsToNextLevel(points, currentLevel) {
    const safePoints = points ?? 0;
    const nextLevel = this.getNextLevel(currentLevel);
    if (!nextLevel) return 0;

    return Math.max(0, nextLevel.min - safePoints);
  }

  /**
   * Get level info
   */
  getLevelInfo(levelId) {
    const cached = this.cachedLevels?.find(l => l.id === levelId);
    if (cached) return cached;

    const fallback = KARMA_LEVEL_THRESHOLDS[levelId];
    if (fallback) {
      return {
        id: levelId,
        name_vi: fallback.name,
        min_karma: fallback.min,
        max_karma: fallback.max,
        icon: fallback.icon,
        color: fallback.color,
      };
    }

    return null;
  }

  /**
   * Get all levels
   */
  getAllLevels() {
    if (this.cachedLevels?.length > 0) {
      return this.cachedLevels;
    }

    return Object.entries(KARMA_LEVEL_THRESHOLDS).map(([id, level]) => ({
      id,
      name_vi: level.name,
      min_karma: level.min,
      max_karma: level.max,
      icon: level.icon,
      color: level.color,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BENEFITS & RESTRICTIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Check if user has access to a feature
   */
  hasFeatureAccess(karma, featureKey) {
    const benefits = karma?.benefits || {};

    switch (featureKey) {
      case 'vip_group':
        return benefits.vip_group === true;
      case 'group_chat':
        return benefits.group_chat === true;
      case 'daily_signals':
        return benefits.daily_signals === -1 || (benefits.daily_signals || 0) > 0;
      case 'private_mentorship':
        return benefits.private_mentorship === true;
      case 'can_mentor':
        return benefits.can_mentor === true;
      case 'secret_course':
        return benefits.secret_course === true;
      default:
        return false;
    }
  }

  /**
   * Get daily signals limit
   */
  getDailySignalsLimit(karma) {
    const signals = karma?.benefits?.daily_signals;
    if (signals === -1) return Infinity;
    return signals || 0;
  }

  /**
   * Get daily trade limit
   */
  getDailyTradeLimit(karma) {
    return karma?.daily_trade_limit || null; // null = unlimited
  }

  /**
   * Get AI monitoring level
   */
  getAIMonitoringLevel(karma) {
    return karma?.ai_monitoring || 'normal';
  }

  /**
   * Check if account is frozen
   */
  isAccountFrozen(karma) {
    if (!karma?.is_frozen) return false;

    // Check if frozen_until has passed
    if (karma.frozen_until) {
      return new Date(karma.frozen_until) > new Date();
    }

    return karma.is_frozen;
  }

  /**
   * Check if user can trade today
   */
  canTradeToday(karma) {
    const limit = this.getDailyTradeLimit(karma);
    if (!limit) return true; // No limit

    const tradesToday = karma?.trades_today ?? 0;
    return tradesToday < limit;
  }

  /**
   * Get remaining trades today
   */
  getRemainingTrades(karma) {
    const limit = this.getDailyTradeLimit(karma);
    if (!limit) return Infinity;

    const tradesToday = karma?.trades_today ?? 0;
    return Math.max(0, limit - tradesToday);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FORMATTING HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Format karma points with K/M suffix
   */
  formatKarmaPoints(points) {
    const safePoints = points ?? 0;
    if (safePoints >= 1000) {
      return `${(safePoints / 1000).toFixed(1)}K`;
    }
    return safePoints.toString();
  }

  /**
   * Get relative time string
   */
  getRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Clear cache (for logout)
   */
  async clearCache() {
    this.cachedKarma = null;
    this.cachedLevels = null;
    this.cachedActions = null;
    this.lastFetch = null;

    await AsyncStorage.multiRemove([KARMA_CACHE_KEY, KARMA_LEVELS_KEY, KARMA_ACTIONS_KEY]);
    console.log('[KarmaService] Cache cleared');
  }
}

export default new KarmaService();
