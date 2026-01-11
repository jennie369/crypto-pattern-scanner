/**
 * Tarot Spread Service
 * Handles spread data, selection, and tier gating
 */

import { supabase } from './supabase';
import {
  DEFAULT_SPREADS,
  getTierLevel,
  canAccessSpread,
  CELTIC_CROSS_LAYOUT,
  HORIZONTAL_LAYOUT,
} from '../data/tarotSpreads';

class TarotSpreadService {
  constructor() {
    this.spreadsCache = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all spreads with caching
   * @param {boolean} forceRefresh - Force refresh from database
   * @returns {Promise<{data: Array, error: string|null}>}
   */
  async getAllSpreads(forceRefresh = false) {
    try {
      // Check cache
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
        // Return default spreads as fallback
        return { data: DEFAULT_SPREADS, error: null };
      }

      // Update cache
      this.spreadsCache = data?.length > 0 ? data : DEFAULT_SPREADS;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return { data: this.spreadsCache, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] Exception:', err);
      return { data: DEFAULT_SPREADS, error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get spreads by category with tier gating info
   * @param {string} category - Category filter ('all', 'general', 'love', etc.)
   * @param {string} userTier - User's current tier ('FREE', 'TIER1', etc.)
   * @returns {Promise<{data: Array, error: string|null}>}
   */
  async getSpreadsByCategory(category, userTier = 'FREE') {
    try {
      const { data: allSpreads } = await this.getAllSpreads();

      let filtered = allSpreads || [];

      // Filter by category (if not 'all')
      if (category && category !== 'all') {
        filtered = filtered.filter((s) => s.category === category);
      }

      // Mark locked spreads based on user tier
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
   * Get spread by ID
   * @param {string} spreadId - Spread ID (e.g., 'celtic-cross')
   * @returns {Promise<{data: Object|null, error: string|null}>}
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
   * Check if user can access spread
   * @param {string} userTier - User's tier
   * @param {string} spreadTierRequired - Required tier for spread
   * @returns {boolean}
   */
  canUserAccessSpread(userTier, spreadTierRequired) {
    return canAccessSpread(userTier, spreadTierRequired);
  }

  /**
   * Get spread layout coordinates
   * @param {Object} spread - Spread object
   * @returns {Array} Array of position objects with x, y, rotation
   */
  getSpreadLayout(spread) {
    if (!spread) return [];

    const { layout_type, cards } = spread;

    // Celtic Cross specific layout
    if (layout_type === 'cross' && cards === 10) {
      return CELTIC_CROSS_LAYOUT;
    }

    // Predefined horizontal layouts
    if (HORIZONTAL_LAYOUT[cards]) {
      return HORIZONTAL_LAYOUT[cards];
    }

    // Generate default horizontal layout for any card count
    return Array.from({ length: cards }, (_, i) => ({
      index: i,
      x: (i + 1) / (cards + 1),
      y: 0.5,
      rotation: 0,
    }));
  }

  /**
   * Get position info for a card index
   * @param {Object} spread - Spread object
   * @param {number} index - Card index
   * @returns {Object|null} Position info
   */
  getPositionInfo(spread, index) {
    if (!spread?.positions) return null;

    const positions = typeof spread.positions === 'string'
      ? JSON.parse(spread.positions)
      : spread.positions;

    return positions?.find((p) => p.index === index) || null;
  }

  /**
   * Get all positions for a spread
   * @param {Object} spread - Spread object
   * @returns {Array} Array of position objects
   */
  getPositions(spread) {
    if (!spread?.positions) return [];

    return typeof spread.positions === 'string'
      ? JSON.parse(spread.positions)
      : spread.positions;
  }

  /**
   * Get spread categories with counts
   * @param {string} userTier - User's tier for filtering
   * @returns {Promise<{data: Array, error: string|null}>}
   */
  async getCategoriesWithCounts(userTier = 'FREE') {
    try {
      const { data: allSpreads } = await this.getAllSpreads();

      const categories = [
        { id: 'all', label: 'Tất cả', count: allSpreads?.length || 0 },
        { id: 'general', label: 'Tổng quát', count: 0 },
        { id: 'love', label: 'Tình yêu', count: 0 },
        { id: 'career', label: 'Sự nghiệp', count: 0 },
        { id: 'trading', label: 'Trading', count: 0 },
        { id: 'advanced', label: 'Nâng cao', count: 0 },
      ];

      // Count spreads per category
      allSpreads?.forEach((spread) => {
        const cat = categories.find((c) => c.id === spread.category);
        if (cat) {
          cat.count++;
        }
      });

      return { data: categories, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getCategoriesWithCounts error:', err);
      return { data: [], error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Get featured/popular spreads
   * @param {number} limit - Max number of spreads to return
   * @returns {Promise<{data: Array, error: string|null}>}
   */
  async getFeaturedSpreads(limit = 4) {
    try {
      const { data: allSpreads } = await this.getAllSpreads();

      // Return FREE spreads first, then by display_order
      const featured = allSpreads
        ?.filter((s) => s.tier_required === 'FREE')
        ?.slice(0, limit) || [];

      return { data: featured, error: null };
    } catch (err) {
      console.error('[TarotSpreadService] getFeaturedSpreads error:', err);
      return { data: [], error: err?.message || 'Unknown error' };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.spreadsCache = null;
    this.cacheExpiry = null;
    console.log('[TarotSpreadService] Cache cleared');
  }
}

export const tarotSpreadService = new TarotSpreadService();
export default tarotSpreadService;
