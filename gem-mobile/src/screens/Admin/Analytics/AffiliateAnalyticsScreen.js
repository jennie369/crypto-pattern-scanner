/**
 * AffiliateAnalyticsScreen - Affiliate/KOL Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Active affiliates
 * - Referral traffic
 * - Conversions
 * - Commission tracking
 * - Top performers
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
  Users,
  Link,
  MousePointerClick,
  DollarSign,
  Award,
  ChevronLeft,
  TrendingUp,
  UserCheck,
  Percent,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  PieChart,
  FeatureBarChart,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  LoadingSkeleton,
  TrendSparkline,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const AffiliateAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [data, setData] = useState({
    overview: {},
    topAffiliates: [],
    trafficSources: [],
    conversionByTier: [],
    dailyClicks: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          activeAffiliates: 234,
          activeAffiliatesChange: 15.2,
          totalClicks: 45678,
          totalClicksChange: 22.5,
          conversions: 567,
          conversionsChange: 18.3,
          totalCommission: 125000000,
          totalCommissionChange: 28.5,
        },
        topAffiliates: [
          { id: '1', label: 'Crypto_King_VN', value: 2345000, conversions: 45, subtitle: '45 conversions', color: COLORS.gold },
          { id: '2', label: 'TradingMaster99', value: 1890000, conversions: 38, subtitle: '38 conversions', color: COLORS.purple },
          { id: '3', label: 'GemLover2024', value: 1456000, conversions: 32, subtitle: '32 conversions', color: COLORS.cyan },
          { id: '4', label: 'BitcoinViet', value: 1234000, conversions: 28, subtitle: '28 conversions', color: COLORS.success },
          { id: '5', label: 'CryptoDaily', value: 987000, conversions: 22, subtitle: '22 conversions', color: '#FF6B9D' },
        ],
        trafficSources: [
          { label: 'Social Media', value: 18765 },
          { label: 'Website/Blog', value: 12456 },
          { label: 'YouTube', value: 8234 },
          { label: 'Telegram', value: 4567 },
          { label: 'Other', value: 1656 },
        ],
        conversionByTier: [
          { label: 'Gold Affiliates', value: 234, color: COLORS.gold },
          { label: 'Silver Affiliates', value: 189, color: '#C0C0C0' },
          { label: 'Bronze Affiliates', value: 144, color: '#CD7F32' },
        ],
        dailyClicks: [1200, 1456, 1389, 1567, 1823, 1956, 2134],
        tierStats: [
          { tier: 'Gold', affiliates: 12, conversionRate: 4.2, avgCommission: 8500000 },
          { tier: 'Silver', affiliates: 45, conversionRate: 2.8, avgCommission: 3200000 },
          { tier: 'Bronze', affiliates: 177, conversionRate: 1.5, avgCommission: 890000 },
        ],
      });
    } catch (error) {
      console.error('[AffiliateAnalytics] Fetch error:', error);
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
              <Text style={styles.headerTitle}>Affiliate Analytics</Text>
              <Text style={styles.headerSubtitle}>KOL & Referral</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.topAffiliates} filename="affiliate_analytics" compact />
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
              title="Active Affiliates"
              value={data.overview.activeAffiliates?.toLocaleString()}
              icon={Users}
              iconColor={COLORS.purple}
              trend={data.overview.activeAffiliatesChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.activeAffiliatesChange > 0 ? '+' : ''}${data.overview.activeAffiliatesChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Total Clicks"
              value={data.overview.totalClicks?.toLocaleString()}
              icon={MousePointerClick}
              iconColor={COLORS.cyan}
              trend={data.overview.totalClicksChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalClicksChange > 0 ? '+' : ''}${data.overview.totalClicksChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Conversions"
              value={data.overview.conversions?.toLocaleString()}
              icon={UserCheck}
              iconColor={COLORS.success}
              trend={data.overview.conversionsChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.conversionsChange > 0 ? '+' : ''}${data.overview.conversionsChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Commission"
              value={formatCurrency(data.overview.totalCommission)}
              icon={DollarSign}
              iconColor={COLORS.gold}
              trend={data.overview.totalCommissionChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalCommissionChange > 0 ? '+' : ''}${data.overview.totalCommissionChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Click Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Clicks (7 ngày)</Text>
              <TrendSparkline data={data.dailyClicks} width={100} height={30} color={COLORS.cyan} />
            </View>
          </View>

          {/* Tier Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affiliate Tiers</Text>
            <View style={styles.tierTable}>
              <View style={styles.tierHeader}>
                <Text style={[styles.tierHeaderCell, { flex: 1.5 }]}>Tier</Text>
                <Text style={[styles.tierHeaderCell, { flex: 1 }]}>Count</Text>
                <Text style={[styles.tierHeaderCell, { flex: 1 }]}>Conv. Rate</Text>
                <Text style={[styles.tierHeaderCell, { flex: 1.5 }]}>Avg Comm.</Text>
              </View>
              {data.tierStats?.map((tier, index) => (
                <View key={index} style={styles.tierRow}>
                  <View style={[styles.tierCell, { flex: 1.5, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[styles.tierBadge, {
                      backgroundColor: tier.tier === 'Gold' ? `${COLORS.gold}20` :
                        tier.tier === 'Silver' ? 'rgba(192, 192, 192, 0.2)' : 'rgba(205, 127, 50, 0.2)'
                    }]}>
                      <Award size={12} color={
                        tier.tier === 'Gold' ? COLORS.gold :
                        tier.tier === 'Silver' ? '#C0C0C0' : '#CD7F32'
                      } />
                    </View>
                    <Text style={styles.tierName}>{tier.tier}</Text>
                  </View>
                  <Text style={[styles.tierCell, { flex: 1 }]}>{tier.affiliates}</Text>
                  <Text style={[styles.tierCell, { flex: 1 }]}>{tier.conversionRate}%</Text>
                  <Text style={[styles.tierCell, { flex: 1.5 }]}>{formatCurrency(tier.avgCommission)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Affiliates */}
          <TopItemsList
            title="Top Performers"
            items={data.topAffiliates}
            maxItems={5}
            showRank={true}
            valueFormatter={formatCurrency}
            style={styles.listCard}
          />

          {/* Traffic Sources */}
          <FeatureBarChart
            title="Nguồn traffic"
            data={data.trafficSources}
            style={styles.chartCard}
          />

          {/* Conversion by Tier */}
          <PieChart
            title="Conversions theo Tier"
            data={data.conversionByTier}
            size={130}
            innerRadius={0.5}
            totalLabel="Total"
            style={styles.chartCard}
          />

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Conversion Rate</Text>
              <Text style={styles.statValue}>
                {((data.overview.conversions / data.overview.totalClicks) * 100).toFixed(2)}%
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Commission</Text>
              <Text style={styles.statValue}>
                {formatCurrency(data.overview.totalCommission / data.overview.activeAffiliates)}
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

  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },

  tierTable: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tierHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  tierHeaderCell: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  tierCell: { fontSize: 13, color: COLORS.textPrimary },
  tierBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tierName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },

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

export default AffiliateAnalyticsScreen;
