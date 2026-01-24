/**
 * =====================================================
 * GEM - Exchange Affiliate Service
 * =====================================================
 *
 * Service for managing exchange affiliate links, tracking,
 * deposit prompts, and user exchange accounts.
 *
 * Features:
 * - Open affiliate link with tracking
 * - Confirm exchange signup
 * - Track affiliate events
 * - Smart deposit prompts
 * - User exchange accounts management
 * - Admin stats (via service_role)
 *
 * Access:
 * - All tiers: Register via affiliate link
 * - TIER 2+: Connect API (handled by exchangeAPIService)
 *
 * =====================================================
 */

import { supabase } from './supabase';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import constants
import {
  EXCHANGE_CONFIGS,
  EXCHANGE_ACCOUNT_STATUS,
  DEPOSIT_PROMPT_CONFIG,
  DEPOSIT_PROMPT_TYPES,
  AFFILIATE_EVENT_TYPES,
  getExchangeConfig,
  getAllExchanges,
  getAffiliateLink,
  getPromptContent,
  shouldTriggerPatternPrompt,
  shouldTriggerWinStreakPrompt,
} from '../constants/exchangeConfig';

// ========================================
// CONSTANTS
// ========================================

const STORAGE_KEYS = {
  PENDING_SIGNUP: 'gem_pending_exchange_signup',
  LAST_PROMPT_TIME: 'gem_last_deposit_prompt_time',
  PROMPTS_TODAY_COUNT: 'gem_deposit_prompts_today',
};

// ========================================
// EXCHANGE AFFILIATE SERVICE CLASS
// ========================================

class ExchangeAffiliateService {
  constructor() {
    this.cachedExchangeConfigs = null;
    this.configCacheTime = null;
    this.configCacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // ========================================
  // EXCHANGE CONFIG
  // ========================================

  /**
   * Get exchange config from DB with fallback to local
   * @param {string} exchangeId - Exchange ID
   * @returns {Promise<Object>} Exchange config
   */
  async getExchangeConfig(exchangeId) {
    try {
      // Try to get from DB
      const { data, error } = await supabase
        .from('exchange_config')
        .select('*')
        .eq('id', exchangeId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log(`[ExchangeAffiliate] Using local config for ${exchangeId}`);
        return getExchangeConfig(exchangeId);
      }

      // Parse JSON fields
      return {
        ...data,
        features: data.features || [],
        depositMethods: data.deposit_methods || [],
        commission: {
          spot: data.commission_rate_spot,
          futures: data.commission_rate_futures,
          userDiscount: data.user_fee_discount,
        },
        isRecommended: data.is_recommended,
        supportsVND: data.supports_vnd,
        apiConnectionEnabled: data.api_connection_enabled,
        minTierForAPI: data.min_tier_for_api,
        displayOrder: data.display_order,
      };
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching config:', error);
      return getExchangeConfig(exchangeId);
    }
  }

  /**
   * Get all active exchanges from DB with fallback
   * @returns {Promise<Array>} Array of exchange configs
   */
  async getAllExchanges() {
    try {
      // Check cache
      if (this.cachedExchangeConfigs && this.configCacheTime) {
        const cacheAge = Date.now() - this.configCacheTime;
        if (cacheAge < this.configCacheDuration) {
          return this.cachedExchangeConfigs;
        }
      }

      const { data, error } = await supabase
        .from('exchange_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data?.length) {
        console.log('[ExchangeAffiliate] Using local exchange configs');
        return getAllExchanges();
      }

      // Transform and cache
      const exchanges = data.map(ex => ({
        ...ex,
        features: ex.features || [],
        depositMethods: ex.deposit_methods || [],
        commission: {
          spot: ex.commission_rate_spot,
          futures: ex.commission_rate_futures,
          userDiscount: ex.user_fee_discount,
        },
        isRecommended: ex.is_recommended,
        supportsVND: ex.supports_vnd,
      }));

      this.cachedExchangeConfigs = exchanges;
      this.configCacheTime = Date.now();

      return exchanges;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching exchanges:', error);
      return getAllExchanges();
    }
  }

  // ========================================
  // AFFILIATE LINK & TRACKING
  // ========================================

  /**
   * Open exchange signup via affiliate link with tracking
   * @param {string} exchangeId - Exchange ID
   * @param {string} source - Source screen
   * @returns {Promise<Object>} Result { success, error }
   */
  async openExchangeSignup(exchangeId, source = 'unknown') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Get affiliate link
      const link = getAffiliateLink(exchangeId, source);
      if (!link) {
        return { success: false, error: 'Exchange not found' };
      }

      // Track event
      if (userId) {
        await this.trackEvent(userId, exchangeId, AFFILIATE_EVENT_TYPES.LINK_CLICKED, source);

        // Create pending account record
        await this.upsertExchangeAccount(userId, exchangeId, {
          status: EXCHANGE_ACCOUNT_STATUS.PENDING_SIGNUP,
          signupSource: source,
        });
      }

      // Save pending signup to AsyncStorage (for resuming if app closes)
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP, JSON.stringify({
        exchangeId,
        source,
        timestamp: Date.now(),
      }));

      // Open link
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) {
        await Linking.openURL(link);
        return { success: true, link };
      } else {
        return { success: false, error: 'Cannot open link', link };
      }
    } catch (error) {
      console.error('[ExchangeAffiliate] Error opening signup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track affiliate event
   * @param {string} userId - User ID
   * @param {string} exchangeId - Exchange ID
   * @param {string} eventType - Event type
   * @param {string} sourceScreen - Source screen
   * @param {string} sourceAction - Source action
   * @param {Object} eventData - Additional event data
   * @returns {Promise<string|null>} Event ID or null
   */
  async trackEvent(userId, exchangeId, eventType, sourceScreen = null, sourceAction = null, eventData = {}) {
    try {
      const { data, error } = await supabase
        .from('exchange_affiliate_events')
        .insert({
          user_id: userId,
          exchange: exchangeId,
          event_type: eventType,
          source_screen: sourceScreen,
          source_action: sourceAction,
          event_data: eventData,
          device_info: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('[ExchangeAffiliate] Error tracking event:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error tracking event:', error);
      return null;
    }
  }

  // ========================================
  // EXCHANGE ACCOUNT MANAGEMENT
  // ========================================

  /**
   * Confirm exchange signup
   * @param {string} exchangeId - Exchange ID
   * @param {string} email - Exchange email
   * @returns {Promise<Object>} Result { success, error }
   */
  async confirmExchangeSignup(exchangeId, email) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Call RPC function
      const { data, error } = await supabase.rpc('confirm_exchange_signup', {
        user_id_param: user.id,
        exchange_param: exchangeId,
        email_param: email,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error confirming signup:', error);
        return { success: false, error: error.message };
      }

      // Schedule deposit prompt for 24h later
      await this.scheduleDepositPrompt(
        exchangeId,
        DEPOSIT_PROMPT_TYPES.AFTER_SIGNUP,
        DEPOSIT_PROMPT_CONFIG.AFTER_SIGNUP_DELAY_MINUTES
      );

      // Clear pending signup
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);

      return { success: true, data };
    } catch (error) {
      console.error('[ExchangeAffiliate] Error confirming signup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upsert exchange account
   * @param {string} userId - User ID
   * @param {string} exchangeId - Exchange ID
   * @param {Object} updates - Account updates
   * @returns {Promise<Object>} Result { success, accountId, action }
   */
  async upsertExchangeAccount(userId, exchangeId, updates = {}) {
    try {
      // Check if account exists
      const { data: existing } = await supabase
        .from('user_exchange_accounts')
        .select('id, status')
        .eq('user_id', userId)
        .eq('exchange', exchangeId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_exchange_accounts')
          .update({
            ...updates,
            exchange_email: updates.email || undefined,
            signup_source: updates.signupSource || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        return { success: true, accountId: existing.id, action: 'updated' };
      } else {
        // Create new
        const { data, error } = await supabase
          .from('user_exchange_accounts')
          .insert({
            user_id: userId,
            exchange: exchangeId,
            status: updates.status || EXCHANGE_ACCOUNT_STATUS.PENDING_SIGNUP,
            exchange_email: updates.email,
            signup_source: updates.signupSource,
            link_clicked_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        return { success: true, accountId: data.id, action: 'created' };
      }
    } catch (error) {
      console.error('[ExchangeAffiliate] Error upserting account:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's exchange accounts
   * @returns {Promise<Array>} Array of exchange accounts
   */
  async getUserExchangeAccounts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_exchange_accounts')
        .select(`
          *,
          exchange_config:exchange (
            id, display_name, color, logo_url, affiliate_link
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ExchangeAffiliate] Error fetching accounts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching accounts:', error);
      return [];
    }
  }

  /**
   * Get user's exchange summary
   * @returns {Promise<Object>} Summary object
   */
  async getUserExchangeSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalAccounts: 0,
          registered: 0,
          withDeposit: 0,
          withAPI: 0,
          accounts: [],
        };
      }

      const { data, error } = await supabase.rpc('get_user_exchange_summary', {
        user_id_param: user.id,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error fetching summary:', error);
        // Fallback to manual count
        const accounts = await this.getUserExchangeAccounts();
        return {
          totalAccounts: accounts.length,
          registered: accounts.filter(a => a.status !== 'pending_signup').length,
          withDeposit: accounts.filter(a => a.first_deposit_at).length,
          withAPI: accounts.filter(a => a.api_key_encrypted).length,
          accounts,
        };
      }

      return {
        totalAccounts: data.total_accounts || 0,
        registered: data.registered || 0,
        withDeposit: data.with_deposit || 0,
        withAPI: data.with_api || 0,
        accounts: data.accounts || [],
      };
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching summary:', error);
      return {
        totalAccounts: 0,
        registered: 0,
        withDeposit: 0,
        withAPI: 0,
        accounts: [],
      };
    }
  }

  /**
   * Check if user has registered any exchange
   * @returns {Promise<boolean>}
   */
  async hasRegisteredExchange() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count, error } = await supabase
        .from('user_exchange_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'pending_signup');

      return (count || 0) > 0;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error checking registration:', error);
      return false;
    }
  }

  /**
   * Check if user has deposited on any exchange
   * @param {string} [exchangeId] - Specific exchange (optional)
   * @returns {Promise<boolean>}
   */
  async hasDepositedOnExchange(exchangeId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from('user_exchange_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('first_deposit_at', 'is', null);

      if (exchangeId) {
        query = query.eq('exchange', exchangeId);
      }

      const { count } = await query;
      return (count || 0) > 0;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error checking deposit:', error);
      return false;
    }
  }

  /**
   * Update exchange milestone
   * @param {string} exchangeId - Exchange ID
   * @param {string} milestone - Milestone type
   * @returns {Promise<Object>} Result
   */
  async updateExchangeMilestone(exchangeId, milestone) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase.rpc('update_exchange_milestone', {
        user_id_param: user.id,
        exchange_param: exchangeId,
        milestone_param: milestone,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error updating milestone:', error);
        return { success: false, error: error.message };
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('[ExchangeAffiliate] Error updating milestone:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // DEPOSIT PROMPTS
  // ========================================

  /**
   * Schedule deposit prompt
   * @param {string} exchangeId - Exchange ID
   * @param {string} promptType - Prompt type
   * @param {number} delayMinutes - Delay in minutes
   * @param {Object} contextData - Context data
   * @returns {Promise<Object>} Result
   */
  async scheduleDepositPrompt(exchangeId, promptType, delayMinutes = 0, contextData = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase.rpc('schedule_deposit_prompt', {
        user_id_param: user.id,
        exchange_param: exchangeId,
        prompt_type_param: promptType,
        delay_minutes: delayMinutes,
        context_data_param: contextData,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error scheduling prompt:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error scheduling prompt:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pending deposit prompts
   * @returns {Promise<Array>} Array of pending prompts
   */
  async getPendingDepositPrompts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_pending_prompts', {
        user_id_param: user.id,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error fetching prompts:', error);
        return [];
      }

      // Transform and add content
      return (data || []).map(prompt => ({
        ...prompt,
        content: getPromptContent(prompt.prompt_type, {
          exchange: prompt.exchange_name,
          ...prompt.context_data,
        }),
      }));
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching prompts:', error);
      return [];
    }
  }

  /**
   * Respond to deposit prompt
   * @param {string} promptId - Prompt ID
   * @param {string} action - Action taken
   * @returns {Promise<Object>} Result
   */
  async respondToPrompt(promptId, action) {
    try {
      const { data, error } = await supabase.rpc('respond_to_prompt', {
        prompt_id_param: promptId,
        action_param: action,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error responding to prompt:', error);
        return { success: false, error: error.message };
      }

      // Update local rate limit tracking
      await this.updatePromptRateLimitTracking();

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error responding to prompt:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if should show deposit prompt (local rate limiting)
   * @returns {Promise<boolean>}
   */
  async shouldShowDepositPrompt() {
    try {
      // Check local rate limit
      const lastPromptTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_TIME);
      if (lastPromptTime) {
        const elapsed = Date.now() - parseInt(lastPromptTime, 10);
        if (elapsed < DEPOSIT_PROMPT_CONFIG.MIN_PROMPT_INTERVAL_MS) {
          return false;
        }
      }

      // Check daily count
      const todayCount = await this.getPromptsShownToday();
      if (todayCount >= DEPOSIT_PROMPT_CONFIG.MAX_PROMPTS_PER_DAY) {
        return false;
      }

      // Check DB rate limit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase.rpc('should_show_deposit_prompt', {
        user_id_param: user.id,
      });

      return data === true;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error checking prompt limit:', error);
      return false;
    }
  }

  /**
   * Get number of prompts shown today
   * @returns {Promise<number>}
   */
  async getPromptsShownToday() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROMPTS_TODAY_COUNT);
      if (!stored) return 0;

      const { count, date } = JSON.parse(stored);
      const today = new Date().toDateString();

      if (date === today) {
        return count;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update prompt rate limit tracking
   */
  async updatePromptRateLimitTracking() {
    try {
      const today = new Date().toDateString();
      const currentCount = await this.getPromptsShownToday();

      await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_TIME, Date.now().toString());
      await AsyncStorage.setItem(STORAGE_KEYS.PROMPTS_TODAY_COUNT, JSON.stringify({
        count: currentCount + 1,
        date: today,
      }));
    } catch (error) {
      console.error('[ExchangeAffiliate] Error updating rate limit:', error);
    }
  }

  // ========================================
  // TRIGGER CHECKS
  // ========================================

  /**
   * Check win streak trigger for deposit prompt
   * @param {number} currentStreak - Current win streak
   * @param {number} totalProfit - Total profit
   * @returns {Promise<Object>} Trigger result
   */
  async checkWinStreakTrigger(currentStreak, totalProfit = 0) {
    try {
      if (!shouldTriggerWinStreakPrompt(currentStreak)) {
        return { shouldPrompt: false, reason: 'Streak too low' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { shouldPrompt: false, reason: 'Not authenticated' };

      const { data, error } = await supabase.rpc('check_win_streak_trigger', {
        user_id_param: user.id,
        current_streak: currentStreak,
        total_profit: totalProfit,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error checking win streak:', error);
        return { shouldPrompt: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error checking win streak:', error);
      return { shouldPrompt: false, error: error.message };
    }
  }

  /**
   * Check pattern trigger for deposit prompt
   * @param {string} patternGrade - Pattern grade
   * @param {string} patternName - Pattern name
   * @returns {Promise<Object>} Trigger result
   */
  async checkPatternTrigger(patternGrade, patternName = null) {
    try {
      if (!shouldTriggerPatternPrompt(patternGrade)) {
        return { shouldPrompt: false, reason: 'Grade not high enough' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { shouldPrompt: false, reason: 'Not authenticated' };

      const { data, error } = await supabase.rpc('check_pattern_trigger', {
        user_id_param: user.id,
        pattern_grade: patternGrade,
        pattern_name: patternName,
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error checking pattern:', error);
        return { shouldPrompt: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error checking pattern:', error);
      return { shouldPrompt: false, error: error.message };
    }
  }

  // ========================================
  // PENDING SIGNUP RESUME
  // ========================================

  /**
   * Get pending signup (for resuming after app restart)
   * @returns {Promise<Object|null>} Pending signup data
   */
  async getPendingSignup() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check if expired (24 hours)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error getting pending signup:', error);
      return null;
    }
  }

  /**
   * Clear pending signup
   */
  async clearPendingSignup() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
    } catch (error) {
      console.error('[ExchangeAffiliate] Error clearing pending signup:', error);
    }
  }

  // ========================================
  // ADMIN STATS
  // ========================================

  /**
   * Get affiliate stats (Admin only)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Stats object
   */
  async getAffiliateStats(startDate = null, endDate = null) {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      const { data, error } = await supabase.rpc('get_affiliate_stats', {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });

      if (error) {
        console.error('[ExchangeAffiliate] Error fetching stats:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('[ExchangeAffiliate] Error fetching stats:', error);
      return { error: error.message };
    }
  }
}

// ========================================
// SINGLETON EXPORT
// ========================================

export const exchangeAffiliateService = new ExchangeAffiliateService();

export default exchangeAffiliateService;
