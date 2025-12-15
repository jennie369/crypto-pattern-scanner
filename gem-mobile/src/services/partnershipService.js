/**
 * Partnership Service
 * Handles Affiliate/CTV registration, status, and withdrawals
 */

import { supabase } from './supabase';

export const partnershipService = {
  /**
   * Get current partnership status for user
   * Returns: has_partnership, affiliate_code, role, tier, commissions, application status
   * With fallback to direct database query if RPC fails
   */
  async getPartnershipStatus(userId) {
    try {
      // Try RPC first
      const { data, error } = await supabase.rpc('get_partnership_status', {
        user_id_param: userId,
      });

      if (error) {
        console.log('[Partnership] RPC failed, using fallback:', error.message);
        return await this.getPartnershipStatusFallback(userId);
      }

      if (data) {
        console.log('[Partnership] RPC success:', data);
        return { success: true, data };
      }

      // RPC returned null, use fallback
      console.log('[Partnership] RPC returned null, using fallback');
      return await this.getPartnershipStatusFallback(userId);
    } catch (error) {
      console.error('Error getting partnership status:', error);
      return await this.getPartnershipStatusFallback(userId);
    }
  },

  /**
   * Fallback: Get partnership status directly from database tables
   */
  async getPartnershipStatusFallback(userId) {
    try {
      console.log('[Partnership] Using fallback for user:', userId);

      // 1. Check affiliate_profiles table for approved partnership
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.log('[Partnership] affiliate_profiles query error:', profileError.message);
      }

      // 2. Check partnership_applications table for pending/rejected applications
      const { data: applications, error: appError } = await supabase
        .from('partnership_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (appError) {
        console.log('[Partnership] partnership_applications query error:', appError.message);
      }

      const latestApp = applications?.[0];

      // 3. Check profiles table for partnership_role
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('partnership_role, affiliate_code, ctv_tier')
        .eq('id', userId)
        .single();

      if (pError) {
        console.log('[Partnership] profiles query error:', pError.message);
      }

      // 4. Check CTV eligibility (has purchased course)
      let isCtvEligible = false;
      try {
        const { data: courseAccess } = await supabase
          .from('course_access')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        isCtvEligible = courseAccess && courseAccess.length > 0;
      } catch (e) {
        console.log('[Partnership] course_access query error');
      }

      // Build response
      const hasPartnership = !!(affiliateProfile || profile?.partnership_role);
      const hasApplication = !!latestApp;

      const result = {
        // Partnership info
        has_partnership: hasPartnership,
        partnership_role: affiliateProfile?.partnership_type || profile?.partnership_role || null,
        affiliate_code: affiliateProfile?.affiliate_code || profile?.affiliate_code || null,
        ctv_tier: affiliateProfile?.tier || profile?.ctv_tier || 1,

        // Commission info from affiliate_profiles
        total_commission: parseFloat(affiliateProfile?.total_commission || 0),
        pending_commission: parseFloat(affiliateProfile?.pending_commission || 0),
        available_balance: parseFloat(affiliateProfile?.available_balance || affiliateProfile?.total_commission || 0) - parseFloat(affiliateProfile?.pending_commission || 0),

        // Application info
        has_application: hasApplication,
        application_status: latestApp?.status || null,
        application_type: latestApp?.application_type || null,
        application_date: latestApp?.created_at || null,
        rejection_reason: latestApp?.rejection_reason || null,

        // Eligibility
        is_ctv_eligible: isCtvEligible,
      };

      console.log('[Partnership] Fallback result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('[Partnership] Fallback error:', error);
      // Return empty state to show registration options
      return {
        success: true,
        data: {
          has_partnership: false,
          has_application: false,
          is_ctv_eligible: false,
        },
      };
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

      // Notify admins about new application
      if (data?.success) {
        await this.notifyAdminsNewApplication({
          applicationId: data.application_id,
          applicationType: formData.applicationType,
          fullName: formData.fullName,
          userId: formData.userId,
        });
      }

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
   * Notify admins about new partnership application
   */
  async notifyAdminsNewApplication({ applicationId, applicationType, fullName, userId }) {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .or('role.eq.admin,is_admin.eq.true');

      if (!admins || admins.length === 0) {
        console.log('[Partnership] No admins found to notify');
        return;
      }

      const typeText = applicationType === 'ctv' ? 'CTV' : 'Affiliate';

      // Create notifications for each admin
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'admin_partnership_application',
        title: `Đơn đăng ký ${typeText} mới`,
        message: `${fullName} vừa đăng ký làm ${typeText}. Vui lòng xem xét và duyệt đơn.`,
        data: JSON.stringify({
          application_id: applicationId,
          application_type: applicationType,
          applicant_id: userId,
          screen: 'AdminApplications',
        }),
        read: false,
      }));

      // Insert into forum_notifications (same table used by NotificationsScreen)
      const { error } = await supabase.from('forum_notifications').insert(notifications);

      if (error) {
        console.error('[Partnership] Error inserting admin notifications:', error);
        // Try 'notifications' table as fallback
        await supabase.from('notifications').insert(notifications);
      } else {
        console.log('[Partnership] Admin notifications sent:', admins.length);
      }
    } catch (error) {
      console.error('[Partnership] notifyAdminsNewApplication error:', error);
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
