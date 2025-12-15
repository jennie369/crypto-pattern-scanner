/**
 * Gemral - Feedback Service
 *
 * Manages user feedback, NPS ratings, and App Store review prompts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Storage keys
const STORAGE_KEYS = {
  INSTALL_DATE: '@gem_install_date',
  SESSION_COUNT: '@gem_session_count',
  LAST_NPS_SHOWN: '@gem_last_nps_shown',
  NPS_COMPLETED: '@gem_nps_completed',
  FEATURE_RATINGS: '@gem_feature_ratings',
};

// Configuration
const CONFIG = {
  MIN_DAYS_SINCE_INSTALL: 7,
  MIN_SESSIONS: 10,
  MIN_DAYS_BETWEEN_NPS: 30,
  HIGH_RATING_THRESHOLD: 4, // Rating >= 4 triggers App Store review
};

class FeedbackService {
  constructor() {
    this._initialized = false;
    this._installDate = null;
    this._sessionCount = 0;
    this._lastNPSShown = null;
    this._npsCompleted = false;
  }

  /**
   * Initialize feedback service
   */
  async initialize() {
    if (this._initialized) return;

    try {
      // Get or set install date
      let installDate = await AsyncStorage.getItem(STORAGE_KEYS.INSTALL_DATE);
      if (!installDate) {
        installDate = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.INSTALL_DATE, installDate);
      }
      this._installDate = new Date(installDate);

      // Get session count
      const sessionCount = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_COUNT);
      this._sessionCount = parseInt(sessionCount || '0', 10);

      // Get last NPS shown date
      const lastNPS = await AsyncStorage.getItem(STORAGE_KEYS.LAST_NPS_SHOWN);
      this._lastNPSShown = lastNPS ? new Date(lastNPS) : null;

      // Get NPS completed status
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.NPS_COMPLETED);
      this._npsCompleted = completed === 'true';

      this._initialized = true;
      console.log('[FeedbackService] Initialized, sessions:', this._sessionCount);
    } catch (error) {
      console.error('[FeedbackService] Initialize error:', error);
      this._initialized = true;
    }
  }

  /**
   * Track a new session (call on app open)
   */
  async trackSession() {
    this._sessionCount++;
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_COUNT, String(this._sessionCount));
    console.log('[FeedbackService] Session count:', this._sessionCount);
  }

  /**
   * Check if NPS prompt should be shown
   * Conditions:
   * - 7+ days since install
   * - 10+ sessions
   * - 30+ days since last NPS
   * - Not completed recently
   */
  shouldShowNPS() {
    if (!this._initialized) return false;

    const now = new Date();

    // Check days since install
    const daysSinceInstall = Math.floor(
      (now.getTime() - this._installDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceInstall < CONFIG.MIN_DAYS_SINCE_INSTALL) {
      console.log('[FeedbackService] Not enough days since install:', daysSinceInstall);
      return false;
    }

    // Check session count
    if (this._sessionCount < CONFIG.MIN_SESSIONS) {
      console.log('[FeedbackService] Not enough sessions:', this._sessionCount);
      return false;
    }

    // Check days since last NPS
    if (this._lastNPSShown) {
      const daysSinceNPS = Math.floor(
        (now.getTime() - this._lastNPSShown.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceNPS < CONFIG.MIN_DAYS_BETWEEN_NPS) {
        console.log('[FeedbackService] Not enough days since last NPS:', daysSinceNPS);
        return false;
      }
    }

    return true;
  }

  /**
   * Mark NPS as shown
   */
  async markNPSShown() {
    const now = new Date().toISOString();
    this._lastNPSShown = new Date(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_NPS_SHOWN, now);

    // Log to database
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback_prompts_log').insert({
          user_id: user.id,
          prompt_type: 'nps',
          action: 'shown',
        });
      }
    } catch (error) {
      console.warn('[FeedbackService] Log prompt error:', error);
    }
  }

  /**
   * Submit NPS feedback
   * @param {number} rating - 1-5 stars
   * @param {string} comment - Optional comment
   * @param {string} screen - Which screen feedback was given on
   */
  async submitFeedback(rating, comment = null, screen = null) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get app version
      const appVersion = Application.nativeApplicationVersion || 'unknown';

      // Device info
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
      };

      // Save to database
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id,
          rating,
          feedback_type: 'nps',
          comment,
          screen,
          app_version: appVersion,
          device_info: deviceInfo,
        })
        .select()
        .single();

      if (error) throw error;

      // Mark NPS as completed
      this._npsCompleted = true;
      await AsyncStorage.setItem(STORAGE_KEYS.NPS_COMPLETED, 'true');

      // Log completion
      if (user) {
        await supabase.from('feedback_prompts_log').insert({
          user_id: user.id,
          prompt_type: 'nps',
          action: 'completed',
          rating,
        });
      }

      console.log('[FeedbackService] Feedback submitted:', rating);
      return { success: true, data };
    } catch (error) {
      console.error('[FeedbackService] Submit error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Prompt App Store review (for high ratings)
   * @param {number} rating - The rating user gave
   */
  async promptAppStoreReview(rating) {
    if (rating < CONFIG.HIGH_RATING_THRESHOLD) {
      console.log('[FeedbackService] Rating too low for App Store review:', rating);
      return false;
    }

    try {
      // Check if App Store review is available
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        console.log('[FeedbackService] Store review not available');
        return false;
      }

      // Show native review dialog
      await StoreReview.requestReview();
      console.log('[FeedbackService] App Store review prompted');
      return true;
    } catch (error) {
      console.error('[FeedbackService] App Store review error:', error);
      return false;
    }
  }

  /**
   * Submit feature-specific rating (thumbs up/down)
   * @param {string} feature - Feature identifier
   * @param {boolean} isPositive - true = thumbs up, false = thumbs down
   * @param {string} comment - Optional comment
   */
  async rateFeature(feature, isPositive, comment = null) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Store locally for anonymous users
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FEATURE_RATINGS);
        const ratings = stored ? JSON.parse(stored) : {};
        ratings[feature] = { isPositive, comment, timestamp: new Date().toISOString() };
        await AsyncStorage.setItem(STORAGE_KEYS.FEATURE_RATINGS, JSON.stringify(ratings));
        return { success: true };
      }

      const { error } = await supabase.from('feature_ratings').upsert(
        {
          user_id: user.id,
          feature,
          is_positive: isPositive,
          comment,
        },
        { onConflict: 'user_id,feature' }
      );

      if (error) throw error;

      console.log('[FeedbackService] Feature rated:', feature, isPositive);
      return { success: true };
    } catch (error) {
      console.error('[FeedbackService] Rate feature error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's feature ratings
   */
  async getFeatureRatings() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FEATURE_RATINGS);
        return stored ? JSON.parse(stored) : {};
      }

      const { data, error } = await supabase
        .from('feature_ratings')
        .select('feature, is_positive')
        .eq('user_id', user.id);

      if (error) throw error;

      // Convert to map
      const ratings = {};
      (data || []).forEach((r) => {
        ratings[r.feature] = r.is_positive;
      });

      return ratings;
    } catch (error) {
      console.error('[FeedbackService] Get ratings error:', error);
      return {};
    }
  }

  /**
   * Dismiss NPS prompt (user chose "later")
   */
  async dismissNPS() {
    await this.markNPSShown();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('feedback_prompts_log').insert({
          user_id: user.id,
          prompt_type: 'nps',
          action: 'dismissed',
        });
      }
    } catch (error) {
      console.warn('[FeedbackService] Log dismiss error:', error);
    }
  }

  /**
   * Get testimonials for display
   */
  async getTestimonials(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[FeedbackService] Get testimonials error:', error);
      return [];
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Get current session count
   */
  getSessionCount() {
    return this._sessionCount;
  }

  /**
   * Reset for testing
   */
  async reset() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.INSTALL_DATE,
      STORAGE_KEYS.SESSION_COUNT,
      STORAGE_KEYS.LAST_NPS_SHOWN,
      STORAGE_KEYS.NPS_COMPLETED,
      STORAGE_KEYS.FEATURE_RATINGS,
    ]);
    this._initialized = false;
    await this.initialize();
  }
}

export default new FeedbackService();
