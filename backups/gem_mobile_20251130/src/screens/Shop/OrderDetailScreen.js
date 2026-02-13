/**
 * Gemral - Order Detail Screen
 * View complete order information and tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ExternalLink,
  Copy,
  Phone,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import OrderTimeline from '../../components/OrderTimeline';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderDetail(orderId, user?.id);
      setOrder(orderData);
    } catch (error) {
      console.error('[OrderDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Chờ xử lý',
        color: COLORS.gold,
        icon: <Clock size={24} color={COLORS.gold} />,
        description: 'Đơn hàng đang chờ được xác nhận',
      },
      processing: {
        label: 'Đang xử lý',
        color: '#6A5BFF',
        icon: <Package size={24} color="#6A5BFF" />,
        description: 'Đơn hàng đang được chuẩn bị',
      },
      shipped: {
        label: 'Đang giao',
        color: '#00F0FF',
        icon: <Truck size={24} color="#00F0FF" />,
        description: 'Đơn hàng đang trên đường giao đến bạn',
      },
      delivered: {
        label: 'Đã giao',
        color: COLORS.success,
        icon: <CheckCircle size={24} color={COLORS.success} />,
        description: 'Đơn hàng đã được giao thành công',
      },
      cancelled: {
        label: 'Đã hủy',
        color: COLORS.error,
        icon: <XCircle size={24} color={COLORS.error} />,
        description: 'Đơn hàng đã bị hủy',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleTrackOrder = () => {
    if (order?.trackingUrl) {
      Linking.openURL(order.trackingUrl);
    }
  };

  const handleContactSupport = () => {
    // Open support chat or phone
    Linking.openURL('tel:1900123456');
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!order) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.emptyContainer}>
            <Package size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Đơn Hàng</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>{statusInfo.icon}</View>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
            {order.trackingNumber && (
              <TouchableOpacity style={styles.trackingBtn} onPress={handleTrackOrder}>
                <Truck size={18} color={COLORS.textPrimary} />
                <Text style={styles.trackingBtnText}>Theo dõi đơn hàng</Text>
                <ExternalLink size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Order Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
            <View style={styles.timelineCard}>
              <OrderTimeline order={order} currentStatus={order.status} />
            </View>
          </View>

          {/* Order Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                <Text style={styles.infoValue}>#{order.orderNumber || order.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày đặt</Text>
                <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
              </View>
              {order.trackingNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã vận chuyển</Text>
                  <View style={styles.copyContainer}>
                    <Text style={styles.infoValue}>{order.trackingNumber}</Text>
                    <Copy size={16} color={COLORS.textMuted} />
                  </View>
                </View>
              )}
              {order.shippedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày giao hàng</Text>
                  <Text style={styles.infoValue}>{formatDate(order.shippedAt)}</Text>
                </View>
              )}
              {order.deliveredAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Đã nhận hàng</Text>
                  <Text style={styles.infoValue}>{formatDate(order.deliveredAt)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm ({order.items?.length || 0})</Text>
            <View style={styles.itemsCard}>
              {order.items?.map((item, index) => (
                <View key={index} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.variant && <Text style={styles.itemVariant}>{item.variant}</Text>}
                    <View style={styles.itemPriceRow}>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
              <View style={styles.addressCard}>
                <MapPin size={20} color={COLORS.gold} style={styles.addressIcon} />
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
                  {order.shippingAddress.phone && (
                    <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
                  )}
                  <Text style={styles.addressText}>
                    {[
                      order.shippingAddress.address1,
                      order.shippingAddress.address2,
                      order.shippingAddress.city,
                      order.shippingAddress.province,
                      order.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Tạm tính</Text>
                <Text style={styles.paymentValue}>{formatPrice(order.subtotal || order.totalPrice)}</Text>
              </View>
              {order.shippingFee > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Phí vận chuyển</Text>
                  <Text style={styles.paymentValue}>{formatPrice(order.shippingFee)}</Text>
                </View>
              )}
              {order.discount > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Giảm giá</Text>
                  <Text style={[styles.paymentValue, styles.discountText]}>-{formatPrice(order.discount)}</Text>
                </View>
              )}
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>{formatPrice(order.totalPrice)}</Text>
              </View>
              <View style={styles.paymentMethodRow}>
                <CreditCard size={18} color={COLORS.textMuted} />
                <Text style={styles.paymentMethod}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Text>
              </View>
            </View>
          </View>

          {/* Support */}
          <TouchableOpacity style={styles.supportBtn} onPress={handleContactSupport}>
            <Phone size={20} color={COLORS.gold} />
            <Text style={styles.supportBtnText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statusCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  trackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.burgundy,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  trackingBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  timelineCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  infoCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  itemsCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  addressCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  addressIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  paymentLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  paymentValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  discountText: {
    color: COLORS.success,
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  paymentMethod: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.sm,
  },
  supportBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default OrderDetailScreen;
