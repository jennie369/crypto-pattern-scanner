/**
 * =====================================================
 * BalanceWidget Component
 * =====================================================
 *
 * Widget hiển thị số dư sàn giao dịch
 * - Total, Spot, Futures breakdown
 * - Last sync time
 * - Refresh button
 * - Connection status
 *
 * Access: TIER 2+
 *
 * =====================================================
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Clock,
  AlertCircle,
  Unlink,
  Lock,
} from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Constants
import { getExchangeConfig } from '../../constants/exchangeConfig';

/**
 * Format balance number
 */
const formatBalance = (value, decimals = 2) => {
  if (value === null || value === undefined) return '--';
  const num = parseFloat(value);
  if (isNaN(num)) return '--';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format time ago
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Chua cap nhat';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Vua cap nhat';
  if (diffMins < 60) return `${diffMins} phut truoc`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} gio truoc`;
  return `${Math.floor(diffHours / 24)} ngay truoc`;
};

/**
 * BalanceWidget Component
 *
 * @param {Object} props
 * @param {string} props.exchangeId - Exchange ID
 * @param {Object} [props.balance] - Balance data { total, spot, futures, assets }
 * @param {string} [props.syncedAt] - Last sync time
 * @param {boolean} [props.loading] - Loading state
 * @param {boolean} [props.connected] - API connected state
 * @param {string} [props.error] - Error message
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Function} [props.onConnect] - Connect API handler
 * @param {Function} [props.onDisconnect] - Disconnect API handler
 * @param {boolean} [props.canConnect] - User tier can connect
 * @param {string} [props.variant] - 'default' | 'compact' | 'detailed'
 */
const BalanceWidget = ({
  exchangeId,
  balance,
  syncedAt,
  loading = false,
  connected = false,
  error,
  onRefresh,
  onConnect,
  onDisconnect,
  canConnect = true,
  variant = 'default',
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const exchangeConfig = getExchangeConfig(exchangeId);

  const handleRefresh = useCallback(async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh]);

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  // Not connected state
  if (!connected) {
    return (
      <View style={[styles.container, styles.disconnectedContainer]}>
        <View style={styles.disconnectedContent}>
          {canConnect ? (
            <>
              <Unlink size={24} color={COLORS.textMuted} />
              <Text style={styles.disconnectedText}>API chua ket noi</Text>
              {onConnect && (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={onConnect}
                  activeOpacity={0.7}
                >
                  <Text style={styles.connectButtonText}>Ket noi API</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Lock size={24} color={COLORS.textMuted} />
              <Text style={styles.disconnectedText}>Nang cap TIER 2 de ket noi API</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={20} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCw size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading && !balance) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Dang tai so du...</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isCompact && styles.containerCompact,
      { borderLeftColor: exchangeConfig?.color || COLORS.primary },
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Wallet size={16} color={exchangeConfig?.color || COLORS.primary} />
          <Text style={styles.headerTitle}>
            {exchangeConfig?.displayName || exchangeId}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={refreshing}
          style={styles.refreshButton}
        >
          <RefreshCw
            size={16}
            color={refreshing ? COLORS.textMuted : COLORS.textSecondary}
            style={refreshing ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Tong so du</Text>
        <Text style={styles.totalValue}>
          {formatBalance(balance?.total)} <Text style={styles.currency}>USDT</Text>
        </Text>
      </View>

      {/* Breakdown */}
      {!isCompact && balance && (
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLabel}>
              <TrendingUp size={12} color={COLORS.success} />
              <Text style={styles.breakdownLabelText}>Spot</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatBalance(balance.spot)} USDT
            </Text>
          </View>

          <View style={styles.breakdownDivider} />

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLabel}>
              <BarChart2 size={12} color={COLORS.warning} />
              <Text style={styles.breakdownLabelText}>Futures</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatBalance(balance.futures)} USDT
            </Text>
          </View>
        </View>
      )}

      {/* Assets (Detailed view) */}
      {isDetailed && balance?.assets?.length > 0 && (
        <View style={styles.assetsSection}>
          <Text style={styles.assetsTitle}>Assets ({balance.assets.length})</Text>
          {balance.assets.slice(0, 5).map((asset, index) => (
            <View key={index} style={styles.assetRow}>
              <Text style={styles.assetName}>{asset.asset}</Text>
              <Text style={styles.assetValue}>
                {formatBalance(asset.free + (asset.locked || 0), 4)}
              </Text>
            </View>
          ))}
          {balance.assets.length > 5 && (
            <Text style={styles.moreAssets}>
              +{balance.assets.length - 5} assets khac
            </Text>
          )}
        </View>
      )}

      {/* Sync time */}
      <View style={styles.syncInfo}>
        <Clock size={10} color={COLORS.textMuted} />
        <Text style={styles.syncText}>{formatTimeAgo(syncedAt)}</Text>
      </View>

      {/* Disconnect option (detailed view) */}
      {isDetailed && onDisconnect && (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={onDisconnect}
          activeOpacity={0.7}
        >
          <Unlink size={14} color="#EF4444" />
          <Text style={styles.disconnectText}>Ngat ket noi API</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  containerCompact: {
    padding: SPACING.sm,
  },
  disconnectedContainer: {
    borderLeftWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  disconnectedContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  disconnectedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  connectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderLeftWidth: 0,
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderLeftWidth: 0,
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    padding: 4,
  },
  spinning: {
    // Note: React Native doesn't support CSS animations
    // Would need Animated API for rotation
  },
  totalSection: {
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  currency: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.textSecondary,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  breakdownLabelText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  assetsSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assetsTitle: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  assetName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  assetValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  moreAssets: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  syncText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disconnectText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
  },
});

export default BalanceWidget;
