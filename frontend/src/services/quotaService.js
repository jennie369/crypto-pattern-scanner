/**
 * Quota Service (Web)
 * Ported from gem-mobile/src/services/quotaService.js
 *
 * Track daily queries for chatbot AND scanner usage.
 * Reset at 00:00 Vietnam time (UTC+7) daily.
 * Uses DATABASE for persistence.
 *
 * QUOTA LIMITS:
 * Chatbot: FREE=5, PRO/TIER1=15, PREMIUM/TIER2=50, VIP/TIER3=Unlimited
 * Scanner: FREE=5, PRO+=Unlimited
 * ADMIN/MANAGER: Unlimited (bypass)
 */

import { supabase } from '../lib/supabaseClient';

// Cache to avoid excessive DB calls
const quotaCache = {
  data: null,
  timestamp: 0,
  TTL: 30000, // 30 seconds
};

class QuotaService {
  static async checkAllQuotas(userId, forceRefresh = false) {
    try {
      if (!userId) return this.getDefaultAllQuotas();

      const now = Date.now();
      if (!forceRefresh && quotaCache.data && (now - quotaCache.timestamp) < quotaCache.TTL) {
        return quotaCache.data;
      }

      const { data, error } = await supabase.rpc('check_all_quotas', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error:', error.message);
        return this.checkAllQuotasManual(userId);
      }

      const result = data?.[0] || this.getDefaultAllQuotas();

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
          limit: result.scanner_limit ?? 5,
          used: result.scanner_used ?? 0,
          remaining: result.scanner_remaining ?? 5,
          unlimited: result.scanner_unlimited || false,
        },
        todayDate: result.today_date,
        resetAt: result.reset_at,
      };

      quotaCache.data = formattedResult;
      quotaCache.timestamp = now;

      return formattedResult;
    } catch (error) {
      console.error('[QuotaService] Error checking quotas:', error);
      return this.getDeniedQuotas();
    }
  }

  static async checkAllQuotasManual(userId) {
    const today = this.getVietnamDate();

    const { data: profile } = await supabase
      .from('profiles')
      .select('chatbot_tier, scanner_tier, is_admin, role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.is_admin || profile?.role === 'admin' || profile?.role === 'ADMIN';
    const isManager = profile?.role === 'manager' || profile?.role === 'MANAGER';
    const hasUnlimitedAccess = isAdmin || isManager;

    const { data: chatbotData } = await supabase
      .from('chatbot_quota')
      .select('queries_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

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

  static async checkQuota(userId) {
    const allQuotas = await this.checkAllQuotas(userId);
    return { ...allQuotas.chatbot, resetAt: allQuotas.resetAt };
  }

  static async checkScannerQuota(userId) {
    const allQuotas = await this.checkAllQuotas(userId);
    return { ...allQuotas.scanner, resetAt: allQuotas.resetAt };
  }

  static async decrementQuota(userId) {
    try {
      if (!userId) return { success: false, error: 'No userId' };

      const { data, error } = await supabase.rpc('increment_chatbot_quota', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error, using manual:', error.message);
        return this.decrementQuotaManual(userId, 'chatbot');
      }

      const result = data?.[0];
      quotaCache.timestamp = 0;

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

  static async decrementScannerQuota(userId) {
    try {
      if (!userId) return { success: false, error: 'No userId' };

      const { data, error } = await supabase.rpc('increment_scanner_quota', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[QuotaService] RPC error, using manual:', error.message);
        return this.decrementQuotaManual(userId, 'scanner');
      }

      const result = data?.[0];
      quotaCache.timestamp = 0;

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

  static async decrementQuotaManual(userId, type = 'chatbot') {
    const today = this.getVietnamDate();
    const table = type === 'scanner' ? 'scanner_quota' : 'chatbot_quota';
    const column = type === 'scanner' ? 'scans_used' : 'queries_used';

    const { data: existing } = await supabase
      .from(table)
      .select(column)
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
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

  static async canQuery(userId) {
    const quota = await this.checkQuota(userId);
    return quota.unlimited || quota.remaining > 0;
  }

  static async canScan(userId) {
    const quota = await this.checkScannerQuota(userId);
    return quota.unlimited || quota.remaining > 0;
  }

  static async refreshQuota(userId) {
    quotaCache.timestamp = 0;
    return this.checkAllQuotas(userId, true);
  }

  static getQuotaMessage(quota) {
    if (!quota) return '0/5';
    if (quota.unlimited) return 'Khong gioi han';
    if (quota.remaining <= 0) return 'Het luot hom nay';
    return `${quota.remaining}/${quota.limit}`;
  }

  static getQuotaStatus(quota) {
    if (!quota) {
      return { message: '0/5', color: '#FF6B6B', percentage: 0, canUse: false };
    }

    if (quota.unlimited) {
      return { message: 'Khong gioi han', color: '#00FF88', percentage: 100, canUse: true };
    }

    const percentage = (quota.remaining / quota.limit) * 100;
    let color = '#00FF88';
    if (percentage <= 0) color = '#FF6B6B';
    else if (percentage < 20) color = '#FF6B6B';
    else if (percentage < 50) color = '#FFB800';

    return {
      message: `${quota.remaining}/${quota.limit}`,
      color,
      percentage,
      canUse: quota.remaining > 0,
    };
  }

  static getTimeUntilReset(quota) {
    if (!quota || quota.unlimited || !quota.resetAt) return '';

    const now = new Date();
    const reset = new Date(quota.resetAt);
    const diff = reset - now;

    if (diff < 0) return 'Reset ngay';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `Reset sau ${hours}h ${minutes}m`;
    return `Reset sau ${minutes}m`;
  }

  static getVietnamDate() {
    const now = new Date();
    const vietnamOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
    return vietnamTime.toISOString().split('T')[0];
  }

  static getNextResetTime() {
    const now = new Date();
    const vietnamOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
    vietnamTime.setHours(24, 0, 0, 0);
    return new Date(vietnamTime.getTime() - (vietnamOffset + localOffset) * 60 * 1000);
  }

  static getChatbotLimit(tier) {
    const limits = {
      'TIER3': -1, 'VIP': -1,
      'TIER2': 50, 'PREMIUM': 50,
      'TIER1': 15, 'PRO': 15,
      'FREE': 5,
    };
    return limits[tier?.toUpperCase()] ?? 5;
  }

  static getScannerLimit(tier) {
    const limits = {
      'TIER3': -1, 'VIP': -1,
      'TIER2': -1, 'PREMIUM': -1,
      'TIER1': -1, 'PRO': -1,
      'FREE': 5,
    };
    return limits[tier?.toUpperCase()] ?? 5;
  }

  static getDefaultAllQuotas() {
    const resetAt = this.getNextResetTime().toISOString();
    return {
      chatbot: { tier: 'FREE', limit: 5, used: 0, remaining: 5, unlimited: false },
      scanner: { tier: 'FREE', limit: 5, used: 0, remaining: 5, unlimited: false },
      todayDate: this.getVietnamDate(),
      resetAt,
    };
  }

  static getDeniedQuotas() {
    const resetAt = this.getNextResetTime().toISOString();
    return {
      chatbot: { tier: 'FREE', limit: 5, used: 5, remaining: 0, unlimited: false },
      scanner: { tier: 'FREE', limit: 5, used: 5, remaining: 0, unlimited: false },
      todayDate: this.getVietnamDate(),
      resetAt,
    };
  }

  static getDefaultQuota() {
    const resetAt = this.getNextResetTime().toISOString();
    return { tier: 'FREE', limit: 5, used: 0, remaining: 5, unlimited: false, resetAt };
  }

  static async resetQuota(userId, type = 'both') {
    try {
      const { data, error } = await supabase.rpc('admin_reset_user_quota', {
        p_user_id: userId,
        p_quota_type: type,
      });

      if (error) throw error;
      quotaCache.timestamp = 0;
      return { success: true, data };
    } catch (error) {
      console.error('[QuotaService] Error resetting quota:', error);
      return { success: false, error: error.message };
    }
  }

  static clearCache() {
    quotaCache.data = null;
    quotaCache.timestamp = 0;
  }
}

export const clearQuotaCache = () => QuotaService.clearCache();

export default QuotaService;
