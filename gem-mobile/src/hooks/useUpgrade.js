/**
 * GEM Mobile - useUpgrade Hook
 * Simplifies upgrade flow integration across screens
 *
 * Usage:
 * const { showUpgradePopup, showUpgradeBanner, checkAccess, navigateToUpgrade } = useUpgrade();
 *
 * // When quota is reached
 * showUpgradePopup({
 *   tierType: 'chatbot',
 *   trigger: 'quota_reached',
 *   source: 'gem_master_chat',
 * });
 *
 * // Check if feature is accessible
 * const hasAccess = await checkAccess('scanner', 'advanced_patterns');
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUpgrade as useUpgradeContext } from '../contexts/UpgradeContext';
import {
  TIER_TYPES,
  TRIGGER_TYPES,
  getBannerByTrigger,
  trackImpression,
  trackClick,
  checkFeatureAccess,
  getNextTier,
} from '../services/upgradeService';

export const useUpgrade = () => {
  const navigation = useNavigation();
  const upgradeContext = useUpgradeContext();

  /**
   * Show upgrade popup for a specific trigger
   */
  const showUpgradePopup = useCallback(async (options = {}) => {
    const {
      tierType = TIER_TYPES.SCANNER,
      trigger = TRIGGER_TYPES.FEATURE_LOCKED,
      source = 'unknown',
      currentTier = 0,
      featureName = null,
    } = options;

    try {
      // Get banner config for this trigger
      const bannerConfig = await getBannerByTrigger(trigger, tierType);

      if (bannerConfig) {
        // Track impression
        await trackImpression(bannerConfig.id, source);

        // Show popup via context
        if (upgradeContext?.showUpgradePopup) {
          upgradeContext.showUpgradePopup({
            tierType,
            trigger,
            bannerConfig,
            source,
            currentTier,
            featureName,
          });
        }
      } else {
        // Fallback: navigate directly to upgrade screen
        navigateToUpgrade({ tierType, source });
      }
    } catch (error) {
      console.error('[useUpgrade] Error showing popup:', error);
      // Fallback: navigate directly
      navigateToUpgrade({ tierType, source });
    }
  }, [upgradeContext]);

  /**
   * Navigate to upgrade screen
   * UpgradeScreen is in AccountStack, so we need to navigate through Account tab
   */
  const navigateToUpgrade = useCallback((options = {}) => {
    const {
      tierType = TIER_TYPES.SCANNER,
      requiredLevel = null,
      source = 'unknown',
    } = options;

    // Navigate to Account tab -> UpgradeScreen (nested navigator)
    navigation.navigate('Account', {
      screen: 'UpgradeScreen',
      params: {
        tierType,
        requiredLevel,
        source,
      },
    });
  }, [navigation]);

  /**
   * Check if user has access to a feature
   * Returns { hasAccess, requiredTier, message }
   */
  const checkAccess = useCallback(async (tierType, featureKey, currentTier = 0) => {
    try {
      const result = await checkFeatureAccess(tierType, featureKey, currentTier);
      return result;
    } catch (error) {
      console.error('[useUpgrade] Error checking access:', error);
      return { hasAccess: true, requiredTier: 0, message: null };
    }
  }, []);

  /**
   * Show upgrade prompt when quota is reached
   */
  const onQuotaReached = useCallback((tierType, source) => {
    showUpgradePopup({
      tierType,
      trigger: TRIGGER_TYPES.QUOTA_REACHED,
      source,
    });
  }, [showUpgradePopup]);

  /**
   * Show upgrade prompt when feature is locked
   */
  const onFeatureLocked = useCallback((tierType, featureName, source) => {
    showUpgradePopup({
      tierType,
      trigger: TRIGGER_TYPES.FEATURE_LOCKED,
      source,
      featureName,
    });
  }, [showUpgradePopup]);

  /**
   * Show upgrade prompt on session end (e.g., after completing a reading)
   */
  const onSessionEnd = useCallback((tierType, source) => {
    showUpgradePopup({
      tierType,
      trigger: TRIGGER_TYPES.SESSION_END,
      source,
    });
  }, [showUpgradePopup]);

  /**
   * Show first-time promo (for new users)
   */
  const onFirstTimePromo = useCallback((tierType, source) => {
    showUpgradePopup({
      tierType,
      trigger: TRIGGER_TYPES.FIRST_TIME_PROMO,
      source,
    });
  }, [showUpgradePopup]);

  /**
   * Hide any visible upgrade popup
   */
  const hideUpgradePopup = useCallback(() => {
    if (upgradeContext?.hideUpgradePopup) {
      upgradeContext.hideUpgradePopup();
    }
  }, [upgradeContext]);

  /**
   * Get the next tier info for upgrade CTA
   */
  const getUpgradeInfo = useCallback(async (tierType, currentTier) => {
    try {
      const nextTier = await getNextTier(tierType, currentTier);
      return nextTier;
    } catch (error) {
      console.error('[useUpgrade] Error getting upgrade info:', error);
      return null;
    }
  }, []);

  return {
    // Popup functions
    showUpgradePopup,
    hideUpgradePopup,

    // Navigation
    navigateToUpgrade,

    // Access checking
    checkAccess,

    // Convenience methods for common triggers
    onQuotaReached,
    onFeatureLocked,
    onSessionEnd,
    onFirstTimePromo,

    // Info
    getUpgradeInfo,

    // Constants
    TIER_TYPES,
    TRIGGER_TYPES,
  };
};

export default useUpgrade;
