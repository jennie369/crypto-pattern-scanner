/**
 * Feed Service
 * Personalized feed, following, popular, latest, academy, custom feeds
 * Uses RPC functions with direct query fallbacks
 */

import { supabase } from '../lib/supabaseClient';

/** Standard author + category join for post listings */
const POST_LIST_SELECT = `
  *,
  author:profiles(id, full_name, avatar_url, scanner_tier, role),
  category:forum_categories(id, name, color)
`;

class FeedService {
  /**
   * Get personalized feed — tries RPC first, falls back to hot_score sort
   * @param {string} userId
   * @param {{ page?: number, limit?: number }} options
   * @returns {{ posts: Array, total: number, page: number, totalPages: number }}
   */
  async getPersonalizedFeed(userId, { page = 1, limit = 20 } = {}) {
    try {
      // Try RPC — returns post IDs ranked by personalization score
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_personalized_feed', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: (page - 1) * limit,
        });

      if (!rpcError && rpcData?.length) {
        return { posts: rpcData, total: rpcData.length, page, totalPages: page + 1 };
      }

      // Fallback: order by hot_score
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .order('hot_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getPersonalizedFeed error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Get posts from users the current user follows
   * @param {string} userId
   * @param {{ page?: number, limit?: number }} options
   */
  async getFollowingFeed(userId, { page = 1, limit = 20 } = {}) {
    try {
      // Get followed user IDs
      const { data: follows, error: fErr } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (fErr) throw fErr;
      const followingIds = (follows || []).map(f => f.following_id);

      if (followingIds.length === 0) {
        return { posts: [], total: 0, page, totalPages: 0 };
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getFollowingFeed error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Get popular posts by trending_score
   * @param {{ page?: number, limit?: number }} options
   */
  async getPopularFeed({ page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .order('trending_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getPopularFeed error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Get latest posts sorted by creation time
   * @param {{ page?: number, limit?: number }} options
   */
  async getLatestFeed({ page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getLatestFeed error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Get academy / learning posts
   * @param {{ page?: number, limit?: number }} options
   */
  async getAcademyFeed({ page = 1, limit = 20 } = {}) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published')
        .or('category_id.eq.academy,content_category.eq.academy')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getAcademyFeed error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  // ─── CUSTOM FEEDS ──────────────────────────────────────────────────

  /**
   * Get posts for a custom feed by its config
   * @param {string} feedId
   * @param {{ page?: number, limit?: number }} options
   */
  async getCustomFeedPosts(feedId, { page = 1, limit = 20 } = {}) {
    try {
      // Load custom feed definition
      const { data: feed, error: feedErr } = await supabase
        .from('custom_feeds')
        .select('*')
        .eq('id', feedId)
        .single();
      if (feedErr) throw feedErr;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('forum_posts')
        .select(POST_LIST_SELECT, { count: 'exact' })
        .eq('status', 'published');

      // Apply feed filters from config
      const config = feed.config || {};
      if (config.categories?.length) {
        query = query.in('category_id', config.categories);
      }
      if (config.hashtags?.length) {
        query = query.overlaps('hashtags', config.hashtags);
      }
      if (config.authors?.length) {
        query = query.in('user_id', config.authors);
      }

      // Sort
      const sortField = config.sort_by || 'created_at';
      query = query.order(sortField, { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getCustomFeedPosts error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Get user's custom feeds list
   * @param {string} userId
   * @returns {Array}
   */
  async getUserCustomFeeds(userId) {
    try {
      const { data, error } = await supabase
        .from('custom_feeds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getUserCustomFeeds error:', error);
      return [];
    }
  }

  /**
   * Create a custom feed
   * @param {string} userId
   * @param {{ name: string, config: Object }} data
   * @returns {Object}
   */
  async createCustomFeed(userId, data) {
    try {
      const { data: feed, error } = await supabase
        .from('custom_feeds')
        .insert({
          user_id: userId,
          name: data.name,
          config: data.config || {},
        })
        .select()
        .single();

      if (error) throw error;
      return feed;
    } catch (error) {
      console.error('createCustomFeed error:', error);
      throw error;
    }
  }

  /**
   * Update a custom feed
   * @param {string} feedId
   * @param {{ name?: string, config?: Object }} data
   * @returns {Object}
   */
  async updateCustomFeed(feedId, data) {
    try {
      const updates = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.config !== undefined) updates.config = data.config;

      const { data: feed, error } = await supabase
        .from('custom_feeds')
        .update(updates)
        .eq('id', feedId)
        .select()
        .single();

      if (error) throw error;
      return feed;
    } catch (error) {
      console.error('updateCustomFeed error:', error);
      throw error;
    }
  }

  /**
   * Delete a custom feed
   * @param {string} feedId
   */
  async deleteCustomFeed(feedId) {
    try {
      const { error } = await supabase
        .from('custom_feeds')
        .delete()
        .eq('id', feedId);
      if (error) throw error;
    } catch (error) {
      console.error('deleteCustomFeed error:', error);
      throw error;
    }
  }

  // ─── TRENDING ──────────────────────────────────────────────────────

  /**
   * Get trending hashtags — tries RPC, falls back to aggregate
   * @param {number} limit
   * @returns {Array<{ hashtag: string, count: number }>}
   */
  async getTrendingHashtags(limit = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { p_limit: limit });

      if (!error && data?.length) return data;

      // Fallback — aggregate hashtags from recent posts
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: posts, error: postsErr } = await supabase
        .from('forum_posts')
        .select('hashtags')
        .eq('status', 'published')
        .gte('created_at', sevenDaysAgo.toISOString())
        .not('hashtags', 'is', null);

      if (postsErr) throw postsErr;

      const counts = {};
      (posts || []).forEach(p => {
        (p.hashtags || []).forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([hashtag, count]) => ({ hashtag, count }));
    } catch (error) {
      console.error('getTrendingHashtags error:', error);
      return [];
    }
  }

  /**
   * Record a feed impression for analytics
   * @param {string} postId
   * @param {string|null} userId
   */
  async recordImpression(postId, userId) {
    try {
      await supabase
        .from('feed_impressions')
        .insert({
          post_id: postId,
          user_id: userId || null,
        });
    } catch (error) {
      // Silent — impressions are best-effort
      console.error('recordImpression error:', error);
    }
  }
}

export default new FeedService();
