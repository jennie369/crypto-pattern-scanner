/**
 * Gemral - Pending Orders Section
 * Displays pending limit orders waiting to be filled
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Clock,
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatCurrency } from '../../utils/formatters';

/**
 * Format time ago from ISO string
 */
const formatTimeAgo = (isoString) => {
  if (!isoString) return '';

  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
};

/**
 * Single pending order card
 */
const PendingOrderCard = ({ order, onCancel, cancelling }) => {
  const isLong = (order.direction || '').toUpperCase() === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;

  // Calculate % difference from current price
  const priceDiff = order.currentPrice && order.entryPrice
    ? ((order.entryPrice - order.currentPrice) / order.currentPrice) * 100
    : 0;

  return (
    <View style={styles.orderCard}>
      {/* Header: Symbol + Direction */}
      <View style={styles.orderHeader}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{order.symbol?.replace('USDT', '')}</Text>
          <View style={[styles.directionBadge, { backgroundColor: directionColor }]}>
            {isLong ? (
              <TrendingUp size={12} color="#000" />
            ) : (
              <TrendingDown size={12} color="#FFF" />
            )}
            <Text style={[styles.directionText, { color: isLong ? '#000' : '#FFF' }]}>
              {order.direction}
            </Text>
          </View>
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(order.id)}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <X size={14} color={COLORS.error} />
              <Text style={styles.cancelText}>Huỷ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Price Info */}
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá Chờ:</Text>
          <Text style={styles.entryPrice}>${formatPrice(order.entryPrice)}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá TT:</Text>
          <View style={styles.currentPriceContainer}>
            <Text style={styles.currentPrice}>${formatPrice(order.currentPrice || 0)}</Text>
            {priceDiff !== 0 && (
              <Text style={[styles.priceDiff, { color: priceDiff > 0 ? COLORS.error : COLORS.success }]}>
                ({priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)}%)
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Ký Quỹ</Text>
          <Text style={styles.detailValue}>${formatCurrency(order.positionSize || order.margin)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Đòn Bẩy</Text>
          <Text style={styles.detailValue}>{order.leverage || 10}x</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Đặt Lúc</Text>
          <Text style={styles.detailValue}>{formatTimeAgo(order.pendingAt)}</Text>
        </View>
      </View>

      {/* Hint text */}
      <View style={styles.hintContainer}>
        <AlertCircle size={12} color={COLORS.textMuted} />
        <Text style={styles.hintText}>
          {isLong
            ? `Khớp khi giá giảm xuống $${formatPrice(order.entryPrice)}`
            : `Khớp khi giá tăng lên $${formatPrice(order.entryPrice)}`
          }
        </Text>
      </View>
    </View>
  );
};

/**
 * Pending Orders Section component
 */
const PendingOrdersSection = ({
  orders = [],
  onCancel,
  cancellingId = null,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải lệnh chờ...</Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return null; // Don't show section if no pending orders
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Clock size={18} color={COLORS.warning} />
          <Text style={styles.title}>Lệnh Đang Chờ</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>

      {/* Orders List */}
      {orders.map((order) => (
        <PendingOrderCard
          key={order.id}
          order={order}
          onCancel={onCancel}
          cancelling={cancellingId === order.id}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
  },

  countBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },

  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
  },

  // Order Card
  orderCard: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  symbol: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },

  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },

  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },

  // Price Info
  priceContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },

  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  entryPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.warning,
  },

  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  currentPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  priceDiff: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Details Row
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  detailItem: {
    flex: 1,
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },

  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  // Hint
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },

  hintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default PendingOrdersSection;
