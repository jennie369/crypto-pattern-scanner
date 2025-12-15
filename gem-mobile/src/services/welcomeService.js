/**
 * Gemral - Welcome Service
 * Handles first launch detection and welcome screen tracking
 *
 * Features:
 * - Check if user has completed welcome
 * - Track slide progress (analytics)
 * - Sync with database for authenticated users
 * - Local AsyncStorage for offline/guest
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { WELCOME_STORAGE_KEYS } from '../config/welcomeConfig';

const { completed: WELCOME_COMPLETED_KEY, progress: WELCOME_PROGRESS_KEY } =
  WELCOME_STORAGE_KEYS;

class WelcomeService {
  constructor() {
    this._cache = {
      hasCompleted: null,
      checkedAt: null,
    };
  }

  /**
   * Check if user has completed welcome screens
   * First checks local storage, then syncs with database if authenticated
   * @returns {Promise<boolean>}
   */
  async hasCompletedWelcome() {
    try {
      // Check cache first (valid for 5 minutes)
      const now = Date.now();
      if (
        this._cache.hasCompleted !== null &&
        this._cache.checkedAt &&
        now - this._cache.checkedAt < 5 * 60 * 1000
      ) {
        return this._cache.hasCompleted;
      }

      // Check local storage first
      const localCompleted = await AsyncStorage.getItem(WELCOME_COMPLETED_KEY);
      if (localCompleted === 'true') {
        this._cache.hasCompleted = true;
        this._cache.checkedAt = now;
        return true;
      }

      // Check database if authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase.rpc('has_completed_welcome', {
          p_user_id: session.user.id,
        });

        if (data === true) {
          // Sync to local storage
          await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
          this._cache.hasCompleted = true;
          this._cache.checkedAt = now;
          return true;
        }
      }

      this._cache.hasCompleted = false;
      this._cache.checkedAt = now;
      return false;
    } catch (error) {
      console.error('[WelcomeService] Check completed error:', error);
      return false;
    }
  }

  /**
   * Mark welcome as completed
   * Saves to both local storage and database (if authenticated)
   * @param {number} slidesViewed - Number of slides viewed (default 5)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markWelcomeCompleted(slidesViewed = 5) {
    try {
      const timestamp = new Date().toISOString();

      // Save to local storage
      await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(
        WELCOME_PROGRESS_KEY,
        JSON.stringify({
          completedAt: timestamp,
          slidesViewed,
        })
      );

      // Update cache
      this._cache.hasCompleted = true;
      this._cache.checkedAt = Date.now();

      // Sync to database if authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.rpc('mark_welcome_completed', {
          p_user_id: session.user.id,
          p_slides_viewed: slidesViewed,
        });
      }

      console.log('[WelcomeService] Welcome marked as completed');
      return { success: true };
    } catch (error) {
      console.error('[WelcomeService] Mark completed error:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Track slide view for analytics
   * @param {string} slideId - ID of the slide viewed
   * @param {number} slideIndex - Index of the slide (0-based)
   * @returns {Promise<void>}
   */
  async trackSlideView(slideId, slideIndex) {
    try {
      // Get current progress
      const progressStr = await AsyncStorage.getItem(WELCOME_PROGRESS_KEY);
      const progress = progressStr
        ? JSON.parse(progressStr)
        : { slidesViewed: [] };

      // Ensure slidesViewed is an array
      if (!Array.isArray(progress.slidesViewed)) {
        progress.slidesViewed = [];
      }

      // Add slide if not already viewed
      if (!progress.slidesViewed.includes(slideId)) {
        progress.slidesViewed.push(slideId);
      }

      // Update progress
      progress.lastViewedSlide = slideIndex;
      progress.lastViewedAt = new Date().toISOString();

      // Save to local storage
      await AsyncStorage.setItem(
        WELCOME_PROGRESS_KEY,
        JSON.stringify(progress)
      );

      console.log('[WelcomeService] Tracked slide view:', slideId);
    } catch (error) {
      console.error('[WelcomeService] Track slide error:', error);
    }
  }

  /**
   * Get welcome progress
   * @returns {Promise<Object>}
   */
  async getProgress() {
    try {
      const progressStr = await AsyncStorage.getItem(WELCOME_PROGRESS_KEY);
      return progressStr ? JSON.parse(progressStr) : null;
    } catch (error) {
      console.error('[WelcomeService] Get progress error:', error);
      return null;
    }
  }

  /**
   * Reset welcome state (for testing/debugging)
   * @returns {Promise<{success: boolean}>}
   */
  async resetWelcome() {
    try {
      // Clear local storage
      await AsyncStorage.removeItem(WELCOME_COMPLETED_KEY);
      await AsyncStorage.removeItem(WELCOME_PROGRESS_KEY);

      // Clear cache
      this._cache.hasCompleted = null;
      this._cache.checkedAt = null;

      console.log('[WelcomeService] Welcome reset');
      return { success: true };
    } catch (error) {
      console.error('[WelcomeService] Reset error:', error);
      return { success: false };
    }
  }

  /**
   * Sync welcome state from database to local storage
   * Called after user login
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async syncFromDatabase(userId) {
    if (!userId) return;

    try {
      const { data } = await supabase.rpc('has_completed_welcome', {
        p_user_id: userId,
      });

      if (data === true) {
        await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
        this._cache.hasCompleted = true;
        this._cache.checkedAt = Date.now();
        console.log('[WelcomeService] Synced from database: completed');
      }
    } catch (error) {
      console.error('[WelcomeService] Sync from database error:', error);
    }
  }

  /**
   * Clear cache (call on logout)
   */
  clearCache() {
    this._cache.hasCompleted = null;
    this._cache.checkedAt = null;
  }
}

// Singleton instance
const welcomeServiceInstance = new WelcomeService();

export default welcomeServiceInstance;
export { WelcomeService };
