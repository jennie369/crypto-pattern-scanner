/**
 * GEM Mobile - Sponsor Banner Service
 * Fetches and manages promotional banners from Supabase
 */

import { supabase } from './supabase';
import { formatError } from '../utils/errorUtils';

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
            layout_type: b.layout_type,  // <-- DEBUG: Check if layout_type exists
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
        console.error('[SponsorBanner] Query error:', formatError(error));
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
        console.log('[SponsorBanner] STEP 3 - Fetching dismissed banners for user:', userId);

        const { data: dismissed, error: dismissError } = await supabase
          .from('dismissed_banners')
          .select('banner_id')
          .eq('user_id', userId);

        if (dismissError) {
          console.error('[SponsorBanner] Error fetching dismissed banners:', formatError(dismissError));
        }

        console.log('[SponsorBanner] Dismissed banners count:', dismissed?.length || 0);
        if (dismissed?.length > 0) {
          console.log('[SponsorBanner] Dismissed banner IDs:', dismissed.map(d => d.banner_id));
        }

        const dismissedIds = new Set(dismissed?.map(d => d.banner_id) || []);
        filteredBanners = banners.filter(b => !dismissedIds.has(b.id));

        console.log('[SponsorBanner] STEP 4 - Before filter:', banners.length, '→ After filter:', filteredBanners.length);
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
      console.log('[SponsorBanner] ========== DISMISS BANNER ==========');
      console.log('[SponsorBanner] userId:', userId);
      console.log('[SponsorBanner] bannerId:', bannerId);

      const { data, error } = await supabase
        .from('dismissed_banners')
        .upsert(
          {
            user_id: userId,
            banner_id: bannerId,
            dismissed_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,banner_id',  // Handle unique constraint
            ignoreDuplicates: false           // Update if exists
          }
        )
        .select();

      console.log('[SponsorBanner] Dismiss result - data:', data);
      console.log('[SponsorBanner] Dismiss result - error:', error);

      if (error) {
        console.error('[SponsorBanner] Dismiss error:', error);
        return false;
      }

      console.log('[SponsorBanner] ✅ Banner dismissed successfully');
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
      console.log('[SponsorBanner] ========== UPDATE BANNER ==========');
      console.log('[SponsorBanner] Banner ID:', bannerId);
      console.log('[SponsorBanner] Updates to save:', JSON.stringify(cleanedUpdates, null, 2));

      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[SponsorBanner] Current user ID:', user?.id);

      // Check user's role in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email, is_admin, scanner_tier, chatbot_tier')
        .eq('id', user?.id)
        .single();
      console.log('[SponsorBanner] User profile:', JSON.stringify(profile, null, 2));
      if (profileError) {
        console.error('[SponsorBanner] Profile fetch error:', profileError);
      }

      // Try update with returning data
      console.log('[SponsorBanner] Executing update...');
      const { data: updateData, error: updateError } = await supabase
        .from('sponsor_banners')
        .update(cleanedUpdates)
        .eq('id', bannerId)
        .select();

      console.log('[SponsorBanner] Update response - data:', JSON.stringify(updateData, null, 2));
      console.log('[SponsorBanner] Update response - error:', updateError ? JSON.stringify(updateError, null, 2) : 'null');

      if (updateError) {
        console.error('[SponsorBanner] UPDATE FAILED:', updateError);
        throw updateError;
      }

      // If update returned data, use it
      if (updateData && updateData.length > 0) {
        console.log('[SponsorBanner] Update SUCCESS with data');
        return { success: true, data: updateData[0] };
      }

      // Fallback: fetch the updated banner
      console.log('[SponsorBanner] Fetching updated banner...');
      const { data: updatedBanner, error: fetchError } = await supabase
        .from('sponsor_banners')
        .select('*')
        .eq('id', bannerId)
        .single();

      console.log('[SponsorBanner] Fetched banner:', JSON.stringify(updatedBanner, null, 2));

      if (fetchError) {
        console.warn('[SponsorBanner] Fetch warning:', fetchError);
        return { success: true, data: { id: bannerId, ...cleanedUpdates } };
      }

      console.log('[SponsorBanner] ========== UPDATE COMPLETE ==========');
      return { success: true, data: updatedBanner };
    } catch (error) {
      console.error('[SponsorBanner] updateBanner EXCEPTION:', error);
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

  // ============================================
  // FACEBOOK-STYLE ENGAGEMENT FUNCTIONS
  // ============================================

  /**
   * React to an ad (like, love, haha, wow, sad, angry)
   * @param {string} adId - Ad/Banner ID
   * @param {string} reactionType - Reaction type (like, love, haha, wow, sad, angry)
   * @returns {object} { success, action, reaction }
   */
  async reactToAd(adId, reactionType) {
    try {
      const { data, error } = await supabase.rpc('react_to_ad', {
        p_ad_id: adId,
        p_reaction_type: reactionType,
      });

      if (error) throw error;
      return data || { success: true, action: 'added', reaction: reactionType };
    } catch (error) {
      console.error('[SponsorBanner] reactToAd error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current reaction to an ad
   * @param {string} adId - Ad/Banner ID
   * @returns {string|null} Reaction type or null
   */
  async getUserReaction(adId) {
    try {
      const { data, error } = await supabase.rpc('get_user_ad_reaction', {
        p_ad_id: adId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SponsorBanner] getUserReaction error:', error);
      return null;
    }
  }

  /**
   * Get comments for an ad
   * @param {string} adId - Ad/Banner ID
   * @param {number} limit - Max comments to return (default 20)
   * @param {number} offset - Offset for pagination (default 0)
   * @returns {object} { comments, likedIds }
   */
  async getAdComments(adId, limit = 20, offset = 0) {
    try {
      // Get comments with user profile info
      const { data: comments, error } = await supabase
        .from('sponsor_ad_comments')
        .select(`
          id,
          content,
          parent_id,
          likes_count,
          replies_count,
          created_at,
          user_id,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('ad_id', adId)
        .eq('is_hidden', false)
        .is('parent_id', null) // Only top-level comments
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get current user's liked comment IDs
      const { data: { user } } = await supabase.auth.getUser();
      let likedIds = [];

      if (user) {
        const { data: likes } = await supabase
          .from('sponsor_ad_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', (comments || []).map(c => c.id));

        likedIds = (likes || []).map(l => l.comment_id);
      }

      // Flatten profile data
      const formattedComments = (comments || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        parent_id: comment.parent_id,
        likes_count: comment.likes_count,
        replies_count: comment.replies_count,
        created_at: comment.created_at,
        user_id: comment.user_id,
        display_name: comment.profiles?.display_name || 'Người dùng ẩn danh',
        avatar_url: comment.profiles?.avatar_url,
      }));

      return { comments: formattedComments, likedIds };
    } catch (error) {
      console.error('[SponsorBanner] getAdComments error:', error);
      return { comments: [], likedIds: [] };
    }
  }

  /**
   * Add a comment to an ad
   * @param {string} adId - Ad/Banner ID
   * @param {string} content - Comment content
   * @param {string|null} parentId - Parent comment ID for replies
   * @returns {string|null} New comment ID or null
   */
  async addAdComment(adId, content, parentId = null) {
    try {
      const { data, error } = await supabase.rpc('add_ad_comment', {
        p_ad_id: adId,
        p_content: content,
        p_parent_id: parentId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SponsorBanner] addAdComment error:', error);
      return null;
    }
  }

  /**
   * Toggle like on a comment
   * @param {string} commentId - Comment ID
   * @returns {boolean} Whether the comment is now liked
   */
  async toggleAdCommentLike(commentId) {
    try {
      const { data, error } = await supabase.rpc('toggle_ad_comment_like', {
        p_comment_id: commentId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SponsorBanner] toggleAdCommentLike error:', error);
      return false;
    }
  }

  /**
   * Increment share count for an ad
   * @param {string} adId - Ad/Banner ID
   * @param {string} destination - Share destination (copy_link, external, etc.)
   */
  async incrementAdShare(adId, destination = 'copy_link') {
    try {
      const { error } = await supabase.rpc('increment_ad_share', {
        p_ad_id: adId,
        p_destination: destination,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[SponsorBanner] incrementAdShare error:', error);
      return false;
    }
  }

  /**
   * Report an ad
   * @param {string} adId - Ad/Banner ID
   * @param {string} reason - Report reason
   */
  async reportAd(adId, reason) {
    try {
      const { error } = await supabase.rpc('report_ad', {
        p_ad_id: adId,
        p_reason: reason,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[SponsorBanner] reportAd error:', error);
      return false;
    }
  }

  /**
   * Hide an ad from user's feed
   * @param {string} adId - Ad/Banner ID
   */
  async hideAd(adId) {
    try {
      const { error } = await supabase.rpc('hide_ad', {
        p_ad_id: adId,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[SponsorBanner] hideAd error:', error);
      return false;
    }
  }

  /**
   * Log ad impression
   * @param {string} adId - Ad/Banner ID
   */
  async logImpression(adId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('sponsor_ad_interactions')
        .insert({
          ad_id: adId,
          user_id: user?.id,
          interaction_type: 'impression',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[SponsorBanner] logImpression error:', error);
      return false;
    }
  }

  /**
   * Get ad engagement analytics (admin only)
   * @param {string} adId - Ad/Banner ID
   */
  async getAdEngagementAnalytics(adId) {
    try {
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select(`
          id,
          title,
          view_count,
          click_count,
          reaction_like,
          reaction_love,
          reaction_haha,
          reaction_wow,
          reaction_sad,
          reaction_angry,
          comments_count,
          shares_count,
          hide_count,
          report_count
        `)
        .eq('id', adId)
        .single();

      if (error) throw error;

      // Calculate totals
      const totalReactions = (data.reaction_like || 0) +
        (data.reaction_love || 0) +
        (data.reaction_haha || 0) +
        (data.reaction_wow || 0) +
        (data.reaction_sad || 0) +
        (data.reaction_angry || 0);

      const engagementRate = data.view_count > 0
        ? (((totalReactions + data.comments_count + data.shares_count) / data.view_count) * 100).toFixed(2)
        : 0;

      return {
        ...data,
        totalReactions,
        engagementRate: `${engagementRate}%`,
      };
    } catch (error) {
      console.error('[SponsorBanner] getAdEngagementAnalytics error:', error);
      return null;
    }
  }
}

export const sponsorBannerService = new SponsorBannerService();
export default sponsorBannerService;
