/**
 * Product Recommendation Component
 * Shows relevant products based on chat context
 * Uses REAL Shopify products with ACTUAL tags
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
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { ShoppingBag, Star, ChevronRight } from 'lucide-react-native';

import {
  getProductRecommendations,
  formatProductPrice,
} from '../../services/shopRecommendationService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const ProductRecommendation = ({ context, limit = 4 }) => {
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products on mount/context change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await getProductRecommendations(context, limit);
        setProducts(results || []);
      } catch (err) {
        console.error('[ProductRecommendation] Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (context) {
      fetchProducts();
    }
  }, [context, limit]);

  // Navigate to product detail
  const handleProductPress = useCallback((product) => {
    if (!product?.id) {
      console.warn('[ProductRecommendation] Invalid product');
      return;
    }

    // Build FULL product object with fallbacks
    const fullProduct = {
      id: product.id,
      title: product.title || '',
      description: product.description || '',
      handle: product.handle || '',
      // Arrays MUST have default []
      variants: product.variants || [],
      images: product.images || [],
      options: product.options || [],
      tags: product.tags || [],
      // Other fields
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice || null,
      available: product.available ?? true,
      vendor: product.vendor || 'YinYang Masters',
      productType: product.productType || '',
      image: product.image || null,
    };

    console.log('[ProductRecommendation] Navigate to:', fullProduct.title);

    // Navigate to Shop Tab > ProductDetail
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'ShopTab',
          params: {
            screen: 'ProductDetail',
            params: { product: fullProduct },
          },
        },
      })
    );
  }, [navigation]);

  // Navigate to Shop
  const handleViewAll = useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'ShopTab',
          params: { screen: 'ShopMain' },
        },
      })
    );
  }, [navigation]);

  // Render product card
  const renderProduct = useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(300)}
    >
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <ShoppingBag size={24} color={COLORS.textMuted} />
            </View>
          )}

          {/* Sale Badge */}
          {item.compareAtPrice && item.compareAtPrice > item.price && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.info}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>
            {formatProductPrice(item.price)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [handleProductPress]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ShoppingBag size={18} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Sản phẩm gợi ý</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Error or empty state
  if (error || products.length === 0) {
    return null; // Don't show if no products
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShoppingBag size={18} color={COLORS.gold} />
        <Text style={styles.headerTitle}>Sản phẩm gợi ý</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <ChevronRight size={14} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
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
    paddingHorizontal: SPACING.xs,
    gap: SPACING.md,
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
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    padding: SPACING.sm,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});

export default memo(ProductRecommendation);
