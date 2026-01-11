// ============================================================
// UPGRADE CONTEXT
// Purpose: Global state management cho upgrade flow
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import upgradeService from '../services/upgradeService';

const UpgradeContext = createContext(null);

export const UpgradeProvider = ({ children }) => {
  // State
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show popup
  const showUpgradePopup = useCallback(async (triggerType, screenName, options = {}) => {
    try {
      setIsLoading(true);

      const banner = await upgradeService.getBannerByTrigger(triggerType, screenName);
      if (!banner) return false;

      // Check if should show
      const shouldShow = await upgradeService.shouldShowBanner(banner.banner_key);
      if (!shouldShow) return false;

      // Get tier info
      let tierInfo = null;
      if (banner.target_tier_type) {
        tierInfo = await upgradeService.getFeaturedTier(banner.target_tier_type);
      }

      setCurrentPopup({
        ...banner,
        tierInfo,
        ...options,
      });

      // Track impression
      await upgradeService.trackImpression(banner.id, screenName);

      return true;
    } catch (error) {
      console.error('[UpgradeContext] showUpgradePopup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hide popup
  const hideUpgradePopup = useCallback(async () => {
    if (currentPopup) {
      await upgradeService.trackDismiss(currentPopup.id, currentPopup.trigger_screen);
    }
    setCurrentPopup(null);
  }, [currentPopup]);

  // Show banner
  const showUpgradeBanner = useCallback(async (triggerType, screenName) => {
    try {
      const banner = await upgradeService.getBannerByTrigger(triggerType, screenName);
      if (!banner) return false;

      setCurrentBanner(banner);
      await upgradeService.trackImpression(banner.id, screenName);
      return true;
    } catch (error) {
      console.error('[UpgradeContext] showUpgradeBanner error:', error);
      return false;
    }
  }, []);

  // Hide banner
  const hideUpgradeBanner = useCallback(() => {
    setCurrentBanner(null);
  }, []);

  // Handle upgrade click
  const handleUpgradeClick = useCallback(async (navigation) => {
    if (!currentPopup) return;

    await upgradeService.trackClick(
      currentPopup.id,
      currentPopup.trigger_screen,
      currentPopup.target_tier_type,
      currentPopup.tierInfo?.tier_level
    );

    // Navigate to upgrade screen
    navigation.navigate('UpgradeScreen', {
      tierType: currentPopup.target_tier_type,
      source: currentPopup.trigger_screen,
    });

    setCurrentPopup(null);
  }, [currentPopup]);

  // Show popup by banner key
  const showPopupByKey = useCallback(async (bannerKey, screenName, options = {}) => {
    try {
      setIsLoading(true);

      const banner = await upgradeService.getBannerByKey(bannerKey);
      if (!banner) return false;

      // Get tier info
      let tierInfo = null;
      if (banner.target_tier_type) {
        tierInfo = await upgradeService.getFeaturedTier(banner.target_tier_type);
      }

      setCurrentPopup({
        ...banner,
        tierInfo,
        ...options,
      });

      // Track impression
      await upgradeService.trackImpression(banner.id, screenName);

      return true;
    } catch (error) {
      console.error('[UpgradeContext] showPopupByKey error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    // State
    currentPopup,
    currentBanner,
    isLoading,

    // Actions
    showUpgradePopup,
    hideUpgradePopup,
    showUpgradeBanner,
    hideUpgradeBanner,
    handleUpgradeClick,
    showPopupByKey,
  };

  return (
    <UpgradeContext.Provider value={value}>
      {children}
    </UpgradeContext.Provider>
  );
};

export const useUpgrade = () => {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error('useUpgrade must be used within UpgradeProvider');
  }
  return context;
};

export default UpgradeContext;
