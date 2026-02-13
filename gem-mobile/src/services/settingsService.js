/**
 * Gemral - Settings Service
 * Handles settings persistence with Supabase and AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Storage keys
const SETTINGS_STORAGE_KEY = '@gemral_settings';
const CACHE_STORAGE_KEY = '@gemral_cache';

// Default settings
const DEFAULT_SETTINGS = {
  language: 'vi',
  currency: 'VND',
  theme: 'dark',
  fontSize: 'medium',
  soundEnabled: true,
  hapticEnabled: true,
};

/**
 * Settings Service
 */
export const settingsService = {
  /**
   * Get user preferences from Supabase
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} User preferences or null
   */
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      if (!data) return null;

      return {
        language: data.language,
        currency: data.currency,
        theme: data.theme,
        fontSize: data.font_size,
        soundEnabled: data.sound_enabled,
        hapticEnabled: data.haptic_enabled,
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  },

  /**
   * Save user preferences to Supabase
   * @param {string} userId - User ID
   * @param {object} settings - Settings object
   * @returns {Promise<boolean>} Success status
   */
  async saveUserPreferences(userId, settings) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          language: settings.language,
          currency: settings.currency,
          theme: settings.theme,
          font_size: settings.fontSize,
          sound_enabled: settings.soundEnabled,
          haptic_enabled: settings.hapticEnabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveUserPreferences:', error);
      return false;
    }
  },

  /**
   * Get settings from local storage
   * @returns {Promise<object>} Settings object
   */
  async getLocalSettings() {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting local settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save settings to local storage
   * @param {object} settings - Settings object
   * @returns {Promise<boolean>} Success status
   */
  async saveLocalSettings(settings) {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving local settings:', error);
      return false;
    }
  },

  /**
   * Clear all local settings
   * @returns {Promise<boolean>} Success status
   */
  async clearLocalSettings() {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing local settings:', error);
      return false;
    }
  },

  /**
   * Get cache size (approximate)
   * @returns {Promise<string>} Cache size string
   */
  async getCacheSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('@gemral_cache'));
      const items = await AsyncStorage.multiGet(cacheKeys);

      let totalSize = 0;
      items.forEach(([key, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });

      // Convert to human readable
      if (totalSize < 1024) {
        return `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        return `${(totalSize / 1024).toFixed(1)} KB`;
      } else {
        return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch (error) {
      console.error('Error getting cache size:', error);
      return '0 B';
    }
  },

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k =>
        k.startsWith('@gemral_cache') ||
        k.startsWith('@gemral_image') ||
        k.startsWith('image_') ||
        k.startsWith('product_') ||
        k.startsWith('course_')
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },

  /**
   * Sync settings between local and remote
   * @param {string} userId - User ID
   * @returns {Promise<object>} Merged settings
   */
  async syncSettings(userId) {
    try {
      const localSettings = await this.getLocalSettings();
      const remoteSettings = await this.getUserPreferences(userId);

      if (!remoteSettings) {
        // No remote settings, save local to remote
        await this.saveUserPreferences(userId, localSettings);
        return localSettings;
      }

      // Use remote settings as source of truth
      await this.saveLocalSettings(remoteSettings);
      return remoteSettings;
    } catch (error) {
      console.error('Error syncing settings:', error);
      return await this.getLocalSettings();
    }
  },

  /**
   * Get app version info
   * @returns {object} Version info
   */
  getAppVersion() {
    // These would be pulled from app.json or Constants in real app
    return {
      version: '1.0.0',
      build: '1',
      codePush: null,
    };
  },

  /**
   * Delete user preferences (for account deletion)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUserPreferences(userId) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user preferences:', error);
        return false;
      }

      await this.clearLocalSettings();
      return true;
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return false;
    }
  },
};

export default settingsService;
