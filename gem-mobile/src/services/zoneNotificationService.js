/**
 * GEM Mobile - Zone Notification Service
 * Handles zone-related push notifications
 *
 * Notification Types:
 * - ZONE_RETEST: When price tests a zone
 * - ZONE_BROKEN: When a zone is broken
 * - FRESH_ZONE_DETECTED: New high-grade zone found
 * - MTF_ALIGNMENT: When timeframes align
 */

import { supabase } from './supabase';
import notificationService from './notificationService';
import { tierAccessService } from './tierAccessService';

// Notification types
export const ZONE_NOTIFICATION_TYPES = {
  ZONE_RETEST: 'zone_retest',
  ZONE_BROKEN: 'zone_broken',
  FRESH_ZONE_DETECTED: 'fresh_zone_detected',
  MTF_ALIGNMENT: 'mtf_alignment',
  APPROACHING_ZONE: 'approaching_zone',
};

// Notification templates
const NOTIFICATION_TEMPLATES = {
  [ZONE_NOTIFICATION_TYPES.ZONE_RETEST]: {
    title: '🎯 Zone Retest Alert',
    body: (data) => `${data.symbol} đang test ${data.zoneType} zone tại ${data.price}`,
    priority: 'high',
    channel: 'scanner',
  },
  [ZONE_NOTIFICATION_TYPES.ZONE_BROKEN]: {
    title: '⚠️ Zone Broken',
    body: (data) => `${data.symbol}: ${data.zoneType} zone bị phá vỡ tại ${data.price}`,
    priority: 'high',
    channel: 'scanner',
  },
  [ZONE_NOTIFICATION_TYPES.FRESH_ZONE_DETECTED]: {
    title: '✨ Fresh Zone Detected',
    body: (data) => `${data.symbol} ${data.timeframe}: ${data.zoneType} zone mới - Grade ${data.grade}`,
    priority: 'normal',
    channel: 'scanner',
  },
  [ZONE_NOTIFICATION_TYPES.MTF_ALIGNMENT]: {
    title: '🔥 MTF Alignment',
    body: (data) => `${data.symbol}: Đồng thuận ${data.alignmentScore}% - ${data.recommendation}`,
    priority: 'high',
    channel: 'scanner',
  },
  [ZONE_NOTIFICATION_TYPES.APPROACHING_ZONE]: {
    title: '📍 Approaching Zone',
    body: (data) => `${data.symbol} đang tiếp cận ${data.zoneType} zone (${data.distance}%)`,
    priority: 'normal',
    channel: 'scanner',
  },
};

class ZoneNotificationService {
  constructor() {
    this.userPreferences = {};
    this.cooldowns = {}; // Prevent notification spam
    this.COOLDOWN_MS = 60000; // 1 minute between same notifications
  }

  /**
   * Check if notification type is enabled for user
   */
  async checkUserPreferences(userId, notificationType) {
    if (!userId) return false;

    // Check if user has zone alerts enabled in their tier
    if (!tierAccessService.canUseZoneAlerts()) {
      return false;
    }

    try {
      // Check user notification preferences
      const { data, error } = await supabase
        .from('zone_visualization_preferences')
        .select('notify_on_retest, notify_on_broken, notify_on_fresh, notify_on_mtf')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default: all notifications enabled
        return true;
      }

      switch (notificationType) {
        case ZONE_NOTIFICATION_TYPES.ZONE_RETEST:
        case ZONE_NOTIFICATION_TYPES.APPROACHING_ZONE:
          return data.notify_on_retest !== false;
        case ZONE_NOTIFICATION_TYPES.ZONE_BROKEN:
          return data.notify_on_broken !== false;
        case ZONE_NOTIFICATION_TYPES.FRESH_ZONE_DETECTED:
          return data.notify_on_fresh !== false;
        case ZONE_NOTIFICATION_TYPES.MTF_ALIGNMENT:
          return data.notify_on_mtf !== false;
        default:
          return true;
      }
    } catch (error) {
      console.log('[ZoneNotificationService] Preferences check error:', error.message);
      return true; // Default to enabled
    }
  }

  /**
   * Check cooldown to prevent notification spam
   */
  isOnCooldown(key) {
    const lastSent = this.cooldowns[key];
    if (!lastSent) return false;
    return Date.now() - lastSent < this.COOLDOWN_MS;
  }

  /**
   * Set cooldown after sending notification
   */
  setCooldown(key) {
    this.cooldowns[key] = Date.now();
  }

  /**
   * Send zone notification
   */
  async sendZoneNotification(type, data, userId) {
    try {
      // Validate notification type
      const template = NOTIFICATION_TEMPLATES[type];
      if (!template) {
        console.warn('[ZoneNotificationService] Unknown notification type:', type);
        return { success: false, error: 'Unknown notification type' };
      }

      // Check user preferences
      const isEnabled = await this.checkUserPreferences(userId, type);
      if (!isEnabled) {
        console.log('[ZoneNotificationService] Notification disabled for user:', type);
        return { success: false, reason: 'disabled' };
      }

      // Check cooldown
      const cooldownKey = `${userId}-${type}-${data.symbol}`;
      if (this.isOnCooldown(cooldownKey)) {
        console.log('[ZoneNotificationService] On cooldown:', cooldownKey);
        return { success: false, reason: 'cooldown' };
      }

      // Build notification
      const notification = {
        title: template.title,
        body: typeof template.body === 'function' ? template.body(data) : template.body,
        data: {
          type: 'zone_alert',
          notificationType: type,
          symbol: data.symbol,
          zoneId: data.zoneId,
          ...data,
        },
      };

      // Send via notification service
      await notificationService.sendLocalNotification(
        notification.title,
        notification.body,
        notification.data
      );

      // Set cooldown
      this.setCooldown(cooldownKey);

      // Log notification in database
      await this.logNotification(userId, type, data);

      console.log('[ZoneNotificationService] Notification sent:', type, data.symbol);
      return { success: true };
    } catch (error) {
      console.error('[ZoneNotificationService] Send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log notification in database for analytics
   */
  async logNotification(userId, type, data) {
    try {
      await supabase.from('zone_notifications_log').insert({
        user_id: userId,
        notification_type: type,
        symbol: data.symbol,
        zone_id: data.zoneId,
        data: data,
        sent_at: new Date().toISOString(),
      });
    } catch (error) {
      // Don't fail on logging error
      console.log('[ZoneNotificationService] Log error:', error.message);
    }
  }

  /**
   * Send zone retest notification
   */
  async notifyZoneRetest(zone, price, userId) {
    return this.sendZoneNotification(
      ZONE_NOTIFICATION_TYPES.ZONE_RETEST,
      {
        symbol: zone.symbol,
        zoneId: zone.id,
        zoneType: zone.type,
        price: price.toFixed(2),
        strength: zone.strength,
      },
      userId
    );
  }

  /**
   * Send zone broken notification
   */
  async notifyZoneBroken(zone, price, userId) {
    return this.sendZoneNotification(
      ZONE_NOTIFICATION_TYPES.ZONE_BROKEN,
      {
        symbol: zone.symbol,
        zoneId: zone.id,
        zoneType: zone.type,
        price: price.toFixed(2),
      },
      userId
    );
  }

  /**
   * Send fresh zone detected notification
   */
  async notifyFreshZone(zone, userId) {
    return this.sendZoneNotification(
      ZONE_NOTIFICATION_TYPES.FRESH_ZONE_DETECTED,
      {
        symbol: zone.symbol,
        zoneId: zone.id,
        zoneType: zone.type,
        timeframe: zone.timeframe,
        grade: zone.grade || 'A',
        strength: zone.strength,
      },
      userId
    );
  }

  /**
   * Send MTF alignment notification
   */
  async notifyMTFAlignment(symbol, alignment, userId) {
    const score = alignment?.alignment?.score || 0;
    const recommendation = alignment?.recommendation || 'NORMAL';

    // Only notify for high probability alignments
    if (score < 70) return { success: false, reason: 'low_score' };

    return this.sendZoneNotification(
      ZONE_NOTIFICATION_TYPES.MTF_ALIGNMENT,
      {
        symbol,
        alignmentScore: score,
        recommendation,
        direction: alignment?.alignment?.direction || 'NEUTRAL',
      },
      userId
    );
  }

  /**
   * Send approaching zone notification
   */
  async notifyApproachingZone(zone, currentPrice, userId) {
    const zonePrice = zone.type === 'HFZ' ? zone.low : zone.high;
    const distance = Math.abs((currentPrice - zonePrice) / zonePrice) * 100;

    // Only notify if within 1% of zone
    if (distance > 1) return { success: false, reason: 'too_far' };

    return this.sendZoneNotification(
      ZONE_NOTIFICATION_TYPES.APPROACHING_ZONE,
      {
        symbol: zone.symbol,
        zoneId: zone.id,
        zoneType: zone.type,
        distance: distance.toFixed(2),
      },
      userId
    );
  }

  /**
   * Clear all cooldowns (for testing)
   */
  clearCooldowns() {
    this.cooldowns = {};
  }
}

export const zoneNotificationService = new ZoneNotificationService();
export default zoneNotificationService;
