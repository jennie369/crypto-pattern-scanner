/**
 * Gemral - Cart Screen
 * With Auth check for checkout
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, SHADOWS, GLASS } from '../../utils/tokens';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const CartScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    createCheckout,
    loading,
  } = useCart();

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRemoveItem = (variantId, title) => {
    alert({
      type: 'warning',
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc muốn xóa "${title}" khỏi giỏ hàng?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeItem(variantId),
        },
      ],
    });
  };

  const handleClearCart = () => {
    alert({
      type: 'warning',
      title: 'Xóa giỏ hàng',
      message: 'Bạn có chắc muốn xóa tất cả sản phẩm?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: clearCart,
        },
      ],
    });
  };

  const handleCheckout = async () => {
    // Check authentication before checkout
    if (!isAuthenticated) {
      alert({
        type: 'warning',
        title: 'Đăng Nhập Cần Thiết',
        message: 'Bạn cần đăng nhập để thanh toán',
        buttons: [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Auth', {
              screen: 'Login',
              params: { returnTo: 'Cart' },
            }),
          },
        ],
      });
      return;
    }

    const result = await createCheckout();
    if (result.success && result.checkoutUrl) {
      // Navigate to WebView-based checkout with instant success detection
      navigation.navigate('CheckoutWebView', { checkoutUrl: result.checkoutUrl });
    } else {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: result.error || 'Không thể tạo đơn hàng',
      });
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {/* Image */}
      <View style={styles.itemImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ShoppingBag size={24} color={COLORS.textMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.variant !== 'Default' && (
          <Text style={styles.itemVariant}>{item.variant}</Text>
        )}
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleRemoveItem(item.variantId, item.title)}
          activeOpacity={0.6}
          delayPressIn={0}
        >
          <Trash2 size={18} color={COLORS.error} />
        </TouchableOpacity>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.variantId, item.quantity - 1)}
            activeOpacity={0.6}
            delayPressIn={0}
          >
            <Minus size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => updateQuantity(item.variantId, item.quantity + 1)}
            activeOpacity={0.6}
            delayPressIn={0}
          >
            <Plus size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <ShoppingBag size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
      <Text style={styles.emptySubtitle}>
        Hãy thêm sản phẩm yêu thích vào giỏ hàng
      </Text>
      <TouchableOpacity
        style={styles.shopNowBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.shopNowText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng ({itemCount})</Text>
          {items.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
              <Text style={styles.clearText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Items */}
        {items.length > 0 ? (
          <>
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.variantId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Summary & Checkout - Above Tab Bar */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                <Text style={styles.summaryValue}>Tính khi thanh toán</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={loading}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Text style={styles.checkoutText}>
                  {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderEmptyCart()
        )}
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: SPACING.sm,
  },
  clearText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },

  // List
  listContent: {
    padding: SPACING.md,
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Summary
  summary: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    paddingBottom: 120, // Account for floating tab bar
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  checkoutBtn: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  checkoutText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  shopNowBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.burgundy,
    borderRadius: 25,
  },
  shopNowText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default CartScreen;
