/**
 * GEM Academy - Hero Banner Carousel
 * Auto-sliding promotional banners
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import { getPromoBanners } from '../../services/promoBannerService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const BANNER_HEIGHT = 160;
const AUTO_SLIDE_INTERVAL = 5000;

const HeroBannerCarousel = ({ userTier = null, style = {} }) => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const autoSlideTimer = useRef(null);

  // Load banners
  useEffect(() => {
    loadBanners();
    return () => {
      if (autoSlideTimer.current) {
        clearInterval(autoSlideTimer.current);
      }
    };
  }, [userTier]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const result = await getPromoBanners(userTier);
      if (result.success) {
        setBanners(result.data || []);
      }
    } catch (error) {
      console.error('[HeroBannerCarousel] loadBanners error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto slide
  useEffect(() => {
    if (banners.length > 1) {
      autoSlideTimer.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, AUTO_SLIDE_INTERVAL);

      return () => {
        if (autoSlideTimer.current) {
          clearInterval(autoSlideTimer.current);
        }
      };
    }
  }, [currentIndex, banners.length]);

  const handleBannerPress = useCallback((banner) => {
    const { action_type, action_value } = banner;

    switch (action_type) {
      case 'course':
        navigation.navigate('CourseDetail', { courseId: action_value });
        break;
      case 'url':
        // Handle URL - could use Linking
        break;
      case 'screen':
        navigation.navigate(action_value);
        break;
      case 'category':
        navigation.navigate('CourseList', { category: action_value });
        break;
      default:
        break;
    }
  }, [navigation]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderBanner = ({ item: banner }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(banner)}
      style={styles.bannerContainer}
    >
      <View style={[styles.banner, { backgroundColor: banner.bg_color || '#1A1B3A' }]}>
        {/* Background image */}
        {banner.image_url && (
          <Image
            source={{ uri: banner.image_url }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Content */}
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerTitle, { color: banner.text_color || '#FFFFFF' }]}>
            {banner.title}
          </Text>
          {banner.subtitle && (
            <Text style={[styles.bannerSubtitle, { color: `${banner.text_color || '#FFFFFF'}99` }]}>
              {banner.subtitle}
            </Text>
          )}

          {/* CTA button */}
          <View
            style={[
              styles.ctaButton,
              { backgroundColor: banner.cta_color || COLORS.gold },
            ]}
          >
            <Text style={styles.ctaText}>{banner.cta_text || 'Xem ngay'}</Text>
            <ChevronRight size={14} color={COLORS.bgDarkest} strokeWidth={3} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }

  if (banners.length === 0) {
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
        snapToInterval={BANNER_WIDTH + SPACING.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: BANNER_WIDTH + SPACING.md,
          offset: (BANNER_WIDTH + SPACING.md) * index,
          index,
        })}
      />

      {/* Pagination dots */}
      {banners.length > 1 && (
        <View style={styles.pagination}>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  loadingContainer: {
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    marginRight: SPACING.md,
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xxs,
  },
  bannerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
    marginRight: SPACING.xxs,
  },
  pagination: {
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
    marginHorizontal: SPACING.xxs,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
});

export default HeroBannerCarousel;
