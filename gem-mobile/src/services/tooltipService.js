/**
 * Gemral - Tooltip Service (Enhanced)
 * Handles tooltip display logic, tracking, and feature discovery
 *
 * Features:
 * - Track viewed tooltips (77 tooltips across 12 categories)
 * - Track dismissed feature discoveries (15 prompts)
 * - Track tour progress (5 guided tours)
 * - Sync with database for authenticated users
 * - Local AsyncStorage for offline/guest
 *
 * Updated: December 15, 2025
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
  TOOLTIPS,
  FEATURE_DISCOVERY,
  TOOLTIP_SEQUENCES,
  TOOLTIP_STORAGE_KEYS,
} from '../config/tooltipConfig';

const {
  viewedTooltips: VIEWED_TOOLTIPS_KEY,
  dismissedDiscoveries: DISMISSED_DISCOVERIES_KEY,
  tourProgress: TOUR_PROGRESS_KEY,
} = TOOLTIP_STORAGE_KEYS;

// Legacy storage keys for backward compatibility
const LEGACY_KEYS = {
  COMPLETED_TUTORIALS: '@gem_completed_tutorials',
  SESSION_SHOWN: '@gem_session_shown_tutorials',
};

class TooltipService {
  constructor() {
    this._viewedTooltips = new Set();
    this._dismissedDiscoveries = new Set();
    this._tourProgress = {};
    this._sessionShown = new Set();
    this._initialized = false;
    this._userId = null;
  }

  /**
   * Initialize service - load from storage
   * @param {string} userId - Optional user ID
   * @returns {Promise<void>}
   */
  async initialize(userId = null) {
    if (this._initialized && this._userId === userId) return;

    try {
      this._userId = userId;

      // Load from local storage first
      await this._loadFromStorage();

      // Migrate legacy data if exists
      await this._migrateLegacyData();

      // Sync from database if authenticated
      if (userId) {
        await this._syncFromDatabase(userId);
      }

      this._initialized = true;
      console.log('[TooltipService] Initialized with', this._viewedTooltips.size, 'viewed tooltips');
    } catch (error) {
      console.error('[TooltipService] Initialize error:', error);
      this._initialized = true; // Allow app to continue
    }
  }

  /**
   * Load tooltip state from AsyncStorage
   * @private
   */
  async _loadFromStorage() {
    try {
      // Load viewed tooltips
      const viewedStr = await AsyncStorage.getItem(VIEWED_TOOLTIPS_KEY);
      if (viewedStr) {
        const viewed = JSON.parse(viewedStr);
        this._viewedTooltips = new Set(viewed || []);
      }

      // Load dismissed discoveries
      const dismissedStr = await AsyncStorage.getItem(DISMISSED_DISCOVERIES_KEY);
      if (dismissedStr) {
        const dismissed = JSON.parse(dismissedStr);
        this._dismissedDiscoveries = new Set(dismissed || []);
      }

      // Load tour progress
      const tourStr = await AsyncStorage.getItem(TOUR_PROGRESS_KEY);
      if (tourStr) {
        this._tourProgress = JSON.parse(tourStr) || {};
      }
    } catch (error) {
      console.error('[TooltipService] Load from storage error:', error);
    }
  }

  /**
   * Migrate legacy completed tutorials to new format
   * @private
   */
  async _migrateLegacyData() {
    try {
      const legacyStr = await AsyncStorage.getItem(LEGACY_KEYS.COMPLETED_TUTORIALS);
      if (legacyStr) {
        const legacy = JSON.parse(legacyStr);
        (legacy || []).forEach((key) => this._viewedTooltips.add(key));
        await this._saveToStorage();
        // Remove legacy key after migration
        await AsyncStorage.removeItem(LEGACY_KEYS.COMPLETED_TUTORIALS);
        console.log('[TooltipService] Migrated legacy data');
      }
    } catch (error) {
      console.error('[TooltipService] Migration error:', error);
    }
  }

  /**
   * Sync tooltip state from database
   * @private
   */
  async _syncFromDatabase(userId) {
    try {
      const { data } = await supabase.rpc('get_viewed_tooltips', {
        p_user_id: userId,
      });

      if (data && Array.isArray(data)) {
        data.forEach((key) => this._viewedTooltips.add(key));
        await this._saveToStorage();
      }
    } catch (error) {
      // Table might not exist yet, just log
      console.log('[TooltipService] Sync from database skipped:', error?.message);
    }
  }

  /**
   * Save tooltip state to AsyncStorage
   * @private
   */
  async _saveToStorage() {
    try {
      await AsyncStorage.setItem(
        VIEWED_TOOLTIPS_KEY,
        JSON.stringify([...this._viewedTooltips])
      );
      await AsyncStorage.setItem(
        DISMISSED_DISCOVERIES_KEY,
        JSON.stringify([...this._dismissedDiscoveries])
      );
      await AsyncStorage.setItem(
        TOUR_PROGRESS_KEY,
        JSON.stringify(this._tourProgress)
      );
    } catch (error) {
      console.error('[TooltipService] Save to storage error:', error);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // TOOLTIP METHODS
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Check if a tooltip has been viewed
   * @param {string} tooltipKey
   * @returns {boolean}
   */
  hasViewedTooltip(tooltipKey) {
    return this._viewedTooltips.has(tooltipKey);
  }

  /**
   * Legacy alias - check if should show tutorial
   * @param {string} feature
   * @returns {boolean}
   */
  shouldShowTutorial(feature) {
    if (!this._initialized) return false;
    if (this._viewedTooltips.has(feature)) return false;
    if (this._sessionShown.has(feature)) return false;
    return !!TOOLTIPS[feature];
  }

  /**
   * Mark a tooltip as viewed
   * @param {string} tooltipKey
   * @returns {Promise<void>}
   */
  async markTooltipViewed(tooltipKey) {
    if (this._viewedTooltips.has(tooltipKey)) return;

    try {
      this._viewedTooltips.add(tooltipKey);
      await this._saveToStorage();

      // Sync to database if authenticated
      if (this._userId) {
        try {
          await supabase.rpc('mark_tooltip_viewed', {
            p_user_id: this._userId,
            p_tooltip_key: tooltipKey,
          });
        } catch (dbError) {
          console.log('[TooltipService] DB sync skipped:', dbError?.message);
        }
      }

      console.log('[TooltipService] Marked tooltip viewed:', tooltipKey);
    } catch (error) {
      console.error('[TooltipService] Mark tooltip viewed error:', error);
    }
  }

  /**
   * Legacy alias - mark tutorial complete
   * @param {string} feature
   * @param {boolean} skipped
   */
  async markTutorialComplete(feature, skipped = false) {
    await this.markTooltipViewed(feature);
  }

  /**
   * Check if a feature discovery has been dismissed
   * @param {string} discoveryKey
   * @returns {boolean}
   */
  hasDiscoveryDismissed(discoveryKey) {
    return this._dismissedDiscoveries.has(discoveryKey);
  }

  /**
   * Mark a feature discovery as dismissed
   * @param {string} discoveryKey
   * @returns {Promise<void>}
   */
  async markDiscoveryDismissed(discoveryKey) {
    if (this._dismissedDiscoveries.has(discoveryKey)) return;

    try {
      this._dismissedDiscoveries.add(discoveryKey);
      await this._saveToStorage();

      // Sync to database if authenticated
      if (this._userId) {
        try {
          await supabase.rpc('mark_discovery_dismissed', {
            p_user_id: this._userId,
            p_discovery_key: discoveryKey,
          });
        } catch (dbError) {
          console.log('[TooltipService] DB sync skipped:', dbError?.message);
        }
      }

      console.log('[TooltipService] Marked discovery dismissed:', discoveryKey);
    } catch (error) {
      console.error('[TooltipService] Mark discovery dismissed error:', error);
    }
  }

  /**
   * Get tooltips for a specific screen
   * @param {string} screenName
   * @param {Object} options - { tier, role, showOnceOnly }
   * @returns {Array<Object>}
   */
  getTooltipsForScreen(screenName, options = {}) {
    const { tier = 'free', role = 'user', showOnceOnly = false } = options;

    return Object.values(TOOLTIPS).filter((tooltip) => {
      // Must match screen
      if (tooltip?.screen !== screenName) return false;

      // Check tier requirement
      if (tooltip?.tier) {
        const tierRank = { free: 0, tier1: 1, tier2: 2, tier3: 3 };
        const requiredRank = tierRank[tooltip.tier] || 0;
        const userRank = tierRank[tier?.toLowerCase()] || 0;
        if (userRank < requiredRank) return false;
      }

      // Check role requirement
      if (tooltip?.role && tooltip.role !== role) return false;

      // Check if already viewed (for showOnce tooltips)
      if (tooltip?.showOnce && this.hasViewedTooltip(tooltip.key)) {
        return false;
      }

      // Filter showOnceOnly
      if (showOnceOnly && !tooltip?.showOnce) return false;

      return true;
    });
  }

  /**
   * Get the next tooltip to show for a screen
   * @param {string} screenName
   * @param {Object} options
   * @returns {Object|null}
   */
  getNextTooltipForScreen(screenName, options = {}) {
    const tooltips = this.getTooltipsForScreen(screenName, options);

    // Sort by priority (lower = higher priority)
    tooltips.sort((a, b) => (a?.priority || 99) - (b?.priority || 99));

    // Return first unviewed showOnce tooltip
    const next = tooltips.find((t) => t?.showOnce && !this.hasViewedTooltip(t.key));

    if (next) {
      this._sessionShown.add(next.key);
    }

    return next || null;
  }

  /**
   * Legacy alias - get tutorial for screen
   * @param {string} screenName
   * @returns {Object|null}
   */
  getTutorialForScreen(screenName) {
    return this.getNextTooltipForScreen(screenName);
  }

  /**
   * Legacy alias - get tutorial prompt
   * @param {string} feature
   * @returns {Object|null}
   */
  getTutorialPrompt(feature) {
    return TOOLTIPS[feature] || null;
  }

  /**
   * Get feature discoveries that should be shown
   * @param {Object} userStats - { scanCount, daysActive, tradeCount, postCount, quotaReached }
   * @param {string} tier - User's tier
   * @returns {Array<Object>}
   */
  getActiveDiscoveries(userStats = {}, tier = 'free') {
    const {
      scanCount = 0,
      daysActive = 0,
      tradeCount = 0,
      postCount = 0,
      quotaReached = false,
      featureLocked = null,
      streakWarning = false,
      achievementUnlocked = false,
      levelUp = false,
    } = userStats;

    return Object.values(FEATURE_DISCOVERY).filter((discovery) => {
      // Skip if already dismissed
      if (this.hasDiscoveryDismissed(discovery?.key)) return false;

      // Check tier requirement
      if (discovery?.tier) {
        const tierRank = { free: 0, tier1: 1, tier2: 2, tier3: 3 };
        const requiredRank = tierRank[discovery.tier] || 0;
        const userRank = tierRank[tier?.toLowerCase()] || 0;
        if (userRank < requiredRank) return false;
      }

      // Check trigger conditions
      const trigger = discovery?.trigger;
      if (!trigger) return false;

      switch (trigger.action) {
        case 'scan_count':
          return scanCount >= (trigger.value || 0);
        case 'days_active':
          return daysActive >= (trigger.value || 0);
        case 'trade_count':
          return tradeCount >= (trigger.value || 0);
        case 'post_count':
          return postCount === (trigger.value || 0);
        case 'quota_reached':
          return quotaReached === trigger.value;
        case 'feature_locked':
          return featureLocked === trigger.feature;
        case 'streak_warning':
          return streakWarning === trigger.value;
        case 'achievement_unlocked':
          return achievementUnlocked === trigger.value;
        case 'level_up':
          return levelUp === trigger.value;
        default:
          return false;
      }
    });
  }

  /**
   * Get highest priority active discovery
   * @param {Object} userStats
   * @param {string} tier
   * @returns {Object|null}
   */
  getNextDiscovery(userStats = {}, tier = 'free') {
    const discoveries = this.getActiveDiscoveries(userStats, tier);
    discoveries.sort((a, b) => (a?.priority || 99) - (b?.priority || 99));
    return discoveries[0] || null;
  }

  // ════════════════════════════════════════════════════════════════════════
  // TOUR MANAGEMENT
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Get tour progress
   * @param {string} tourName
   * @returns {Object}
   */
  getTourProgress(tourName) {
    return this._tourProgress[tourName] || { step: 0, completed: false };
  }

  /**
   * Update tour progress
   * @param {string} tourName
   * @param {number} step
   * @param {boolean} completed
   * @returns {Promise<void>}
   */
  async updateTourProgress(tourName, step, completed = false) {
    try {
      this._tourProgress[tourName] = {
        step,
        completed,
        updatedAt: new Date().toISOString(),
        ...(completed ? { completedAt: new Date().toISOString() } : {}),
      };

      await this._saveToStorage();

      // Sync to database if authenticated
      if (this._userId) {
        try {
          await supabase.rpc('update_tour_progress', {
            p_user_id: this._userId,
            p_tour_name: tourName,
            p_step: step,
            p_completed: completed,
          });
        } catch (dbError) {
          console.log('[TooltipService] Tour progress DB sync skipped');
        }
      }

      console.log('[TooltipService] Updated tour progress:', tourName, step);
    } catch (error) {
      console.error('[TooltipService] Update tour progress error:', error);
    }
  }

  /**
   * Get next step in a tour
   * @param {string} tourName
   * @returns {Object|null}
   */
  getNextTourStep(tourName) {
    const tour = TOOLTIP_SEQUENCES[tourName];
    if (!tour) return null;

    const progress = this.getTourProgress(tourName);
    if (progress.completed) return null;

    const nextStepKey = tour.steps[progress.step];
    if (!nextStepKey) return null;

    const tooltip = TOOLTIPS[nextStepKey];
    return tooltip
      ? {
          ...tooltip,
          tourName,
          tourStep: progress.step,
          totalSteps: tour.steps.length,
          isLastStep: progress.step === tour.steps.length - 1,
        }
      : null;
  }

  /**
   * Advance to next tour step
   * @param {string} tourName
   * @returns {Promise<Object|null>}
   */
  async advanceTourStep(tourName) {
    const tour = TOOLTIP_SEQUENCES[tourName];
    if (!tour) return null;

    const progress = this.getTourProgress(tourName);
    const nextStep = progress.step + 1;
    const isCompleted = nextStep >= tour.steps.length;

    await this.updateTourProgress(tourName, nextStep, isCompleted);

    if (isCompleted) {
      console.log('[TooltipService] Tour completed:', tourName);
      return { completed: true, reward: tour.completionReward };
    }

    return this.getNextTourStep(tourName);
  }

  /**
   * Check if a tour is available
   * @param {string} tourName
   * @returns {boolean}
   */
  isTourAvailable(tourName) {
    const tour = TOOLTIP_SEQUENCES[tourName];
    if (!tour) return false;
    const progress = this.getTourProgress(tourName);
    return !progress.completed;
  }

  /**
   * Get all available tours
   * @returns {Array<Object>}
   */
  getAvailableTours() {
    return Object.entries(TOOLTIP_SEQUENCES)
      .filter(([name]) => this.isTourAvailable(name))
      .map(([name, tour]) => ({
        name,
        ...tour,
        progress: this.getTourProgress(name),
      }));
  }

  // ════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Get tooltip by key
   * @param {string} tooltipKey
   * @returns {Object|null}
   */
  getTooltip(tooltipKey) {
    return TOOLTIPS[tooltipKey] || null;
  }

  /**
   * Get feature discovery by key
   * @param {string} discoveryKey
   * @returns {Object|null}
   */
  getDiscovery(discoveryKey) {
    return FEATURE_DISCOVERY[discoveryKey] || null;
  }

  /**
   * Get all viewed tooltips
   * @returns {Array<string>}
   */
  getViewedTooltips() {
    return [...this._viewedTooltips];
  }

  /**
   * Get all dismissed discoveries
   * @returns {Array<string>}
   */
  getDismissedDiscoveries() {
    return [...this._dismissedDiscoveries];
  }

  /**
   * Get tutorial stats
   * @returns {Object}
   */
  getStats() {
    const totalTooltips = Object.keys(TOOLTIPS).length;
    const viewedCount = this._viewedTooltips.size;
    const totalDiscoveries = Object.keys(FEATURE_DISCOVERY).length;
    const dismissedCount = this._dismissedDiscoveries.size;
    const totalTours = Object.keys(TOOLTIP_SEQUENCES).length;
    const completedTours = Object.values(this._tourProgress).filter(
      (p) => p?.completed
    ).length;

    return {
      tooltips: {
        total: totalTooltips,
        viewed: viewedCount,
        remaining: totalTooltips - viewedCount,
      },
      discoveries: {
        total: totalDiscoveries,
        dismissed: dismissedCount,
        remaining: totalDiscoveries - dismissedCount,
      },
      tours: {
        total: totalTours,
        completed: completedTours,
        remaining: totalTours - completedTours,
      },
    };
  }

  /**
   * Check if initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Reset all tooltip state (for testing)
   * @returns {Promise<void>}
   */
  async reset() {
    try {
      this._viewedTooltips.clear();
      this._dismissedDiscoveries.clear();
      this._tourProgress = {};
      this._sessionShown.clear();
      this._initialized = false;

      await AsyncStorage.removeItem(VIEWED_TOOLTIPS_KEY);
      await AsyncStorage.removeItem(DISMISSED_DISCOVERIES_KEY);
      await AsyncStorage.removeItem(TOUR_PROGRESS_KEY);
      await AsyncStorage.removeItem(LEGACY_KEYS.COMPLETED_TUTORIALS);
      await AsyncStorage.removeItem(LEGACY_KEYS.SESSION_SHOWN);

      console.log('[TooltipService] Reset complete');
    } catch (error) {
      console.error('[TooltipService] Reset error:', error);
    }
  }

  /**
   * Legacy alias - reset all tutorials
   */
  async resetAllTutorials() {
    await this.reset();
  }

  /**
   * Clear session shown (call on app start)
   */
  async clearSessionShown() {
    this._sessionShown.clear();
  }

  /**
   * Clear cache on logout
   */
  clearCache() {
    this._viewedTooltips.clear();
    this._dismissedDiscoveries.clear();
    this._tourProgress = {};
    this._sessionShown.clear();
    this._initialized = false;
    this._userId = null;
  }

  /**
   * Sync from database for user
   * @param {string} userId
   */
  async syncFromDatabase(userId) {
    if (userId) {
      this._userId = userId;
      await this._syncFromDatabase(userId);
    }
  }
}

// Singleton instance
const tooltipServiceInstance = new TooltipService();

export default tooltipServiceInstance;
export { TooltipService };
