/**
 * Gemral - Earnings Screen
 * Feature #16: Creator Earnings
 * Creator earnings dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Gem,
  ArrowDownToLine,
  TrendingUp,
  Clock,
  CheckCircle,
  Gift,
  Users,
  Heart,
  Tv,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import earningsService from '../../services/earningsService';
import walletService from '../../services/walletService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SOURCE_ICONS = {
  gift: Gift,
  subscription: Users,
  tip: Heart,
  ad_revenue: Tv,
};

const EarningsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    pending: 0,
    available: 0,
    withdrawn: 0,
    total: 0,
  });
  const [breakdown, setBreakdown] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [summaryResult, breakdownData, historyData] = await Promise.all([
      earningsService.getEarningsSummary(),
      earningsService.getEarningsBreakdown(),
      earningsService.getEarningsHistory(10),
    ]);

    if (summaryResult.success) {
      setSummary(summaryResult.data);
    }
    setBreakdown(breakdownData);
    setHistory(historyData);

    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getSourceIcon = (sourceType) => {
    return SOURCE_ICONS[sourceType] || Gift;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

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
          <Text style={styles.headerTitle}>Thu nhập</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Main Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['rgba(58, 247, 166, 0.2)', 'rgba(0, 240, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceLabel}>Có thể rút</Text>
              <View style={styles.balanceRow}>
                <Gem size={28} color={COLORS.success} />
                <Text style={styles.balanceAmount}>
                  {walletService.formatGems(summary.available)}
                </Text>
              </View>
              <Text style={styles.balanceVND}>
                ~ {earningsService.formatVND(earningsService.gemsToVND(summary.available))}
              </Text>

              {/* Withdraw Button */}
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => navigation.navigate('Withdraw')}
                activeOpacity={0.8}
              >
                <ArrowDownToLine size={18} color={COLORS.textPrimary} />
                <Text style={styles.withdrawButtonText}>Rút tiền</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 184, 0, 0.2)' }]}>
                <Clock size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.statLabel}>Đang chờ</Text>
              <Text style={styles.statValue}>
                {walletService.formatGems(summary.pending)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                <CheckCircle size={18} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Đã rút</Text>
              <Text style={styles.statValue}>
                {walletService.formatGems(summary.withdrawn)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                <TrendingUp size={18} color={COLORS.purple} />
              </View>
              <Text style={styles.statLabel}>Tổng</Text>
              <Text style={styles.statValue}>
                {walletService.formatGems(summary.total)}
              </Text>
            </View>
          </View>

          {/* Earnings Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nguồn thu nhập</Text>

            {Object.entries(breakdown).length === 0 ? (
              <View style={styles.emptyBreakdown}>
                <Text style={styles.emptyText}>Chưa có thu nhập</Text>
              </View>
            ) : (
              <View style={styles.breakdownList}>
                {Object.entries(breakdown).map(([source, amount]) => {
                  const Icon = getSourceIcon(source);
                  const info = earningsService.getSourceTypeInfo(source);
                  const percentage = summary.total > 0
                    ? Math.round((amount / summary.total) * 100)
                    : 0;

                  return (
                    <View key={source} style={styles.breakdownItem}>
                      <View style={styles.breakdownLeft}>
                        <View style={[styles.breakdownIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                          <Icon size={18} color={COLORS.purple} />
                        </View>
                        <View>
                          <Text style={styles.breakdownLabel}>{info.label}</Text>
                          <Text style={styles.breakdownPercentage}>{percentage}%</Text>
                        </View>
                      </View>
                      <Text style={styles.breakdownAmount}>
                        {walletService.formatGems(amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recent Earnings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EarningsHistory')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>Chưa có giao dịch</Text>
              </View>
            ) : (
              history.map((item) => {
                const Icon = getSourceIcon(item.source_type);
                const info = earningsService.getSourceTypeInfo(item.source_type);

                return (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={[styles.historyIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                      <Icon size={16} color={COLORS.success} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyLabel}>{info.label}</Text>
                      <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                    </View>
                    <View style={styles.historyAmounts}>
                      <Text style={styles.historyNet}>+{item.net_amount}</Text>
                      <Text style={styles.historyFee}>Phi: {item.platform_fee}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Withdrawal History Link */}
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => navigation.navigate('WithdrawalHistory')}
            activeOpacity={0.7}
          >
            <View style={styles.linkContent}>
              <View style={[styles.linkIcon, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                <ArrowDownToLine size={18} color={COLORS.cyan} />
              </View>
              <Text style={styles.linkText}>Lịch sử rút tiền</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Thông tin</Text>
            <Text style={styles.infoText}>
              - Thu nhập từ quà tặng sẽ được giữ 7 ngày trước khi có thể rút{'\n'}
              - Phí nền tảng: 30% | Tác giả nhận: 70%{'\n'}
              - Rút tối thiểu: 100 gems{'\n'}
              - Tỉ giá: 1 gem = 200 VND
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: CONTENT_BOTTOM_PADDING + 60,
  },
  balanceCard: {
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: SPACING.xl,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.3)',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.giant,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  balanceVND: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  withdrawButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.purple,
  },
  emptyBreakdown: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyHistory: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  breakdownList: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  breakdownPercentage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  breakdownAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  historyLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyAmounts: {
    alignItems: 'flex-end',
  },
  historyNet: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  historyFee: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  infoCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default EarningsScreen;
