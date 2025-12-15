/**
 * GEM Mobile - Tier Access Service
 * Issue #21: Full tier service for Scanner
 * Manages user tier permissions and feature access
 *
 * Updated: December 15, 2025
 * - Removed in-memory scan count (was NOT persisting!)
 * - Now uses QuotaService for database-backed quota management
 * - Quota resets at midnight Vietnam time (UTC+7)
 */

import {
  TIER_ACCESS,
  ALL_PATTERNS,
  getMaxCoins,
  getAllowedPatterns,
  isPatternAllowed,
  hasFeature,
  getUpgradeBenefits,
} from '../config/tierAccess';
import QuotaService from './quotaService';

class TierAccessService {
  constructor() {
    this.userTier = 'FREE';
    this.tierConfig = TIER_ACCESS.FREE;
    this.userId = null;
    // REMOVED: dailyScanCount and lastScanReset (now in database via QuotaService)
  }

  /**
   * Set user tier based on profile
   * @param {string} tier - Tier name
   * @param {string} userId - User ID for quota tracking
   */
  setTier(tier, userId = null) {
    const validTier = TIER_ACCESS[tier] ? tier : 'FREE';
    this.userTier = validTier;
    this.tierConfig = TIER_ACCESS[validTier];
    if (userId) {
      this.userId = userId;
    }
    console.log(`[TierAccessService] Set tier to: ${validTier}, userId: ${userId || 'N/A'}`);
    return this.tierConfig;
  }

  /**
   * Set user ID for quota tracking
   * @param {string} userId
   */
  setUserId(userId) {
    this.userId = userId;
    console.log(`[TierAccessService] Set userId: ${userId}`);
  }

  /**
   * Get current tier name
   */
  getTierName() {
    return this.tierConfig.name;
  }

  /**
   * Get current tier config
   */
  getTierConfig() {
    return this.tierConfig;
  }

  /**
   * Get maximum coins allowed for current tier
   */
  getMaxCoins() {
    return getMaxCoins(this.userTier);
  }

  /**
   * Get allowed coins from all available coins
   */
  getAllowedCoins(allCoins) {
    const { coins } = this.tierConfig;

    if (coins.max === -1 || coins.list === 'ALL') {
      return allCoins; // All coins allowed
    }

    if (Array.isArray(coins.list)) {
      // Filter by specific list
      return allCoins.filter(c => coins.list.includes(c.symbol));
    }

    // TOP_XX - return top N by market cap
    const topN = parseInt(coins.list?.replace('TOP_', '')) || coins.max;
    return allCoins.slice(0, topN);
  }

  /**
   * Get allowed patterns for current tier
   */
  getAllowedPatterns() {
    return getAllowedPatterns(this.userTier);
  }

  /**
   * Get all pattern info (for displaying locked patterns)
   */
  getAllPatternsWithAccess() {
    const allowedPatterns = this.getAllowedPatterns();

    return ALL_PATTERNS.map(pattern => ({
      ...pattern,
      isAllowed: allowedPatterns.includes(pattern.key),
    }));
  }

  /**
   * Check if a specific pattern is allowed
   */
  isPatternAllowed(patternKey) {
    return isPatternAllowed(this.userTier, patternKey);
  }

  /**
   * Check if a feature is enabled
   */
  hasFeature(featureName) {
    return hasFeature(this.userTier, featureName);
  }

  /**
   * Check scan limit for today (DATABASE-BACKED)
   * Uses QuotaService for persistent quota tracking
   * Resets at midnight Vietnam time (UTC+7)
   *
   * @returns {Promise<Object>} { allowed, remaining, limit, used, unlimited }
   */
  async checkScanLimit() {
    try {
      if (!this.userId) {
        console.warn('[TierAccessService] No userId set, returning tier config limit');
        const limit = this.tierConfig.limits.scansPerDay;
        return {
          allowed: true,
          remaining: limit === -1 ? Infinity : limit,
          limit: limit === -1 ? -1 : limit,
          used: 0,
          unlimited: limit === -1,
        };
      }

      // Get quota from database (with caching)
      const quota = await QuotaService.checkScannerQuota(this.userId);

      return {
        allowed: quota.unlimited || quota.remaining > 0,
        remaining: quota.unlimited ? Infinity : quota.remaining,
        limit: quota.limit,
        used: quota.used,
        unlimited: quota.unlimited,
        tier: quota.tier,
        resetAt: quota.resetAt,
      };
    } catch (error) {
      console.error('[TierAccessService] Error checking scan limit:', error);
      // Fallback to tier config
      const limit = this.tierConfig.limits.scansPerDay;
      return {
        allowed: true,
        remaining: limit === -1 ? Infinity : limit,
        limit: limit === -1 ? -1 : limit,
        used: 0,
        unlimited: limit === -1,
      };
    }
  }

  /**
   * Synchronous check for UI (uses cached data)
   * For immediate UI updates, use checkScanLimit() for accurate data
   */
  checkScanLimitSync() {
    const limit = this.tierConfig.limits.scansPerDay;
    return {
      allowed: true,
      remaining: limit === -1 ? Infinity : limit,
      limit: limit === -1 ? -1 : limit,
      used: 0,
      unlimited: limit === -1,
    };
  }

  /**
   * Increment scan count (DATABASE-BACKED)
   * Increments in database and invalidates cache
   *
   * @returns {Promise<Object>} { success, used, remaining, limitReached }
   */
  async incrementScanCount() {
    try {
      if (!this.userId) {
        console.warn('[TierAccessService] No userId set, cannot increment scan count');
        return { success: false, error: 'No userId' };
      }

      const result = await QuotaService.decrementScannerQuota(this.userId);

      console.log(`[TierAccessService] Scan count incremented: ${result.used}/${result.remaining === -1 ? '∞' : result.remaining + result.used}`);

      return result;
    } catch (error) {
      console.error('[TierAccessService] Error incrementing scan count:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user can scan (quick check)
   * @returns {Promise<boolean>}
   */
  async canScan() {
    if (!this.userId) return true; // Allow if not logged in (guest mode)
    return QuotaService.canScan(this.userId);
  }

  /**
   * Force refresh quota from database
   * @returns {Promise<Object>}
   */
  async refreshQuota() {
    if (!this.userId) return null;
    return QuotaService.refreshQuota(this.userId);
  }

  /**
   * Clear quota cache (call on logout or user switch)
   */
  clearQuotaCache() {
    QuotaService.clearCache();
    console.log('[TierAccessService] Quota cache cleared');
  }

  /**
   * Filter scan results based on tier
   * Removes patterns that are not allowed
   */
  filterScanResults(results) {
    if (!results?.patterns) return results;

    const allowedPatterns = this.getAllowedPatterns();

    const filteredPatterns = results.patterns.filter(pattern => {
      const patternKey = pattern.name || pattern.type;
      return allowedPatterns.includes(patternKey);
    });

    // Mark locked patterns (optional - for UI to show upgrade prompts)
    const allPatterns = results.patterns.map(pattern => {
      const patternKey = pattern.name || pattern.type;
      return {
        ...pattern,
        isLocked: !allowedPatterns.includes(patternKey),
      };
    });

    return {
      ...results,
      patterns: filteredPatterns,
      allPatterns, // Include all patterns with locked flag
      filteredCount: filteredPatterns.length,
      totalCount: results.patterns.length,
    };
  }

  /**
   * Get upgrade info for current tier
   */
  getUpgradeInfo() {
    return getUpgradeBenefits(this.userTier);
  }

  /**
   * Check if user can use Paper Trading
   */
  canPaperTrade() {
    return this.hasFeature('paperTrade');
  }

  /**
   * Check if user can view Advanced Stats
   */
  canViewAdvancedStats() {
    return this.hasFeature('advancedStats');
  }

  /**
   * Check if user can use AI Signals
   */
  canUseAISignals() {
    return this.hasFeature('aiSignals');
  }

  /**
   * Check if user can use Whale Tracking
   */
  canUseWhaleTracking() {
    return this.hasFeature('whaleTracking');
  }

  /**
   * Get feature access summary
   */
  getFeatureAccess() {
    return {
      scan: this.hasFeature('scan'),
      alerts: this.hasFeature('alerts'),
      paperTrade: this.hasFeature('paperTrade'),
      advancedStats: this.hasFeature('advancedStats'),
      aiSignals: this.hasFeature('aiSignals'),
      whaleTracking: this.hasFeature('whaleTracking'),
    };
  }

  /**
   * Generate upgrade prompt message
   */
  getUpgradePromptMessage(feature) {
    const upgradeInfo = this.getUpgradeInfo();
    if (!upgradeInfo) {
      return null; // Already at max tier
    }

    const featureMessages = {
      coins: `Tier ${this.userTier} chỉ được chọn ${this.getMaxCoins()} coins. Nâng cấp lên ${upgradeInfo.nextTierName} để có thêm coins!`,
      patterns: `Pattern này chỉ có ở tier cao hơn. Nâng cấp lên ${upgradeInfo.nextTierName} để mở khóa!`,
      paperTrade: `Paper Trading chỉ có ở tier cao hơn. Nâng cấp lên ${upgradeInfo.nextTierName} để sử dụng!`,
      advancedStats: `Advanced Statistics chỉ có ở ${upgradeInfo.nextTierName} trở lên.`,
      aiSignals: `AI Signals là tính năng của ${upgradeInfo.nextTierName} trở lên.`,
      scan: `Bạn đã hết lượt scan hôm nay. Nâng cấp để có unlimited scans!`,
    };

    return {
      message: featureMessages[feature] || `Tính năng này yêu cầu tier cao hơn.`,
      nextTier: upgradeInfo.nextTierName,
      benefits: upgradeInfo.benefits,
    };
  }
}

// Export singleton instance
export const tierAccessService = new TierAccessService();
export default tierAccessService;
