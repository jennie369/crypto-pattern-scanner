/**
 * Gemral - Content Analytics Screen
 * Analytics dashboard cho push và post performance
 * @description Admin UI cho content analytics
 */

import React, { useState, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart2,
  TrendingUp,
  Eye,
  MousePointer,
  Send,
  Users,
  Clock,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Bell,
  FileText,
  Beaker,
} from 'lucide-react-native';

// Services
import { contentAnalyticsService } from '../../services/contentAnalyticsService';
import notificationService from '../../services/notificationService';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========== DATE RANGE OPTIONS ==========
const DATE_RANGES = [
  { id: '7d', label: '7 ngày', days: 7 },
  { id: '14d', label: '14 ngày', days: 14 },
  { id: '30d', label: '30 ngày', days: 30 },
  { id: '90d', label: '90 ngày', days: 90 },
];

// ========== STAT CARD ==========
const StatCard = ({ icon: Icon, value, label, color = COLORS.gold, trend }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend !== undefined && (
      <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? 'rgba(58,247,166,0.2)' : 'rgba(255,107,107,0.2)' }]}>
        <TrendingUp
          size={12}
          color={trend >= 0 ? COLORS.success : COLORS.error}
          style={trend < 0 ? { transform: [{ rotate: '180deg' }] } : {}}
        />
        <Text style={[styles.trendText, { color: trend >= 0 ? COLORS.success : COLORS.error }]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    )}
  </View>
);

// ========== TOP ITEM ==========
const TopItem = ({ rank, item, type }) => (
  <View style={styles.topItem}>
    <View style={[styles.rankBadge, rank === 1 && styles.rankBadgeGold]}>
      <Text style={[styles.rankText, rank === 1 && styles.rankTextGold]}>{rank}</Text>
    </View>
    <View style={styles.topItemContent}>
      <Text style={styles.topItemTitle} numberOfLines={1}>
        {item?.title || 'Không có tiêu đề'}
      </Text>
      <View style={styles.topItemStats}>
        <View style={styles.topItemStat}>
          <Eye size={12} color={COLORS.textMuted} />
          <Text style={styles.topItemStatText}>{item?.total_opened || 0}</Text>
        </View>
        <View style={styles.topItemStat}>
          <MousePointer size={12} color={COLORS.textMuted} />
          <Text style={styles.topItemStatText}>{item?.total_clicked || 0}</Text>
        </View>
        <Text style={styles.topItemRate}>
          {parseFloat(item?.open_rate || 0).toFixed(1)}% open
        </Text>
      </View>
    </View>
  </View>
);

// ========== HOURLY BAR ==========
const HourlyBar = ({ hour, value, maxValue }) => {
  const height = maxValue > 0 ? (value / maxValue) * 60 : 0;
  return (
    <View style={styles.hourlyBar}>
      <View style={[styles.hourlyBarFill, { height }]} />
      <Text style={styles.hourlyBarLabel}>{hour}</Text>
    </View>
  );
};

// ========== SEGMENT STAT ==========
const SegmentStat = ({ segment, data }) => {
  const labels = {
    all: 'Tất cả',
    traders: 'Traders',
    spiritual: 'Tâm linh',
    tier1_plus: 'Tier 1+',
    inactive_3d: 'Inactive',
  };

  return (
    <View style={styles.segmentItem}>
      <Text style={styles.segmentLabel}>{labels[segment] || segment}</Text>
      <View style={styles.segmentStats}>
        <Text style={styles.segmentValue}>{data?.opens || 0} opens</Text>
        <Text style={styles.segmentRate}>{data?.openRate || 0}%</Text>
      </View>
    </View>
  );
};

// ========== MAIN COMPONENT ==========
const ContentAnalyticsScreen = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Date range
  const [dateRange, setDateRange] = useState('7d');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topPush, setTopPush] = useState([]);
  const [hourlyBreakdown, setHourlyBreakdown] = useState([]);
  const [segmentPerformance, setSegmentPerformance] = useState({});
  const [abTestResults, setAbTestResults] = useState([]);

  // Fetch data
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [dateRange])
  );

  const fetchData = async () => {
    setError(null);
    try {
      const selectedRange = DATE_RANGES.find((r) => r.id === dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (selectedRange?.days || 7));
      const endDate = new Date();

      const [statsResult, topPushResult, hourlyResult, segmentResult, abResult] = await Promise.all([
        contentAnalyticsService.getDashboardStats(startDate, endDate),
        contentAnalyticsService.getTopPushNotifications(5),
        contentAnalyticsService.getHourlyBreakdown(startDate, endDate),
        contentAnalyticsService.getSegmentPerformance(),
        contentAnalyticsService.getABTestResults(5),
      ]);

      if (statsResult.success) {
        setDashboardStats(statsResult.data);
      }

      if (topPushResult.success) {
        setTopPush(topPushResult.data || []);
      }

      if (hourlyResult.success) {
        setHourlyBreakdown(hourlyResult.data || []);
      }

      if (segmentResult.success) {
        setSegmentPerformance(segmentResult.data || {});
      }

      if (abResult.success) {
        setAbTestResults(abResult.data || []);
      }
    } catch (err) {
      console.error('[ContentAnalytics] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Format helpers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatRate = (rate) => {
    const num = parseFloat(rate) || 0;
    return `${num.toFixed(1)}%`;
  };

  // Get max value for hourly chart
  const maxHourlyValue = Math.max(...hourlyBreakdown.map((h) => h.opens || 0), 1);

  // Loading state
  if (loading && !refreshing) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity
            style={styles.dateRangeButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateRangeText}>
              {DATE_RANGES.find((r) => r.id === dateRange)?.label}
            </Text>
            <ChevronDown size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Date Range Picker */}
        {showDatePicker && (
          <View style={styles.dateRangePicker}>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[styles.dateRangeOption, dateRange === range.id && styles.dateRangeOptionActive]}
                onPress={() => {
                  setDateRange(range.id);
                  setShowDatePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.dateRangeOptionText,
                    dateRange === range.id && styles.dateRangeOptionTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
        >
          {/* Overview Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon={Send}
                value={formatNumber(dashboardStats?.total_sent)}
                label="Đã gửi"
                color={COLORS.gold}
              />
              <StatCard
                icon={Eye}
                value={formatNumber(dashboardStats?.total_opened)}
                label="Đã mở"
                color={COLORS.success}
              />
              <StatCard
                icon={MousePointer}
                value={formatNumber(dashboardStats?.total_clicked)}
                label="Đã click"
                color={COLORS.cyan}
              />
              <StatCard
                icon={TrendingUp}
                value={formatRate(dashboardStats?.avg_open_rate)}
                label="Open Rate"
                color={COLORS.purple}
              />
            </View>
          </View>

          {/* Content Type Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theo loại</Text>
            <View style={styles.typeStatsRow}>
              <View style={styles.typeStatCard}>
                <Bell size={24} color={COLORS.gold} />
                <Text style={styles.typeStatValue}>{dashboardStats?.push_count || 0}</Text>
                <Text style={styles.typeStatLabel}>Push</Text>
              </View>
              <View style={styles.typeStatCard}>
                <FileText size={24} color={COLORS.cyan} />
                <Text style={styles.typeStatValue}>{dashboardStats?.post_count || 0}</Text>
                <Text style={styles.typeStatLabel}>Post</Text>
              </View>
            </View>
          </View>

          {/* Hourly Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theo giờ (Opens)</Text>
            <View style={styles.hourlyChart}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.hourlyBars}>
                  {hourlyBreakdown.slice(6, 24).map((item) => (
                    <HourlyBar
                      key={item.hour}
                      hour={item.hour}
                      value={item.opens}
                      maxValue={maxHourlyValue}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
            <Text style={styles.chartHint}>Giờ cao điểm: 8h-10h, 19h-21h</Text>
          </View>

          {/* Top Performing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Push Notifications</Text>
            {topPush.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
            ) : (
              topPush.map((item, index) => (
                <TopItem key={item.id} rank={index + 1} item={item} type="push" />
              ))
            )}
          </View>

          {/* Segment Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theo Segment</Text>
            <View style={styles.segmentCard}>
              {Object.entries(segmentPerformance).map(([segment, data]) => (
                <SegmentStat key={segment} segment={segment} data={data} />
              ))}
              {Object.keys(segmentPerformance).length === 0 && (
                <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
              )}
            </View>
          </View>

          {/* A/B Test Results */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A/B Test Results</Text>
            {abTestResults.length === 0 ? (
              <View style={styles.emptyCard}>
                <Beaker size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có A/B test nào</Text>
              </View>
            ) : (
              abTestResults.map((test) => (
                <View key={test.id} style={styles.abTestCard}>
                  <Text style={styles.abTestTitle}>{test.title}</Text>
                  <View style={styles.abTestVariants}>
                    <View style={styles.abVariant}>
                      <Text style={styles.abVariantLabel}>A</Text>
                      <Text style={styles.abVariantValue}>
                        {test.ab_analytics?.ab_variant_stats?.A?.opens || 0} opens
                      </Text>
                    </View>
                    <View style={styles.abVariant}>
                      <Text style={styles.abVariantLabel}>B</Text>
                      <Text style={styles.abVariantValue}>
                        {test.ab_analytics?.ab_variant_stats?.B?.opens || 0} opens
                      </Text>
                    </View>
                  </View>
                  {test.ab_analytics?.ab_winner && (
                    <View style={styles.abWinner}>
                      <Text style={styles.abWinnerText}>
                        Winner: Variant {test.ab_analytics.ab_winner}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: SPACING.xs },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  dateRangeText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.gold },

  dateRangePicker: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dateRangeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dateRangeOptionActive: { backgroundColor: COLORS.gold },
  dateRangeOptionText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  dateRangeOptionTextActive: { color: COLORS.bgDarkest, fontWeight: TYPOGRAPHY.fontWeight.semibold },

  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2 - SPACING.sm / 2,
    backgroundColor: GLASS.background,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted, marginTop: 2 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: SPACING.xs,
    marginTop: SPACING.xs,
  },
  trendText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold },

  typeStatsRow: { flexDirection: 'row', gap: SPACING.md },
  typeStatCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  typeStatValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  typeStatLabel: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textMuted },

  hourlyChart: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
  },
  hourlyBars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: SPACING.xs },
  hourlyBar: { width: 24, alignItems: 'center' },
  hourlyBarFill: {
    width: 16,
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    minHeight: 4,
  },
  hourlyBarLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginTop: 4 },
  chartHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rankBadgeGold: { backgroundColor: COLORS.gold },
  rankText: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textSecondary },
  rankTextGold: { color: COLORS.bgDarkest },
  topItemContent: { flex: 1 },
  topItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  topItemStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: 4 },
  topItemStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topItemStatText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textMuted },
  topItemRate: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.success },

  segmentCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
  },
  segmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  segmentLabel: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary },
  segmentStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  segmentValue: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textMuted },
  segmentRate: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.success },

  emptyCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textMuted, marginTop: SPACING.sm },

  abTestCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  abTestTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  abTestVariants: { flexDirection: 'row', gap: SPACING.md },
  abVariant: {
    flex: 1,
    backgroundColor: 'rgba(138,100,255,0.1)',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  abVariantLabel: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.purple },
  abVariantValue: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, marginTop: 4 },
  abWinner: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(58,247,166,0.2)',
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  abWinnerText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.success },

  loadingText: { color: COLORS.textMuted, marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.lg },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: { color: COLORS.gold, fontWeight: TYPOGRAPHY.fontWeight.semibold, fontSize: TYPOGRAPHY.fontSize.lg },
});

export default ContentAnalyticsScreen;
