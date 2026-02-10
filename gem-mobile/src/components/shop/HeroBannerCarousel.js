/**
 * HeroBannerCarousel.js - Hero Banner Carousel Component
 * Auto-scrolling banner carousel with pagination dots
 * Fetches banners from Supabase shop_banners table
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../contexts/SettingsContext';
import shopBannerService from '../../services/shopBannerService';
import OptimizedImage, { prefetchImages } from '../Common/OptimizedImage';
import InAppBrowser from '../Common/InAppBrowser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =========== GLOBAL CACHE for instant display ===========
const bannerCache = {
  data: null,
  lastFetch: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Helper to get initial banners - checks both component cache and service cache
const getInitialBanners = () => {
  // First check component cache
  if (bannerCache.data && bannerCache.data.length > 0) {
    return bannerCache.data;
  }
  // Then check service cache (might be populated by preload)
  const serviceCache = shopBannerService.getCachedShopBanners?.();
  if (serviceCache && serviceCache.length > 0) {
    // Sync to component cache
    bannerCache.data = serviceCache;
    bannerCache.lastFetch = Date.now();
    return serviceCache;
  }
  return [];
};

const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

const HeroBannerCarousel = ({ style }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const BORDER_RADIUS = { lg: 16 };

  const BANNER_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);
  const BANNER_HEIGHT = 175;

  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const hasFetched = useRef(false);

  // Initialize from cache for instant display (checks both component and service cache)
  const [banners, setBanners] = useState(() => getInitialBanners());
  const [currentIndex, setCurrentIndex] = useState(0);
  // Only show loading if no cached data available
  const [loading, setLoading] = useState(() => getInitialBanners().length === 0);

  // InAppBrowser state for URL links
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Fetch banners from service - use cache for instant display
  useEffect(() => {
    // Skip if already fetched this session
    if (hasFetched.current) return;
    hasFetched.current = true;

    const now = Date.now();
    const cacheExpired = now - bannerCache.lastFetch > bannerCache.CACHE_DURATION;

    // If cache is valid, just ensure loading is false
    if (bannerCache.data && bannerCache.data.length > 0 && !cacheExpired) {
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const result = await shopBannerService.getActiveShopBanners();
        if (result.success) {
          const bannersData = result.data || [];
          setBanners(bannersData);

          // Update cache for instant display on next visit
          bannerCache.data = bannersData;
          bannerCache.lastFetch = Date.now();

          // Prefetch banner images for faster rendering
          const imageUrls = bannersData.map(b => b.image_url).filter(Boolean);
          if (imageUrls.length > 0) {
            prefetchImages(imageUrls);
          }

          // Track views for all visible banners
          bannersData.forEach((banner) => {
            shopBannerService.recordBannerView(banner.id);
          });
        }
      } catch (err) {
        console.error('[HeroBannerCarousel] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // Empty deps - only run once on mount

  // Auto-scroll logic
  useEffect(() => {
    if (banners.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % banners.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, AUTO_SCROLL_INTERVAL);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [banners.length]);

  // Handle banner press
  const handleBannerPress = async (banner) => {
    // Track click
    shopBannerService.recordBannerClick(banner.id);

    switch (banner.link_type) {
      case 'product':
        navigation.navigate('ProductDetail', { productId: banner.link_value });
        break;
      case 'collection':
        navigation.navigate('ProductList', {
          collection: banner.link_value,
          title: banner.title || 'Bo suu tap',
        });
        break;
      case 'url':
        // Open URL in InAppBrowser (WebView) instead of external browser
        if (banner.link_value) {
          setBrowserUrl(banner.link_value);
          setBrowserTitle(banner.title || 'Landing Page');
          setBrowserVisible(true);
        }
        break;
      case 'screen':
        // Handle deep link navigation
        if (banner.link_value) {
          // Check if it's a gem:// deep link with params
          if (banner.link_value.includes('?')) {
            const [screenName, queryString] = banner.link_value.replace('gem://', '').split('?');
            const params = {};
            queryString.split('&').forEach((param) => {
              const [key, value] = param.split('=');
              params[key] = value;
            });
            navigation.navigate(screenName, params);
          } else {
            navigation.navigate(banner.link_value.replace('gem://', ''));
          }
        }
        break;
      default:
        // No action for 'none'
        break;
    }
  };

  // Handle scroll end to update current index
  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    setCurrentIndex(index);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: SPACING.lg,
    },
    flatListContent: {
      paddingHorizontal: SPACING.lg,
    },
    bannerContainer: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      marginRight: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    bannerImage: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    textContainer: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xl,
    },
    bannerTitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginBottom: SPACING.xs,
      // Stronger text shadow for better readability
      textShadowColor: 'rgba(0, 0, 0, 1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    bannerSubtitle: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      // Stronger text shadow for better readability
      textShadowColor: 'rgba(0, 0, 0, 1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: SPACING.md,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginHorizontal: 3,
    },
    paginationDotActive: {
      width: 20,
      backgroundColor: colors.burgundy,
    },
    // Skeleton styles
    skeletonBanner: {
      marginHorizontal: SPACING.lg,
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      overflow: 'hidden',
    },
    skeletonShimmer: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY, BANNER_WIDTH, BANNER_HEIGHT]);

  // Render individual banner
  const renderBanner = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
      style={styles.bannerContainer}
    >
      <OptimizedImage
        uri={item.image_url}
        style={styles.bannerImage}
        resizeMode="cover"
        showPlaceholder={true}
      />
      {/* Gradient overlay for text visibility - stronger gradient at bottom */}
      {(item.title || item.subtitle) && (
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.85)']}
          locations={[0, 0.5, 1]}
          style={styles.overlay}
        >
          <View style={styles.textContainer}>
            {item.title && (
              <Text style={styles.bannerTitle}>{item.title}</Text>
            )}
            {item.subtitle && (
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );

  // Render pagination dots
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  // Show skeleton placeholder while loading for better UX
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.skeletonBanner}>
          <View style={styles.skeletonShimmer} />
        </View>
      </View>
    );
  }

  // Hide completely if no banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <>
      <View style={[styles.container, style]}>
        <FlatList
          ref={flatListRef}
          data={banners}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          decelerationRate="fast"
          snapToInterval={BANNER_WIDTH + SPACING.md}
          snapToAlignment="start"
          contentContainerStyle={styles.flatListContent}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH + SPACING.md,
            offset: (BANNER_WIDTH + SPACING.md) * index,
            index,
          })}
          removeClippedSubviews={true}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
        {banners.length > 1 && renderPagination()}
      </View>

      {/* InAppBrowser for URL links */}
      <InAppBrowser
        visible={browserVisible}
        url={browserUrl}
        title={browserTitle}
        onClose={() => setBrowserVisible(false)}
      />
    </>
  );
};

export default HeroBannerCarousel;
