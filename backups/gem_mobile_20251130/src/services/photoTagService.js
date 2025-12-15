/**
 * Gemral - Photo Tag Service
 * Handles tagging users in photos
 */

import { supabase } from './supabase';

export const photoTagService = {
  /**
   * Add a tag to a photo
   * @param {object} tag - Tag data { postId, imageIndex, taggedUserId, xPosition, yPosition }
   */
  async addTag({ postId, imageIndex = 0, taggedUserId, xPosition, yPosition }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already tagged
      const { data: existing } = await supabase
        .from('photo_tags')
        .select('id')
        .eq('post_id', postId)
        .eq('image_index', imageIndex)
        .eq('tagged_user_id', taggedUserId)
        .single();

      if (existing) {
        return { success: false, error: 'Nguoi dung da duoc tag trong anh nay' };
      }

      // Add tag
      const { data, error } = await supabase
        .from('photo_tags')
        .insert({
          post_id: postId,
          image_index: imageIndex,
          tagged_user_id: taggedUserId,
          x_position: xPosition,
          y_position: yPosition,
          created_by: user.id,
        })
        .select(`
          *,
          tagged_user:profiles!tagged_user_id(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      console.log('[PhotoTagService] Tag added:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[PhotoTagService] Add tag error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove a tag
   * @param {string} tagId - Tag ID to remove
   */
  async removeTag(tagId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Only creator or tagged user can remove
      const { data: tag } = await supabase
        .from('photo_tags')
        .select('created_by, tagged_user_id')
        .eq('id', tagId)
        .single();

      if (!tag) {
        return { success: false, error: 'Tag khong ton tai' };
      }

      if (tag.created_by !== user.id && tag.tagged_user_id !== user.id) {
        return { success: false, error: 'Khong co quyen xoa tag nay' };
      }

      const { error } = await supabase
        .from('photo_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      console.log('[PhotoTagService] Tag removed:', tagId);
      return { success: true };
    } catch (error) {
      console.error('[PhotoTagService] Remove tag error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all tags for a post
   * @param {string} postId - Post ID
   */
  async getTagsForPost(postId) {
    try {
      const { data, error } = await supabase
        .from('photo_tags')
        .select(`
          *,
          tagged_user:profiles!tagged_user_id(id, full_name, email, avatar_url)
        `)
        .eq('post_id', postId)
        .order('image_index')
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[PhotoTagService] Get tags error:', error);
      return [];
    }
  },

  /**
   * Get tags for a specific image in a post
   * @param {string} postId - Post ID
   * @param {number} imageIndex - Image index
   */
  async getTagsForImage(postId, imageIndex) {
    try {
      const { data, error } = await supabase
        .from('photo_tags')
        .select(`
          *,
          tagged_user:profiles!tagged_user_id(id, full_name, email, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('image_index', imageIndex)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[PhotoTagService] Get image tags error:', error);
      return [];
    }
  },

  /**
   * Get posts where current user is tagged
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   */
  async getTaggedPosts(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return { data: [], count: 0 };

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('photo_tags')
        .select(`
          *,
          post:forum_posts(
            *,
            author:profiles!user_id(id, full_name, email, avatar_url)
          )
        `, { count: 'exact' })
        .eq('tagged_user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Extract unique posts
      const postsMap = new Map();
      (data || []).forEach(tag => {
        if (tag.post && !postsMap.has(tag.post.id)) {
          postsMap.set(tag.post.id, tag.post);
        }
      });

      return {
        data: Array.from(postsMap.values()),
        count: count || 0
      };
    } catch (error) {
      console.error('[PhotoTagService] Get tagged posts error:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Search users for tagging
   * @param {string} query - Search query
   * @param {number} limit - Max results
   */
  async searchUsersForTagging(query, limit = 10) {
    try {
      if (!query || query.trim().length < 1) return [];

      const searchTerm = query.trim().toLowerCase();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[PhotoTagService] Search users error:', error);
      return [];
    }
  },

  /**
   * Get tag count for a post (for display in PostCard)
   * @param {string} postId - Post ID
   */
  async getTagCount(postId) {
    try {
      const { count, error } = await supabase
        .from('photo_tags')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[PhotoTagService] Get tag count error:', error);
      return 0;
    }
  },
};

export default photoTagService;
