/**
 * Gemral - Admin User Service
 *
 * Service for admin user management operations
 * Includes user listing, banning, tier management
 */

import { supabase } from './supabase';

const adminUserService = {
  /**
   * Get users with filters and pagination
   * @param {object} options - Filter options
   * @returns {object} { data, count, error }
   */
  async getUsers(options = {}) {
    const {
      search = null,
      tier = null,
      role = null,
      isBanned = null,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = options;

    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('admin_get_users', {
        p_search: search,
        p_tier: tier,
        p_role: role,
        p_is_banned: isBanned,
        p_sort_by: sortBy,
        p_sort_order: sortOrder,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      // Get total count
      let countQuery = supabase.from('profiles').select('id', { count: 'exact', head: true });

      if (search) {
        countQuery = countQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }
      if (tier) {
        countQuery = countQuery.or(`scanner_tier.eq.${tier},chatbot_tier.eq.${tier}`);
      }
      if (role) {
        countQuery = countQuery.eq('role', role);
      }
      if (isBanned !== null) {
        countQuery = countQuery.eq('is_banned', isBanned);
      }

      const { count } = await countQuery;

      return {
        data: data || [],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      console.error('[AdminUserService] Get users error:', error);
      return { data: [], count: 0, error: error.message };
    }
  },

  /**
   * Get single user details
   * @param {string} userId - User ID
   * @returns {object} User data
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          bans:user_bans(
            id,
            reason,
            ban_type,
            expires_at,
            banned_at,
            is_active
          ),
          tier_history:tier_grants(
            id,
            tier_type,
            old_tier,
            new_tier,
            reason,
            granted_at,
            expires_at
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get additional stats
      const [postsResult, ordersResult] = await Promise.all([
        supabase
          .from('forum_posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('shopify_orders')
          .select('total_price')
          .eq('customer_id', userId),
      ]);

      return {
        ...data,
        stats: {
          totalPosts: postsResult.count || 0,
          totalOrders: ordersResult.data?.length || 0,
          totalSpent: ordersResult.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('[AdminUserService] Get user error:', error);
      return { error: error.message };
    }
  },

  /**
   * Ban a user
   * @param {string} userId - User ID to ban
   * @param {string} reason - Ban reason
   * @param {string} banType - 'permanent' or 'temporary'
   * @param {Date} expiresAt - Expiration date for temporary bans
   * @returns {object} Result
   */
  async banUser(userId, reason, banType = 'permanent', expiresAt = null) {
    try {
      const { data, error } = await supabase.rpc('admin_ban_user', {
        p_user_id: userId,
        p_reason: reason,
        p_ban_type: banType,
        p_expires_at: expiresAt?.toISOString() || null,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[AdminUserService] Ban user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unban a user
   * @param {string} userId - User ID to unban
   * @param {string} reason - Unban reason
   * @returns {object} Result
   */
  async unbanUser(userId, reason = null) {
    try {
      const { data, error } = await supabase.rpc('admin_unban_user', {
        p_user_id: userId,
        p_reason: reason,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[AdminUserService] Unban user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Grant or change user tier
   * @param {string} userId - User ID
   * @param {string} tierType - 'scanner_tier' or 'chatbot_tier'
   * @param {string} newTier - New tier value ('free', 'basic', 'premium', 'vip')
   * @param {string} reason - Reason for change
   * @param {Date} expiresAt - Optional expiration for temporary grants
   * @returns {object} Result
   */
  async grantTier(userId, tierType, newTier, reason = null, expiresAt = null) {
    try {
      const { data, error } = await supabase.rpc('admin_grant_tier', {
        p_user_id: userId,
        p_tier_type: tierType,
        p_new_tier: newTier,
        p_reason: reason,
        p_expires_at: expiresAt?.toISOString() || null,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[AdminUserService] Grant tier error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user activity logs
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @returns {object} Activity logs
   */
  async getUserActivity(userId, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('admin_get_user_activity', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[AdminUserService] Get activity error:', error);
      return { data: [], error: error.message };
    }
  },

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {object} Result
   */
  async updateUserRole(userId, role) {
    try {
      const validRoles = ['user', 'creator', 'affiliate', 'teacher', 'manager', 'admin', 'super_admin'];

      if (!validRoles.includes(role)) {
        return { success: false, error: 'Role không hợp lệ' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      return { success: true, message: 'Role đã được cập nhật' };
    } catch (error) {
      console.error('[AdminUserService] Update role error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {object} Result
   */
  async sendPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      return { success: true, message: 'Email reset password đã được gửi' };
    } catch (error) {
      console.error('[AdminUserService] Reset password error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user statistics summary
   * @returns {object} Stats
   */
  async getUserStats() {
    try {
      const [totalResult, bannedResult, premiumResult, newTodayResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('scanner_tier', ['premium', 'vip']),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      ]);

      return {
        totalUsers: totalResult.count || 0,
        bannedUsers: bannedResult.count || 0,
        premiumUsers: premiumResult.count || 0,
        newToday: newTodayResult.count || 0,
      };
    } catch (error) {
      console.error('[AdminUserService] Get stats error:', error);
      return {
        totalUsers: 0,
        bannedUsers: 0,
        premiumUsers: 0,
        newToday: 0,
      };
    }
  },

  /**
   * Add gems to user account
   * @param {string} userId - User ID
   * @param {number} amount - Gems to add
   * @param {string} reason - Reason for adding
   * @returns {object} Result
   */
  async addGems(userId, amount, reason = 'Admin grant') {
    try {
      // Get current gems
      const { data: profile } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', userId)
        .single();

      const currentGems = profile?.gems || 0;
      const newBalance = currentGems + amount;

      // Update gems
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gems: newBalance })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log transaction
      await supabase.from('gems_transactions').insert({
        user_id: userId,
        type: 'admin_grant',
        amount,
        balance_before: currentGems,
        balance_after: newBalance,
        description: reason,
      });

      return { success: true, newBalance };
    } catch (error) {
      console.error('[AdminUserService] Add gems error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Log admin action
   * @param {string} userId - Target user ID
   * @param {string} actionType - Action type
   * @param {object} details - Action details
   */
  async logAction(userId, actionType, details = {}) {
    try {
      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        action_type: actionType,
        action_details: details,
      });
    } catch (error) {
      console.warn('[AdminUserService] Log action error:', error);
    }
  },
};

export default adminUserService;
