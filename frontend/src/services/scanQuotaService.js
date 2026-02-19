/**
 * Scan Quota Enforcement Service
 * Uses existing `scanner_quota` table: { id, user_id, date, scans_used, created_at, updated_at }
 *
 * Rules:
 * - FREE: 5 scans/day
 * - TIER1+: unlimited
 * - ADMIN: unlimited
 * - 3s timeout on quota check (graceful degradation — allow if timeout)
 */

import { supabase } from '../lib/supabaseClient';

const FREE_DAILY_LIMIT = 5;
const QUOTA_TIMEOUT_MS = 3000;

/**
 * Check if user can scan
 * @param {string} userId
 * @param {string} tier - 'free', 'tier1', 'tier2', 'tier3', 'admin'
 * @returns {{ allowed: boolean, used: number, max: number, remaining: number }}
 */
export async function checkQuota(userId, tier) {
  // Unlimited for paid tiers and admin
  if (tier && tier !== 'free') {
    return { allowed: true, used: 0, max: Infinity, remaining: Infinity };
  }

  if (!userId) {
    return { allowed: true, used: 0, max: FREE_DAILY_LIMIT, remaining: FREE_DAILY_LIMIT };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QUOTA_TIMEOUT_MS);
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('scanner_quota')
      .select('scans_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
      .abortSignal(controller.signal);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (normal for new day)
      console.error('[ScanQuota] Error checking quota:', error);
      return { allowed: true, used: 0, max: FREE_DAILY_LIMIT, remaining: FREE_DAILY_LIMIT };
    }

    const used = data?.scans_used || 0;
    const remaining = Math.max(0, FREE_DAILY_LIMIT - used);

    return {
      allowed: used < FREE_DAILY_LIMIT,
      used,
      max: FREE_DAILY_LIMIT,
      remaining,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ScanQuota] Quota check timed out — allowing scan');
    } else {
      console.error('[ScanQuota] checkQuota error:', err);
    }
    // Graceful degradation: allow scan if quota check fails
    return { allowed: true, used: 0, max: FREE_DAILY_LIMIT, remaining: FREE_DAILY_LIMIT };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Increment scan count for user
 * @param {string} userId
 * @param {string} tier
 */
export async function incrementQuota(userId, tier) {
  // Don't track for paid users
  if (!userId || (tier && tier !== 'free')) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), QUOTA_TIMEOUT_MS);
  try {
    const today = new Date().toISOString().split('T')[0];

    // Upsert: insert if not exists, increment if exists
    const { error } = await supabase
      .from('scanner_quota')
      .upsert(
        {
          user_id: userId,
          date: today,
          scans_used: 1,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        }
      )
      .abortSignal(controller.signal);

    if (error) {
      // If upsert failed (maybe no unique constraint), try RPC or manual update
      console.warn('[ScanQuota] Upsert failed, trying manual increment:', error);
      await manualIncrement(userId, today, controller.signal);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[ScanQuota] incrementQuota error:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fallback: manual select + insert/update
 */
async function manualIncrement(userId, today, signal) {
  try {
    const { data } = await supabase
      .from('scanner_quota')
      .select('id, scans_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
      .abortSignal(signal);

    if (data) {
      await supabase
        .from('scanner_quota')
        .update({ scans_used: (data.scans_used || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .abortSignal(signal);
    } else {
      await supabase
        .from('scanner_quota')
        .insert({ user_id: userId, date: today, scans_used: 1 })
        .abortSignal(signal);
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[ScanQuota] manualIncrement error:', err);
    }
  }
}

/**
 * Get quota display info
 */
export async function getQuotaDisplay(userId, tier) {
  const quota = await checkQuota(userId, tier);

  if (quota.max === Infinity) {
    return { text: 'Unlimited scans', isLimited: false };
  }

  return {
    text: `${quota.remaining}/${quota.max} scans remaining today`,
    isLimited: true,
    ...quota,
  };
}

export default {
  checkQuota,
  incrementQuota,
  getQuotaDisplay,
};
