/**
 * ShopAnalyticsScreen - Shop & Product Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Product views/purchases
 * - Conversion funnel
 * - Top products
 * - Revenue by category
 *
 * Created: January 30, 2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShoppingBag,
  Eye,
  ShoppingCart,
  CreditCard,
  DollarSign,
  ChevronLeft,
  Package,
  TrendingUp,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  PieChart,
  FunnelChart,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  LoadingSkeleton,
  TrendSparkline,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const ShopAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [data, setData] = useState({
    overview: {},
    conversionFunnel: [],
    topProducts: [],
    categoryRevenue: [],
    dailyRevenue: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          totalViews: 45678,
          totalViewsChange: 12.5,
          addToCart: 3456,
          addToCartChange: 8.2,
          orders: 567,
          ordersChange: 15.3,
          revenue: 125000000,
          revenueChange: 22.5,
        },
        conversionFunnel: [
          { label: 'Product Views', value: 45678 },
          { label: 'Add to Cart', value: 3456 },
          { label: 'Checkout Started', value: 1234 },
          { label: 'Payment Complete', value: 567 },
        ],
        topProducts: [
          { id: '1', label: 'GEM Premium Membership', value: 234, subtitle: '₫5.990.000', color: COLORS.gold },
          { id: '2', label: 'Trading Course Bundle', value: 156, subtitle: '₫2.990.000', color: COLORS.purple },
          { id: '3', label: 'Tarot Card Deck', value: 98, subtitle: '₫890.000', color: '#FF6B9D' },
          { id: '4', label: 'I-Ching Guide Book', value: 76, subtitle: '₫490.000', color: COLORS.cyan },
          { id: '5', label: 'Meditation Kit', value: 54, subtitle: '₫690.000', color: COLORS.success },
        ],
        categoryRevenue: [
          { label: 'Membership', value: 85000000, color: COLORS.gold },
          { label: 'Courses', value: 25000000, color: COLORS.purple },
          { label: 'Products', value: 10000000, color: COLORS.cyan },
          { label: 'Services', value: 5000000, color: COLORS.success },
        ],
        dailyRevenue: [15, 18, 22, 19, 25, 28, 32],
      });
    } catch (error) {
      console.error('[ShopAnalytics] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `₫${(value / 1000000).toFixed(1)}M`;
    }
    return `₫${value.toLocaleString()}`;
  };

  // Loading screen removed - content renders immediately

  return (
    <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Shop Analytics</Text>
              <Text style={styles.headerSubtitle}>Doanh thu & Sản phẩm</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.topProducts} filename="shop_analytics" compact />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range */}
          <DateRangePicker value={dateRange} onChange={(r) => setDateRange(r.key)} style={styles.datePicker} />

          {/* Overview Metrics */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Product Views"
              value={data.overview.totalViews?.toLocaleString()}
              icon={Eye}
              iconColor={COLORS.purple}
              trend={data.overview.totalViewsChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalViewsChange > 0 ? '+' : ''}${data.overview.totalViewsChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Add to Cart"
              value={data.overview.addToCart?.toLocaleString()}
              icon={ShoppingCart}
              iconColor={COLORS.cyan}
              trend={data.overview.addToCartChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.addToCartChange > 0 ? '+' : ''}${data.overview.addToCartChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Orders"
              value={data.overview.orders?.toLocaleString()}
              icon={Package}
              iconColor={COLORS.success}
              trend={data.overview.ordersChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.ordersChange > 0 ? '+' : ''}${data.overview.ordersChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Revenue"
              value={formatCurrency(data.overview.revenue)}
              icon={DollarSign}
              iconColor={COLORS.gold}
              trend={data.overview.revenueChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.revenueChange > 0 ? '+' : ''}${data.overview.revenueChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Revenue Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Doanh thu (7 ngày, triệu đồng)</Text>
              <TrendSparkline data={data.dailyRevenue} width={100} height={30} color={COLORS.gold} />
            </View>
          </View>

          {/* Conversion Funnel */}
          <FunnelChart
            title="Conversion Funnel"
            data={data.conversionFunnel}
            showDropoff={true}
            style={styles.funnelCard}
          />

          {/* Top Products */}
          <TopItemsList
            title="Top Products"
            items={data.topProducts}
            maxItems={5}
            showRank={true}
            valueFormatter={(v) => `${v} đơn`}
            style={styles.listCard}
          />

          {/* Category Revenue */}
          <PieChart
            title="Doanh thu theo danh mục"
            data={data.categoryRevenue}
            size={130}
            innerRadius={0.5}
            totalLabel="Tổng"
            style={styles.chartCard}
          />

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Conversion Rate</Text>
              <Text style={styles.statValue}>
                {((data.overview.orders / data.overview.totalViews) * 100).toFixed(2)}%
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Order Value</Text>
              <Text style={styles.statValue}>
                {formatCurrency(data.overview.revenue / data.overview.orders)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cart Abandon</Text>
              <Text style={styles.statValue}>
                {(((data.overview.addToCart - data.overview.orders) / data.overview.addToCart) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md },
  datePicker: { marginBottom: SPACING.md },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: SPACING.md,
  },
  metricCard: { width: '50%', paddingHorizontal: 4, marginBottom: 8 },

  trendCard: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  funnelCard: { marginBottom: SPACING.md },
  listCard: { marginBottom: SPACING.md },
  chartCard: { marginBottom: SPACING.md },

  quickStats: {
    flexDirection: 'row',
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    marginHorizontal: SPACING.sm,
  },
});

export default ShopAnalyticsScreen;
