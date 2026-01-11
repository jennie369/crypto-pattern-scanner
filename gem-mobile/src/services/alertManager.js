/**
 * GEM Mobile - Alert Manager Service
 * Phase 3C: Main alert orchestration and management
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAlertConditions, checkPriceLevelAlert } from './alertConditions';
import { sendPushNotification, sendLocalNotification } from './notificationService';
import { DEFAULT_ALERT_PREFERENCES } from '../constants/alertConfig';

const ALERTS_STORAGE_KEY = 'gem_user_alerts';
const PREFERENCES_STORAGE_KEY = 'gem_alert_preferences';
const HISTORY_STORAGE_KEY = 'gem_alert_history';

/**
 * Alert Manager Class
 * Orchestrates all alert functionality
 */
class AlertManager {
  constructor() {
    this.activeAlerts = [];
    this.preferences = { ...DEFAULT_ALERT_PREFERENCES };
    this.isInitialized = false;
    this.userId = null;
  }

  /**
   * Initialize alert manager for user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async initialize(userId) {
    try {
      this.userId = userId;

      // Load preferences
      this.preferences = await this.loadPreferences(userId);

      // Load active alerts
      this.activeAlerts = await this.loadActiveAlerts(userId);

      this.isInitialized = true;
      console.log('[AlertManager] Initialized with', this.activeAlerts.length, 'active alerts');

      return true;
    } catch (error) {
      console.error('[AlertManager] Init error:', error);
      return false;
    }
  }

  /**
   * Load user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Preferences
   */
  async loadPreferences(userId) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        // Cache locally
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
        return this.normalizePreferences(data);
      }

      // Fallback to local storage
      const cached = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (cached) {
        return this.normalizePreferences(JSON.parse(cached));
      }

      return { ...DEFAULT_ALERT_PREFERENCES };
    } catch (error) {
      console.warn('[AlertManager] Load preferences error:', error);
      return { ...DEFAULT_ALERT_PREFERENCES };
    }
  }

  /**
   * Normalize preferences from DB format
   */
  normalizePreferences(data) {
    return {
      alertsEnabled: data.alerts_enabled ?? true,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
      ftbAlerts: data.ftb_alerts ?? true,
      zoneApproachAlerts: data.zone_approach_alerts ?? true,
      confirmationAlerts: data.confirmation_alerts ?? true,
      priceAlerts: data.price_alerts ?? true,
      zoneBrokenAlerts: data.zone_broken_alerts ?? true,
      highScoreAlerts: data.high_score_alerts ?? true,
      stackedZoneAlerts: data.stacked_zone_alerts ?? true,
      approachDistancePercent: parseFloat(data.approach_distance_percent) || 1.0,
      minOddsScore: data.min_odds_score || 8,
      pushEnabled: data.push_enabled ?? true,
      telegramEnabled: data.telegram_enabled ?? false,
      telegramChatId: data.telegram_chat_id,
    };
  }

  /**
   * Load active alerts
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Active alerts
   */
  async loadActiveAlerts(userId) {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*, zone:zone_history(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && !error) {
        // Cache locally
        await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(data));
        return data;
      }

      // Fallback to local storage
      const cached = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      return [];
    } catch (error) {
      console.warn('[AlertManager] Load alerts error:', error);
      return [];
    }
  }

  /**
   * Create new alert
   * @param {Object} alertData - Alert configuration
   * @returns {Promise<Object>} Result
   */
  async createAlert(alertData) {
    try {
      const newAlert = {
        user_id: this.userId,
        symbol: alertData.symbol,
        timeframe: alertData.timeframe,
        alert_type: alertData.alertType,
        trigger_price: alertData.triggerPrice,
        trigger_condition: alertData.triggerCondition,
        zone_id: alertData.zoneId,
        is_active: true,
        is_one_time: alertData.isOneTime ?? true,
        notify_push: alertData.notifyPush ?? true,
        notify_telegram: alertData.notifyTelegram ?? false,
        note: alertData.note,
        trigger_count: 0,
      };

      const { data, error } = await supabase
        .from('user_alerts')
        .insert(newAlert)
        .select()
        .single();

      if (error) throw error;

      this.activeAlerts.push(data);
      await this.syncAlertsToLocal();

      return { success: true, alert: data };
    } catch (error) {
      console.error('[AlertManager] Create alert error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete alert
   * @param {string} alertId - Alert ID
   * @returns {Promise<Object>} Result
   */
  async deleteAlert(alertId) {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', this.userId);

      if (error) throw error;

      this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId);
      await this.syncAlertsToLocal();

      return { success: true };
    } catch (error) {
      console.error('[AlertManager] Delete alert error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle alert active status
   * @param {string} alertId - Alert ID
   * @param {boolean} isActive - New status
   * @returns {Promise<Object>} Result
   */
  async toggleAlert(alertId, isActive) {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) throw error;

      const index = this.activeAlerts.findIndex(a => a.id === alertId);
      if (index !== -1) {
        if (isActive) {
          this.activeAlerts[index] = data;
        } else {
          this.activeAlerts.splice(index, 1);
        }
      } else if (isActive) {
        this.activeAlerts.push(data);
      }

      await this.syncAlertsToLocal();

      return { success: true, alert: data };
    } catch (error) {
      console.error('[AlertManager] Toggle alert error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process triggered alert
   * @param {Object} alert - Alert object
   * @param {Object} triggerData - Trigger context
   * @returns {Promise<Object>} Result
   */
  async triggerAlert(alert, triggerData) {
    try {
      const now = new Date().toISOString();

      // Update alert status if it's a saved alert
      if (alert.id) {
        await supabase
          .from('user_alerts')
          .update({
            triggered_at: now,
            triggered_price: triggerData.currentPrice,
            trigger_count: (alert.trigger_count || 0) + 1,
            is_active: !alert.is_one_time,
            updated_at: now,
          })
          .eq('id', alert.id);

        // Remove from active if one-time
        if (alert.is_one_time) {
          this.activeAlerts = this.activeAlerts.filter(a => a.id !== alert.id);
        }
      }

      // Save to history
      const historyEntry = await this.saveToHistory({
        alertId: alert.id,
        symbol: triggerData.zone?.symbol || alert.symbol,
        alertType: alert.type,
        title: alert.title || alert.titleVi,
        message: alert.message,
        triggerPrice: triggerData.currentPrice,
        zoneInfo: triggerData.zone,
        confirmationInfo: triggerData.patterns || triggerData.combo,
      });

      // Send notification
      if (this.preferences.pushEnabled && !this.isQuietHours()) {
        await sendLocalNotification({
          title: alert.title || alert.titleVi,
          body: alert.message,
          data: {
            type: alert.type,
            symbol: triggerData.zone?.symbol || alert.symbol,
            alertId: alert.id,
          },
        });
      }

      return { success: true, historyEntry };
    } catch (error) {
      console.error('[AlertManager] Trigger alert error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save alert to history
   */
  async saveToHistory(data) {
    try {
      const { data: historyEntry, error } = await supabase
        .from('alert_history')
        .insert({
          user_id: this.userId,
          alert_id: data.alertId,
          symbol: data.symbol,
          alert_type: data.alertType,
          title: data.title,
          message: data.message,
          trigger_price: data.triggerPrice,
          zone_info: data.zoneInfo,
          confirmation_info: data.confirmationInfo,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return historyEntry;
    } catch (error) {
      console.warn('[AlertManager] Save to history error:', error);
      return null;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours() {
    if (!this.preferences.quietHoursStart || !this.preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startH, startM] = this.preferences.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check all alerts for a symbol
   * @param {string} symbol - Symbol
   * @param {number} currentPrice - Current price
   * @param {number} previousPrice - Previous price
   * @param {Array} zones - Active zones
   * @param {Array} candles - Recent candles
   * @returns {Promise<Array>} Triggered alerts
   */
  async checkAlertsForSymbol(symbol, currentPrice, previousPrice, zones = [], candles = []) {
    if (!this.preferences.alertsEnabled) return [];

    const triggeredAlerts = [];

    // Check zone-based alerts
    for (const zone of zones) {
      if (zone.symbol !== symbol) continue;

      const alerts = checkAlertConditions(zone, currentPrice, candles, this.preferences);

      for (const alert of alerts) {
        const result = await this.triggerAlert(alert, {
          zone,
          currentPrice,
          previousPrice,
          patterns: alert.patterns,
          combo: alert.combo,
        });

        if (result.success) {
          triggeredAlerts.push({ ...alert, historyEntry: result.historyEntry });
        }
      }
    }

    // Check price level alerts
    const priceLevelAlerts = this.activeAlerts.filter(
      a => a.alert_type === 'price_level' && a.symbol === symbol
    );

    for (const alertConfig of priceLevelAlerts) {
      const alert = checkPriceLevelAlert(alertConfig, currentPrice, previousPrice);

      if (alert) {
        const result = await this.triggerAlert(
          { ...alert, id: alertConfig.id, is_one_time: alertConfig.is_one_time },
          { currentPrice, previousPrice }
        );

        if (result.success) {
          triggeredAlerts.push({ ...alert, historyEntry: result.historyEntry });
        }
      }
    }

    return triggeredAlerts;
  }

  /**
   * Get unread alert count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const { count, error } = await supabase
        .from('alert_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('is_read', false);

      return error ? 0 : count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Mark alerts as read
   * @param {Array} alertIds - Alert IDs to mark as read (empty = all)
   */
  async markAsRead(alertIds = []) {
    try {
      let query = supabase
        .from('alert_history')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId);

      if (alertIds.length > 0) {
        query = query.in('id', alertIds);
      }

      await query;
    } catch (error) {
      console.warn('[AlertManager] Mark as read error:', error);
    }
  }

  /**
   * Get alert history
   * @param {number} limit - Max items
   * @returns {Promise<Array>} Alert history
   */
  async getHistory(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return error ? [] : data;
    } catch (error) {
      return [];
    }
  }

  /**
   * Update preferences
   * @param {Object} newPreferences - New preference values
   * @returns {Promise<Object>} Result
   */
  async updatePreferences(newPreferences) {
    try {
      const dbPreferences = {
        user_id: this.userId,
        alerts_enabled: newPreferences.alertsEnabled,
        quiet_hours_start: newPreferences.quietHoursStart,
        quiet_hours_end: newPreferences.quietHoursEnd,
        ftb_alerts: newPreferences.ftbAlerts,
        zone_approach_alerts: newPreferences.zoneApproachAlerts,
        confirmation_alerts: newPreferences.confirmationAlerts,
        price_alerts: newPreferences.priceAlerts,
        zone_broken_alerts: newPreferences.zoneBrokenAlerts,
        high_score_alerts: newPreferences.highScoreAlerts,
        stacked_zone_alerts: newPreferences.stackedZoneAlerts,
        approach_distance_percent: newPreferences.approachDistancePercent,
        min_odds_score: newPreferences.minOddsScore,
        push_enabled: newPreferences.pushEnabled,
        telegram_enabled: newPreferences.telegramEnabled,
        telegram_chat_id: newPreferences.telegramChatId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('alert_preferences')
        .upsert(dbPreferences)
        .select()
        .single();

      if (error) throw error;

      this.preferences = this.normalizePreferences(data);
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));

      return { success: true, data: this.preferences };
    } catch (error) {
      console.error('[AlertManager] Update preferences error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync alerts to local storage
   */
  async syncAlertsToLocal() {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(this.activeAlerts));
    } catch (error) {
      console.warn('[AlertManager] Sync to local error:', error);
    }
  }

  /**
   * Get all active alerts
   * @returns {Array} Active alerts
   */
  getActiveAlerts() {
    return this.activeAlerts;
  }

  /**
   * Get current preferences
   * @returns {Object} Preferences
   */
  getPreferences() {
    return this.preferences;
  }

  /**
   * Clear all data (for logout)
   */
  async clear() {
    this.activeAlerts = [];
    this.preferences = { ...DEFAULT_ALERT_PREFERENCES };
    this.userId = null;
    this.isInitialized = false;

    await AsyncStorage.multiRemove([ALERTS_STORAGE_KEY, PREFERENCES_STORAGE_KEY]);
  }
}

// Singleton instance
export const alertManager = new AlertManager();

export default alertManager;
