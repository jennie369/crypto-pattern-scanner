/**
 * Resource Service
 * Handles partner resources and access control
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE3.md
 */

import { supabase } from './supabase';
import { CTV_TIER_ORDER } from '../constants/partnershipConstants';

/**
 * Resource access levels:
 * - all: All partners can access
 * - ctv_only: CTV and KOL can access
 * - kol_only: KOL only
 * - gold_plus: CTV Gold, Platinum, Diamond
 * - platinum_plus: CTV Platinum, Diamond
 * - diamond_only: CTV Diamond only
 */
export const RESOURCE_ACCESS_LEVELS = {
  ALL: 'all',
  CTV_ONLY: 'ctv_only',
  KOL_ONLY: 'kol_only',
  GOLD_PLUS: 'gold_plus',
  PLATINUM_PLUS: 'platinum_plus',
  DIAMOND_ONLY: 'diamond_only',
};

/**
 * Resource types
 */
export const RESOURCE_TYPES = {
  BANNER: 'banner',
  CREATIVE: 'creative',
  VIDEO: 'video',
  DOCUMENT: 'document',
  TEMPLATE: 'template',
  TOOL: 'tool',
  EVENT: 'event',
};

const RESOURCE_SERVICE = {
  /**
   * Get all accessible resources for current user
   * @returns {Promise<Object>} { success, resources, error }
   */
  async getResources() {
    try {
      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, resources: data || [] };
    } catch (err) {
      console.error('[ResourceService] getResources error:', err);
      return { success: false, resources: [], error: err.message };
    }
  },

  /**
   * Get current user's partner profile
   * @returns {Promise<Object|null>} Partner profile or null
   */
  async getPartnerProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return null;

      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    } catch (err) {
      console.error('[ResourceService] getPartnerProfile error:', err);
      return null;
    }
  },

  /**
   * Check if user has access to resource
   * @param {Object} resource - Resource object
   * @param {string} userRole - User role ('ctv' or 'kol')
   * @param {string} userTier - User CTV tier
   * @returns {boolean} Has access
   */
  checkAccess(resource, userRole, userTier) {
    const { access_level, min_tier } = resource;

    // All access
    if (access_level === 'all' || !access_level) return true;

    // KOL only
    if (access_level === 'kol_only') {
      return userRole === 'kol';
    }

    // CTV only (KOL also counts as they can be CTV too)
    if (access_level === 'ctv_only') {
      return userRole === 'ctv' || userRole === 'kol';
    }

    // KOL has access to all tier-based resources
    if (userRole === 'kol') return true;

    // Tier-based access for CTV
    const userTierIndex = CTV_TIER_ORDER.indexOf(userTier || 'bronze');

    if (access_level === 'gold_plus') {
      return userTierIndex >= 2; // gold, platinum, diamond
    }

    if (access_level === 'platinum_plus') {
      return userTierIndex >= 3; // platinum, diamond
    }

    if (access_level === 'diamond_only') {
      return userTierIndex >= 4; // diamond only
    }

    // Min tier check (if specified)
    if (min_tier) {
      const minTierIndex = CTV_TIER_ORDER.indexOf(min_tier);
      return userTierIndex >= minTierIndex;
    }

    return true;
  },

  /**
   * Track resource download
   * @param {string} resourceId - Resource ID
   */
  async trackDownload(resourceId) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

      // Update download count
      const { data: resource } = await supabase
        .from('partnership_resources')
        .select('download_count')
        .eq('id', resourceId)
        .single();

      await supabase
        .from('partnership_resources')
        .update({
          download_count: (resource?.download_count || 0) + 1,
        })
        .eq('id', resourceId);

      // Log download if user exists
      if (user) {
        await supabase
          .from('resource_downloads')
          .insert({
            resource_id: resourceId,
            user_id: user.id,
            downloaded_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error('[ResourceService] trackDownload error:', err);
    }
  },

  /**
   * Get resources by type
   * @param {string} type - Resource type
   * @returns {Promise<Object>} { success, resources }
   */
  async getResourcesByType(type) {
    try {
      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('resource_type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, resources: data || [] };
    } catch (err) {
      console.error('[ResourceService] getResourcesByType error:', err);
      return { success: false, resources: [] };
    }
  },

  /**
   * Get featured resources
   * @returns {Promise<Object>} { success, resources }
   */
  async getFeaturedResources() {
    try {
      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return { success: true, resources: data || [] };
    } catch (err) {
      console.error('[ResourceService] getFeaturedResources error:', err);
      return { success: false, resources: [] };
    }
  },

  /**
   * Get upcoming events
   * @returns {Promise<Object>} { success, events }
   */
  async getUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('resource_type', 'event')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      return { success: true, events: data || [] };
    } catch (err) {
      console.error('[ResourceService] getUpcomingEvents error:', err);
      return { success: false, events: [] };
    }
  },

  /**
   * Search resources
   * @param {string} query - Search query
   * @returns {Promise<Object>} { success, resources }
   */
  async searchResources(query) {
    try {
      if (!query || query.length < 2) {
        return { success: true, resources: [] };
      }

      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('is_featured', { ascending: false })
        .limit(20);

      if (error) throw error;
      return { success: true, resources: data || [] };
    } catch (err) {
      console.error('[ResourceService] searchResources error:', err);
      return { success: false, resources: [] };
    }
  },

  /**
   * Get resource by ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object|null>} Resource or null
   */
  async getResourceById(resourceId) {
    try {
      const { data, error } = await supabase
        .from('partnership_resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error) return null;
      return data;
    } catch (err) {
      console.error('[ResourceService] getResourceById error:', err);
      return null;
    }
  },

  /**
   * Get access level display name
   * @param {string} level - Access level key
   * @returns {string} Display name in Vietnamese
   */
  getAccessLevelName(level) {
    const names = {
      all: 'Tất cả',
      ctv_only: 'CTV',
      kol_only: 'KOL',
      gold_plus: 'CTV Vàng trở lên',
      platinum_plus: 'CTV Bạch Kim trở lên',
      diamond_only: 'CTV Kim Cương',
    };
    return names[level] || 'Tất cả';
  },

  /**
   * Get resource type label
   * @param {string} type - Resource type
   * @returns {string} Label in Vietnamese
   */
  getResourceTypeLabel(type) {
    const labels = {
      banner: 'Banner',
      creative: 'Creative',
      video: 'Video',
      document: 'Tài liệu',
      template: 'Template',
      tool: 'Công cụ',
      event: 'Sự kiện',
    };
    return labels[type] || type;
  },
};

export default RESOURCE_SERVICE;
