/**
 * QuickBuyModal Component
 * Quick purchase modal for crystals from chat
 * Shows product info, quantity selector, and buy/add to cart options
 * Triggers UpsellModal after selection
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  Gem,
  Star,
  Check,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { useCart } from '../../contexts/CartContext';
import crystalUpsellService from '../../services/crystalUpsellService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickBuyModal = ({
  visible,
  product,
  onClose,
  onShowUpsell,
  onBuyNow,
}) => {
  const { addItem, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (visible && product) {
      setQuantity(1);
      setAddedToCart(false);
      // Select first variant by default
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [visible, product?.id]);

  // Get product image
  const getImageUrl = useCallback(() => {
    if (!product) return null;
    return product.images?.[0]?.src ||
           product.images?.[0]?.url ||
           product.image?.src ||
           product.image ||
           null;
  }, [product]);

  // Get product price
  const getPrice = useCallback(() => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.price || 0);
    }
    return parseFloat(product?.variants?.[0]?.price || product?.price || 0);
  }, [product, selectedVariant]);

  // Format price
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Handle quantity change
  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    setLoading(true);
    try {
      await addItem(product, selectedVariant, quantity);
      setAddedToCart(true);

      // Fetch upsells and show upsell modal after a short delay
      setTimeout(async () => {
        try {
          const upsellData = await crystalUpsellService.getUpsellSuggestions(product, 3);
          if (upsellData.upsells && upsellData.upsells.length > 0) {
            onClose();
            onShowUpsell?.(upsellData);
          } else {
            // No upsells, just show success
            setTimeout(() => onClose(), 1000);
          }
        } catch (err) {
          console.error('[QuickBuy] Upsell fetch error:', err);
          setTimeout(() => onClose(), 1000);
        }
      }, 500);
    } catch (error) {
      console.error('[QuickBuy] Add to cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle buy now (skip upsell, go directly to checkout)
  const handleBuyNow = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Add to cart first
      await addItem(product, selectedVariant, quantity);

      // Fetch upsells for the checkout flow
      const upsellData = await crystalUpsellService.getUpsellSuggestions(product, 3);

      onClose();
      onBuyNow?.({
        product,
        variant: selectedVariant,
        quantity,
        upsells: upsellData.upsells || [],
      });
    } catch (error) {
      console.error('[QuickBuy] Buy now error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  const imageUrl = getImageUrl();
  const price = getPrice();
  const totalPrice = price * quantity;

  // Get tags for display
  const tags = product.tags || [];
  const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  const displayTags = tagList.filter(t =>
    !['Bestseller', 'Hot Product'].includes(t)
  ).slice(0, 3);
  const isBestseller = tagList.some(t =>
    ['Bestseller', 'Hot Product'].includes(t)
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContainer}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Gem size={20} color={COLORS.gold} />
                <Text style={styles.headerTitle}>Mua nhanh</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Product Info */}
              <View style={styles.productRow}>
                {/* Image */}
                <View style={styles.imageContainer}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Gem size={32} color={COLORS.textMuted} />
                    </View>
                  )}
                  {isBestseller && (
                    <View style={styles.bestsellerBadge}>
                      <Star size={10} color="#FFF" fill="#FFF" />
                      <Text style={styles.bestsellerText}>HOT</Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>

                  {/* Tags */}
                  {displayTags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {displayTags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Price */}
                  <Text style={styles.price}>
                    {formatPrice(price)}
                  </Text>
                </View>
              </View>

              {/* Variant Selection (if multiple variants) */}
              {product.variants && product.variants.length > 1 && (
                <View style={styles.variantSection}>
                  <Text style={styles.sectionTitle}>Phân loại</Text>
                  <View style={styles.variantList}>
                    {product.variants.map((variant, index) => (
                      <TouchableOpacity
                        key={variant.id || index}
                        style={[
                          styles.variantOption,
                          selectedVariant?.id === variant.id && styles.variantSelected,
                        ]}
                        onPress={() => setSelectedVariant(variant)}
                      >
                        <Text
                          style={[
                            styles.variantText,
                            selectedVariant?.id === variant.id && styles.variantTextSelected,
                          ]}
                        >
                          {variant.title || 'Default'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Quantity Selector */}
              <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>Số lượng</Text>
                <View style={styles.quantityRow}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
                      onPress={handleDecrement}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} color={quantity <= 1 ? COLORS.textMuted : COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={[styles.quantityBtn, quantity >= 10 && styles.quantityBtnDisabled]}
                      onPress={handleIncrement}
                      disabled={quantity >= 10}
                    >
                      <Plus size={18} color={quantity >= 10 ? COLORS.textMuted : COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.totalPrice}>
                    {formatPrice(totalPrice)}
                  </Text>
                </View>
              </View>

              {/* Upsell Hint */}
              <View style={styles.upsellHint}>
                <Sparkles size={14} color={COLORS.gold} />
                <Text style={styles.upsellHintText}>
                  Thêm vào giỏ để xem combo giảm giá!
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
              {addedToCart ? (
                <View style={styles.successRow}>
                  <Check size={20} color="#4CAF50" />
                  <Text style={styles.successText}>Đã thêm vào giỏ hàng!</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  {/* Add to Cart */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cartBtn]}
                    onPress={handleAddToCart}
                    disabled={loading || cartLoading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.gold} />
                    ) : (
                      <>
                        <ShoppingCart size={18} color={COLORS.gold} />
                        <Text style={styles.cartBtnText}>Thêm vào giỏ</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Buy Now */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.buyBtn]}
                    onPress={handleBuyNow}
                    disabled={loading || cartLoading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <CreditCard size={18} color="#FFF" />
                        <Text style={styles.buyBtnText}>Mua ngay</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    backgroundColor: 'rgba(20, 20, 40, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    padding: SPACING.lg,
  },

  // Product Row
  productRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestsellerBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestsellerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  tag: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#9B59B6',
    fontWeight: '500',
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Variant Section
  variantSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  variantOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  variantSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  variantText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  variantTextSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Quantity Section
  quantitySection: {
    marginBottom: SPACING.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnDisabled: {
    opacity: 0.4,
  },
  quantityValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Upsell Hint
  upsellHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  upsellHintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Footer
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 14,
  },
  cartBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  cartBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  buyBtn: {
    backgroundColor: COLORS.gold,
  },
  buyBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#0F1030',
  },

  // Success
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#4CAF50',
  },
});

export default QuickBuyModal;
