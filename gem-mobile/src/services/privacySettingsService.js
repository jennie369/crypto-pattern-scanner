/**
 * Privacy Settings Service
 * Manages user privacy preferences for messaging and calls
 *
 * Features:
 * - Get/Update privacy settings
 * - Check privacy permissions for other users
 * - Call permission checks
 * - Read receipt/Typing/Online status visibility
 *
 * @module privacySettingsService
 */

import { supabase } from './supabase';

// Default privacy settings
const DEFAULT_SETTINGS = {
  allow_message_requests: true,
  read_receipts_enabled: true,
  typing_indicator_enabled: true,
  online_status_enabled: true,
  last_seen_enabled: true,
  allow_calls_from: 'everyone',
};

// Settings cache for performance
let settingsCache = null;
let settingsCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

class PrivacySettingsService {
  constructor() {
    this.settingsSubscription = null;
  }

  // =====================================================
  // GET SETTINGS
  // =====================================================

  /**
   * Get current user's privacy settings
   * @param {boolean} forceRefresh - Force refresh from database
   * @returns {Promise<Object>} Privacy settings object
   */
  async getPrivacySettings(forceRefresh = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Check cache
      if (!forceRefresh && settingsCache && Date.now() - settingsCacheTime < CACHE_TTL) {
        return settingsCache;
      }

      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create default settings
      if (!data) {
        const newSettings = await this._createDefaultSettings(user.id);
        settingsCache = newSettings;
        settingsCacheTime = Date.now();
        return newSettings;
      }

      // Update cache
      settingsCache = data;
      settingsCacheTime = Date.now();

      return data;

    } catch (error) {
      console.error('[PrivacySettingsService] getPrivacySettings error:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Get another user's privacy settings (limited view for privacy checks)
   * @param {string} userId - Target user ID
   * @returns {Promise<Object>} Limited privacy settings
   */
  async getOtherUserPrivacySettings(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_privacy_settings', {
        target_user_id: userId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0];
      }

      return { ...DEFAULT_SETTINGS };

    } catch (error) {
      console.error('[PrivacySettingsService] getOtherUserPrivacySettings error:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  // =====================================================
  // UPDATE SETTINGS
  // =====================================================

  /**
   * Update privacy settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updatePrivacySettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Validate settings
      const validatedSettings = this._validateSettings(settings);

      const { error } = await supabase.rpc('update_privacy_settings', {
        p_user_id: user.id,
        p_allow_message_requests: validatedSettings.allow_message_requests,
        p_read_receipts_enabled: validatedSettings.read_receipts_enabled,
        p_typing_indicator_enabled: validatedSettings.typing_indicator_enabled,
        p_online_status_enabled: validatedSettings.online_status_enabled,
        p_last_seen_enabled: validatedSettings.last_seen_enabled,
        p_allow_calls_from: validatedSettings.allow_calls_from,
      });

      if (error) throw error;

      // Update cache
      settingsCache = { ...settingsCache, ...validatedSettings };
      settingsCacheTime = Date.now();

      console.log('[PrivacySettingsService] Settings updated:', validatedSettings);
      return { success: true };

    } catch (error) {
      console.error('[PrivacySettingsService] updatePrivacySettings error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle a single privacy setting
   * @param {string} settingKey - Setting key to toggle
   * @returns {Promise<{success: boolean, newValue?: boolean, error?: string}>}
   */
  async toggleSetting(settingKey) {
    try {
      const currentSettings = await this.getPrivacySettings();
      const currentValue = currentSettings[settingKey];

      if (typeof currentValue !== 'boolean') {
        throw new Error(`Setting ${settingKey} is not a boolean`);
      }

      const result = await this.updatePrivacySettings({
        [settingKey]: !currentValue,
      });

      if (result.success) {
        return { success: true, newValue: !currentValue };
      }

      return result;

    } catch (error) {
      console.error('[PrivacySettingsService] toggleSetting error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update call privacy setting
   * @param {string} value - 'everyone', 'contacts_only', or 'nobody'
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateCallsSetting(value) {
    if (!['everyone', 'contacts_only', 'nobody'].includes(value)) {
      return { success: false, error: 'Invalid value for allow_calls_from' };
    }

    return this.updatePrivacySettings({ allow_calls_from: value });
  }

  // =====================================================
  // PRIVACY CHECKS
  // =====================================================

  /**
   * Check if should show read receipts for a user
   * Reciprocal: both users must have it enabled
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<boolean>}
   */
  async shouldShowReadReceipts(otherUserId) {
    try {
      // Get both users' settings
      const [mySettings, theirSettings] = await Promise.all([
        this.getPrivacySettings(),
        this.getOtherUserPrivacySettings(otherUserId),
      ]);

      // Reciprocal: both must have it enabled
      return mySettings.read_receipts_enabled && theirSettings.read_receipts_enabled;

    } catch (error) {
      console.error('[PrivacySettingsService] shouldShowReadReceipts error:', error);
      return true; // Default to showing
    }
  }

  /**
   * Check if should show typing indicator for a user
   * Reciprocal: both users must have it enabled
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<boolean>}
   */
  async shouldShowTypingIndicator(otherUserId) {
    try {
      const [mySettings, theirSettings] = await Promise.all([
        this.getPrivacySettings(),
        this.getOtherUserPrivacySettings(otherUserId),
      ]);

      // Reciprocal: both must have it enabled
      return mySettings.typing_indicator_enabled && theirSettings.typing_indicator_enabled;

    } catch (error) {
      console.error('[PrivacySettingsService] shouldShowTypingIndicator error:', error);
      return true;
    }
  }

  /**
   * Check if should show online status for a user
   * Only checks their setting (not reciprocal)
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<boolean>}
   */
  async shouldShowOnlineStatus(otherUserId) {
    try {
      const theirSettings = await this.getOtherUserPrivacySettings(otherUserId);
      return theirSettings.online_status_enabled;

    } catch (error) {
      console.error('[PrivacySettingsService] shouldShowOnlineStatus error:', error);
      return true;
    }
  }

  /**
   * Check if should show last seen for a user
   * Only checks their setting
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<boolean>}
   */
  async shouldShowLastSeen(otherUserId) {
    try {
      const theirSettings = await this.getOtherUserPrivacySettings(otherUserId);
      return theirSettings.last_seen_enabled;

    } catch (error) {
      console.error('[PrivacySettingsService] shouldShowLastSeen error:', error);
      return true;
    }
  }

  /**
   * Check if current user can call another user
   * @param {string} calleeId - User ID to call
   * @returns {Promise<{allowed: boolean, reason?: string}>}
   */
  async canCallUser(calleeId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { allowed: false, reason: 'Chưa đăng nhập' };

      const { data, error } = await supabase.rpc('can_call_user', {
        caller_id: user.id,
        callee_id: calleeId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        return {
          allowed: data[0].allowed,
          reason: data[0].reason,
        };
      }

      return { allowed: true };

    } catch (error) {
      console.error('[PrivacySettingsService] canCallUser error:', error);
      return { allowed: false, reason: error.message };
    }
  }

  /**
   * Check if user accepts message requests
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>}
   */
  async acceptsMessageRequests(userId) {
    try {
      const settings = await this.getOtherUserPrivacySettings(userId);
      return settings.allow_message_requests;

    } catch (error) {
      console.error('[PrivacySettingsService] acceptsMessageRequests error:', error);
      return true;
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to privacy settings changes
   * @param {Function} onChange - Callback when settings change
   * @returns {Function} Unsubscribe function
   */
  subscribeToSettingsChanges(onChange) {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return () => { };

    console.log('[PrivacySettingsService] Subscribing to settings changes');

    const channel = supabase
      .channel(`privacy-settings:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_privacy_settings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[PrivacySettingsService] Settings changed:', payload.new);

          // Update cache
          settingsCache = payload.new;
          settingsCacheTime = Date.now();

          if (onChange) {
            onChange(payload.new);
          }
        }
      )
      .subscribe();

    this.settingsSubscription = channel;

    return () => {
      console.log('[PrivacySettingsService] Unsubscribing from settings changes');
      supabase.removeChannel(channel);
      this.settingsSubscription = null;
    };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Create default privacy settings for a user
   * @private
   */
  async _createDefaultSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .insert({
          user_id: userId,
          ...DEFAULT_SETTINGS,
        })
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('[PrivacySettingsService] _createDefaultSettings error:', error);
      return { user_id: userId, ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Validate settings object
   * @private
   */
  _validateSettings(settings) {
    const validated = {};

    if (settings.allow_message_requests !== undefined) {
      validated.allow_message_requests = Boolean(settings.allow_message_requests);
    }

    if (settings.read_receipts_enabled !== undefined) {
      validated.read_receipts_enabled = Boolean(settings.read_receipts_enabled);
    }

    if (settings.typing_indicator_enabled !== undefined) {
      validated.typing_indicator_enabled = Boolean(settings.typing_indicator_enabled);
    }

    if (settings.online_status_enabled !== undefined) {
      validated.online_status_enabled = Boolean(settings.online_status_enabled);
    }

    if (settings.last_seen_enabled !== undefined) {
      validated.last_seen_enabled = Boolean(settings.last_seen_enabled);
    }

    if (settings.allow_calls_from !== undefined) {
      if (['everyone', 'contacts_only', 'nobody'].includes(settings.allow_calls_from)) {
        validated.allow_calls_from = settings.allow_calls_from;
      }
    }

    return validated;
  }

  /**
   * Clear settings cache
   */
  clearCache() {
    settingsCache = null;
    settingsCacheTime = 0;
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    if (this.settingsSubscription) {
      supabase.removeChannel(this.settingsSubscription);
      this.settingsSubscription = null;
    }
    this.clearCache();
  }
}

// Export singleton instance
export const privacySettingsService = new PrivacySettingsService();
export default privacySettingsService;
