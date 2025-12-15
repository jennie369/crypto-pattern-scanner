/**
 * Subscription Expiration Service
 * Manages subscription expiration checking, notifications, and admin functions
 *
 * Created: December 14, 2025
 */

import { supabase } from './supabase';

// Tier display names
const TIER_TYPE_NAMES = {
  chatbot_tier: 'GEM Master AI',
  scanner_tier: 'Pattern Scanner',
  course_tier: 'Khóa học',
};

const TIER_VALUE_NAMES = {
  TIER1: 'Tier 1',
  TIER2: 'Tier 2',
  TIER3: 'Tier 3 VIP',
  PRO: 'Pro',
  PREMIUM: 'Premium',
  VIP: 'VIP',
  FREE: 'Free',
};

/**
 * Format tier name for display
 */
export const formatTierName = (tierType, tierValue) => {
  const typeName = TIER_TYPE_NAMES[tierType] || tierType;
  const valueName = TIER_VALUE_NAMES[tierValue?.toUpperCase()] || tierValue;
  return `${typeName} ${valueName}`;
};

/**
 * Format days remaining text
 */
export const formatDaysRemaining = (days) => {
  if (days === null || days === undefined) return 'Không giới hạn';
  if (days <= 0) return 'Đã hết hạn';
  if (days === 1) return 'Còn 1 ngày';
  return `Còn ${days} ngày`;
};

/**
 * Get warning level based on days remaining
 */
export const getExpirationWarningLevel = (daysRemaining) => {
  if (daysRemaining === null) return null;
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= 3) return 'warning';
  if (daysRemaining <= 7) return 'notice';
  return null;
};

/**
 * Get expiring users count for admin dashboard
 * @param {number} daysAhead - Days to look ahead (default 7)
 * @returns {Promise<Object>} - Count statistics
 */
export const getExpiringUsersCount = async (daysAhead = 7) => {
  try {
    const { data, error } = await supabase.rpc('get_expiring_users_count', {
      p_days_ahead: daysAhead,
    });

    if (error) throw error;

    return {
      success: true,
      data: data?.[0] || {
        total_expiring: 0,
        expiring_today: 0,
        expiring_3_days: 0,
        expiring_7_days: 0,
        chatbot_expiring: 0,
        scanner_expiring: 0,
        course_expiring: 0,
      },
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] getExpiringUsersCount error:', err);
    return {
      success: false,
      error: err.message,
      data: {
        total_expiring: 0,
        expiring_today: 0,
        expiring_3_days: 0,
        expiring_7_days: 0,
        chatbot_expiring: 0,
        scanner_expiring: 0,
        course_expiring: 0,
      },
    };
  }
};

/**
 * Get list of expiring users for admin dashboard
 * @param {Object} options - { daysAhead, tierType, limit, offset }
 * @returns {Promise<Object>} - List of expiring users
 */
export const getExpiringUsers = async (options = {}) => {
  const {
    daysAhead = 7,
    tierType = null,
    limit = 50,
    offset = 0,
  } = options;

  try {
    const { data, error } = await supabase.rpc('get_expiring_users', {
      p_days_ahead: daysAhead,
      p_tier_type: tierType,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] getExpiringUsers error:', err);
    return {
      success: false,
      error: err.message,
      data: [],
    };
  }
};

/**
 * Get expiration logs for admin
 * @param {Object} options - { limit, offset, userId }
 * @returns {Promise<Object>} - Expiration logs
 */
export const getExpirationLogs = async (options = {}) => {
  const { limit = 50, offset = 0, userId = null } = options;

  try {
    const { data, error } = await supabase.rpc('get_expiration_logs', {
      p_limit: limit,
      p_offset: offset,
      p_user_id: userId,
    });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] getExpirationLogs error:', err);
    return {
      success: false,
      error: err.message,
      data: [],
    };
  }
};

/**
 * Extend user subscription (admin only)
 * @param {string} userId - User ID
 * @param {string} tierType - 'chatbot_tier', 'scanner_tier', 'course_tier'
 * @param {number} days - Days to extend
 * @param {string} reason - Reason for extension
 * @returns {Promise<Object>}
 */
export const extendSubscription = async (userId, tierType, days, reason = null) => {
  try {
    const { data, error } = await supabase.rpc('admin_extend_subscription', {
      p_user_id: userId,
      p_tier_type: tierType,
      p_days: days,
      p_reason: reason,
    });

    if (error) throw error;

    return {
      success: data?.success || false,
      data,
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] extendSubscription error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Trigger subscription check manually (admin only)
 * Calls the Edge Function to check and revoke expired subscriptions
 * @param {string} action - 'check_expired', 'send_notifications', 'both'
 * @returns {Promise<Object>}
 */
export const triggerSubscriptionCheck = async (action = 'both') => {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-checker', {
      body: { action },
    });

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] triggerSubscriptionCheck error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Get user's subscription status with expiration info
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - All subscription info
 */
export const getUserSubscriptionStatus = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        chatbot_tier,
        chatbot_tier_expires_at,
        scanner_tier,
        scanner_tier_expires_at,
        course_tier,
        course_tier_expires_at
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    const now = new Date();

    const processSubscription = (tier, expiresAt, tierType) => {
      if (!tier || tier === 'FREE') {
        return {
          tier: 'FREE',
          tierName: formatTierName(tierType, 'FREE'),
          expiresAt: null,
          daysRemaining: null,
          isExpired: false,
          warningLevel: null,
        };
      }

      const expireDate = expiresAt ? new Date(expiresAt) : null;
      const daysRemaining = expireDate
        ? Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24))
        : null;
      const isExpired = expireDate ? expireDate < now : false;

      return {
        tier,
        tierName: formatTierName(tierType, tier),
        expiresAt,
        daysRemaining: isExpired ? 0 : daysRemaining,
        isExpired,
        warningLevel: getExpirationWarningLevel(isExpired ? 0 : daysRemaining),
      };
    };

    return {
      success: true,
      data: {
        chatbot: processSubscription(
          profile.chatbot_tier,
          profile.chatbot_tier_expires_at,
          'chatbot_tier'
        ),
        scanner: processSubscription(
          profile.scanner_tier,
          profile.scanner_tier_expires_at,
          'scanner_tier'
        ),
        course: processSubscription(
          profile.course_tier,
          profile.course_tier_expires_at,
          'course_tier'
        ),
      },
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] getUserSubscriptionStatus error:', err);
    return {
      success: false,
      error: err.message,
      data: null,
    };
  }
};

/**
 * Send manual renewal reminder to user (admin only)
 * @param {string} userId - User ID
 * @param {string} tierType - Tier type
 * @returns {Promise<Object>}
 */
export const sendRenewalReminder = async (userId, tierType) => {
  try {
    // Get user info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_token, email, full_name, chatbot_tier, scanner_tier, course_tier')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const currentTier = profile[tierType] || 'FREE';

    // Create in-app notification
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'renewal_reminder',
      title: `Gia hạn ${formatTierName(tierType, currentTier)}`,
      body: 'Admin đã gửi nhắc nhở gia hạn. Gia hạn ngay để tiếp tục sử dụng đầy đủ tính năng!',
      data: {
        tier_type: tierType,
        current_tier: currentTier,
        action: 'renew',
      },
      is_read: false,
    });

    if (notifError) throw notifError;

    // Send push notification if token exists
    if (profile.push_token) {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          notificationId: `renewal-${userId}-${Date.now()}`,
          notification: {
            title: `Gia hạn ${formatTierName(tierType, currentTier)}`,
            body: 'Gia hạn ngay để tiếp tục sử dụng đầy đủ tính năng!',
            data: {
              type: 'renewal_reminder',
              tier_type: tierType,
              action: 'renew',
            },
          },
          tokens: [profile.push_token],
          userIds: [userId],
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.error('[subscriptionExpirationService] sendRenewalReminder error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Get notification history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export const getExpirationNotificationHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscription_expiration_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error('[subscriptionExpirationService] getExpirationNotificationHistory error:', err);
    return {
      success: false,
      error: err.message,
      data: [],
    };
  }
};

export default {
  formatTierName,
  formatDaysRemaining,
  getExpirationWarningLevel,
  getExpiringUsersCount,
  getExpiringUsers,
  getExpirationLogs,
  extendSubscription,
  triggerSubscriptionCheck,
  getUserSubscriptionStatus,
  sendRenewalReminder,
  getExpirationNotificationHistory,
};
