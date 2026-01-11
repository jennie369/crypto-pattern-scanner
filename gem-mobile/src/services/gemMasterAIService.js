/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEM MASTER AI SERVICE
 * AI Sư Phụ - Trade analysis, warnings, blocking
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from './supabase';
import { Vibration, Platform } from 'react-native';
import karmaService from './karmaService';

// AI Mood configurations
export const AI_MOODS = {
  calm: {
    id: 'calm',
    color: '#00D9FF', // Cyan blue
    animation: 'pulse_slow',
    vibration: null,
    intensity: 0.3,
  },
  warning: {
    id: 'warning',
    color: '#FF6B6B', // Light red
    animation: 'pulse_fast',
    vibration: [100, 50, 100],
    intensity: 0.6,
  },
  angry: {
    id: 'angry',
    color: '#DC2626', // Dark red
    animation: 'shake',
    vibration: [200, 100, 200, 100, 200],
    intensity: 0.9,
  },
  proud: {
    id: 'proud',
    color: '#FFD700', // Gold
    animation: 'glow',
    vibration: [50],
    intensity: 0.5,
  },
  silent: {
    id: 'silent',
    color: '#4A4A4A', // Gray
    animation: 'fade',
    vibration: null,
    intensity: 0.1,
  },
};

// Scenario types
export const SCENARIO_TYPES = {
  FOMO_BUY: 'fomo_buy_overbought',
  FOMO_RETRY: 'fomo_retry_penalty',
  REVENGE_TRADE: 'revenge_trade_block',
  NO_STOPLOSS: 'no_stoploss',
  SL_MOVED_WIDER: 'sl_moved_wider',
  BIG_WIN: 'win_big_caution',
  DISCIPLINE_WIN: 'discipline_win',
  DISCIPLINE_LOSS: 'discipline_loss',
  ACCOUNT_FROZEN: 'account_frozen',
  OVERTRADE: 'overtrade_warning',
  STREAK_BROKEN: 'streak_broken',
};

// Unlock options for blocked users
// AI Sư Phụ tone: NGẮN GỌN - ĐANH THÉP - CÓ TÍNH GIÁO DỤC
export const UNLOCK_OPTIONS = [
  {
    id: 'meditation',
    label: 'Thiền định 5 phút',
    description: 'Tĩnh tâm. Hơi thở điều hòa tâm trí.',
    duration: 5, // minutes
    karmaBonus: 5,
    icon: 'Brain',
  },
  {
    id: 'journal',
    label: 'Viết nhật ký giao dịch',
    description: 'Phân tích sai lầm. Không nhận ra lỗi thì sẽ lặp lại.',
    duration: 10,
    karmaBonus: 10,
    icon: 'BookOpen',
  },
  {
    id: 'rest',
    label: 'Nghỉ ngơi 15 phút',
    description: 'Rời khỏi màn hình. Chiến binh cần thời gian hồi phục.',
    duration: 15,
    karmaBonus: 0,
    icon: 'Coffee',
  },
  {
    id: 'wait',
    label: 'Chờ hết thời gian khóa',
    description: 'Kiên nhẫn. Thời gian là bài học.',
    duration: null, // Uses block duration
    karmaBonus: 0,
    icon: 'Clock',
  },
];

class GemMasterAIService {
  // Config cache
  scenarioConfigs = {};
  lastConfigFetch = null;

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Initialize service - load configs
   */
  async initialize() {
    try {
      await this.loadScenarioConfigs();
      console.log('[GemMasterAI] Initialized with', Object.keys(this.scenarioConfigs).length, 'scenarios');
    } catch (error) {
      console.error('[GemMasterAI] Initialize error:', error);
    }
  }

  /**
   * Load AI scenario configs from database
   */
  async loadScenarioConfigs() {
    try {
      // Use cache if fresh (< 1 hour)
      if (this.lastConfigFetch && Date.now() - this.lastConfigFetch < 3600000) {
        return this.scenarioConfigs;
      }

      const { data, error } = await supabase
        .from('ai_master_config')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Index by id
      this.scenarioConfigs = (data || []).reduce((acc, config) => {
        acc[config.id] = config;
        return acc;
      }, {});

      this.lastConfigFetch = Date.now();
      return this.scenarioConfigs;
    } catch (error) {
      console.error('[GemMasterAI] Load configs error:', error);
      return {};
    }
  }

  /**
   * Get scenario config by ID
   */
  getScenarioConfig(scenarioId) {
    return this.scenarioConfigs[scenarioId] || null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRADE ANALYSIS - BEFORE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Analyze trade before execution
   * Returns: { allowed, scenario, message, mood, karmaChange, blockDuration, requireUnlock }
   *
   * IMPORTANT: Paid tiers (TIER1, TIER2, TIER3) get softer enforcement:
   * - Daily trade limits: BYPASSED
   * - FOMO/Revenge: WARNING only (not blocked)
   * - No Stoploss: Still blocked (critical safety)
   */
  async analyzeBeforeTrade(userId, trade, context = {}) {
    try {
      const { marketData = {}, userStats = {}, scannerTier = 'FREE' } = context;
      const isPaidUser = scannerTier && scannerTier !== 'FREE';

      // Check if user is already blocked
      const blockStatus = await this.checkUserBlocked(userId);
      if (blockStatus?.blocked) {
        return {
          allowed: false,
          scenario: 'account_blocked',
          message: blockStatus.message || 'Bạn đang bị khóa giao dịch. Hoàn thành bài tập mở khóa hoặc chờ hết thời gian.',
          mood: 'silent',
          blockInfo: blockStatus,
        };
      }

      // Check account frozen (karma = 0)
      const karmaResult = await karmaService.getUserKarma(userId);
      const karma = karmaResult?.data;

      if (karmaService.isAccountFrozen(karma)) {
        const config = this.getScenarioConfig(SCENARIO_TYPES.ACCOUNT_FROZEN);
        return {
          allowed: false,
          scenario: SCENARIO_TYPES.ACCOUNT_FROZEN,
          message: this.formatMessage(config?.message_template || 'Karma về 0. Tài khoản đóng băng. Bạn đã vi phạm quá nhiều quy tắc. Hoàn thành Recovery Quest để khôi phục.', {}),
          mood: 'silent',
          karmaChange: 0,
          requireUnlock: true,
          isFrozen: true,
        };
      }

      // Check daily trade limit - BYPASSED for paid users
      if (!karmaService.canTradeToday(karma, scannerTier)) {
        const limit = karmaService.getDailyTradeLimit(karma, scannerTier);
        return {
          allowed: false,
          scenario: 'daily_limit',
          message: `Đủ rồi. ${limit} lệnh/ngày là giới hạn của level ${karma?.level_name_vi || 'hiện tại'}.\n\nMuốn giao dịch nhiều hơn? Nâng Karma hoặc mua gói Scanner.`,
          mood: 'warning',
        };
      }

      // === SCENARIO CHECKS ===

      // 1. FOMO Check - RSI overbought or big price increase
      const fomoResult = this.checkFOMOConditions(trade, marketData);
      if (fomoResult.triggered) {
        // Paid users: SOFT WARNING only (allowed but warned)
        if (isPaidUser) {
          const config = this.getScenarioConfig(SCENARIO_TYPES.FOMO_BUY);
          return {
            allowed: true, // Allow but warn
            scenario: SCENARIO_TYPES.FOMO_BUY,
            message: config?.message_template?.replace('{rsi}', marketData.rsi?.toFixed(0) || 'N/A') || 'FOMO detected. Cân nhắc kỹ trước khi vào lệnh.',
            mood: 'warning',
            karmaChange: config?.karma_impact || 0,
            softWarning: true, // Flag for UI to show warning but allow
          };
        }
        return await this.handleScenario(userId, SCENARIO_TYPES.FOMO_BUY, {
          trade,
          marketData,
          variables: {
            rsi: marketData.rsi?.toFixed(0) || 'N/A',
            priceChange: marketData.priceChange1h?.toFixed(2) || '0',
          },
        });
      }

      // 2. Revenge Trade Check
      const revengeResult = this.checkRevengeConditions(userStats);
      if (revengeResult.triggered) {
        // Paid users: SOFT WARNING only
        if (isPaidUser) {
          const config = this.getScenarioConfig(SCENARIO_TYPES.REVENGE_TRADE);
          return {
            allowed: true, // Allow but warn
            scenario: SCENARIO_TYPES.REVENGE_TRADE,
            message: `Bạn đang thua ${userStats.loseStreak || 3} lệnh liên tiếp. Tâm trí không ổn định. Cân nhắc nghỉ ngơi.`,
            mood: 'warning',
            karmaChange: config?.karma_impact || 0,
            softWarning: true,
          };
        }
        return await this.handleScenario(userId, SCENARIO_TYPES.REVENGE_TRADE, {
          trade,
          userStats,
          variables: {
            loseStreak: userStats.loseStreak || 3,
          },
        });
      }

      // 3. No Stoploss Check - ALWAYS BLOCKED (critical safety, even for paid users)
      if (!trade?.stopLoss || trade.stopLoss === 0) {
        return await this.handleScenario(userId, SCENARIO_TYPES.NO_STOPLOSS, {
          trade,
        });
      }

      // 4. Overtrade Check - Soft warning for paid users
      const tradesToday = karma?.trades_today ?? 0;
      if (tradesToday >= 10) {
        if (isPaidUser) {
          return {
            allowed: true, // Allow but warn
            scenario: SCENARIO_TYPES.OVERTRADE,
            message: `Bạn đã giao dịch ${tradesToday} lệnh hôm nay. Số lượng không bằng chất lượng.`,
            mood: 'warning',
            softWarning: true,
          };
        }
        return await this.handleScenario(userId, SCENARIO_TYPES.OVERTRADE, {
          variables: {
            tradesCount: tradesToday,
          },
        });
      }

      // All checks passed
      return {
        allowed: true,
        scenario: null,
        message: null,
        mood: 'calm',
      };
    } catch (error) {
      console.error('[GemMasterAI] Analyze before trade error:', error);
      // Allow trade on error to not block user
      return { allowed: true, error: error?.message };
    }
  }

  /**
   * Check FOMO conditions
   */
  checkFOMOConditions(trade, marketData) {
    const rsi = marketData?.rsi ?? 0;
    const priceChange1h = marketData?.priceChange1h ?? 0;
    const direction = trade?.direction?.toUpperCase() || 'LONG';

    // FOMO buy: RSI > 70 or big pump
    if (direction === 'LONG') {
      if (rsi > 70 || priceChange1h > 5) {
        return {
          triggered: true,
          reason: rsi > 70 ? 'RSI overbought' : 'Big price increase',
        };
      }
    }

    // FOMO short: RSI < 30 or big dump
    if (direction === 'SHORT') {
      if (rsi < 30 || priceChange1h < -5) {
        return {
          triggered: true,
          reason: rsi < 30 ? 'RSI oversold' : 'Big price drop',
        };
      }
    }

    return { triggered: false };
  }

  /**
   * Check Revenge Trade conditions
   */
  checkRevengeConditions(userStats) {
    const loseStreak = userStats?.loseStreak ?? 0;
    const sizeIncreased = userStats?.sizeIncreased ?? false;
    const lastTradeTime = userStats?.lastTradeTime;

    // 3+ consecutive losses
    if (loseStreak >= 3) {
      return {
        triggered: true,
        reason: `${loseStreak} consecutive losses`,
      };
    }

    // Position size increased after loss
    if (sizeIncreased && loseStreak >= 1) {
      return {
        triggered: true,
        reason: 'Increased size after loss',
      };
    }

    // Trading too quickly after loss (< 5 min)
    if (lastTradeTime && userStats?.lastResult === 'loss') {
      const timeSinceLoss = Date.now() - new Date(lastTradeTime).getTime();
      if (timeSinceLoss < 5 * 60 * 1000) { // 5 minutes
        return {
          triggered: true,
          reason: 'Trading too quickly after loss',
        };
      }
    }

    return { triggered: false };
  }

  /**
   * Handle scenario - create message, block if needed, log interaction
   */
  async handleScenario(userId, scenarioId, context = {}) {
    try {
      const config = this.getScenarioConfig(scenarioId);
      if (!config) {
        console.warn('[GemMasterAI] Scenario not found:', scenarioId);
        return { allowed: true };
      }

      const { variables = {}, trade = null } = context;

      // Format message with variables
      const message = this.formatMessage(config.message_template, variables);

      // Create interaction log
      const interactionId = await this.logInteraction(userId, scenarioId, {
        message,
        mood: config.mood,
        tradeId: trade?.id,
        triggerConditions: variables,
        karmaChange: config.karma_impact,
      });

      // Block user if needed
      if (config.block_trade) {
        await this.blockUser(userId, scenarioId, {
          duration: config.block_duration_minutes,
          requireUnlock: config.require_unlock,
          interactionId,
        });
      }

      // Apply karma penalty
      if (config.karma_impact !== 0) {
        await karmaService.updateKarma(userId, config.karma_impact, scenarioId, {
          aiInteractionId: interactionId,
          tradeId: trade?.id,
        });
      }

      // Trigger vibration
      this.triggerVibration(config.mood);

      return {
        allowed: false,
        scenario: scenarioId,
        message,
        mood: config.mood,
        karmaChange: config.karma_impact,
        blockDuration: config.block_duration_minutes,
        requireUnlock: config.require_unlock,
        interactionId,
      };
    } catch (error) {
      console.error('[GemMasterAI] Handle scenario error:', error);
      return { allowed: true, error: error?.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRADE ANALYSIS - AFTER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Analyze trade after completion
   */
  async analyzeAfterTrade(userId, trade, context = {}) {
    try {
      const { originalSL = null, slMoved = false } = context;

      const isWin = trade?.result === 'win' || (trade?.realizedPnL ?? 0) > 0;
      const hasSL = !!trade?.stopLoss && trade.stopLoss !== 0;
      const riskReward = trade?.riskRewardRatio ?? 0;

      // Check if SL was moved wider (bad behavior)
      if (slMoved && originalSL) {
        return await this.handleScenario(userId, SCENARIO_TYPES.SL_MOVED_WIDER, {
          trade,
          variables: {
            originalSL: originalSL?.toFixed(2) || 'N/A',
            newSL: trade?.stopLoss?.toFixed(2) || 'N/A',
          },
        });
      }

      // Disciplined trade - win
      if (isWin && hasSL && !slMoved) {
        const config = this.getScenarioConfig(SCENARIO_TYPES.DISCIPLINE_WIN);
        const message = this.formatMessage(config?.message_template || '', {
          riskReward: riskReward?.toFixed(2) || 'N/A',
        });

        await this.logInteraction(userId, SCENARIO_TYPES.DISCIPLINE_WIN, {
          message,
          mood: 'proud',
          tradeId: trade?.id,
          karmaChange: config?.karma_impact || 25,
        });

        await karmaService.updateKarma(userId, config?.karma_impact || 25, SCENARIO_TYPES.DISCIPLINE_WIN, {
          tradeId: trade?.id,
          actionDetail: 'Thắng có kỷ luật',
        });

        await karmaService.updateDisciplineStreak(userId, true);

        return {
          scenario: SCENARIO_TYPES.DISCIPLINE_WIN,
          message,
          mood: 'proud',
          karmaChange: config?.karma_impact || 25,
        };
      }

      // Disciplined trade - loss (still good!)
      if (!isWin && hasSL && !slMoved) {
        const config = this.getScenarioConfig(SCENARIO_TYPES.DISCIPLINE_LOSS);
        const message = this.formatMessage(config?.message_template || '', {});

        await this.logInteraction(userId, SCENARIO_TYPES.DISCIPLINE_LOSS, {
          message,
          mood: 'calm',
          tradeId: trade?.id,
          karmaChange: config?.karma_impact || 10,
        });

        await karmaService.updateKarma(userId, config?.karma_impact || 10, SCENARIO_TYPES.DISCIPLINE_LOSS, {
          tradeId: trade?.id,
          actionDetail: 'Thua có kỷ luật - vẫn đúng đường',
        });

        await karmaService.updateDisciplineStreak(userId, true);

        return {
          scenario: SCENARIO_TYPES.DISCIPLINE_LOSS,
          message,
          mood: 'calm',
          karmaChange: config?.karma_impact || 10,
        };
      }

      // Big win caution
      if (isWin && (trade?.realizedPnLPercent ?? 0) > 20) {
        const config = this.getScenarioConfig(SCENARIO_TYPES.BIG_WIN);
        const message = this.formatMessage(config?.message_template || '', {});

        await this.logInteraction(userId, SCENARIO_TYPES.BIG_WIN, {
          message,
          mood: 'calm',
          tradeId: trade?.id,
        });

        return {
          scenario: SCENARIO_TYPES.BIG_WIN,
          message,
          mood: 'calm',
          karmaChange: 0,
        };
      }

      // No specific scenario
      return { scenario: null };
    } catch (error) {
      console.error('[GemMasterAI] Analyze after trade error:', error);
      return { error: error?.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BLOCKING & UNLOCKING
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Check if user is blocked from trading
   */
  async checkUserBlocked(userId) {
    try {
      const { data, error } = await supabase.rpc('is_user_trade_blocked', {
        p_user_id: userId,
      });

      if (error) throw error;

      return data || { blocked: false };
    } catch (error) {
      console.error('[GemMasterAI] Check blocked error:', error);
      return { blocked: false };
    }
  }

  /**
   * Block user from trading
   */
  async blockUser(userId, reason, options = {}) {
    try {
      const { duration = null, requireUnlock = false, interactionId = null } = options;

      const { data, error } = await supabase.rpc('block_user_trading', {
        p_user_id: userId,
        p_reason: reason,
        p_duration_minutes: duration,
        p_interaction_id: interactionId,
      });

      if (error) throw error;

      console.log('[GemMasterAI] User blocked:', userId, reason);
      return { success: true, blockId: data };
    } catch (error) {
      console.error('[GemMasterAI] Block user error:', error);
      return { success: false, error: error?.message };
    }
  }

  /**
   * Unlock user trading
   */
  async unlockUser(userId, unlockMethod) {
    try {
      const { data, error } = await supabase.rpc('unlock_user_trading', {
        p_user_id: userId,
        p_unlock_method: unlockMethod,
      });

      if (error) throw error;

      // Award karma bonus for unlock
      const option = UNLOCK_OPTIONS.find(o => o.id === unlockMethod);
      if (option?.karmaBonus > 0) {
        await karmaService.updateKarma(userId, option.karmaBonus, `unlock_${unlockMethod}`, {
          actionDetail: `Hoàn thành bài tập: ${option.label}`,
        });
      }

      console.log('[GemMasterAI] User unlocked:', userId, unlockMethod);
      return { success: true };
    } catch (error) {
      console.error('[GemMasterAI] Unlock user error:', error);
      return { success: false, error: error?.message };
    }
  }

  /**
   * Get unlock options for user
   */
  getUnlockOptions(blockReason) {
    // All options available for now
    // Could customize based on blockReason
    return UNLOCK_OPTIONS;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGGING & INTERACTION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Log AI interaction
   */
  async logInteraction(userId, scenarioType, data = {}) {
    try {
      const {
        message = '',
        mood = 'calm',
        tradeId = null,
        triggerConditions = {},
        karmaChange = 0,
        karmaReason = null,
      } = data;

      const { data: result, error } = await supabase.rpc('log_ai_interaction', {
        p_user_id: userId,
        p_scenario_type: scenarioType,
        p_ai_message: message,
        p_ai_mood: mood,
        p_trade_id: tradeId,
        p_trigger_conditions: triggerConditions,
        p_karma_change: karmaChange,
        p_karma_reason: karmaReason,
      });

      if (error) throw error;

      return result; // interaction ID
    } catch (error) {
      console.error('[GemMasterAI] Log interaction error:', error);
      return null;
    }
  }

  /**
   * Get recent interactions for user
   */
  async getRecentInteractions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('ai_master_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[GemMasterAI] Get interactions error:', error);
      return { success: false, data: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Format message template with variables
   */
  formatMessage(template, variables = {}) {
    if (!template) return '';

    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? ''));
    });

    return message;
  }

  /**
   * Trigger vibration based on mood
   */
  triggerVibration(mood) {
    if (Platform.OS === 'web') return;

    const moodConfig = AI_MOODS[mood];
    if (moodConfig?.vibration) {
      try {
        Vibration.vibrate(moodConfig.vibration);
      } catch (error) {
        // Vibration not available
      }
    }
  }

  /**
   * Get mood configuration
   */
  getMoodConfig(mood) {
    return AI_MOODS[mood] || AI_MOODS.calm;
  }

  /**
   * Get AI response for general message
   */
  getAIResponse(context) {
    // This could be extended to generate AI responses
    // For now, returns a basic response based on context
    const { mood = 'calm', message = '' } = context;

    return {
      mood,
      message,
      moodConfig: this.getMoodConfig(mood),
    };
  }
}

export default new GemMasterAIService();
