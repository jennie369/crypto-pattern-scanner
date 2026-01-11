/**
 * GEM Mobile - Zone Price Monitor Service
 * Real-time price monitoring to trigger zone notifications
 *
 * Features:
 * - WebSocket connection to Binance for live price updates
 * - Check if price is testing/breaking zones
 * - Trigger notifications via zoneNotificationService
 * - Subscribe/unsubscribe to zone alerts
 */

import { supabase } from './supabase';
import { zoneNotificationService, ZONE_NOTIFICATION_TYPES } from './zoneNotificationService';
import zoneManager from './zoneManager';
import { tierAccessService } from './tierAccessService';

class ZonePriceMonitor {
  constructor() {
    this.websockets = {}; // symbol -> WebSocket
    this.activeZones = {}; // symbol -> zones[]
    this.subscribedAlerts = []; // User's alert subscriptions
    this.userId = null;
    this.isRunning = false;
    this.lastPrices = {}; // Track last prices for each symbol
    this.checkInterval = null;
  }

  /**
   * Initialize monitor with user ID
   */
  async init(userId) {
    if (!userId) {
      console.log('[ZonePriceMonitor] No userId provided');
      return;
    }

    this.userId = userId;

    // Check if user has zone alert access
    if (!tierAccessService.canUseZoneAlerts()) {
      console.log('[ZonePriceMonitor] User tier does not support zone alerts');
      return;
    }

    // Load user's alert subscriptions
    await this.loadAlertSubscriptions();

    console.log('[ZonePriceMonitor] Initialized for user:', userId);
  }

  /**
   * Load user's zone alert subscriptions from database
   */
  async loadAlertSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('zone_alert_subscriptions')
        .select('*')
        .eq('user_id', this.userId)
        .eq('active', true);

      if (error) throw error;

      this.subscribedAlerts = data || [];
      console.log('[ZonePriceMonitor] Loaded subscriptions:', this.subscribedAlerts.length);

      // Start monitoring for subscribed symbols
      const symbols = [...new Set(this.subscribedAlerts.map(a => a.symbol))];
      for (const symbol of symbols) {
        await this.startMonitoringSymbol(symbol);
      }
    } catch (error) {
      console.error('[ZonePriceMonitor] Load subscriptions error:', error);
    }
  }

  /**
   * Subscribe to zone alert for a specific zone
   */
  async subscribeToZone(zone, alertTypes = ['retest', 'broken']) {
    if (!this.userId || !zone) return { success: false, error: 'Invalid params' };

    try {
      // Check tier limit
      const maxAlerts = tierAccessService.getMaxZoneAlerts();
      if (maxAlerts !== -1 && this.subscribedAlerts.length >= maxAlerts) {
        return { success: false, error: 'Alert limit reached', limit: maxAlerts };
      }

      // Save to database
      const { data, error } = await supabase
        .from('zone_alert_subscriptions')
        .upsert({
          user_id: this.userId,
          zone_id: zone.id,
          symbol: zone.symbol,
          zone_type: zone.type,
          zone_high: zone.high,
          zone_low: zone.low,
          alert_types: alertTypes,
          active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local subscriptions
      this.subscribedAlerts.push(data);

      // Start monitoring this symbol
      await this.startMonitoringSymbol(zone.symbol);

      console.log('[ZonePriceMonitor] Subscribed to zone:', zone.id);
      return { success: true, subscription: data };
    } catch (error) {
      console.error('[ZonePriceMonitor] Subscribe error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe from zone alert
   */
  async unsubscribeFromZone(zoneId) {
    if (!this.userId || !zoneId) return { success: false };

    try {
      const { error } = await supabase
        .from('zone_alert_subscriptions')
        .update({ active: false })
        .eq('user_id', this.userId)
        .eq('zone_id', zoneId);

      if (error) throw error;

      // Remove from local subscriptions
      this.subscribedAlerts = this.subscribedAlerts.filter(a => a.zone_id !== zoneId);

      console.log('[ZonePriceMonitor] Unsubscribed from zone:', zoneId);
      return { success: true };
    } catch (error) {
      console.error('[ZonePriceMonitor] Unsubscribe error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start monitoring a symbol via WebSocket
   */
  async startMonitoringSymbol(symbol) {
    if (this.websockets[symbol]) {
      console.log('[ZonePriceMonitor] Already monitoring:', symbol);
      return;
    }

    // Load active zones for this symbol
    await this.loadZonesForSymbol(symbol);

    // Connect WebSocket
    const ws = new WebSocket(
      `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@ticker`
    );

    ws.onopen = () => {
      console.log('[ZonePriceMonitor] WebSocket connected:', symbol);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.c) {
          const currentPrice = parseFloat(data.c);
          this.handlePriceUpdate(symbol, currentPrice);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = (error) => {
      console.error('[ZonePriceMonitor] WebSocket error:', symbol, error);
    };

    ws.onclose = () => {
      console.log('[ZonePriceMonitor] WebSocket closed:', symbol);
      delete this.websockets[symbol];

      // Reconnect if still monitoring
      if (this.subscribedAlerts.some(a => a.symbol === symbol)) {
        setTimeout(() => this.startMonitoringSymbol(symbol), 5000);
      }
    };

    this.websockets[symbol] = ws;
  }

  /**
   * Stop monitoring a symbol
   */
  stopMonitoringSymbol(symbol) {
    const ws = this.websockets[symbol];
    if (ws) {
      ws.close();
      delete this.websockets[symbol];
      delete this.activeZones[symbol];
      console.log('[ZonePriceMonitor] Stopped monitoring:', symbol);
    }
  }

  /**
   * Load active zones for a symbol
   */
  async loadZonesForSymbol(symbol) {
    try {
      const zones = await zoneManager.getActiveZones(symbol, null, this.userId);
      this.activeZones[symbol] = zones;
      console.log('[ZonePriceMonitor] Loaded zones for', symbol, ':', zones.length);
    } catch (error) {
      console.log('[ZonePriceMonitor] Load zones error:', error.message);
      this.activeZones[symbol] = [];
    }
  }

  /**
   * Handle price update - check zones and trigger notifications
   */
  handlePriceUpdate(symbol, currentPrice) {
    const previousPrice = this.lastPrices[symbol] || currentPrice;
    this.lastPrices[symbol] = currentPrice;

    const zones = this.activeZones[symbol] || [];
    const subscriptions = this.subscribedAlerts.filter(a => a.symbol === symbol);

    for (const subscription of subscriptions) {
      const zone = zones.find(z => z.id === subscription.zone_id) || {
        id: subscription.zone_id,
        type: subscription.zone_type,
        high: subscription.zone_high,
        low: subscription.zone_low,
        symbol: subscription.symbol,
      };

      const alertTypes = subscription.alert_types || ['retest', 'broken'];

      // Check if price is testing zone
      if (alertTypes.includes('retest')) {
        this.checkZoneRetest(zone, currentPrice, previousPrice);
      }

      // Check if zone is broken
      if (alertTypes.includes('broken')) {
        this.checkZoneBroken(zone, currentPrice, previousPrice);
      }

      // Check if approaching zone
      if (alertTypes.includes('approaching')) {
        this.checkApproachingZone(zone, currentPrice);
      }
    }
  }

  /**
   * Check if price is testing a zone (price enters zone)
   */
  checkZoneRetest(zone, currentPrice, previousPrice) {
    const zoneHigh = zone.high || zone.zoneHigh;
    const zoneLow = zone.low || zone.zoneLow;

    if (!zoneHigh || !zoneLow) return;

    // Check if price just entered the zone
    const wasOutside = previousPrice < zoneLow || previousPrice > zoneHigh;
    const isInside = currentPrice >= zoneLow && currentPrice <= zoneHigh;

    if (wasOutside && isInside) {
      console.log('[ZonePriceMonitor] Zone retest detected:', zone.symbol, zone.type);
      zoneNotificationService.notifyZoneRetest(zone, currentPrice, this.userId);

      // Record zone test
      zoneManager.recordZoneTest(zone.id, currentPrice, 'pending', null);
    }
  }

  /**
   * Check if zone is broken (price closes beyond zone boundary)
   */
  checkZoneBroken(zone, currentPrice, previousPrice) {
    const zoneHigh = zone.high || zone.zoneHigh;
    const zoneLow = zone.low || zone.zoneLow;

    if (!zoneHigh || !zoneLow) return;

    // Buffer for confirmation (0.5% beyond zone)
    const buffer = 0.005;
    const breakHighLevel = zoneHigh * (1 + buffer);
    const breakLowLevel = zoneLow * (1 - buffer);

    // Check if HFZ (supply) is broken - price closes above
    if (zone.type === 'HFZ' && previousPrice <= breakHighLevel && currentPrice > breakHighLevel) {
      console.log('[ZonePriceMonitor] HFZ broken:', zone.symbol);
      zoneNotificationService.notifyZoneBroken(zone, currentPrice, this.userId);
      zoneManager.markZoneBroken(zone.id);
    }

    // Check if LFZ (demand) is broken - price closes below
    if (zone.type === 'LFZ' && previousPrice >= breakLowLevel && currentPrice < breakLowLevel) {
      console.log('[ZonePriceMonitor] LFZ broken:', zone.symbol);
      zoneNotificationService.notifyZoneBroken(zone, currentPrice, this.userId);
      zoneManager.markZoneBroken(zone.id);
    }
  }

  /**
   * Check if price is approaching zone (within 1%)
   */
  checkApproachingZone(zone, currentPrice) {
    const zoneHigh = zone.high || zone.zoneHigh;
    const zoneLow = zone.low || zone.zoneLow;

    if (!zoneHigh || !zoneLow) return;

    // For HFZ, check if approaching from below
    if (zone.type === 'HFZ') {
      const distancePercent = ((zoneLow - currentPrice) / currentPrice) * 100;
      if (distancePercent > 0 && distancePercent <= 1) {
        zoneNotificationService.notifyApproachingZone(zone, currentPrice, this.userId);
      }
    }

    // For LFZ, check if approaching from above
    if (zone.type === 'LFZ') {
      const distancePercent = ((currentPrice - zoneHigh) / currentPrice) * 100;
      if (distancePercent > 0 && distancePercent <= 1) {
        zoneNotificationService.notifyApproachingZone(zone, currentPrice, this.userId);
      }
    }
  }

  /**
   * Start monitoring all subscribed zones
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[ZonePriceMonitor] Starting...');

    // Refresh zones periodically (every 5 minutes)
    this.checkInterval = setInterval(() => {
      const symbols = Object.keys(this.websockets);
      symbols.forEach(symbol => this.loadZonesForSymbol(symbol));
    }, 5 * 60 * 1000);
  }

  /**
   * Stop all monitoring
   */
  stop() {
    this.isRunning = false;

    // Close all WebSockets
    Object.keys(this.websockets).forEach(symbol => {
      this.stopMonitoringSymbol(symbol);
    });

    // Clear interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('[ZonePriceMonitor] Stopped');
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions() {
    return this.subscribedAlerts;
  }

  /**
   * Check if zone is subscribed
   */
  isZoneSubscribed(zoneId) {
    return this.subscribedAlerts.some(a => a.zone_id === zoneId);
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount() {
    return this.subscribedAlerts.length;
  }

  /**
   * Get remaining alert slots based on tier
   */
  getRemainingAlertSlots() {
    const maxAlerts = tierAccessService.getMaxZoneAlerts();
    if (maxAlerts === -1) return Infinity;
    return Math.max(0, maxAlerts - this.subscribedAlerts.length);
  }
}

export const zonePriceMonitor = new ZonePriceMonitor();
export default zonePriceMonitor;
