/**
 * Gemral - Trading Course Hero Carousel
 * Auto-scrolling hero banner for featured trading courses
 */

import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Play } from 'lucide-react-native';
import OptimizedImage from '../../../components/Common/OptimizedImage';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../../utils/tokens';
import {
  HERO_CONFIG,
  formatPrice,
} from '../../../utils/digitalProductsConfig';
import { extractImageUrl, PLACEHOLDER_IMAGE } from '../../../utils/digitalProductHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
// Use aspectRatio (3:4 portrait) to calculate height
const BANNER_HEIGHT = BANNER_WIDTH / HERO_CONFIG.aspectRatio;

const TradingCourseHero = ({
  products = [],
  onProductPress,
  onViewAllPress,
  style,
}) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollTimer = useRef(null);
  const pauseTimer = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    if (products.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        if (!isPaused && products.length > 1) {
          const nextIndex = (currentIndex + 1) % products.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }, HERO_CONFIG.autoScrollInterval);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [currentIndex, isPaused, products.length]);

  // Handle manual scroll
  const onMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    setCurrentIndex(index);

    // Pause auto-scroll on manual interaction
    setIsPaused(true);
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
    }
    pauseTimer.current = setTimeout(() => {
      setIsPaused(false);
    }, HERO_CONFIG.pauseOnInteraction);
  }, []);

  // Handle product press
  const handlePress = useCallback((product) => {
    onProductPress?.(product);
  }, [onProductPress]);

  // Render single slide
  const renderSlide = useCallback(({ item, index }) => (
    <HeroSlide
      product={item}
      onPress={() => handlePress(item)}
      isActive={index === currentIndex}
    />
  ), [currentIndex, handlePress]);

  // Empty state
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Khóa Học Trading</Text>
          <Text style={styles.headerSubtitle}>Học từ chuyên gia</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderSlide}
        keyExtractor={(item, index) => item?.id || `hero-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + SPACING.md}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onMomentumScrollEnd={onMomentumScrollEnd}
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

      {/* Pagination Dots */}
      {products.length > 1 && (
        <View style={styles.pagination}>
          {products.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Individual Hero Slide
const HeroSlide = memo(({ product, onPress, isActive }) => {
  const imageUrl = extractImageUrl(product, PLACEHOLDER_IMAGE);
  const price = product?.variants?.[0]?.price || product?.price || 0;

  return (
    <TouchableOpacity
      style={styles.slide}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Background Image */}
      <OptimizedImage
        uri={imageUrl}
        style={styles.slideImage}
        resizeMode="cover"
      />

      {/* Gradient Overlay - darker at bottom for text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        locations={[0.3, 0.6, 1]}
        style={styles.slideGradient}
      />

      {/* Content */}
      <View style={styles.slideContent}>
        {/* Title & Subtitle */}
        <Text style={styles.slideTitle} numberOfLines={2}>
          {product?.title || 'Khóa Học Trading'}
        </Text>
        <Text style={styles.slideSubtitle} numberOfLines={1}>
          {product?.description?.substring(0, 60) || 'Bắt đầu hành trình trading chuyên nghiệp'}
        </Text>

        {/* Price & CTA */}
        <View style={styles.slideFooter}>
          <Text style={styles.slidePrice}>{formatPrice(price)}</Text>
          <View style={styles.ctaButton}>
            <Play size={14} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            <Text style={styles.ctaText}>Xem ngay</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Carousel
  carouselContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Slide
  slide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: SPACING.md,
    backgroundColor: COLORS.glassBgHeavy,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  slideGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Slide Content
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  slideTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  // Footer
  slideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slidePrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
});

export default memo(TradingCourseHero);
