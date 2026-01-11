/**
 * Livestream Notification Service
 * Phase 4: Intelligence Layer
 *
 * Extended notification service for livestream:
 * - Livestream start notifications
 * - Livestream reminders
 * - Mention notifications
 * - Gift notifications
 * - Product alerts (low stock, price drop)
 * - Cart reminders
 */

import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

// Notification types
const NOTIFICATION_TYPES = {
  // Existing types
  ORDER_STATUS: 'order_status',
  PROMOTION: 'promotion',
  SYSTEM: 'system',

  // Livestream types
  LIVESTREAM_START: 'livestream_start',
  LIVESTREAM_REMINDER: 'livestream_reminder',
  LIVESTREAM_MENTION: 'livestream_mention',
  LIVESTREAM_GIFT: 'livestream_gift',
  LIVESTREAM_PRODUCT_ALERT: 'livestream_product_alert',
  LIVESTREAM_CART_REMINDER: 'livestream_cart_reminder',
};

class LivestreamNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[LivestreamNotifications] Permission not granted');
        return false;
      }

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      this.expoPushToken = token.data;

      // Save token to user profile
      await this.saveToken(this.expoPushToken);

      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[LivestreamNotifications] Initialize error:', error);
      return false;
    }
  }

  async saveToken(token) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_profiles').update({ push_token: token }).eq('id', user.id);
    } catch (error) {
      console.warn('[LivestreamNotifications] Save token error:', error);
    }
  }

  setListeners(onNotification, onResponse) {
    this.notificationListener =
      Notifications.addNotificationReceivedListener(onNotification);
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(onResponse);
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // ============================================================================
  // LOCAL NOTIFICATIONS
  // ============================================================================

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || { seconds: 1 },
      });
    } catch (error) {
      console.error('[LivestreamNotifications] Schedule error:', error);
      return null;
    }
  }

  // ============================================================================
  // LIVESTREAM SPECIFIC NOTIFICATIONS
  // ============================================================================

  // Notify when livestream starts
  async notifyLivestreamStart(sessionId, sessionTitle) {
    return this.scheduleLocalNotification(
      'Livestream dang dien ra!',
      `${sessionTitle} - Tham gia ngay de nhan uu dai dac biet!`,
      {
        type: NOTIFICATION_TYPES.LIVESTREAM_START,
        sessionId,
      }
    );
  }

  // Schedule reminder before livestream
  async scheduleLivestreamReminder(sessionId, sessionTitle, startTime) {
    const reminderTime = new Date(startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 15 minutes before

    if (reminderTime < new Date()) return null;

    return this.scheduleLocalNotification(
      'Sap co Livestream!',
      `${sessionTitle} se bat dau sau 15 phut. Dung bo lo nhe!`,
      {
        type: NOTIFICATION_TYPES.LIVESTREAM_REMINDER,
        sessionId,
      },
      { date: reminderTime }
    );
  }

  // Notify when mentioned in livestream
  async notifyLivestreamMention(sessionId, mentionedBy, message) {
    return this.scheduleLocalNotification(
      `${mentionedBy} da nhac den ban`,
      message.substring(0, 100),
      {
        type: NOTIFICATION_TYPES.LIVESTREAM_MENTION,
        sessionId,
      }
    );
  }

  // Notify when receiving gift
  async notifyGiftReceived(sessionId, senderName, giftName, giftValue) {
    return this.scheduleLocalNotification(
      `${senderName} da tang ban ${giftName}!`,
      `Ban nhan duoc ${giftValue} gems. Cam on ban da ung ho!`,
      {
        type: NOTIFICATION_TYPES.LIVESTREAM_GIFT,
        sessionId,
        giftValue,
      }
    );
  }

  // Product alert (low stock, price drop)
  async notifyProductAlert(alertType, productTitle, productId, extraData = {}) {
    let title, body;

    switch (alertType) {
      case 'low_stock':
        title = 'Sap het hang!';
        body = `${productTitle} chi con ${extraData.stock} san pham. Dat ngay!`;
        break;
      case 'price_drop':
        title = 'Giam gia dac biet!';
        body = `${productTitle} giam ${extraData.discount}%. Chi trong livestream!`;
        break;
      default:
        title = 'Cap nhat san pham';
        body = productTitle;
    }

    return this.scheduleLocalNotification(title, body, {
      type: NOTIFICATION_TYPES.LIVESTREAM_PRODUCT_ALERT,
      productId,
      alertType,
      ...extraData,
    });
  }

  // Cart reminder
  async notifyCartReminder(cartItemCount, cartValue) {
    return this.scheduleLocalNotification(
      'Ban co hang trong gio!',
      `${cartItemCount} san pham tri gia ${cartValue.toLocaleString('vi-VN')}d dang cho thanh toan.`,
      {
        type: NOTIFICATION_TYPES.LIVESTREAM_CART_REMINDER,
        cartItemCount,
        cartValue,
      }
    );
  }

  // ============================================================================
  // PUSH NOTIFICATIONS (Server-side via Supabase)
  // ============================================================================

  // Send push notification via Supabase Edge Function
  async sendPushToUsers(userIds, notification) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds,
          notification,
        },
      });

      if (error) {
        console.error('[LivestreamNotifications] Push error:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('[LivestreamNotifications] Push error:', error);
      return false;
    }
  }

  // Broadcast livestream start to all subscribers
  async broadcastLivestreamStart(sessionId, sessionTitle) {
    try {
      // Get subscribers with notifications enabled
      const { data: subscribers } = await supabase
        .from('livestream_subscribers')
        .select('user_id')
        .eq('notifications_enabled', true);

      if (!subscribers || subscribers.length === 0) return null;

      const userIds = subscribers.map((s) => s.user_id);

      return this.sendPushToUsers(userIds, {
        title: 'Livestream dang dien ra!',
        body: `${sessionTitle} - Tham gia ngay!`,
        data: {
          type: NOTIFICATION_TYPES.LIVESTREAM_START,
          sessionId,
        },
      });
    } catch (error) {
      console.error('[LivestreamNotifications] Broadcast error:', error);
      return null;
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async subscribeLivestream(userId, options = {}) {
    const { notificationsEnabled = true, reminderMinutes = 15 } = options;

    try {
      const { error } = await supabase.from('livestream_subscribers').upsert({
        user_id: userId,
        notifications_enabled: notificationsEnabled,
        reminder_minutes: reminderMinutes,
        subscribed_at: new Date().toISOString(),
      });

      return !error;
    } catch (error) {
      console.error('[LivestreamNotifications] Subscribe error:', error);
      return false;
    }
  }

  async unsubscribeLivestream(userId) {
    try {
      const { error } = await supabase
        .from('livestream_subscribers')
        .delete()
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('[LivestreamNotifications] Unsubscribe error:', error);
      return false;
    }
  }

  async updateSubscription(userId, options) {
    try {
      const { error } = await supabase
        .from('livestream_subscribers')
        .update(options)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('[LivestreamNotifications] Update subscription error:', error);
      return false;
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('livestream_subscribers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // NOTIFICATION HISTORY
  // ============================================================================

  async saveNotificationHistory(userId, notification) {
    try {
      await supabase.from('notification_history').insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[LivestreamNotifications] Save history error:', error);
    }
  }

  async getNotificationHistory(userId, limit = 20) {
    try {
      const { data } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      return [];
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async cancelAllScheduled() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

export const TYPES = NOTIFICATION_TYPES;
export const livestreamNotificationService = new LivestreamNotificationService();
export default livestreamNotificationService;
