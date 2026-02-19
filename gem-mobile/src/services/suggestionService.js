/**
 * Gemral - Suggestion Service
 * Handles user suggestions for follow system
 * Instagram/TikTok style "Suggested for you"
 *
 * Suggestion algorithms:
 * 1. Mutual connections (friends of friends)
 * 2. Popular users (most followers)
 * 3. Active users (recent posts)
 * 4. Similar interests (based on followed users)
 */

import { supabase } from './supabase';

export const suggestionService = {
  // ==========================================
  // MAIN SUGGESTIONS
  // ==========================================

  /**
   * Get suggested users to follow
   * Combines multiple algorithms for best results
   * @param {number} limit - Max suggestions
   * @returns {Promise<Array>}
   */
  async getSuggestedUsers(limit = 10) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;
      if (!currentUser) return [];

      // Get users already followed to exclude
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      const excludeIds = new Set([
        currentUser.id,
        ...(following?.map(f => f.following_id) || []),
      ]);

      // Fetch suggestions from multiple sources in parallel
      const [mutualSuggestions, popularUsers, activeUsers] = await Promise.all([
        this.getMutualConnectionSuggestions(currentUser.id, excludeIds, Math.ceil(limit * 0.5)),
        this.getPopularUserSuggestions(excludeIds, Math.ceil(limit * 0.3)),
        this.getActiveUserSuggestions(excludeIds, Math.ceil(limit * 0.2)),
      ]);

      // Merge and deduplicate suggestions
      const seenIds = new Set();
      const allSuggestions = [];

      // Prioritize mutual connections
      for (const user of mutualSuggestions) {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          allSuggestions.push({ ...user, reason: 'mutual' });
        }
      }

      // Then popular users
      for (const user of popularUsers) {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          allSuggestions.push({ ...user, reason: 'popular' });
        }
      }

      // Finally active users
      for (const user of activeUsers) {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          allSuggestions.push({ ...user, reason: 'active' });
        }
      }

      return allSuggestions.slice(0, limit);
    } catch (error) {
      console.error('[Suggestion] Get suggestions error:', error);
      return [];
    }
  },

  /**
   * Get similar users based on who a target user follows
   * "People who [user] follows also follow..."
   * @param {string} targetUserId - User to find similar users for
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getSimilarUsers(targetUserId, limit = 10) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;

      // Get who the target user follows
      const { data: targetFollowing } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', targetUserId);

      if (!targetFollowing || targetFollowing.length === 0) {
        return this.getPopularUserSuggestions(new Set([targetUserId, currentUser?.id]), limit);
      }

      const targetFollowingIds = targetFollowing.map(f => f.following_id);

      // Find who those users also follow
      const { data: secondDegree } = await supabase
        .from('user_follows')
        .select('following_id')
        .in('follower_id', targetFollowingIds)
        .neq('following_id', targetUserId);

      if (!secondDegree) return [];

      // Count frequency to find most common
      const frequency = {};
      for (const { following_id } of secondDegree) {
        if (following_id !== currentUser?.id && !targetFollowingIds.includes(following_id)) {
          frequency[following_id] = (frequency[following_id] || 0) + 1;
        }
      }

      // Sort by frequency
      const sortedIds = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (sortedIds.length === 0) return [];

      // Get profile info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .in('id', sortedIds);

      // Check if current user follows them
      let followingSet = new Set();
      if (currentUser) {
        const { data: myFollowing } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', sortedIds);

        followingSet = new Set(myFollowing?.map(f => f.following_id) || []);
      }

      return (profiles || []).map(profile => ({
        ...profile,
        isFollowedByMe: followingSet.has(profile.id),
        commonFollowersCount: frequency[profile.id] || 0,
        reason: 'similar',
      }));
    } catch (error) {
      console.error('[Suggestion] Get similar users error:', error);
      return [];
    }
  },

  // ==========================================
  // SUGGESTION ALGORITHMS
  // ==========================================

  /**
   * Get suggestions based on mutual connections (friends of friends)
   */
  async getMutualConnectionSuggestions(currentUserId, excludeIds, limit = 5) {
    try {
      // Get who I follow
      const { data: myFollowing } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (!myFollowing || myFollowing.length === 0) return [];

      const myFollowingIds = myFollowing.map(f => f.following_id);

      // Find who my following also follow
      const { data: secondDegree } = await supabase
        .from('user_follows')
        .select('following_id, follower_id')
        .in('follower_id', myFollowingIds);

      if (!secondDegree) return [];

      // Count mutual connections
      const mutualCount = {};
      const mutualVia = {};

      for (const { following_id, follower_id } of secondDegree) {
        if (!excludeIds.has(following_id)) {
          mutualCount[following_id] = (mutualCount[following_id] || 0) + 1;
          if (!mutualVia[following_id]) {
            mutualVia[following_id] = [];
          }
          mutualVia[following_id].push(follower_id);
        }
      }

      // Sort by mutual count
      const sortedIds = Object.entries(mutualCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (sortedIds.length === 0) return [];

      // Get profile info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .in('id', sortedIds);

      // Get names of mutual connections for display
      const allMutualIds = [...new Set(Object.values(mutualVia).flat())].slice(0, 10);
      const { data: mutualProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', allMutualIds);

      const mutualMap = new Map(mutualProfiles?.map(p => [p.id, p]) || []);

      return (profiles || []).map(profile => ({
        ...profile,
        isFollowedByMe: false,
        mutualCount: mutualCount[profile.id] || 0,
        mutualFollowers: (mutualVia[profile.id] || [])
          .slice(0, 3)
          .map(id => mutualMap.get(id))
          .filter(Boolean),
      }));
    } catch (error) {
      console.error('[Suggestion] Mutual connections error:', error);
      return [];
    }
  },

  /**
   * Get popular users (most followers)
   */
  async getPopularUserSuggestions(excludeIds, limit = 3) {
    try {
      // Get follower counts
      const { data: followerCounts, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .neq('following_id', null);

      if (error || !followerCounts) return [];

      // Count followers
      const counts = {};
      for (const { following_id } of followerCounts) {
        if (!excludeIds.has(following_id)) {
          counts[following_id] = (counts[following_id] || 0) + 1;
        }
      }

      // Get top by followers
      const topIds = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .in('id', topIds);

      return (profiles || []).map(profile => ({
        ...profile,
        isFollowedByMe: false,
        followersCount: counts[profile.id] || 0,
      }));
    } catch (error) {
      console.error('[Suggestion] Popular users error:', error);
      return [];
    }
  },

  /**
   * Get active users (recent posts)
   */
  async getActiveUserSuggestions(excludeIds, limit = 2) {
    try {
      // Get users with recent posts
      const { data: recentPosts } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!recentPosts) return [];

      // Find unique users not excluded
      const seenIds = new Set();
      const activeIds = [];

      for (const { user_id } of recentPosts) {
        if (!excludeIds.has(user_id) && !seenIds.has(user_id)) {
          seenIds.add(user_id);
          activeIds.push(user_id);
          if (activeIds.length >= limit) break;
        }
      }

      if (activeIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .in('id', activeIds);

      return (profiles || []).map(profile => ({
        ...profile,
        isFollowedByMe: false,
      }));
    } catch (error) {
      console.error('[Suggestion] Active users error:', error);
      return [];
    }
  },

  // ==========================================
  // DROPDOWN SUGGESTIONS (After Follow)
  // ==========================================

  /**
   * Get suggestions to show in dropdown after following a user
   * Similar to Instagram's "Suggested for you" dropdown
   * @param {string} followedUserId - User that was just followed
   * @param {number} limit - Max suggestions
   * @returns {Promise<Array>}
   */
  async getDropdownSuggestions(followedUserId, limit = 5) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;
      if (!currentUser) return [];

      // Get updated following list
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      const excludeIds = new Set([
        currentUser.id,
        ...(following?.map(f => f.following_id) || []),
      ]);

      // Get similar users to the one just followed
      const similarUsers = await this.getSimilarUsers(followedUserId, limit);

      // Filter out already followed
      return similarUsers.filter(u => !excludeIds.has(u.id));
    } catch (error) {
      console.error('[Suggestion] Dropdown suggestions error:', error);
      return [];
    }
  },

  /**
   * Get "People you may know" based on recent activity
   */
  async getPeopleYouMayKnow(limit = 10) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const currentUser = session?.user;
      if (!currentUser) return [];

      // Get users I've interacted with (liked/commented on their posts)
      const { data: likedPosts } = await supabase
        .from('forum_likes')
        .select('post:forum_posts(user_id)')
        .eq('user_id', currentUser.id)
        .limit(50);

      const { data: commentedPosts } = await supabase
        .from('forum_comments')
        .select('post:forum_posts(user_id)')
        .eq('user_id', currentUser.id)
        .limit(50);

      // Get following to exclude
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      const excludeIds = new Set([
        currentUser.id,
        ...(following?.map(f => f.following_id) || []),
      ]);

      // Count interactions
      const interactionCount = {};

      for (const item of (likedPosts || [])) {
        const userId = item.post?.user_id;
        if (userId && !excludeIds.has(userId)) {
          interactionCount[userId] = (interactionCount[userId] || 0) + 1;
        }
      }

      for (const item of (commentedPosts || [])) {
        const userId = item.post?.user_id;
        if (userId && !excludeIds.has(userId)) {
          interactionCount[userId] = (interactionCount[userId] || 0) + 2; // Comments weighted more
        }
      }

      // Sort by interaction count
      const sortedIds = Object.entries(interactionCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (sortedIds.length === 0) {
        // Fallback to general suggestions
        return this.getSuggestedUsers(limit);
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, scanner_tier, verified_seller, verified_trader')
        .in('id', sortedIds);

      return (profiles || []).map(profile => ({
        ...profile,
        isFollowedByMe: false,
        interactionScore: interactionCount[profile.id] || 0,
        reason: 'interaction',
      }));
    } catch (error) {
      console.error('[Suggestion] People you may know error:', error);
      return [];
    }
  },
};

export default suggestionService;
