/**
 * Gemral - Boost Service
 * Feature #7: Boost Post
 * Handles post boosting/promotion
 */

import { supabase } from './supabase';
import { formatError } from '../utils/errorUtils';

export const boostService = {
  /**
   * Get available boost packages
   */
  getBoostPackages() {
    return [
      {
        id: 'basic',
        name: 'Co ban',
        description: 'Tang tiep can 2x trong 24h',
        duration_hours: 24,
        reach_multiplier: 2,
        price_gems: 50,
        features: [
          'Hien thi o vi tri cao hon',
          'Badge "Duoc quan tam"',
        ],
      },
      {
        id: 'standard',
        name: 'Tieu chuan',
        description: 'Tang tiep can 5x trong 48h',
        duration_hours: 48,
        reach_multiplier: 5,
        price_gems: 100,
        features: [
          'Hien thi tren dau feed',
          'Badge "Dang hot"',
          'Xuat hien trong De xuat',
        ],
        popular: true,
      },
      {
        id: 'premium',
        name: 'Cao cap',
        description: 'Tang tiep can 10x trong 7 ngay',
        duration_hours: 168, // 7 days
        reach_multiplier: 10,
        price_gems: 300,
        features: [
          'Vi tri hang dau',
          'Badge "Trending"',
          'Thong bao den follower',
          'Phan tich chi tiet',
        ],
      },
      {
        id: 'ultra',
        name: 'Sieu cap',
        description: 'Tang tiep can toi da trong 14 ngay',
        duration_hours: 336, // 14 days
        reach_multiplier: 20,
        price_gems: 500,
        features: [
          'Do uu tien cao nhat',
          'Badge "Viral"',
          'Quang cao noi bat',
          'Ho tro tu doi ngu GEM',
          'Bao cao hieu qua',
        ],
      },
    ];
  },

  /**
   * Boost a post
   * @param {string} postId - Post ID
   * @param {string} packageId - Boost package ID
   * @returns {Promise<object>}
   */
  async boostPost(postId, packageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const packages = this.getBoostPackages();
      const selectedPackage = packages.find(p => p.id === packageId);

      if (!selectedPackage) {
        return { success: false, error: 'Goi boost khong hop le' };
      }

      // Check gem balance - use profiles.gems as single source of truth
      const { data: profile } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', user.id)
        .single();

      const gemBalance = profile?.gems || 0;
      if (gemBalance < selectedPackage.price_gems) {
        return { success: false, error: 'Khong du gems', needGems: true };
      }

      // Verify post ownership
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post?.user_id !== user.id) {
        return { success: false, error: 'Khong co quyen boost bai viet nay' };
      }

      // Check if already boosted
      const { data: existingBoost } = await supabase
        .from('post_boosts')
        .select('id, expires_at')
        .eq('post_id', postId)
        .eq('status', 'active')
        .single();

      if (existingBoost) {
        return {
          success: false,
          error: 'Bai viet dang duoc boost',
          existingBoost,
        };
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + selectedPackage.duration_hours);

      // Start transaction
      // 1. Deduct gems from profiles.gems (single source of truth)
      const newBalance = gemBalance - selectedPackage.price_gems;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ gems: newBalance })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Also update user_wallets for backwards compatibility (trigger should do this too)
      await supabase
        .from('user_wallets')
        .update({ gem_balance: newBalance })
        .eq('user_id', user.id);

      // 2. Record transaction to gems_transactions
      await supabase
        .from('gems_transactions')
        .insert({
          user_id: user.id,
          type: 'debit',
          amount: selectedPackage.price_gems,
          description: `Boost bai viet - Goi ${selectedPackage.name}`,
          reference_type: 'post_boost',
          balance_before: gemBalance,
          balance_after: newBalance,
        });

      // Also log to wallet_transactions for backwards compatibility
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'spend',
          amount: selectedPackage.price_gems,
          currency: 'gems',
          description: `Boost bai viet - Goi ${selectedPackage.name}`,
          reference_type: 'post_boost',
          reference_id: postId,
        });

      // 3. Create boost record
      const { data: boost, error: boostError } = await supabase
        .from('post_boosts')
        .insert({
          post_id: postId,
          user_id: user.id,
          package_type: packageId,
          gems_spent: selectedPackage.price_gems,
          reach_multiplier: selectedPackage.reach_multiplier,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (boostError) throw boostError;

      // 4. Update post boost status
      await supabase
        .from('forum_posts')
        .update({
          is_boosted: true,
          boost_expires_at: expiresAt.toISOString(),
        })
        .eq('id', postId);

      console.log('[Boost] Created boost:', boost.id);
      return {
        success: true,
        data: boost,
        package: selectedPackage,
      };
    } catch (error) {
      console.error('[Boost] Create error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get active boosts for user
   * Also triggers cleanup of expired boosts in background
   * @returns {Promise<array>}
   */
  async getActiveBoosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Trigger cleanup of expired boosts in background (don't await)
      this.checkAndExpireBoosts().catch(err =>
        console.warn('[Boost] Background cleanup error:', err)
      );

      const { data, error } = await supabase
        .from('post_boosts')
        .select(`
          id,
          package_type,
          gems_spent,
          reach_multiplier,
          impressions,
          clicks,
          created_at,
          expires_at,
          status,
          post:post_id (
            id,
            content,
            image_url,
            media_urls
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Boost] Get active error:', error);
      return [];
    }
  },

  /**
   * Get boost history
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getBoostHistory(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_boosts')
        .select(`
          id,
          package_type,
          gems_spent,
          reach_multiplier,
          impressions,
          clicks,
          created_at,
          expires_at,
          status,
          post:post_id (
            id,
            content,
            image_url,
            media_urls
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Boost] Get history error:', error);
      return [];
    }
  },

  /**
   * Get boost stats for a post
   * @param {string} postId - Post ID
   * @returns {Promise<object|null>}
   */
  async getBoostStats(postId) {
    try {
      const { data, error } = await supabase
        .from('post_boosts')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[Boost] Get stats error:', error);
      return null;
    }
  },

  /**
   * Check if post is currently boosted
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async isPostBoosted(postId) {
    try {
      const { data } = await supabase
        .from('post_boosts')
        .select('id')
        .eq('post_id', postId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Cancel active boost (no refund)
   * @param {string} boostId - Boost ID
   * @returns {Promise<object>}
   */
  async cancelBoost(boostId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify ownership
      const { data: boost } = await supabase
        .from('post_boosts')
        .select('user_id, post_id')
        .eq('id', boostId)
        .single();

      if (boost?.user_id !== user.id) {
        return { success: false, error: 'Khong co quyen' };
      }

      // Update boost status
      const { error } = await supabase
        .from('post_boosts')
        .update({ status: 'cancelled' })
        .eq('id', boostId);

      if (error) throw error;

      // Update post
      await supabase
        .from('forum_posts')
        .update({
          is_boosted: false,
          boost_expires_at: null,
        })
        .eq('id', boost.post_id);

      console.log('[Boost] Cancelled:', boostId);
      return { success: true };
    } catch (error) {
      console.error('[Boost] Cancel error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Record boost impression (for analytics)
   * @param {string} boostId - Boost ID
   * @returns {Promise<void>}
   */
  async recordImpression(boostId) {
    try {
      await supabase.rpc('increment_boost_impressions', { p_boost_id: boostId });
    } catch (error) {
      console.error('[Boost] Record impression error:', error);
    }
  },

  /**
   * Record boost click (for analytics)
   * @param {string} boostId - Boost ID
   * @returns {Promise<void>}
   */
  async recordClick(boostId) {
    try {
      await supabase.rpc('increment_boost_clicks', { p_boost_id: boostId });
    } catch (error) {
      console.error('[Boost] Record click error:', error);
    }
  },

  /**
   * Get user's boost campaigns (alias for getBoostHistory)
   * @param {string} userId - User ID (optional, uses current user if not provided)
   * @param {number} limit - Max results
   * @returns {Promise<object>}
   */
  async getUserCampaigns(userId, limit = 20) {
    try {
      const data = await this.getBoostHistory(limit);
      return { success: true, data };
    } catch (error) {
      console.error('[Boost] getUserCampaigns error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get detailed analytics for a specific campaign
   * Fetches real-time data from forum_posts
   * @param {string} campaignId - Boost campaign ID
   * @returns {Promise<object>}
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Fetch boost campaign with post details (only columns that exist)
      const { data: campaign, error: campaignError } = await supabase
        .from('post_boosts')
        .select(`
          id,
          post_id,
          user_id,
          package_type,
          gems_spent,
          reach_multiplier,
          impressions,
          clicks,
          status,
          expires_at,
          created_at
        `)
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (campaignError) throw campaignError;
      if (!campaign) {
        return { success: false, error: 'Chiến dịch không tồn tại' };
      }

      // Fetch real-time post stats for actual engagement data
      const { data: postStats, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          media_urls,
          views_count,
          is_boosted,
          boost_expires_at
        `)
        .eq('id', campaign.post_id)
        .single();

      // Fetch real-time reactions count
      const { count: reactionsCount } = await supabase
        .from('forum_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', campaign.post_id);

      // Fetch real-time comments count
      const { count: commentsCount } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', campaign.post_id);

      // Map package_type to display name
      const packageNames = {
        basic: 'Cơ bản',
        standard: 'Tiêu chuẩn',
        premium: 'Cao cấp',
        ultra: 'Siêu cấp',
      };

      // Use real data: impressions from views_count, clicks from RPC counter
      const realImpressions = postStats?.views_count || campaign.impressions || 0;
      const realClicks = campaign.clicks || 0;
      const realReactions = reactionsCount || 0;
      const realComments = commentsCount || 0;
      const realReach = Math.floor(realImpressions * 0.7); // Estimate unique reach as 70% of views

      // Calculate engagement rate from actual clicks only (not reactions/comments)
      const engagementRate = realImpressions > 0
        ? ((realClicks / realImpressions) * 100).toFixed(1)
        : 0;

      // Try to fetch real daily stats from boost_daily_stats table
      const { data: realDailyStats } = await supabase
        .from('boost_daily_stats')
        .select('stat_date, impressions, clicks, reactions, comments')
        .eq('boost_id', campaignId)
        .order('stat_date', { ascending: true })
        .limit(7);

      const now = new Date();
      let daily_stats;

      if (realDailyStats && realDailyStats.length > 0) {
        // Use real tracked daily stats
        daily_stats = realDailyStats.map(row => ({
          date: new Date(row.stat_date).toLocaleDateString('vi-VN', { weekday: 'short' }),
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
          reactions: row.reactions || 0,
          comments: row.comments || 0,
        }));
      } else {
        // Fallback: distribute totals evenly across days (no random variance)
        const startDate = new Date(campaign.created_at);
        const endDate = new Date(campaign.expires_at || Date.now());
        const actualEndDate = endDate > now ? now : endDate;
        const daysDiff = Math.ceil((actualEndDate - startDate) / (1000 * 60 * 60 * 24));
        const daysToShow = Math.min(Math.max(daysDiff, 1), 7);

        const avgImpressions = Math.floor(realImpressions / Math.max(daysToShow, 1));
        const avgClicks = Math.floor(realClicks / Math.max(daysToShow, 1));
        const avgReactions = Math.floor(realReactions / Math.max(daysToShow, 1));
        const avgComments = Math.floor(realComments / Math.max(daysToShow, 1));
        const remainderImpressions = realImpressions - avgImpressions * daysToShow;
        const remainderClicks = realClicks - avgClicks * daysToShow;
        const remainderReactions = realReactions - avgReactions * daysToShow;
        const remainderComments = realComments - avgComments * daysToShow;

        daily_stats = [];
        for (let i = 0; i < daysToShow; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const isLast = i === daysToShow - 1;
          daily_stats.push({
            date: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
            impressions: avgImpressions + (isLast ? remainderImpressions : 0),
            clicks: avgClicks + (isLast ? remainderClicks : 0),
            reactions: avgReactions + (isLast ? remainderReactions : 0),
            comments: avgComments + (isLast ? remainderComments : 0),
          });
        }
      }

      // Check if boost has expired and update status if needed
      const isExpired = new Date(campaign.expires_at) < now;
      if (isExpired && campaign.status === 'active') {
        // Update boost status to expired
        await this.expireBoost(campaign.id, campaign.post_id);
        campaign.status = 'expired';
      }

      return {
        success: true,
        data: {
          id: campaign.id,
          status: campaign.status,
          package_name: packageNames[campaign.package_type] || campaign.package_type,
          package_type: campaign.package_type,
          gems_spent: campaign.gems_spent,
          reach_multiplier: campaign.reach_multiplier,
          start_date: campaign.created_at,
          end_date: campaign.expires_at,
          expires_at: campaign.expires_at,
          impressions: realImpressions,
          clicks: realClicks,
          reactions: realReactions,
          comments: realComments,
          reach: realReach,
          reachEstimated: true,
          engagement_rate: parseFloat(engagementRate),
          daily_stats,
          post: postStats ? {
            id: postStats.id,
            content: postStats.content,
            media_urls: postStats.media_urls,
          } : null,
        },
      };
    } catch (error) {
      console.error('[Boost] getCampaignAnalytics error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Expire a boost and update related post
   * @param {string} boostId - Boost ID
   * @param {string} postId - Post ID
   * @returns {Promise<void>}
   */
  async expireBoost(boostId, postId) {
    try {
      // Update boost status
      await supabase
        .from('post_boosts')
        .update({ status: 'expired' })
        .eq('id', boostId);

      // Update post to remove boost flag
      await supabase
        .from('forum_posts')
        .update({
          is_boosted: false,
          boost_expires_at: null,
        })
        .eq('id', postId);

      console.log('[Boost] Expired boost:', boostId);
    } catch (error) {
      console.error('[Boost] Expire error:', error);
    }
  },

  /**
   * Check and expire all overdue boosts
   * Call this periodically (e.g., on app start or feed refresh)
   * @returns {Promise<number>} Number of boosts expired
   */
  async checkAndExpireBoosts() {
    try {
      const now = new Date().toISOString();

      // Find all active boosts that have expired
      const { data: expiredBoosts, error } = await supabase
        .from('post_boosts')
        .select('id, post_id')
        .eq('status', 'active')
        .lt('expires_at', now);

      if (error) throw error;
      if (!expiredBoosts || expiredBoosts.length === 0) return 0;

      console.log('[Boost] Found', expiredBoosts.length, 'expired boosts to update');

      // Expire each boost
      for (const boost of expiredBoosts) {
        await this.expireBoost(boost.id, boost.post_id);
      }

      return expiredBoosts.length;
    } catch (error) {
      console.error('[Boost] checkAndExpireBoosts error:', formatError(error));
      return 0;
    }
  },

  /**
   * Get remaining time for boost
   * @param {string} expiresAt - Expiry timestamp
   * @returns {object}
   */
  getRemainingTime(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) {
      return { expired: true, text: 'Da het han' };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return { expired: false, text: `${days} ngay ${remainingHours}h` };
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { expired: false, text: `${hours}h ${minutes}m` };
  },
};

export default boostService;
