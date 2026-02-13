/**
 * Partner Notification Service
 * Handles partner-specific notifications (in-app, push, email)
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE5.md
 */

import { supabase } from './supabase';
import { NOTIFICATION_TYPES } from '../constants/partnershipConstants';
import EMAIL_SERVICE from './emailService';

// Vietnamese tier names
const TIER_NAMES = {
  bronze: '🥉 Đồng',
  silver: '🥈 Bạc',
  gold: '🥇 Vàng',
  platinum: '💎 Bạch Kim',
  diamond: '👑 Kim Cương',
};

const PARTNER_NOTIFICATION_SERVICE = {
  // ========================================
  // PUSH NOTIFICATION METHODS (Phase 5)
  // ========================================

  /**
   * Send push notification via Edge Function
   * @param {Object} options - Notification options
   */
  async sendPush({ userId, userIds, notificationType, title, body, data, channelId }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: {
          user_id: userId,
          user_ids: userIds,
          notification_type: notificationType,
          title,
          body,
          data,
          channel_id: channelId,
        },
      });

      if (error) {
        console.error('[PartnerNotification] Push error:', error);
        return { success: false, error: error.message };
      }

      console.log(`[PartnerNotification] Push sent: ${notificationType}`);
      return { success: true, result };
    } catch (err) {
      console.error('[PartnerNotification] Push error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Notify user of application submission
   */
  async notifyApplicationSubmitted(userId, applicationType) {
    const roleLabel = applicationType === 'kol' ? 'KOL Affiliate' : 'CTV';
    await this.sendPush({
      userId,
      notificationType: 'application_submitted',
      title: '📝 Đơn đăng ký đã gửi',
      body: `Đơn đăng ký ${roleLabel} của bạn đang được xem xét.`,
      data: { application_type: applicationType },
      channelId: 'partnership',
    });
  },

  /**
   * Notify user of application approval (push + email)
   */
  async notifyApplicationApproved(userId, email, name, applicationType, referralCode) {
    const isKOL = applicationType === 'kol';
    const roleLabel = isKOL ? 'KOL Affiliate' : `Đối Tác Phát Triển ${TIER_NAMES.bronze}`;

    // Send push
    await this.sendPush({
      userId,
      notificationType: 'application_approved',
      title: '🎉 Chúc mừng! Đơn đã được duyệt',
      body: `Bạn đã trở thành ${roleLabel}!`,
      data: { role: applicationType, referral_code: referralCode },
      channelId: 'partnership',
    });

    // Send email
    if (email) {
      if (isKOL) {
        await EMAIL_SERVICE.sendWelcomeKOL(email, name, referralCode);
      } else {
        await EMAIL_SERVICE.sendWelcomeCTV(email, name, referralCode);
      }
    }
  },

  /**
   * Notify user of application rejection (push + email)
   */
  async notifyApplicationRejected(userId, email, name, applicationType, reason) {
    await this.sendPush({
      userId,
      notificationType: 'application_rejected',
      title: '❌ Đơn đăng ký không được duyệt',
      body: reason || 'Vui lòng xem chi tiết trong email.',
      data: { application_type: applicationType, reason },
      channelId: 'partnership',
    });

    if (email) {
      await EMAIL_SERVICE.sendApplicationRejected(email, name, applicationType, reason);
    }
  },

  /**
   * Notify user of tier upgrade (push + email)
   */
  async notifyTierUpgrade(userId, email, name, oldTier, newTier) {
    await this.sendPush({
      userId,
      notificationType: 'tier_upgrade',
      title: '🎉 Chúc mừng thăng cấp!',
      body: `Bạn đã lên ${TIER_NAMES[newTier]} từ ${TIER_NAMES[oldTier]}!`,
      data: { old_tier: oldTier, new_tier: newTier },
      channelId: 'tier',
    });

    if (email) {
      await EMAIL_SERVICE.sendTierUpgrade(email, name, oldTier, newTier);
    }
  },

  /**
   * Notify user of tier downgrade (push + email)
   */
  async notifyTierDowngrade(userId, email, name, oldTier, newTier) {
    await this.sendPush({
      userId,
      notificationType: 'tier_downgrade',
      title: '📉 Thông báo giảm cấp',
      body: `Tier đã giảm xuống ${TIER_NAMES[newTier]}. Tăng doanh số để lên lại!`,
      data: { old_tier: oldTier, new_tier: newTier },
      channelId: 'tier',
    });

    if (email) {
      await EMAIL_SERVICE.sendTierDowngrade(email, name, newTier);
    }
  },

  /**
   * Notify user of commission earned
   */
  async notifyCommissionEarned(userId, amount, orderId) {
    await this.sendPush({
      userId,
      notificationType: 'commission_earned',
      title: '💰 Hoa hồng mới',
      body: `Bạn nhận được ${formatCurrency(amount)} hoa hồng!`,
      data: { amount, order_id: orderId },
      channelId: 'commission',
    });
  },

  /**
   * Notify user of sub-affiliate commission
   */
  async notifySubAffiliateCommission(userId, amount, subAffiliateName) {
    await this.sendPush({
      userId,
      notificationType: 'sub_affiliate_commission',
      title: '👥 Hoa hồng từ đội ngũ',
      body: `Nhận ${formatCurrency(amount)} từ ${subAffiliateName}!`,
      data: { amount, sub_affiliate_name: subAffiliateName },
      channelId: 'commission',
    });
  },

  /**
   * Notify user of withdrawal approval (push + email)
   */
  async notifyWithdrawalApproved(userId, email, name, amount, bankInfo) {
    await this.sendPush({
      userId,
      notificationType: 'withdrawal_approved',
      title: '✅ Rút tiền đã duyệt',
      body: `Yêu cầu rút ${formatCurrency(amount)} đã được duyệt!`,
      data: { amount },
      channelId: 'commission',
    });

    if (email && bankInfo) {
      await EMAIL_SERVICE.sendWithdrawalApproved(email, name, amount, bankInfo.bankName, bankInfo.accountNumber);
    }
  },

  /**
   * Notify user of withdrawal rejection (push + email)
   */
  async notifyWithdrawalRejected(userId, email, name, amount, reason) {
    await this.sendPush({
      userId,
      notificationType: 'withdrawal_rejected',
      title: '❌ Rút tiền bị từ chối',
      body: reason || 'Vui lòng xem chi tiết trong email.',
      data: { amount, reason },
      channelId: 'commission',
    });

    if (email) {
      await EMAIL_SERVICE.sendWithdrawalRejected(email, name, amount, reason);
    }
  },

  /**
   * Send bulk notification to multiple partners
   */
  async sendBulkNotification(userIds, notificationType, title, body, data = {}) {
    if (!userIds || userIds.length === 0) return { success: false, error: 'No user IDs' };
    return this.sendPush({ userIds, notificationType, title, body, data, channelId: 'partnership' });
  },

  // ========================================
  // IN-APP NOTIFICATION METHODS
  // ========================================

  /**
   * Get partner notifications with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { success, notifications, hasMore, total }
   */
  async getNotifications(page = 0, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, notifications: [], hasMore: false, total: 0 };
      }

      const { data, error, count } = await supabase
        .from('partner_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      return {
        success: true,
        notifications: data || [],
        hasMore: (count || 0) > (page + 1) * limit,
        total: count || 0,
      };
    } catch (err) {
      console.error('[PartnerNotificationService] getNotifications error:', err);
      return { success: false, notifications: [], hasMore: false, total: 0 };
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('partner_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      return count || 0;
    } catch (err) {
      console.error('[PartnerNotificationService] getUnreadCount error:', err);
      return 0;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('partner_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[PartnerNotificationService] markAsRead error:', err);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>} Success
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('partner_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[PartnerNotificationService] markAllAsRead error:', err);
      return false;
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('partner_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[PartnerNotificationService] deleteNotification error:', err);
      return false;
    }
  },

  /**
   * Clear all notifications
   * @returns {Promise<boolean>} Success
   */
  async clearAllNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('partner_notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[PartnerNotificationService] clearAllNotifications error:', err);
      return false;
    }
  },

  /**
   * Get notifications by type
   * @param {string} type - Notification type
   * @param {number} limit - Max items
   * @returns {Promise<Object>} { success, notifications }
   */
  async getNotificationsByType(type, limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, notifications: [] };

      const { data, error } = await supabase
        .from('partner_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('notification_type', type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, notifications: data || [] };
    } catch (err) {
      console.error('[PartnerNotificationService] getNotificationsByType error:', err);
      return { success: false, notifications: [] };
    }
  },

  /**
   * Create notification (for internal use or testing)
   * @param {string} userId - User ID
   * @param {Object} options - Notification options
   * @returns {Promise<Object>} { success, notification }
   */
  async createNotification(userId, { type, title, message, metadata = {} }) {
    try {
      const { data, error } = await supabase
        .from('partner_notifications')
        .insert({
          user_id: userId,
          notification_type: type,
          title,
          message,
          metadata,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, notification: data };
    } catch (err) {
      console.error('[PartnerNotificationService] createNotification error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Subscribe to realtime notifications
   * @param {Function} callback - Callback function (notification) => void
   * @returns {Object} Subscription object
   */
  subscribeToNotifications(callback) {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return supabase
        .channel('partner_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'partner_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            callback(payload.new);
          }
        )
        .subscribe();
    };

    return setupSubscription();
  },

  /**
   * Unsubscribe from realtime notifications
   * @param {Object} subscription - Subscription object
   */
  unsubscribeFromNotifications(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  /**
   * Get notification icon info based on type
   * @param {string} type - Notification type
   * @returns {Object} { icon, color }
   */
  getNotificationIcon(type) {
    const icons = {
      [NOTIFICATION_TYPES.APPLICATION_APPROVED]: { icon: 'CheckCircle', color: '#4CAF50' },
      [NOTIFICATION_TYPES.APPLICATION_REJECTED]: { icon: 'XCircle', color: '#F44336' },
      [NOTIFICATION_TYPES.TIER_UPGRADE]: { icon: 'TrendingUp', color: '#4CAF50' },
      [NOTIFICATION_TYPES.TIER_DOWNGRADE]: { icon: 'TrendingDown', color: '#FF9800' },
      [NOTIFICATION_TYPES.COMMISSION_EARNED]: { icon: 'DollarSign', color: '#FFBD59' },
      [NOTIFICATION_TYPES.COMMISSION_PAID]: { icon: 'DollarSign', color: '#4CAF50' },
      [NOTIFICATION_TYPES.SUB_AFFILIATE_JOINED]: { icon: 'Users', color: '#2196F3' },
      [NOTIFICATION_TYPES.SUB_AFFILIATE_EARNED]: { icon: 'Users', color: '#FFBD59' },
      [NOTIFICATION_TYPES.PAYMENT_SCHEDULED]: { icon: 'Calendar', color: '#2196F3' },
      [NOTIFICATION_TYPES.PAYMENT_PROCESSED]: { icon: 'CheckCircle', color: '#4CAF50' },
    };
    return icons[type] || { icon: 'Bell', color: '#808080' };
  },

  /**
   * Get navigation target for notification
   * @param {Object} notification - Notification object
   * @returns {Object} { screen, params }
   */
  getNavigationTarget(notification) {
    const { notification_type, metadata } = notification;

    switch (notification_type) {
      case NOTIFICATION_TYPES.APPLICATION_APPROVED:
      case NOTIFICATION_TYPES.TIER_UPGRADE:
      case NOTIFICATION_TYPES.TIER_DOWNGRADE:
        return { screen: 'AffiliateDetail', params: {} };

      case NOTIFICATION_TYPES.COMMISSION_EARNED:
      case NOTIFICATION_TYPES.COMMISSION_PAID:
        return { screen: 'CommissionHistory', params: {} };

      case NOTIFICATION_TYPES.SUB_AFFILIATE_JOINED:
      case NOTIFICATION_TYPES.SUB_AFFILIATE_EARNED:
        return { screen: 'SubAffiliates', params: {} };

      case NOTIFICATION_TYPES.PAYMENT_SCHEDULED:
      case NOTIFICATION_TYPES.PAYMENT_PROCESSED:
        return { screen: 'WithdrawalHistory', params: {} };

      default:
        return { screen: 'AffiliateDetail', params: {} };
    }
  },
};

// Helper function
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}

export default PARTNER_NOTIFICATION_SERVICE;
