/**
 * GEM Mobile - Quota Service
 * Track daily queries for chatbot usage
 *
 * Reset at 00:00 Vietnam time (UTC+7) daily
 *
 * QUOTA LIMITS:
 * - FREE: 5 queries/day
 * - PRO/TIER1: 15 queries/day
 * - PREMIUM/TIER2: 50 queries/day
 * - VIP/TIER3: Unlimited
 */

import { supabase } from './supabase';
import TierService from './tierService';

class QuotaService {
  /**
   * Check quota remaining for today
   * @param {string} userId
   * @param {string} userTier - Optional, will fetch if not provided
   * @returns {Promise<Object>}
   */
  static async checkQuota(userId, userTier = null) {
    try {
      if (!userId) {
        console.log('[QuotaService] No userId, returning default quota');
        return this.getDefaultQuota();
      }

      // Get tier if not provided
      const tier = userTier || await TierService.getUserTier(userId);
      const tierLimits = TierService.getTierLimits(tier);
      const limit = tierLimits.queries;

      // TIER3/VIP = unlimited
      if (limit === -1) {
        console.log('[QuotaService] User has unlimited quota');
        return {
          limit: -1,
          used: 0,
          remaining: -1,
          resetAt: null,
          unlimited: true,
          tier: tier
        };
      }

      // Get today's date (Vietnam timezone UTC+7)
      const today = this.getVietnamDate();

      // Query chatbot_quota table
      const { data, error } = await supabase
        .from('chatbot_quota')
        .select('queries_used')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected for new day)
        console.error('[QuotaService] Error checking quota:', error);
      }

      const used = data?.queries_used || 0;
      const remaining = Math.max(0, limit - used);

      // Calculate reset time (next midnight Vietnam time)
      const resetAt = this.getNextResetTime();

      console.log(`[QuotaService] User ${userId}: ${remaining}/${limit} remaining`);

      return {
        limit,
        used,
        remaining,
        resetAt: resetAt.toISOString(),
        unlimited: false,
        tier: tier
      };

    } catch (error) {
      console.error('[QuotaService] Error checking quota:', error);
      return this.getDefaultQuota();
    }
  }

  /**
   * Decrement quota after successful query
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async decrementQuota(userId) {
    try {
      if (!userId) {
        console.log('[QuotaService] No userId, cannot decrement');
        return false;
      }

      // Check if user has unlimited quota
      const tier = await TierService.getUserTier(userId);
      if (TierService.isUnlimited(tier)) {
        console.log('[QuotaService] User has unlimited quota, no decrement needed');
        return true;
      }

      const today = this.getVietnamDate();

      // Check if record exists
      const { data: existing, error: checkError } = await supabase
        .from('chatbot_quota')
        .select('queries_used')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[QuotaService] Error checking existing quota:', checkError);
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('chatbot_quota')
          .update({
            queries_used: existing.queries_used + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('date', today);

        if (error) {
          console.error('[QuotaService] Error updating quota:', error);
          return false;
        }

        console.log(`[QuotaService] Updated quota for ${userId}: ${existing.queries_used + 1}`);
      } else {
        // Insert new record for today
        const { error } = await supabase
          .from('chatbot_quota')
          .insert({
            user_id: userId,
            date: today,
            queries_used: 1
          });

        if (error) {
          console.error('[QuotaService] Error inserting quota:', error);
          return false;
        }

        console.log(`[QuotaService] Created quota for ${userId}: 1`);
      }

      return true;

    } catch (error) {
      console.error('[QuotaService] Error decrementing quota:', error);
      return false;
    }
  }

  /**
   * Check if user can make a query
   * @param {string} userId
   * @param {string} userTier
   * @returns {Promise<boolean>}
   */
  static async canQuery(userId, userTier = null) {
    const quota = await this.checkQuota(userId, userTier);
    return quota.unlimited || quota.remaining > 0;
  }

  /**
   * Get quota status message for display
   * @param {Object} quota
   * @returns {string}
   */
  static getQuotaMessage(quota) {
    if (!quota) return '0/5';

    if (quota.unlimited) {
      return 'Unlimited';
    }

    if (quota.remaining <= 0) {
      return 'Het luot hom nay';
    }

    return `${quota.remaining}/${quota.limit}`;
  }

  /**
   * Get quota status with more details
   * @param {Object} quota
   * @returns {Object}
   */
  static getQuotaStatus(quota) {
    if (!quota) {
      return {
        message: '0/5',
        color: '#FF6B6B',
        percentage: 0,
        canQuery: false
      };
    }

    if (quota.unlimited) {
      return {
        message: 'Unlimited',
        color: '#00FF88',
        percentage: 100,
        canQuery: true
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
      canQuery: quota.remaining > 0
    };
  }

  /**
   * Get time until quota reset
   * @param {Object} quota
   * @returns {string}
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
   * @returns {string}
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
   * @returns {Date}
   */
  static getNextResetTime() {
    const now = new Date();
    // Vietnam is UTC+7
    const vietnamOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);

    // Set to next midnight
    vietnamTime.setHours(24, 0, 0, 0);

    // Convert back to local time
    return new Date(vietnamTime.getTime() - (vietnamOffset + localOffset) * 60 * 1000);
  }

  /**
   * Get default quota for unauthenticated/error cases
   * @returns {Object}
   */
  static getDefaultQuota() {
    return {
      limit: 5,
      used: 0,
      remaining: 5,
      resetAt: this.getNextResetTime().toISOString(),
      unlimited: false,
      tier: 'FREE'
    };
  }

  /**
   * Reset quota for a user (admin function)
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async resetQuota(userId) {
    try {
      const today = this.getVietnamDate();

      const { error } = await supabase
        .from('chatbot_quota')
        .delete()
        .eq('user_id', userId)
        .eq('date', today);

      if (error) {
        console.error('[QuotaService] Error resetting quota:', error);
        return false;
      }

      console.log(`[QuotaService] Reset quota for ${userId}`);
      return true;

    } catch (error) {
      console.error('[QuotaService] Error resetting quota:', error);
      return false;
    }
  }
}

export default QuotaService;
