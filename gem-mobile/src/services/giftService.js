/**
 * Gemral - Gift Service
 * Feature #15: Gift Catalog
 * Handles gift operations - browse, send, receive
 */

import { supabase } from './supabase';
import walletService from './walletService';
import notificationService from './notificationService';

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

      // Check balance and spend gems from sender
      const spendResult = await walletService.spendGems(
        gift.gem_cost,
        `Gửi quà "${gift.name}"`,
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
        .select('id, gem_amount, message, is_anonymous, created_at')
        .single();

      if (sendError) throw sendError;

      // *** IMPORTANT: Add gems to recipient ***
      const receiveResult = await this._addGemsToRecipient(
        recipientId,
        gift.gem_cost,
        `Nhận quà "${gift.name}"${isAnonymous ? ' từ ẩn danh' : ''}`,
        sentGift.id,
        'gift_received',
        isAnonymous ? null : user.id // Pass sender ID for related_user_id
      );

      if (!receiveResult.success) {
        console.error('[Gift] Failed to add gems to recipient:', receiveResult.error);
        // Don't fail the gift send, just log the error
      }

      // Get sender info for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Send notification to recipient
      await this._sendGiftNotification(
        recipientId,
        {
          giftName: gift.name,
          giftImage: gift.image_url,
          gemAmount: gift.gem_cost,
          senderName: isAnonymous ? 'Ẩn danh' : (senderProfile?.full_name || 'Ai đó'),
          senderAvatar: isAnonymous ? null : senderProfile?.avatar_url,
          message,
          postId,
          sentGiftId: sentGift.id,
        }
      );

      // Return combined data manually
      sentGift.gift = {
        name: gift.name,
        image_url: gift.image_url,
        animation_url: gift.animation_url,
        is_animated: gift.is_animated,
      };

      console.log('[Gift] Sent:', sentGift.id, '- Recipient received:', gift.gem_cost, 'gems');
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

      // First get sent_gifts data
      const { data: gifts, error } = await supabase
        .from('sent_gifts')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[Gift] Get received gifts query error:', error.message, error.code);
        return [];
      }

      if (!gifts || gifts.length === 0) return [];

      // Fetch related data separately to avoid join errors
      const giftIds = [...new Set(gifts.map(g => g.gift_id).filter(Boolean))];
      const senderIds = [...new Set(gifts.map(g => g.sender_id).filter(Boolean))];

      const [catalogData, senderData] = await Promise.all([
        giftIds.length > 0
          ? supabase.from('gift_catalog').select('id, name, image_url, is_animated').in('id', giftIds)
          : { data: [] },
        senderIds.length > 0
          ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', senderIds)
          : { data: [] },
      ]);

      const giftMap = (catalogData.data || []).reduce((acc, g) => ({ ...acc, [g.id]: g }), {});
      const senderMap = (senderData.data || []).reduce((acc, s) => ({ ...acc, [s.id]: s }), {});

      // Combine data
      return gifts.map(g => ({
        ...g,
        gift: giftMap[g.gift_id] || { name: 'Quà tặng', image_url: null },
        sender: senderMap[g.sender_id] || { full_name: 'Người dùng', avatar_url: null },
        post: g.post_id ? { id: g.post_id } : null,
      }));
    } catch (error) {
      console.error('[Gift] Get received gifts error:', error.message);
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

      // First get sent_gifts data
      const { data: gifts, error } = await supabase
        .from('sent_gifts')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[Gift] Get sent gifts query error:', error.message, error.code);
        return [];
      }

      if (!gifts || gifts.length === 0) return [];

      // Fetch related data separately to avoid join errors
      const giftIds = [...new Set(gifts.map(g => g.gift_id).filter(Boolean))];
      const recipientIds = [...new Set(gifts.map(g => g.recipient_id).filter(Boolean))];

      const [catalogData, recipientData] = await Promise.all([
        giftIds.length > 0
          ? supabase.from('gift_catalog').select('id, name, image_url, is_animated').in('id', giftIds)
          : { data: [] },
        recipientIds.length > 0
          ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', recipientIds)
          : { data: [] },
      ]);

      const giftMap = (catalogData.data || []).reduce((acc, g) => ({ ...acc, [g.id]: g }), {});
      const recipientMap = (recipientData.data || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

      // Combine data
      return gifts.map(g => ({
        ...g,
        gift: giftMap[g.gift_id] || { name: 'Quà tặng', image_url: null },
        recipient: recipientMap[g.recipient_id] || { full_name: 'Người dùng', avatar_url: null },
        post: g.post_id ? { id: g.post_id } : null,
      }));
    } catch (error) {
      console.error('[Gift] Get sent gifts error:', error.message);
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

  /**
   * PRIVATE: Add gems to recipient's balance
   * @param {string} recipientId - Recipient user ID
   * @param {number} amount - Gem amount
   * @param {string} description - Description
   * @param {string} referenceId - Reference ID (sent_gift ID)
   * @param {string} referenceType - Reference type
   * @param {string} relatedUserId - Sender user ID (for transaction history)
   * @returns {Promise<object>}
   */
  async _addGemsToRecipient(recipientId, amount, description, referenceId, referenceType, relatedUserId = null) {
    try {
      console.log('[Gift] _addGemsToRecipient called:', { recipientId, amount, description, referenceId, referenceType, relatedUserId });

      // Try RPC function first (without related_user_id as it may not exist)
      // Note: RPC uses 'receive' type internally, which matches the CHECK constraint
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('receive_gems', {
          p_recipient_id: recipientId,
          p_amount: amount,
          p_description: description,
          p_reference_id: referenceId || null,
          p_reference_type: referenceType || 'gift',
        });

      if (rpcError) {
        console.warn('[Gift] RPC receive_gems error, using fallback:', rpcError.message, rpcError.code, rpcError.details, rpcError.hint);
        // Fallback: direct update to profiles.gems
        const fallbackResult = await this._addGemsFallback(recipientId, amount, description, referenceId, referenceType);
        console.log('[Gift] Fallback result:', fallbackResult);
        return fallbackResult;
      }

      console.log('[Gift] Added gems to recipient via RPC:', amount, 'result:', rpcResult);
      return { success: true };
    } catch (error) {
      console.error('[Gift] Add gems to recipient error:', error.message);
      // Try fallback on any error
      console.log('[Gift] Trying fallback due to exception...');
      return await this._addGemsFallback(recipientId, amount, description, referenceId, referenceType);
    }
  },

  /**
   * PRIVATE: Fallback method for adding gems
   * NOTE: This fallback may fail due to RLS policies (can't update other user's profile)
   * The main approach should be the receive_gems RPC which uses SECURITY DEFINER
   */
  async _addGemsFallback(recipientId, amount, description, referenceId, referenceType) {
    try {
      console.log('[Gift] _addGemsFallback called:', { recipientId, amount, description });

      // Get current balance (this read should work due to public SELECT policy)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', recipientId)
        .single();

      if (profileError) {
        console.error('[Gift] Failed to get recipient profile:', profileError.message, profileError.code);
        // If profile doesn't exist, we can't add gems - this is a critical error
        if (profileError.code === 'PGRST116') {
          return { success: false, error: 'Recipient profile not found' };
        }
      }

      const currentBalance = profile?.gems || 0;
      console.log('[Gift] Recipient current balance:', currentBalance, '-> new balance:', currentBalance + amount);

      // Try to update profiles.gems
      // NOTE: This may fail due to RLS (users can only update own profile)
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ gems: currentBalance + amount })
        .eq('id', recipientId)
        .select('gems');

      if (updateError) {
        console.error('[Gift] Direct profile update failed (likely RLS):', updateError.message, updateError.code);
        // This is expected to fail due to RLS - log but continue
        // The user needs to run the migration to create receive_gems RPC
        console.warn('[Gift] ⚠️ IMPORTANT: Run migration 20251212_fix_gift_receive_gems.sql on Supabase!');

        // Record transaction anyway so it shows in history (for debugging)
        try {
          await supabase.from('gems_transactions').insert({
            user_id: recipientId,
            type: 'receive',
            amount: amount,
            description: `[PENDING] ${description}`,
            reference_id: referenceId || null,
            reference_type: referenceType || 'gift',
          });
        } catch (e) {
          // Ignore
        }

        return { success: false, error: 'RLS blocked update - run migration' };
      }

      console.log('[Gift] Profile update result:', updateData);

      // Also try to update user_wallets for backwards compatibility
      try {
        const { data: wallet } = await supabase
          .from('user_wallets')
          .select('gem_balance, total_earned')
          .eq('user_id', recipientId)
          .single();

        if (wallet) {
          await supabase
            .from('user_wallets')
            .update({
              gem_balance: (wallet.gem_balance || 0) + amount,
              total_earned: (wallet.total_earned || 0) + amount,
            })
            .eq('user_id', recipientId);
        }
      } catch (walletErr) {
        console.log('[Gift] user_wallets update skipped (non-critical)');
      }

      // Record transaction in gems_transactions
      // IMPORTANT: Use 'receive' type to match CHECK constraint: ('spend', 'receive', 'purchase', 'bonus', 'refund')
      try {
        const { error: txError } = await supabase.from('gems_transactions').insert({
          user_id: recipientId,
          type: 'receive', // Must match CHECK constraint, not 'gift_received'
          amount: amount, // Positive amount for receiving
          description,
          reference_id: referenceId || null,
          reference_type: referenceType || 'gift',
        });
        if (txError) {
          console.warn('[Gift] Transaction record failed:', txError.message, txError.code, txError.hint);
        } else {
          console.log('[Gift] Transaction record created successfully');
        }
      } catch (txErr) {
        console.warn('[Gift] Transaction record exception:', txErr.message);
      }

      console.log('[Gift] Successfully added gems via fallback:', amount, 'to recipient:', recipientId);
      return { success: true };
    } catch (error) {
      console.error('[Gift] Fallback add gems error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * PRIVATE: Send notification to gift recipient
   * @param {string} recipientId - Recipient user ID
   * @param {object} giftData - Gift data for notification
   */
  async _sendGiftNotification(recipientId, giftData) {
    try {
      const { giftName, giftImage, gemAmount, senderName, senderAvatar, message, postId, sentGiftId } = giftData;

      const notifTitle = `🎁 Bạn nhận được quà!`;
      const notifBody = `${senderName} đã tặng bạn ${giftName} (${gemAmount} gems)${message ? `: "${message}"` : ''}`;
      const notifData = {
        type: 'gift_received',
        gift_name: giftName,
        gift_image: giftImage,
        gem_amount: gemAmount,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        message,
        post_id: postId,
        sent_gift_id: sentGiftId,
      };

      // 1. Insert notification record in database (for in-app notification display)
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'gift_received',
          title: notifTitle,
          body: notifBody,
          data: notifData,
          read: false,
        });

      if (notifError) {
        console.warn('[Gift] Failed to insert notification:', notifError);
      }

      // 2. Send PUSH notification to recipient's device(s)
      // This uses Expo Push API to send to recipient's registered devices
      try {
        const pushResult = await notificationService.sendPushToUser(
          recipientId,
          `🎁 ${senderName} tặng bạn ${giftName}!`,
          `Bạn nhận được ${gemAmount} gems${message ? `: "${message}"` : ''}`,
          {
            type: 'gift_received',
            postId,
            sentGiftId,
          }
        );

        if (pushResult.success) {
          console.log('[Gift] Push notification sent to recipient');
        } else {
          console.log('[Gift] Push notification not sent:', pushResult.error);
        }
      } catch (pushError) {
        console.warn('[Gift] Push notification error:', pushError);
      }

      console.log('[Gift] Notification sent to recipient');
    } catch (error) {
      console.error('[Gift] Send notification error:', error);
      // Don't throw - notification failure shouldn't fail the gift send
    }
  },

  /**
   * Get user's gift statistics
   * @returns {Promise<object>}
   */
  async getGiftStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalSent: 0, totalReceived: 0, gemsSent: 0, gemsReceived: 0 };

      // Get sent gifts stats
      const { data: sentData } = await supabase
        .from('sent_gifts')
        .select('gem_amount')
        .eq('sender_id', user.id);

      // Get received gifts stats
      const { data: receivedData } = await supabase
        .from('sent_gifts')
        .select('gem_amount')
        .eq('recipient_id', user.id);

      const totalSent = sentData?.length || 0;
      const totalReceived = receivedData?.length || 0;
      const gemsSent = (sentData || []).reduce((sum, g) => sum + g.gem_amount, 0);
      const gemsReceived = (receivedData || []).reduce((sum, g) => sum + g.gem_amount, 0);

      return { totalSent, totalReceived, gemsSent, gemsReceived };
    } catch (error) {
      console.error('[Gift] Get stats error:', error);
      return { totalSent: 0, totalReceived: 0, gemsSent: 0, gemsReceived: 0 };
    }
  },
};

export default giftService;
