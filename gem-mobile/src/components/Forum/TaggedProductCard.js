/**
 * Gemral - Tagged Product Card Component
 * Displays product attached to a forum post
 * Auto-refreshes image from Shopify if the cached image is outdated
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import shopifyService from '../../services/shopifyService';
import { prefetchImages } from '../Common/OptimizedImage';

// Cache for fetched product data (session-level)
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const TaggedProductCard = ({ item, onPress }) => {
  const navigation = useNavigation();

  // Support both old format (item.product) and new format (flat structure)
  const cachedProduct = item.product || {
    id: item.product_id,
    title: item.product_title,
    price: item.product_price,
    image: item.product_image,
    handle: item.product_handle,
  };

  const [productData, setProductData] = useState(cachedProduct);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch fresh product data from Shopify
  useEffect(() => {
    const fetchFreshData = async () => {
      const productId = cachedProduct.id || item.product_id;
      const productHandle = cachedProduct.handle || item.product_handle;

      if (!productId && !productHandle) return;

      // Check cache first
      const cacheKey = productId || productHandle;
      const cached = productCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (cached.data?.image !== cachedProduct.image) {
          setProductData(prev => ({
            ...prev,
            image: cached.data.image,
            title: cached.data.title || prev.title,
            price: cached.data.price || prev.price,
          }));
        }
        return;
      }

      try {
        let freshProduct = null;

        // Try to fetch by handle first (more reliable)
        if (productHandle) {
          freshProduct = await shopifyService.getProductByHandle(productHandle);
        }

        // Fallback to fetch by ID
        if (!freshProduct && productId) {
          freshProduct = await shopifyService.getProductById(productId);
        }

        if (freshProduct) {
          // Extract image URL from various formats
          const freshImage = getImageUrl(freshProduct);
          const freshPrice = freshProduct.variants?.[0]?.price || freshProduct.price;

          // Collect all product images for prefetching
          const allImages = [];
          if (freshImage) allImages.push(freshImage);
          if (freshProduct.images?.length > 0) {
            freshProduct.images.forEach(img => {
              const imgUrl = typeof img === 'string' ? img : (img?.src || img?.url);
              if (imgUrl && !allImages.includes(imgUrl)) allImages.push(imgUrl);
            });
          }

          // Prefetch images for faster ProductDetailScreen loading
          if (allImages.length > 0) {
            prefetchImages(allImages.slice(0, 5)); // Prefetch up to 5 images
          }

          // Cache the result with full product data for navigation
          productCache.set(cacheKey, {
            data: {
              image: freshImage,
              title: freshProduct.title,
              price: freshPrice,
              fullProduct: freshProduct, // Store full product for navigation
            },
            timestamp: Date.now(),
          });

          // Update if image changed
          if (freshImage && freshImage !== cachedProduct.image) {
            console.log('[TaggedProductCard] Image updated from Shopify:', {
              productId,
              oldImage: cachedProduct.image?.substring(0, 50),
              newImage: freshImage.substring(0, 50),
            });
            setProductData(prev => ({
              ...prev,
              image: freshImage,
              title: freshProduct.title || prev.title,
              price: freshPrice || prev.price,
              fullProduct: freshProduct,
            }));
          } else {
            // Even if image didn't change, store full product for faster navigation
            setProductData(prev => ({
              ...prev,
              fullProduct: freshProduct,
            }));
          }
        }
      } catch (error) {
        console.warn('[TaggedProductCard] Failed to fetch fresh data:', error.message);
        // Keep using cached data on error
      }
    };

    // Only fetch if no image or image is placeholder
    const hasValidImage = cachedProduct.image &&
      !cachedProduct.image.includes('placehold') &&
      !cachedProduct.image.includes('no-image');

    if (!hasValidImage) {
      fetchFreshData();
    } else {
      // Still fetch in background but with delay to not block initial render
      const timer = setTimeout(fetchFreshData, 1000);
      return () => clearTimeout(timer);
    }
  }, [cachedProduct.id, item.product_id, item.product_handle]);

  // Extract image URL from Shopify product formats
  const getImageUrl = (product) => {
    if (!product) return null;

    // Try various image formats
    if (product.images?.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img?.src) return img.src;
      if (img?.url) return img.url;
    }
    if (product.featuredImage) {
      if (typeof product.featuredImage === 'string') return product.featuredImage;
      return product.featuredImage?.src || product.featuredImage?.url;
    }
    if (product.image) {
      if (typeof product.image === 'string') return product.image;
      return product.image?.src || product.image?.url;
    }
    return null;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(productData);
      return;
    }

    // Use full product if available (pre-fetched from Shopify)
    // This provides all images/variants immediately without needing to re-fetch
    const productForDetail = productData.fullProduct || {
      id: productData.id,
      handle: productData.handle || item.product_handle,
      title: productData.title,
      price: productData.price,
      image: productData.image,
      images: productData.image ? [{ src: productData.image }] : [],
      variants: [{
        id: productData.id,
        price: typeof productData.price === 'string'
          ? parseFloat(productData.price.replace(/[^0-9.-]+/g, ''))
          : productData.price,
        title: 'Default',
      }],
    };

    // Navigate to ProductDetailFromPost within current stack (not cross-tab)
    // This ensures back button works correctly - returns to the post, not switching tabs
    // HomeStack has ProductDetailFromPost registered for this purpose
    navigation.push('ProductDetailFromPost', { product: productForDetail });
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const numericPrice = typeof price === 'number'
      ? price
      : parseFloat(String(price).replace(/[^0-9.-]+/g, ''));

    if (isNaN(numericPrice)) return price;
    return new Intl.NumberFormat('vi-VN').format(numericPrice) + 'đ';
  };

  const imageUrl = productData.image;
  const hasImage = imageUrl && !imageError;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Package size={20} color={COLORS.textMuted} />
          </View>
        )}
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.gold} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {productData.title}
        </Text>
        <Text style={styles.price}>
          {formatPrice(productData.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    maxWidth: 200,
    minWidth: 160,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
    marginRight: SPACING.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

// Clear cache utility (can be called on app refresh or after a certain period)
export const clearProductCache = () => {
  productCache.clear();
};

export default memo(TaggedProductCard, (prevProps, nextProps) => {
  return (
    prevProps.item?.product_id === nextProps.item?.product_id &&
    prevProps.item?.product_image === nextProps.item?.product_image
  );
});
