/**
 * Gemral - Shop Screen (Main)
 * Product catalog với sections theo Shopify tags - DARK THEME
 * Enhanced with Hero Banner, Flash Sale, Categories, Wishlist, Recently Viewed
 * Sử dụng design tokens từ DESIGN_TOKENS.md v3.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ShoppingCart, ShoppingBag, Heart } from 'lucide-react-native';
import { ProductCard, CategoryFilter, DigitalProductsSection } from './components';
import ProductSection from './components/ProductSection';
import ShopCategoryTabs from './components/ShopCategoryTabs';
import CourseSection from './components/CourseSection';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import { distributeBannersAmongSections } from '../../utils/bannerDistribution';
import { shopifyService, preloadShopData } from '../../services/shopifyService';
import { useShopSections, useFilteredProducts } from '../../hooks/useShopProducts';
import { prefetchImages } from '../../components/Common/OptimizedImage';
import { useCart } from '../../contexts/CartContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { SHOP_SECTIONS, SHOP_CATEGORIES } from '../../utils/shopConfig';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import useScrollToTop from '../../hooks/useScrollToTop';

// Shop Enhancement Components
import PromoBar from '../../components/shop/PromoBar';
import HeroBannerCarousel from '../../components/shop/HeroBannerCarousel';
import CategoryGrid from '../../components/shop/CategoryGrid';
import FlashSaleSection from '../../components/shop/FlashSaleSection';
import FeaturedProductSection from '../../components/shop/FeaturedProductSection';
import RecentlyViewedSection from '../../components/shop/RecentlyViewedSection';
import ShopOnboarding from '../../components/shop/ShopOnboarding';
import { getWishlistCount } from '../../services/wishlistService';
import shopOnboardingService from '../../services/shopOnboardingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;

// Header and tabs height for auto-hide
const HEADER_HEIGHT = 60;
const TABS_HEIGHT = 60; // 12 (paddingTop) + 36 (tab height) + 12 (paddingBottom)
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

// =========== GLOBAL SHOP CACHE - for instant display ===========
const shopCache = {
  allProducts: null,
  sectionsData: null,
  exploreProducts: null,
  lastFetch: 0,
  CACHE_DURATION: 60000, // 60 seconds cache for shop data
};

const ShopScreen = ({ navigation }) => {
  const { itemCount } = useCart();
  const { handleScroll: handleTabBarScroll } = useTabBar();
  const insets = useSafeAreaInsets();

  // Auto-hide header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isScrollingDown = useRef(false);

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId } = useSponsorBanners('shop', null);

  // Data states - Initialize from cache for instant display
  const [allProducts, setAllProducts] = useState(() => shopCache.allProducts || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Only show loading if no cached data
  const [loading, setLoading] = useState(!shopCache.allProducts || shopCache.allProducts.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  // Shop Enhancement states
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showPromoBar, setShowPromoBar] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sections data từ Shopify tags - Initialize from cache
  const [sectionsData, setSectionsData] = useState(() => shopCache.sectionsData || {});
  const [sectionsLoading, setSectionsLoading] = useState({});

  // Infinity scroll state cho section "explore" - Initialize from cache
  const [exploreProducts, setExploreProducts] = useState(() => shopCache.exploreProducts || []);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreLoadingMore, setExploreLoadingMore] = useState(false);
  const [exploreHasMore, setExploreHasMore] = useState(true);
  const exploreOffsetRef = useRef(0);
  const EXPLORE_LIMIT = 12;

  // Filtered products khi chọn category
  const filteredProducts = useFilteredProducts(allProducts, selectedCategory);

  // Double-tap to scroll to top and refresh
  const { scrollViewRef } = useScrollToTop('Shop', async () => {
    setRefreshing(true);
    exploreOffsetRef.current = 0;
    setExploreHasMore(true);
    await loadInitialData();
    setRefreshing(false);
  });

  // Handle scroll for auto-hide header/tabs AND infinite scroll
  const handleScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Also handle TabBar visibility
    handleTabBarScroll(event);

    // Check for infinite scroll - trigger when 300px from bottom
    const distanceFromBottom = contentHeight - layoutHeight - currentScrollY;
    if (distanceFromBottom < 300 && exploreHasMore && !exploreLoadingMore) {
      loadExploreProducts(null, false);
    }

    // Only animate header if we've scrolled enough (threshold 10px)
    if (Math.abs(diff) < 10) return;

    const scrollingDown = diff > 0;

    // At the top - always show header
    if (currentScrollY <= 10) {
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
      isScrollingDown.current = false;
    }
    // Scrolling down - hide header
    else if (scrollingDown && !isScrollingDown.current) {
      Animated.spring(headerTranslateY, {
        toValue: -TOTAL_HEADER_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
      isScrollingDown.current = true;
    }
    // Scrolling up - show header
    else if (!scrollingDown && isScrollingDown.current) {
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
      isScrollingDown.current = false;
    }

    lastScrollY.current = currentScrollY;
  }, [handleTabBarScroll, headerTranslateY, exploreHasMore, exploreLoadingMore]);

  useEffect(() => {
    const now = Date.now();
    const cacheExpired = now - shopCache.lastFetch > shopCache.CACHE_DURATION;

    // Check if service-level cache has data (from preload)
    const serviceHasCache = shopifyService._productsCache && shopifyService._productsCache.length > 0;

    // If service has cache but screen doesn't, populate screen cache from service cache
    if (serviceHasCache && (!shopCache.allProducts || shopCache.allProducts.length === 0)) {
      console.log('[ShopScreen] Using preloaded data from service cache');
      const preloadedProducts = shopifyService._productsCache;
      setAllProducts(preloadedProducts);
      shopCache.allProducts = preloadedProducts;
      shopCache.lastFetch = Date.now();

      // Still need to load sections and explore
      loadSectionsAndExplore(preloadedProducts);
      return;
    }

    // Only load if cache expired or no cached data
    if (cacheExpired || !shopCache.allProducts || shopCache.allProducts.length === 0) {
      loadInitialData();
    } else {
      // Use cached data - instant display
      setLoading(false);
    }
  }, []);

  // Fetch wishlist count and refresh on focus
  useEffect(() => {
    const fetchWishlistCount = async () => {
      const count = await getWishlistCount();
      setWishlistCount(count);
    };

    fetchWishlistCount();

    // Refresh on screen focus
    const unsubscribe = navigation.addListener('focus', fetchWishlistCount);
    return unsubscribe;
  }, [navigation]);

  // Check if shop onboarding should be shown (V2)
  useEffect(() => {
    const checkOnboarding = async () => {
      const shouldShow = await shopOnboardingService.shouldShowOnboarding();
      setShowOnboarding(shouldShow);
    };

    checkOnboarding();
  }, []);

  // Helper to load sections and explore when we have preloaded products
  const loadSectionsAndExplore = async (productsData) => {
    setLoading(true);
    try {
      // Prefetch images
      const imageUrls = productsData
        .slice(0, 30)
        .map(p => p.images?.[0]?.src || p.image)
        .filter(Boolean);
      prefetchImages(imageUrls);

      // Load sections and explore in parallel
      const [newSectionsData] = await Promise.all([
        loadSections(productsData),
        loadExploreProducts(productsData, true),
      ]);

      // Update cache
      shopCache.sectionsData = newSectionsData;
      shopCache.lastFetch = Date.now();
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load tất cả sản phẩm
      const productsData = await shopifyService.getProducts({ limit: 100 });
      setAllProducts(productsData);

      // Update cache immediately for products
      shopCache.allProducts = productsData;

      // Prefetch images for faster loading - get first image of each product
      const imageUrls = productsData
        .slice(0, 30) // Prefetch first 30 products for immediate view
        .map(p => p.images?.[0]?.src || p.image)
        .filter(Boolean);
      prefetchImages(imageUrls);

      // Load các sections theo tags
      const newSectionsData = await loadSections(productsData);

      // Load initial explore products
      await loadExploreProducts(productsData, true);

      // Update cache with all data
      shopCache.sectionsData = newSectionsData;
      shopCache.lastFetch = Date.now();
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load explore products với pagination
  const loadExploreProducts = async (productsToUse, reset = false) => {
    if (reset) {
      setExploreLoading(true);
      exploreOffsetRef.current = 0;
    } else {
      setExploreLoadingMore(true);
    }

    try {
      const allProductsList = productsToUse || allProducts;
      const start = exploreOffsetRef.current;
      const end = start + EXPLORE_LIMIT;

      // Slice products for pagination (local pagination since we have all products)
      const newProducts = allProductsList.slice(start, end);

      if (reset) {
        setExploreProducts(newProducts);
        // Update cache for explore products
        shopCache.exploreProducts = newProducts;
      } else {
        setExploreProducts(prev => [...prev, ...newProducts]);
      }

      // Update offset and hasMore
      exploreOffsetRef.current = end;
      setExploreHasMore(end < allProductsList.length);

    } catch (error) {
      console.error('Error loading explore products:', error);
    } finally {
      setExploreLoading(false);
      setExploreLoadingMore(false);
    }
  };

  // Handle load more for explore section
  const handleLoadMoreExplore = useCallback(() => {
    if (!exploreLoadingMore && exploreHasMore) {
      loadExploreProducts(null, false);
    }
  }, [exploreLoadingMore, exploreHasMore, allProducts]);

  const loadSections = async (productsToUse) => {
    const newSectionsData = {};

    // Load từng section song song
    await Promise.all(
      SHOP_SECTIONS.map(async (section) => {
        // Skip courses section - it handles its own data loading
        if (section.type === 'courses') {
          return;
        }

        setSectionsLoading(prev => ({ ...prev, [section.id]: true }));

        try {
          let products = [];

          // Xử lý theo section type
          switch (section.type) {
            case 'personalized':
              // "Dành Cho Bạn" - Lấy sản phẩm random
              products = await shopifyService.getForYouProducts(null, section.limit, productsToUse);
              break;

            case 'tagged':
              // Sections có tags - filter theo tags array
              if (section.tags && section.tags.length > 0) {
                products = await shopifyService.getProductsByTags(
                  section.tags,
                  section.limit,
                  true,
                  productsToUse
                );
              }
              break;

            case 'all':
              // "Khám Phá Thêm" - Được xử lý riêng trong explore section
              // Không cần load ở đây
              break;

            default:
              // Fallback: lấy sản phẩm random
              products = productsToUse?.slice(0, section.limit) || [];
          }

          newSectionsData[section.id] = {
            ...section,
            products: products || [],
          };
        } catch (error) {
          console.error(`Error loading section ${section.id}:`, error);
          newSectionsData[section.id] = {
            ...section,
            products: [],
          };
        } finally {
          setSectionsLoading(prev => ({ ...prev, [section.id]: false }));
        }
      })
    );

    setSectionsData(newSectionsData);
    return newSectionsData; // Return for caching
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reset explore state
    exploreOffsetRef.current = 0;
    setExploreHasMore(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleProductPress = async (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // Scroll to top khi chọn category
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleViewAll = (section) => {
    navigation.navigate('ProductList', {
      sectionId: section.id,
      title: section.title,
      tags: section.tags, // Sử dụng tags array thay vì tag đơn
    });
  };

  // Render section với ProductSection component
  const renderSection = (sectionConfig) => {
    const data = sectionsData[sectionConfig.id];
    const isLoading = sectionsLoading[sectionConfig.id];

    // Special handling for "courses" section
    // CourseSection handles its own data loading and navigation
    if (sectionConfig.type === 'courses') {
      return (
        <CourseSection
          key={sectionConfig.id}
          title={sectionConfig.title}
          subtitle={sectionConfig.subtitle}
          limit={sectionConfig.limit}
        />
      );
    }

    // Special handling for "explore" section with infinite scroll
    if (sectionConfig.id === 'explore' && sectionConfig.hasInfiniteScroll) {
      return (
        <ProductSection
          key={sectionConfig.id}
          title={sectionConfig.title}
          subtitle={sectionConfig.subtitle}
          products={exploreProducts}
          loading={exploreLoading}
          layout="grid"
          showViewAll={false}
          onProductPress={handleProductPress}
          // Infinity scroll props
          hasInfiniteScroll={true}
          onLoadMore={handleLoadMoreExplore}
          loadingMore={exploreLoadingMore}
          hasMore={exploreHasMore}
        />
      );
    }

    // Normal sections
    return (
      <ProductSection
        key={sectionConfig.id}
        title={data?.title || sectionConfig.title}
        subtitle={data?.subtitle || sectionConfig.subtitle}
        products={data?.products || []}
        loading={isLoading}
        layout={sectionConfig.layout}
        showViewAll={sectionConfig.showViewAll}
        onViewAll={() => handleViewAll(sectionConfig)}
        onProductPress={handleProductPress}
      />
    );
  };

  // Category view (filtered products grid)
  const renderCategoryView = () => (
    <FlatList
      data={filteredProducts}
      renderItem={({ item, index }) => (
        <ProductCard
          product={item}
          onPress={() => handleProductPress(item)}
          style={index % 2 === 0 ? styles.leftCard : styles.rightCard}
          darkMode={true}
        />
      )}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      numColumns={2}
      contentContainerStyle={styles.gridWithHeader}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={<View style={{ height: TOTAL_HEADER_HEIGHT }} />}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      windowSize={7}
      initialNumToRender={6}
      decelerationRate="fast"
      overScrollMode="never"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.purple}
          colors={[COLORS.purple]}
        />
      }
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ShoppingBag size={64} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Chưa có sản phẩm</Text>
      <Text style={styles.emptySubtitle}>Sản phẩm sẽ được cập nhật sớm</Text>
    </View>
  );

  if (loading && allProducts.length === 0) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Content - scrollable area with header space */}
        <View style={styles.contentWrapper}>
          {selectedCategory !== 'all' ? (
            // Show filtered grid when category is selected
            renderCategoryView()
          ) : (
            // Show sections for "Tất cả" view
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              decelerationRate="fast"
              overScrollMode="never"
              nestedScrollEnabled={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.purple}
                  colors={[COLORS.purple]}
                />
              }
              contentContainerStyle={styles.scrollContent}
            >
              {/* Spacer for header + safe area inset */}
              <View style={{ height: TOTAL_HEADER_HEIGHT + insets.top }} />

              {/* Promo Bar */}
              {showPromoBar && (
                <PromoBar onDismiss={() => setShowPromoBar(false)} />
              )}

              {/* Hero Banner Carousel */}
              <HeroBannerCarousel style={{ marginTop: SPACING.md }} />

              {/* Digital Products Section */}
              <DigitalProductsSection
                title="Sản Phẩm Số"
                subtitle="Khóa học & Công cụ Premium"
                limit={12}
                showHero={true}
                showCategories={true}
              />

              {/* Category Grid */}
              <CategoryGrid />

              {/* Flash Sale Section */}
              <FlashSaleSection />

              {/* Render sections với banners phân phối đều - đảm bảo TẤT CẢ banners được hiển thị */}
              {(() => {
                // New algorithm: distribute ALL banners evenly among sections
                const distributedList = distributeBannersAmongSections(
                  SHOP_SECTIONS,
                  sponsorBanners,
                  { minGap: 1, maxBannersPerGap: 2 }
                );

                return distributedList.map((item) => {
                  if (item.type === 'banner') {
                    return (
                      <SponsorBanner
                        key={item.key}
                        banner={item.data}
                        navigation={navigation}
                        userId={userId}
                        onDismiss={dismissBanner}
                      />
                    );
                  } else {
                    // item.type === 'section'
                    return renderSection(item.data);
                  }
                });
              })()}

              {/* Featured Product Section - Below "Dành Cho Bạn" */}
              <FeaturedProductSection />

              {/* Recently Viewed Section */}
              <RecentlyViewedSection />

              {/* Bottom padding for tab bar */}
              <View style={{ height: CONTENT_BOTTOM_PADDING }} />
            </ScrollView>
          )}
        </View>

        {/* Animated Header - on top of content */}
        <Animated.View
          style={[
            styles.animatedHeaderContainer,
            {
              paddingTop: insets.top,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>GEM Shop</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('ProductSearch')}
              >
                <Search size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              {/* Wishlist Button */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Wishlist')}
              >
                <Heart size={22} color={COLORS.textPrimary} />
                {wishlistCount > 0 && (
                  <View style={styles.wishlistBadge}>
                    <Text style={styles.wishlistBadgeText}>
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cartBtn}
                onPress={() => navigation.navigate('Cart')}
              >
                <ShoppingCart size={22} color={COLORS.textPrimary} />
                {itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {itemCount > 99 ? '99+' : itemCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Tabs */}
          <ShopCategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            categories={SHOP_CATEGORIES}
          />
        </Animated.View>
      </SafeAreaView>

      {/* Shop Onboarding (V2) */}
      <ShopOnboarding
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
    </LinearGradient>
  );
};

// STYLES - Using DESIGN_TOKENS v3.0 exact values
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  // Full content wrapper
  contentWrapper: {
    flex: 1,
  },

  // Animated header container for auto-hide
  animatedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // Transparent background - content scrolls behind
  },

  scrollContent: {
    paddingBottom: SPACING.xxl, // 20
  },

  // Header - DARK THEME v3.0
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg, // 16
    paddingVertical: SPACING.md, // 12
    backgroundColor: GLASS.background, // rgba(15, 16, 48, 0.55)
    borderBottomWidth: 1.2,
    borderBottomColor: COLORS.inputBorder, // rgba(106, 91, 255, 0.3)
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl, // 16
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    color: COLORS.gold, // #FFBD59
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm, // 8
  },
  iconBtn: {
    width: 44, // TOUCH.minimum
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.burgundy, // #9C0612
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs, // 10
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    color: COLORS.textPrimary, // #FFFFFF
  },
  wishlistBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.burgundy,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  wishlistBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Grid
  grid: {
    paddingHorizontal: SPACING.lg, // 16
    paddingTop: SPACING.sm,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  gridWithHeader: {
    paddingHorizontal: SPACING.lg, // 16
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md, // 12
  },
  leftCard: {
    marginRight: SPACING.xs, // 4
  },
  rightCard: {
    marginLeft: SPACING.xs, // 4
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md, // 12
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: SPACING.lg, // 16
    fontSize: TYPOGRAPHY.fontSize.xxxl, // 18
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    color: COLORS.textPrimary, // #FFFFFF
  },
  emptySubtitle: {
    marginTop: SPACING.xs, // 4
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },
});

export default ShopScreen;
