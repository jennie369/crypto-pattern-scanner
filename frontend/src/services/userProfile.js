/**
 * User Profile Service
 * Public profiles and social features
 */

import { supabase } from '../lib/supabaseClient';
import leaderboardService from './leaderboard';

class UserProfileService {
  /**
   * Get public profile for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Public profile data
   */
  async getPublicProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_stats(*),
          user_achievements(
            *,
            achievements(*)
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get rank
      const rank = await leaderboardService.getUserRank(userId);

      // Get follow counts
      const followCounts = await this.getFollowCounts(userId);

      return {
        ...data,
        rank,
        ...followCounts
      };
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<void>}
   */
  async updateProfile(userId, updates) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          bio: updates.bio,
          avatar_url: updates.avatarUrl,
          twitter_handle: updates.twitterHandle,
          telegram_handle: updates.telegramHandle,
          trading_style: updates.tradingStyle,
          favorite_pairs: updates.favoritePairs,
          public_profile: updates.publicProfile,
          show_stats: updates.showStats
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get user's recent activity
   * @param {string} userId - User ID
   * @param {number} limit - Number of activities to return
   * @returns {Promise<Array>} List of recent activities
   */
  async getRecentActivity(userId, limit = 20) {
    try {
      const [trades, forum, achievements] = await Promise.all([
        // Recent trades
        supabase
          .from('trading_journal')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent forum activity
        supabase
          .from('forum_threads')
          .select('id, title, created_at')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent achievements
        supabase
          .from('user_achievements')
          .select(`
            *,
            achievements(*)
          `)
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false })
          .limit(5)
      ]);

      // Combine and sort by time
      const activities = [
        ...trades.data?.map(t => ({ type: 'trade', data: t, timestamp: t.created_at })) || [],
        ...forum.data?.map(f => ({ type: 'forum', data: f, timestamp: f.created_at })) || [],
        ...achievements.data?.map(a => ({ type: 'achievement', data: a, timestamp: a.unlocked_at })) || []
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Toggle follow/unfollow for a user
   * @param {string} followerId - ID of user doing the following
   * @param {string} followingId - ID of user being followed
   * @returns {Promise<boolean>} True if now following, false if unfollowed
   */
  async toggleFollow(followerId, followingId) {
    try {
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (existing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('id', existing.id);
        return false;
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: followerId,
            following_id: followingId
          });
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  /**
   * Get follower and following counts for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Follower and following counts
   */
  async getFollowCounts(userId) {
    try {
      const [followers, following] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),

        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)
      ]);

      return {
        followers_count: followers.count || 0,
        following_count: following.count || 0
      };
    } catch (error) {
      console.error('Error fetching follow counts:', error);
      return { followers_count: 0, following_count: 0 };
    }
  }

  /**
   * Check if a user is following another user
   * @param {string} followerId - ID of user doing the following
   * @param {string} followingId - ID of user being followed
   * @returns {Promise<boolean>} True if following
   */
  async isFollowing(followerId, followingId) {
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of followers
   * @param {string} userId - User ID
   * @param {number} limit - Number of followers to return
   * @returns {Promise<Array>} List of followers
   */
  async getFollowers(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          users:follower_id(
            id,
            display_name,
            avatar_url,
            scanner_tier
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  /**
   * Get list of users being followed
   * @param {string} userId - User ID
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} List of users being followed
   */
  async getFollowing(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          users:following_id(
            id,
            display_name,
            avatar_url,
            scanner_tier
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }
}

export default new UserProfileService();
