/**
 * Partnership Service
 * Handles Affiliate/CTV registration, status, and withdrawals
 */

import { supabase } from './supabase';

export const partnershipService = {
  /**
   * Get current partnership status for user
   * Returns: has_partnership, affiliate_code, role, tier, commissions, application status
   */
  async getPartnershipStatus(userId) {
    try {
      const { data, error } = await supabase.rpc('get_partnership_status', {
        user_id_param: userId,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting partnership status:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  /**
   * Check if user is eligible for CTV (has purchased courses)
   */
  async checkCtvEligibility(userId) {
    try {
      const { data, error } = await supabase.rpc('check_ctv_eligibility', {
        user_id_param: userId,
      });

      if (error) throw error;
      return { success: true, eligible: data };
    } catch (error) {
      console.error('Error checking CTV eligibility:', error);
      return { success: false, eligible: false };
    }
  },

  /**
   * Get user's owned courses (for CTV application)
   */
  async getUserCourses(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_courses', {
        user_id_param: userId,
      });

      if (error) throw error;
      return { success: true, courses: data || [] };
    } catch (error) {
      console.error('Error getting user courses:', error);
      return { success: false, courses: [] };
    }
  },

  /**
   * Submit partnership application (Affiliate or CTV)
   * @param {Object} formData
   * @param {string} formData.userId
   * @param {string} formData.applicationType - 'affiliate' or 'ctv'
   * @param {string} formData.fullName
   * @param {string} formData.email
   * @param {string} formData.phone
   * @param {string} formData.reason - CTV only
   * @param {string} formData.marketingChannels - CTV only
   * @param {string} formData.estimatedSales - CTV only
   */
  async submitApplication(formData) {
    try {
      const { data, error } = await supabase.rpc('submit_partnership_application', {
        user_id_param: formData.userId,
        app_type: formData.applicationType,
        full_name_param: formData.fullName,
        email_param: formData.email,
        phone_param: formData.phone || null,
        reason_param: formData.reason || null,
        channels_param: formData.marketingChannels || null,
        estimated_sales_param: formData.estimatedSales || null,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error.message || 'Có lỗi xảy ra khi gửi đơn đăng ký',
      };
    }
  },

  /**
   * Cancel pending application
   */
  async cancelApplication(applicationId) {
    try {
      const { error } = await supabase
        .from('partnership_applications')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('status', 'pending');

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error cancelling application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get application history
   */
  async getApplicationHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, applications: data || [] };
    } catch (error) {
      console.error('Error getting application history:', error);
      return { success: false, applications: [] };
    }
  },

  /**
   * Request withdrawal
   * @param {Object} withdrawalData
   * @param {string} withdrawalData.partnerId
   * @param {number} withdrawalData.amount
   * @param {string} withdrawalData.bankName
   * @param {string} withdrawalData.accountNumber
   * @param {string} withdrawalData.accountHolder
   */
  async requestWithdrawal(withdrawalData) {
    try {
      const { data, error } = await supabase.rpc('request_withdrawal', {
        partner_id_param: withdrawalData.partnerId,
        amount_param: withdrawalData.amount,
        bank_name_param: withdrawalData.bankName,
        account_number_param: withdrawalData.accountNumber,
        account_holder_param: withdrawalData.accountHolder,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return {
        success: false,
        error: error.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền',
      };
    }
  },

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(partnerId) {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, history: data || [] };
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      return { success: false, history: [] };
    }
  },

  /**
   * Get commission statistics
   * Uses affiliate_profiles and affiliate_sales tables per DATABASE_SCHEMA.md
   */
  async getCommissionStats(partnerId) {
    try {
      // First get the affiliate_profile for this user
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('id, total_commission, pending_commission, paid_commission')
        .eq('user_id', partnerId)
        .single();

      if (profileError || !affiliateProfile) {
        console.log('[Partnership] No affiliate profile found');
        return {
          success: true,
          stats: {
            totalCommission: 0,
            pendingCommission: 0,
            paidCommission: 0,
            digitalCommission: 0,
            physicalCommission: 0,
            totalOrders: 0,
            thisMonthCommission: 0,
            thisMonthOrders: 0,
          },
        };
      }

      // Get sales from affiliate_sales table
      const { data: sales, error: salesError } = await supabase
        .from('affiliate_sales')
        .select('commission_amount, status, product_type, created_at')
        .eq('affiliate_id', affiliateProfile.id);

      if (salesError) {
        console.log('[Partnership] affiliate_sales error:', salesError);
      }

      // Calculate stats
      const stats = {
        totalCommission: parseFloat(affiliateProfile.total_commission) || 0,
        pendingCommission: parseFloat(affiliateProfile.pending_commission) || 0,
        paidCommission: parseFloat(affiliateProfile.paid_commission) || 0,
        digitalCommission: 0,
        physicalCommission: 0,
        totalOrders: sales?.length || 0,
        thisMonthCommission: 0,
        thisMonthOrders: 0,
      };

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      // Calculate from sales data if available
      (sales || []).forEach((sale) => {
        const amount = parseFloat(sale.commission_amount) || 0;

        // Product type breakdown
        const isDigital = sale.product_type === 'course' || sale.product_type === 'subscription' || sale.product_type === 'digital';
        if (isDigital) {
          stats.digitalCommission += amount;
        } else {
          stats.physicalCommission += amount;
        }

        // This month stats
        const createdAt = new Date(sale.created_at);
        if (createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear) {
          stats.thisMonthCommission += amount;
          stats.thisMonthOrders += 1;
        }
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting commission stats:', error);
      return {
        success: false,
        stats: {
          totalCommission: 0,
          pendingCommission: 0,
          paidCommission: 0,
          digitalCommission: 0,
          physicalCommission: 0,
          totalOrders: 0,
          thisMonthCommission: 0,
          thisMonthOrders: 0,
        },
      };
    }
  },

  /**
   * Get recent orders with commission
   * Uses affiliate_sales table per DATABASE_SCHEMA.md
   */
  async getRecentOrdersWithCommission(partnerId, limit = 10) {
    try {
      // First get the affiliate_profile for this user
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('user_id', partnerId)
        .single();

      if (profileError || !affiliateProfile) {
        return { success: true, orders: [] };
      }

      const { data, error } = await supabase
        .from('affiliate_sales')
        .select(`
          id,
          order_id,
          shopify_order_id,
          product_type,
          product_name,
          sale_amount,
          commission_rate,
          commission_amount,
          status,
          created_at
        `)
        .eq('affiliate_id', affiliateProfile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Map to expected format
      const orders = (data || []).map(sale => ({
        id: sale.id,
        shopify_order_id: sale.shopify_order_id || sale.order_id,
        order_total: sale.sale_amount,
        product_type: sale.product_type === 'course' || sale.product_type === 'subscription' ? 'digital' : 'physical',
        product_category: sale.product_type,
        product_name: sale.product_name,
        commission_rate: sale.commission_rate,
        commission_amount: sale.commission_amount,
        status: sale.status,
        created_at: sale.created_at
      }));

      return { success: true, orders };
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return { success: false, orders: [] };
    }
  },

  /**
   * Get referral link
   */
  getReferralLink(affiliateCode) {
    // Use yinyangmasters.com for Shopify
    return `https://yinyangmasters.com/?ref=${affiliateCode}`;
  },

  /**
   * Get referral link for app
   */
  getAppReferralLink(affiliateCode) {
    return `https://gemral.com/?ref=${affiliateCode}`;
  },

  /**
   * Subscribe to partnership updates (real-time)
   * Uses partnership_applications and affiliate_profiles tables per DATABASE_SCHEMA.md
   */
  subscribeToPartnershipUpdates(userId, callback) {
    const subscription = supabase
      .channel(`partnership_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnership_applications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'affiliate_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};

export default partnershipService;
