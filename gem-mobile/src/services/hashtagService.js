/**
 * Gemral - Hashtag Service
 * Handles hashtag extraction, parsing, and searching
 */

import { supabase } from './supabase';

export const hashtagService = {
  /**
   * Extract hashtags from text
   * @param {string} text - Input text
   * @returns {Array<string>} - Unique array of hashtags (lowercase)
   */
  extractHashtags(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Regex to match hashtags
    // Supports: #hashtag, #hash_tag, #hash123, Vietnamese characters
    const hashtagRegex = /#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const matches = text.match(hashtagRegex);

    if (!matches) {
      return [];
    }

    // Remove # prefix and convert to lowercase, remove duplicates
    const hashtags = [...new Set(
      matches.map(tag => tag.slice(1).toLowerCase())
    )];

    console.log('[Hashtag] Extracted:', hashtags);
    return hashtags;
  },

  /**
   * Get trending hashtags from last 7 days
   * @param {number} limit - Max number of hashtags to return
   * @returns {Array<{hashtag: string, count: number}>}
   */
  async getTrending(limit = 10) {
    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc('get_trending_hashtags', {
        limit_count: limit,
      });

      if (!error && data) {
        console.log('[Hashtag] Trending from RPC:', data.length);
        return data;
      }

      // Fallback: Manual query if RPC doesn't exist
      console.log('[Hashtag] RPC not available, using fallback');
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('hashtags')
        .not('hashtags', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(500);

      if (postsError) {
        console.error('[Hashtag] Fallback query error:', postsError);
        return [];
      }

      // Count hashtags manually
      const hashtagCounts = {};
      for (const post of (posts || [])) {
        if (Array.isArray(post.hashtags)) {
          for (const tag of post.hashtags) {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          }
        }
      }

      // Sort by count and return top N
      const trending = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      console.log('[Hashtag] Trending (fallback):', trending.length);
      return trending;
    } catch (error) {
      console.error('[Hashtag] Get trending error:', error);
      return [];
    }
  },

  /**
   * Get posts by hashtag
   * @param {string} hashtag - Hashtag to search (without #)
   * @param {number} page - Page number
   * @param {number} limit - Posts per page
   * @returns {Array} - Posts containing the hashtag
   */
  async getPostsByHashtag(hashtag, page = 1, limit = 20) {
    try {
      const normalizedTag = hashtag.toLowerCase().replace('#', '');

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `)
        .contains('hashtags', [normalizedTag])
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('[Hashtag] Get posts error:', error);
        return [];
      }

      // Transform with user_liked and user_saved
      const transformedPosts = (data || []).map((post) => ({
        ...post,
        user_liked: currentUserId ? post.likes?.some(l => l.user_id === currentUserId) : false,
        user_saved: currentUserId ? post.saved?.some(s => s.user_id === currentUserId) : false,
        likes_count: post.likes_count || post.likes?.length || 0,
      }));

      console.log(`[Hashtag] Found ${transformedPosts.length} posts for #${normalizedTag}`);
      return transformedPosts;
    } catch (error) {
      console.error('[Hashtag] Get posts by hashtag error:', error);
      return [];
    }
  },

  /**
   * Search hashtags by partial match
   * @param {string} query - Partial hashtag
   * @param {number} limit - Max results
   * @returns {Array<{hashtag: string, count: number}>}
   */
  async searchHashtags(query, limit = 10) {
    try {
      const normalizedQuery = query.toLowerCase().replace('#', '');

      // Get posts with hashtags containing the query
      const { data: posts, error } = await supabase
        .from('forum_posts')
        .select('hashtags')
        .not('hashtags', 'is', null)
        .limit(200);

      if (error) {
        console.error('[Hashtag] Search error:', error);
        return [];
      }

      // Filter and count matching hashtags
      const hashtagCounts = {};
      for (const post of (posts || [])) {
        if (Array.isArray(post.hashtags)) {
          for (const tag of post.hashtags) {
            if (tag.includes(normalizedQuery)) {
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            }
          }
        }
      }

      // Sort by count and return top N
      const results = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('[Hashtag] Search hashtags error:', error);
      return [];
    }
  },

  /**
   * Get hashtag count (total posts)
   * @param {string} hashtag
   * @returns {number}
   */
  async getHashtagCount(hashtag) {
    try {
      const normalizedTag = hashtag.toLowerCase().replace('#', '');

      const { count, error } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .contains('hashtags', [normalizedTag])
        .eq('status', 'published');

      if (error) {
        console.error('[Hashtag] Get count error:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[Hashtag] Get hashtag count error:', error);
      return 0;
    }
  },
};

export default hashtagService;
