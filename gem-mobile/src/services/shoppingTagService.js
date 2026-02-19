/**
 * Gemral - Shopping Tag Service
 * Feature #1: Shopping Tags (Tag Products in Posts)
 * Handles product tagging on post images
 */

import { supabase } from './supabase';

export const shoppingTagService = {
  /**
   * Get shopping tags for a post
   * @param {string} postId - Post ID
   * @returns {Promise<array>}
   */
  async getPostTags(postId) {
    try {
      const { data, error } = await supabase
        .from('shopping_tags')
        .select('*')
        .eq('post_id', postId)
        .order('image_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ShoppingTag] Get tags error:', error);
      return [];
    }
  },

  /**
   * Add a product tag to a post image
   * @param {object} params - Tag parameters
   * @param {string} params.postId - Post ID
   * @param {string} params.productId - Product ID/SKU
   * @param {string} params.productName - Product name
   * @param {number} params.productPrice - Product price
   * @param {string} params.productImage - Product image URL
   * @param {string} params.productUrl - Product link
   * @param {string} params.source - Source ('manual', 'shopify', 'shopee')
   * @param {number} params.xPosition - X position (0-1)
   * @param {number} params.yPosition - Y position (0-1)
   * @param {number} params.imageIndex - Image index in post
   * @returns {Promise<object>}
   */
  async addTag({
    postId,
    productId,
    productName,
    productPrice,
    productImage,
    productUrl,
    source = 'manual',
    xPosition,
    yPosition,
    imageIndex = 0,
  }) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify user owns the post
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post?.user_id !== user.id) {
        return { success: false, error: 'Khong co quyen them tag' };
      }

      const { data, error } = await supabase
        .from('shopping_tags')
        .insert({
          post_id: postId,
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          product_image: productImage,
          product_url: productUrl,
          source,
          x_position: xPosition,
          y_position: yPosition,
          image_index: imageIndex,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[ShoppingTag] Added tag:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[ShoppingTag] Add tag error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove a product tag
   * @param {string} tagId - Tag ID
   * @returns {Promise<object>}
   */
  async removeTag(tagId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { error } = await supabase
        .from('shopping_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      console.log('[ShoppingTag] Removed tag:', tagId);
      return { success: true };
    } catch (error) {
      console.error('[ShoppingTag] Remove tag error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update tag position
   * @param {string} tagId - Tag ID
   * @param {number} xPosition - New X position
   * @param {number} yPosition - New Y position
   * @returns {Promise<object>}
   */
  async updateTagPosition(tagId, xPosition, yPosition) {
    try {
      const { data, error } = await supabase
        .from('shopping_tags')
        .update({
          x_position: xPosition,
          y_position: yPosition,
        })
        .eq('id', tagId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[ShoppingTag] Update position error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get posts with shopping tags (for discovery)
   * @param {number} limit - Max results
   * @param {number} offset - Offset
   * @returns {Promise<array>}
   */
  async getShoppablePosts(limit = 20, offset = 0) {
    try {
      // Get unique post IDs that have shopping tags
      const { data: taggedPosts, error: tagError } = await supabase
        .from('shopping_tags')
        .select('post_id')
        .limit(limit * 2); // Get more to account for duplicates

      if (tagError) throw tagError;

      const postIds = [...new Set(taggedPosts?.map(t => t.post_id) || [])].slice(0, limit);

      if (postIds.length === 0) return [];

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          images,
          created_at,
          author:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ShoppingTag] Get shoppable posts error:', error);
      return [];
    }
  },

  /**
   * Search products for tagging (placeholder - would connect to product catalog)
   * @param {string} query - Search query
   * @returns {Promise<array>}
   */
  async searchProducts(query) {
    // This would typically connect to your product catalog or Shopify/Shopee API
    // For now, return empty array - implement based on your product source
    console.log('[ShoppingTag] Search products:', query);
    return [];
  },

  /**
   * Check if post has shopping tags
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async hasShoppingTags(postId) {
    try {
      const { count, error } = await supabase
        .from('shopping_tags')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get tag count for a post
   * @param {string} postId - Post ID
   * @returns {Promise<number>}
   */
  async getTagCount(postId) {
    try {
      const { count, error } = await supabase
        .from('shopping_tags')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },
};

export default shoppingTagService;
