/**
 * Gemral - Notification Service
 * Local push notifications for order updates and alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const NOTIFICATION_SETTINGS_KEY = '@gem_notification_settings';
const PUSH_TOKEN_KEY = '@gem_push_token';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification categories for filtering
export const NOTIFICATION_CATEGORIES = {
  ALL: 'all',
  TRADING: 'trading',
  SOCIAL: 'social',
  SYSTEM: 'system',
};

// Category labels (Vietnamese)
export const CATEGORY_LABELS = {
  all: 'Tất cả',
  trading: 'Giao dịch',
  social: 'Xã hội',
  system: 'Hệ thống',
};

// Notification type to category mapping
export const TYPE_TO_CATEGORY = {
  // Trading
  pattern_detected: 'trading',
  price_alert: 'trading',
  trade_executed: 'trading',
  market_alert: 'trading',
  breakout: 'trading',
  stop_loss: 'trading',
  take_profit: 'trading',
  limit_order_filled: 'trading',  // Pending order filled
  position_opened: 'trading',     // Position opened (market order)
  position_sl_hit: 'trading',     // Stop loss hit
  position_tp_hit: 'trading',     // Take profit hit
  // Social
  forum_like: 'social',
  forum_comment: 'social',
  forum_reply: 'social',
  forum_follow: 'social',
  mention: 'social',
  gift_received: 'social',
  gift_sent: 'social',
  // System
  order: 'system',
  promotion: 'system',
  system: 'system',
  reminder: 'system',
  account: 'system',
  // Partnership
  partnership_approved: 'system',
  partnership_rejected: 'system',
  withdrawal_approved: 'system',
  withdrawal_completed: 'system',
  withdrawal_rejected: 'system',
  commission_earned: 'system',
  // Admin notifications
  admin_partnership_application: 'system',
  admin_withdraw_request: 'system',
};

class NotificationService {
  constructor() {
    this._expoPushToken = null;
    this._settings = {
      orderUpdates: true,
      promotions: true,
      priceAlerts: true,
      patternAlerts: true,
      tradeAlerts: true,
      forumLikes: true,
      forumComments: true,
      forumFollows: true,
      systemAlerts: true,
      partnershipAlerts: true, // Partnership notifications
    };
  }

  /**
   * Initialize notifications
   */
  async initialize() {
    try {
      // Load settings
      await this.loadSettings();

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      // Configure for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Đơn hàng',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFBD59',
        });

        await Notifications.setNotificationChannelAsync('promotions', {
          name: 'Khuyến mãi',
          importance: Notifications.AndroidImportance.DEFAULT,
        });

        await Notifications.setNotificationChannelAsync('alerts', {
          name: 'Cảnh báo',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FF6B6B',
        });
      }

      // Get and save push token
      await this.registerPushToken();

      console.log('[Notifications] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Notifications] Initialize error:', error);
      return false;
    }
  }

  /**
   * Check if running in Expo Go (development client without native modules)
   */
  isExpoGo() {
    return Constants.appOwnership === 'expo' || !Constants.expoConfig?.extra?.eas?.projectId;
  }

  /**
   * Register and save Expo push token to database
   */
  async registerPushToken() {
    try {
      if (Device?.isDevice === false) {
        console.log('[Notifications] Push notifications only work on physical devices');
        return null;
      }

      // Skip FCM token in Expo Go - Firebase is not initialized
      if (this.isExpoGo()) {
        console.log('[Notifications] Running in Expo Go - skipping FCM push token registration');
        console.log('[Notifications] Push notifications will work in production/development builds with Firebase configured');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      if (!token?.data) {
        console.log('[Notifications] Failed to get push token');
        return null;
      }

      this._expoPushToken = token.data;
      console.log('[Notifications] Push token:', token.data);

      // Save to AsyncStorage
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);

      // Save to database if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this.savePushTokenToDatabase(user.id, token.data);
      }

      return token.data;
    } catch (error) {
      // Handle Firebase not initialized error gracefully
      if (error.message?.includes('FirebaseApp is not initialized')) {
        console.log('[Notifications] Firebase not initialized - skipping push token (Expo Go mode)');
        return null;
      }
      console.error('[Notifications] registerPushToken error:', error);
      return null;
    }
  }

  /**
   * Save push token to database
   */
  async savePushTokenToDatabase(userId, pushToken) {
    try {
      const deviceType = Platform.OS;
      const deviceName = Device?.modelName || Device?.deviceName || 'Unknown Device';

      // Upsert token (insert or update if exists)
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          push_token: pushToken,
          device_type: deviceType,
          device_name: deviceName,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,push_token',
        });

      if (error) {
        // Table might not exist yet
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('[Notifications] user_push_tokens table not found');
          return;
        }
        console.error('[Notifications] savePushTokenToDatabase error:', error);
      } else {
        console.log('[Notifications] Push token saved to database');
      }
    } catch (error) {
      console.error('[Notifications] savePushTokenToDatabase error:', error);
    }
  }

  /**
   * Remove push token from database (on logout)
   */
  async removePushToken() {
    try {
      const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!storedToken) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_push_tokens')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('push_token', storedToken);
      }

      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      this._expoPushToken = null;
      console.log('[Notifications] Push token removed');
    } catch (error) {
      console.error('[Notifications] removePushToken error:', error);
    }
  }

  /**
   * Get current push token
   */
  getPushToken() {
    return this._expoPushToken;
  }

  /**
   * Load notification settings
   */
  async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this._settings = { ...this._settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[Notifications] loadSettings error:', error);
    }
  }

  /**
   * Save notification settings
   */
  async saveSettings(settings) {
    try {
      this._settings = { ...this._settings, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this._settings));
    } catch (error) {
      console.error('[Notifications] saveSettings error:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this._settings };
  }

  /**
   * Send order status notification
   */
  async sendOrderNotification(order, newStatus) {
    if (!this._settings.orderUpdates) return;

    const statusMessages = {
      confirmed: {
        title: 'Đơn hàng đã xác nhận',
        body: `Đơn hàng #${order.orderNumber} đã được xác nhận và đang chuẩn bị.`,
      },
      processing: {
        title: 'Đang chuẩn bị đơn hàng',
        body: `Đơn hàng #${order.orderNumber} đang được đóng gói.`,
      },
      shipped: {
        title: 'Đơn hàng đang giao',
        body: `Đơn hàng #${order.orderNumber} đang trên đường đến bạn!`,
      },
      delivered: {
        title: 'Giao hàng thành công',
        body: `Đơn hàng #${order.orderNumber} đã được giao. Cảm ơn bạn!`,
      },
      cancelled: {
        title: 'Đơn hàng đã hủy',
        body: `Đơn hàng #${order.orderNumber} đã bị hủy.`,
      },
    };

    const message = statusMessages[newStatus];
    if (!message) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type: 'order', orderId: order.id, status: newStatus },
          sound: true,
        },
        trigger: null, // Immediate
      });
      console.log('[Notifications] Order notification sent:', newStatus);
    } catch (error) {
      console.error('[Notifications] sendOrderNotification error:', error);
    }
  }

  /**
   * Send promotion notification
   */
  async sendPromotionNotification(title, body, data = {}) {
    if (!this._settings.promotions) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'promotion', ...data },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('[Notifications] sendPromotionNotification error:', error);
    }
  }

  /**
   * Send price alert notification
   */
  async sendPriceAlertNotification(symbol, price, alertType) {
    if (!this._settings.priceAlerts) return;

    const messages = {
      target_reached: `${symbol} đã đạt giá mục tiêu: $${price}`,
      stop_loss: `${symbol} đã chạm stop loss: $${price}`,
      breakout: `${symbol} đang breakout! Giá hiện tại: $${price}`,
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Cảnh báo giá ${symbol}`,
          body: messages[alertType] || `${symbol}: $${price}`,
          data: { type: 'price_alert', symbol, price, alertType },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('[Notifications] sendPriceAlertNotification error:', error);
    }
  }

  /**
   * Schedule a reminder notification
   */
  async scheduleReminder(title, body, triggerDate, data = {}) {
    try {
      const trigger = new Date(triggerDate);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'reminder', ...data },
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('[Notifications] scheduleReminder error:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('[Notifications] cancelNotification error:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[Notifications] cancelAllNotifications error:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('[Notifications] setBadgeCount error:', error);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge() {
    await this.setBadgeCount(0);
  }

  // ==========================================
  // FORUM NOTIFICATIONS
  // ==========================================

  /**
   * Send like notification
   */
  async sendLikeNotification(fromUser, post) {
    if (!this._settings.forumLikes) return;

    const fromName = fromUser?.full_name || fromUser?.email?.split('@')[0] || 'Ai đó';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '❤️ Thích bài viết',
          body: `${fromName} đã thích bài viết "${post.title?.substring(0, 30)}..."`,
          data: { type: 'forum_like', postId: post.id, fromUserId: fromUser?.id },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Like notification sent');
    } catch (error) {
      console.error('[Notifications] sendLikeNotification error:', error);
    }
  }

  /**
   * Send comment notification
   */
  async sendCommentNotification(fromUser, post, commentText) {
    if (!this._settings.forumComments) return;

    const fromName = fromUser?.full_name || fromUser?.email?.split('@')[0] || 'Ai đó';
    const preview = commentText.substring(0, 50) + (commentText.length > 50 ? '...' : '');

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💬 Bình luận mới',
          body: `${fromName}: "${preview}"`,
          data: { type: 'forum_comment', postId: post.id, fromUserId: fromUser?.id },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Comment notification sent');
    } catch (error) {
      console.error('[Notifications] sendCommentNotification error:', error);
    }
  }

  /**
   * Send reply notification
   */
  async sendReplyNotification(fromUser, post, parentComment, replyText) {
    if (!this._settings.forumComments) return;

    const fromName = fromUser?.full_name || fromUser?.email?.split('@')[0] || 'Ai đó';
    const preview = replyText.substring(0, 50) + (replyText.length > 50 ? '...' : '');

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '↩️ Trả lời bình luận',
          body: `${fromName} đã trả lời bạn: "${preview}"`,
          data: { type: 'forum_reply', postId: post.id, commentId: parentComment?.id, fromUserId: fromUser?.id },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Reply notification sent');
    } catch (error) {
      console.error('[Notifications] sendReplyNotification error:', error);
    }
  }

  /**
   * Send follow notification
   */
  async sendFollowNotification(fromUser) {
    if (!this._settings.forumFollows) return;

    const fromName = fromUser?.full_name || fromUser?.email?.split('@')[0] || 'Ai đó';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👤 Người theo dõi mới',
          body: `${fromName} đã bắt đầu theo dõi bạn`,
          data: { type: 'forum_follow', fromUserId: fromUser?.id },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Follow notification sent');
    } catch (error) {
      console.error('[Notifications] sendFollowNotification error:', error);
    }
  }

  // ==========================================
  // TRADING NOTIFICATIONS
  // ==========================================

  /**
   * Send pattern detected notification
   */
  async sendPatternNotification(symbol, patternName, direction, confidence) {
    if (!this._settings.patternAlerts) return;

    const directionEmoji = direction === 'bullish' ? '📈' : '📉';
    const directionText = direction === 'bullish' ? 'TĂNG' : 'GIẢM';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${directionEmoji} Pattern ${patternName}`,
          body: `${symbol}: Phát hiện ${patternName} - Xu hướng ${directionText} (${confidence}% tin cậy)`,
          data: { type: 'pattern_detected', symbol, patternName, direction, confidence },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Pattern notification sent:', symbol, patternName);
    } catch (error) {
      console.error('[Notifications] sendPatternNotification error:', error);
    }
  }

  /**
   * Send trade executed notification
   */
  async sendTradeNotification(trade) {
    if (!this._settings.tradeAlerts) return;

    const { symbol, side, price, quantity, profit } = trade;
    const sideEmoji = side === 'BUY' ? '🟢' : '🔴';
    const profitText = profit ? ` | P/L: ${profit > 0 ? '+' : ''}${profit.toFixed(2)}%` : '';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${sideEmoji} Lệnh ${side} ${symbol}`,
          body: `Giá: $${price} | SL: ${quantity}${profitText}`,
          data: { type: 'trade_executed', ...trade },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Trade notification sent:', symbol, side);
    } catch (error) {
      console.error('[Notifications] sendTradeNotification error:', error);
    }
  }

  /**
   * Send market alert notification
   */
  async sendMarketAlertNotification(title, message, severity = 'info') {
    if (!this._settings.systemAlerts) return;

    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${severityEmoji[severity] || 'ℹ️'} ${title}`,
          body: message,
          data: { type: 'market_alert', severity },
          sound: severity === 'critical',
        },
        trigger: null,
      });
      console.log('[Notifications] Market alert sent:', title);
    } catch (error) {
      console.error('[Notifications] sendMarketAlertNotification error:', error);
    }
  }

  /**
   * Send limit order filled notification (pending order executed)
   * Also saves to database for Notification tab display
   */
  async sendLimitOrderFilledNotification(order, userId) {
    if (!this._settings.tradeAlerts) return;

    const { symbol, direction, entryPrice, positionSize } = order;
    const directionEmoji = direction === 'LONG' ? '📈' : '📉';
    const directionText = direction === 'LONG' ? 'LONG' : 'SHORT';

    // Format price with appropriate decimals
    const formatPrice = (price) => {
      if (!price) return '0';
      if (price >= 1000) return price.toFixed(2);
      if (price >= 1) return price.toFixed(4);
      return price.toFixed(6);
    };

    const title = `${directionEmoji} Lệnh Chờ Đã Khớp!`;
    const body = `${symbol.replace('USDT', '')} ${directionText} đã khớp tại $${formatPrice(entryPrice)}`;

    try {
      // 1. Send local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'limit_order_filled',
            symbol,
            direction,
            entryPrice,
            positionSize,
            orderId: order.id,
          },
          sound: true,
        },
        trigger: null, // Immediate
      });

      // 2. Save to database for Notification tab
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title,
          message: body,
          type: 'limit_order_filled',
          data: {
            symbol,
            direction,
            entryPrice,
            positionSize,
            orderId: order.id,
          },
          read: false,
        });
      }

      console.log('[Notifications] Limit order filled notification sent:', symbol, direction);
    } catch (error) {
      console.error('[Notifications] sendLimitOrderFilledNotification error:', error);
    }
  }

  /**
   * Send position opened notification (market order executed)
   * Also saves to database for Notification tab display
   */
  async sendPositionOpenedNotification(position, userId) {
    if (!this._settings.tradeAlerts) return;

    const { symbol, direction, entryPrice, positionSize } = position;
    const directionEmoji = direction === 'LONG' ? '📈' : '📉';
    const directionText = direction === 'LONG' ? 'LONG' : 'SHORT';

    // Format price with appropriate decimals
    const formatPriceLocal = (price) => {
      if (!price) return '0';
      if (price >= 1000) return price.toFixed(2);
      if (price >= 1) return price.toFixed(4);
      return price.toFixed(6);
    };

    const title = `${directionEmoji} Đã Mở Lệnh ${directionText}`;
    const body = `${symbol.replace('USDT', '')} vào tại $${formatPriceLocal(entryPrice)} | Ký quỹ: $${positionSize?.toFixed(2) || '0'}`;

    try {
      // 1. Send local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'position_opened',
            symbol,
            direction,
            entryPrice,
            positionSize,
            positionId: position.id,
          },
          sound: true,
        },
        trigger: null,
      });

      // 2. Save to database for Notification tab
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title,
          message: body,
          type: 'position_opened',
          data: {
            symbol,
            direction,
            entryPrice,
            positionSize,
            positionId: position.id,
          },
          read: false,
        });
      }

      console.log('[Notifications] Position opened notification sent:', symbol, direction);
    } catch (error) {
      console.error('[Notifications] sendPositionOpenedNotification error:', error);
    }
  }

  /**
   * Send Stop Loss hit notification
   * Also saves to database for Notification tab display
   */
  async sendStopLossHitNotification(position, userId) {
    if (!this._settings.tradeAlerts) return;

    const { symbol, direction, entryPrice, currentPrice, realizedPnL, realizedPnLPercent } = position;

    // Format price with appropriate decimals
    const formatPriceLocal = (price) => {
      if (!price) return '0';
      if (price >= 1000) return price.toFixed(2);
      if (price >= 1) return price.toFixed(4);
      return price.toFixed(6);
    };

    const pnlText = realizedPnL >= 0 ? `+$${realizedPnL?.toFixed(2)}` : `-$${Math.abs(realizedPnL)?.toFixed(2)}`;
    const pnlPercent = realizedPnLPercent?.toFixed(2) || '0';

    const title = `🛑 Chạm Cắt Lỗ - ${symbol.replace('USDT', '')}`;
    const body = `${direction} đóng tại $${formatPriceLocal(currentPrice)} | P/L: ${pnlText} (${pnlPercent}%)`;

    try {
      // 1. Send local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'position_sl_hit',
            symbol,
            direction,
            entryPrice,
            exitPrice: currentPrice,
            realizedPnL,
            positionId: position.id,
          },
          sound: true,
        },
        trigger: null,
      });

      // 2. Save to database for Notification tab
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title,
          message: body,
          type: 'position_sl_hit',
          data: {
            symbol,
            direction,
            entryPrice,
            exitPrice: currentPrice,
            realizedPnL,
            positionId: position.id,
          },
          read: false,
        });
      }

      console.log('[Notifications] Stop loss hit notification sent:', symbol);
    } catch (error) {
      console.error('[Notifications] sendStopLossHitNotification error:', error);
    }
  }

  /**
   * Send Take Profit hit notification
   * Also saves to database for Notification tab display
   */
  async sendTakeProfitHitNotification(position, userId) {
    if (!this._settings.tradeAlerts) return;

    const { symbol, direction, entryPrice, currentPrice, realizedPnL, realizedPnLPercent } = position;

    // Format price with appropriate decimals
    const formatPriceLocal = (price) => {
      if (!price) return '0';
      if (price >= 1000) return price.toFixed(2);
      if (price >= 1) return price.toFixed(4);
      return price.toFixed(6);
    };

    const pnlText = realizedPnL >= 0 ? `+$${realizedPnL?.toFixed(2)}` : `-$${Math.abs(realizedPnL)?.toFixed(2)}`;
    const pnlPercent = realizedPnLPercent?.toFixed(2) || '0';

    const title = `🎯 Chạm Chốt Lời - ${symbol.replace('USDT', '')}`;
    const body = `${direction} đóng tại $${formatPriceLocal(currentPrice)} | P/L: ${pnlText} (+${pnlPercent}%)`;

    try {
      // 1. Send local push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'position_tp_hit',
            symbol,
            direction,
            entryPrice,
            exitPrice: currentPrice,
            realizedPnL,
            positionId: position.id,
          },
          sound: true,
        },
        trigger: null,
      });

      // 2. Save to database for Notification tab
      if (userId) {
        await supabase.from('notifications').insert({
          user_id: userId,
          title,
          message: body,
          type: 'position_tp_hit',
          data: {
            symbol,
            direction,
            entryPrice,
            exitPrice: currentPrice,
            realizedPnL,
            positionId: position.id,
          },
          read: false,
        });
      }

      console.log('[Notifications] Take profit hit notification sent:', symbol);
    } catch (error) {
      console.error('[Notifications] sendTakeProfitHitNotification error:', error);
    }
  }

  /**
   * Send stop loss / take profit hit notification
   */
  async sendExitNotification(symbol, exitType, price, profitPercent) {
    if (!this._settings.tradeAlerts) return;

    const isProfit = exitType === 'take_profit';
    const emoji = isProfit ? '🎯' : '🛑';
    const title = isProfit ? 'Take Profit đạt!' : 'Stop Loss kích hoạt';
    const profitText = profitPercent > 0 ? `+${profitPercent.toFixed(2)}%` : `${profitPercent.toFixed(2)}%`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji} ${symbol} - ${title}`,
          body: `Giá thoát: $${price} | ${profitText}`,
          data: { type: exitType, symbol, price, profitPercent },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Exit notification sent:', symbol, exitType);
    } catch (error) {
      console.error('[Notifications] sendExitNotification error:', error);
    }
  }

  // ==========================================
  // SYSTEM NOTIFICATIONS
  // ==========================================

  /**
   * Send system notification
   */
  async sendSystemNotification(title, message, data = {}) {
    if (!this._settings.systemAlerts) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 ${title}`,
          body: message,
          data: { type: 'system', ...data },
        },
        trigger: null,
      });
      console.log('[Notifications] System notification sent:', title);
    } catch (error) {
      console.error('[Notifications] sendSystemNotification error:', error);
    }
  }

  /**
   * Get category for notification type
   */
  getCategoryForType(type) {
    return TYPE_TO_CATEGORY[type] || 'system';
  }

  // ==========================================
  // GIFT NOTIFICATIONS
  // ==========================================

  /**
   * Send gift received notification
   * @param {string} senderName - Name of the sender
   * @param {string} giftName - Name of the gift
   * @param {number} gemAmount - Amount of gems
   * @param {object} data - Additional data
   */
  async sendGiftReceivedNotification(senderName, giftName, gemAmount, data = {}) {
    if (!this._settings.forumLikes) return; // Use forumLikes setting for social notifications

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎁 Bạn nhận được quà!`,
          body: `${senderName} đã tặng bạn ${giftName} (${gemAmount} gems)`,
          data: { type: 'gift_received', ...data },
        },
        trigger: null,
      });
      console.log('[Notifications] Gift received notification sent');
    } catch (error) {
      console.error('[Notifications] sendGiftReceivedNotification error:', error);
    }
  }

  /**
   * Generic method to send a local notification immediately
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null,
      });
      console.log('[Notifications] Local notification sent:', title);
    } catch (error) {
      console.error('[Notifications] sendLocalNotification error:', error);
    }
  }

  // ==========================================
  // PARTNERSHIP NOTIFICATIONS
  // ==========================================

  /**
   * Send partnership application approved notification
   */
  async sendPartnershipApprovedNotification(partnerRole, affiliateCode) {
    if (!this._settings.partnershipAlerts) return;

    const roleText = partnerRole === 'ctv' ? 'CTV' : 'Affiliate';
    const tierInfo = partnerRole === 'ctv' ? ' - Tier 1' : '';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 Chúc mừng! Bạn đã trở thành ${roleText}${tierInfo}`,
          body: `Mã giới thiệu của bạn: ${affiliateCode}. Bắt đầu chia sẻ và nhận hoa hồng ngay!`,
          data: { type: 'partnership_approved', partnerRole, affiliateCode },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Partnership approved notification sent');
    } catch (error) {
      console.error('[Notifications] sendPartnershipApprovedNotification error:', error);
    }
  }

  /**
   * Send partnership application rejected notification
   */
  async sendPartnershipRejectedNotification(reason) {
    if (!this._settings.partnershipAlerts) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '❌ Đơn đăng ký không được duyệt',
          body: reason || 'Đơn đăng ký của bạn không được chấp thuận. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
          data: { type: 'partnership_rejected', reason },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Partnership rejected notification sent');
    } catch (error) {
      console.error('[Notifications] sendPartnershipRejectedNotification error:', error);
    }
  }

  /**
   * Send withdrawal approved notification
   */
  async sendWithdrawalApprovedNotification(amount) {
    if (!this._settings.partnershipAlerts) return;

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Yêu cầu rút tiền đã được duyệt',
          body: `Yêu cầu rút ${formattedAmount} của bạn đã được duyệt và đang chờ xử lý.`,
          data: { type: 'withdrawal_approved', amount },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Withdrawal approved notification sent');
    } catch (error) {
      console.error('[Notifications] sendWithdrawalApprovedNotification error:', error);
    }
  }

  /**
   * Send withdrawal completed notification
   */
  async sendWithdrawalCompletedNotification(amount, transactionId) {
    if (!this._settings.partnershipAlerts) return;

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Chuyển khoản thành công!',
          body: `${formattedAmount} đã được chuyển vào tài khoản ngân hàng của bạn. Mã GD: ${transactionId}`,
          data: { type: 'withdrawal_completed', amount, transactionId },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Withdrawal completed notification sent');
    } catch (error) {
      console.error('[Notifications] sendWithdrawalCompletedNotification error:', error);
    }
  }

  /**
   * Send withdrawal rejected notification
   */
  async sendWithdrawalRejectedNotification(amount, reason) {
    if (!this._settings.partnershipAlerts) return;

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '❌ Yêu cầu rút tiền bị từ chối',
          body: `Yêu cầu rút ${formattedAmount} không được chấp thuận. Lý do: ${reason || 'Không xác định'}`,
          data: { type: 'withdrawal_rejected', amount, reason },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Withdrawal rejected notification sent');
    } catch (error) {
      console.error('[Notifications] sendWithdrawalRejectedNotification error:', error);
    }
  }

  /**
   * Send commission earned notification
   */
  async sendCommissionEarnedNotification(orderNumber, commissionAmount, productName) {
    if (!this._settings.partnershipAlerts) return;

    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(commissionAmount);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎊 Bạn vừa nhận hoa hồng!',
          body: `+${formattedAmount} từ đơn hàng #${orderNumber}${productName ? ` (${productName})` : ''}`,
          data: { type: 'commission_earned', orderNumber, commissionAmount, productName },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Commission earned notification sent');
    } catch (error) {
      console.error('[Notifications] sendCommissionEarnedNotification error:', error);
    }
  }

  /**
   * Send CTV tier upgrade notification
   */
  async sendTierUpgradeNotification(newTier, newCommissionRate) {
    if (!this._settings.partnershipAlerts) return;

    const tierNames = {
      1: 'Tier 1 (Cơ bản)',
      2: 'Tier 2 (Nâng cao)',
      3: 'Tier 3 (Chuyên nghiệp)',
      4: 'Tier 4 (VIP)',
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚀 Chúc mừng! Bạn đã lên cấp!',
          body: `Bạn đã đạt ${tierNames[newTier] || `Tier ${newTier}`}. Hoa hồng mới: ${newCommissionRate}%`,
          data: { type: 'tier_upgrade', newTier, newCommissionRate },
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Tier upgrade notification sent');
    } catch (error) {
      console.error('[Notifications] sendTierUpgradeNotification error:', error);
    }
  }

  // ==========================================
  // DATABASE NOTIFICATIONS (Issue #25)
  // ==========================================

  /**
   * Get user's notifications from database (including broadcasts)
   * Key: user_id IS NULL means broadcast to all users
   */
  async getUserNotificationsFromDB(userId, page = 1, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`) // User's + Broadcasts
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Enrich with category
      const enrichedData = (data || []).map(n => ({
        ...n,
        category: this.getCategoryForType(n.type),
        isBroadcast: n.user_id === null,
      }));

      return { success: true, data: enrichedData };
    } catch (error) {
      console.error('[Notifications] getUserNotificationsFromDB error:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('read', false);

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    try {
      // Only update if it's user's own notification (not broadcasts)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllNotificationsAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * [ADMIN] Send broadcast notification to all users
   */
  async sendBroadcastNotification({ title, message, type = 'system', data = {}, imageUrl = null }) {
    try {
      const { data: result, error } = await supabase.rpc('send_broadcast_notification', {
        p_title: title,
        p_message: message,
        p_type: type,
        p_data: data,
        p_image_url: imageUrl,
      });

      if (error) throw error;

      return { success: result?.success || false, data: result };
    } catch (error) {
      console.error('[Notifications] sendBroadcastNotification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * [ADMIN] Send notification to specific users
   */
  async sendNotificationToUsers(userIds, title, message, type = 'system', data = {}) {
    try {
      const { data: result, error } = await supabase.rpc('send_notification_to_users', {
        p_user_ids: userIds,
        p_title: title,
        p_message: message,
        p_type: type,
        p_data: data,
      });

      if (error) throw error;

      return { success: result?.success || false, data: result };
    } catch (error) {
      console.error('[Notifications] sendNotificationToUsers error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * [ADMIN] Get notification history (broadcasts only)
   */
  async getNotificationHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .is('user_id', null) // Only broadcasts
        .order('created_at', { ascending: false })
        .limit(limit);

      return { success: !error, data: data || [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  }

  /**
   * [ADMIN] Delete broadcast notification
   */
  async deleteBroadcastNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .is('user_id', null);

      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }

  // ==========================================
  // ADMIN: PUSH SCHEDULE MANAGEMENT
  // ==========================================

  /**
   * Create scheduled push notification
   */
  async createScheduledNotification(data) {
    try {
      const { data: user } = await supabase.auth.getUser();

      // Calculate estimated reach
      const reach = await this.calculateReach(data.segment || 'all');

      const { data: notification, error } = await supabase
        .from('notification_schedule')
        .insert({
          title: data.title,
          body: data.body,
          deep_link: data.deep_link,
          image_url: data.image_url,
          segment: data.segment || 'all',
          segment_filters: data.segment_filters || {},
          estimated_reach: reach,
          template_id: data.template_id,
          ab_test_enabled: data.ab_test_enabled || false,
          ab_variants: data.ab_variants,
          ab_winner_criteria: data.ab_winner_criteria,
          ab_test_duration: data.ab_test_duration,
          scheduled_at: data.scheduled_at,
          is_recurring: data.is_recurring || false,
          recurrence_rule: data.recurrence_rule,
          status: data.scheduled_at ? 'scheduled' : 'draft',
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: notification };
    } catch (error) {
      console.error('[Notifications] createScheduledNotification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update scheduled notification
   */
  async updateScheduledNotification(id, updates) {
    try {
      // Recalculate reach if segment changed
      if (updates.segment) {
        updates.estimated_reach = await this.calculateReach(updates.segment);
      }

      const { data, error } = await supabase
        .from('notification_schedule')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Notifications] updateScheduledNotification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete scheduled notification
   */
  async deleteScheduledNotification(id) {
    try {
      const { error } = await supabase
        .from('notification_schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Notifications] deleteScheduledNotification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(options = {}) {
    try {
      let query = supabase
        .from('notification_schedule')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.startDate) {
        query = query.gte('scheduled_at', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('scheduled_at', options.endDate);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[Notifications] getScheduledNotifications error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Get scheduled notifications by date range (for calendar)
   */
  async getScheduledByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('notification_schedule')
        .select('*')
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .in('status', ['scheduled', 'sent'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Add type marker for calendar
      const withType = (data || []).map(item => ({
        ...item,
        _type: 'push', // Để calendar phân biệt với post
      }));

      return withType;
    } catch (error) {
      console.error('[Notifications] getScheduledByDateRange error:', error);
      return [];
    }
  }

  /**
   * Send notification immediately via Edge Function
   */
  async sendNow(notificationId) {
    try {
      // Get notification data
      const { data: notification } = await supabase
        .from('notification_schedule')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (!notification) throw new Error('Notification not found');

      // Update status to sending
      await supabase
        .from('notification_schedule')
        .update({ status: 'sending' })
        .eq('id', notificationId);

      // Get target users
      const users = await this.getUsersBySegment(notification.segment);

      if (users.length === 0) {
        throw new Error('No users in segment');
      }

      // Send via Edge Function
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          notificationId,
          notification: {
            title: notification.title,
            body: notification.body,
            data: {
              deep_link: notification.deep_link,
              notification_id: notificationId,
            },
          },
          tokens: users.map(u => u.expo_push_token),
          userIds: users.map(u => u.id),
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Notifications] sendNow error:', error);

      // Update status to failed
      await supabase
        .from('notification_schedule')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', notificationId);

      return { success: false, error: error.message };
    }
  }

  /**
   * Send test notification to admin device
   */
  async sendTest(notificationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get admin's token from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('id', user.id)
        .single();

      // Fallback to user_push_tokens
      let token = profile?.expo_push_token;
      if (!token) {
        const { data: tokenData } = await supabase
          .from('user_push_tokens')
          .select('push_token')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
        token = tokenData?.push_token;
      }

      if (!token) {
        throw new Error('No push token registered. Please enable notifications first.');
      }

      // Send single notification via Expo
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: `[TEST] ${notificationData.title}`,
          body: notificationData.body,
          data: {
            deep_link: notificationData.deep_link,
            is_test: true,
          },
          sound: 'default',
          badge: 1,
        }),
      });

      const result = await response.json();

      if (result.data?.[0]?.status === 'error') {
        throw new Error(result.data[0].message);
      }

      return { success: true };
    } catch (error) {
      console.error('[Notifications] sendTest error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // SEGMENTATION
  // ==========================================

  /**
   * Get users by segment
   */
  async getUsersBySegment(segment) {
    try {
      let query = supabase
        .from('profiles')
        .select('id, expo_push_token')
        .not('expo_push_token', 'is', null);

      // Apply segment filters
      switch (segment) {
        case 'traders':
          query = query.contains('notification_segments', ['trading']);
          break;
        case 'spiritual':
          query = query.contains('notification_segments', ['spiritual']);
          break;
        case 'tier1_plus':
          query = query.in('scanner_tier', ['tier1', 'tier2', 'tier3', 'PRO', 'PREMIUM', 'VIP']);
          break;
        case 'inactive_3d':
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          query = query.lt('last_active_at', threeDaysAgo.toISOString());
          break;
        case 'all':
        default:
          // No additional filters
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[Notifications] getUsersBySegment error:', error);
      return [];
    }
  }

  /**
   * Calculate reach for segment
   */
  async calculateReach(segment) {
    try {
      const users = await this.getUsersBySegment(segment);
      return users.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get segment stats
   */
  async getSegmentStats() {
    try {
      const segments = {
        all: { name: 'Tất cả', count: 0 },
        traders: { name: 'Traders', count: 0 },
        spiritual: { name: 'Spiritual', count: 0 },
        tier1_plus: { name: 'TIER1+', count: 0 },
        inactive_3d: { name: 'Inactive 3+ days', count: 0 },
      };

      for (const key of Object.keys(segments)) {
        segments[key].count = await this.calculateReach(key);
      }

      return segments;
    } catch (error) {
      console.error('[Notifications] getSegmentStats error:', error);
      return {};
    }
  }

  // ==========================================
  // TEMPLATES
  // ==========================================

  /**
   * Get notification templates
   */
  async getTemplates(category = null, type = 'push') {
    try {
      let query = supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .eq('type', type)
        .order('usage_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('[Notifications] getTemplates error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Create template
   */
  async createTemplate(templateData) {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          ...templateData,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Notifications] createTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Notifications] updateTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Notifications] deleteTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Increment template usage
   */
  async incrementTemplateUsage(templateId) {
    try {
      await supabase.rpc('increment_template_usage', {
        p_template_id: templateId,
      });
    } catch (error) {
      console.error('[Notifications] incrementTemplateUsage error:', error);
    }
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  /**
   * Get notification stats for date range
   */
  async getStats(startDate, endDate) {
    try {
      const { data, error } = await supabase.rpc('get_notification_stats_by_date_range', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) throw error;

      return { success: true, data: data?.[0] || {} };
    } catch (error) {
      console.error('[Notifications] getStats error:', error);
      return { success: false, data: {}, error: error.message };
    }
  }

  /**
   * Get top performing notifications
   */
  async getTopPerforming(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('notification_schedule')
        .select('*')
        .eq('status', 'sent')
        .gt('total_delivered', 0)
        .order('total_opened', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Calculate rates
      const withRates = (data || []).map(n => ({
        ...n,
        openRate: n.total_delivered > 0
          ? ((n.total_opened / n.total_delivered) * 100).toFixed(1)
          : '0',
        clickRate: n.total_delivered > 0
          ? ((n.total_clicked / n.total_delivered) * 100).toFixed(1)
          : '0',
      }));

      return { success: true, data: withRates };
    } catch (error) {
      console.error('[Notifications] getTopPerforming error:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Get dashboard stats (quick overview)
   */
  async getDashboardStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get today's scheduled
      const { data: todayPush } = await supabase
        .from('notification_schedule')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

      // Get week stats
      const { data: weekStats } = await supabase.rpc('get_notification_stats_by_date_range', {
        p_start_date: weekAgo.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          pushToday: todayPush?.count || 0,
          sentThisWeek: weekStats?.[0]?.total_sent || 0,
          openRate: weekStats?.[0]?.avg_open_rate || 0,
          clickRate: weekStats?.[0]?.avg_click_rate || 0,
        },
      };
    } catch (error) {
      console.error('[Notifications] getDashboardStats error:', error);
      return { success: false, data: {} };
    }
  }

  // ==========================================
  // USER NOTIFICATION SETTINGS (JSONB Schema)
  // ==========================================

  /**
   * Get user notification settings from database
   */
  async getUserNotificationSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return data;
    } catch (error) {
      console.error('[Notifications] getUserNotificationSettings error:', error);
      return null;
    }
  }

  /**
   * Update user notification settings in database
   */
  async updateUserNotificationSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Notifications] updateUserNotificationSettings error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle master notification enabled/disabled
   */
  async toggleNotificationsEnabled(enabled) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          enabled: enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[Notifications] toggleNotificationsEnabled error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save push token to profiles table (for admin targeting)
   */
  async saveTokenToProfile(token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      console.log('[Notifications] Token saved to profile');
    } catch (error) {
      console.error('[Notifications] saveTokenToProfile error:', error);
    }
  }
}

export const notificationService = new NotificationService();

// ==========================================
// PHASE 3C: ALERT SYSTEM EXPORTS
// ==========================================

/**
 * Send local notification (direct export for alertManager)
 * @param {Object} options - Notification options
 * @returns {Promise<string>} Notification ID
 */
export const sendLocalNotification = async (options) => {
  try {
    const { title, body, data = {}, channelId = 'alerts' } = options;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate
    });

    console.log('[Notifications] Sent local notification:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Send local error:', error);
    return null;
  }
};

/**
 * Send push notification via server (direct export for alertManager)
 * @param {string} userId - Target user ID
 * @param {Object} options - Notification options
 */
export const sendPushNotification = async (userId, options) => {
  try {
    const { title, body, data = {} } = options;

    // Use local notification as implementation
    await sendLocalNotification({ title, body, data });

    return { success: true };
  } catch (error) {
    console.error('[Notifications] Send push error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send FTB notification (high priority)
 * @param {Object} alert - FTB alert data
 */
export const sendFTBNotification = async (alert) => {
  const emoji = '⭐';
  const title = `${emoji} ${alert.title || alert.titleVi}`;
  const body = alert.message;

  return await sendLocalNotification({
    title,
    body,
    data: {
      type: alert.type,
      symbol: alert.zone?.symbol,
      alertId: alert.id,
      actionRequired: alert.actionRequired,
      suggestedAction: alert.suggestedAction,
    },
    channelId: 'ftb',
  });
};

/**
 * Create alert-specific notification content
 * @param {Object} alert - Alert object
 * @returns {Object} Notification content
 */
export const createAlertNotificationContent = (alert) => {
  const emojis = {
    ftb: '⭐',
    ftb_approaching: '🌟',
    zone_approach: '🎯',
    confirmation: '✅',
    zone_broken: '⚠️',
    price_level: '💰',
    stacked_zone: '📊',
    high_score: '🏆',
    pin_engulf_combo: '⚡',
  };

  const emoji = emojis[alert.type] || '🔔';

  return {
    title: `${emoji} ${alert.title || alert.titleVi}`,
    body: alert.message,
    data: {
      type: alert.type,
      symbol: alert.zone?.symbol || alert.symbol,
      alertId: alert.id,
      actionRequired: alert.actionRequired,
      suggestedAction: alert.suggestedAction,
    },
  };
};

export default notificationService;
