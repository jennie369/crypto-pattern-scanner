/**
 * Gemral - Digital Product Notification Service
 * Handles push notifications for digital products (sales, new courses, reminders)
 */

import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';
import { TIER_NAMES } from '../utils/digitalProductsConfig';

// Notification types
const NOTIFICATION_TYPES = {
  NEW_COURSE: 'new_course',
  SALE: 'sale',
  TIER_UPGRADE: 'tier_upgrade',
  REMINDER: 'reminder',
  FLASH_SALE: 'flash_sale',
  CART_ABANDONMENT: 'cart_abandonment',
};

class DigitalProductNotificationService {
  constructor() {
    this._setupHandler();
  }

  /**
   * Setup notification handler
   * NOTE: setNotificationHandler is configured ONLY in InAppNotificationContext.js
   */
  _setupHandler() {
    // No-op: handler is centralized in InAppNotificationContext.js
  }

  // ═══════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Request notification permissions
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('[DigitalNotification] Permission error:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   * @returns {Promise<boolean>}
   */
  async areNotificationsEnabled() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LOCAL NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Schedule local notification
   * @param {object} options - Notification options
   * @returns {Promise<string|null>} - Notification ID
   */
  async scheduleLocalNotification({
    title,
    body,
    data = {},
    trigger = null, // null = immediate
  }) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('[DigitalNotification] Schedule error:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   * @param {string} notificationId - Notification ID
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('[DigitalNotification] Cancel error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DATABASE OPERATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Save notification to database
   * @param {string} userId - User ID
   * @param {object} notification - Notification data
   * @returns {Promise<boolean>}
   */
  async _saveNotification(userId, notification) {
    try {
      const { error } = await supabase
        .from('digital_promo_notifications')
        .insert({
          user_id: userId,
          notification_type: notification.type,
          product_id: notification.productId || null,
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        });

      if (error) {
        // Ignore duplicate errors (unique constraint)
        if (error.code !== '23505') {
          throw error;
        }
      }
      return true;
    } catch (error) {
      console.error('[DigitalNotification] Save error:', error);
      return false;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('digital_promo_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('[DigitalNotification] Mark read error:', error);
      return false;
    }
  }

  /**
   * Mark notification as clicked
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>}
   */
  async markAsClicked(notificationId) {
    try {
      const { error } = await supabase
        .from('digital_promo_notifications')
        .update({
          read_at: new Date().toISOString(),
          clicked_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      return !error;
    } catch (error) {
      console.error('[DigitalNotification] Mark clicked error:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SPECIFIC NOTIFICATION TYPES
  // ═══════════════════════════════════════════════════════════

  /**
   * Notify about new course
   * @param {string} userId - User ID
   * @param {object} course - Course data
   */
  async notifyNewCourse(userId, course) {
    if (!userId || !course) return;

    const notification = {
      type: NOTIFICATION_TYPES.NEW_COURSE,
      productId: course.id,
      title: 'Khóa học mới!',
      body: `${course.title} vừa được phát hành. Khám phá ngay!`,
      data: {
        screen: 'ProductDetail',
        productId: course.id,
        type: 'new_course',
      },
    };

    await this.scheduleLocalNotification(notification);
    await this._saveNotification(userId, notification);
  }

  /**
   * Notify about sale
   * @param {string} userId - User ID
   * @param {object} product - Product data
   * @param {number} discount - Discount percentage
   */
  async notifySale(userId, product, discount) {
    if (!userId || !product) return;

    const notification = {
      type: NOTIFICATION_TYPES.SALE,
      productId: product.id,
      title: `Giảm ${discount}%!`,
      body: `${product.title} đang được giảm giá đặc biệt. Mua ngay!`,
      data: {
        screen: 'ProductDetail',
        productId: product.id,
        type: 'sale',
        discount,
      },
    };

    await this.scheduleLocalNotification(notification);
    await this._saveNotification(userId, notification);
  }

  /**
   * Notify about tier upgrade opportunity
   * @param {string} userId - User ID
   * @param {string} currentTier - User's current tier
   * @param {string} suggestedTier - Suggested tier to upgrade
   */
  async notifyTierUpgrade(userId, currentTier, suggestedTier) {
    if (!userId || !suggestedTier) return;

    const tierName = TIER_NAMES[suggestedTier] || suggestedTier;

    const notification = {
      type: NOTIFICATION_TYPES.TIER_UPGRADE,
      productId: null,
      title: 'Nâng cấp tài khoản',
      body: `Nâng cấp lên ${tierName} để mở khóa thêm nhiều tính năng!`,
      data: {
        screen: 'DigitalProducts',
        filter: suggestedTier,
        type: 'tier_upgrade',
      },
    };

    await this.scheduleLocalNotification(notification);
    await this._saveNotification(userId, notification);
  }

  /**
   * Notify about cart abandonment
   * @param {string} userId - User ID
   * @param {Array} cartItems - Items in cart
   */
  async notifyCartReminder(userId, cartItems) {
    if (!userId || !cartItems || cartItems.length === 0) return;

    const notification = {
      type: NOTIFICATION_TYPES.CART_ABANDONMENT,
      productId: cartItems[0]?.productId || null,
      title: 'Giỏ hàng đang chờ',
      body: `Bạn có ${cartItems.length} sản phẩm trong giỏ hàng. Hoàn tất đơn hàng ngay!`,
      data: {
        screen: 'Cart',
        type: 'cart_reminder',
      },
    };

    // Schedule for 1 hour later
    await this.scheduleLocalNotification({
      ...notification,
      trigger: { seconds: 3600 },
    });
    await this._saveNotification(userId, notification);
  }

  /**
   * Notify about flash sale
   * @param {string} userId - User ID
   * @param {object} product - Product data
   * @param {string} endsIn - Time remaining
   */
  async notifyFlashSale(userId, product, endsIn) {
    if (!userId || !product) return;

    const notification = {
      type: NOTIFICATION_TYPES.FLASH_SALE,
      productId: product.id,
      title: 'Flash Sale sắp kết thúc!',
      body: `${product.title} giảm giá còn ${endsIn}. Đừng bỏ lỡ!`,
      data: {
        screen: 'ProductDetail',
        productId: product.id,
        type: 'flash_sale',
      },
    };

    await this.scheduleLocalNotification(notification);
    await this._saveNotification(userId, notification);
  }

  // ═══════════════════════════════════════════════════════════
  // USER NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {number} limit - Max notifications
   * @returns {Promise<Array>}
   */
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('digital_promo_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[DigitalNotification] Get notifications error:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('digital_promo_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[DigitalNotification] Get unread count error:', error);
      return 0;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PREFERENCES
  // ═══════════════════════════════════════════════════════════

  /**
   * Get user notification preferences
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  async getPreferences(userId) {
    try {
      const { data, error } = await supabase.rpc('get_notification_preferences', {
        p_user_id: userId,
      });

      if (error) throw error;
      return data || {
        new_courses: true,
        sales: true,
        tier_updates: true,
        flash_sales: true,
        cart_reminders: true,
      };
    } catch (error) {
      console.error('[DigitalNotification] Get preferences error:', error);
      return {
        new_courses: true,
        sales: true,
        tier_updates: true,
        flash_sales: true,
        cart_reminders: true,
      };
    }
  }

  /**
   * Update user notification preferences
   * @param {string} userId - User ID
   * @param {object} preferences - New preferences
   * @returns {Promise<boolean>}
   */
  async updatePreferences(userId, preferences) {
    try {
      const { error } = await supabase
        .from('digital_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      return !error;
    } catch (error) {
      console.error('[DigitalNotification] Update preferences error:', error);
      return false;
    }
  }
}

export const digitalProductNotificationService = new DigitalProductNotificationService();
export default digitalProductNotificationService;
