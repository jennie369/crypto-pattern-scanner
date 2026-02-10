/**
 * User Service for Admin Dashboard
 * CRUD operations for user management
 */

import { supabase } from './supabase';

// ============================================
// USER QUERIES
// ============================================

/**
 * Get all users with filters
 */
export async function getUsers({
  search = '',
  tier = 'all',
  status = 'all',
  page = 1,
  limit = 50
}) {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (tier !== 'all') {
      query = query.eq('subscription_tier', tier);
    }

    if (status === 'active') {
      query = query.eq('is_banned', false);
    } else if (status === 'banned') {
      query = query.eq('is_banned', true);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[userService] getUsers error:', error);
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[userService] getUserById error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active users (not banned)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', false);

    // Tier distribution
    const { data: tierData } = await supabase
      .from('profiles')
      .select('subscription_tier');

    const tierDistribution = {
      free: 0,
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
    };

    (tierData || []).forEach((u) => {
      const tier = u.subscription_tier || 'free';
      if (tierDistribution.hasOwnProperty(tier)) {
        tierDistribution[tier]++;
      }
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: newToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        bannedUsers: (totalUsers || 0) - (activeUsers || 0),
        newToday: newToday || 0,
        newThisMonth: newThisMonth || 0,
        tierDistribution,
      },
    };
  } catch (error) {
    console.error('[userService] getUserStats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user tier
 */
export async function updateUserTier(userId, newTier) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    await logUserAction(userId, 'tier_change', { new_tier: newTier });

    return { success: true, data };
  } catch (error) {
    console.error('[userService] updateUserTier error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ban/Unban user
 */
export async function toggleUserBan(userId, isBanned, reason = '') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: isBanned,
        ban_reason: isBanned ? reason : null,
        banned_at: isBanned ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    await logUserAction(userId, isBanned ? 'ban' : 'unban', { reason });

    return { success: true, data };
  } catch (error) {
    console.error('[userService] toggleUserBan error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user activity/transactions
 */
export async function getUserActivity(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[userService] getUserActivity error:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Get expiring subscriptions
 */
export async function getExpiringSubscriptions(daysAhead = 7) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('subscription_tier', 'free')
      .lte('subscription_expires_at', futureDate.toISOString())
      .gte('subscription_expires_at', new Date().toISOString())
      .order('subscription_expires_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[userService] getExpiringSubscriptions error:', error);
    return { success: false, data: [], error: error.message };
  }
}

// ============================================
// ADMIN LOGS
// ============================================

async function logUserAction(userId, action, details) {
  try {
    await supabase
      .from('admin_user_logs')
      .insert({
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('[userService] logUserAction error:', error);
  }
}

/**
 * Get admin logs for a user
 */
export async function getUserLogs(userId) {
  try {
    const { data, error } = await supabase
      .from('admin_user_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[userService] getUserLogs error:', error);
    return { success: false, data: [], error: error.message };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToUsers(callback) {
  return supabase
    .channel('profiles_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      callback
    )
    .subscribe();
}

export function unsubscribe(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

export default {
  getUsers,
  getUserById,
  getUserStats,
  updateUserTier,
  toggleUserBan,
  getUserActivity,
  getExpiringSubscriptions,
  getUserLogs,
  subscribeToUsers,
  unsubscribe,
};
