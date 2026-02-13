/**
 * Zone Lifecycle Service
 * Manages zone state transitions: FRESH → TESTED_1X → TESTED_2X → TESTED_3X_PLUS → BROKEN
 *
 * Zone Lifecycle Flow:
 * 1. FRESH: Zone just created, never tested (100% strength, 5 stars)
 * 2. TESTED_1X: Zone tested once but held (80% strength, 4 stars)
 * 3. TESTED_2X: Zone tested twice (60% strength, 3 stars)
 * 4. TESTED_3X_PLUS: Zone tested 3+ times (40% strength, 2 stars)
 * 5. BROKEN: Price broke through zone (0% strength, dead)
 */

import { supabase } from './supabase';

// ============================================================
// LIFECYCLE CONFIGURATION
// ============================================================

const LIFECYCLE_CONFIG = {
  FRESH: {
    status: 'FRESH',
    strength: 100,
    opacity: 0.4,
    stars: 5,
    label: 'Fresh - Best',
    color: '#00C853', // Green
  },
  TESTED_1X: {
    status: 'TESTED_1X',
    strength: 80,
    opacity: 0.3,
    stars: 4,
    label: 'Tested 1x',
    color: '#00C853', // Green
  },
  TESTED_2X: {
    status: 'TESTED_2X',
    strength: 60,
    opacity: 0.25,
    stars: 3,
    label: 'Tested 2x',
    color: '#FFB800', // Yellow/Warning
  },
  TESTED_3X_PLUS: {
    status: 'TESTED_3X_PLUS',
    strength: 40,
    opacity: 0.2,
    stars: 2,
    label: 'Weak (3+ tests)',
    color: '#FF6B6B', // Red
  },
  BROKEN: {
    status: 'BROKEN',
    strength: 0,
    opacity: 0.1,
    stars: 0,
    label: 'Broken',
    color: '#6C757D', // Gray
  },
  EXPIRED: {
    status: 'EXPIRED',
    strength: 0,
    opacity: 0.1,
    stars: 0,
    label: 'Expired',
    color: '#6C757D', // Gray
  },
};

// Zone break buffer (0.5% beyond zone = broken)
const ZONE_BREAK_BUFFER = 0.005;

// Zone expiry in days
const ZONE_EXPIRY_DAYS = 30;

// ============================================================
// ZONE LIFECYCLE SERVICE CLASS
// ============================================================

class ZoneLifecycleService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get lifecycle configuration for a status
   * @param {string} status - Zone status
   * @returns {Object} Lifecycle config
   */
  getLifecycleConfig(status) {
    return LIFECYCLE_CONFIG[status] || LIFECYCLE_CONFIG.FRESH;
  }

  /**
   * Get all lifecycle configurations
   * @returns {Object} All lifecycle configs
   */
  getAllConfigs() {
    return LIFECYCLE_CONFIG;
  }

  /**
   * Determine zone status based on test count and broken state
   * @param {number} testCount - Number of times zone was tested
   * @param {boolean} isBroken - Whether zone is broken
   * @returns {string} Status string
   */
  determineStatus(testCount, isBroken) {
    if (isBroken) return 'BROKEN';
    if (testCount === 0) return 'FRESH';
    if (testCount === 1) return 'TESTED_1X';
    if (testCount === 2) return 'TESTED_2X';
    return 'TESTED_3X_PLUS';
  }

  /**
   * Get strength value for a status
   * @param {string} status - Zone status
   * @returns {number} Strength value (0-100)
   */
  getStrength(status) {
    const config = this.getLifecycleConfig(status);
    return config.strength;
  }

  /**
   * Get star count for a status
   * @param {string} status - Zone status
   * @returns {number} Star count (0-5)
   */
  getStars(status) {
    const config = this.getLifecycleConfig(status);
    return config.stars;
  }

  /**
   * Get star display for a zone
   * @param {Object} zone - Zone object with test_count and status
   * @returns {Object} { stars, label, color }
   */
  getStarDisplay(zone) {
    const status = zone?.status || 'FRESH';
    const config = this.getLifecycleConfig(status);
    return {
      stars: config.stars,
      label: config.label,
      color: config.color,
    };
  }

  /**
   * Check if a zone is broken by price
   * @param {Object} zone - Zone object with zone_type, zone_high, zone_low
   * @param {number} closePrice - Candle close price
   * @returns {boolean} True if zone is broken
   */
  isZoneBroken(zone, closePrice) {
    if (!zone || !closePrice) return false;

    const buffer = ZONE_BREAK_BUFFER;

    if (zone.zone_type === 'HFZ') {
      // HFZ (Sell Zone) breaks when price closes above zone + buffer
      const breakLevel = zone.zone_high * (1 + buffer);
      return closePrice > breakLevel;
    } else {
      // LFZ (Buy Zone) breaks when price closes below zone - buffer
      const breakLevel = zone.zone_low * (1 - buffer);
      return closePrice < breakLevel;
    }
  }

  /**
   * Check if price is inside a zone
   * @param {Object} zone - Zone object
   * @param {number} price - Current price
   * @returns {boolean}
   */
  isPriceInZone(zone, price) {
    if (!zone || !price) return false;
    return price >= zone.zone_low && price <= zone.zone_high;
  }

  /**
   * Check if zone is expired
   * @param {Object} zone - Zone object with created_at
   * @returns {boolean}
   */
  isZoneExpired(zone) {
    if (!zone?.created_at) return false;

    const createdAt = new Date(zone.created_at);
    const now = new Date();
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);

    return daysDiff > ZONE_EXPIRY_DAYS;
  }

  /**
   * Record a zone test event
   * @param {string} zoneId - Zone ID
   * @param {number} testPrice - Price that tested zone
   * @param {string} result - Test result: 'BOUNCED', 'PENETRATED', 'BROKEN'
   * @returns {Promise<Object>} Updated zone
   */
  async recordZoneTest(zoneId, testPrice, result) {
    try {
      // Insert test history record
      const { error: historyError } = await supabase
        .from('zone_test_history')
        .insert({
          zone_id: zoneId,
          test_time: new Date().toISOString(),
          test_price: testPrice,
          result: result,
        });

      if (historyError) {
        console.error('[ZoneLifecycle] Error inserting test history:', historyError);
      }

      // Get current zone data
      const { data: zone, error: fetchError } = await supabase
        .from('detected_zones')
        .select('test_count, status')
        .eq('id', zoneId)
        .single();

      if (fetchError || !zone) {
        console.error('[ZoneLifecycle] Zone not found:', zoneId);
        return null;
      }

      // Calculate new status
      const newTestCount = (zone.test_count || 0) + 1;
      const isBroken = result === 'BROKEN';
      const newStatus = this.determineStatus(newTestCount, isBroken);
      const config = this.getLifecycleConfig(newStatus);

      // Update zone
      const updateData = {
        test_count: newTestCount,
        status: newStatus,
        strength: config.strength,
        last_test_time: new Date().toISOString(),
        last_test_price: testPrice,
      };

      if (isBroken) {
        updateData.broken_at = new Date().toISOString();
      }

      const { data: updatedZone, error: updateError } = await supabase
        .from('detected_zones')
        .update(updateData)
        .eq('id', zoneId)
        .select()
        .single();

      if (updateError) {
        console.error('[ZoneLifecycle] Error updating zone:', updateError);
        return null;
      }

      console.log('[ZoneLifecycle] Zone test recorded:', {
        zoneId,
        testPrice,
        result,
        newStatus,
        newTestCount,
      });

      return updatedZone;
    } catch (error) {
      console.error('[ZoneLifecycle] recordZoneTest error:', error);
      return null;
    }
  }

  /**
   * Mark zone as broken
   * @param {string} zoneId - Zone ID
   * @param {number} breakPrice - Price at which zone broke
   * @returns {Promise<Object>} Updated zone
   */
  async markZoneBroken(zoneId, breakPrice = null) {
    try {
      const config = this.getLifecycleConfig('BROKEN');

      const { data, error } = await supabase
        .from('detected_zones')
        .update({
          status: 'BROKEN',
          strength: config.strength,
          broken_at: new Date().toISOString(),
          break_price: breakPrice,
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (error) {
        console.error('[ZoneLifecycle] Error marking zone broken:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ZoneLifecycle] markZoneBroken error:', error);
      return null;
    }
  }

  /**
   * Mark zone as expired
   * @param {string} zoneId - Zone ID
   * @returns {Promise<Object>} Updated zone
   */
  async markZoneExpired(zoneId) {
    try {
      const config = this.getLifecycleConfig('EXPIRED');

      const { data, error } = await supabase
        .from('detected_zones')
        .update({
          status: 'EXPIRED',
          strength: config.strength,
          expired_at: new Date().toISOString(),
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (error) {
        console.error('[ZoneLifecycle] Error marking zone expired:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[ZoneLifecycle] markZoneExpired error:', error);
      return null;
    }
  }

  /**
   * Get zone test history
   * @param {string} zoneId - Zone ID
   * @param {number} limit - Max records to return
   * @returns {Promise<Array>} Test history records
   */
  async getZoneTestHistory(zoneId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('zone_test_history')
        .select('*')
        .eq('zone_id', zoneId)
        .order('test_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[ZoneLifecycle] Error fetching test history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[ZoneLifecycle] getZoneTestHistory error:', error);
      return [];
    }
  }

  /**
   * Clean up expired zones (batch operation)
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of zones marked as expired
   */
  async cleanupExpiredZones(userId) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - ZONE_EXPIRY_DAYS);

      const { data, error } = await supabase
        .from('detected_zones')
        .update({
          status: 'EXPIRED',
          strength: 0,
          expired_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .not('status', 'in', '(BROKEN,EXPIRED)')
        .lt('created_at', expiryDate.toISOString())
        .select('id');

      if (error) {
        console.error('[ZoneLifecycle] Error cleaning up expired zones:', error);
        return 0;
      }

      console.log('[ZoneLifecycle] Cleaned up', data?.length || 0, 'expired zones');
      return data?.length || 0;
    } catch (error) {
      console.error('[ZoneLifecycle] cleanupExpiredZones error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const zoneLifecycleService = new ZoneLifecycleService();
export default zoneLifecycleService;
