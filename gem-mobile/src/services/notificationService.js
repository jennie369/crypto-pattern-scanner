/**
 * Gemral - Notification Service
 * Local push notifications for order updates and alerts
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@gem_notification_settings';

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
  // Social
  forum_like: 'social',
  forum_comment: 'social',
  forum_reply: 'social',
  forum_follow: 'social',
  mention: 'social',
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

      console.log('[Notifications] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Notifications] Initialize error:', error);
      return false;
    }
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
}

export const notificationService = new NotificationService();
export default notificationService;
