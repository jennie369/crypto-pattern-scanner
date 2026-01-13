/**
 * Gemral - Digital Products Section
 * Main section component for displaying digital products in Shop tab
 */

import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Package, AlertCircle, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import { useDigitalProducts, useHeroProducts } from '../../../hooks/useDigitalProducts';
import { digitalProductService } from '../../../services/digitalProductService';
import { buildNavigationProduct, generateKey } from '../../../utils/digitalProductHelpers';

import TradingCourseHero from './TradingCourseHero';
import DigitalCategoryPills from './DigitalCategoryPills';
import DigitalProductCard from './DigitalProductCard';
import ProductTooltip, { useTooltips } from './ProductTooltip';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

const DigitalProductsSection = ({
  title = 'Sản Phẩm Số',
  subtitle = 'Khóa học & Công cụ Premium',
  limit = 8,
  showHero = true,
  showCategories = true,
  onViewAll,
  style,
}) => {
  const navigation = useNavigation();

  // Tooltips
  const { activeTooltip, showTooltip, hideTooltip } = useTooltips();

  // Products data
  const {
    products,
    loading,
    refreshing,
    error,
    userTier,
    selectedCategory,
    categories,
    refresh,
    changeCategory,
    trackView,
    trackClick,
    isEmpty,
    hasError,
  } = useDigitalProducts({
    category: 'all',
    autoFetch: true,
    trackViews: true,
  });

  // Hero products
  const { products: heroProducts } = useHeroProducts(5);

  // Limit products for section view
  const displayProducts = products.slice(0, limit);

  // Handle product press
  const handleProductPress = useCallback((product) => {
    const fullProduct = digitalProductService.buildFullProduct(product);
    if (!fullProduct) {
      console.warn('[DigitalSection] Invalid product data');
      return;
    }

    // Track view
    trackView(product, 'shop_tab');
    trackClick(product, 'view_detail');

    navigation.navigate('ProductDetail', { product: fullProduct });
  }, [navigation, trackView, trackClick]);

  // Handle upgrade press (for locked products)
  const handleUpgradePress = useCallback(({ requiredTier, product }) => {
    trackClick(product, 'upgrade_prompt');

    // Navigate to product list with tier filter or upgrade screen
    navigation.navigate('DigitalProducts', {
      filter: requiredTier,
      title: `Nâng cấp lên ${requiredTier}`,
    });
  }, [navigation, trackClick]);

  // Handle view all
  const handleViewAll = useCallback(() => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigation.navigate('DigitalProducts', {
        title: 'Sản Phẩm Số',
        category: selectedCategory,
      });
    }
  }, [navigation, onViewAll, selectedCategory]);

  // Handle hero view all
  const handleHeroViewAll = useCallback(() => {
    navigation.navigate('DigitalProducts', {
      title: 'Khóa Học Trading',
      category: 'trading',
    });
  }, [navigation]);

  // Render product card
  const renderProductCard = useCallback(({ item, index }) => (
    <DigitalProductCard
      product={item}
      userTier={userTier}
      isLocked={item.isLocked}
      onPress={handleProductPress}
      onUpgradePress={handleUpgradePress}
      style={styles.card}
    />
  ), [userTier, handleProductPress, handleUpgradePress]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        Không tìm thấy sản phẩm trong danh mục này
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <AlertCircle size={48} color={COLORS.error} />
      <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <RefreshCw size={16} color={COLORS.gold} />
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonTextSmall} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Hero Carousel */}
      {showHero && heroProducts.length > 0 && (
        <TradingCourseHero
          products={heroProducts}
          onProductPress={handleProductPress}
          onViewAllPress={handleHeroViewAll}
        />
      )}

      {/* Section Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={handleViewAll}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      {showCategories && (
        <DigitalCategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={changeCategory}
        />
      )}

      {/* Content */}
      {loading ? (
        renderLoadingSkeleton()
      ) : hasError ? (
        renderErrorState()
      ) : isEmpty ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayProducts}
          renderItem={renderProductCard}
          keyExtractor={generateKey}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Tooltip Modal */}
      <ProductTooltip tooltip={activeTooltip} onClose={hideTooltip} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
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

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: SPACING.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Error State
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xxl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.sm,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },

  // Loading Skeleton
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.glassBgHeavy,
  },
  skeletonText: {
    height: 14,
    width: '80%',
    backgroundColor: COLORS.glassBgHeavy,
    margin: SPACING.sm,
    borderRadius: 4,
  },
  skeletonTextSmall: {
    height: 12,
    width: '50%',
    backgroundColor: COLORS.glassBgHeavy,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 4,
  },
});

export default memo(DigitalProductsSection);
