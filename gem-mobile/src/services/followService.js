/**
 * Gemral - Follow Service
 * Handles all follow/unfollow related API calls
 * Extracted and enhanced from forumService.js
 *
 * Uses user_follows table (section 9.6 in DATABASE_SCHEMA.md)
 */

import { supabase } from './supabase';

export const followService = {
  // ==========================================
  // FOLLOW/UNFOLLOW ACTIONS
  // ==========================================

  /**
   * Follow a user
   * @param {string} userId - User ID to follow
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  async followUser(userId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) throw new Error('Chưa đăng nhập');

      // Prevent following yourself
      if (user.id === userId) {
        return { success: false, error: 'Không thể follow chính mình' };
      }

      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (existing) {
        console.log('[Follow] Already following, skipping');
        return { success: true, alreadyFollowing: true };
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      // Create follow notification
      await this.createFollowNotification(userId);

      console.log('[Follow] ✅ Followed user:', userId);
      return { success: true };
    } catch (error) {
      console.error('[Follow] Error following user:', error);
      return { success: false, error };
    }
  },

  /**
   * Unfollow a user
   * @param {string} userId - User ID to unfollow
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  async unfollowUser(userId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      console.log('[Follow] ✅ Unfollowed user:', userId);
      return { success: true };
    } catch (error) {
      console.error('[Follow] Error unfollowing user:', error);
      return { success: false, error };
    }
  },

  /**
   * Toggle follow status
   * @param {string} userId - User ID to toggle follow
   * @returns {Promise<{success: boolean, isFollowing: boolean, error?: any}>}
   */
  async toggleFollow(userId) {
    try {
      const isCurrentlyFollowing = await this.checkFollowStatus(userId);

      if (isCurrentlyFollowing) {
        const result = await this.unfollowUser(userId);
        return { ...result, isFollowing: false };
      } else {
        const result = await this.followUser(userId);
        return { ...result, isFollowing: true };
      }
    } catch (error) {
      console.error('[Follow] Toggle error:', error);
      return { success: false, isFollowing: false, error };
    }
  },

  // ==========================================
  // STATUS CHECKS
  // ==========================================

  /**
   * Check if current user is following a specific user
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>}
   */
  async checkFollowStatus(userId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check mutual follow status (both users follow each other)
   * @param {string} userId - User ID to check
   * @returns {Promise<{isFollowing: boolean, isFollowedBy: boolean, isMutual: boolean}>}
   */
  async checkMutualFollow(userId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { isFollowing: false, isFollowedBy: false, isMutual: false };
      }

      // Check both directions in parallel
      const [followingResult, followedByResult] = await Promise.all([
        supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .single(),
        supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', user.id)
          .single(),
      ]);

      const isFollowing = !followingResult.error && !!followingResult.data;
      const isFollowedBy = !followedByResult.error && !!followedByResult.data;

      return {
        isFollowing,
        isFollowedBy,
        isMutual: isFollowing && isFollowedBy,
      };
    } catch (error) {
      console.error('[Follow] Mutual check error:', error);
      return { isFollowing: false, isFollowedBy: false, isMutual: false };
    }
  },

  // ==========================================
  // COUNTS
  // ==========================================

  /**
   * Get followers count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowersCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[Follow] Get followers count error:', error);
      return 0;
    }
  },

  /**
   * Get following count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowingCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[Follow] Get following count error:', error);
      return 0;
    }
  },

  /**
   * Get both followers and following counts in one call
   * @param {string} userId - User ID
   * @returns {Promise<{followersCount: number, followingCount: number}>}
   */
  async getFollowCounts(userId) {
    try {
      const [followersCount, followingCount] = await Promise.all([
        this.getFollowersCount(userId),
        this.getFollowingCount(userId),
      ]);

      return { followersCount, followingCount };
    } catch (error) {
      console.error('[Follow] Get counts error:', error);
      return { followersCount: 0, followingCount: 0 };
    }
  },

  // ==========================================
  // LISTS
  // ==========================================

  /**
   * Get list of followers for a user
   * @param {string} userId - User ID
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @returns {Promise<Array>}
   */
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          created_at,
          follower:follower_id(
            id,
            full_name,
            username,
            avatar_url,
            bio,
            scanner_tier,
            chatbot_tier,
            verified_seller,
            verified_trader,
            level_badge,
            role_badge
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Check if current user follows each follower
      if (currentUser && data) {
        const followerIds = data.map(f => f.follower?.id).filter(Boolean);

        const { data: followingData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', followerIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);

        return data.map(item => ({
          ...item.follower,
          followedAt: item.created_at,
          isFollowedByMe: followingSet.has(item.follower?.id),
        }));
      }

      return data?.map(item => ({
        ...item.follower,
        followedAt: item.created_at,
        isFollowedByMe: false,
      })) || [];
    } catch (error) {
      console.error('[Follow] Get followers error:', error);
      return [];
    }
  },

  /**
   * Get list of users that a user is following
   * @param {string} userId - User ID
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @returns {Promise<Array>}
   */
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          created_at,
          following:following_id(
            id,
            full_name,
            username,
            avatar_url,
            bio,
            scanner_tier,
            chatbot_tier,
            verified_seller,
            verified_trader,
            level_badge,
            role_badge
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Check if current user follows each person in the list
      if (currentUser && data) {
        const followingIds = data.map(f => f.following?.id).filter(Boolean);

        const { data: followingData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', followingIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);

        return data.map(item => ({
          ...item.following,
          followedAt: item.created_at,
          isFollowedByMe: followingSet.has(item.following?.id),
        }));
      }

      return data?.map(item => ({
        ...item.following,
        followedAt: item.created_at,
        isFollowedByMe: false,
      })) || [];
    } catch (error) {
      console.error('[Follow] Get following error:', error);
      return [];
    }
  },

  /**
   * Get mutual followers (users who follow both userId and current user)
   * @param {string} userId - Target user ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getMutualFollowers(userId, limit = 10) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;
      if (!currentUser || currentUser.id === userId) return [];

      // Get followers of target user
      const { data: targetFollowers } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', userId);

      // Get following of current user (who they follow)
      const { data: myFollowing } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (!targetFollowers || !myFollowing) return [];

      // Find mutual: people who follow target AND are followed by current user
      const targetFollowerIds = new Set(targetFollowers.map(f => f.follower_id));
      const myFollowingIds = new Set(myFollowing.map(f => f.following_id));

      const mutualIds = [...targetFollowerIds].filter(id =>
        myFollowingIds.has(id) && id !== currentUser.id
      ).slice(0, limit);

      if (mutualIds.length === 0) return [];

      // Get profile info for mutual followers
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', mutualIds);

      return profiles || [];
    } catch (error) {
      console.error('[Follow] Get mutual followers error:', error);
      return [];
    }
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  /**
   * Create notification when following a user
   * @param {string} recipientId - User who receives the notification
   */
  async createFollowNotification(recipientId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user || recipientId === user.id) return;

      const { error } = await supabase
        .from('forum_notifications')
        .insert({
          user_id: recipientId,
          from_user_id: user.id,
          type: 'follow',
          title: 'Người theo dõi mới',
          body: 'đã bắt đầu theo dõi bạn',
          data: {},
          read: false,
        });

      if (error) {
        console.error('[Follow] Create notification error:', error);
      }
    } catch (error) {
      console.error('[Follow] Notification error:', error);
    }
  },

  // ==========================================
  // SEARCH
  // ==========================================

  /**
   * Search users to follow
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async searchUsers(query, limit = 20) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', currentUser?.id || '')
        .limit(limit);

      if (error) throw error;

      // Check follow status for each result
      if (currentUser && data) {
        const userIds = data.map(u => u.id);

        const { data: followingData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', userIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);

        return data.map(user => ({
          ...user,
          isFollowedByMe: followingSet.has(user.id),
        }));
      }

      return data?.map(user => ({
        ...user,
        isFollowedByMe: false,
      })) || [];
    } catch (error) {
      console.error('[Follow] Search users error:', error);
      return [];
    }
  },
};

export default followService;
