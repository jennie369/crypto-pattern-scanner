/**
 * Gemral - Order Detail Screen (V3)
 * Chi tiết đơn hàng + Tracking timeline
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  AlertCircle,
  CreditCard,
  ShoppingBag,
} from 'lucide-react-native';
import {
  fetchShopifyOrderDetail,
  getOrderStatusText,
  getOrderStatusColor,
} from '../../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  // ========== STATE ==========
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    } else {
      setError('Không tìm thấy đơn hàng');
      setLoading(false);
    }
  }, [orderId]);

  // ========== DATA FETCHING ==========
  const loadOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchShopifyOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      console.error('[OrderDetailScreen] Load error:', err);
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // ========== HANDLERS ==========
  const handleBack = () => navigation.goBack();

  const handleTrackingPress = () => {
    if (order?.tracking_url) {
      Linking.openURL(order.tracking_url);
    }
  };

  // ========== HELPERS ==========
  const formatPrice = (price, currency = 'VND') => {
    const num = parseFloat(price) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== RENDER TRACKING TIMELINE ==========
  const renderTimeline = () => {
    const steps = [
      {
        icon: ShoppingBag,
        title: 'Đặt hàng',
        date: order?.created_at,
        completed: true,
      },
      {
        icon: CreditCard,
        title: 'Đã thanh toán',
        date: order?.paid_at,
        completed: order?.financial_status === 'paid',
      },
      {
        icon: Package,
        title: 'Đang xử lý',
        date: order?.paid_at,
        completed: order?.financial_status === 'paid',
      },
      {
        icon: Truck,
        title: 'Đang vận chuyển',
        date: order?.fulfilled_at,
        completed: order?.fulfillment_status === 'fulfilled',
      },
      {
        icon: CheckCircle,
        title: 'Hoàn thành',
        date: null,
        completed: false,
      },
    ];

    return (
      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIcon,
                    step.completed && styles.timelineIconCompleted,
                  ]}
                >
                  <Icon
                    size={16}
                    color={step.completed ? COLORS.bgDarkest : COLORS.textMuted}
                  />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      step.completed && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    step.completed && styles.timelineTitleCompleted,
                  ]}
                >
                  {step.title}
                </Text>
                {step.date && (
                  <Text style={styles.timelineDate}>{formatDate(step.date)}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========== ERROR STATE ==========
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy đơn hàng'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusText = getOrderStatusText(order);
  const statusColor = getOrderStatusColor(order);
  const lineItems = order.line_items || [];
  const shippingAddress = order.shipping_address || {};

  // ========== MAIN RENDER ==========
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          #{order.order_number || order.shopify_order_id}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.section}>
          <View style={[styles.statusCard, { borderColor: statusColor }]}>
            <View style={[styles.statusIconWrap, { backgroundColor: statusColor }]}>
              <Package size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
            <Text style={[styles.statusValue, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo dõi đơn hàng</Text>
          {renderTimeline()}

          {order.tracking_number && (
            <TouchableOpacity
              style={styles.trackingButton}
              onPress={handleTrackingPress}
            >
              <Truck size={18} color={COLORS.gold} />
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingLabel}>
                  {order.carrier || 'Đơn vị vận chuyển'}
                </Text>
                <Text style={styles.trackingNumber}>{order.tracking_number}</Text>
              </View>
              <ExternalLink size={18} color={COLORS.gold} />
            </TouchableOpacity>
          )}
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm ({lineItems.length})</Text>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.lineItem}>
              <View style={styles.lineItemImage}>
                <Package size={24} color={COLORS.textMuted} />
              </View>
              <View style={styles.lineItemInfo}>
                <Text style={styles.lineItemTitle} numberOfLines={2}>
                  {item.title || 'Sản phẩm'}
                </Text>
                {item.variant_title && (
                  <Text style={styles.lineItemVariant}>{item.variant_title}</Text>
                )}
                <Text style={styles.lineItemQty}>
                  Số lượng: {item.quantity || 1}
                </Text>
              </View>
              <Text style={styles.lineItemPrice}>
                {formatPrice(item.price, order.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {shippingAddress.address1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <View style={styles.addressCard}>
              <MapPin size={20} color={COLORS.gold} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>
                  {shippingAddress.name ||
                    shippingAddress.first_name ||
                    'Người nhận'}
                </Text>
                <Text style={styles.addressLine}>
                  {shippingAddress.address1}
                  {shippingAddress.address2 && `, ${shippingAddress.address2}`}
                </Text>
                <Text style={styles.addressLine}>
                  {[shippingAddress.city, shippingAddress.province]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                {shippingAddress.phone && (
                  <Text style={styles.addressPhone}>{shippingAddress.phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order.subtotal_price, order.currency)}
              </Text>
            </View>
            {parseFloat(order.total_discounts) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  -{formatPrice(order.total_discounts, order.currency)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {formatPrice(order.total_price, order.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>
                #{order.order_number || order.shopify_order_id}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.created_at)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{order.email}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statusCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
    borderWidth: 2,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timeline: {
    marginTop: SPACING.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.glassBorder,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.gold,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  timelineTitleCompleted: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  trackingInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  trackingLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  trackingNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  lineItemImage: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineItemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  lineItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  lineItemVariant: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lineItemQty: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lineItemPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  addressCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
  },
  addressInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  addressName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  addressLine: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    marginTop: 4,
  },
  summaryCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
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
  summaryTotal: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  infoCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default OrderDetailScreen;
