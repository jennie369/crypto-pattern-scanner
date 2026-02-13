/**
 * Gemral - Shop Screen (Main)
 * Product catalog with categories & recommendation sections - DARK THEME
 * Infinite scroll experience with personalized recommendations
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
import { Search, ShoppingCart, ShoppingBag, ChevronRight, Sparkles, TrendingUp, Clock, Star } from 'lucide-react-native';
import { ProductCard, CategoryFilter } from './components';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';
import { shopifyService } from '../../services/shopifyService';
import { recommendationService } from '../../services/recommendationService';
import { useCart } from '../../contexts/CartContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;

const ShopScreen = ({ navigation }) => {
  const { itemCount } = useCart();
  const { handleScroll } = useTabBar();
  const scrollViewRef = useRef(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Section states
  const [forYouProducts, setForYouProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [becauseYouViewed, setBecauseYouViewed] = useState([]);
  const [moreProducts, setMoreProducts] = useState([]);

  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Convert categories to tabs format for swipe navigation
  const categoryTabs = useMemo(() => {
    const allTab = { id: null, handle: null, title: 'Tất cả' };
    const mappedCategories = categories.map(cat => ({
      id: cat.handle,
      handle: cat.handle,
      title: cat.title,
    }));
    return [allTab, ...mappedCategories];
  }, [categories]);

  // Swipe Navigation Hook
  const { panHandlers } = useSwipeNavigation({
    tabs: categoryTabs,
    currentTab: selectedCategory,
    onTabChange: (handle) => handleCategorySelect(handle),
    enabled: true,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryProducts();
    }
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load base data
      const [productsData, categoriesData] = await Promise.all([
        shopifyService.getProducts({ limit: 100 }),
        shopifyService.getCollections(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);

      // Generate recommendation sections
      await loadRecommendationSections(productsData);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendationSections = async (allProducts) => {
    try {
      const [forYou, trending, newItems, viewed] = await Promise.all([
        recommendationService.getForYouProducts(allProducts, 8),
        recommendationService.getTrendingProducts(allProducts, 8),
        recommendationService.getNewArrivals(allProducts, 8),
        recommendationService.getBecauseYouViewed(allProducts, 8),
      ]);

      setForYouProducts(forYou);
      setTrendingProducts(trending);
      setNewArrivals(newItems);
      setBecauseYouViewed(viewed);

      // Initial "more products" for infinite scroll
      const excludeIds = [...forYou, ...trending, ...newItems, ...viewed].map(p => p.id);
      const more = allProducts.filter(p => !excludeIds.includes(p.id)).slice(0, 10);
      setMoreProducts(more);
      setHasMore(allProducts.length > excludeIds.length + more.length);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadCategoryProducts = async () => {
    setLoading(true);
    try {
      const data = await shopifyService.getProducts({
        collection: selectedCategory,
        limit: 50,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error loading category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      // Simulate loading more with shuffled products
      const existingIds = new Set([
        ...forYouProducts,
        ...trendingProducts,
        ...newArrivals,
        ...becauseYouViewed,
        ...moreProducts,
      ].map(p => p.id));

      const remaining = products.filter(p => !existingIds.has(p.id));

      if (remaining.length > 0) {
        // Shuffle and take next batch
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        const nextBatch = shuffled.slice(0, 10);
        setMoreProducts(prev => [...prev, ...nextBatch]);
        setPage(prev => prev + 1);
        setHasMore(remaining.length > nextBatch.length);
      } else {
        // Recycle products with different order (infinite effect)
        const recycled = await recommendationService.getRecommendations(products, {
          limit: 10,
          excludeIds: moreProducts.slice(-20).map(p => p.id),
        });
        setMoreProducts(prev => [...prev, ...recycled]);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleProductPress = async (product) => {
    // Track view for recommendations
    await recommendationService.trackView(product);
    navigation.navigate('ProductDetail', { product });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (!category) {
      // Reset to all products view
      loadInitialData();
    }
  };

  // Render horizontal product list
  const renderHorizontalSection = (title, icon, products, showAll = true) => {
    if (!products || products.length === 0) return null;

    const IconComponent = icon;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <IconComponent size={20} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {showAll && (
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={COLORS.purple} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {products.map((product, index) => (
            <ProductCard
              key={`${product.id}-${index}`}
              product={product}
              onPress={() => handleProductPress(product)}
              style={styles.horizontalCard}
              darkMode={true}
              compact={true}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render grid products for infinite scroll
  const renderGridProducts = () => {
    if (moreProducts.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Star size={20} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Khám Phá Thêm</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {moreProducts.map((product, index) => (
            <ProductCard
              key={`more-${product.id}-${index}`}
              product={product}
              onPress={() => handleProductPress(product)}
              style={[
                styles.gridCard,
                index % 2 === 0 ? styles.leftCard : styles.rightCard,
              ]}
              darkMode={true}
            />
          ))}
        </View>

        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.gold} />
            <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
          </View>
        )}
      </View>
    );
  };

  // Check if near bottom for infinite scroll
  const handleScrollEnd = (event) => {
    handleScroll(event);

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !loadingMore && hasMore) {
      loadMoreProducts();
    }
  };

  // Category view (filtered products grid)
  const renderCategoryView = () => (
    <FlatList
      data={products}
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
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.gold}
          colors={[COLORS.gold]}
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

  if (loading && products.length === 0) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
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

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          darkMode={true}
        />

        {/* Content - with swipe navigation */}
        <Animated.View style={{ flex: 1 }} {...panHandlers}>
          {selectedCategory ? (
            // Show filtered grid when category is selected
            renderCategoryView()
          ) : (
            // Show recommendation sections for "All" view
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onScroll={handleScrollEnd}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.gold}
                  colors={[COLORS.gold]}
                />
              }
              contentContainerStyle={styles.scrollContent}
            >
              {/* Section 1: For You */}
              {renderHorizontalSection('Dành Cho Bạn', Sparkles, forYouProducts)}

              {/* Section 2: Trending */}
              {renderHorizontalSection('Đang Thịnh Hành', TrendingUp, trendingProducts)}

              {/* Section 3: New Arrivals */}
              {renderHorizontalSection('Hàng Mới Về', Clock, newArrivals)}

              {/* Section 4: Because You Viewed */}
              {renderHorizontalSection('Vì Bạn Đã Xem', Star, becauseYouViewed)}

              {/* Section 5: Infinite Grid - More Products */}
              {renderGridProducts()}

              {/* Bottom padding for tab bar */}
              <View style={{ height: 120 }} />
            </ScrollView>
          )}
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

  scrollContent: {
    paddingBottom: 20,
  },

  // Header - DARK THEME v3.0
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderBottomWidth: 1.2,
    borderBottomColor: COLORS.inputBorder,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 44,
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
    backgroundColor: COLORS.burgundy,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Sections
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
  },

  // Horizontal list
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  horizontalCard: {
    width: CARD_WIDTH * 0.85,
    marginRight: SPACING.md,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.md,
  },
  grid: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
  },
  leftCard: {
    marginRight: SPACING.xs,
  },
  rightCard: {
    marginLeft: SPACING.xs,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});

export default ShopScreen;
