/**
 * GEM Scanner - Paper Trade Notification Service
 * Push notifications for order fills, TP/SL hits, liquidation warnings
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { formatUSDT, formatPercent } from './tradingCalculations';
import { NOTIFICATION_TYPES } from '../constants/tradingConstants';

// AsyncStorage keys
const STORAGE_KEYS = {
  NOTIFICATION_SETTINGS: '@gem_paper_trade_notification_settings',
  EXPO_PUSH_TOKEN: '@gem_expo_push_token',
};

// Default notification settings
const DEFAULT_SETTINGS = {
  push_enabled: true,
  notify_order_placed: true,
  notify_order_filled: true,
  notify_order_cancelled: true,
  notify_tp_hit: true,
  notify_sl_hit: true,
  notify_position_closed: true,
  notify_liquidation_warning: true,
  liquidation_warning_threshold: 80,
  sound_enabled: true,
  vibration_enabled: true,
  quiet_hours_enabled: false,
  quiet_start: '22:00',
  quiet_end: '08:00',
};

// Notification templates
const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.ORDER_PLACED]: {
    title: 'Lệnh đã được đặt',
    titleEn: 'Order Placed',
    getBody: (data) => `${data.direction} ${data.symbol} @ ${formatUSDT(data.price)} - ${data.orderType}`,
    priority: 'default',
    categoryId: 'order',
  },
  [NOTIFICATION_TYPES.ORDER_FILLED]: {
    title: 'Lệnh đã khớp!',
    titleEn: 'Order Filled!',
    getBody: (data) => `${data.direction} ${data.symbol}\nGiá: ${formatUSDT(data.filledPrice)}\nSize: ${formatUSDT(data.positionValue)}`,
    priority: 'high',
    categoryId: 'order',
  },
  [NOTIFICATION_TYPES.ORDER_CANCELLED]: {
    title: 'Lệnh đã hủy',
    titleEn: 'Order Cancelled',
    getBody: (data) => `${data.direction} ${data.symbol} - ${data.reason || 'Đã hủy bởi người dùng'}`,
    priority: 'default',
    categoryId: 'order',
  },
  [NOTIFICATION_TYPES.TP_HIT]: {
    title: 'Chốt lời thành công!',
    titleEn: 'Take Profit Hit!',
    getBody: (data) => `${data.symbol}: +${formatUSDT(data.pnl)} (${formatPercent(data.roe, true)} ROI)`,
    priority: 'high',
    categoryId: 'position',
  },
  [NOTIFICATION_TYPES.SL_HIT]: {
    title: 'Cắt lỗ đã kích hoạt',
    titleEn: 'Stop Loss Hit',
    getBody: (data) => `${data.symbol}: ${formatUSDT(data.pnl)} (${formatPercent(data.roe, false)} ROI)`,
    priority: 'high',
    categoryId: 'position',
  },
  [NOTIFICATION_TYPES.POSITION_CLOSED]: {
    title: 'Vị thế đã đóng',
    titleEn: 'Position Closed',
    getBody: (data) => {
      const pnlSign = data.pnl >= 0 ? '+' : '';
      return `${data.symbol}: ${pnlSign}${formatUSDT(data.pnl)} (${formatPercent(data.roe, data.pnl >= 0)} ROI)`;
    },
    priority: 'default',
    categoryId: 'position',
  },
  [NOTIFICATION_TYPES.LIQUIDATION_WARNING]: {
    title: 'Cảnh báo thanh lý!',
    titleEn: 'Liquidation Warning!',
    getBody: (data) => `${data.symbol}: Margin đã sử dụng ${data.marginUsed}%. Hãy thêm margin hoặc giảm vị thế.`,
    priority: 'high',
    categoryId: 'alert',
  },
  [NOTIFICATION_TYPES.LIQUIDATION]: {
    title: 'Vị thế đã bị thanh lý!',
    titleEn: 'Position Liquidated!',
    getBody: (data) => `${data.symbol}: Vị thế bị thanh lý @ ${formatUSDT(data.liquidationPrice)}\nLỗ: ${formatUSDT(data.pnl)}`,
    priority: 'high',
    categoryId: 'alert',
  },
  [NOTIFICATION_TYPES.STOP_TRIGGERED]: {
    title: 'Stop đã kích hoạt',
    titleEn: 'Stop Triggered',
    getBody: (data) => `${data.symbol}: Giá đã chạm ${formatUSDT(data.stopPrice)}`,
    priority: 'high',
    categoryId: 'order',
  },
};

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

/**
 * Initialize notification service
 * Request permissions and configure handlers
 */
export const initialize = async () => {
  try {
    // NOTE: setNotificationHandler is configured ONLY in InAppNotificationContext.js
    // Do NOT add one here — multiple handlers cause the last-loaded to win.

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[notificationService] Permission not granted');
      return { success: false, error: 'Permission not granted' };
    }

    // Get push token
    const token = await getExpoPushToken();

    // Configure notification categories
    await configureNotificationCategories();

    console.log('[notificationService] Initialized successfully');
    return { success: true, token };
  } catch (error) {
    console.error('[notificationService] Initialize error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get or create Expo push token
 */
const getExpoPushToken = async () => {
  try {
    // Check cached token first
    const cachedToken = await AsyncStorage.getItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
    if (cachedToken) {
      return cachedToken;
    }

    // Get new token
    const { data: token } = await Notifications.getExpoPushTokenAsync();

    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPO_PUSH_TOKEN, token);
      console.log('[notificationService] Got push token:', token.substring(0, 20) + '...');
    }

    return token;
  } catch (error) {
    console.error('[notificationService] getExpoPushToken error:', error);
    return null;
  }
};

/**
 * Configure notification categories (for action buttons)
 */
const configureNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync('order', [
      { identifier: 'view', buttonTitle: 'Xem chi tiết', options: { opensAppToForeground: true } },
    ]);

    await Notifications.setNotificationCategoryAsync('position', [
      { identifier: 'view', buttonTitle: 'Xem vị thế', options: { opensAppToForeground: true } },
      { identifier: 'close', buttonTitle: 'Đóng vị thế', options: { opensAppToForeground: true } },
    ]);

    await Notifications.setNotificationCategoryAsync('alert', [
      { identifier: 'view', buttonTitle: 'Xem ngay', options: { opensAppToForeground: true } },
    ]);
  } catch (error) {
    console.error('[notificationService] configureCategories error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════

/**
 * Get notification settings
 * @param {string} userId - User ID (optional)
 */
export const getSettings = async (userId = null) => {
  try {
    // Get local settings first
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    const localSettings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS };

    // Merge with Supabase settings if logged in
    if (userId) {
      const { data } = await supabase
        .from('paper_trade_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        return { ...localSettings, ...data };
      }
    }

    return localSettings;
  } catch (error) {
    console.error('[notificationService] getSettings error:', error);
    return { ...DEFAULT_SETTINGS };
  }
};

/**
 * Update notification settings
 * @param {string} userId - User ID (optional)
 * @param {Object} updates - Settings to update
 */
export const updateSettings = async (userId = null, updates) => {
  try {
    // Update local settings
    const currentSettings = await getSettings(userId);
    const newSettings = { ...currentSettings, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(newSettings));

    // Sync to Supabase if logged in
    if (userId) {
      await supabase
        .from('paper_trade_notification_settings')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }

    return newSettings;
  } catch (error) {
    console.error('[notificationService] updateSettings error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// SEND NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Check if notification should be sent
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 */
const shouldSendNotification = async (userId, type) => {
  try {
    const settings = await getSettings(userId);

    // Check master toggle
    if (!settings.push_enabled) {
      return false;
    }

    // Check specific type
    const typeKey = `notify_${type.replace('order_', '').replace('_hit', '')}`;
    if (settings[typeKey] === false) {
      return false;
    }

    // Check quiet hours
    if (settings.quiet_hours_enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { quiet_start, quiet_end } = settings;

      // Handle overnight quiet hours (e.g., 22:00 - 08:00)
      if (quiet_start > quiet_end) {
        if (currentTime >= quiet_start || currentTime <= quiet_end) {
          return false;
        }
      } else {
        if (currentTime >= quiet_start && currentTime <= quiet_end) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('[notificationService] shouldSend error:', error);
    return true; // Default to sending on error
  }
};

// Phase 10 Fix C: Position-ID dedup — prevents duplicate notifications for same position/order
const _notifiedKeys = new Set();
const DEDUP_TTL_MS = 60000; // Auto-clear dedup keys after 60s

/**
 * Send local notification (client-side only — remote push handled by server cron)
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @param {string} userId - User ID (optional)
 */
export const sendNotification = async (type, data, userId = null) => {
  try {
    // Phase 10 Fix C: Dedup by positionId/orderId + type
    const entityId = data.positionId || data.orderId || null;
    if (entityId) {
      const dedupKey = `${entityId}_${type}`;
      if (_notifiedKeys.has(dedupKey)) {
        console.log('[notificationService] Dedup: skipping duplicate', dedupKey);
        return { sent: false, reason: 'duplicate' };
      }
      _notifiedKeys.add(dedupKey);
      setTimeout(() => _notifiedKeys.delete(dedupKey), DEDUP_TTL_MS);
    }

    // Check if should send
    if (!(await shouldSendNotification(userId, type))) {
      console.log('[notificationService] Notification suppressed:', type);
      return { sent: false, reason: 'suppressed' };
    }

    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      console.warn('[notificationService] Unknown notification type:', type);
      return { sent: false, reason: 'unknown_type' };
    }

    const settings = await getSettings(userId);
    const title = template.title;
    const body = template.getBody(data);

    // Build notification content
    const content = {
      title,
      body,
      data: { type, ...data },
      categoryIdentifier: template.categoryId,
      sound: settings.sound_enabled ? 'default' : null,
      priority: template.priority,
      badge: 1,
    };

    // Send local notification only — remote push is handled by server cron
    // (Phase 10 Fix E: removed client-side sendRemotePush to prevent duplicate remote notifications)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: null, // Immediate
    });

    console.log('[notificationService] Sent notification:', type, notificationId);
    return { sent: true, notificationId };
  } catch (error) {
    console.error('[notificationService] sendNotification error:', error);
    return { sent: false, error: error.message };
  }
};

/**
 * Log notification to history in Supabase
 */
const logNotificationHistory = async (userId, type, content, data) => {
  try {
    await supabase
      .from('paper_trade_notification_history')
      .insert({
        user_id: userId,
        type,
        title: content.title,
        body: content.body,
        data,
        position_id: data.positionId || null,
        order_id: data.orderId || null,
        symbol: data.symbol || null,
        push_status: 'sent',
      });
  } catch (error) {
    console.error('[notificationService] logHistory error:', error);
  }
};

/**
 * Send remote push notification via Edge Function
 * This ensures notification is delivered even when app is closed
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
export const sendRemotePush = async (userId, type, title, body, data = {}) => {
  if (!userId) {
    console.warn('[notificationService] No userId for remote push');
    return { sent: false, reason: 'no_user_id' };
  }

  try {
    const { data: result, error } = await supabase.functions.invoke(
      'send-paper-trade-push',
      {
        body: {
          userId,
          type,
          title,
          body,
          data,
        },
      }
    );

    if (error) {
      console.error('[notificationService] Remote push error:', error);
      return { sent: false, error: error.message };
    }

    console.log('[notificationService] Remote push sent:', result);
    return { sent: true, ...result };
  } catch (error) {
    console.error('[notificationService] Remote push exception:', error);
    return { sent: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════
// CONVENIENCE METHODS
// ═══════════════════════════════════════════════════════════

/**
 * Notify order filled
 */
export const notifyOrderFilled = async (order, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.ORDER_FILLED, {
    symbol: order.symbol,
    direction: order.direction,
    filledPrice: order.entry_price || order.filledPrice,
    positionValue: order.position_size,
    orderId: order.id,
  }, userId);
};

/**
 * Notify TP hit
 */
export const notifyTPHit = async (position, pnl, roe, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.TP_HIT, {
    symbol: position.symbol,
    pnl,
    roe,
    positionId: position.id,
  }, userId);
};

/**
 * Notify SL hit
 */
export const notifySLHit = async (position, pnl, roe, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.SL_HIT, {
    symbol: position.symbol,
    pnl,
    roe,
    positionId: position.id,
  }, userId);
};

/**
 * Notify liquidation warning
 */
export const notifyLiquidationWarning = async (position, marginUsed, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.LIQUIDATION_WARNING, {
    symbol: position.symbol,
    marginUsed: marginUsed.toFixed(1),
    positionId: position.id,
  }, userId);
};

/**
 * Notify position liquidated
 */
export const notifyLiquidation = async (position, liquidationPrice, pnl, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.LIQUIDATION, {
    symbol: position.symbol,
    liquidationPrice,
    pnl,
    positionId: position.id,
    direction: position.direction,
  }, userId);
};

/**
 * Notify position closed
 */
export const notifyPositionClosed = async (position, pnl, roe, userId = null) => {
  return sendNotification(NOTIFICATION_TYPES.POSITION_CLOSED, {
    symbol: position.symbol,
    pnl,
    roe,
    positionId: position.id,
  }, userId);
};

// ═══════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════

/**
 * Add notification response listener
 * @param {Function} callback - Callback function
 * @returns {Object} Subscription
 */
export const addResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Add notification received listener
 * @param {Function} callback - Callback function
 * @returns {Object} Subscription
 */
export const addReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const paperTradeNotificationService = {
  initialize,
  getSettings,
  updateSettings,
  sendNotification,
  sendRemotePush,
  notifyOrderFilled,
  notifyTPHit,
  notifySLHit,
  notifyLiquidationWarning,
  notifyLiquidation,
  notifyPositionClosed,
  addResponseListener,
  addReceivedListener,
};

export default paperTradeNotificationService;
