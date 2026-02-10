/**
 * Quick Purchase Sheet Component
 * Phase 3: Multi-Platform Integration
 *
 * Bottom sheet for quick product purchase during livestream
 * Features:
 * - Swipe to close
 * - Variant selection (size, color, etc.)
 * - Quantity adjustment
 * - Add to cart / Buy now
 * - Stock availability check
 * - Price display with discounts
 */

import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../../contexts/SettingsContext';
import { CartContext } from '../../contexts/CartContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const DRAG_THRESHOLD = 100;

const QuickPurchaseSheet = ({
  product,
  isVisible,
  onClose,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const { addToCart } = useContext(CartContext) || {};

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Variants extraction
  const variants = product?.variants || [];
  const hasVariants = variants.length > 1;

  // Price calculation
  const currentVariant = selectedVariant || variants[0];
  const price = currentVariant?.price || product?.price || 0;
  const compareAtPrice = currentVariant?.compareAtPrice || product?.compareAtPrice;
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;

  // Stock check
  const stockQuantity = currentVariant?.inventory_quantity || product?.inventory_quantity || 0;
  const inStock = stockQuantity > 0;
  const maxQuantity = Math.min(stockQuantity, 10);

  const styles = useMemo(() => StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 999,
    },
    backdropTouchable: {
      flex: 1,
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: SHEET_HEIGHT,
      zIndex: 1000,
    },
    dragHandleContainer: {
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.textMuted,
      borderRadius: 2,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    closeButton: {
      position: 'absolute',
      top: 8,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    scrollContent: {
      flex: 1,
      marginTop: 16,
    },
    productHeader: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    productImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.surfaceDark,
    },
    productInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: 8,
    },
    productTitle: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    price: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: '700',
    },
    comparePrice: {
      color: colors.textMuted,
      fontSize: 14,
      textDecorationLine: 'line-through',
    },
    discountBadge: {
      backgroundColor: colors.error,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    discountText: {
      color: colors.textLight,
      fontSize: 11,
      fontWeight: '700',
    },
    stockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    stockText: {
      color: colors.success,
      fontSize: 12,
    },
    outOfStock: {
      color: colors.error,
    },
    benefitContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 16,
    },
    benefitText: {
      color: colors.gold,
      fontSize: 13,
      flex: 1,
    },
    variantSection: {
      marginBottom: 16,
    },
    optionGroup: {
      marginBottom: 12,
    },
    optionLabel: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 8,
    },
    optionValues: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    optionButtonSelected: {
      borderColor: colors.gold,
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    optionButtonText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    optionButtonTextSelected: {
      color: colors.gold,
      fontWeight: '600',
    },
    quantitySection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      marginBottom: 16,
    },
    quantityLabel: {
      color: colors.textLight,
      fontSize: 15,
      fontWeight: '500',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    quantityButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonDisabled: {
      opacity: 0.4,
    },
    quantityValue: {
      color: colors.textLight,
      fontSize: 18,
      fontWeight: '600',
      minWidth: 30,
      textAlign: 'center',
    },
    totalSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    totalLabel: {
      color: colors.textMuted,
      fontSize: 15,
    },
    totalValue: {
      color: colors.gold,
      fontSize: 20,
      fontWeight: '700',
    },
    viewDetailsLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    viewDetailsText: {
      color: colors.gold,
      fontSize: 14,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    addToCartText: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '600',
    },
    buyNowButton: {
      flex: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.gold,
    },
    buyNowText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariant(variants[0] || null);
      setQuantity(1);
    }
  }, [product?.id]);

  // Animate sheet
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Pan responder for drag-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return;

    setIsAdding(true);
    try {
      const cartItem = {
        product,
        variant: currentVariant,
        quantity,
      };

      if (addToCart) {
        await addToCart(cartItem);
      }

      onAddToCart?.(cartItem);
      closeSheet();
    } catch (error) {
      console.error('[QuickPurchase] Add to cart error:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!inStock || isBuying) return;

    setIsBuying(true);
    try {
      const orderItem = {
        product,
        variant: currentVariant,
        quantity,
      };

      onBuyNow?.(orderItem);
    } catch (error) {
      console.error('[QuickPurchase] Buy now error:', error);
    } finally {
      setIsBuying(false);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Extract variant options (size, color, etc.)
  const getVariantOptions = () => {
    const options = {};
    variants.forEach((v) => {
      if (v.option1) {
        if (!options.option1) options.option1 = { name: product?.options?.[0]?.name || 'Size', values: [] };
        if (!options.option1.values.includes(v.option1)) {
          options.option1.values.push(v.option1);
        }
      }
      if (v.option2) {
        if (!options.option2) options.option2 = { name: product?.options?.[1]?.name || 'Color', values: [] };
        if (!options.option2.values.includes(v.option2)) {
          options.option2.values.push(v.option2);
        }
      }
    });
    return options;
  };

  if (!product) return null;

  const variantOptions = getVariantOptions();

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            pointerEvents: isVisible ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={closeSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <LinearGradient
          colors={settings.theme === 'light' ? [colors.bgDarkest, colors.bgDarkest] : ['rgba(30, 30, 40, 0.98)', 'rgba(20, 20, 30, 1)']}
          style={styles.content}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Header */}
            <View style={styles.productHeader}>
              <Image
                source={{ uri: product.image || product.images?.[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.title}
                </Text>

                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{formatPrice(price)}</Text>
                  {hasDiscount && (
                    <>
                      <Text style={styles.comparePrice}>
                        {formatPrice(compareAtPrice)}
                      </Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discountPercent}%</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Stock Status */}
                <View style={styles.stockContainer}>
                  {inStock ? (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={colors.success}
                      />
                      <Text style={styles.stockText}>
                        Còn {stockQuantity} sản phẩm
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="close-circle"
                        size={14}
                        color={colors.error}
                      />
                      <Text style={[styles.stockText, styles.outOfStock]}>
                        Hết hàng
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Crystal Benefit */}
            {product.benefit && (
              <View style={styles.benefitContainer}>
                <Ionicons name="sparkles" size={16} color={colors.gold} />
                <Text style={styles.benefitText}>{product.benefit}</Text>
              </View>
            )}

            {/* Variant Selection */}
            {hasVariants && Object.keys(variantOptions).length > 0 && (
              <View style={styles.variantSection}>
                {Object.entries(variantOptions).map(([key, option]) => (
                  <View key={key} style={styles.optionGroup}>
                    <Text style={styles.optionLabel}>{option.name}</Text>
                    <View style={styles.optionValues}>
                      {option.values.map((value) => {
                        const isSelected =
                          key === 'option1'
                            ? currentVariant?.option1 === value
                            : currentVariant?.option2 === value;

                        return (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.optionButton,
                              isSelected && styles.optionButtonSelected,
                            ]}
                            onPress={() => {
                              const newVariant = variants.find((v) =>
                                key === 'option1'
                                  ? v.option1 === value
                                  : v.option2 === value
                              );
                              if (newVariant) {
                                setSelectedVariant(newVariant);
                              }
                            }}
                          >
                            <Text
                              style={[
                                styles.optionButtonText,
                                isSelected && styles.optionButtonTextSelected,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? colors.textMuted : colors.textLight}
                  />
                </TouchableOpacity>

                <Text style={styles.quantityValue}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= maxQuantity && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={
                      quantity >= maxQuantity
                        ? colors.textMuted
                        : colors.textLight
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>
                {formatPrice(price * quantity)}
              </Text>
            </View>

            {/* View Details Link */}
            <TouchableOpacity
              style={styles.viewDetailsLink}
              onPress={() => {
                closeSheet();
                onViewDetails?.(product);
              }}
            >
              <Text style={styles.viewDetailsText}>Xem chi tiết sản phẩm</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gold} />
            </TouchableOpacity>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Add to Cart */}
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !inStock && styles.buttonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={!inStock || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.gold} />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={20} color={colors.gold} />
                  <Text style={styles.addToCartText}>Thêm giỏ</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Buy Now */}
            <TouchableOpacity
              style={[
                styles.buyNowButton,
                !inStock && styles.buttonDisabled,
              ]}
              onPress={handleBuyNow}
              disabled={!inStock || isBuying}
            >
              {isBuying ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.buyNowText}>Mua ngay</Text>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
};

export default QuickPurchaseSheet;
