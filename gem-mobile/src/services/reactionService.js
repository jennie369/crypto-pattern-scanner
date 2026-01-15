/**
 * Reaction Service
 * Handles all post reaction-related API calls
 *
 * Tables used:
 * - post_reactions (main table)
 * - forum_posts (for reaction_counts)
 * - post_reactions_with_users (view for user info)
 */

import { supabase } from './supabase';
import {
  REACTION_TYPES,
  REACTION_ORDER,
  DEFAULT_REACTION_COUNTS,
} from '../constants/reactions';

/**
 * Validate reaction type
 * @param {string} type - Reaction type to validate
 * @returns {boolean} True if valid
 */
const isValidReactionType = (type) => {
  const validTypes = Object.values(REACTION_TYPES);
  return validTypes.includes(type?.toLowerCase?.());
};

/**
 * Reaction Service class
 */
class ReactionService {
  /**
   * Get user's reaction for a specific post
   * Supports both forum_posts and seed_posts
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Object|null} Reaction object or null
   */
  async getUserReaction(postId, userId) {
    if (!postId || !userId) {
      console.warn('[ReactionService] getUserReaction: Missing postId or userId');
      return null;
    }

    try {
      // Try to find reaction by post_id first
      let { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      // If not found, try seed_post_id
      if (!data && !error) {
        const result = await supabase
          .from('post_reactions')
          .select('*')
          .eq('seed_post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[ReactionService] getUserReaction error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('[ReactionService] getUserReaction failed:', err);
      throw err;
    }
  }

  /**
   * Add or update a reaction (upsert)
   * Supports both forum_posts and seed_posts
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @param {string} reactionType - Reaction type (like, love, haha, wow, sad, angry)
   * @param {boolean} isSeedPost - Whether this is a seed post (optional, auto-detected)
   * @returns {Object} Created/updated reaction
   */
  async addReaction(postId, userId, reactionType, isSeedPost = null) {
    if (!postId || !userId) {
      throw new Error('Thiếu thông tin bài viết hoặc người dùng');
    }

    const normalizedType = reactionType?.toLowerCase?.();
    if (!isValidReactionType(normalizedType)) {
      throw new Error(`Loại cảm xúc không hợp lệ: ${reactionType}`);
    }

    try {
      // Auto-detect if it's a seed post by checking both tables
      let detectedIsSeedPost = isSeedPost;

      if (detectedIsSeedPost === null) {
        // Check if post exists in forum_posts
        const { data: forumPost } = await supabase
          .from('forum_posts')
          .select('id')
          .eq('id', postId)
          .maybeSingle();

        if (forumPost) {
          detectedIsSeedPost = false;
        } else {
          // Check if post exists in seed_posts
          const { data: seedPost } = await supabase
            .from('seed_posts')
            .select('id')
            .eq('id', postId)
            .maybeSingle();

          if (seedPost) {
            detectedIsSeedPost = true;
          } else {
            throw new Error('Bài viết không tồn tại hoặc đã bị xóa');
          }
        }
      }

      // Build upsert data based on post type
      const upsertData = {
        user_id: userId,
        reaction_type: normalizedType,
        updated_at: new Date().toISOString(),
      };

      // Use correct column based on post type
      if (detectedIsSeedPost) {
        upsertData.seed_post_id = postId;
        upsertData.post_id = null;
      } else {
        upsertData.post_id = postId;
        upsertData.seed_post_id = null;
      }

      // Determine conflict constraint
      const onConflict = detectedIsSeedPost
        ? 'seed_post_id,user_id'
        : 'post_id,user_id';

      console.log('[ReactionService] Adding reaction:', {
        postId,
        isSeedPost: detectedIsSeedPost,
        onConflict,
      });

      const { data, error } = await supabase
        .from('post_reactions')
        .upsert(upsertData, { onConflict })
        .select()
        .single();

      if (error) {
        // Handle foreign key violation
        if (error.code === '23503') {
          console.warn('[ReactionService] FK violation:', postId, error);
          throw new Error('Bài viết không tồn tại hoặc đã bị xóa');
        }
        console.error('[ReactionService] addReaction error:', error);
        throw error;
      }

      console.log('[ReactionService] Reaction added:', data);
      return data;
    } catch (err) {
      console.error('[ReactionService] addReaction failed:', err);
      throw err;
    }
  }

  /**
   * Remove a reaction
   * Supports both forum_posts and seed_posts
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  async removeReaction(postId, userId) {
    if (!postId || !userId) {
      throw new Error('Thiếu thông tin bài viết hoặc người dùng');
    }

    try {
      // Try to delete by post_id first
      let { error, count } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // If nothing deleted, try seed_post_id
      if (!error && count === 0) {
        const result = await supabase
          .from('post_reactions')
          .delete()
          .eq('seed_post_id', postId)
          .eq('user_id', userId);

        error = result.error;
      }

      if (error) {
        console.error('[ReactionService] removeReaction error:', error);
        throw error;
      }

      console.log('[ReactionService] Reaction removed for post:', postId);
      return true;
    } catch (err) {
      console.error('[ReactionService] removeReaction failed:', err);
      throw err;
    }
  }

  /**
   * Get all reactions for a post with user info
   * @param {string} postId - Post ID
   * @param {string|null} filterType - Optional reaction type filter
   * @param {number} limit - Maximum results (default 50)
   * @param {number} offset - Pagination offset (default 0)
   * @returns {Array} List of reactions with user info
   */
  async getPostReactions(postId, filterType = null, limit = 50, offset = 0) {
    if (!postId) {
      throw new Error('Thiếu thông tin bài viết');
    }

    if (filterType && !isValidReactionType(filterType)) {
      throw new Error(`Loại cảm xúc không hợp lệ: ${filterType}`);
    }

    try {
      let query = supabase
        .from('post_reactions_with_users')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filterType) {
        query = query.eq('reaction_type', filterType.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ReactionService] getPostReactions error:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('[ReactionService] getPostReactions failed:', err);
      throw err;
    }
  }

  /**
   * Get reaction counts for a post
   * Supports both forum_posts and seed_posts
   * @param {string} postId - Post ID
   * @returns {Object} Reaction counts object
   */
  async getReactionCounts(postId) {
    if (!postId) {
      throw new Error('Thiếu thông tin bài viết');
    }

    try {
      // Try forum_posts first
      let { data, error } = await supabase
        .from('forum_posts')
        .select('reaction_counts')
        .eq('id', postId)
        .maybeSingle();

      // If not found, try seed_posts
      if (!data && !error) {
        const result = await supabase
          .from('seed_posts')
          .select('reaction_counts')
          .eq('id', postId)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('[ReactionService] getReactionCounts error:', error);
        throw error;
      }

      return data?.reaction_counts || { ...DEFAULT_REACTION_COUNTS };
    } catch (err) {
      console.error('[ReactionService] getReactionCounts failed:', err);
      throw err;
    }
  }

  /**
   * Get user's reactions across multiple posts (for feed optimization)
   * Supports both forum_posts and seed_posts
   * @param {string} userId - User ID
   * @param {Array<string>} postIds - Array of post IDs
   * @returns {Object} Map of postId -> reaction_type
   */
  async getUserReactionsForPosts(userId, postIds) {
    if (!userId || !postIds?.length) {
      return {};
    }

    try {
      // Get reactions by post_id
      const { data: forumReactions, error: forumError } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', userId)
        .in('post_id', postIds);

      if (forumError) {
        console.error('[ReactionService] getUserReactionsForPosts forum error:', forumError);
      }

      // Get reactions by seed_post_id
      const { data: seedReactions, error: seedError } = await supabase
        .from('post_reactions')
        .select('seed_post_id, reaction_type')
        .eq('user_id', userId)
        .in('seed_post_id', postIds);

      if (seedError) {
        console.error('[ReactionService] getUserReactionsForPosts seed error:', seedError);
      }

      // Convert to map for easy lookup
      const reactionsMap = {};

      // Add forum post reactions
      (forumReactions || []).forEach((item) => {
        if (item.post_id) {
          reactionsMap[item.post_id] = item.reaction_type;
        }
      });

      // Add seed post reactions
      (seedReactions || []).forEach((item) => {
        if (item.seed_post_id) {
          reactionsMap[item.seed_post_id] = item.reaction_type;
        }
      });

      return reactionsMap;
    } catch (err) {
      console.error('[ReactionService] getUserReactionsForPosts failed:', err);
      throw err;
    }
  }

  /**
   * Subscribe to reaction changes for a post (realtime)
   * @param {string} postId - Post ID
   * @param {Function} callback - Callback function (payload) => void
   * @returns {Object} Supabase channel subscription
   */
  subscribeToReactions(postId, callback) {
    if (!postId || typeof callback !== 'function') {
      console.warn('[ReactionService] subscribeToReactions: Invalid params');
      return null;
    }

    const channel = supabase
      .channel(`post-reactions:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log('[ReactionService] Realtime reaction update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Subscribe to post reaction_counts changes (realtime)
   * @param {string} postId - Post ID
   * @param {Function} callback - Callback function (counts) => void
   * @returns {Object} Supabase channel subscription
   */
  subscribeToReactionCounts(postId, callback) {
    if (!postId || typeof callback !== 'function') {
      console.warn('[ReactionService] subscribeToReactionCounts: Invalid params');
      return null;
    }

    const channel = supabase
      .channel(`post-counts:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          if (payload.new?.reaction_counts) {
            console.log('[ReactionService] Reaction counts updated:', payload.new.reaction_counts);
            callback(payload.new.reaction_counts);
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from a channel
   * @param {Object} channel - Supabase channel to remove
   */
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  /**
   * Get top reactions for a post (sorted by count)
   * @param {Object} reactionCounts - Reaction counts object
   * @param {number} limit - Max reactions to return (default 3)
   * @returns {Array} Array of {type, count} objects
   */
  getTopReactions(reactionCounts, limit = 3) {
    if (!reactionCounts || typeof reactionCounts !== 'object') {
      return [];
    }

    return REACTION_ORDER
      .filter((type) => (reactionCounts[type] || 0) > 0)
      .sort((a, b) => (reactionCounts[b] || 0) - (reactionCounts[a] || 0))
      .slice(0, limit)
      .map((type) => ({
        type,
        count: reactionCounts[type] || 0,
      }));
  }

  /**
   * Format reaction count for display (1K, 1.2M, etc.)
   * @param {number} count - Count to format
   * @returns {string} Formatted string
   */
  formatCount(count) {
    if (!count || typeof count !== 'number') return '0';

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

// Export singleton instance
export const reactionService = new ReactionService();
export default reactionService;
