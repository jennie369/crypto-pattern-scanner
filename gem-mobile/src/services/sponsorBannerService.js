/**
 * GEM Mobile - Sponsor Banner Service
 * Fetches and manages promotional banners from Supabase
 */

import { supabase } from './supabase';

class SponsorBannerService {
  constructor() {
    this.cache = null;
    this.cacheTime = 0;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get active banners for a specific screen and user tier
   * @param {string} screenName - Screen to get banners for (e.g., 'portfolio')
   * @param {string} userTier - User's tier (FREE, TIER1, TIER2, TIER3, ADMIN)
   * @param {string} userId - User ID to filter out dismissed banners
   * @param {object} options - Additional options
   * @param {number} options.limit - Max number of banners to return (default: all)
   * @param {number} options.offset - Number of banners to skip (default: 0)
   * @param {string[]} options.excludeIds - Banner IDs to exclude (for coordination between header/inline)
   */
  async getActiveBanners(screenName = 'portfolio', userTier = 'FREE', userId = null, options = {}) {
    const { limit = null, offset = 0, excludeIds = [] } = options;
    try {
      console.log('[SponsorBanner] ========== FETCHING BANNERS ==========');
      console.log('[SponsorBanner] screenName:', screenName);
      console.log('[SponsorBanner] userTier:', userTier);
      console.log('[SponsorBanner] userId:', userId);

      const now = new Date().toISOString();
      console.log('[SponsorBanner] Current time:', now);

      // STEP 1: First get ALL active banners to debug
      const { data: allBanners, error: allError } = await supabase
        .from('sponsor_banners')
        .select('*')
        .eq('is_active', true);

      console.log('[SponsorBanner] STEP 1 - All active banners:', allBanners?.length || 0);
      if (allBanners?.length > 0) {
        allBanners.forEach((b, i) => {
          console.log(`[SponsorBanner] Banner ${i + 1}:`, {
            id: b.id,
            title: b.title,
            target_screens: JSON.stringify(b.target_screens),  // Show actual array values
            target_tiers: JSON.stringify(b.target_tiers),      // Show actual array values
            start_date: b.start_date,
            end_date: b.end_date,
            is_active: b.is_active
          });
          // Check if screenName is in target_screens
          console.log(`[SponsorBanner] Does target_screens contain '${screenName}'?`, b.target_screens?.includes(screenName));
          console.log(`[SponsorBanner] Does target_tiers contain '${userTier.toUpperCase()}'?`, b.target_tiers?.includes(userTier.toUpperCase()));
        });
      }

      // STEP 2: Get all active banners and filter on client side
      // (Supabase array contains filter can be unreliable with different array formats)
      let query = supabase
        .from('sponsor_banners')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      console.log('[SponsorBanner] STEP 2 - Fetching all active banners for client-side filtering');

      const { data: allActiveBanners, error } = await query;

      if (error) {
        console.error('[SponsorBanner] Query error:', error);
        return [];
      }

      console.log('[SponsorBanner] Got', allActiveBanners?.length || 0, 'active banners');

      // Client-side filtering for more reliable results
      const banners = (allActiveBanners || []).filter(banner => {
        // Check start_date
        if (banner.start_date && new Date(banner.start_date) > new Date(now)) {
          console.log(`[SponsorBanner] Banner "${banner.title}" filtered out: start_date in future`);
          return false;
        }

        // Check end_date
        if (banner.end_date && new Date(banner.end_date) <= new Date(now)) {
          console.log(`[SponsorBanner] Banner "${banner.title}" filtered out: end_date passed`);
          return false;
        }

        // Check target_screens (array)
        const targetScreens = Array.isArray(banner.target_screens) ? banner.target_screens : [];
        if (!targetScreens.includes(screenName)) {
          console.log(`[SponsorBanner] Banner "${banner.title}" filtered out: screen "${screenName}" not in`, targetScreens);
          return false;
        }

        // Check target_tiers (array) - normalize tier format to handle both TIER1 and TIER_1
        const targetTiers = Array.isArray(banner.target_tiers) ? banner.target_tiers : [];
        const normalizedUserTier = userTier.toUpperCase();
        // Support both formats: TIER1 <-> TIER_1, TIER2 <-> TIER_2, etc.
        const tierVariants = [
          normalizedUserTier,
          normalizedUserTier.replace('TIER_', 'TIER'),  // TIER_1 -> TIER1
          normalizedUserTier.replace(/TIER(\d)/, 'TIER_$1'), // TIER1 -> TIER_1
        ];
        const tierMatches = tierVariants.some(variant => targetTiers.includes(variant));
        if (!tierMatches) {
          console.log(`[SponsorBanner] Banner "${banner.title}" filtered out: tier variants`, tierVariants, 'not in', targetTiers);
          return false;
        }

        console.log(`[SponsorBanner] Banner "${banner.title}" PASSED all filters!`);
        return true;
      });

      console.log('[SponsorBanner] After client-side filtering:', banners.length, 'banners');

      // Filter out dismissed banners if userId provided
      let filteredBanners = banners;
      if (userId && banners.length > 0) {
        const { data: dismissed } = await supabase
          .from('dismissed_banners')
          .select('banner_id')
          .eq('user_id', userId);

        console.log('[SponsorBanner] STEP 3 - Dismissed banners for user:', dismissed?.length || 0);
        if (dismissed?.length > 0) {
          console.log('[SponsorBanner] Dismissed banner IDs:', dismissed.map(d => d.banner_id));
        }

        const dismissedIds = new Set(dismissed?.map(d => d.banner_id) || []);
        filteredBanners = banners.filter(b => !dismissedIds.has(b.id));

        console.log('[SponsorBanner] STEP 4 - After filtering dismissed:', filteredBanners.length);
      }

      // Filter out excluded banner IDs (for coordination between header/inline)
      if (excludeIds && excludeIds.length > 0) {
        const excludeSet = new Set(excludeIds);
        filteredBanners = filteredBanners.filter(b => !excludeSet.has(b.id));
        console.log('[SponsorBanner] STEP 5 - After excluding IDs:', filteredBanners.length);
      }

      // Apply offset and limit
      let result = filteredBanners;
      if (offset > 0) {
        result = result.slice(offset);
        console.log('[SponsorBanner] STEP 6 - After offset:', result.length);
      }
      if (limit !== null && limit > 0) {
        result = result.slice(0, limit);
        console.log('[SponsorBanner] STEP 7 - After limit:', result.length);
      }

      console.log('[SponsorBanner] Found banners:', result?.length || 0);
      return result || [];

    } catch (error) {
      console.error('[SponsorBanner] getActiveBanners error:', error);
      return [];
    }
  }

  /**
   * Dismiss a banner for current user
   */
  async dismissBanner(userId, bannerId) {
    try {
      const { error } = await supabase
        .from('dismissed_banners')
        .upsert({
          user_id: userId,
          banner_id: bannerId,
          dismissed_at: new Date().toISOString()
        });

      if (error) {
        console.error('[SponsorBanner] Dismiss error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SponsorBanner] dismissBanner error:', error);
      return false;
    }
  }

  /**
   * Record banner view (for analytics)
   */
  async recordView(bannerId) {
    try {
      await supabase.rpc('increment_banner_view', { banner_id: bannerId });
    } catch (error) {
      console.error('[SponsorBanner] recordView error:', error);
    }
  }

  /**
   * Record banner click (for analytics)
   */
  async recordClick(bannerId) {
    try {
      await supabase.rpc('increment_banner_click', { banner_id: bannerId });
    } catch (error) {
      console.error('[SponsorBanner] recordClick error:', error);
    }
  }

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  /**
   * Get all banners (admin only)
   */
  async getAllBanners() {
    try {
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[SponsorBanner] getAllBanners error:', error);
      return [];
    }
  }

  /**
   * Clean banner data - remove fields that may not exist in database
   */
  cleanBannerData(bannerData) {
    const cleaned = { ...bannerData };
    // Remove html_content if it's empty (column might not exist yet)
    if (!cleaned.html_content) {
      delete cleaned.html_content;
    }
    return cleaned;
  }

  /**
   * Create new banner (admin only)
   */
  async createBanner(bannerData, createdBy) {
    try {
      const cleanedData = this.cleanBannerData(bannerData);
      const { data, error } = await supabase
        .from('sponsor_banners')
        .insert({
          ...cleanedData,
          created_by: createdBy
        })
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] || data };
    } catch (error) {
      console.error('[SponsorBanner] createBanner error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update banner (admin only)
   */
  async updateBanner(bannerId, updates) {
    try {
      const cleanedUpdates = this.cleanBannerData(updates);
      console.log('[SponsorBanner] updateBanner - cleaned updates:', JSON.stringify(cleanedUpdates, null, 2));

      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[SponsorBanner] Current user:', user?.id);

      // Check user's role in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, email')
        .eq('id', user?.id)
        .single();
      console.log('[SponsorBanner] User profile:', profile);

      // First, update the banner
      const { error: updateError, count } = await supabase
        .from('sponsor_banners')
        .update(cleanedUpdates)
        .eq('id', bannerId);

      console.log('[SponsorBanner] Update result - error:', updateError, 'count:', count);

      if (updateError) {
        console.error('[SponsorBanner] Update error:', updateError);
        throw updateError;
      }

      // Then fetch the updated banner (separate query to avoid RLS issues with .select())
      const { data: updatedBanner, error: fetchError } = await supabase
        .from('sponsor_banners')
        .select('*')
        .eq('id', bannerId)
        .single();

      console.log('[SponsorBanner] updateBanner - fetched after update:', updatedBanner);

      if (fetchError) {
        console.warn('[SponsorBanner] Fetch after update warning:', fetchError);
        // Update succeeded but fetch failed - still return success
        return { success: true, data: { id: bannerId, ...cleanedUpdates } };
      }

      return { success: true, data: updatedBanner };
    } catch (error) {
      console.error('[SponsorBanner] updateBanner error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete banner (admin only)
   */
  async deleteBanner(bannerId) {
    try {
      const { error } = await supabase
        .from('sponsor_banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[SponsorBanner] deleteBanner error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle banner active status (admin only)
   */
  async toggleActive(bannerId, isActive) {
    try {
      const { error } = await supabase
        .from('sponsor_banners')
        .update({ is_active: isActive })
        .eq('id', bannerId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[SponsorBanner] toggleActive error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get banner analytics (admin only)
   */
  async getBannerAnalytics(bannerId) {
    try {
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select('id, title, view_count, click_count, created_at')
        .eq('id', bannerId)
        .single();

      if (error) throw error;

      // Calculate CTR (Click-Through Rate)
      const ctr = data.view_count > 0
        ? ((data.click_count / data.view_count) * 100).toFixed(2)
        : 0;

      return {
        ...data,
        ctr: `${ctr}%`
      };
    } catch (error) {
      console.error('[SponsorBanner] getBannerAnalytics error:', error);
      return null;
    }
  }
}

export const sponsorBannerService = new SponsorBannerService();
export default sponsorBannerService;
