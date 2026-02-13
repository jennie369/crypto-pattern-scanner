/**
 * ProductSection - Section hiển thị sản phẩm theo category
 * Sử dụng design tokens từ DESIGN_TOKENS.md
 * Dark theme mặc định
 *
 * Hỗ trợ:
 * - Horizontal scroll (default)
 * - Grid layout
 * - Infinite scroll cho section "Khám phá thêm"
 * - Hero banner với InAppBrowser WebView
 */

import React, { useEffect, memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
// Note: Not using useNavigation - InAppBrowser is used as modal component
import ProductCard from './ProductCard';
import { prefetchImages } from '../../../components/Common/OptimizedImage';
import InAppBrowser from '../../../components/Common/InAppBrowser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;
const HERO_BANNER_IMAGE_HEIGHT = 200; // Taller banner image for better visibility

const ProductSection = ({
  title,
  subtitle,
  products = [],
  loading = false,
  layout = 'horizontal', // 'horizontal' hoặc 'grid'
  showViewAll = true,
  onViewAll,
  onProductPress,
  cardWidth = 160,
  style,
  // Infinity scroll props
  hasInfiniteScroll = false,
  onLoadMore,
  loadingMore = false,
  hasMore = true,
  // Hero banner props
  heroBanner = null, // { image_url, title, subtitle, link_url }
}) => {
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
  // Prefetch images when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const imageUrls = products
        .map(p => p.images?.[0]?.src || p.image)
        .filter(Boolean);
      prefetchImages(imageUrls);
    }
  }, [products]);

  // Không render nếu không có sản phẩm và không loading
  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  const renderProduct = ({ item, index }) => (
    <ProductCard
      product={item}
      onPress={() => onProductPress?.(item)}
      style={[
        styles.productCard,
        layout === 'horizontal' && { width: cardWidth },
        layout === 'grid' && styles.gridCard,
      ]}
      compact={layout === 'horizontal'}
    />
  );

  const renderHorizontalList = () => (
    <FlatList
      horizontal
      data={products}
      keyExtractor={(item, index) => item?.id || `product-${index}`}
      renderItem={renderProduct}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
      ItemSeparatorComponent={() => <View style={{ width: SPACING.md }} />}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={4}
      decelerationRate="fast"
      scrollEventThrottle={16}
    />
  );

  // Footer component cho infinite scroll
  // FIX: Only show ONE state at a time, prioritize loading state
  const renderFooter = () => {
    if (!hasInfiniteScroll) return null;

    // Priority 1: Loading more
    if (loadingMore) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingFooterText}>Đang tải thêm...</Text>
        </View>
      );
    }

    // Priority 2: Has more items - show hint to scroll
    if (hasMore && products.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingFooterText}>Kéo xuống để xem thêm</Text>
        </View>
      );
    }

    // Priority 3: No more items - only show if we have products and NOT loading
    if (!hasMore && products.length > 0 && !loadingMore) {
      return (
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingFooterText}>Đã hiển thị tất cả sản phẩm</Text>
        </View>
      );
    }

    return null;
  };

  // Grid với infinite scroll - Use simple View-based grid (NOT FlatList)
  // Parent ScrollView handles scrolling and triggers onLoadMore
  const renderInfiniteGrid = () => {
    // Group products into rows of 2
    const rows = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(products.slice(i, i + 2));
    }

    return (
      <View style={styles.infiniteGridContent}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.infiniteGridRow}>
            {row.map((item, itemIndex) => (
              <View key={item?.id || `product-${rowIndex}-${itemIndex}`} style={styles.infiniteGridItem}>
                <ProductCard
                  product={item}
                  onPress={() => onProductPress?.(item)}
                  style={styles.gridCard}
                />
              </View>
            ))}
            {/* Add empty placeholder if odd number of items in last row */}
            {row.length === 1 && <View style={styles.infiniteGridItem} />}
          </View>
        ))}
        {renderFooter()}
      </View>
    );
  };

  // Grid tĩnh (không infinite scroll)
  const renderGridList = () => (
    <View style={styles.gridContainer}>
      {products.map((product, index) => (
        <View key={product?.id || `grid-product-${index}`} style={styles.gridItem}>
          <ProductCard
            product={product}
            onPress={() => onProductPress?.(product)}
            style={styles.gridCard}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {showViewAll && onViewAll && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAll}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.gold}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Banner - displayed BELOW section header with text below image */}
      {heroBanner?.image_url && heroBanner?.is_active !== false && (
        <TouchableOpacity
          style={styles.heroBannerContainer}
          onPress={handleHeroBannerPress}
          activeOpacity={0.9}
          disabled={!heroBanner?.link_url}
        >
          {/* Banner Image */}
          <Image
            source={{ uri: heroBanner.image_url }}
            style={styles.heroBannerImage}
            resizeMode="cover"
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

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.purple} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : hasInfiniteScroll ? (
        // Infinite scroll grid
        renderInfiniteGrid()
      ) : layout === 'horizontal' ? (
        renderHorizontalList()
      ) : (
        renderGridList()
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
    marginBottom: SPACING.xxl, // 20
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg, // 16
    marginBottom: SPACING.md, // 12
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl, // 18
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    color: COLORS.textPrimary, // #FFFFFF
    marginBottom: SPACING.xxs, // 2
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md, // 12
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs, // 4
    paddingHorizontal: SPACING.sm, // 8
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    fontWeight: TYPOGRAPHY.fontWeight.medium, // 500
    color: COLORS.gold, // #FFBD59
    marginRight: SPACING.xxs, // 2
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg, // 16
  },
  productCard: {
    // Style mặc định cho card
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg - SPACING.xs, // 16 - 4 = 12 (để compensate cho margin của grid items)
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: SPACING.xs, // 4
    marginBottom: SPACING.md, // 12
  },
  gridCard: {
    width: '100%',
  },
  // Infinite scroll grid styles
  infiniteGridContent: {
    paddingHorizontal: SPACING.lg, // 16
  },
  infiniteGridRow: {
    flexDirection: 'row', // FIX: Added missing flexDirection for 2-column layout
    justifyContent: 'space-between',
    marginBottom: SPACING.md, // 12
  },
  infiniteGridItem: {
    width: GRID_CARD_WIDTH,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl, // 20
    gap: SPACING.sm, // 8
  },
  loadingFooterText: {
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl, // 20
  },
  loadingText: {
    marginLeft: SPACING.sm, // 8
    fontSize: TYPOGRAPHY.fontSize.base, // 13
    color: COLORS.textMuted, // rgba(255, 255, 255, 0.6)
  },
});

export default memo(ProductSection);
