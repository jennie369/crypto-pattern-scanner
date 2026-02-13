/**
 * Gemral - Privacy Service
 * Feature #13: Privacy & Audience Settings
 * Handles post visibility and close friends list
 */

import { supabase } from './supabase';

export const privacyService = {
  /**
   * Get available audience options
   */
  getAudienceOptions() {
    return [
      {
        id: 'public',
        label: 'Công khai',
        description: 'Mọi người có thể xem',
        icon: 'Globe',
      },
      {
        id: 'followers',
        label: 'Người theo dõi',
        description: 'Chỉ người theo dõi bạn',
        icon: 'Users',
      },
      {
        id: 'close_friends',
        label: 'Bạn thân',
        description: 'Chỉ bạn thân mới xem được',
        icon: 'Star',
      },
      {
        id: 'private',
        label: 'Chỉ mình tôi',
        description: 'Chỉ bạn mới xem được',
        icon: 'Lock',
      },
    ];
  },

  /**
   * Get close friends list
   * @returns {Promise<array>}
   */
  async getCloseFriends() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('close_friends')
        .select(`
          id,
          created_at,
          friend:friend_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(cf => ({
        ...cf.friend,
        addedAt: cf.created_at,
        closeFriendId: cf.id,
      }));
    } catch (error) {
      console.error('[Privacy] Get close friends error:', error);
      return [];
    }
  },

  /**
   * Add user to close friends
   * @param {string} friendId - User ID to add
   * @returns {Promise<object>}
   */
  async addCloseFriend(friendId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Check if already in close friends
      const { data: existing } = await supabase
        .from('close_friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

      if (existing) {
        return { success: false, error: 'Đã là bạn thân' };
      }

      const { data, error } = await supabase
        .from('close_friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
        })
        .select(`
          id,
          friend:friend_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      console.log('[Privacy] Added close friend:', friendId);
      return { success: true, data };
    } catch (error) {
      console.error('[Privacy] Add close friend error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove user from close friends
   * @param {string} friendId - User ID to remove
   * @returns {Promise<object>}
   */
  async removeCloseFriend(friendId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const { error } = await supabase
        .from('close_friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (error) throw error;

      console.log('[Privacy] Removed close friend:', friendId);
      return { success: true };
    } catch (error) {
      console.error('[Privacy] Remove close friend error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user is a close friend
   * @param {string} friendId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isCloseFriend(friendId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('close_friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get close friends count
   * @returns {Promise<number>}
   */
  async getCloseFriendsCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('close_friends')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Search followers to add as close friends
   * @param {string} query - Search query
   * @returns {Promise<array>}
   */
  async searchFollowersForCloseFriends(query) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get current close friends to exclude
      const { data: closeFriends } = await supabase
        .from('close_friends')
        .select('friend_id')
        .eq('user_id', user.id);

      const closeFriendIds = closeFriends?.map(cf => cf.friend_id) || [];

      // Search in followers
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      const followerIds = followers?.map(f => f.follower_id) || [];

      // Get follower profiles
      let profileQuery = supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', followerIds);

      if (query) {
        profileQuery = profileQuery.ilike('full_name', `%${query}%`);
      }

      const { data, error } = await profileQuery.limit(30);

      if (error) throw error;

      // Filter out existing close friends
      return (data || []).filter(p => !closeFriendIds.includes(p.id)).map(p => ({
        ...p,
        isCloseFriend: false,
      }));
    } catch (error) {
      console.error('[Privacy] Search followers error:', error);
      return [];
    }
  },

  /**
   * Check if current user can view a post based on privacy
   * @param {object} post - Post object with visibility field
   * @returns {Promise<boolean>}
   */
  async canViewPost(post) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Public posts are always viewable
      if (post.visibility === 'public') return true;

      // Not logged in can only see public
      if (!user) return false;

      // Own posts are always viewable
      if (post.user_id === user.id) return true;

      // Check based on visibility
      switch (post.visibility) {
        case 'followers':
          // Check if user follows the author
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', post.user_id)
            .single();
          return !!followData;

        case 'close_friends':
          // Check if user is in author's close friends
          const { data: cfData } = await supabase
            .from('close_friends')
            .select('id')
            .eq('user_id', post.user_id)
            .eq('friend_id', user.id)
            .single();
          return !!cfData;

        case 'private':
          return false;

        default:
          return true;
      }
    } catch (error) {
      console.error('[Privacy] Can view post error:', error);
      return false;
    }
  },

  /**
   * Update post visibility
   * @param {string} postId - Post ID
   * @param {string} visibility - New visibility setting
   * @returns {Promise<object>}
   */
  async updatePostVisibility(postId, visibility) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      // Verify ownership
      const { data: post } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post?.user_id !== user.id) {
        return { success: false, error: 'Không có quyền' };
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .update({ visibility })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;

      console.log('[Privacy] Updated visibility:', postId, visibility);
      return { success: true, data };
    } catch (error) {
      console.error('[Privacy] Update visibility error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's default post visibility setting
   * @returns {Promise<string>}
   */
  async getDefaultVisibility() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'public';

      const { data } = await supabase
        .from('user_settings')
        .select('default_post_visibility')
        .eq('user_id', user.id)
        .single();

      return data?.default_post_visibility || 'public';
    } catch (error) {
      return 'public';
    }
  },

  /**
   * Update default post visibility
   * @param {string} visibility - New default visibility
   * @returns {Promise<object>}
   */
  async updateDefaultVisibility(visibility) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chưa đăng nhập' };
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          default_post_visibility: visibility,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Privacy] Update default visibility error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get visibility label for display
   * @param {string} visibility - Visibility value
   * @returns {object}
   */
  getVisibilityLabel(visibility) {
    const options = this.getAudienceOptions();
    return options.find(o => o.id === visibility) || options[0];
  },
};

export default privacyService;
