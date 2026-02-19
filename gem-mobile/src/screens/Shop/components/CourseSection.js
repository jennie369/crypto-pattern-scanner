/**
 * Gemral - Course Section Component for Shop
 * Beautiful featured course cards with large thumbnails
 * Design: Premium look with gradient overlays and glass effect
 *
 * Data Source: Shopify products filtered by course tags
 * Navigation: Built-in using useNavigation hook
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GraduationCap,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  BookOpen,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { shopifyService } from '../../../services/shopifyService';
import { SHOP_TABS } from '../../../utils/shopConfig';
import InAppBrowser from '../../../components/Common/InAppBrowser';
import { FORCE_REFRESH_EVENT } from '../../../utils/loadingStateManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 220;
const HERO_BANNER_IMAGE_HEIGHT = 200; // Hero banner image height

// Course tags - EXACT tags from Shopify (only course-specific tags)
// IMPORTANT: Keep this before courseCache helper functions that reference it
const COURSE_TAGS = [
  'Khóa học Trading',
  'Khóa học',
  'khoa-hoc',
  'trading-course',
  'tan-so-goc',
  'tier-starter',
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'khai-mo',
  'gem-academy',
  'Gem Trading',
  'Ebook',
  'digital',
  'course',
  '7-ngay',
];

// =========== GLOBAL CACHE for instant display ===========
const courseCache = {
  products: null,
  lastFetch: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Helper to get initial courses from cache (checks component cache first, then Shopify cache)
const getInitialCourses = (limit) => {
  // First check component cache
  if (courseCache.products && courseCache.products.length > 0) {
    return courseCache.products;
  }
  // Then check if Shopify has cached products (might be populated by preload)
  const shopifyCache = shopifyService._productsCache;
  if (shopifyCache && shopifyCache.length > 0) {
    // Filter for courses using COURSE_TAGS
    const tagSet = new Set(COURSE_TAGS.map(t => t.toLowerCase()));
    const courses = shopifyCache.filter(product => {
      if (!product.tags) return false;
      const productTags = Array.isArray(product.tags)
        ? product.tags
        : product.tags.split(',').map(t => t.trim());
      return productTags.some(tag => tagSet.has(tag.toLowerCase()));
    }).slice(0, limit || 4);

    if (courses.length > 0) {
      // Sync to component cache
      courseCache.products = courses;
      courseCache.lastFetch = Date.now();
      return courses;
    }
  }
  return [];
};

// Price badge styling based on price
const getPriceBadgeStyle = (price) => {
  if (!price || price === 0) {
    return { bg: COLORS.success, text: '#112250', label: 'Miễn phí' };
  }
  if (price < 500000) {
    return { bg: COLORS.gold, text: '#112250', label: formatPrice(price) };
  }
  if (price < 2000000) {
    return { bg: COLORS.purple, text: '#FFFFFF', label: formatPrice(price) };
  }
  return { bg: COLORS.cyan, text: '#112250', label: formatPrice(price) };
};

// Format price to VND
const formatPrice = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

// Get product image URL - handles multiple Shopify formats
const getProductImage = (product) => {
  // 1. images array with src property
  if (product.images?.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage?.src) return firstImage.src;
    if (firstImage?.url) return firstImage.url;
  }
  // 2. featuredImage object
  if (product.featuredImage) {
    if (typeof product.featuredImage === 'string') return product.featuredImage;
    if (product.featuredImage?.src) return product.featuredImage.src;
    if (product.featuredImage?.url) return product.featuredImage.url;
  }
  // 3. Single image property
  if (product.image) {
    if (typeof product.image === 'string') return product.image;
    if (product.image?.src) return product.image.src;
    if (product.image?.url) return product.image.url;
  }
  // 4. Fallback placeholder
  return 'https://placehold.co/400x300/1a0b2e/FFBD59?text=Course';
};

// Get product price
const getProductPrice = (product) => {
  if (product.variants && product.variants.length > 0) {
    return parseFloat(product.variants[0].price) || 0;
  }
  return parseFloat(product.price) || 0;
};

/**
 * Featured Course Card - Large thumbnail with overlay
 */
const FeaturedCourseCard = ({ product, onPress, index }) => {
  const price = getProductPrice(product);
  const priceStyle = getPriceBadgeStyle(price);
  const imageUrl = getProductImage(product);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featuredCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(product)}
        style={styles.featuredTouchable}
      >
        {/* Background Image - expo-image for instant cached display */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={100}
          cachePolicy="disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(17, 34, 80, 0.95)']}
          locations={[0, 0.4, 1]}
          style={styles.featuredGradient}
        />

        {/* Price Badge */}
        <View style={[styles.priceBadge, { backgroundColor: priceStyle.bg }]}>
          <Text style={[styles.priceText, { color: priceStyle.text }]}>
            {priceStyle.label}
          </Text>
        </View>

        {/* Play Button Overlay */}
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Play size={24} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.featuredContent}>
          {/* Title */}
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {product.title}
          </Text>

          {/* Vendor/Brand */}
          <Text style={styles.featuredInstructor}>
            bởi {product.vendor || 'Gemral'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {product.product_type && (
              <View style={styles.stat}>
                <BookOpen size={14} color={COLORS.textMuted} />
                <Text style={styles.statText}>{product.product_type}</Text>
              </View>
            )}
            {/* Show compare_at_price if exists (original price) */}
            {product.variants?.[0]?.compare_at_price && (
              <View style={styles.stat}>
                <Text style={styles.originalPrice}>
                  {formatPrice(parseFloat(product.variants[0].compare_at_price))}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Small Course Card - Grid layout
 */
const SmallCourseCard = ({ product, onPress, index }) => {
  const price = getProductPrice(product);
  const priceStyle = getPriceBadgeStyle(price);
  const imageUrl = getProductImage(product);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: (index + 1) * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.smallCard, { opacity: fadeAnim }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(product)}
        style={styles.smallTouchable}
      >
        {/* Thumbnail */}
        <View style={styles.smallImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.smallImage}
            contentFit="cover"
            transition={100}
            cachePolicy="disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {/* Gradient - lighter opacity for better visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(17, 34, 80, 0.4)']}
            locations={[0.6, 1]}
            style={styles.smallGradient}
          />
          {/* Price Badge */}
          <View style={[styles.smallPriceBadge, { backgroundColor: priceStyle.bg }]}>
            <Text style={[styles.smallPriceText, { color: priceStyle.text }]}>
              {price === 0 ? 'Free' : formatPrice(price)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.smallContent}>
          <Text style={styles.smallTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.smallVendor} numberOfLines={1}>
            {product.vendor || 'Gemral'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Course Section - Main component
 * Fetches course products from Shopify and renders them
 */
const CourseSection = ({
  title = 'Khóa Học Trading & Tâm Linh',
  subtitle = 'Nâng cao kiến thức, làm chủ tài chính',
  limit = 4,
  heroBanner = null, // { image_url, title, subtitle, link_url }
}) => {
  const navigation = useNavigation();
  // Initialize from cache for instant display (checks both component and Shopify cache)
  const [products, setProducts] = useState(() => getInitialCourses(limit));
  // Only show loading if no cached data
  const [loading, setLoading] = useState(() => getInitialCourses(limit).length === 0);

  // InAppBrowser state for hero banner URL links
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Handle hero banner press - open InAppBrowser WebView
  const handleHeroBannerPress = () => {
    if (heroBanner?.link_url) {
      setBrowserUrl(heroBanner.link_url);
      setBrowserTitle(heroBanner.title || title || 'Chi tiết');
      setBrowserVisible(true);
    }
  };

  useEffect(() => {
    const now = Date.now();
    const cacheExpired = now - courseCache.lastFetch > courseCache.CACHE_DURATION;

    // If cache is valid, use it and skip loading
    if (courseCache.products && courseCache.products.length > 0 && !cacheExpired) {
      setLoading(false);
      return;
    }

    // Fetch new data (in background if we have cached data)
    loadCourseProducts();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[CourseSection] Force refresh received');
      setLoading(false);
      setTimeout(() => loadCourseProducts(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  /**
   * Load course products from Shopify filtered by tags
   */
  const loadCourseProducts = async () => {
    // Only show loading spinner if no cached data
    if (!courseCache.products || courseCache.products.length === 0) {
      setLoading(true);
    }

    try {
      // Get products filtered by course tags
      // NOTE: Set fallbackToRandom = false to NOT show random products if no courses found
      const courseProducts = await shopifyService.getProductsByTags(
        COURSE_TAGS,
        limit,
        false // Do NOT fallback to random products
      );

      console.log('[CourseSection] Loaded', courseProducts?.length || 0, 'course products');
      // Debug: Log first few product titles and their tags to verify filtering
      if (courseProducts?.length > 0) {
        console.log('[CourseSection] Products found:');
        courseProducts.slice(0, 3).forEach(p => {
          console.log(`  - ${p.title} | Tags: ${Array.isArray(p.tags) ? p.tags.join(', ') : p.tags}`);
        });
      } else {
        console.log('[CourseSection] No course products found with tags:', COURSE_TAGS.slice(0, 5).join(', '), '...');
      }

      // Update state and cache
      setProducts(courseProducts || []);
      courseCache.products = courseProducts || [];
      courseCache.lastFetch = Date.now();
    } catch (error) {
      console.error('[CourseSection] Error loading course products:', error);
      // Only clear if no cache exists
      if (!courseCache.products) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle course product press - Navigate to ProductDetail
   */
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  /**
   * Handle View All - Navigate to ProductList with course tags
   */
  const handleViewAll = () => {
    navigation.navigate('ProductList', {
      sectionId: 'courses',
      title: 'Tất cả Khóa học',
      tags: COURSE_TAGS,
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <GraduationCap size={20} color={COLORS.gold} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      </View>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  const featuredProduct = products[0];
  const otherProducts = products.slice(1, 3); // Show 2 more in grid

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <GraduationCap size={20} color={COLORS.gold} />
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner - displayed BELOW section header with text below image */}
      {heroBanner?.image_url && heroBanner?.is_active !== false && (
        <TouchableOpacity
          style={styles.heroBannerContainer}
          onPress={handleHeroBannerPress}
          activeOpacity={0.9}
          disabled={!heroBanner?.link_url}
        >
          {/* Banner Image - expo-image for instant cached display */}
          <Image
            source={{ uri: heroBanner.image_url }}
            style={styles.heroBannerImage}
            contentFit="cover"
            transition={100}
            cachePolicy="disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {/* Banner text BELOW image (not overlaid) */}
          {(heroBanner.title || heroBanner.subtitle || heroBanner.link_url) && (
            <View style={styles.heroBannerContent}>
              <View style={styles.heroBannerTextContainer}>
                {heroBanner.title && (
                  <Text style={styles.heroBannerTitle} numberOfLines={2}>{heroBanner.title}</Text>
                )}
                {heroBanner.subtitle && (
                  <Text style={styles.heroBannerSubtitle} numberOfLines={2}>{heroBanner.subtitle}</Text>
                )}
              </View>
              {heroBanner.link_url && (
                <View style={styles.heroBannerCTA}>
                  <Text style={styles.heroBannerCTAText}>Xem ngay</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Featured Product - Large Card */}
      <FeaturedCourseCard
        product={featuredProduct}
        onPress={handleProductPress}
        index={0}
      />

      {/* Other Products - Grid */}
      {otherProducts.length > 0 && (
        <View style={styles.gridContainer}>
          {otherProducts.map((product, index) => (
            <SmallCourseCard
              key={product?.id || `course-small-${index}`}
              product={product}
              onPress={handleProductPress}
              index={index}
            />
          ))}
        </View>
      )}

      {/* InAppBrowser for hero banner URL links */}
      <InAppBrowser
        visible={browserVisible}
        url={browserUrl}
        title={browserTitle}
        onClose={() => setBrowserVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Hero Banner Styles - Text BELOW image layout
  heroBannerContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
  },
  heroBannerImage: {
    width: '100%',
    height: HERO_BANNER_IMAGE_HEIGHT,
  },
  heroBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: GLASS.background,
  },
  heroBannerTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  heroBannerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  heroBannerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  heroBannerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  heroBannerCTAText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginRight: 4,
  },

  // Loading
  loadingContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Featured Card
  featuredCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  featuredTouchable: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  priceBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0.5,
  },
  playButtonContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -28,
    marginTop: -28,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(106, 91, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredInstructor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  // Small Card
  smallCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  smallTouchable: {
    width: '100%',
  },
  smallImageContainer: {
    width: '100%',
    aspectRatio: 1, // 1:1 square ratio
    position: 'relative',
  },
  smallImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  smallGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  smallPriceBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  smallPriceText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  smallContent: {
    padding: SPACING.sm,
  },
  smallTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  smallVendor: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

export default CourseSection;
