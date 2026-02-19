/**
 * Zone Persistence Service
 * Wraps zoneTracker with Supabase detected_zones table persistence
 *
 * DB table: detected_zones (already exists)
 * In-memory cache: globalZoneTracker
 * Pattern: cache-first, async DB sync
 */

import { supabase } from '../lib/supabaseClient';
import { globalZoneTracker, ZONE_STATUS } from '../utils/zoneTracker';

const ZONE_LIMIT_PER_SYMBOL = 100;

/**
 * Map DB row to ZoneTracker zone format
 */
function dbRowToZone(row) {
  return {
    id: row.id,
    type: row.zone_type,
    high: parseFloat(row.zone_high),
    low: parseFloat(row.zone_low),
    mid: (parseFloat(row.zone_high) + parseFloat(row.zone_low)) / 2,
    status: (row.status || 'FRESH').toLowerCase(),
    retestCount: row.test_count || 0,
    createdAt: row.created_at,
    lastTestedAt: row.last_tested_at,
    trades: [],
    metadata: {
      symbol: row.symbol,
      timeframe: row.timeframe,
      patternType: row.pattern_type,
      confidence: row.pattern_confidence ? parseFloat(row.pattern_confidence) / 100 : 1,
      grade: row.pattern_grade,
      entryPrice: row.entry_price ? parseFloat(row.entry_price) : null,
      stopPrice: row.stop_price ? parseFloat(row.stop_price) : null,
      strength: row.strength,
      hierarchyRank: row.hierarchy_rank,
      targets: row.targets || [],
    },
  };
}

/**
 * Map ZoneTracker zone to DB row format
 */
function zoneToDbRow(zone, userId, symbol, timeframe) {
  const meta = zone.metadata || {};
  return {
    user_id: userId,
    symbol: symbol || meta.symbol || 'UNKNOWN',
    timeframe: timeframe || meta.timeframe || '1h',
    zone_type: zone.type,
    zone_high: zone.high,
    zone_low: zone.low,
    entry_price: meta.entryPrice || meta.entry || zone.mid,
    stop_price: meta.stopPrice || meta.stop || (zone.type === 'HFZ' ? zone.high * 1.005 : zone.low * 0.995),
    start_time: meta.startTime || Math.floor(new Date(zone.createdAt).getTime() / 1000),
    pattern_type: meta.patternType || zone.type,
    pattern_confidence: meta.confidence ? Math.round(meta.confidence * 100) : null,
    pattern_grade: meta.grade || null,
    status: (zone.status || 'fresh').toUpperCase(),
    test_count: zone.retestCount || 0,
    strength: meta.strength || 100,
    hierarchy_rank: meta.hierarchyRank || 0,
    targets: meta.targets || [],
    last_tested_at: zone.lastTestedAt || null,
  };
}

/**
 * Load zones from DB for a user + symbol + timeframe
 * Populates globalZoneTracker cache
 */
export async function loadZones(userId, symbol, timeframe) {
  if (!userId) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    let query = supabase
      .from('detected_zones')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(ZONE_LIMIT_PER_SYMBOL)
      .abortSignal(controller.signal);

    if (symbol) query = query.eq('symbol', symbol);
    if (timeframe) query = query.eq('timeframe', timeframe);

    const { data, error } = await query;

    if (error) {
      console.error('[ZoneService] Error loading zones:', error);
      return globalZoneTracker.getActiveZones(); // fallback to cache
    }

    // Populate tracker cache
    if (data && data.length > 0) {
      for (const row of data) {
        const zone = dbRowToZone(row);
        // Only add if not already in tracker
        if (!globalZoneTracker.zones.has(row.id)) {
          globalZoneTracker.zones.set(row.id, zone);
          if (zone.status !== ZONE_STATUS.BROKEN && zone.status !== 'weak') {
            globalZoneTracker.activeZones.add(row.id);
          }
        }
      }
    }

    return data.map(dbRowToZone);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ZoneService] loadZones timed out');
    } else {
      console.error('[ZoneService] loadZones error:', err);
    }
    return globalZoneTracker.getActiveZones(); // fallback to cache
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Save a new zone to DB and tracker
 */
export async function saveZone(userId, zone, symbol, timeframe) {
  // Add to in-memory tracker immediately
  const zoneId = globalZoneTracker.addZone(zone);

  if (!userId) return zoneId;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const row = zoneToDbRow(zone, userId, symbol, timeframe);
    const { data, error } = await supabase
      .from('detected_zones')
      .insert(row)
      .select('id')
      .single()
      .abortSignal(controller.signal);

    if (error) {
      console.error('[ZoneService] Error saving zone:', error);
      return zoneId; // keep in-memory version
    }

    // Update tracker with DB-assigned ID
    if (data?.id) {
      const trackedZone = globalZoneTracker.zones.get(zoneId);
      if (trackedZone) {
        globalZoneTracker.zones.delete(zoneId);
        globalZoneTracker.activeZones.delete(zoneId);
        trackedZone.id = data.id;
        globalZoneTracker.zones.set(data.id, trackedZone);
        globalZoneTracker.activeZones.add(data.id);
      }
      return data.id;
    }

    return zoneId;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ZoneService] saveZone timed out');
    } else {
      console.error('[ZoneService] saveZone error:', err);
    }
    return zoneId;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Update zone status in DB after retest
 */
export async function updateZoneRetest(zoneId, currentTime) {
  // Update in-memory first
  const zone = globalZoneTracker.recordRetest(zoneId, currentTime);
  if (!zone) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const { error } = await supabase
      .from('detected_zones')
      .update({
        status: zone.status.toUpperCase(),
        test_count: zone.retestCount,
        last_tested_at: new Date(currentTime).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', zoneId)
      .abortSignal(controller.signal);

    if (error) {
      console.error('[ZoneService] Error updating zone retest:', error);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[ZoneService] updateZoneRetest error:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return zone;
}

/**
 * Mark zone as broken in DB
 */
export async function markZoneBroken(zoneId) {
  const zone = globalZoneTracker.zones.get(zoneId);
  if (!zone) return;

  zone.status = ZONE_STATUS.BROKEN;
  globalZoneTracker.activeZones.delete(zoneId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const { error } = await supabase
      .from('detected_zones')
      .update({
        status: 'BROKEN',
        broken_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', zoneId)
      .abortSignal(controller.signal);

    if (error) {
      console.error('[ZoneService] Error marking zone broken:', error);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[ZoneService] markZoneBroken error:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Soft-delete a zone
 */
export async function deleteZone(zoneId) {
  globalZoneTracker.zones.delete(zoneId);
  globalZoneTracker.activeZones.delete(zoneId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const { error } = await supabase
      .from('detected_zones')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', zoneId)
      .abortSignal(controller.signal);

    if (error) {
      console.error('[ZoneService] Error deleting zone:', error);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[ZoneService] deleteZone error:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get all active zones for display (from cache)
 */
export function getActiveZones() {
  return globalZoneTracker.getActiveZones();
}

/**
 * Get zone statistics
 */
export function getZoneStats() {
  return globalZoneTracker.getStatistics();
}

export default {
  loadZones,
  saveZone,
  updateZoneRetest,
  markZoneBroken,
  deleteZone,
  getActiveZones,
  getZoneStats,
};
