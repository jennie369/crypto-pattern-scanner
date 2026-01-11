/**
 * User Identity Service
 * Phase 3: Multi-Platform Integration
 *
 * Cross-platform user identity management:
 * - Link platform accounts (TikTok, Facebook) to Gemral account
 * - Find users by platform ID
 * - Create temporary profiles for external platform users
 * - Merge profiles when user links account
 * - Track user tier and badges across platforms
 */

import { supabase } from './supabase';

// Platform identifiers
export const PLATFORMS = {
  GEMRAL: 'gemral',
  TIKTOK: 'tiktok',
  FACEBOOK: 'facebook',
  YOUTUBE: 'youtube',
  SHOPEE: 'shopee',
};

class UserIdentityService {
  constructor() {
    // Cache for quick lookups
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.cacheTimes = new Map();
  }

  /**
   * Link a platform account to Gemral user
   * @param {string} gemralUserId - Gemral user ID
   * @param {string} platform - Platform name
   * @param {Object} platformData - Platform user data
   */
  async linkPlatform(gemralUserId, platform, platformData) {
    try {
      // Get current user profile
      const { data: user, error: fetchError } = await supabase
        .from('user_profiles')
        .select('platforms')
        .eq('id', gemralUserId)
        .single();

      if (fetchError) throw fetchError;

      // Merge with existing platforms
      const currentPlatforms = user?.platforms || {};
      currentPlatforms[platform] = {
        userId: platformData.userId,
        username: platformData.username,
        displayName: platformData.displayName || platformData.username,
        avatar: platformData.avatar,
        linkedAt: new Date().toISOString(),
        verified: platformData.verified || false,
        isFollower: platformData.isFollower || false,
        isSubscriber: platformData.isSubscriber || false,
        metadata: platformData.metadata || {},
      };

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          platforms: currentPlatforms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gemralUserId);

      if (updateError) throw updateError;

      // Clear cache
      this._clearUserCache(gemralUserId);
      this._clearPlatformCache(platform, platformData.userId);

      console.log(`[Identity] Linked ${platform} to user ${gemralUserId}`);

      return { success: true, platforms: currentPlatforms };
    } catch (error) {
      console.error('[Identity] Link platform error:', error);
      throw error;
    }
  }

  /**
   * Unlink a platform from Gemral user
   */
  async unlinkPlatform(gemralUserId, platform) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from('user_profiles')
        .select('platforms')
        .eq('id', gemralUserId)
        .single();

      if (fetchError) throw fetchError;

      const currentPlatforms = user?.platforms || {};
      const platformData = currentPlatforms[platform];

      if (platformData) {
        delete currentPlatforms[platform];

        await supabase
          .from('user_profiles')
          .update({
            platforms: currentPlatforms,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gemralUserId);

        // Clear cache
        this._clearUserCache(gemralUserId);
        if (platformData.userId) {
          this._clearPlatformCache(platform, platformData.userId);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('[Identity] Unlink platform error:', error);
      throw error;
    }
  }

  /**
   * Find Gemral user by platform ID
   * @param {string} platform - Platform name
   * @param {string} platformUserId - Platform user ID
   */
  async findByPlatformId(platform, platformUserId) {
    try {
      // Check cache first
      const cacheKey = `${platform}_${platformUserId}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) return cached;

      // Query database using JSON path
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .filter(`platforms->${platform}->userId`, 'eq', platformUserId);

      if (error) throw error;

      if (data && data.length > 0) {
        const user = data[0];
        this._setCache(cacheKey, user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('[Identity] Find by platform ID error:', error);
      return null;
    }
  }

  /**
   * Find or create user from livestream comment
   * Creates temporary profile if user not found
   * @param {Object} comment - Unified comment object
   */
  async findOrCreateFromComment(comment) {
    try {
      // Skip for Gemral platform (already has user)
      if (comment.platform === PLATFORMS.GEMRAL) {
        return null;
      }

      // Try to find existing linked user
      let user = await this.findByPlatformId(comment.platform, comment.userId);
      if (user) return user;

      // Create temporary user profile
      const { data: newUser, error } = await supabase
        .from('user_profiles')
        .insert({
          is_temporary: true,
          display_name: comment.displayName || comment.username,
          avatar_url: comment.avatar,
          tier: 'FREE',
          platforms: {
            [comment.platform]: {
              userId: comment.userId,
              username: comment.username,
              displayName: comment.displayName,
              avatar: comment.avatar,
              linkedAt: new Date().toISOString(),
              isFollower: comment.isFollower || false,
              isSubscriber: comment.isSubscriber || false,
            },
          },
          metadata: {
            source: 'livestream',
            firstSeen: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) {
        console.error('[Identity] Create temporary user error:', error);
        return null;
      }

      console.log(`[Identity] Created temporary user for ${comment.platform}:${comment.userId}`);
      return newUser;
    } catch (error) {
      console.error('[Identity] Find or create from comment error:', error);
      return null;
    }
  }

  /**
   * Merge temporary profile into permanent Gemral account
   * Used when user links their platform account
   * @param {string} gemralUserId - Real Gemral user ID
   * @param {string} temporaryUserId - Temporary user ID to merge
   */
  async mergeProfiles(gemralUserId, temporaryUserId) {
    try {
      // Fetch both profiles
      const [{ data: gemralUser }, { data: tempUser }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', gemralUserId).single(),
        supabase.from('user_profiles').select('*').eq('id', temporaryUserId).single(),
      ]);

      if (!gemralUser) throw new Error('Gemral user not found');
      if (!tempUser) throw new Error('Temporary user not found');

      // Merge platforms data
      const mergedPlatforms = {
        ...gemralUser.platforms,
        ...tempUser.platforms,
      };

      // Update Gemral user with merged data
      await supabase
        .from('user_profiles')
        .update({
          platforms: mergedPlatforms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gemralUserId);

      // Migrate livestream comments to real user
      await supabase
        .from('livestream_comments')
        .update({ user_id: gemralUserId })
        .eq('user_id', temporaryUserId);

      // Migrate livestream gifts to real user
      await supabase
        .from('livestream_gifts')
        .update({ user_id: gemralUserId })
        .eq('user_id', temporaryUserId);

      // Delete temporary profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', temporaryUserId);

      // Clear all caches
      this.clearCache();

      console.log(`[Identity] Merged ${temporaryUserId} into ${gemralUserId}`);
      return { success: true, mergedPlatforms };
    } catch (error) {
      console.error('[Identity] Merge profiles error:', error);
      throw error;
    }
  }

  /**
   * Get user's linked platforms
   */
  async getLinkedPlatforms(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('platforms')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const platforms = data?.platforms || {};
      return Object.entries(platforms).map(([platform, data]) => ({
        platform,
        ...data,
      }));
    } catch (error) {
      console.error('[Identity] Get linked platforms error:', error);
      return [];
    }
  }

  /**
   * Check if platform is linked
   */
  async isPlatformLinked(userId, platform) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('platforms')
        .eq('id', userId)
        .single();

      if (error) return false;

      return !!(data?.platforms?.[platform]);
    } catch (error) {
      return false;
    }
  }

  /**
   * Update platform data (e.g., refresh avatar, follower status)
   */
  async updatePlatformData(gemralUserId, platform, updates) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from('user_profiles')
        .select('platforms')
        .eq('id', gemralUserId)
        .single();

      if (fetchError) throw fetchError;

      const currentPlatforms = user?.platforms || {};
      if (!currentPlatforms[platform]) {
        throw new Error('Platform not linked');
      }

      currentPlatforms[platform] = {
        ...currentPlatforms[platform],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await supabase
        .from('user_profiles')
        .update({
          platforms: currentPlatforms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gemralUserId);

      // Clear cache
      this._clearUserCache(gemralUserId);

      return { success: true };
    } catch (error) {
      console.error('[Identity] Update platform data error:', error);
      throw error;
    }
  }

  /**
   * Get user badge for display in comments
   */
  getUserBadge(user) {
    if (!user) return null;

    const tier = user.tier || 'FREE';
    const badges = [];

    // Tier badge
    switch (tier) {
      case 'VIP':
        badges.push({ type: 'vip', name: 'VIP', color: '#FFD700', icon: 'crown' });
        break;
      case 'PRO':
        badges.push({ type: 'pro', name: 'PRO', color: '#9B59B6', icon: 'star' });
        break;
      case 'PREMIUM':
        badges.push({ type: 'premium', name: 'Premium', color: '#3498DB', icon: 'diamond' });
        break;
    }

    // Add platform badges
    if (user.platforms) {
      const platformCount = Object.keys(user.platforms).length;
      if (platformCount >= 3) {
        badges.push({ type: 'multiplatform', name: 'Multi-Platform', color: '#2ECC71', icon: 'globe' });
      }
    }

    return badges;
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  _getFromCache(key) {
    const cached = this.cache.get(key);
    const cacheTime = this.cacheTimes.get(key);

    if (cached && cacheTime && Date.now() - cacheTime < this.cacheExpiry) {
      return cached;
    }

    // Expired, remove from cache
    this.cache.delete(key);
    this.cacheTimes.delete(key);
    return null;
  }

  _setCache(key, value) {
    this.cache.set(key, value);
    this.cacheTimes.set(key, Date.now());
  }

  _clearUserCache(userId) {
    // Remove all cache entries for this user
    for (const [key, _] of this.cache) {
      if (key.includes(userId)) {
        this.cache.delete(key);
        this.cacheTimes.delete(key);
      }
    }
  }

  _clearPlatformCache(platform, platformUserId) {
    const key = `${platform}_${platformUserId}`;
    this.cache.delete(key);
    this.cacheTimes.delete(key);
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimes.clear();
  }
}

// Singleton instance
export const userIdentityService = new UserIdentityService();
export default userIdentityService;
