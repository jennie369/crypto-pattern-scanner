/**
 * Gemral - Earnings Service
 * Feature #16: Creator Earnings
 * Handles creator earnings and withdrawals
 */

import { supabase } from './supabase';

export const earningsService = {
  /**
   * Get earnings summary for current user
   * @returns {Promise<object>}
   */
  async getEarningsSummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { data, error } = await supabase
        .from('creator_earnings')
        .select('net_amount, status')
        .eq('creator_id', user.id);

      if (error) throw error;

      // Calculate totals
      const pending = (data || [])
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.net_amount, 0);

      const available = (data || [])
        .filter(e => e.status === 'available')
        .reduce((sum, e) => sum + e.net_amount, 0);

      const withdrawn = (data || [])
        .filter(e => e.status === 'withdrawn')
        .reduce((sum, e) => sum + e.net_amount, 0);

      const total = pending + available + withdrawn;

      return {
        success: true,
        data: {
          pending,      // Earnings still in holding period
          available,    // Ready to withdraw
          withdrawn,    // Already withdrawn
          total,        // Lifetime earnings
        },
      };
    } catch (error) {
      console.error('[Earnings] Get summary error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get earnings history
   * @param {number} limit - Max results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<array>}
   */
  async getEarningsHistory(limit = 20, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Earnings] Get history error:', error);
      return [];
    }
  },

  /**
   * Get earnings by time period
   * @param {string} period - 'day' | 'week' | 'month' | 'year'
   * @returns {Promise<array>}
   */
  async getEarningsByPeriod(period = 'week') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date();
      let startDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      const { data, error } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('creator_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Earnings] Get by period error:', error);
      return [];
    }
  },

  /**
   * Request a withdrawal
   * @param {object} params - Withdrawal parameters
   * @param {number} params.amount - Amount to withdraw (in gems)
   * @param {string} params.bankName - Bank name
   * @param {string} params.accountNumber - Account number
   * @param {string} params.accountHolder - Account holder name
   * @returns {Promise<object>}
   */
  async requestWithdrawal({ amount, bankName, accountNumber, accountHolder }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check available balance
      const summary = await this.getEarningsSummary();
      if (!summary.success || summary.data.available < amount) {
        return { success: false, error: 'So du kha dung khong du' };
      }

      // Minimum withdrawal check
      const MIN_WITHDRAWAL = 100; // 100 gems minimum
      if (amount < MIN_WITHDRAWAL) {
        return { success: false, error: `Rut toi thieu ${MIN_WITHDRAWAL} gems` };
      }

      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          creator_id: user.id,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        })
        .select()
        .single();

      if (error) throw error;

      // Update earnings status to withdrawn
      // In production, this would be done after admin approval
      // For now, we'll mark earnings as withdrawn up to the amount
      let remaining = amount;
      const { data: availableEarnings } = await supabase
        .from('creator_earnings')
        .select('id, net_amount')
        .eq('creator_id', user.id)
        .eq('status', 'available')
        .order('created_at', { ascending: true });

      for (const earning of (availableEarnings || [])) {
        if (remaining <= 0) break;

        if (earning.net_amount <= remaining) {
          await supabase
            .from('creator_earnings')
            .update({ status: 'withdrawn' })
            .eq('id', earning.id);
          remaining -= earning.net_amount;
        }
      }

      console.log('[Earnings] Withdrawal requested:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[Earnings] Withdrawal error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get withdrawal history
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getWithdrawalHistory(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Earnings] Get withdrawals error:', error);
      return [];
    }
  },

  /**
   * Get earnings breakdown by source type
   * @returns {Promise<object>}
   */
  async getEarningsBreakdown() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from('creator_earnings')
        .select('source_type, net_amount')
        .eq('creator_id', user.id);

      if (error) throw error;

      // Aggregate by source type
      const breakdown = (data || []).reduce((acc, item) => {
        acc[item.source_type] = (acc[item.source_type] || 0) + item.net_amount;
        return acc;
      }, {});

      return breakdown;
    } catch (error) {
      console.error('[Earnings] Get breakdown error:', error);
      return {};
    }
  },

  /**
   * Calculate gems to VND conversion
   * @param {number} gems - Amount in gems
   * @returns {number} Amount in VND
   */
  gemsToVND(gems) {
    // Conversion rate: 1 gem = 200 VND (example rate)
    const RATE = 200;
    return gems * RATE;
  },

  /**
   * Format VND for display
   * @param {number} amount - Amount in VND
   * @returns {string}
   */
  formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  },

  /**
   * Get withdrawal status display info
   * @param {string} status - Withdrawal status
   * @returns {object} { label, color }
   */
  getWithdrawalStatusInfo(status) {
    const statuses = {
      pending: { label: 'Dang cho', color: '#FFB800' },
      processing: { label: 'Dang xu ly', color: '#3B82F6' },
      completed: { label: 'Hoan thanh', color: '#3AF7A6' },
      rejected: { label: 'Tu choi', color: '#FF6B6B' },
    };
    return statuses[status] || { label: status, color: '#FFFFFF' };
  },

  /**
   * Get earnings source display info
   * @param {string} sourceType - Earnings source type
   * @returns {object} { label, icon }
   */
  getSourceTypeInfo(sourceType) {
    const sources = {
      gift: { label: 'Qua tang', icon: 'gift' },
      subscription: { label: 'Goi theo doi', icon: 'users' },
      tip: { label: 'Tip', icon: 'heart' },
      ad_revenue: { label: 'Quang cao', icon: 'tv' },
    };
    return sources[sourceType] || { label: sourceType, icon: 'circle' };
  },
};

export default earningsService;
