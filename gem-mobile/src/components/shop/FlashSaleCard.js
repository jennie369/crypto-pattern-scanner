/**
 * FlashSaleCard.js - Flash Sale Product Card Component
 * Compact product card for flash sale section
 * Shows discount badge, progress bar, and quick add button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Zap } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import ProgressBar from './ProgressBar';
import OptimizedImage from '../Common/OptimizedImage';

const FlashSaleCard = ({
  product,
  discountPercentage = 0,
  soldCount = 0,
  totalStock = 100,
  onAddToCart,
}) => {
  const navigation = useNavigation();

  // Extract product data with fallbacks
  const title = product?.title || 'Sản phẩm';
  const imageUrl = product?.images?.[0]?.src || product?.image?.src || null;
  const price = parseFloat(product?.variants?.[0]?.price || product?.price || 0);
  const comparePrice = parseFloat(
    product?.variants?.[0]?.compareAtPrice ||
    product?.compareAtPrice ||
    price * (1 + discountPercentage / 100)
  );

  // Format price in Vietnamese format
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePress = () => {
    navigation.navigate('ProductDetail', {
      productId: product?.id,
      handle: product?.handle,
    });
  };

  const handleQuickAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <OptimizedImage
            uri={imageUrl}
            style={styles.image}
            resizeMode="cover"
            showPlaceholder={true}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Zap size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.salePrice}>{formatPrice(price)}</Text>
          {comparePrice > price && (
            <Text style={styles.originalPrice}>{formatPrice(comparePrice)}</Text>
          )}
        </View>

        {/* Progress Bar */}
        <ProgressBar
          sold={soldCount}
          total={totalStock}
          height={4}
          showLabel={false}
          style={styles.progressBar}
        />
        <Text style={styles.soldText}>Đã bán {soldCount}</Text>
      </View>

      {/* Quick Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleQuickAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Mua ngay</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  discountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  discountText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  infoContainer: {
    padding: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 16,
    marginBottom: SPACING.xs,
    height: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  salePrice: {
    color: COLORS.burgundy,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: SPACING.xs,
  },
  originalPrice: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textDecorationLine: 'line-through',
  },
  progressBar: {
    marginBottom: SPACING.xxs,
  },
  soldText: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: SPACING.xs,
  },
  addButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default FlashSaleCard;
