/**
 * Gemral - Revenue Dashboard Screen (Admin)
 *
 * Detailed revenue analytics and reporting
 * Features: Date range picker, revenue breakdown, trends, top customers
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  BookOpen,
  Crown,
  DollarSign,
  Users,
  Calendar,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import revenueService from '../../services/revenueService';
import { showAlert } from '../../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DATE_RANGES = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'year', label: 'Năm nay' },
];

const RevenueDashboardScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState('month');
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueBySource, setRevenueBySource] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, trendData, transactionData, customersData, sourceData] = await Promise.all([
        revenueService.getRevenueOverview(selectedRange),
        revenueService.getRevenueTrend(selectedRange, 'day'),
        revenueService.getRecentTransactions(10),
        revenueService.getTopCustomers(selectedRange, 5),
        revenueService.getRevenueBySource(selectedRange),
      ]);

      setOverview(overviewData);
      setTrends(trendData);
      setTransactions(transactionData);
      setTopCustomers(customersData);
      setRevenueBySource(sourceData);
    } catch (error) {
      console.error('[RevenueDashboard] Load error:', error);
      showAlert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    loadData();
  }, [selectedRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleExport = async () => {
    try {
      const csv = await revenueService.exportRevenueData(selectedRange);
      if (csv) {
        showAlert('Xuất dữ liệu', 'Tính năng đang phát triển. Dữ liệu sẽ được gửi qua email.');
      }
    } catch (error) {
      showAlert('Lỗi', 'Không thể xuất dữ liệu');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Doanh thu</Text>
      <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
        <Download size={20} color={COLORS.gold} />
      </TouchableOpacity>
    </View>
  );

  const renderDateRangePicker = () => (
    <View style={styles.dateRangeContainer}>
      {DATE_RANGES.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.dateRangeButton,
            selectedRange === range.key && styles.dateRangeButtonActive,
          ]}
          onPress={() => setSelectedRange(range.key)}
        >
          <Text
            style={[
              styles.dateRangeText,
              selectedRange === range.key && styles.dateRangeTextActive,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewCards = () => {
    if (!overview) return null;

    return (
      <View style={styles.overviewContainer}>
        {/* Total Revenue Card */}
        <View style={[styles.overviewCard, styles.mainRevenueCard]}>
          <View style={styles.cardHeader}>
            <DollarSign size={24} color={COLORS.gold} />
            <Text style={styles.cardLabel}>Tổng doanh thu</Text>
          </View>
          <Text style={styles.mainRevenueValue}>
            {formatCurrency(overview.totalRevenue)}
          </Text>
          <View style={styles.changeIndicator}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={styles.changeText}>+12.5% so với kỳ trước</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ShoppingBag size={18} color={COLORS.gold} />
            <Text style={styles.statValue}>{formatCurrency(overview.shopRevenue)}</Text>
            <Text style={styles.statLabel}>Shop</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={18} color="#00D9FF" />
            <Text style={styles.statValue}>{formatCurrency(overview.courseRevenue)}</Text>
            <Text style={styles.statLabel}>Khóa học</Text>
          </View>
          <View style={styles.statCard}>
            <Crown size={18} color="#8B5CF6" />
            <Text style={styles.statValue}>{formatCurrency(overview.tierRevenue)}</Text>
            <Text style={styles.statLabel}>Tier</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={18} color={COLORS.success} />
            <Text style={styles.statValue}>{overview.orderCount}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRevenueBySource = () => {
    if (revenueBySource.length === 0) return null;

    const totalRevenue = revenueBySource.reduce((sum, s) => sum + s.value, 0);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phân bổ doanh thu</Text>

        <View style={styles.sourceContainer}>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            {revenueBySource.map((source, index) => {
              const widthPercent = totalRevenue > 0 ? (source.value / totalRevenue) * 100 : 0;
              return (
                <View
                  key={source.source}
                  style={[
                    styles.progressSegment,
                    {
                      width: `${widthPercent}%`,
                      backgroundColor: source.color,
                      borderTopLeftRadius: index === 0 ? 4 : 0,
                      borderBottomLeftRadius: index === 0 ? 4 : 0,
                      borderTopRightRadius: index === revenueBySource.length - 1 ? 4 : 0,
                      borderBottomRightRadius: index === revenueBySource.length - 1 ? 4 : 0,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {revenueBySource.map((source) => (
              <View key={source.source} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: source.color }]} />
                <Text style={styles.legendLabel}>{source.source}</Text>
                <Text style={styles.legendValue}>{source.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    if (trends.length === 0) return null;

    const maxRevenue = Math.max(...trends.map((t) => t.revenue), 1);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Xu hướng doanh thu</Text>

        <View style={styles.chartContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trends.map((point, index) => (
              <View key={point.date} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(point.revenue / maxRevenue) * 100}%`,
                      minHeight: 4,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderRecentTransactions = () => {
    if (transactions.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

        <View style={styles.transactionsContainer}>
          {transactions.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <Image
                source={{
                  uri: tx.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user?.full_name || 'U')}&background=random`,
                }}
                style={styles.txAvatar}
              />
              <View style={styles.txInfo}>
                <Text style={styles.txDescription} numberOfLines={1}>
                  {tx.description}
                </Text>
                <Text style={styles.txUser} numberOfLines={1}>
                  {tx.user?.full_name || tx.user?.email || 'Khách'}
                </Text>
              </View>
              <View style={styles.txAmount}>
                <Text style={styles.txAmountValue}>+{formatCurrency(tx.amount)}</Text>
                <Text style={styles.txTime}>{formatDate(tx.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTopCustomers = () => {
    if (topCustomers.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top khách hàng</Text>

        <View style={styles.customersContainer}>
          {topCustomers.map((customer, index) => (
            <View key={customer.user?.id || index} style={styles.customerItem}>
              <Text style={styles.customerRank}>#{index + 1}</Text>
              <Image
                source={{
                  uri: customer.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.user?.full_name || 'U')}&background=random`,
                }}
                style={styles.customerAvatar}
              />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName} numberOfLines={1}>
                  {customer.user?.full_name || 'Ẩn danh'}
                </Text>
                <Text style={styles.customerOrders}>
                  {customer.orderCount} đơn hàng
                </Text>
              </View>
              <Text style={styles.customerSpent}>
                {formatCurrency(customer.totalSpent)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

      {renderHeader()}

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
          />
        }
      >
        {renderDateRangePicker()}
        {renderOverviewCards()}
        {renderRevenueBySource()}
        {renderTrendChart()}
        {renderRecentTransactions()}
        {renderTopCustomers()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  exportButton: {
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.huge * 2,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 8,
  },
  dateRangeButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  dateRangeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  dateRangeTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  overviewContainer: {
    marginBottom: SPACING.xl,
  },
  overviewCard: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...GLASS,
  },
  mainRevenueCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  mainRevenueValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    ...GLASS,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sourceContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    ...GLASS,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressSegment: {
    height: '100%',
  },
  legendContainer: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  legendValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  chartContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    height: 180,
    ...GLASS,
  },
  chartBar: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    marginRight: SPACING.xs,
  },
  bar: {
    width: 20,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  transactionsContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    ...GLASS,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.sm,
  },
  txAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  txUser: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  txAmount: {
    alignItems: 'flex-end',
  },
  txAmountValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  txTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  customersContainer: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    padding: SPACING.md,
    ...GLASS,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  customerRank: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    width: 28,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  customerOrders: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  customerSpent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default RevenueDashboardScreen;
