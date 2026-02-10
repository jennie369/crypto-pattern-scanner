/**
 * Product Overlay Component
 * Phase 3: Multi-Platform Integration
 *
 * Floating product card shown during livestream
 * Features:
 * - Animated entrance/exit
 * - Configurable position and size
 * - Discount badge
 * - Add to cart button with pulse animation
 * - "Đang giới thiệu" live label
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tokens, { COLORS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Position options
export const OVERLAY_POSITIONS = {
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
};

// Size options
export const OVERLAY_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const SIZE_CONFIG = {
  small: { width: SCREEN_WIDTH * 0.4, imageSize: 60, fontSize: 12, padding: 8 },
  medium: { width: SCREEN_WIDTH * 0.55, imageSize: 80, fontSize: 14, padding: 12 },
  large: { width: SCREEN_WIDTH * 0.65, imageSize: 100, fontSize: 16, padding: 16 },
};

const ProductOverlay = ({
  product,
  isVisible = true,
  position = OVERLAY_POSITIONS.BOTTOM_RIGHT,
  size = OVERLAY_SIZES.MEDIUM,
  onPress,
  onAddToCart,
  onDismiss,
  showLiveLabel = true,
  animationDuration = 300,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible && product) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation for CTA button
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, product]);

  if (!product) return null;

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.medium;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const getPositionStyle = () => {
    switch (position) {
      case OVERLAY_POSITIONS.BOTTOM_LEFT:
        return { bottom: 100, left: 12 };
      case OVERLAY_POSITIONS.TOP_RIGHT:
        return { top: 100, right: 12 };
      case OVERLAY_POSITIONS.TOP_LEFT:
        return { top: 100, left: 12 };
      default:
        return { bottom: 100, right: 12 };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          width: config.width,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(30, 30, 40, 0.95)', 'rgba(20, 20, 30, 0.98)']}
        style={[styles.card, { padding: config.padding }]}
      >
        {/* Dismiss Button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={tokens.colors.textMuted} />
        </TouchableOpacity>

        {/* Live Label */}
        {showLiveLabel && (
          <View style={styles.liveLabel}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabelText}>Đang giới thiệu</Text>
          </View>
        )}

        {/* Product Content */}
        <TouchableOpacity
          style={styles.productContent}
          onPress={() => onPress?.(product)}
          activeOpacity={0.8}
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image || product.images?.[0] }}
              style={[
                styles.productImage,
                { width: config.imageSize, height: config.imageSize },
              ]}
              resizeMode="cover"
            />
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <Text
              style={[styles.productTitle, { fontSize: config.fontSize }]}
              numberOfLines={2}
            >
              {product.title}
            </Text>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { fontSize: config.fontSize + 2 }]}>
                {formatPrice(product.price)}
              </Text>
              {hasDiscount && (
                <Text style={styles.comparePrice}>
                  {formatPrice(product.compareAtPrice)}
                </Text>
              )}
            </View>

            {/* Crystal benefit tag */}
            {product.benefit && (
              <View style={styles.benefitTag}>
                <Ionicons name="sparkles" size={10} color={tokens.colors.gold} />
                <Text style={styles.benefitText} numberOfLines={1}>
                  {product.benefit}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Add to Cart Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => onAddToCart?.(product)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={16} color={tokens.colors.background} />
              <Text style={styles.addToCartText}>Thêm giỏ</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Details Button */}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onPress?.(product)}
          >
            <Text style={styles.detailsText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color={tokens.colors.gold} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  liveLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.textLight,
  },
  liveLabelText: {
    color: tokens.colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  productContent: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceDark,
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: tokens.colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  productTitle: {
    color: tokens.colors.textLight,
    fontWeight: '600',
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: tokens.colors.gold,
    fontWeight: '700',
  },
  comparePrice: {
    color: tokens.colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  benefitText: {
    color: tokens.colors.gold,
    fontSize: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: tokens.colors.gold,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addToCartText: {
    color: tokens.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.gold,
  },
  detailsText: {
    color: tokens.colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ProductOverlay;
