/**
 * Gemral - Orders Screen (V3)
 * Danh sách đơn hàng từ Shopify với linked_emails support
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Package,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Inbox,
  Link as LinkIcon,
  ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchUserOrdersFromShopify,
  getOrderStatusText,
  getOrderStatusColor,
} from '../../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // ========== STATE ==========
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ========== EFFECTS ==========
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadOrders();
      }
    }, [user?.id])
  );

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[OrdersScreen] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => loadOrders(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // ========== DATA FETCHING ==========
  const loadOrders = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserOrdersFromShopify(user.id);
      setOrders(data || []);
    } catch (err) {
      console.error('[OrdersScreen] Load error:', err);
      setError(err.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // ========== HANDLERS ==========
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOrderPress = useCallback((order) => {
    if (!order?.id) return;
    navigation.navigate('OrderDetail', { orderId: order.id });
  }, [navigation]);

  const handleLinkOrder = useCallback(() => {
    navigation.navigate('LinkOrder');
  }, [navigation]);

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
    });
  };

  // ========== RENDER ITEM ==========
  const renderOrderItem = useCallback(({ item }) => {
    const statusText = getOrderStatusText(item);
    const statusColor = getOrderStatusColor(item);
    const lineItems = item.line_items || [];
    const firstItem = lineItems[0];
    const moreCount = lineItems.length - 1;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>
              #{item.order_number || item.shopify_order_id}
            </Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.orderBody}>
          <Package size={20} color={COLORS.textMuted} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {firstItem?.title || 'Sản phẩm'}
            </Text>
            {moreCount > 0 && (
              <Text style={styles.moreItems}>+{moreCount} sản phẩm khác</Text>
            )}
          </View>
          <Text style={styles.orderTotal}>
            {formatPrice(item.total_price, item.currency)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <Text style={styles.viewDetail}>Xem chi tiết</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </View>
      </TouchableOpacity>
    );
  }, [handleOrderPress]);

  // ========== LOADING STATE ==========
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradientBg}
        >
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={[styles.centerContainer, { paddingBottom: insets.bottom + 80 }]}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradientBg}
        >
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={[styles.centerContainer, { paddingBottom: insets.bottom + 80 }]}>
            <AlertCircle size={48} color={COLORS.error} />
            <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
              <RefreshCw size={18} color={COLORS.gold} />
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ========== EMPTY STATE ==========
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={GRADIENTS.backgroundLocations}
          style={styles.gradientBg}
        >
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={[styles.centerContainer, { paddingBottom: insets.bottom + 80 }]}>
            <Inbox size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
            <Text style={styles.emptyMessage}>
              Các đơn hàng từ Shopify sẽ hiển thị ở đây
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={handleLinkOrder}>
              <LinkIcon size={18} color={COLORS.bgDarkest} />
              <Text style={styles.linkButtonText}>Liên kết đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradientBg}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
          <TouchableOpacity onPress={handleLinkOrder} style={styles.linkIconButton}>
            <LinkIcon size={22} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
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
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  linkIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorTitle: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  errorMessage: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 8,
  },
  retryText: {
    marginLeft: SPACING.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  emptyMessage: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
  },
  linkButtonText: {
    marginLeft: SPACING.sm,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  listContent: {
    padding: SPACING.md,
  },
  separator: {
    height: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  orderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  moreItems: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  viewDetail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    marginRight: 4,
  },
});

export default OrdersScreen;
