/**
 * Gemral - Product Card Component
 * Enhanced with wishlist, rating, sold count, and out-of-stock badge
 * Dark theme support
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ShoppingBag, Star, XCircle } from 'lucide-react-native';
import OptimizedImage from '../../../components/Common/OptimizedImage';
import WishlistButton from '../../../components/shop/WishlistButton';
import { useCart } from '../../../contexts/CartContext';
import alertService from '../../../services/alertService';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;

// Helper to extract image URL from various Shopify formats
const getProductImageUrl = (product) => {
  // Try multiple image formats from Shopify
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
  return 'https://placehold.co/400x400/1a0b2e/FFBD59?text=Gemral';
};

const ProductCard = ({
  product,
  onPress,
  style,
  darkMode = true,
  compact = false,
  showWishlist = true,
  showRating = true,
  showSoldCount = false,
}) => {
  const { addItem, loading } = useCart();

  // CRITICAL: Early return if product is null/undefined
  if (!product) {
    return null;
  }

  const price = product.variants?.[0]?.price || product.price || 0;
  const comparePrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice;
  const isOnSale = comparePrice && parseFloat(comparePrice) > parseFloat(price);
  const discount = isOnSale
    ? Math.round((1 - parseFloat(price) / parseFloat(comparePrice)) * 100)
    : 0;

  // Rating and sold count (from product metafields or custom data)
  const rating = product.rating || product.metafields?.rating || null;
  const soldCount = product.soldCount || product.metafields?.sold_count || null;

  // Check if product is out of stock
  // IMPORTANT: Digital products should never show "out of stock" based on inventory
  // Digital products include: courses, ebooks, chatbot subscriptions, gem packs, scanner subscriptions
  const productType = product.product_type?.toLowerCase() || '';
  const handle = product.handle?.toLowerCase() || '';
  const title = product.title?.toLowerCase() || '';

  const isDigitalProduct =
    // Product type checks
    productType.includes('digital') ||
    productType.includes('course') ||
    productType.includes('khoa') ||
    productType.includes('subscription') ||
    productType.includes('chatbot') ||
    productType.includes('gem') ||
    // Tag checks
    product.tags?.some(tag =>
      typeof tag === 'string' && (
        tag.toLowerCase().includes('digital') ||
        tag.toLowerCase().includes('course') ||
        tag.toLowerCase().includes('khoa-hoc') ||
        tag.toLowerCase().includes('ebook') ||
        tag.toLowerCase().includes('chatbot') ||
        tag.toLowerCase().includes('gem-pack') ||
        tag.toLowerCase().includes('subscription') ||
        tag.toLowerCase().includes('scanner')
      )
    ) ||
    // Handle checks
    handle.includes('khoa-hoc') ||
    handle.includes('course') ||
    handle.includes('gem-master') ||
    handle.includes('gem-pack') ||
    handle.includes('chatbot') ||
    handle.includes('scanner') ||
    // Title checks (fallback)
    title.includes('gem master') ||
    title.includes('gem pack') ||
    title.includes('chatbot') ||
    title.includes('scanner');

  // Use Shopify's availableForSale as the primary indicator
  // Fallback to inventory check only for physical products
  const firstVariant = product.variants?.[0];
  const availableForSale = product.availableForSale ?? firstVariant?.availableForSale ?? true;

  // For physical products, check inventory
  const inventoryQuantity = firstVariant?.inventory_quantity ?? product.inventory_quantity ?? null;
  const inventoryPolicy = firstVariant?.inventory_policy || product.inventory_policy || 'deny';
  const inventoryOutOfStock = inventoryQuantity !== null && inventoryQuantity <= 0 && inventoryPolicy === 'deny';

  // Final out of stock check:
  // - Digital products: only if explicitly marked unavailable (availableForSale = false)
  // - Physical products: check both availableForSale and inventory
  const isOutOfStock = isDigitalProduct
    ? (availableForSale === false)
    : (!availableForSale || inventoryOutOfStock);

  const imageUrl = getProductImageUrl(product);

  // OPTIMIZED: useCallback prevents re-creation on every render
  const handleQuickAdd = useCallback(async () => {
    if (isOutOfStock) {
      alertService.showWarning('Hết hàng', 'Sản phẩm này hiện đã hết hàng.');
      return;
    }
    addItem(product, null, 1); // Don't await - let it run in background
  }, [product, isOutOfStock, addItem]);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Dynamic styles based on dark mode
  const dynamicStyles = darkMode ? darkStyles : lightStyles;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        dynamicStyles.container,
        compact && styles.compactContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      delayPressIn={0}
    >
      {/* Image - Using OptimizedImage for fast loading with caching */}
      <View style={[styles.imageContainer, dynamicStyles.imageContainer]}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Sale Badge */}
        {isOnSale && !isOutOfStock && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{discount}%</Text>
          </View>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <XCircle size={12} color="#FFFFFF" />
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}

        {/* Wishlist Button - Top Right */}
        {showWishlist && (
          <View style={styles.wishlistContainer}>
            <WishlistButton
              product={product}
              size={18}
              showBackground={true}
            />
          </View>
        )}

        {/* Quick Add Button - Hide if out of stock */}
        {!isOutOfStock && (
          <TouchableOpacity
            style={[styles.quickAddBtn, dynamicStyles.quickAddBtn]}
            onPress={handleQuickAdd}
            disabled={loading}
            activeOpacity={0.7}
            delayPressIn={0}
          >
            <ShoppingBag size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay} />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, dynamicStyles.title]} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Rating and Sold Count Row */}
        {(showRating && rating) || (showSoldCount && soldCount) ? (
          <View style={styles.metaRow}>
            {showRating && rating && (
              <View style={styles.ratingContainer}>
                <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {showSoldCount && soldCount && (
              <Text style={styles.soldText}>Đã bán {soldCount}</Text>
            )}
          </View>
        ) : null}

        <View style={styles.priceRow}>
          <Text style={[styles.price, dynamicStyles.price]}>{formatPrice(price)}</Text>
          {isOnSale && (
            <Text style={[styles.comparePrice, dynamicStyles.comparePrice]}>{formatPrice(comparePrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  compactContainer: {
    width: 160,
    marginBottom: 0,
  },

  // Image
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  // Sale Badge
  saleBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Out of Stock Badge
  outOfStockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: '#666666',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  outOfStockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },

  // Quick Add Button
  quickAddBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },

  // Wishlist Button Container
  wishlistContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  // Info
  info: {
    padding: SPACING.sm,
  },

  // Meta Row (rating + sold count)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  soldText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  comparePrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textDecorationLine: 'line-through',
  },
});

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgWhite,
    ...SHADOWS.sm,
  },
  imageContainer: {
    backgroundColor: COLORS.bgGray,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.bgGray,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  quickAddBtn: {
    backgroundColor: COLORS.burgundy,
  },
  title: {
    color: COLORS.textDark,
  },
  price: {
    color: COLORS.burgundy,
  },
  comparePrice: {
    color: COLORS.textMuted,
  },
});

// Dark theme styles - DESIGN_TOKENS v3.0
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,              // rgba(15, 16, 48, 0.55)
    borderWidth: 1.2,
    borderColor: COLORS.inputBorder,              // Purple border
  },
  imageContainer: {
    backgroundColor: COLORS.glassBgHeavy,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.glassBgHeavy,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  quickAddBtn: {
    backgroundColor: COLORS.purple,               // Purple button
  },
  title: {
    color: COLORS.textPrimary,
  },
  price: {
    color: COLORS.cyan,                           // Cyan for prices
  },
  comparePrice: {
    color: COLORS.textMuted,
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product id or key props change
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.compact === nextProps.compact
  );
});
