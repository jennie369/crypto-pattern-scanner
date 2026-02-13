/**
 * Gemral - Withdrawal History Screen
 * Feature #16: Creator Earnings
 * Full withdrawal history list
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ArrowDownToLine,
  CheckCircle,
  Clock,
  XCircle,
  Gem,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import earningsService from '../../services/earningsService';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: COLORS.warning, label: 'Đang xử lý' },
  processing: { icon: Clock, color: COLORS.cyan, label: 'Đang chuyển' },
  completed: { icon: CheckCircle, color: COLORS.success, label: 'Thành công' },
  rejected: { icon: XCircle, color: COLORS.error, label: 'Từ chối' },
};

const WithdrawalHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await earningsService.getWithdrawalHistory(50);
    setWithdrawals(data);
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const Icon = status.icon;

    return (
      <View style={styles.withdrawalItem}>
        <View style={[styles.statusIcon, { backgroundColor: `${status.color}20` }]}>
          <Icon size={20} color={status.color} />
        </View>
        <View style={styles.withdrawalInfo}>
          <View style={styles.amountRow}>
            <Gem size={16} color={COLORS.purple} />
            <Text style={styles.withdrawalAmount}>{item.amount || 0}</Text>
          </View>
          <Text style={styles.withdrawalDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.bankInfo}>
            {item.bank_name} - {item.account_number?.slice(-4)}
          </Text>
          {item.rejection_reason && (
            <Text style={styles.rejectionReason}>Ly do: {item.rejection_reason}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ArrowDownToLine size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Chưa có yêu cầu rút tiền</Text>
      <Text style={styles.emptySubtext}>
        Khi bạn rút tiền, lịch sử sẽ hiển thị ở đây
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử rút tiền</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={withdrawals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  withdrawalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawalInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  withdrawalAmount: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  withdrawalDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  bankInfo: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rejectionReason: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default WithdrawalHistoryScreen;
