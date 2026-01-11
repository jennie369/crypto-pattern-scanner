/**
 * GEM Mobile - Product Card Component
 * Day 3-4: Shopify Integration
 *
 * Display product info and navigate to Shop tab
 * Includes CTA buttons: Mua ngay, Thêm vào giỏ
 *
 * Uses design tokens from DESIGN_TOKENS.md
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Star, Sparkles, Award, ShoppingCart, Zap, Package } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useCart } from '../../contexts/CartContext';

/**
 * Product Card for displaying Shopify products
 * Now fetches real Shopify data on mount for images
 * Supports onQuickBuy callback for chat purchase flow with upsells
 */
const ProductCard = ({ product, onPress, compact = false, showCTA = true, onQuickBuy }) => {
  const navigation = useNavigation();
  const { addItem } = useCart();

  // State for fetched product data
  const [shopifyProduct, setShopifyProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  if (!product) return null;

  // Fetch real Shopify product on mount - try handle first, then search by name
  useEffect(() => {
    const fetchShopifyProduct = async () => {
      // Skip if already have image or is local fallback
      if (product.imageUrl || product.isLocalFallback) {
        return;
      }

      setLoading(true);
      try {
        const { shopifyService } = require('../../services/shopifyService');
        let fetchedProduct = null;

        // Try to fetch by handle first
        if (product.handle || product.shopifyHandle) {
          const handle = product.handle || product.shopifyHandle;
          console.log('[ProductCard] Fetching by handle:', handle);
          fetchedProduct = await shopifyService.getProductByHandle(handle);
        }

        // If not found by handle, try search by name
        if (!fetchedProduct && product.name) {
          console.log('[ProductCard] Handle not found, searching by name:', product.name);
          // Extract search term from name (e.g., "Thạch Anh Tím (Amethyst)" -> "thạch anh tím")
          const searchTerm = product.name.split('(')[0].trim();
          const searchResults = await shopifyService.searchProducts(searchTerm);

          if (searchResults && searchResults.length > 0) {
            fetchedProduct = searchResults[0];
            console.log('[ProductCard] Found by search:', fetchedProduct.title);
          }
        }

        if (fetchedProduct) {
          console.log('[ProductCard] Got Shopify product:', fetchedProduct.title);
          setShopifyProduct(fetchedProduct);
        }
      } catch (error) {
        console.warn('[ProductCard] Failed to fetch Shopify product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopifyProduct();
  }, [product.handle, product.shopifyHandle, product.name]);

  // Format price helper - show full price with dot separators (Vietnamese format)
  // MUST be defined BEFORE displayData uses it
  function formatPrice(value) {
    if (!value) return 'Liên hệ';
    const num = parseFloat(value);
    if (isNaN(num)) return 'Liên hệ';
    // Always show full price with dot separators for readability
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  }

  // Get raw price value from product or shopify
  const rawPriceValue = shopifyProduct?.variants?.[0]?.price ||
                        product.rawPrice ||
                        product.price ||
                        product.variants?.[0]?.price ||
                        0;

  // Get display data - prefer Shopify data, fallback to prop data
  const displayData = {
    name: shopifyProduct?.title || product.name || product.title,
    description: shopifyProduct?.description || product.description || '',
    price: formatPrice(rawPriceValue), // Always format the price
    imageUrl: shopifyProduct?.images?.[0]?.src ||
              shopifyProduct?.image ||
              product.imageUrl ||
              null,
    rawPrice: rawPriceValue,
  };

  const handlePress = async () => {
    if (onPress) {
      onPress(product);
      return;
    }

    // Navigate to Shop tab → Product Detail screen
    try {
      const { shopifyService } = require('../../services/shopifyService');
      let fullProduct = shopifyProduct;

      // Fetch if not already fetched
      if (!fullProduct && (product.handle || product.shopifyHandle)) {
        const handle = product.handle || product.shopifyHandle;
        fullProduct = await shopifyService.getProductByHandle(handle);
      }

      if (fullProduct) {
        // Navigate directly to ProductDetail within current stack
        // This keeps the back button working correctly
        navigation.navigate('ProductDetail', { product: fullProduct });
      } else {
        // Navigate to Shop tab main screen to search
        navigation.navigate('Shop', {
          screen: 'ShopMain',
          params: { searchQuery: displayData.name }
        });
      }
    } catch (error) {
      console.error('[ProductCard] Navigation error:', error);
      navigation.navigate('Shop');
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const productToAdd = shopifyProduct || {
        ...product,
        title: displayData.name,
        variants: [{
          id: product.id,
          price: displayData.rawPrice,
          title: 'Default'
        }]
      };

      const variant = productToAdd.variants?.[0];
      if (variant) {
        await addItem(productToAdd, variant, 1);
      }
    } catch (error) {
      console.error('[ProductCard] Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    // If onQuickBuy callback is provided, use it for chat purchase flow with upsells
    if (onQuickBuy) {
      const productToUse = shopifyProduct || {
        ...product,
        title: displayData.name,
        variants: [{
          id: product.id,
          price: displayData.rawPrice,
          title: 'Default'
        }]
      };
      onQuickBuy(productToUse);
      return;
    }
    // Default behavior: add to cart and go to cart
    await handleAddToCart();
    navigation.navigate('Shop', { screen: 'Cart' });
  };

  // Get icon based on product type
  const getProductIcon = () => {
    switch (product.type) {
      case 'crystal':
        return <Sparkles size={14} color={COLORS.cyan} />;
      case 'bundle':
        return <Award size={14} color={COLORS.gold} />;
      case 'course':
        return <Star size={14} color={COLORS.purple} />;
      default:
        return <ShoppingBag size={14} color={COLORS.gold} />;
    }
  };

  // Get type label
  const getTypeLabel = () => {
    switch (product.type) {
      case 'crystal':
        return 'Đá Phong Thủy';
      case 'bundle':
        return product.tier || 'Bundle';
      case 'course':
        return 'Khóa Học';
      default:
        return 'Sản Phẩm';
    }
  };

  // Get border color based on type
  const getBorderColor = () => {
    switch (product.type) {
      case 'crystal':
        return 'rgba(0, 240, 255, 0.3)';
      case 'bundle':
        return 'rgba(255, 189, 89, 0.4)';
      case 'course':
        return 'rgba(106, 91, 255, 0.3)';
      default:
        return 'rgba(255, 189, 89, 0.3)';
    }
  };

  // Compact version
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { borderColor: getBorderColor() }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {displayData.imageUrl ? (
          <Image
            source={{ uri: displayData.imageUrl }}
            style={styles.compactImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.compactImage, styles.imagePlaceholder]}>
            <Package size={20} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {displayData.name}
          </Text>
          <Text style={styles.compactPrice}>{displayData.price}</Text>
        </View>
        <ShoppingBag size={16} color={COLORS.gold} />
      </TouchableOpacity>
    );
  }

  // Full card version with CTA buttons
  return (
    <View style={[styles.card, { borderColor: getBorderColor() }]}>
      {/* Product Image */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.imageContainer}>
        {loading ? (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <ActivityIndicator size="small" color={COLORS.gold} />
          </View>
        ) : displayData.imageUrl ? (
          <Image
            source={{ uri: displayData.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Package size={32} color={COLORS.textMuted} />
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Type badge */}
        <View style={styles.typeBadge}>
          {getProductIcon()}
          <Text style={styles.typeText}>{getTypeLabel()}</Text>
        </View>

        {/* Name - Tappable */}
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.name} numberOfLines={2}>
            {displayData.name}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        {displayData.description && (
          <Text style={styles.description} numberOfLines={2}>
            {displayData.description}
          </Text>
        )}

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{displayData.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          )}
        </View>

        {/* CTA Buttons */}
        {showCTA && (
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <ActivityIndicator size="small" color={COLORS.gold} />
              ) : (
                <>
                  <ShoppingCart size={14} color={COLORS.gold} />
                  <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={handleBuyNow}
            >
              <Zap size={14} color="#FFF" />
              <Text style={styles.buyNowText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Savings badge for bundles */}
        {product.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Tiết kiệm {product.savings}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Product Card List - Display multiple products
 */
export const ProductCardList = ({ products, title, onProductPress }) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.listContainer}>
      {title && <Text style={styles.listTitle}>{title}</Text>}
      {products.map((product, index) => (
        <ProductCard
          key={product.id || index}
          product={product}
          onPress={onProductPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Full Card - Vertical layout for CTA buttons
  card: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  imageContainer: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 140,
  },
  imagePlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
    gap: 6,
  },

  // Type badge
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Name
  name: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 0.3,
  },

  // Description
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // CTA Buttons
  ctaContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  addToCartText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.burgundy,
  },
  buyNowText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },

  // Savings badge
  savingsBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  savingsText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#000',
  },

  // Compact Card
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  compactPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
    marginTop: 2,
  },

  // List
  listContainer: {
    marginTop: SPACING.md,
  },
  listTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
});

export default ProductCard;
