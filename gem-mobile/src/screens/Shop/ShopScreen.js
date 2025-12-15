/**
 * Gemral - Shop Screen (Main)
 * Product catalog với sections theo Shopify tags - DARK THEME
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { ProductCard, CategoryFilter } from './components';
import ProductSection from './components/ProductSection';
import ShopCategoryTabs from './components/ShopCategoryTabs';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBannerCard from '../../components/SponsorBannerCard';
import { distributeBannersAmongSections } from '../../utils/bannerDistribution';
import { shopifyService } from '../../services/shopifyService';
import { useShopSections, useFilteredProducts } from '../../hooks/useShopProducts';
import { prefetchImages } from '../../components/Common/OptimizedImage';
import { useCart } from '../../contexts/CartContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { SHOP_SECTIONS, SHOP_CATEGORIES } from '../../utils/shopConfig';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import useScrollToTop from '../../hooks/useScrollToTop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;

// Header and tabs height for auto-hide
const HEADER_HEIGHT = 60;
const TABS_HEIGHT = 60; // 12 (paddingTop) + 36 (tab height) + 12 (paddingBottom)
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

const ShopScreen = ({ navigation }) => {
  const { itemCount } = useCart();
  const { handleScroll: handleTabBarScroll } = useTabBar();

  // Auto-hide header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isScrollingDown = useRef(false);

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId } = useSponsorBanners('shop', null);

  // Data states
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sections data từ Shopify tags
  const [sectionsData, setSectionsData] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState({});

  // Infinity scroll state cho section "explore"
  const [exploreProducts, setExploreProducts] = useState([]);
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

  // Handle scroll for auto-hide header/tabs
  const handleScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Also handle TabBar visibility
    handleTabBarScroll(event);

    // Only animate if we've scrolled enough (threshold 10px)
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
  }, [handleTabBarScroll, headerTranslateY]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load tất cả sản phẩm
      const productsData = await shopifyService.getProducts({ limit: 100 });
      setAllProducts(productsData);

      // Prefetch images for faster loading - get first image of each product
      const imageUrls = productsData
        .slice(0, 30) // Prefetch first 30 products for immediate view
        .map(p => p.images?.[0]?.src || p.image)
        .filter(Boolean);
      prefetchImages(imageUrls);

      // Load các sections theo tags
      await loadSections(productsData);

      // Load initial explore products
      await loadExploreProducts(productsData, true);
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
              {/* Spacer for header */}
              <View style={{ height: TOTAL_HEADER_HEIGHT }} />

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
                      <SponsorBannerCard
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
