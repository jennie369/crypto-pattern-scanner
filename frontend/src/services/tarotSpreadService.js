/**
 * Tarot Spread Service (Web)
 * Ported from gem-mobile/src/services/tarotSpreadService.js
 *
 * Handles spread data, selection, tier gating, layout positions,
 * and localStorage persistence for last-used spread.
 *
 * @fileoverview Tarot spread management service for the web frontend.
 * Fetches spreads from Supabase with in-memory caching, falls back to
 * DEFAULT_SPREADS when the API is unreachable. Persists the user's
 * last-used spread ID in localStorage so it can be pre-selected on
 * subsequent visits.
 */

import { supabase } from '../lib/supabaseClient';
import {
  DEFAULT_SPREADS,
  getTierLevel,
  canAccessSpread,
  CELTIC_CROSS_LAYOUT,
  HORIZONTAL_LAYOUT,
  SPREAD_CATEGORIES,
  LIFE_AREAS,
  QUESTION_PROMPTS,
  getPromptsForArea,
} from '../data/tarotSpreads';

// ============================================================
// CONSTANTS
// ============================================================

/** @type {string} localStorage key for the last-used spread ID */
const LAST_USED_SPREAD_KEY = 'gem_last_used_spread';

/** @type {string} localStorage key for the last-used life area */
const LAST_USED_AREA_KEY = 'gem_last_used_life_area';

/** @type {number} In-memory cache duration in milliseconds (5 minutes) */
const CACHE_DURATION = 5 * 60 * 1000;

// ============================================================
// TAROT SPREAD SERVICE CLASS
// ============================================================

class TarotSpreadService {
  constructor() {
    /** @type {Array|null} Cached spread objects from Supabase */
    this.spreadsCache = null;
    /** @type {number|null} Timestamp when the cache expires */
    this.cacheExpiry = null;
    /** @type {number} Cache TTL in ms */
    this.CACHE_DURATION = CACHE_DURATION;
  }

  // ============================================================
  // SPREAD FETCHING
  // ============================================================

  /**
   * Fetch all active spreads from the database with in-memory caching.
   * Falls back to DEFAULT_SPREADS if the Supabase query fails.
   *
   * @param {boolean} [forceRefresh=false] - If true, bypass the in-memory cache
   * @returns {Promise<{data: Array<Object>, error: string|null}>} Spread list and optional error message
   */
  async getAllSpreads(forceRefresh = false) {
    try {
      // Return cached data if still valid
      if (!forceRefresh && this.spreadsCache && this.cacheExpiry > Date.now()) {
        console.log('[TarotSpreadService] Returning cached spreads');
        return { data: this.spreadsCache, error: null };
      }

      const { data, error } = await supabase
        .from('tarot_spreads')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[TarotSpreadService] Error fetching spreads:', error);
        return { data: DEFAULT_SPREADS, error: null };
      }

      // Update in-memory cache
      this.spreadsCache = data?.length > 0 ? data : DEFAULT_SPREADS;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return { data: this.spreadsCache, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] Exception:', err);
      return { data: DEFAULT_SPREADS, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Fetch spreads filtered by category with tier-gating information attached.
   * Each returned spread includes `isLocked` and `userCanAccess` booleans.
   *
   * @param {string} category - Category filter ('all', 'general', 'love', 'career', 'trading', 'advanced')
   * @param {string} [userTier='FREE'] - The current user's tier (FREE/TIER1/TIER2/TIER3/ADMIN)
   * @returns {Promise<{data: Array<Object>, error: string|null}>} Filtered spreads with lock status
   */
  async getSpreadsByCategory(category, userTier = 'FREE') {
    try {
      const { data: allSpreads } = await this.getAllSpreads();
      let filtered = allSpreads || [];

      // Apply category filter (skip for 'all')
      if (category && category !== 'all') {
        filtered = filtered.filter((s) => s.category === category);
      }

      // Annotate each spread with lock/access info
      filtered = filtered.map((spread) => ({
        ...spread,
        isLocked: !canAccessSpread(userTier, spread.tier_required),
        userCanAccess: canAccessSpread(userTier, spread.tier_required),
      }));

      return { data: filtered, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getSpreadsByCategory error:', err);
      return { data: [], error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Fetch a single spread by its unique spread_id.
   *
   * @param {string} spreadId - The spread identifier (e.g. 'celtic-cross', 'past-present-future')
   * @returns {Promise<{data: Object|null, error: string|null}>} The matched spread or null
   */
  async getSpreadById(spreadId) {
    try {
      const { data: allSpreads } = await this.getAllSpreads();
      const spread = allSpreads?.find((s) => s.spread_id === spreadId);

      if (!spread) {
        return { data: null, error: 'Spread not found' };
      }

      return { data: spread, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getSpreadById error:', err);
      return { data: null, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get featured/popular spreads (FREE tier first, limited count).
   * Useful for homepage widgets or recommendation carousels.
   *
   * @param {number} [limit=4] - Maximum number of spreads to return
   * @returns {Promise<{data: Array<Object>, error: string|null}>} Featured spreads
   */
  async getFeaturedSpreads(limit = 4) {
    try {
      const { data: allSpreads } = await this.getAllSpreads();

      const featured = allSpreads
        ?.filter((s) => s.tier_required === 'FREE')
        ?.slice(0, limit) || [];

      return { data: featured, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getFeaturedSpreads error:', err);
      return { data: [], error: err?.message || 'Unknown error' };
    }
  }

  // ============================================================
  // TIER GATING
  // ============================================================

  /**
   * Check whether a user's tier grants access to a spread's required tier.
   *
   * @param {string} userTier - The user's current tier
   * @param {string} spreadTierRequired - The tier required by the spread
   * @returns {boolean} True if the user can access the spread
   */
  canUserAccessSpread(userTier, spreadTierRequired) {
    return canAccessSpread(userTier, spreadTierRequired);
  }

  // ============================================================
  // LAYOUT & POSITIONS
  // ============================================================

  /**
   * Get the layout coordinates for rendering a spread's cards on screen.
   * Returns predefined layouts for Celtic Cross and standard horizontal
   * arrangements, or generates a dynamic horizontal layout for other counts.
   *
   * @param {Object} spread - The spread object (must have layout_type and cards fields)
   * @returns {Array<{index: number, x: number, y: number, rotation: number}>} Position array
   */
  getSpreadLayout(spread) {
    if (!spread) return [];

    const { layout_type, cards } = spread;

    // Celtic Cross has a unique cross+staff layout
    if (layout_type === 'cross' && cards === 10) {
      return CELTIC_CROSS_LAYOUT;
    }

    // Use predefined horizontal layout if available
    if (HORIZONTAL_LAYOUT[cards]) {
      return HORIZONTAL_LAYOUT[cards];
    }

    // Generate evenly-spaced horizontal layout for any card count
    return Array.from({ length: cards }, (_, i) => ({
      index: i,
      x: (i + 1) / (cards + 1),
      y: 0.5,
      rotation: 0,
    }));
  }

  /**
   * Get the position metadata for a specific card index within a spread.
   * Position metadata includes the name and description of each card slot.
   *
   * @param {Object} spread - The spread object (must have positions field)
   * @param {number} index - The zero-based card index
   * @returns {Object|null} Position info object or null if not found
   */
  getPositionInfo(spread, index) {
    if (!spread?.positions) return null;

    const positions = typeof spread.positions === 'string'
      ? JSON.parse(spread.positions)
      : spread.positions;

    return positions?.find((p) => p.index === index) || null;
  }

  /**
   * Get all position metadata for a spread.
   *
   * @param {Object} spread - The spread object
   * @returns {Array<Object>} Array of position objects (may be empty)
   */
  getPositions(spread) {
    if (!spread?.positions) return [];

    return typeof spread.positions === 'string'
      ? JSON.parse(spread.positions)
      : spread.positions;
  }

  // ============================================================
  // CATEGORIES
  // ============================================================

  /**
   * Get spread categories with the count of spreads in each.
   *
   * @param {string} [userTier='FREE'] - User tier (unused currently but reserved for future filtering)
   * @returns {Promise<{data: Array<{id: string, label: string, count: number}>, error: string|null}>}
   */
  async getCategoriesWithCounts(userTier = 'FREE') {
    try {
      const { data: allSpreads } = await this.getAllSpreads();

      const categories = [
        { id: 'all', label: 'All', count: allSpreads?.length || 0 },
        { id: 'general', label: 'General', count: 0 },
        { id: 'love', label: 'Love', count: 0 },
        { id: 'career', label: 'Career', count: 0 },
        { id: 'trading', label: 'Trading', count: 0 },
        { id: 'advanced', label: 'Advanced', count: 0 },
      ];

      allSpreads?.forEach((spread) => {
        const cat = categories.find((c) => c.id === spread.category);
        if (cat) cat.count++;
      });

      return { data: categories, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getCategoriesWithCounts error:', err);
      return { data: [], error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get the static spread categories list with their icons.
   *
   * @returns {Array<{id: string, label: string, icon: string}>}
   */
  getSpreadCategories() {
    return SPREAD_CATEGORIES;
  }

  /**
   * Get all life areas (used for question prompt selection).
   *
   * @returns {Array<{id: string, label: string, icon: string, color: string}>}
   */
  getLifeAreas() {
    return LIFE_AREAS;
  }

  /**
   * Get question prompts for a specific life area.
   *
   * @param {string} areaId - Life area ID ('general', 'love', 'career', etc.)
   * @returns {Array<string>} Array of question prompt strings
   */
  getQuestionPrompts(areaId) {
    return getPromptsForArea(areaId);
  }

  // ============================================================
  // LOCAL STORAGE PERSISTENCE
  // ============================================================

  /**
   * Save the user's last-used spread ID to localStorage.
   * This allows the UI to pre-select the spread on next visit.
   *
   * @param {string} spreadId - The spread_id to remember
   */
  saveLastUsedSpread(spreadId) {
    try {
      if (spreadId) {
        localStorage.setItem(LAST_USED_SPREAD_KEY, spreadId);
      }
    } catch (err) {
      console.warn('[TarotSpreadService] Could not save last-used spread:', err);
    }
  }

  /**
   * Retrieve the last-used spread ID from localStorage.
   *
   * @returns {string|null} The last-used spread_id, or null if none saved
   */
  getLastUsedSpread() {
    try {
      return localStorage.getItem(LAST_USED_SPREAD_KEY) || null;
    } catch {
      return null;
    }
  }

  /**
   * Save the user's last-used life area to localStorage.
   *
   * @param {string} areaId - The life area ID to remember
   */
  saveLastUsedLifeArea(areaId) {
    try {
      if (areaId) {
        localStorage.setItem(LAST_USED_AREA_KEY, areaId);
      }
    } catch (err) {
      console.warn('[TarotSpreadService] Could not save last-used life area:', err);
    }
  }

  /**
   * Retrieve the last-used life area from localStorage.
   *
   * @returns {string|null} The last-used life area ID, or null if none saved
   */
  getLastUsedLifeArea() {
    try {
      return localStorage.getItem(LAST_USED_AREA_KEY) || null;
    } catch {
      return null;
    }
  }

  // ============================================================
  // CACHE MANAGEMENT
  // ============================================================

  /**
   * Clear the in-memory spreads cache and localStorage persistence.
   * Call this on logout to prevent stale data across accounts.
   */
  clearCache() {
    this.spreadsCache = null;
    this.cacheExpiry = null;
    console.log('[TarotSpreadService] Cache cleared');
  }

  /**
   * Clear all localStorage keys owned by this service.
   * Call this on logout.
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem(LAST_USED_SPREAD_KEY);
      localStorage.removeItem(LAST_USED_AREA_KEY);
    } catch {
      // Silently ignore localStorage errors
    }
  }
}

// ============================================================
// SINGLETON & EXPORTS
// ============================================================

export const tarotSpreadService = new TarotSpreadService();

// Named exports for tree-shaking
export const getAllSpreads = (...args) => tarotSpreadService.getAllSpreads(...args);
export const getSpreadsByCategory = (...args) => tarotSpreadService.getSpreadsByCategory(...args);
export const getSpreadById = (...args) => tarotSpreadService.getSpreadById(...args);
export const getFeaturedSpreads = (...args) => tarotSpreadService.getFeaturedSpreads(...args);
export const canUserAccessSpread = (...args) => tarotSpreadService.canUserAccessSpread(...args);
export const getSpreadLayout = (...args) => tarotSpreadService.getSpreadLayout(...args);
export const getPositionInfo = (...args) => tarotSpreadService.getPositionInfo(...args);
export const getPositions = (...args) => tarotSpreadService.getPositions(...args);
export const getCategoriesWithCounts = (...args) => tarotSpreadService.getCategoriesWithCounts(...args);
export const saveLastUsedSpread = (...args) => tarotSpreadService.saveLastUsedSpread(...args);
export const getLastUsedSpread = () => tarotSpreadService.getLastUsedSpread();
export const saveLastUsedLifeArea = (...args) => tarotSpreadService.saveLastUsedLifeArea(...args);
export const getLastUsedLifeArea = () => tarotSpreadService.getLastUsedLifeArea();
export const clearCache = () => tarotSpreadService.clearCache();
export const clearLocalStorage = () => tarotSpreadService.clearLocalStorage();

export default tarotSpreadService;
