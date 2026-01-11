/**
 * GEM Mobile - Unified Quota Service
 * Track daily queries for chatbot AND scanner usage
 *
 * Reset at 00:00 Vietnam time (UTC+7) daily
 * Uses DATABASE for persistence (not memory!)
 *
 * QUOTA LIMITS:
 * Chatbot:
 * - FREE: 5 queries/day
 * - PRO/TIER1: 15 queries/day
 * - PREMIUM/TIER2: 50 queries/day
 * - VIP/TIER3: Unlimited
 * - ADMIN/MANAGER: Unlimited (bypass)
 *
 * Scanner:
 * - FREE: 10 scans/day
 * - PRO/TIER1: 20 scans/day
 * - PREMIUM/TIER2: 50 scans/day
 * - VIP/TIER3: Unlimited
 * - ADMIN/MANAGER: Unlimited (bypass)
 *
 * Updated: December 29, 2025
 * - Added Manager bypass (unlimited quota like Admin)
 */

import { supabase } from './supabase';

// Cache to avoid excessive DB calls (short TTL)
const quotaCache = {
  data: null,
  timestamp: 0,
  TTL: 30000, // 30 seconds
};

class QuotaService {
  /**
   * Check all quotas (chatbot + scanner) using database RPC
   * This is the SINGLE SOURCE OF TRUTH for quota data
   * @param {string} userId
   * @param {boolean} forceRefresh - Skip cache
   * @returns {Promise<Object>}
   */
  static async checkAllQuotas(userId, forceRefresh = false) {
    try {
      if (!userId) {
        console.log('[QuotaService] No userId, returning defaults');
        return this.getDefaultAllQuotas();
      }

      // Check cache (unless force refresh)
      const now = Date.now();
      if (!forceRefresh && quotaCache.data && (now - quotaCache.timestamp) < quotaCache.TTL) {
        console.log('[QuotaService] Returning cached quota');
        return quotaCache.data;
      }

      // Call database RPC
      const { data, error } = await supabase.rpc('check_all_quotas', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error:', error);
        // Fallback to manual check
        return this.checkAllQuotasManual(userId);
      }

      const result = data?.[0] || this.getDefaultAllQuotas();

      // Format response
      const formattedResult = {
        chatbot: {
          tier: result.chatbot_tier || 'FREE',
          limit: result.chatbot_limit ?? 5,
          used: result.chatbot_used ?? 0,
          remaining: result.chatbot_remaining ?? 5,
          unlimited: result.chatbot_unlimited || false,
        },
        scanner: {
          tier: result.scanner_tier || 'FREE',
          limit: result.scanner_limit ?? 10,
          used: result.scanner_used ?? 0,
          remaining: result.scanner_remaining ?? 10,
          unlimited: result.scanner_unlimited || false,
        },
        todayDate: result.today_date,
        resetAt: result.reset_at,
      };

      // Update cache
      quotaCache.data = formattedResult;
      quotaCache.timestamp = now;

      console.log('[QuotaService] Quota fetched:', {
        chatbot: `${formattedResult.chatbot.remaining}/${formattedResult.chatbot.limit}`,
        scanner: `${formattedResult.scanner.remaining}/${formattedResult.scanner.limit}`,
      });

      return formattedResult;

    } catch (error) {
      console.error('[QuotaService] Error checking quotas:', error);
      return this.getDefaultAllQuotas();
    }
  }

  /**
   * Manual fallback if RPC doesn't exist yet
   */
  static async checkAllQuotasManual(userId) {
    const today = this.getVietnamDate();

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('chatbot_tier, scanner_tier, is_admin, role')
      .eq('id', userId)
      .single();

    // Admin and Manager both get unlimited quota
    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'ADMIN';
    const isManager = profile?.role === 'manager' || profile?.role === 'MANAGER';
    const hasUnlimitedAccess = isAdmin || isManager;

    // Get chatbot usage
    const { data: chatbotData } = await supabase
      .from('chatbot_quota')
      .select('queries_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get scanner usage
    const { data: scannerData } = await supabase
      .from('scanner_quota')
      .select('scans_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const chatbotTier = profile?.chatbot_tier?.toUpperCase() || 'FREE';
    const scannerTier = profile?.scanner_tier?.toUpperCase() || 'FREE';

    const chatbotLimit = hasUnlimitedAccess ? -1 : this.getChatbotLimit(chatbotTier);
    const scannerLimit = hasUnlimitedAccess ? -1 : this.getScannerLimit(scannerTier);

    const chatbotUsed = chatbotData?.queries_used || 0;
    const scannerUsed = scannerData?.scans_used || 0;

    // Determine display tier
    const displayTier = isAdmin ? 'ADMIN' : (isManager ? 'MANAGER' : null);

    return {
      chatbot: {
        tier: displayTier || chatbotTier,
        limit: chatbotLimit,
        used: chatbotUsed,
        remaining: chatbotLimit === -1 ? -1 : Math.max(0, chatbotLimit - chatbotUsed),
        unlimited: chatbotLimit === -1,
      },
      scanner: {
        tier: displayTier || scannerTier,
        limit: scannerLimit,
        used: scannerUsed,
        remaining: scannerLimit === -1 ? -1 : Math.max(0, scannerLimit - scannerUsed),
        unlimited: scannerLimit === -1,
      },
      todayDate: today,
      resetAt: this.getNextResetTime().toISOString(),
    };
  }

  /**
   * Check chatbot quota only
   * @param {string} userId
   * @param {string} userTier - Optional
   * @returns {Promise<Object>}
   */
  static async checkQuota(userId, userTier = null) {
    const allQuotas = await this.checkAllQuotas(userId);
    return {
      ...allQuotas.chatbot,
      resetAt: allQuotas.resetAt,
    };
  }

  /**
   * Check scanner quota only
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async checkScannerQuota(userId) {
    const allQuotas = await this.checkAllQuotas(userId);
    return {
      ...allQuotas.scanner,
      resetAt: allQuotas.resetAt,
    };
  }

  /**
   * Decrement chatbot quota after successful query
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async decrementQuota(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No userId' };
      }

      // Try RPC first
      const { data, error } = await supabase.rpc('increment_chatbot_quota', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error, using manual:', error);
        return this.decrementQuotaManual(userId, 'chatbot');
      }

      const result = data?.[0];

      // Invalidate cache
      quotaCache.timestamp = 0;

      console.log(`[QuotaService] Chatbot quota incremented: ${result?.used}/${result?.remaining === -1 ? '∞' : result?.remaining + result?.used}`);

      return {
        success: result?.success ?? true,
        used: result?.used ?? 0,
        remaining: result?.remaining ?? 0,
        limitReached: result?.limit_reached ?? false,
      };

    } catch (error) {
      console.error('[QuotaService] Error decrementing chatbot quota:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Decrement scanner quota after successful scan
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async decrementScannerQuota(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'No userId' };
      }

      // Try RPC first
      const { data, error } = await supabase.rpc('increment_scanner_quota', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error, using manual:', error);
        return this.decrementQuotaManual(userId, 'scanner');
      }

      const result = data?.[0];

      // Invalidate cache
      quotaCache.timestamp = 0;

      console.log(`[QuotaService] Scanner quota incremented: ${result?.used}/${result?.remaining === -1 ? '∞' : result?.remaining + result?.used}`);

      return {
        success: result?.success ?? true,
        used: result?.used ?? 0,
        remaining: result?.remaining ?? 0,
        limitReached: result?.limit_reached ?? false,
      };

    } catch (error) {
      console.error('[QuotaService] Error decrementing scanner quota:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual decrement fallback
   */
  static async decrementQuotaManual(userId, type = 'chatbot') {
    const today = this.getVietnamDate();
    const table = type === 'scanner' ? 'scanner_quota' : 'chatbot_quota';
    const column = type === 'scanner' ? 'scans_used' : 'queries_used';

    // Check existing
    const { data: existing } = await supabase
      .from(table)
      .select(column)
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      // Update
      const { error } = await supabase
        .from(table)
        .update({
          [column]: existing[column] + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('date', today);

      if (error) throw error;

      return { success: true, used: existing[column] + 1 };
    } else {
      // Insert
      const { error } = await supabase
        .from(table)
        .insert({
          user_id: userId,
          date: today,
          [column]: 1,
        });

      if (error) throw error;

      return { success: true, used: 1 };
    }
  }

  /**
   * Check if user can make a chatbot query
   */
  static async canQuery(userId) {
    const quota = await this.checkQuota(userId);
    return quota.unlimited || quota.remaining > 0;
  }

  /**
   * Check if user can make a scanner scan
   */
  static async canScan(userId) {
    const quota = await this.checkScannerQuota(userId);
    return quota.unlimited || quota.remaining > 0;
  }

  /**
   * Force refresh quota from database
   */
  static async refreshQuota(userId) {
    quotaCache.timestamp = 0; // Invalidate cache
    return this.checkAllQuotas(userId, true);
  }

  /**
   * Get quota status message for display
   */
  static getQuotaMessage(quota) {
    if (!quota) return '0/5';
    if (quota.unlimited) return 'Không giới hạn';
    if (quota.remaining <= 0) return 'Hết lượt hôm nay';
    return `${quota.remaining}/${quota.limit}`;
  }

  /**
   * Get quota status with styling info
   */
  static getQuotaStatus(quota) {
    if (!quota) {
      return {
        message: '0/5',
        color: '#FF6B6B',
        percentage: 0,
        canUse: false,
      };
    }

    if (quota.unlimited) {
      return {
        message: 'Không giới hạn',
        color: '#00FF88',
        percentage: 100,
        canUse: true,
      };
    }

    const percentage = (quota.remaining / quota.limit) * 100;
    let color = '#00FF88'; // Green

    if (percentage <= 0) {
      color = '#FF6B6B'; // Red
    } else if (percentage < 20) {
      color = '#FF6B6B'; // Red
    } else if (percentage < 50) {
      color = '#FFB800'; // Yellow/Orange
    }

    return {
      message: `${quota.remaining}/${quota.limit}`,
      color,
      percentage,
      canUse: quota.remaining > 0,
    };
  }

  /**
   * Get time until quota reset
   */
  static getTimeUntilReset(quota) {
    if (!quota || quota.unlimited || !quota.resetAt) {
      return '';
    }

    const now = new Date();
    const reset = new Date(quota.resetAt);
    const diff = reset - now;

    if (diff < 0) return 'Reset ngay';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `Reset sau ${hours}h ${minutes}m`;
    }
    return `Reset sau ${minutes}m`;
  }

  /**
   * Get today's date in Vietnam timezone (YYYY-MM-DD)
   */
  static getVietnamDate() {
    const now = new Date();
    // Vietnam is UTC+7
    const vietnamOffset = 7 * 60; // minutes
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
    return vietnamTime.toISOString().split('T')[0];
  }

  /**
   * Get next reset time (midnight Vietnam time)
   */
  static getNextResetTime() {
    const now = new Date();
    const vietnamOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);

    // Set to next midnight
    vietnamTime.setHours(24, 0, 0, 0);

    // Convert back to UTC
    return new Date(vietnamTime.getTime() - (vietnamOffset + localOffset) * 60 * 1000);
  }

  /**
   * Get chatbot limit for tier
   */
  static getChatbotLimit(tier) {
    const limits = {
      'TIER3': -1, 'VIP': -1,
      'TIER2': 50, 'PREMIUM': 50,
      'TIER1': 15, 'PRO': 15,
      'FREE': 5,
    };
    return limits[tier?.toUpperCase()] ?? 5;
  }

  /**
   * Get scanner limit for tier
   */
  static getScannerLimit(tier) {
    const limits = {
      'TIER3': -1, 'VIP': -1,
      'TIER2': 50, 'PREMIUM': 50,
      'TIER1': 20, 'PRO': 20,
      'FREE': 10,
    };
    return limits[tier?.toUpperCase()] ?? 10;
  }

  /**
   * Get default quotas
   */
  static getDefaultAllQuotas() {
    const resetAt = this.getNextResetTime().toISOString();
    return {
      chatbot: {
        tier: 'FREE',
        limit: 5,
        used: 0,
        remaining: 5,
        unlimited: false,
      },
      scanner: {
        tier: 'FREE',
        limit: 10,
        used: 0,
        remaining: 10,
        unlimited: false,
      },
      todayDate: this.getVietnamDate(),
      resetAt,
    };
  }

  /**
   * Reset quota for a user (admin function)
   */
  static async resetQuota(userId, type = 'both') {
    try {
      const { data, error } = await supabase.rpc('admin_reset_user_quota', {
        p_user_id: userId,
        p_quota_type: type,
      });

      if (error) throw error;

      // Invalidate cache
      quotaCache.timestamp = 0;

      console.log(`[QuotaService] Reset ${type} quota for ${userId}`);
      return { success: true, data };

    } catch (error) {
      console.error('[QuotaService] Error resetting quota:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache (call on app start or user change)
   */
  static clearCache() {
    quotaCache.data = null;
    quotaCache.timestamp = 0;
    console.log('[QuotaService] Cache cleared');
  }
}

export default QuotaService;
