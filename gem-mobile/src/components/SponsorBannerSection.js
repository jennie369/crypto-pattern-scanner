/**
 * GEM Mobile - Sponsor Banner Section Component
 * Reusable component for displaying sponsor banners across screens
 *
 * NEW: Now uses SponsorBanner wrapper to support all layout types:
 * - 'compact': Small card-style banner with image on left
 * - 'post': Post-style banner that mimics a regular forum post
 * - 'featured': Premium hero-style banner with gradient overlay
 *
 * Usage:
 * - Simple way: <SponsorBannerSection screenName="shop" />
 * - Distributed: Use useSponsorBanners hook + SponsorBanner component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '../utils/tokens';
import { useAuth } from '../contexts/AuthContext';
import { sponsorBannerService } from '../services/sponsorBannerService';
import SponsorBanner from './SponsorBanner';

// Global banner cache - shared across all screens to avoid redundant API calls
const bannerCache = {
  data: {},
  lastFetch: {},
  CACHE_DURATION: 60000, // 60 seconds cache for banners
};

/**
 * Custom hook to fetch banners for a screen
 * Use this hook when you need to manually control banner distribution
 * Now with CACHING to avoid redundant API calls
 */
export function useSponsorBanners(screenName, refreshTrigger) {
  const { user, profile } = useAuth();
  const [banners, setBanners] = useState(() => bannerCache.data[screenName] || []);
  const [loading, setLoading] = useState(!bannerCache.data[screenName]);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const loadBanners = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const cacheKey = `${screenName}_${user?.id || 'guest'}`;
    const cacheExpired = now - (bannerCache.lastFetch[cacheKey] || 0) > bannerCache.CACHE_DURATION;

    // Use cache if available and not expired (unless force refresh)
    if (!forceRefresh && bannerCache.data[cacheKey] && !cacheExpired) {
      setBanners(bannerCache.data[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userTier = profile?.scanner_tier || profile?.tier || 'FREE';
      // Fetch ALL banners (no limit) for distribution
      const data = await sponsorBannerService.getActiveBanners(
        screenName,
        userTier,
        user?.id,
        { limit: null }  // No limit - get all banners for this screen
      );
      console.log(`[useSponsorBanners:${screenName}] Loaded ${data.length} banners, userTier: ${userTier}`);

      // Update cache
      bannerCache.data[cacheKey] = data;
      bannerCache.lastFetch[cacheKey] = now;

      setBanners(data);
    } catch (error) {
      console.error(`[useSponsorBanners:${screenName}] Load error:`, error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [screenName, user?.id, profile?.scanner_tier, profile?.tier]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Refresh when refreshTrigger changes (force refresh)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger !== null) {
      loadBanners(true); // Force refresh
    }
  }, [refreshTrigger]);

  // Filter out dismissed banners
  const activeBanners = banners.filter(b => !dismissedIds.has(b.id));

  const dismissBanner = useCallback(async (bannerId) => {
    // Always update local state to remove banner from UI
    setDismissedIds(prev => new Set([...prev, bannerId]));
    // Only persist to DB if user is logged in
    if (user?.id) {
      await sponsorBannerService.dismissBanner(user.id, bannerId);
    }
  }, [user?.id]);

  return {
    banners: activeBanners,
    allBanners: banners,
    loading,
    refresh: loadBanners,
    dismissBanner,
    userId: user?.id,
  };
}

/**
 * SponsorBannerSection - Displays sponsor banners for a specific screen
 * @param {string} screenName - Name of the screen (e.g., 'home', 'scanner', 'shop')
 * @param {object} navigation - React Navigation object
 * @param {function} onRefresh - Optional callback to trigger when banners should refresh
 * @param {boolean} refreshTrigger - Optional trigger to force refresh banners
 * @param {number} maxBanners - Max number of banners to show (null = all, number = limit)
 * @param {function} onBannersLoaded - Callback with ALL loaded banners (for parent to distribute)
 */
export default function SponsorBannerSection({
  screenName,
  navigation,
  onRefresh,
  refreshTrigger,
  maxBanners = null,  // Default: show ALL banners (for backwards compatibility with distributed approach)
  onBannersLoaded
}) {
  const { user, profile } = useAuth();
  const [banners, setBanners] = useState([]);

  const loadBanners = useCallback(async () => {
    try {
      // Use scanner_tier or tier field (depending on profile structure)
      const userTier = profile?.scanner_tier || profile?.tier || 'FREE';
      const data = await sponsorBannerService.getActiveBanners(
        screenName,
        userTier,
        user?.id,
        { limit: maxBanners }  // Apply limit to avoid clustering
      );
      console.log(`[SponsorBanner:${screenName}] Loaded banners:`, data.length, 'maxBanners:', maxBanners, 'userTier:', userTier);
      setBanners(data);

      // Notify parent of loaded banner IDs for coordination with inline ads
      if (onBannersLoaded && data.length > 0) {
        onBannersLoaded(data.map(b => b.id));
      }
    } catch (error) {
      console.error(`[SponsorBanner:${screenName}] Load error:`, error);
    }
  }, [screenName, user?.id, profile?.scanner_tier, profile?.tier, maxBanners, onBannersLoaded]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadBanners();
    }
  }, [refreshTrigger, loadBanners]);


  const handleDismissBanner = useCallback(async (bannerId) => {
    if (user?.id) {
      await sponsorBannerService.dismissBanner(user.id, bannerId);
      setBanners(prev => prev.filter(b => b.id !== bannerId));
    }
  }, [user?.id]);

  // Expose refresh method
  useEffect(() => {
    if (onRefresh) {
      onRefresh(loadBanners);
    }
  }, [onRefresh, loadBanners]);

  if (banners.length === 0) {
    return null;
  }

  // Use SponsorBanner wrapper to render each banner with proper layout_type
  return (
    <View style={styles.container}>
      {banners.map((banner) => (
        <SponsorBanner
          key={banner.id}
          banner={banner}
          navigation={navigation}
          userId={user?.id}
          onDismiss={handleDismissBanner}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
});
