/**
 * Gemral - Earnings History Screen
 * Feature #16: Creator Earnings
 * Full earnings history list
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
  DeviceEventEmitter,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gift,
  Users,
  Heart,
  Tv,
  Gem,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import earningsService from '../../services/earningsService';

const SOURCE_ICONS = {
  gift: Gift,
  subscription: Users,
  tip: Heart,
  ad_revenue: Tv,
};

const EarningsHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[EarningsHistoryScreen] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => loadData(true), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadData = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const data = await earningsService.getEarningsHistory(20, reset ? 0 : page * 20);

      if (reset) {
        setHistory(data);
      } else {
        setHistory(prev => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
    } catch (err) {
      console.error('[EarningsHistoryScreen] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
      loadData(false);
    }
  };

  const getSourceIcon = (sourceType) => {
    return SOURCE_ICONS[sourceType] || Gift;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }) => {
    const Icon = getSourceIcon(item.source_type);
    const info = earningsService.getSourceTypeInfo(item.source_type);

    return (
      <View style={styles.historyItem}>
        <View style={[styles.historyIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
          <Icon size={18} color={COLORS.success} />
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyLabel}>{info.label}</Text>
          <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.historyStatus}>
            {item.status === 'available' ? 'Có thể rút' :
             item.status === 'pending' ? 'Đang chờ' :
             item.status === 'withdrawn' ? 'Đã rút' : item.status}
          </Text>
        </View>
        <View style={styles.historyAmounts}>
          <View style={styles.amountRow}>
            <Gem size={14} color={COLORS.success} />
            <Text style={styles.historyNet}>+{item.net_amount || 0}</Text>
          </View>
          <Text style={styles.historyFee}>Phi: {item.platform_fee || 0}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Gift size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Chưa có thu nhập nào</Text>
      <Text style={styles.emptySubtext}>
        Thu nhập từ quà tặng, subscription sẽ hiển thị ở đây
      </Text>
    </View>
  );

  if (loading && history.length === 0) {
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
          <Text style={styles.headerTitle}>Lịch sử thu nhập</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={history}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && history.length > 0 ? (
              <ActivityIndicator size="small" color={COLORS.purple} style={styles.loader} />
            ) : null
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  historyLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyAmounts: {
    alignItems: 'flex-end',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyNet: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },
  historyFee: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
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
  loader: {
    paddingVertical: SPACING.lg,
  },
});

export default EarningsHistoryScreen;
