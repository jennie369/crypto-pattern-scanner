/**
 * Gemral - Repost Service
 * Feature #10: Repost to Feed
 * Handles reposting posts with optional quotes
 */

import { supabase } from './supabase';

export const repostService = {
  /**
   * Repost a post (with optional quote)
   * @param {string} originalPostId - Original post ID
   * @param {string} quote - Optional quote text
   * @returns {Promise<object>}
   */
  async createRepost(originalPostId, quote = null) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already reposted
      const { data: existing } = await supabase
        .from('reposts')
        .select('id')
        .eq('original_post_id', originalPostId)
        .eq('reposter_id', user.id)
        .single();

      if (existing) {
        return { success: false, error: 'Ban da dang lai bai viet nay roi' };
      }

      // Create repost
      const { data, error } = await supabase
        .from('reposts')
        .insert({
          original_post_id: originalPostId,
          reposter_id: user.id,
          quote: quote?.trim() || null,
        })
        .select(`
          id,
          quote,
          created_at,
          original_post_id
        `)
        .single();

      if (error) throw error;

      // Fetch original post separately to avoid nested select issues
      const { data: originalPost } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          image_url,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', originalPostId)
        .single();

      // Combine data
      if (originalPost) {
        data.original_post = {
          id: originalPost.id,
          content: originalPost.content,
          images: originalPost.image_url ? [originalPost.image_url] : [],
          author: originalPost.profiles,
        };
      }

      // Increment repost count on original post
      await supabase.rpc('increment_repost_count', { p_post_id: originalPostId });

      console.log('[Repost] Created:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[Repost] Create error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove a repost
   * @param {string} originalPostId - Original post ID
   * @returns {Promise<object>}
   */
  async removeRepost(originalPostId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { error } = await supabase
        .from('reposts')
        .delete()
        .eq('original_post_id', originalPostId)
        .eq('reposter_id', user.id);

      if (error) throw error;

      // Decrement repost count
      await supabase.rpc('decrement_repost_count', { p_post_id: originalPostId });

      console.log('[Repost] Removed for post:', originalPostId);
      return { success: true };
    } catch (error) {
      console.error('[Repost] Remove error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if current user has reposted a post
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async hasReposted(postId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('reposts')
        .select('id')
        .eq('original_post_id', postId)
        .eq('reposter_id', user.id)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get reposts of a post
   * @param {string} postId - Post ID
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getPostReposts(postId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          quote,
          created_at,
          reposter:reposter_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('original_post_id', postId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Repost] Get reposts error:', error);
      return [];
    }
  },

  /**
   * Get reposts by a user
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getUserReposts(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          quote,
          created_at,
          original_post:original_post_id (
            id,
            content,
            images,
            like_count,
            comment_count,
            author:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('reposter_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Repost] Get user reposts error:', error);
      return [];
    }
  },

  /**
   * Get repost count for a post
   * @param {string} postId - Post ID
   * @returns {Promise<number>}
   */
  async getRepostCount(postId) {
    try {
      const { count, error } = await supabase
        .from('reposts')
        .select('id', { count: 'exact', head: true })
        .eq('original_post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get feed with reposts mixed in
   * @param {number} limit - Max results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<array>}
   */
  async getFeedWithReposts(limit = 20, offset = 0) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return [];

      // 'follows' table does not exist — show own posts only
      const followingIds = [user.id];

      // Get reposts from followed users
      const { data: reposts, error } = await supabase
        .from('reposts')
        .select(`
          id,
          quote,
          created_at,
          reposter:reposter_id (
            id,
            full_name,
            avatar_url
          ),
          original_post:original_post_id (
            id,
            content,
            images,
            like_count,
            comment_count,
            repost_count,
            author:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .in('reposter_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform to feed format
      return (reposts || []).map(repost => ({
        ...repost.original_post,
        is_repost: true,
        repost_id: repost.id,
        repost_quote: repost.quote,
        reposter: repost.reposter,
        reposted_at: repost.created_at,
      }));
    } catch (error) {
      console.error('[Repost] Get feed error:', error);
      return [];
    }
  },
};

// RPC functions for count management (run these in Supabase SQL editor)
/*
CREATE OR REPLACE FUNCTION increment_repost_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_repost_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

export default repostService;
