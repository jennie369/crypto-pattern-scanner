/**
 * Admin Partnership Service
 * Handles admin operations for Partnership System v3.0
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE4.md
 */

import { supabase } from './supabase';
import PARTNER_APPROVAL_SERVICE from './partnerApprovalService';
import {
  CTV_TIER_CONFIG,
  KOL_CONFIG,
  CTV_TIER_ORDER,
  formatCurrency,
  formatTierDisplay,
} from '../constants/partnershipConstants';

const ADMIN_PARTNERSHIP_SERVICE = {
  // ============================================================
  // DASHBOARD STATS
  // ============================================================

  /**
   * Get dashboard statistics for admin
   * @returns {Promise<Object|null>} Dashboard stats or null on error
   */
  async getDashboardStats() {
    try {
      // Run all queries in parallel for performance
      const [
        totalPartnersResult,
        pendingApplicationsResult,
        totalKOLsResult,
        commissionsResult,
        profilesResult,
        pendingCTVResult,
        pendingKOLResult,
      ] = await Promise.all([
        // Total active partners
        supabase
          .from('affiliate_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        // Pending applications
        supabase
          .from('partnership_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Total KOLs
        supabase
          .from('affiliate_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_kol', true)
          .eq('is_active', true),

        // Monthly commissions
        this.getMonthlyCommissions(),

        // All CTV profiles for tier distribution
        supabase
          .from('affiliate_profiles')
          .select('ctv_tier')
          .eq('role', 'ctv')
          .eq('is_active', true),

        // Pending CTV count
        supabase
          .from('partnership_applications')
          .select('*', { count: 'exact', head: true })
          .eq('application_type', 'ctv')
          .eq('status', 'pending'),

        // Pending KOL count
        supabase
          .from('partnership_applications')
          .select('*', { count: 'exact', head: true })
          .eq('application_type', 'kol')
          .eq('status', 'pending'),
      ]);

      // Calculate tier distribution
      const tierDistribution = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
        diamond: 0,
      };

      (profilesResult.data || []).forEach(p => {
        if (tierDistribution[p.ctv_tier] !== undefined) {
          tierDistribution[p.ctv_tier]++;
        }
      });

      return {
        totalPartners: totalPartnersResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        totalKOLs: totalKOLsResult.count || 0,
        monthlyCommissions: commissionsResult,
        tierDistribution,
        pendingCTV: pendingCTVResult.count || 0,
        pendingKOL: pendingKOLResult.count || 0,
      };
    } catch (err) {
      console.error('[AdminPartnershipService] getDashboardStats error:', err);
      return null;
    }
  },

  /**
   * Get total commissions for current month
   * @returns {Promise<number>} Total commission amount
   */
  async getMonthlyCommissions() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: commissions } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount')
        .gte('created_at', startOfMonth.toISOString());

      return (commissions || []).reduce(
        (sum, c) => sum + (c.commission_amount || 0), 0
      );
    } catch (err) {
      console.error('[AdminPartnershipService] getMonthlyCommissions error:', err);
      return 0;
    }
  },

  // ============================================================
  // APPLICATION MANAGEMENT
  // ============================================================

  /**
   * Get pending applications with pagination
   * @param {number} limit - Number of applications to fetch
   * @param {number} offset - Offset for pagination
   * @param {string} filter - Filter by type: 'all', 'ctv', 'kol'
   * @returns {Promise<Array>} List of pending applications
   */
  async getPendingApplications(limit = 20, offset = 0, filter = 'all') {
    try {
      let query = supabase
        .from('partnership_applications')
        .select(`
          *,
          user:profiles!partnership_applications_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply type filter
      if (filter === 'ctv') {
        query = query.eq('application_type', 'ctv');
      } else if (filter === 'kol') {
        query = query.eq('application_type', 'kol');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[AdminPartnershipService] getPendingApplications error:', err);
      return [];
    }
  },

  /**
   * Get all applications with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: [], count: number, hasMore: boolean }
   */
  async getApplications({
    status = 'all',
    type = 'all',
    page = 0,
    limit = 20,
    search = '',
  } = {}) {
    try {
      let query = supabase
        .from('partnership_applications')
        .select(`
          *,
          user:profiles!partnership_applications_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (type !== 'all') {
        query = query.eq('application_type', type);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Pagination
      const offset = page * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit,
      };
    } catch (err) {
      console.error('[AdminPartnershipService] getApplications error:', err);
      return { data: [], count: 0, hasMore: false };
    }
  },

  /**
   * Get application by ID with full details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Application details
   */
  async getApplicationById(applicationId) {
    try {
      const { data, error } = await supabase
        .from('partnership_applications')
        .select(`
          *,
          user:profiles!partnership_applications_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url,
            phone
          ),
          reviewer:profiles!partnership_applications_reviewed_by_fkey (
            id,
            full_name
          )
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[AdminPartnershipService] getApplicationById error:', err);
      return null;
    }
  },

  /**
   * Get KOL verification data for an application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Verification data
   */
  async getKOLVerification(applicationId) {
    try {
      const { data, error } = await supabase
        .from('kol_verification')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('[AdminPartnershipService] getKOLVerification error:', err);
      return null;
    }
  },

  // ============================================================
  // APPROVAL / REJECTION
  // ============================================================

  /**
   * Approve an application
   * @param {string} applicationId - Application ID
   * @param {string} type - 'ctv' or 'kol'
   * @param {string} notes - Admin notes
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async approveApplication(applicationId, type, notes = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminId = user?.id;

      if (!adminId) {
        return { success: false, error: 'Khong tim thay admin' };
      }

      let result;

      if (type === 'kol') {
        result = await PARTNER_APPROVAL_SERVICE.handleKOLApproval(applicationId, adminId, notes);
      } else {
        result = await PARTNER_APPROVAL_SERVICE.handleCTVApproval(applicationId, adminId);
      }

      if (result.success) {
        // Log admin action
        await this.logAdminAction('approve_application', {
          application_id: applicationId,
          type,
          notes,
          referral_code: result.referralCode,
        });
      }

      return result;
    } catch (err) {
      console.error('[AdminPartnershipService] approveApplication error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Reject an application
   * @param {string} applicationId - Application ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async rejectApplication(applicationId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminId = user?.id;

      if (!adminId) {
        return { success: false, error: 'Khong tim thay admin' };
      }

      if (!reason?.trim()) {
        return { success: false, error: 'Vui long nhap ly do tu choi' };
      }

      // Get application details
      const { data: app } = await supabase
        .from('partnership_applications')
        .select('user_id, application_type, full_name')
        .eq('id', applicationId)
        .single();

      if (!app) {
        return { success: false, error: 'Khong tim thay don dang ky' };
      }

      // Update application status
      await supabase
        .from('partnership_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', applicationId);

      // If KOL, update verification status
      if (app.application_type === 'kol') {
        await supabase
          .from('kol_verification')
          .update({
            verification_status: 'rejected',
            rejection_reason: reason,
          })
          .eq('application_id', applicationId);
      }

      // Send notification to user
      await supabase.from('partner_notifications').insert({
        user_id: app.user_id,
        notification_type: 'application_rejected',
        title: `Don dang ky ${app.application_type === 'kol' ? 'KOL' : 'CTV'} chua duoc duyet`,
        message: `Ly do: ${reason}`,
        metadata: {
          reason,
          type: app.application_type,
          application_id: applicationId,
        },
      });

      // Log admin action
      await this.logAdminAction('reject_application', {
        application_id: applicationId,
        type: app.application_type,
        reason,
        user_name: app.full_name,
      });

      return { success: true };
    } catch (err) {
      console.error('[AdminPartnershipService] rejectApplication error:', err);
      return { success: false, error: err.message };
    }
  },

  // ============================================================
  // PARTNER MANAGEMENT
  // ============================================================

  /**
   * Get all partners with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: [], count: number, hasMore: boolean }
   */
  async getPartners({
    role = 'all',
    tier = 'all',
    page = 0,
    limit = 20,
    search = '',
    sortBy = 'total_sales',
    sortOrder = 'desc',
  } = {}) {
    try {
      let query = supabase
        .from('affiliate_profiles')
        .select(`
          *,
          user:profiles!affiliate_profiles_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (role === 'ctv') {
        query = query.eq('role', 'ctv').eq('is_kol', false);
      } else if (role === 'kol') {
        query = query.eq('is_kol', true);
      }

      if (tier !== 'all' && CTV_TIER_ORDER.includes(tier)) {
        query = query.eq('ctv_tier', tier);
      }

      // Sort
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const offset = page * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit,
      };
    } catch (err) {
      console.error('[AdminPartnershipService] getPartners error:', err);
      return { data: [], count: 0, hasMore: false };
    }
  },

  /**
   * Get partner by ID with full details
   * @param {string} partnerId - Partner profile ID or user ID
   * @returns {Promise<Object|null>} Partner details
   */
  async getPartnerById(partnerId) {
    try {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select(`
          *,
          user:profiles!affiliate_profiles_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url,
            phone
          ),
          referrer:affiliate_profiles!affiliate_profiles_referred_by_fkey (
            user_id,
            referral_code,
            role,
            ctv_tier
          )
        `)
        .or(`id.eq.${partnerId},user_id.eq.${partnerId}`)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[AdminPartnershipService] getPartnerById error:', err);
      return null;
    }
  },

  /**
   * Update partner tier manually (admin override)
   * @param {string} partnerId - Partner ID
   * @param {string} newTier - New tier
   * @param {string} reason - Reason for change
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async updatePartnerTier(partnerId, newTier, reason = '') {
    try {
      if (!CTV_TIER_ORDER.includes(newTier)) {
        return { success: false, error: 'Tier khong hop le' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      const adminId = user?.id;

      // Get current partner data
      const { data: partner } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (!partner) {
        return { success: false, error: 'Khong tim thay doi tac' };
      }

      const oldTier = partner.ctv_tier;

      // Update tier
      await supabase
        .from('affiliate_profiles')
        .update({
          ctv_tier: newTier,
          last_tier_check_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId);

      // Send notification
      const isUpgrade = CTV_TIER_ORDER.indexOf(newTier) > CTV_TIER_ORDER.indexOf(oldTier);

      await supabase.from('partner_notifications').insert({
        user_id: partner.user_id,
        notification_type: isUpgrade ? 'tier_upgrade' : 'tier_downgrade',
        title: isUpgrade
          ? `🎉 Tier đã được nâng cấp bởi Admin`
          : `📝 Tier đã được điều chỉnh bởi Admin`,
        message: `Tier của bạn đã thay đổi từ ${formatTierDisplay(oldTier)} thành ${formatTierDisplay(newTier)}. ${reason ? `Lý do: ${reason}` : ''}`,
        metadata: {
          old_tier: oldTier,
          new_tier: newTier,
          reason,
          admin_override: true,
        },
      });

      // Log admin action
      await this.logAdminAction('update_tier', {
        partner_id: partnerId,
        user_id: partner.user_id,
        old_tier: oldTier,
        new_tier: newTier,
        reason,
      });

      return { success: true };
    } catch (err) {
      console.error('[AdminPartnershipService] updatePartnerTier error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Deactivate partner
   * @param {string} partnerId - Partner ID
   * @param {string} reason - Reason for deactivation
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async deactivatePartner(partnerId, reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminId = user?.id;

      const { data: partner } = await supabase
        .from('affiliate_profiles')
        .select('user_id')
        .eq('id', partnerId)
        .single();

      if (!partner) {
        return { success: false, error: 'Khong tim thay doi tac' };
      }

      await supabase
        .from('affiliate_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId);

      // Send notification
      await supabase.from('partner_notifications').insert({
        user_id: partner.user_id,
        notification_type: 'account_deactivated',
        title: 'Tai khoan doi tac da bi vo hieu hoa',
        message: reason || 'Vui long lien he support de biet them chi tiet.',
        metadata: { reason },
      });

      // Log admin action
      await this.logAdminAction('deactivate_partner', {
        partner_id: partnerId,
        user_id: partner.user_id,
        reason,
      });

      return { success: true };
    } catch (err) {
      console.error('[AdminPartnershipService] deactivatePartner error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Reactivate partner
   * @param {string} partnerId - Partner ID
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async reactivatePartner(partnerId) {
    try {
      const { data: partner } = await supabase
        .from('affiliate_profiles')
        .select('user_id')
        .eq('id', partnerId)
        .single();

      if (!partner) {
        return { success: false, error: 'Khong tim thay doi tac' };
      }

      await supabase
        .from('affiliate_profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId);

      // Send notification
      await supabase.from('partner_notifications').insert({
        user_id: partner.user_id,
        notification_type: 'account_reactivated',
        title: 'Tai khoan doi tac da duoc kich hoat lai',
        message: 'Chao mung ban quay tro lai chuong trinh Partnership!',
      });

      // Log admin action
      await this.logAdminAction('reactivate_partner', {
        partner_id: partnerId,
        user_id: partner.user_id,
      });

      return { success: true };
    } catch (err) {
      console.error('[AdminPartnershipService] reactivatePartner error:', err);
      return { success: false, error: err.message };
    }
  },

  // ============================================================
  // COMMISSION MANAGEMENT
  // ============================================================

  /**
   * Get commission history with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: [], count: number }
   */
  async getCommissionHistory({
    partnerId = null,
    status = 'all',
    startDate = null,
    endDate = null,
    page = 0,
    limit = 50,
  } = {}) {
    try {
      let query = supabase
        .from('affiliate_commissions')
        .select(`
          *,
          affiliate:affiliate_profiles!affiliate_commissions_affiliate_id_fkey (
            referral_code,
            role,
            ctv_tier,
            user:profiles!affiliate_profiles_user_id_fkey (
              full_name,
              email
            )
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (partnerId) {
        query = query.eq('affiliate_id', partnerId);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const offset = page * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (err) {
      console.error('[AdminPartnershipService] getCommissionHistory error:', err);
      return { data: [], count: 0 };
    }
  },

  // ============================================================
  // SCHEDULED JOBS (Manual Trigger)
  // ============================================================

  /**
   * Manually trigger tier evaluation
   * @param {string} action - 'weekly_upgrade', 'monthly_downgrade', 'ctv_auto_approve', 'reset_monthly_sales'
   * @returns {Promise<Object>} Result from Edge Function
   */
  async triggerTierEvaluation(action) {
    try {
      const { data, error } = await supabase.functions.invoke('tier-evaluation', {
        body: { action },
      });

      if (error) throw error;

      // Log admin action
      await this.logAdminAction('trigger_tier_evaluation', {
        action,
        result: data,
      });

      return data;
    } catch (err) {
      console.error('[AdminPartnershipService] triggerTierEvaluation error:', err);
      return { success: false, error: err.message };
    }
  },

  // ============================================================
  // ADMIN LOGGING
  // ============================================================

  /**
   * Log admin action for audit trail
   * @param {string} actionType - Type of action
   * @param {Object} details - Action details
   */
  async logAdminAction(actionType, details = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('admin_logs').insert({
        admin_id: user?.id,
        action_type: actionType,
        target_type: 'partnership',
        details,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[AdminPartnershipService] logAdminAction error:', err);
      // Don't throw - logging failure shouldn't break main operation
    }
  },

  // ============================================================
  // REPORTS
  // ============================================================

  /**
   * Get partnership report summary
   * @param {string} period - 'week', 'month', 'quarter', 'year'
   * @returns {Promise<Object>} Report data
   */
  async getReportSummary(period = 'month') {
    try {
      const startDate = this.getStartDateForPeriod(period);

      // Get new partners
      const { count: newPartners } = await supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get total sales
      const { data: salesData } = await supabase
        .from('affiliate_commissions')
        .select('order_amount')
        .gte('created_at', startDate.toISOString());

      const totalSales = (salesData || []).reduce((sum, c) => sum + (c.order_amount || 0), 0);

      // Get total commissions
      const { data: commData } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount')
        .gte('created_at', startDate.toISOString());

      const totalCommissions = (commData || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0);

      // Get tier changes
      const { count: tierUpgrades } = await supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_upgrade_at', startDate.toISOString());

      const { count: tierDowngrades } = await supabase
        .from('affiliate_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_downgrade_at', startDate.toISOString());

      return {
        period,
        startDate: startDate.toISOString(),
        newPartners: newPartners || 0,
        totalSales,
        totalCommissions,
        tierUpgrades: tierUpgrades || 0,
        tierDowngrades: tierDowngrades || 0,
        avgCommissionRate: totalSales > 0 ? (totalCommissions / totalSales * 100).toFixed(2) : 0,
      };
    } catch (err) {
      console.error('[AdminPartnershipService] getReportSummary error:', err);
      return null;
    }
  },

  /**
   * Get start date for report period
   * @param {string} period - Period type
   * @returns {Date} Start date
   */
  getStartDateForPeriod(period) {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  },
};

export default ADMIN_PARTNERSHIP_SERVICE;
