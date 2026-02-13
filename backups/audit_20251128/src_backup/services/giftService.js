/**
 * Gemral - Gift Service
 * Feature #15: Gift Catalog
 * Handles gift operations - browse, send, receive
 */

import { supabase } from './supabase';
import walletService from './walletService';

export const giftService = {
  /**
   * Get gift catalog
   * @param {string} category - Filter by category (optional)
   * @returns {Promise<array>}
   */
  async getGiftCatalog(category = null) {
    try {
      let query = supabase
        .from('gift_catalog')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Gift] Get catalog error:', error);
      return [];
    }
  },

  /**
   * Get gift categories with counts
   * @returns {Promise<array>}
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('gift_catalog')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      // Count by category
      const counts = (data || []).reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      // Format categories
      const categories = [
        { id: 'all', name: 'Tất cả', count: data?.length || 0 },
        { id: 'standard', name: 'Cơ bản', count: counts.standard || 0 },
        { id: 'premium', name: 'Cao cấp', count: counts.premium || 0 },
        { id: 'luxury', name: 'Sang trọng', count: counts.luxury || 0 },
        { id: 'animated', name: 'Có hiệu ứng', count: counts.animated || 0 },
        { id: 'limited', name: 'Giới hạn', count: counts.limited || 0 },
      ].filter(c => c.count > 0 || c.id === 'all');

      return categories;
    } catch (error) {
      console.error('[Gift] Get categories error:', error);
      return [{ id: 'all', name: 'Tất cả', count: 0 }];
    }
  },

  /**
   * Send a gift
   * @param {object} params - Gift parameters
   * @param {string} params.giftId - Gift ID
   * @param {string} params.recipientId - Recipient user ID
   * @param {string} params.postId - Post ID (optional)
   * @param {string} params.streamId - Stream ID (optional)
   * @param {string} params.message - Gift message (optional)
   * @param {boolean} params.isAnonymous - Send anonymously
   * @returns {Promise<object>}
   */
  async sendGift({
    giftId,
    recipientId,
    postId = null,
    streamId = null,
    message = null,
    isAnonymous = false,
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Can't send gift to yourself
      if (user.id === recipientId) {
        return { success: false, error: 'Khong the gui qua cho chinh ban' };
      }

      // Get gift details
      const { data: gift, error: giftError } = await supabase
        .from('gift_catalog')
        .select('*')
        .eq('id', giftId)
        .single();

      if (giftError || !gift) {
        return { success: false, error: 'Qua khong ton tai' };
      }

      // Check balance and spend gems
      const spendResult = await walletService.spendGems(
        gift.gem_cost,
        `Gui qua "${gift.name}"`,
        giftId,
        'gift'
      );

      if (!spendResult.success) {
        return spendResult;
      }

      // Create sent gift record
      const { data: sentGift, error: sendError } = await supabase
        .from('sent_gifts')
        .insert({
          gift_id: giftId,
          sender_id: user.id,
          recipient_id: recipientId,
          post_id: postId,
          stream_id: streamId,
          gem_amount: gift.gem_cost,
          message,
          is_anonymous: isAnonymous,
        })
        .select(`
          id,
          gem_amount,
          message,
          is_anonymous,
          created_at,
          gift:gift_id (
            name,
            image_url,
            animation_url,
            is_animated
          ),
          recipient:recipient_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (sendError) throw sendError;

      console.log('[Gift] Sent:', sentGift.id);
      return { success: true, data: sentGift };
    } catch (error) {
      console.error('[Gift] Send error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get gifts received on a post
   * @param {string} postId - Post ID
   * @returns {Promise<array>}
   */
  async getPostGifts(postId) {
    try {
      const { data, error } = await supabase
        .from('sent_gifts')
        .select(`
          id,
          gem_amount,
          message,
          is_anonymous,
          created_at,
          gift:gift_id (
            name,
            image_url,
            is_animated
          ),
          sender:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Gift] Get post gifts error:', error);
      return [];
    }
  },

  /**
   * Get gifts received by user
   * @param {number} limit - Max results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<array>}
   */
  async getReceivedGifts(limit = 20, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('sent_gifts')
        .select(`
          id,
          gem_amount,
          message,
          is_anonymous,
          created_at,
          gift:gift_id (
            name,
            image_url,
            is_animated
          ),
          sender:sender_id (
            id,
            full_name,
            avatar_url
          ),
          post:post_id (
            id,
            content
          )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Gift] Get received gifts error:', error);
      return [];
    }
  },

  /**
   * Get gifts sent by user
   * @param {number} limit - Max results
   * @param {number} offset - Offset
   * @returns {Promise<array>}
   */
  async getSentGifts(limit = 20, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('sent_gifts')
        .select(`
          id,
          gem_amount,
          message,
          is_anonymous,
          created_at,
          gift:gift_id (
            name,
            image_url,
            is_animated
          ),
          recipient:recipient_id (
            id,
            full_name,
            avatar_url
          ),
          post:post_id (
            id,
            content
          )
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Gift] Get sent gifts error:', error);
      return [];
    }
  },

  /**
   * Get total gifts received on a post (aggregated)
   * @param {string} postId - Post ID
   * @returns {Promise<object>}
   */
  async getPostGiftSummary(postId) {
    try {
      const { data, error } = await supabase
        .from('sent_gifts')
        .select('gem_amount, gift:gift_id(image_url)')
        .eq('post_id', postId);

      if (error) throw error;

      const totalGems = (data || []).reduce((sum, g) => sum + g.gem_amount, 0);
      const giftImages = [...new Set((data || []).map(g => g.gift?.image_url).filter(Boolean))].slice(0, 3);

      return {
        count: data?.length || 0,
        totalGems,
        giftImages,
      };
    } catch (error) {
      console.error('[Gift] Get summary error:', error);
      return { count: 0, totalGems: 0, giftImages: [] };
    }
  },

  /**
   * Get gift by ID
   * @param {string} giftId - Gift ID
   * @returns {Promise<object|null>}
   */
  async getGift(giftId) {
    try {
      const { data, error } = await supabase
        .from('gift_catalog')
        .select('*')
        .eq('id', giftId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Gift] Get gift error:', error);
      return null;
    }
  },

  /**
   * Get top gifters for a user
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getTopGifters(userId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('sent_gifts')
        .select(`
          sender_id,
          gem_amount,
          sender:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .eq('is_anonymous', false);

      if (error) throw error;

      // Aggregate by sender
      const aggregated = (data || []).reduce((acc, gift) => {
        const senderId = gift.sender_id;
        if (!acc[senderId]) {
          acc[senderId] = {
            sender: gift.sender,
            totalGems: 0,
            giftCount: 0,
          };
        }
        acc[senderId].totalGems += gift.gem_amount;
        acc[senderId].giftCount += 1;
        return acc;
      }, {});

      // Sort by total gems
      return Object.values(aggregated)
        .sort((a, b) => b.totalGems - a.totalGems)
        .slice(0, limit);
    } catch (error) {
      console.error('[Gift] Get top gifters error:', error);
      return [];
    }
  },
};

export default giftService;
