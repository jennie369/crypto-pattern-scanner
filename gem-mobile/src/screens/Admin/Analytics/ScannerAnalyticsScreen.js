/**
 * ScannerAnalyticsScreen - Scanner Deep Dive Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Pattern performance table (scans, detections, win rate)
 * - Top timeframes and symbols
 * - Issues/anomalies detected
 * - Trend analysis
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
  Scan,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  ChevronLeft,
  BarChart2,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  PieChart,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  EmptyState,
  LoadingSkeleton,
  TrendSparkline,
} from '../../../components/Admin/Analytics';
import { adminAnalyticsService } from '../../../services/adminAnalyticsService';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const ScannerAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [data, setData] = useState({
    overview: {},
    patterns: [],
    timeframes: [],
    symbols: [],
    hourlyTrend: [],
  });

  const fetchData = useCallback(async () => {
    try {
      // Simulated data - replace with actual service calls
      setData({
        overview: {
          totalScans: 12456,
          totalScansChange: 15.2,
          patternsDetected: 3421,
          patternsDetectedChange: 8.5,
          avgScanTime: 2.3,
          avgScanTimeChange: -5.1,
          successRate: 87.5,
          successRateChange: 2.3,
        },
        patterns: [
          { id: '1', label: 'Double Bottom', value: 892, winRate: 72.5, color: COLORS.success },
          { id: '2', label: 'Head & Shoulders', value: 654, winRate: 68.3, color: COLORS.purple },
          { id: '3', label: 'Triangle', value: 587, winRate: 65.8, color: COLORS.cyan },
          { id: '4', label: 'Channel', value: 445, winRate: 71.2, color: COLORS.gold },
          { id: '5', label: 'Flag', value: 312, winRate: 69.5, color: COLORS.info },
        ],
        timeframes: [
          { id: '1', label: '4H', value: 4521, subtitle: '36.3%' },
          { id: '2', label: '1H', value: 3245, subtitle: '26.1%' },
          { id: '3', label: '1D', value: 2134, subtitle: '17.1%' },
          { id: '4', label: '15M', value: 1567, subtitle: '12.6%' },
          { id: '5', label: '5M', value: 989, subtitle: '7.9%' },
        ],
        symbols: [
          { id: '1', label: 'BTC/USDT', value: 3456, icon: '₿' },
          { id: '2', label: 'ETH/USDT', value: 2891, icon: 'Ξ' },
          { id: '3', label: 'SOL/USDT', value: 1234, icon: '◎' },
          { id: '4', label: 'BNB/USDT', value: 987, icon: '◈' },
          { id: '5', label: 'XRP/USDT', value: 654, icon: '✕' },
        ],
        hourlyTrend: [120, 145, 132, 178, 198, 210, 245, 312, 387, 356, 298, 267],
      });
    } catch (error) {
      console.error('[ScannerAnalytics] Fetch error:', error);
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
              <Text style={styles.headerTitle}>Scanner Analytics</Text>
              <Text style={styles.headerSubtitle}>Phân tích chi tiết Scanner</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.patterns} filename="scanner_analytics" compact />
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
              title="Tổng Scans"
              value={data.overview.totalScans?.toLocaleString()}
              icon={Scan}
              iconColor={COLORS.purple}
              trend={data.overview.totalScansChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalScansChange > 0 ? '+' : ''}${data.overview.totalScansChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Patterns Detected"
              value={data.overview.patternsDetected?.toLocaleString()}
              icon={Target}
              iconColor={COLORS.success}
              trend={data.overview.patternsDetectedChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.patternsDetectedChange > 0 ? '+' : ''}${data.overview.patternsDetectedChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Avg Scan Time"
              value={`${data.overview.avgScanTime}s`}
              icon={Clock}
              iconColor={COLORS.cyan}
              trend={data.overview.avgScanTimeChange < 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgScanTimeChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Success Rate"
              value={`${data.overview.successRate}%`}
              icon={TrendingUp}
              iconColor={COLORS.gold}
              trend={data.overview.successRateChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.successRateChange > 0 ? '+' : ''}${data.overview.successRateChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Scan Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Xu hướng Scan (12h qua)</Text>
              <TrendSparkline data={data.hourlyTrend} width={100} height={30} color={COLORS.purple} />
            </View>
          </View>

          {/* Pattern Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern Performance</Text>
            <View style={styles.patternTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Pattern</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Scans</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Win Rate</Text>
              </View>
              {data.patterns.map((pattern, index) => (
                <View key={pattern.id} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[styles.patternDot, { backgroundColor: pattern.color }]} />
                    <Text style={styles.patternName}>{pattern.label}</Text>
                  </View>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{pattern.value.toLocaleString()}</Text>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <View style={[styles.winRateBadge, { backgroundColor: pattern.winRate >= 70 ? `${COLORS.success}20` : `${COLORS.warning}20` }]}>
                      <Text style={[styles.winRateText, { color: pattern.winRate >= 70 ? COLORS.success : COLORS.warning }]}>
                        {pattern.winRate}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Pattern Distribution */}
          <PieChart
            title="Phân bố Pattern"
            data={data.patterns.map(p => ({ label: p.label, value: p.value, color: p.color }))}
            size={130}
            innerRadius={0.5}
            style={styles.chartCard}
          />

          {/* Top Timeframes */}
          <TopItemsList
            title="Top Timeframes"
            items={data.timeframes}
            maxItems={5}
            showRank={true}
            style={styles.listCard}
          />

          {/* Top Symbols */}
          <TopItemsList
            title="Top Symbols"
            items={data.symbols}
            maxItems={5}
            showRank={true}
            style={styles.listCard}
          />

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

  patternTable: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  tableHeaderCell: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  tableCell: { fontSize: 13, color: COLORS.textPrimary },
  patternDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  patternName: { fontSize: 13, color: COLORS.textPrimary },
  winRateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  winRateText: { fontSize: 12, fontWeight: '600' },

  chartCard: { marginBottom: SPACING.md },
  listCard: { marginBottom: SPACING.md },
});

export default ScannerAnalyticsScreen;
