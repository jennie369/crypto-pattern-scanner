/**
 * =====================================================
 * File: src/services/scanner/scanAlertService.js
 * Description: Scan alerts management service
 * Database: scan_alerts table
 * Access: TIER 1+
 * =====================================================
 */

import { supabase } from '../supabase';
import { ALERT_CONFIG } from '../../constants/scannerDefaults';

const { TYPES, PRIORITY } = ALERT_CONFIG;

/**
 * Create a new scan alert
 *
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} Created alert
 */
export async function createScanAlert(alertData) {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      console.warn('[scanAlertService] No user logged in');
      return { error: 'User not authenticated' };
    }

    const alert = {
      user_id: user.id,
      scan_result_id: alertData.scanResultId || null,
      alert_type: alertData.type || TYPES.PATTERN_DETECTED,
      symbol: alertData.symbol,
      timeframe: alertData.timeframe,
      pattern_type: alertData.patternType,
      title: alertData.title,
      message: alertData.message,
      price_at_alert: alertData.priceAtAlert,
      entry_price: alertData.entryPrice,
      distance_percent: alertData.distancePercent,
      confidence_score: alertData.confidenceScore,
      confidence_grade: alertData.confidenceGrade,
      priority: alertData.priority || PRIORITY.NORMAL,
      metadata: alertData.metadata || {},
    };

    console.log('[scanAlertService] Creating alert:', alert.alert_type, alert.symbol);

    const { data, error } = await supabase
      .from('scan_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) {
      console.error('[scanAlertService] Error creating alert:', error);
      return { error: error.message };
    }

    console.log('[scanAlertService] Alert created:', data.id);
    return { data };
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return { error: error.message };
  }
}

/**
 * Get alerts for current user
 *
 * @param {Object} options - Query options
 * @param {number} options.limit - Max alerts to return
 * @param {boolean} options.unreadOnly - Only return unread alerts
 * @param {string} options.alertType - Filter by alert type
 * @param {string} options.symbol - Filter by symbol
 * @returns {Promise<Object>} Alerts list
 */
export async function getAlerts(options = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return { data: [], error: 'User not authenticated' };
    }

    const {
      limit = 50,
      unreadOnly = false,
      alertType = null,
      symbol = null,
    } = options;

    let query = supabase
      .from('scan_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (alertType) {
      query = query.eq('alert_type', alertType);
    }

    if (symbol) {
      query = query.eq('symbol', symbol);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[scanAlertService] Error fetching alerts:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return { data: [], error: error.message };
  }
}

/**
 * Get unread alert count
 *
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .rpc('get_unread_scan_alert_count', { p_user_id: user.id });

    if (error) {
      console.error('[scanAlertService] Error getting unread count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return 0;
  }
}

/**
 * Mark alerts as read
 *
 * @param {string[]} alertIds - Array of alert IDs
 * @returns {Promise<number>} Count of marked alerts
 */
export async function markAsRead(alertIds) {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return 0;
    }

    if (!alertIds?.length) {
      return 0;
    }

    const { data, error } = await supabase
      .rpc('mark_scan_alerts_read', {
        p_user_id: user.id,
        p_alert_ids: alertIds,
      });

    if (error) {
      console.error('[scanAlertService] Error marking alerts read:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return 0;
  }
}

/**
 * Mark all alerts as read
 *
 * @returns {Promise<number>} Count of marked alerts
 */
export async function markAllAsRead() {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('scan_alerts')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('[scanAlertService] Error marking all read:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return 0;
  }
}

/**
 * Delete an alert
 *
 * @param {string} alertId - Alert ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAlert(alertId) {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('scan_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[scanAlertService] Error deleting alert:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return false;
  }
}

/**
 * Delete all alerts for a symbol
 *
 * @param {string} symbol - Symbol to clear alerts for
 * @returns {Promise<number>} Count of deleted alerts
 */
export async function deleteAlertsForSymbol(symbol) {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('scan_alerts')
      .delete()
      .eq('symbol', symbol)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('[scanAlertService] Error deleting alerts:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('[scanAlertService] Error:', error);
    return 0;
  }
}

// === ALERT GENERATORS ===

/**
 * Generate pattern detected alert
 */
export function createPatternDetectedAlert(pattern, scanResult) {
  return {
    type: TYPES.PATTERN_DETECTED,
    symbol: pattern.symbol,
    timeframe: pattern.timeframe,
    patternType: pattern.type,
    title: `Pattern ${pattern.type} detected`,
    message: `${pattern.type} ${pattern.direction} on ${pattern.symbol} ${pattern.timeframe}. Confidence: ${scanResult?.confidence_grade || 'N/A'}`,
    entryPrice: pattern.entry,
    confidenceScore: scanResult?.confidence_total,
    confidenceGrade: scanResult?.confidence_grade,
    priority: getPriorityFromGrade(scanResult?.confidence_grade),
    scanResultId: scanResult?.id,
    metadata: {
      direction: pattern.direction,
      stopLoss: pattern.stopLoss,
      takeProfit: pattern.takeProfit,
    },
  };
}

/**
 * Generate zone approach alert
 */
export function createZoneApproachAlert(symbol, timeframe, zone, currentPrice, distance) {
  return {
    type: TYPES.ZONE_APPROACH,
    symbol,
    timeframe,
    title: `Approaching ${zone.type} zone`,
    message: `${symbol} is ${distance.toFixed(2)}% away from ${zone.type} zone at ${zone.high} - ${zone.low}`,
    priceAtAlert: currentPrice,
    distancePercent: distance,
    priority: distance < 0.5 ? PRIORITY.HIGH : PRIORITY.NORMAL,
    metadata: {
      zoneType: zone.type,
      zoneHigh: zone.high,
      zoneLow: zone.low,
    },
  };
}

/**
 * Generate zone retest alert
 */
export function createZoneRetestAlert(symbol, timeframe, zone, retestStrength) {
  return {
    type: TYPES.ZONE_RETEST,
    symbol,
    timeframe,
    title: `Zone retest confirmed (${retestStrength})`,
    message: `${symbol} has retested ${zone.type} zone with ${retestStrength} confirmation`,
    priority: retestStrength === 'STRONG' ? PRIORITY.HIGH : PRIORITY.NORMAL,
    metadata: {
      zoneType: zone.type,
      retestStrength,
    },
  };
}

/**
 * Generate entry triggered alert
 */
export function createEntryTriggeredAlert(scanResult, currentPrice) {
  return {
    type: TYPES.ENTRY_TRIGGERED,
    symbol: scanResult.symbol,
    timeframe: scanResult.timeframe,
    patternType: scanResult.pattern_type,
    title: 'Entry price reached!',
    message: `${scanResult.symbol} reached entry at ${currentPrice}. ${scanResult.direction} signal.`,
    priceAtAlert: currentPrice,
    entryPrice: scanResult.entry_price,
    priority: PRIORITY.URGENT,
    scanResultId: scanResult.id,
    confidenceScore: scanResult.confidence_total,
    confidenceGrade: scanResult.confidence_grade,
    metadata: {
      direction: scanResult.direction,
      stopLoss: scanResult.stop_loss,
      takeProfit: scanResult.take_profit,
    },
  };
}

/**
 * Generate TP/SL approaching alert
 */
export function createTPSLApproachingAlert(scanResult, type, distance) {
  const isTP = type === 'TP';
  return {
    type: isTP ? TYPES.TP_APPROACHING : TYPES.SL_APPROACHING,
    symbol: scanResult.symbol,
    timeframe: scanResult.timeframe,
    patternType: scanResult.pattern_type,
    title: `${isTP ? 'Take Profit' : 'Stop Loss'} approaching`,
    message: `${scanResult.symbol} is ${distance.toFixed(2)}% from ${isTP ? 'TP' : 'SL'}`,
    distancePercent: distance,
    priority: PRIORITY.HIGH,
    scanResultId: scanResult.id,
    metadata: {
      direction: scanResult.direction,
      target: isTP ? scanResult.take_profit : scanResult.stop_loss,
    },
  };
}

/**
 * Generate TP/SL hit alert
 */
export function createTPSLHitAlert(scanResult, type, exitPrice) {
  const isTP = type === 'TP';
  return {
    type: isTP ? TYPES.TP_HIT : TYPES.SL_HIT,
    symbol: scanResult.symbol,
    timeframe: scanResult.timeframe,
    patternType: scanResult.pattern_type,
    title: isTP ? 'Take Profit hit!' : 'Stop Loss hit',
    message: `${scanResult.symbol} ${isTP ? 'hit TP' : 'stopped out'} at ${exitPrice}`,
    priceAtAlert: exitPrice,
    priority: isTP ? PRIORITY.NORMAL : PRIORITY.HIGH,
    scanResultId: scanResult.id,
    metadata: {
      direction: scanResult.direction,
      entryPrice: scanResult.entry_price,
      exitPrice,
      result: isTP ? 'WIN' : 'LOSS',
    },
  };
}

/**
 * Generate breakout alert
 */
export function createBreakoutAlert(symbol, timeframe, direction, breakoutLevel, volume) {
  return {
    type: TYPES.BREAKOUT,
    symbol,
    timeframe,
    title: `Breakout ${direction}!`,
    message: `${symbol} broke ${direction === 'LONG' ? 'above' : 'below'} ${breakoutLevel} with ${volume.toFixed(0)}% volume`,
    priceAtAlert: breakoutLevel,
    priority: volume > 200 ? PRIORITY.HIGH : PRIORITY.NORMAL,
    metadata: {
      direction,
      breakoutLevel,
      volumeRatio: volume,
    },
  };
}

// === HELPERS ===

function getPriorityFromGrade(grade) {
  switch (grade) {
    case 'A+':
    case 'A':
      return PRIORITY.HIGH;
    case 'B+':
    case 'B':
      return PRIORITY.NORMAL;
    default:
      return PRIORITY.LOW;
  }
}

/**
 * Format alert for display
 */
export function formatAlertForDisplay(alert) {
  const timeAgo = getTimeAgo(new Date(alert.created_at));
  const icon = getAlertIcon(alert.alert_type);
  const color = getAlertColor(alert.priority);

  return {
    ...alert,
    timeAgo,
    icon,
    color,
    isUrgent: alert.priority === PRIORITY.URGENT,
    isHigh: alert.priority === PRIORITY.HIGH,
  };
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getAlertIcon(type) {
  const icons = {
    [TYPES.PATTERN_DETECTED]: 'chart-line',
    [TYPES.ZONE_APPROACH]: 'target',
    [TYPES.ZONE_RETEST]: 'check-circle',
    [TYPES.ENTRY_TRIGGERED]: 'play-circle',
    [TYPES.TP_APPROACHING]: 'arrow-up',
    [TYPES.SL_APPROACHING]: 'arrow-down',
    [TYPES.TP_HIT]: 'check',
    [TYPES.SL_HIT]: 'x-circle',
    [TYPES.BREAKOUT]: 'trending-up',
    [TYPES.HTF_ALIGNMENT_CHANGE]: 'refresh-cw',
    [TYPES.PATTERN_EXPIRED]: 'clock',
    [TYPES.PATTERN_INVALIDATED]: 'x',
  };
  return icons[type] || 'bell';
}

function getAlertColor(priority) {
  const colors = {
    [PRIORITY.URGENT]: '#F6465D',
    [PRIORITY.HIGH]: '#FFBD59',
    [PRIORITY.NORMAL]: '#0ECB81',
    [PRIORITY.LOW]: '#888888',
  };
  return colors[priority] || colors[PRIORITY.NORMAL];
}

export default {
  // CRUD
  createScanAlert,
  getAlerts,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteAlert,
  deleteAlertsForSymbol,
  // Generators
  createPatternDetectedAlert,
  createZoneApproachAlert,
  createZoneRetestAlert,
  createEntryTriggeredAlert,
  createTPSLApproachingAlert,
  createTPSLHitAlert,
  createBreakoutAlert,
  // Helpers
  formatAlertForDisplay,
  ALERT_TYPES: TYPES,
  ALERT_PRIORITY: PRIORITY,
};
