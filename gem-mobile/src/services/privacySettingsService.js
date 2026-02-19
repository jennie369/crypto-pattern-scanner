/**
 * Privacy Settings Service
 * Manages user privacy preferences for messaging and calls
 */

import { supabase } from './supabase';

const DEFAULT_SETTINGS = {
  allow_message_requests: true,
  read_receipts_enabled: true,
  typing_indicator_enabled: true,
  online_status_enabled: true,
  last_seen_enabled: true,
  allow_calls_from: 'everyone',
};

class PrivacySettingsService {
  constructor() {
    this.cachedSettings = null;
    this.cacheTimestamp = null;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get current user's privacy settings
   */
  async getPrivacySettings() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        console.warn('[PrivacySettings] No user logged in');
        return { success: false, error: 'Not authenticated' };
      }

      // Check cache
      if (this.cachedSettings && this.cacheTimestamp) {
        const age = Date.now() - this.cacheTimestamp;
        if (age < this.CACHE_TTL) {
          return { success: true, settings: this.cachedSettings };
        }
      }

      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[PrivacySettings] Error fetching settings:', error);
        return { success: false, error: error.message };
      }

      // Return defaults if no settings exist
      const settings = data || { ...DEFAULT_SETTINGS, user_id: user.id };

      // Update cache
      this.cachedSettings = settings;
      this.cacheTimestamp = Date.now();

      return { success: true, settings };
    } catch (error) {
      console.error('[PrivacySettings] Exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(updates) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('[PrivacySettings] Updating settings:', updates);

      const { data, error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        console.error('[PrivacySettings] Error updating:', error);
        return { success: false, error: error.message };
      }

      // Update cache
      this.cachedSettings = data;
      this.cacheTimestamp = Date.now();

      console.log('[PrivacySettings] Settings updated successfully');
      return { success: true, settings: data };
    } catch (error) {
      console.error('[PrivacySettings] Exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get another user's privacy settings (limited fields)
   */
  async getOtherUserPrivacySettings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('read_receipts_enabled, typing_indicator_enabled, online_status_enabled, last_seen_enabled, allow_calls_from')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      // Return defaults if no settings
      const settings = data || {
        read_receipts_enabled: true,
        typing_indicator_enabled: true,
        online_status_enabled: true,
        last_seen_enabled: true,
        allow_calls_from: 'everyone',
      };

      return { success: true, settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if should show read receipts for a user
   * Both users need to have it enabled
   */
  async shouldShowReadReceipts(otherUserId) {
    try {
      const [mySettings, otherSettings] = await Promise.all([
        this.getPrivacySettings(),
        this.getOtherUserPrivacySettings(otherUserId),
      ]);

      const myEnabled = mySettings.success && mySettings.settings?.read_receipts_enabled !== false;
      const otherEnabled = otherSettings.success && otherSettings.settings?.read_receipts_enabled !== false;

      return myEnabled && otherEnabled;
    } catch (error) {
      console.error('[PrivacySettings] shouldShowReadReceipts error:', error);
      return true; // Default to showing
    }
  }

  /**
   * Check if should show online status for a user
   */
  async shouldShowOnlineStatus(userId) {
    try {
      const result = await this.getOtherUserPrivacySettings(userId);
      return result.success && result.settings?.online_status_enabled !== false;
    } catch (error) {
      return true;
    }
  }

  /**
   * Check if should show typing indicator
   * Both users need to have it enabled
   */
  async shouldShowTypingIndicator(otherUserId) {
    try {
      const [mySettings, otherSettings] = await Promise.all([
        this.getPrivacySettings(),
        this.getOtherUserPrivacySettings(otherUserId),
      ]);

      const myEnabled = mySettings.success && mySettings.settings?.typing_indicator_enabled !== false;
      const otherEnabled = otherSettings.success && otherSettings.settings?.typing_indicator_enabled !== false;

      return myEnabled && otherEnabled;
    } catch (error) {
      return true;
    }
  }

  /**
   * Check if should show last seen for a user
   */
  async shouldShowLastSeen(userId) {
    try {
      const result = await this.getOtherUserPrivacySettings(userId);
      return result.success && result.settings?.last_seen_enabled !== false;
    } catch (error) {
      return true;
    }
  }

  /**
   * Check if current user can call another user
   */
  async canCallUser(calleeId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) {
        return { allowed: false, reason: 'Not authenticated' };
      }

      // Use database function for accurate check
      const { data, error } = await supabase.rpc('can_call_user', {
        caller_id: user.id,
        callee_id: calleeId,
      });

      if (error) {
        console.error('[PrivacySettings] canCallUser RPC error:', error);
        // Fallback to simple check
        const settings = await this.getOtherUserPrivacySettings(calleeId);
        if (settings.settings?.allow_calls_from === 'nobody') {
          return { allowed: false, reason: 'User does not accept calls' };
        }
        return { allowed: true, reason: null };
      }

      if (data && data.length > 0) {
        return { allowed: data[0].allowed, reason: data[0].reason };
      }

      return { allowed: true, reason: null };
    } catch (error) {
      console.error('[PrivacySettings] canCallUser error:', error);
      return { allowed: true, reason: null };
    }
  }

  /**
   * Check if users are contacts (have chatted before)
   */
  async areUsersContacts(otherUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_contacts')
        .select('id')
        .or(`and(user_id.eq.${user.id},contact_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},contact_id.eq.${user.id})`)
        .eq('status', 'active')
        .limit(1);

      if (error) {
        console.error('[PrivacySettings] areUsersContacts error:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cached settings (call on logout)
   */
  clearCache() {
    this.cachedSettings = null;
    this.cacheTimestamp = null;
  }
}

export const privacySettingsService = new PrivacySettingsService();
export default privacySettingsService;
