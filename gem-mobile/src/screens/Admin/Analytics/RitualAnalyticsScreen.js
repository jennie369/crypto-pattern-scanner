/**
 * RitualAnalyticsScreen - Ritual Deep Dive Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Completion trend (30 days)
 * - Ritual type breakdown
 * - Completion rate by type
 * - Preferred times
 * - Streak distribution
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
  Heart,
  Sun,
  Moon,
  Flame,
  Target,
  Clock,
  Award,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  PieChart,
  HourlyHeatmap,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  LoadingSkeleton,
  TrendSparkline,
  FeatureBarChart,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const RITUAL_ICONS = {
  'Heart Expansion': Heart,
  'Morning Ritual': Sun,
  'Evening Ritual': Moon,
  'Focus Ritual': Target,
  'Energy Ritual': Flame,
};

const RitualAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [data, setData] = useState({
    overview: {},
    ritualTypes: [],
    completionByHour: [],
    streakDistribution: [],
    weeklyTrend: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          totalCompletions: 8945,
          totalCompletionsChange: 12.5,
          uniqueUsers: 1234,
          uniqueUsersChange: 8.2,
          avgCompletionRate: 76.5,
          avgCompletionRateChange: 3.4,
          avgStreak: 7.2,
          avgStreakChange: 15.6,
        },
        ritualTypes: [
          { label: 'Heart Expansion', value: 2845, completionRate: 82.3, color: '#FF6B9D' },
          { label: 'Morning Ritual', value: 2156, completionRate: 78.5, color: COLORS.gold },
          { label: 'Evening Ritual', value: 1789, completionRate: 74.2, color: COLORS.purple },
          { label: 'Focus Ritual', value: 1234, completionRate: 71.8, color: COLORS.cyan },
          { label: 'Energy Ritual', value: 921, completionRate: 68.5, color: COLORS.success },
        ],
        completionByHour: [
          // 24 hours x 7 days mock data
          { hour: 6, day: 0, value: 45 },
          { hour: 7, day: 0, value: 120 },
          { hour: 8, day: 0, value: 180 },
          { hour: 20, day: 0, value: 150 },
          { hour: 21, day: 0, value: 90 },
          // More data points...
        ],
        streakDistribution: [
          { label: '1-3 ngày', value: 456, color: COLORS.textMuted },
          { label: '4-7 ngày', value: 312, color: COLORS.info },
          { label: '8-14 ngày', value: 234, color: COLORS.cyan },
          { label: '15-30 ngày', value: 156, color: COLORS.purple },
          { label: '30+ ngày', value: 76, color: COLORS.gold },
        ],
        weeklyTrend: [245, 312, 287, 356, 398, 421, 445],
        preferredTimes: [
          { label: 'Sáng sớm (5-7h)', value: 2345 },
          { label: 'Buổi sáng (7-9h)', value: 3456 },
          { label: 'Trưa (12-14h)', value: 1234 },
          { label: 'Chiều tối (17-19h)', value: 1567 },
          { label: 'Tối (21-23h)', value: 2123 },
        ],
      });
    } catch (error) {
      console.error('[RitualAnalytics] Fetch error:', error);
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
              <Text style={styles.headerTitle}>Ritual Analytics</Text>
              <Text style={styles.headerSubtitle}>Phân tích Rituals</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.ritualTypes} filename="ritual_analytics" compact />
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
              title="Tổng Completions"
              value={data.overview.totalCompletions?.toLocaleString()}
              icon={Heart}
              iconColor="#FF6B9D"
              trend={data.overview.totalCompletionsChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalCompletionsChange > 0 ? '+' : ''}${data.overview.totalCompletionsChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Unique Users"
              value={data.overview.uniqueUsers?.toLocaleString()}
              icon={Target}
              iconColor={COLORS.purple}
              trend={data.overview.uniqueUsersChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.uniqueUsersChange > 0 ? '+' : ''}${data.overview.uniqueUsersChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Completion Rate"
              value={`${data.overview.avgCompletionRate}%`}
              icon={TrendingUp}
              iconColor={COLORS.success}
              trend={data.overview.avgCompletionRateChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgCompletionRateChange > 0 ? '+' : ''}${data.overview.avgCompletionRateChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Avg Streak"
              value={`${data.overview.avgStreak} ngày`}
              icon={Award}
              iconColor={COLORS.gold}
              trend={data.overview.avgStreakChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgStreakChange > 0 ? '+' : ''}${data.overview.avgStreakChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Weekly Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Xu hướng 7 ngày</Text>
              <TrendSparkline data={data.weeklyTrend} width={100} height={30} color="#FF6B9D" />
            </View>
          </View>

          {/* Ritual Type Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ritual Types</Text>
            <View style={styles.ritualTable}>
              {data.ritualTypes.map((ritual, index) => {
                const Icon = RITUAL_ICONS[ritual.label] || Heart;
                return (
                  <View key={index} style={styles.ritualRow}>
                    <View style={styles.ritualInfo}>
                      <View style={[styles.ritualIcon, { backgroundColor: `${ritual.color}20` }]}>
                        <Icon size={16} color={ritual.color} />
                      </View>
                      <View>
                        <Text style={styles.ritualName}>{ritual.label}</Text>
                        <Text style={styles.ritualCount}>{ritual.value.toLocaleString()} completions</Text>
                      </View>
                    </View>
                    <View style={styles.ritualStats}>
                      <View style={[styles.rateBadge, { backgroundColor: `${ritual.color}20` }]}>
                        <Text style={[styles.rateText, { color: ritual.color }]}>{ritual.completionRate}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Preferred Times */}
          <FeatureBarChart
            title="Thời gian ưa thích"
            data={data.preferredTimes}
            style={styles.chartCard}
          />

          {/* Streak Distribution */}
          <PieChart
            title="Phân bố Streak"
            data={data.streakDistribution}
            size={130}
            innerRadius={0.5}
            totalLabel="Users"
            style={styles.chartCard}
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

  ritualTable: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  ritualInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  ritualIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  ritualName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  ritualCount: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  ritualStats: { flexDirection: 'row', alignItems: 'center' },
  rateBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  rateText: { fontSize: 12, fontWeight: '600' },

  chartCard: { marginBottom: SPACING.md },
});

export default RitualAnalyticsScreen;
