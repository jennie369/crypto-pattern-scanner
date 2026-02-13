/**
 * CrystalRecommendation Component - NEW VERSION
 * Shows crystal products from Shopify based on AI context
 * Used in GemMasterScreen and TarotScreen
 * Uses crystalTagMappingService for accurate tag matching
 *
 * Updated: Added "Mua ngay" quick buy button for chat purchase flow
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { Gem, Star, ChevronRight, ShoppingBag, Zap } from 'lucide-react-native';

import {
  getCrystalRecommendations,
  formatPrice,
} from '../../services/crystalTagMappingService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import CustomAlert, { useCustomAlert } from '../CustomAlert';

// Product Card Component
const ProductCard = memo(({ product, index, onPress, onQuickBuy }) => {
  // Safely get image URL
  const imageUrl = product?.images?.[0]?.src ||
                   product?.image?.src ||
                   product?.image ||
                   null;

  // Safely get price
  const price = product?.variants?.[0]?.price ||
                product?.price ||
                0;

  // Check if bestseller
  const tags = product?.tags || [];
  const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  const isBestseller = tagList.some(t => ['Bestseller', 'Hot Product'].includes(t));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(300)}
    >
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onPress(product)}
        activeOpacity={0.8}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Gem size={24} color={COLORS.textMuted} />
            </View>
          )}

          {/* Bestseller badge */}
          {isBestseller && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>HOT</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product?.title || 'Sản phẩm'}
          </Text>

          <View style={styles.ratingRow}>
            <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>

          <Text style={styles.price}>
            {formatPrice(price)}
          </Text>

          {/* Quick Buy Button */}
          {onQuickBuy && (
            <TouchableOpacity
              style={styles.quickBuyBtn}
              onPress={(e) => {
                e.stopPropagation();
                onQuickBuy(product);
              }}
              activeOpacity={0.7}
            >
              <Zap size={12} color="#0F1030" />
              <Text style={styles.quickBuyText}>Mua ngay</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const CrystalRecommendationNew = ({ context, limit = 4, onQuickBuy }) => {
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alert, AlertComponent } = useCustomAlert();

  // Fetch products on mount or context change
  useEffect(() => {
    const fetchProducts = async () => {
      if (!context) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await getCrystalRecommendations(context, limit);
        setProducts(results || []);
      } catch (err) {
        console.error('[CrystalRecommendation] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [context, limit]);

  // Normalize images helper
  const normalizeImages = useCallback((product) => {
    // GraphQL edges format
    if (product.images?.edges) {
      return product.images.edges.map(e => ({
        id: e.node?.id || '',
        url: e.node?.url || e.node?.src || '',
        altText: e.node?.altText || '',
      }));
    }
    // Array format with src
    if (Array.isArray(product.images)) {
      return product.images.map(img => ({
        id: img.id || '',
        url: img.url || img.src || '',
        altText: img.altText || '',
      }));
    }
    // Single image
    if (product.image) {
      return [{
        id: product.image.id || '',
        url: product.image.src || product.image.url || '',
        altText: product.image.altText || '',
      }];
    }
    return [];
  }, []);

  // Normalize variants helper
  const normalizeVariants = useCallback((product) => {
    // GraphQL edges format
    if (product.variants?.edges) {
      return product.variants.edges.map(e => ({
        id: e.node?.id || '',
        title: e.node?.title || '',
        price: e.node?.price?.amount || e.node?.priceV2?.amount || '0',
        currencyCode: e.node?.price?.currencyCode || 'VND',
        availableForSale: e.node?.availableForSale ?? true,
      }));
    }
    // Array format
    if (Array.isArray(product.variants)) {
      return product.variants.map(v => ({
        id: v.id || '',
        title: v.title || '',
        price: v.price?.amount || v.price || '0',
        currencyCode: v.price?.currencyCode || 'VND',
        availableForSale: v.availableForSale ?? true,
      }));
    }
    return [];
  }, []);

  // Navigate to product detail
  const handleProductPress = useCallback((product) => {
    console.log('[CrystalRec] Product pressed:', product?.id);

    // Validate product
    if (!product) {
      alert({
        type: 'info',
        title: 'Thông báo',
        message: 'Không tìm thấy thông tin sản phẩm.',
      });
      return;
    }

    // Get main image URL for ProductDetailScreen
    const mainImage = product?.images?.[0]?.src ||
                      product?.images?.[0]?.url ||
                      product?.image?.src ||
                      product?.image ||
                      null;

    // Build FULL product object với proper normalization
    const fullProduct = {
      id: product.id || product.handle || `product-${Date.now()}`,
      title: product.title || 'Sản phẩm',
      handle: product.handle || '',
      description: product.description || '',
      descriptionHtml: product.description_html || product.descriptionHtml || product.description || '',
      vendor: product.vendor || '',
      productType: product.productType || '',
      tags: product.tags || [],
      availableForSale: product.availableForSale ?? true,
      // Main image for gallery
      image: mainImage,
      // Normalized arrays
      images: normalizeImages(product),
      variants: normalizeVariants(product),
      options: product.options || [],
      // Price - ensure it's a number
      price: product.variants?.[0]?.price || product.price || 0,
      // Price range
      priceRange: product.priceRange || {
        minVariantPrice: {
          amount: product.variants?.[0]?.price || '0',
          currencyCode: 'VND',
        },
      },
    };

    console.log('[CrystalRec] Navigating with product:', fullProduct.id, fullProduct.title);

    // Navigate directly to ProductDetail within current stack
    // This keeps the back button working correctly when inside GemMasterStack
    navigation.navigate('ProductDetail', { product: fullProduct });
  }, [navigation, normalizeImages, normalizeVariants]);

  // Navigate to Shop - still use cross-tab for "View All" since user wants to browse
  const handleViewAll = useCallback(() => {
    navigation.navigate('MainTabs', {
      screen: 'Shop',
      params: { screen: 'ShopMain' },
    });
  }, [navigation]);

  // Loading state
  if (loading) {
    return (
      <Animated.View entering={FadeIn} style={styles.container}>
        <View style={styles.header}>
          <Gem size={18} color="#9B59B6" />
          <Text style={styles.headerTitle}>Đá phong thủy gợi ý</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </Animated.View>
    );
  }

  // Error or empty
  if (error || products.length === 0) {
    return null;
  }

  // Render
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Gem size={18} color="#9B59B6" />
        <Text style={styles.headerTitle}>Đá phong thủy gợi ý cho bạn</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <ChevronRight size={14} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={({ item, index }) => (
          <ProductCard
            product={item}
            index={index}
            onPress={handleProductPress}
            onQuickBuy={onQuickBuy}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      {AlertComponent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: 'rgba(155, 89, 182, 0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  listContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  productCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginTop: 4,
  },
  quickBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: COLORS.gold,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  quickBuyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F1030',
  },
});

export default memo(CrystalRecommendationNew);
