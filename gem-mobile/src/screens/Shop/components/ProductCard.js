/**
 * Gemral - Product Card Component
 * Dark theme support
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import OptimizedImage from '../../../components/Common/OptimizedImage';
import { useCart } from '../../../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;

const ProductCard = ({ product, onPress, style, darkMode = true, compact = false }) => {
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

  const imageUrl = product.images?.[0]?.src || product.image || null;

  const handleQuickAdd = async () => {
    await addItem(product, null, 1);
  };

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
      activeOpacity={0.9}
    >
      {/* Image - Using OptimizedImage for fast loading with caching */}
      <View style={[styles.imageContainer, dynamicStyles.imageContainer]}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Sale Badge */}
        {isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{discount}%</Text>
          </View>
        )}

        {/* Quick Add Button */}
        <TouchableOpacity
          style={[styles.quickAddBtn, dynamicStyles.quickAddBtn]}
          onPress={handleQuickAdd}
          disabled={loading}
        >
          <ShoppingBag size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, dynamicStyles.title]} numberOfLines={2}>
          {product.title}
        </Text>

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

  // Info
  info: {
    padding: SPACING.sm,
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

export default ProductCard;
