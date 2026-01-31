/**
 * PatternNotificationService - Push notifications cho pattern alerts
 *
 * FEATURES:
 * - New pattern detected notification
 * - Price approaching entry notification
 * - SL/TP hit notification
 * - Customizable alert preferences
 * - Haptic feedback integration
 *
 * USAGE:
 * import { patternNotifications } from '../services/scanner/patternNotificationService';
 *
 * // Initialize on app start
 * await patternNotifications.init();
 *
 * // Notify new pattern
 * patternNotifications.notifyNewPattern(pattern);
 *
 * // Notify price alert
 * patternNotifications.notifyPriceApproaching(pattern, currentPrice, 0.5);
 */

import { Platform } from 'react-native';
import { haptic } from '../hapticService';

// Try to import expo-notifications
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('[PatternNotif] expo-notifications not available');
}

// Configure notification handler
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

class PatternNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.isInitialized = false;
    this.notificationListener = null;
    this.responseListener = null;

    // User preferences
    this.preferences = {
      newPatterns: true,
      priceAlerts: true,
      slTpHit: true,
      scanComplete: true,
      minConfidence: 0.7,
      soundEnabled: true,
      vibrationEnabled: true,
    };

    // Throttling to prevent spam
    this.lastNotifications = new Map(); // key -> timestamp
    this.THROTTLE_MS = 60 * 1000; // 1 minute between same notifications
  }

  /**
   * Initialize notification service
   * @returns {Promise<boolean>} Success
   */
  async init() {
    if (this.isInitialized || !Notifications) {
      return this.isInitialized;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PatternNotif] Permission denied');
        return false;
      }

      // Get push token (for remote notifications if needed later)
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with actual project ID
        });
        this.expoPushToken = tokenData.data;
      } catch (e) {
        console.log('[PatternNotif] Could not get push token:', e.message);
      }

      // Setup listeners
      this._setupListeners();

      this.isInitialized = true;
      console.log('[PatternNotif] Initialized');

      return true;
    } catch (err) {
      console.error('[PatternNotif] Init error:', err);
      return false;
    }
  }

  /**
   * Set notification preferences
   * @param {object} prefs - Preference updates
   */
  setPreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
  }

  /**
   * Get current preferences
   * @returns {object}
   */
  getPreferences() {
    return { ...this.preferences };
  }

  // =====================================================
  // NOTIFICATION TYPES
  // =====================================================

  /**
   * Notify new pattern detected
   * @param {object} pattern - Detected pattern
   */
  async notifyNewPattern(pattern) {
    if (!this.preferences.newPatterns) return;
    if (!pattern) return;

    const confidence = parseFloat(pattern.confidence || 0);
    if (confidence < this.preferences.minConfidence) return;

    // Throttle check
    const key = `new_${pattern.symbol}_${pattern.type}`;
    if (this._isThrottled(key)) return;

    const patternName = pattern.pattern_name || pattern.type || 'Pattern';
    const rr = pattern.riskRewardRatio || pattern.rrRatio || 0;
    const direction = pattern.direction?.toLowerCase().includes('bull') ? 'LONG' : 'SHORT';

    const title = `🎯 ${patternName} - ${pattern.symbol}`;
    const body = `${direction} | Entry: ${this._formatPrice(pattern.entry)} | R:R 1:${rr.toFixed(1)}`;

    await this._scheduleNotification(title, body, {
      type: 'new_pattern',
      patternId: pattern.id || pattern.pattern_id,
      symbol: pattern.symbol,
    });

    haptic.patternDetected();
    this._markNotified(key);
  }

  /**
   * Notify price approaching entry
   * @param {object} pattern - Pattern with entry price
   * @param {number} currentPrice - Current market price
   * @param {number} distancePercent - Distance from entry as percentage
   */
  async notifyPriceApproaching(pattern, currentPrice, distancePercent) {
    if (!this.preferences.priceAlerts) return;
    if (!pattern || !currentPrice) return;
    if (distancePercent > 1) return; // Only notify within 1%

    // Throttle check
    const key = `price_${pattern.symbol}_${pattern.id}`;
    if (this._isThrottled(key)) return;

    const title = `⚡ Price Near Entry - ${pattern.symbol}`;
    const body = `Current: ${this._formatPrice(currentPrice)}\nEntry: ${this._formatPrice(pattern.entry)} (${distancePercent.toFixed(2)}% away)`;

    await this._scheduleNotification(title, body, {
      type: 'price_alert',
      patternId: pattern.id || pattern.pattern_id,
      symbol: pattern.symbol,
      currentPrice,
    });

    haptic.priceAlert();
    this._markNotified(key);
  }

  /**
   * Notify SL or TP hit
   * @param {object} position - Position that hit SL/TP
   * @param {string} type - 'SL' or 'TP'
   * @param {number} pnl - Profit/Loss amount
   */
  async notifySLTPHit(position, type, pnl) {
    if (!this.preferences.slTpHit) return;
    if (!position) return;

    const isProfit = type === 'TP' || pnl > 0;
    const emoji = isProfit ? '💰' : '🔴';
    const title = `${emoji} ${type} Hit - ${position.symbol}`;
    const pnlStr = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
    const body = `${isProfit ? 'Profit' : 'Loss'}: ${pnlStr} USDT\nEntry: ${this._formatPrice(position.entryPrice)} → Exit: ${this._formatPrice(position.currentPrice)}`;

    await this._scheduleNotification(title, body, {
      type: 'sltp_hit',
      positionId: position.id,
      symbol: position.symbol,
      isProfit,
      pnl,
    });

    isProfit ? haptic.tradeProfit() : haptic.tradeLoss();
  }

  /**
   * Notify scan complete
   * @param {number} patternsFound - Number of patterns found
   * @param {number} coinsScanned - Number of coins scanned
   */
  async notifyScanComplete(patternsFound, coinsScanned) {
    if (!this.preferences.scanComplete) return;

    // Only notify if patterns found
    if (patternsFound === 0) return;

    const title = `✅ Scan Complete`;
    const body = `Found ${patternsFound} pattern${patternsFound !== 1 ? 's' : ''} across ${coinsScanned} coin${coinsScanned !== 1 ? 's' : ''}`;

    await this._scheduleNotification(title, body, {
      type: 'scan_complete',
      patternsFound,
      coinsScanned,
    });

    haptic.scanComplete();
  }

  /**
   * Notify trade opened
   * @param {object} position - New position
   */
  async notifyTradeOpened(position) {
    if (!position) return;

    const direction = position.direction === 'LONG' ? '📈 LONG' : '📉 SHORT';
    const title = `${direction} Opened - ${position.symbol}`;
    const body = `Entry: ${this._formatPrice(position.entryPrice)}\nSL: ${this._formatPrice(position.stopLoss)} | TP: ${this._formatPrice(position.takeProfit)}`;

    await this._scheduleNotification(title, body, {
      type: 'trade_opened',
      positionId: position.id,
      symbol: position.symbol,
    });

    haptic.tradeOpened();
  }

  // =====================================================
  // MANAGEMENT
  // =====================================================

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll() {
    if (!Notifications) return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[PatternNotif] Cancelled all notifications');
    } catch (e) {
      console.error('[PatternNotif] Cancel error:', e);
    }
  }

  /**
   * Get badge count
   * @returns {Promise<number>}
   */
  async getBadgeCount() {
    if (!Notifications) return 0;

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (e) {
      return 0;
    }
  }

  /**
   * Set badge count
   * @param {number} count
   */
  async setBadgeCount(count) {
    if (!Notifications) return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (e) {
      console.error('[PatternNotif] Set badge error:', e);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge() {
    await this.setBadgeCount(0);
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications?.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications?.removeNotificationSubscription(this.responseListener);
    }
    this.lastNotifications.clear();
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  /**
   * Schedule a local notification
   * @private
   */
  async _scheduleNotification(title, body, data = {}) {
    if (!Notifications) {
      console.log('[PatternNotif] Would notify:', title);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.preferences.soundEnabled ? 'default' : null,
          vibrate: this.preferences.vibrationEnabled ? [0, 250, 250, 250] : null,
        },
        trigger: null, // Immediate
      });

      console.log('[PatternNotif] Scheduled:', title);
    } catch (err) {
      console.error('[PatternNotif] Schedule error:', err);
    }
  }

  /**
   * Setup notification listeners
   * @private
   */
  _setupListeners() {
    if (!Notifications) return;

    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PatternNotif] Received:', notification.request.content.title);
      }
    );

    // Listener for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('[PatternNotif] Tapped:', data);
        // Could navigate to specific screen based on data.type
      }
    );
  }

  /**
   * Check if notification is throttled
   * @private
   */
  _isThrottled(key) {
    const lastTime = this.lastNotifications.get(key);
    if (!lastTime) return false;
    return Date.now() - lastTime < this.THROTTLE_MS;
  }

  /**
   * Mark notification as sent
   * @private
   */
  _markNotified(key) {
    this.lastNotifications.set(key, Date.now());

    // Cleanup old entries
    if (this.lastNotifications.size > 100) {
      const cutoff = Date.now() - this.THROTTLE_MS;
      for (const [k, v] of this.lastNotifications.entries()) {
        if (v < cutoff) {
          this.lastNotifications.delete(k);
        }
      }
    }
  }

  /**
   * Format price for display
   * @private
   */
  _formatPrice(price) {
    if (!price && price !== 0) return '-';
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 100) return num.toFixed(2);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}

// Singleton instance
export const patternNotifications = new PatternNotificationService();

// Named export
export { PatternNotificationService };

// Default export
export default patternNotifications;
