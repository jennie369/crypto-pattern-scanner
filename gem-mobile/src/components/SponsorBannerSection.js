/**
 * GEM Mobile - Sponsor Banner Section Component
 * Reusable component for displaying sponsor banners across screens
 *
 * NEW: Supports distributed banner display - banners can be spread throughout
 * the page content instead of all clustered at the top.
 *
 * Usage:
 * - Old way (all banners at top): <SponsorBannerSection screenName="shop" />
 * - New way (distributed): Use useSponsorBanners hook + SponsorBannerCard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { X, Sparkles, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../utils/tokens';
import { useAuth } from '../contexts/AuthContext';
import { sponsorBannerService } from '../services/sponsorBannerService';
import deepLinkHandler from '../services/deepLinkHandler';
import { navigateToScreen } from '../utils/navigationHelper';

/**
 * Custom hook to fetch banners for a screen
 * Use this hook when you need to manually control banner distribution
 */
export function useSponsorBanners(screenName, refreshTrigger) {
  const { user, profile } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const loadBanners = useCallback(async () => {
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

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadBanners();
    }
  }, [refreshTrigger, loadBanners]);

  // Filter out dismissed banners
  const activeBanners = banners.filter(b => !dismissedIds.has(b.id));

  const dismissBanner = useCallback(async (bannerId) => {
    if (user?.id) {
      await sponsorBannerService.dismissBanner(user.id, bannerId);
      setDismissedIds(prev => new Set([...prev, bannerId]));
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


  const handleBannerClick = async (banner) => {
    console.log('[SponsorBanner] handleBannerClick called!', {
      bannerId: banner.id,
      title: banner.title,
      action_type: banner.action_type,
      action_value: banner.action_value,
      hasNavigation: !!navigation,
    });

    await sponsorBannerService.recordClick(banner.id);

    if (banner.action_type === 'screen' && banner.action_value) {
      console.log('[SponsorBanner] Navigating to screen:', banner.action_value);
      navigateToScreen(navigation, banner.action_value);
    } else if (banner.action_type === 'url' && banner.action_value) {
      Linking.openURL(banner.action_value);
    } else if (banner.action_type === 'deeplink' && banner.action_value) {
      try {
        let deepLink;
        if (banner.action_value.startsWith('{')) {
          deepLink = JSON.parse(banner.action_value);
        } else if (banner.action_value.startsWith('gem://')) {
          const url = banner.action_value.replace('gem://', '');
          const [screen, queryString] = url.split('?');
          const params = {};
          if (queryString) {
            queryString.split('&').forEach(param => {
              const [key, value] = param.split('=');
              params[key] = decodeURIComponent(value);
            });
          }
          deepLink = { screen, params };
        } else {
          deepLink = { screen: banner.action_value };
        }
        deepLinkHandler.processDeepLink(deepLink);
      } catch (error) {
        console.error('[SponsorBanner] Deep link parse error:', error);
        navigateToScreen(navigation, banner.action_value);
      }
    }
  };

  const handleDismissBanner = async (bannerId) => {
    if (user?.id) {
      await sponsorBannerService.dismissBanner(user.id, bannerId);
      setBanners(prev => prev.filter(b => b.id !== bannerId));
    }
  };

  // Expose refresh method
  useEffect(() => {
    if (onRefresh) {
      onRefresh(loadBanners);
    }
  }, [onRefresh, loadBanners]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {banners.map((banner) => (
        <TouchableOpacity
          key={banner.id}
          style={[styles.banner, { backgroundColor: banner.background_color || '#1a0b2e' }]}
          onPress={() => handleBannerClick(banner)}
          activeOpacity={0.9}
        >
          {banner.is_dismissible && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => handleDismissBanner(banner.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          <View style={styles.content}>
            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Sparkles size={18} color={banner.accent_color || COLORS.gold} />
                <Text style={[styles.title, { color: banner.text_color || '#FFFFFF' }]}>
                  {banner.title}
                </Text>
              </View>
              {banner.subtitle && (
                <Text
                  style={[styles.subtitle, { color: banner.text_color || '#FFFFFF' }]}
                  numberOfLines={2}
                >
                  {banner.subtitle}
                </Text>
              )}
              {banner.action_label && (
                <View style={[styles.button, { backgroundColor: banner.accent_color || COLORS.gold }]}>
                  <Text style={styles.buttonText}>{banner.action_label}</Text>
                  <ChevronRight size={14} color="#000" />
                </View>
              )}
            </View>
            {banner.image_url && (
              <Image
                source={{ uri: banner.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  banner: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: SPACING.lg,
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
});
