/**
 * Restricted Users Service
 * Silent blocking - user doesn't know they're restricted
 *
 * Features:
 * - Restrict/Unrestrict users
 * - Get restricted users list
 * - Get messages from restricted users
 * - Check if user is restricted
 *
 * Unlike blocking:
 * - Restricted users can still send messages
 * - Messages go to a separate "restricted" folder
 * - No notification to the restricted user
 * - Appears as normal to them
 *
 * @module restrictedUsersService
 */

import { supabase } from './supabase';

class RestrictedUsersService {
  constructor() {
    this.restrictedUsersCache = null;
    this.cacheTime = 0;
    this.CACHE_TTL = 60000; // 1 minute
  }

  // =====================================================
  // RESTRICT / UNRESTRICT
  // =====================================================

  /**
   * Restrict a user (silent block)
   * @param {string} userId - User ID to restrict
   * @param {string} reason - Optional reason for restricting
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async restrictUser(userId, reason = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      if (userId === user.id) {
        throw new Error('Không thể tự restrict bản thân');
      }

      const { data, error } = await supabase
        .from('restricted_users')
        .insert({
          restricter_id: user.id,
          restricted_id: userId,
          reason,
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate
        if (error.code === '23505') {
          return { success: true, message: 'User đã bị restrict' };
        }
        throw error;
      }

      // Clear cache
      this._clearCache();

      console.log('[RestrictedUsersService] User restricted:', userId);
      return { success: true, data };

    } catch (error) {
      console.error('[RestrictedUsersService] restrictUser error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unrestrict a user
   * @param {string} userId - User ID to unrestrict
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unrestrictUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { error } = await supabase
        .from('restricted_users')
        .delete()
        .eq('restricter_id', user.id)
        .eq('restricted_id', userId);

      if (error) throw error;

      // Clear cache
      this._clearCache();

      console.log('[RestrictedUsersService] User unrestricted:', userId);
      return { success: true };

    } catch (error) {
      console.error('[RestrictedUsersService] unrestrictUser error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // GET RESTRICTED USERS
  // =====================================================

  /**
   * Get list of restricted users
   * @param {boolean} forceRefresh - Force refresh from database
   * @returns {Promise<Array>} List of restricted users with profiles
   */
  async getRestrictedUsers(forceRefresh = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Check cache
      if (!forceRefresh && this.restrictedUsersCache && Date.now() - this.cacheTime < this.CACHE_TTL) {
        return this.restrictedUsersCache;
      }

      const { data, error } = await supabase
        .from('restricted_users')
        .select('*')
        .eq('restricter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        this.restrictedUsersCache = [];
        this.cacheTime = Date.now();
        return [];
      }

      // Fetch profiles for restricted users
      const restrictedIds = data.map(r => r.restricted_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url')
        .in('id', restrictedIds);

      if (profilesError) {
        console.error('[RestrictedUsersService] Error fetching profiles:', profilesError);
      }

      // Create profile map
      const profileMap = {};
      if (profiles) {
        profiles.forEach(p => {
          p.display_name = p.full_name || p.display_name || p.username || 'User';
          profileMap[p.id] = p;
        });
      }

      // Attach profiles
      const result = data.map(restriction => {
        const profile = profileMap[restriction.restricted_id] || null;
        return {
          ...restriction,
          user: profile,
          // Alias for compatibility with RestrictedUsersScreen
          restricted_user: profile,
          restricted_user_id: restriction.restricted_id,
          display_name: profile?.display_name || 'Unknown User',
          avatar_url: profile?.avatar_url,
          restricted_at: restriction.created_at,
        };
      });

      // Update cache
      this.restrictedUsersCache = result;
      this.cacheTime = Date.now();

      return result;

    } catch (error) {
      console.error('[RestrictedUsersService] getRestrictedUsers error:', error);
      return [];
    }
  }

  /**
   * Get count of restricted users
   * @returns {Promise<number>}
   */
  async getRestrictedUsersCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('restricted_users')
        .select('*', { count: 'exact', head: true })
        .eq('restricter_id', user.id);

      if (error) throw error;
      return count || 0;

    } catch (error) {
      console.error('[RestrictedUsersService] getRestrictedUsersCount error:', error);
      return 0;
    }
  }

  // =====================================================
  // CHECK RESTRICTION STATUS
  // =====================================================

  /**
   * Check if a user is restricted by current user
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isUserRestricted(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_user_restricted', {
        checker_id: user.id,
        target_id: userId,
      });

      if (error) throw error;
      return data === true;

    } catch (error) {
      console.error('[RestrictedUsersService] isUserRestricted error:', error);
      return false;
    }
  }

  /**
   * Check if current user is restricted by another user
   * Note: This is intentionally limited - you shouldn't know if you're restricted
   * Only used internally for message delivery
   * @param {string} userId - User ID who might have restricted current user
   * @returns {Promise<boolean>}
   */
  async amIRestrictedBy(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // This should fail due to RLS (can only see own restrictions)
      // But we include it for completeness
      const { data, error } = await supabase
        .from('restricted_users')
        .select('id')
        .eq('restricter_id', userId)
        .eq('restricted_id', user.id)
        .maybeSingle();

      // RLS will prevent this query from returning results
      // even if the restriction exists
      return false;

    } catch (error) {
      // Expected to fail or return nothing
      return false;
    }
  }

  // =====================================================
  // RESTRICTED MESSAGES
  // =====================================================

  /**
   * Get messages from restricted users
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} List of restricted messages
   */
  async getRestrictedMessages(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_restricted_messages', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('[RestrictedUsersService] getRestrictedMessages error:', error);
      return [];
    }
  }

  /**
   * Get count of unread restricted messages
   * @returns {Promise<number>}
   */
  async getUnreadRestrictedMessagesCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_restricted', true)
        .in('conversation_id', supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id)
        );

      if (error) throw error;
      return count || 0;

    } catch (error) {
      console.error('[RestrictedUsersService] getUnreadRestrictedMessagesCount error:', error);
      return 0;
    }
  }

  /**
   * Mark restricted message as read
   * @param {string} messageId - Message ID
   * @returns {Promise<{success: boolean}>}
   */
  async markRestrictedMessageRead(messageId) {
    try {
      // For now, just mark the conversation as read
      // Restricted messages are stored in the same messages table
      // with is_restricted = true
      return { success: true };

    } catch (error) {
      console.error('[RestrictedUsersService] markRestrictedMessageRead error:', error);
      return { success: false };
    }
  }

  /**
   * Delete restricted messages from a user
   * @param {string} restrictedUserId - Restricted user ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteRestrictedMessagesFrom(restrictedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Find conversations with this user
      const { data: conversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', restrictedUserId);

      if (!conversations || conversations.length === 0) {
        return { success: true };
      }

      const conversationIds = conversations.map(c => c.conversation_id);

      // Soft delete restricted messages
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .in('conversation_id', conversationIds)
        .eq('sender_id', restrictedUserId)
        .eq('is_restricted', true);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('[RestrictedUsersService] deleteRestrictedMessagesFrom error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Clear cache
   * @private
   */
  _clearCache() {
    this.restrictedUsersCache = null;
    this.cacheTime = 0;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this._clearCache();
  }
}

// Export singleton instance
export const restrictedUsersService = new RestrictedUsersService();
export default restrictedUsersService;
