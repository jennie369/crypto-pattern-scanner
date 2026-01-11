/**
 * HeroBannerCarousel.js - Hero Banner Carousel Component
 * Auto-scrolling banner carousel with pagination dots
 * Fetches banners from Supabase shop_banners table
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import shopBannerService from '../../services/shopBannerService';
import OptimizedImage, { prefetchImages } from '../Common/OptimizedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);
const BANNER_HEIGHT = 160;
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

const HeroBannerCarousel = ({ style }) => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const hasFetched = useRef(false);

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch banners from service - only once on mount
  useEffect(() => {
    // Skip if already fetched
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchBanners = async () => {
      try {
        const result = await shopBannerService.getActiveShopBanners();
        if (result.success) {
          const bannersData = result.data || [];
          setBanners(bannersData);

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
        // Open external URL in browser
        if (banner.link_value) {
          try {
            await Linking.openURL(banner.link_value);
          } catch (err) {
            console.error('[HeroBannerCarousel] Open URL error:', err);
          }
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
      {/* Gradient overlay for text visibility */}
      <View style={styles.overlay}>
        {item.title && (
          <Text style={styles.bannerTitle}>{item.title}</Text>
        )}
        {item.subtitle && (
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        )}
      </View>
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

  // Don't show loading spinner - section will appear when data is ready
  // This prevents the perpetual loading spinner when no banners exist
  if (loading || banners.length === 0) {
    return null;
  }

  return (
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
      />
      {banners.length > 1 && renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.glassBg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    backgroundColor: COLORS.burgundy,
  },
});

export default HeroBannerCarousel;
