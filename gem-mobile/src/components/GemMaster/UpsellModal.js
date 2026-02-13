/**
 * UpsellModal Component
 * Shows upsell suggestions after adding product to cart
 * Displays combo discount and allows adding multiple products
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
  Plus,
  Check,
  ShoppingCart,
  CreditCard,
  Sparkles,
  Star,
  Gem,
  Tag,
  ArrowRight,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
  FadeInRight,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { useCart } from '../../contexts/CartContext';
import crystalUpsellService from '../../services/crystalUpsellService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const UpsellModal = ({
  visible,
  upsellData,
  onClose,
  onCheckout,
  onContinueShopping,
}) => {
  const { addItem, items, loading: cartLoading, createCheckout } = useCart();
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comboSummary, setComboSummary] = useState(null);

  // Reset selected upsells when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedUpsells([]);
      calculateCombo([]);
    }
  }, [visible]);

  // Calculate combo price with discount
  const calculateCombo = useCallback((selected) => {
    // Current cart items + selected upsells
    const allItems = [
      ...items,
      ...selected.map(product => ({
        price: parseFloat(product.variants?.[0]?.price || product.price || 0),
        quantity: 1,
      })),
    ];

    const summary = crystalUpsellService.calculateComboTotal(allItems);
    setComboSummary(summary);
  }, [items]);

  // Toggle upsell selection
  const toggleUpsell = (product) => {
    setSelectedUpsells(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      let newSelected;
      if (isSelected) {
        newSelected = prev.filter(p => p.id !== product.id);
      } else {
        newSelected = [...prev, product];
      }
      calculateCombo(newSelected);
      return newSelected;
    });
  };

  // Check if product is selected
  const isSelected = (product) => {
    return selectedUpsells.some(p => p.id === product.id);
  };

  // Handle add selected upsells and checkout
  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Add all selected upsells to cart
      for (const product of selectedUpsells) {
        await addItem(product, null, 1);
      }

      // Create checkout
      const result = await createCheckout();
      if (result.success) {
        onClose();
        onCheckout?.(result.checkoutUrl);
      }
    } catch (error) {
      console.error('[Upsell] Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle skip upsells and checkout directly
  const handleSkipAndCheckout = async () => {
    setLoading(true);
    try {
      const result = await createCheckout();
      if (result.success) {
        onClose();
        onCheckout?.(result.checkoutUrl);
      }
    } catch (error) {
      console.error('[Upsell] Skip checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle continue shopping
  const handleContinue = () => {
    onClose();
    onContinueShopping?.();
  };

  // Format price
  const formatPrice = (amount) => {
    return crystalUpsellService.formatPrice(amount);
  };

  if (!upsellData || !upsellData.upsells) return null;

  const { primaryProduct, upsells, matchedTag } = upsellData;
  const hasUpsells = upsells && upsells.length > 0;

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
                <Sparkles size={20} color={COLORS.gold} />
                <Text style={styles.headerTitle}>Combo giảm giá!</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Discount Banner */}
            {comboSummary && comboSummary.discountPercent > 0 && (
              <Animated.View
                entering={FadeIn.delay(200)}
                style={styles.discountBanner}
              >
                <Tag size={16} color={COLORS.gold} />
                <Text style={styles.discountText}>
                  Mua thêm để được giảm{' '}
                  <Text style={styles.discountHighlight}>
                    {comboSummary.discountPercent}%
                  </Text>
                </Text>
              </Animated.View>
            )}

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Success Message */}
              <View style={styles.successSection}>
                <View style={styles.successIcon}>
                  <Check size={24} color="#4CAF50" />
                </View>
                <View style={styles.successTextContainer}>
                  <Text style={styles.successTitle}>
                    Đã thêm vào giỏ hàng!
                  </Text>
                  <Text style={styles.successSubtitle} numberOfLines={1}>
                    {primaryProduct?.title}
                  </Text>
                </View>
              </View>

              {/* Upsell Products */}
              {hasUpsells && (
                <View style={styles.upsellSection}>
                  <Text style={styles.sectionTitle}>
                    Kết hợp để tăng hiệu quả
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Chọn thêm sản phẩm bổ trợ:
                  </Text>

                  {upsells.map((product, index) => (
                    <UpsellProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      selected={isSelected(product)}
                      onToggle={() => toggleUpsell(product)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </View>
              )}

              {/* Combo Summary */}
              {comboSummary && (
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>
                      {formatPrice(comboSummary.subtotal)}
                    </Text>
                  </View>
                  {comboSummary.discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.discountLabel}>
                        Giảm giá combo ({comboSummary.discountPercent}%)
                      </Text>
                      <Text style={styles.discountValue}>
                        -{formatPrice(comboSummary.discount)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>
                      {formatPrice(comboSummary.total)}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
              {selectedUpsells.length > 0 ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.checkoutBtn]}
                  onPress={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#0F1030" />
                  ) : (
                    <>
                      <CreditCard size={18} color="#0F1030" />
                      <Text style={styles.checkoutBtnText}>
                        Thanh toán ({selectedUpsells.length + 1} sản phẩm)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.continueBtn]}
                    onPress={handleContinue}
                  >
                    <ShoppingCart size={18} color={COLORS.gold} />
                    <Text style={styles.continueBtnText}>Tiếp tục mua</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.skipCheckoutBtn]}
                    onPress={handleSkipAndCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.skipCheckoutBtnText}>Thanh toán</Text>
                        <ArrowRight size={16} color="#FFF" />
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

// Upsell Product Card Component
const UpsellProductCard = ({
  product,
  index,
  selected,
  onToggle,
  formatPrice,
}) => {
  const imageUrl = product.images?.[0]?.src ||
                   product.images?.[0]?.url ||
                   product.image?.src ||
                   product.image ||
                   null;

  const price = parseFloat(product.variants?.[0]?.price || product.price || 0);
  const reason = product.upsellReason || 'Sản phẩm bổ trợ';

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(300)}
    >
      <TouchableOpacity
        style={[
          styles.upsellCard,
          selected && styles.upsellCardSelected,
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <Check size={14} color="#FFF" />
          ) : (
            <Plus size={14} color={COLORS.textMuted} />
          )}
        </View>

        {/* Image */}
        <View style={styles.upsellImage}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.upsellImageContent}
              resizeMode="cover"
            />
          ) : (
            <Gem size={24} color={COLORS.textMuted} />
          )}
        </View>

        {/* Info */}
        <View style={styles.upsellInfo}>
          <Text style={styles.upsellTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.upsellReason} numberOfLines={1}>
            {reason}
          </Text>
        </View>

        {/* Price */}
        <Text style={styles.upsellPrice}>
          {formatPrice(price)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
    maxHeight: SCREEN_HEIGHT * 0.85,
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

  // Discount Banner
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  discountText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  discountHighlight: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Content
  content: {
    padding: SPACING.lg,
  },

  // Success Section
  successSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#4CAF50',
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Upsell Section
  upsellSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // Upsell Card
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  upsellCardSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: COLORS.gold,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  upsellImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  upsellImageContent: {
    width: '100%',
    height: '100%',
  },
  upsellInfo: {
    flex: 1,
  },
  upsellTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  upsellReason: {
    fontSize: 11,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  upsellPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Summary Section
  summarySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  discountLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#4CAF50',
  },
  discountValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
  continueBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  continueBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  skipCheckoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipCheckoutBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFF',
  },
  checkoutBtn: {
    backgroundColor: COLORS.gold,
  },
  checkoutBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#0F1030',
  },
});

export default UpsellModal;
