/**
 * Gemral - Digital Product Card Component
 * Enhanced product card for digital products with tier badges and lock overlay
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ShoppingBag, Crown, Star, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OptimizedImage from '../../../components/Common/OptimizedImage';
import { useCart } from '../../../contexts/CartContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, GRADIENTS } from '../../../utils/tokens';
import {
  TIER_COLORS,
  TIER_NAMES,
  formatPrice,
  calculateDiscount,
} from '../../../utils/digitalProductsConfig';
import {
  extractImageUrl,
  preventDoubleTap,
  PLACEHOLDER_IMAGE,
} from '../../../utils/digitalProductHelpers';
import TierLockOverlay, { TierLockBadge } from './TierLockOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

const DigitalProductCard = ({
  product,
  userTier = 'free',
  onPress,
  onAddToCart,
  onUpgradePress,
  isLocked = false,
  isOwned = false,
  style,
  compact = false,
}) => {
  const { addItem, loading: cartLoading } = useCart();

  // Early return if product is null/undefined
  if (!product) {
    return null;
  }

  // Extract data safely
  const price = product.variants?.[0]?.price || product.price || 0;
  const comparePrice = product.variants?.[0]?.compareAtPrice || product.compareAtPrice;
  const discount = calculateDiscount(price, comparePrice);
  const showDiscount = discount >= 10;

  const tier = product.tier;
  const tierColor = tier ? (TIER_COLORS[tier] || TIER_COLORS.tier1) : null;
  const tierName = tier ? (TIER_NAMES[tier] || tier) : null;

  const imageUrl = extractImageUrl(product, PLACEHOLDER_IMAGE);

  // Handle press with double-tap prevention
  const handlePress = preventDoubleTap(() => {
    if (isLocked) {
      onUpgradePress?.({
        requiredTier: tier,
        currentTier: userTier,
        product,
      });
    } else {
      onPress?.(product);
    }
  }, 500);

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (isLocked) {
      onUpgradePress?.({
        requiredTier: tier,
        currentTier: userTier,
        product,
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      await addItem(product, null, 1);
    }
  }, [product, isLocked, onAddToCart, onUpgradePress, tier, userTier, addItem]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.compactContainer,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />

        {/* Tier Badge - Top Left */}
        {tier && (
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: tierColor.bg, borderColor: tierColor.border },
            ]}
          >
            <Crown size={10} color={tierColor.text} />
            <Text style={[styles.tierBadgeText, { color: tierColor.text }]}>
              {tierName}
            </Text>
          </View>
        )}

        {/* Sale Badge - Top Right */}
        {showDiscount && !isLocked && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{discount}%</Text>
          </View>
        )}

        {/* Owned Badge */}
        {isOwned && (
          <View style={styles.ownedBadge}>
            <Check size={12} color={COLORS.success} />
            <Text style={styles.ownedText}>Đã sở hữu</Text>
          </View>
        )}

        {/* Quick Add Button - Bottom Right */}
        {!isLocked && !isOwned && (
          <TouchableOpacity
            style={styles.quickAddBtn}
            onPress={handleAddToCart}
            disabled={cartLoading}
            activeOpacity={0.8}
          >
            <ShoppingBag size={16} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Lock Overlay for Locked Products */}
        {isLocked && (
          <View style={styles.lockOverlaySmall}>
            <TierLockBadge tier={tier} />
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title || 'Sản phẩm'}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, isLocked && styles.priceDisabled]}>
            {formatPrice(price)}
          </Text>
          {showDiscount && comparePrice && (
            <Text style={styles.comparePrice}>
              {formatPrice(comparePrice)}
            </Text>
          )}
        </View>

        {/* Subscription Type Tag */}
        {product.subscriptionType && (
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {getTypeLabel(product.subscriptionType)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper to get type label in Vietnamese
const getTypeLabel = (type) => {
  const labels = {
    'trading-course': 'Khóa học Trading',
    'spiritual-course': 'Khóa học Tâm Linh',
    'course': 'Khóa học',
    'chatbot': 'Chatbot AI',
    'scanner': 'Scanner',
    'gems': 'Gem Pack',
    'digital': 'Sản phẩm số',
  };
  return labels[type] || type;
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1.2,
    borderColor: COLORS.inputBorder,
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
    backgroundColor: COLORS.glassBgHeavy,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },

  // Tier Badge
  tierBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Sale Badge
  saleBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
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

  // Owned Badge
  ownedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.4)',
    gap: 4,
  },
  ownedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },

  // Quick Add Button
  quickAddBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },

  // Lock Overlay
  lockOverlaySmall: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },

  // Info
  info: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  priceDisabled: {
    color: COLORS.textMuted,
  },
  comparePrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // Type Tag
  typeTag: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeTagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default memo(DigitalProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.isLocked === nextProps.isLocked &&
    prevProps.isOwned === nextProps.isOwned &&
    prevProps.userTier === nextProps.userTier
  );
});
