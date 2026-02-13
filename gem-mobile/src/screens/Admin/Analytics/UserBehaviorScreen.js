/**
 * UserBehaviorScreen - User Behavior Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - User journey funnel
 * - Cohort retention table
 * - User segments (power/regular/casual/dormant)
 * - Entry/exit pages
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
  UserPlus,
  UserMinus,
  Activity,
  Clock,
  LogIn,
  LogOut,
  ChevronLeft,
  TrendingUp,
  Zap,
  Coffee,
  Moon,
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

const UserBehaviorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [data, setData] = useState({
    overview: {},
    userJourney: [],
    userSegments: [],
    entryPages: [],
    exitPages: [],
    retentionCohort: [],
    dailyActiveUsers: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          totalUsers: 12456,
          totalUsersChange: 8.5,
          activeUsers: 4567,
          activeUsersChange: 12.3,
          newUsers: 891,
          newUsersChange: 15.2,
          avgSessionDuration: 8.5,
          avgSessionDurationChange: 5.8,
        },
        userJourney: [
          { label: 'App Open', value: 12456 },
          { label: 'Home View', value: 11234 },
          { label: 'Feature Used', value: 7845 },
          { label: 'Conversion', value: 2345 },
        ],
        userSegments: [
          { label: 'Power Users', value: 567, color: COLORS.gold, icon: Zap, description: '>10 sessions/tuần' },
          { label: 'Regular Users', value: 2345, color: COLORS.purple, icon: Activity, description: '3-10 sessions/tuần' },
          { label: 'Casual Users', value: 4567, color: COLORS.cyan, icon: Coffee, description: '1-3 sessions/tuần' },
          { label: 'Dormant Users', value: 4977, color: COLORS.textMuted, icon: Moon, description: '<1 session/tuần' },
        ],
        entryPages: [
          { id: '1', label: 'Home', value: 5678 },
          { id: '2', label: 'Scanner', value: 3456 },
          { id: '3', label: 'Courses', value: 1234 },
          { id: '4', label: 'GemMaster', value: 987 },
          { id: '5', label: 'Shop', value: 654 },
        ],
        exitPages: [
          { id: '1', label: 'Scanner Results', value: 2345 },
          { id: '2', label: 'Home', value: 1890 },
          { id: '3', label: 'Ritual Complete', value: 1234 },
          { id: '4', label: 'Course Lesson', value: 987 },
          { id: '5', label: 'Checkout', value: 543 },
        ],
        retentionCohort: [
          { week: 'Tuần 1', day1: 100, day7: 45, day14: 32, day30: 22 },
          { week: 'Tuần 2', day1: 100, day7: 48, day14: 35, day30: 25 },
          { week: 'Tuần 3', day1: 100, day7: 52, day14: 38, day30: 28 },
          { week: 'Tuần 4', day1: 100, day7: 55, day14: 42, day30: '-' },
        ],
        dailyActiveUsers: [3456, 3678, 3890, 4123, 4234, 4456, 4567],
      });
    } catch (error) {
      console.error('[UserBehavior] Fetch error:', error);
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
              <Text style={styles.headerTitle}>User Behavior</Text>
              <Text style={styles.headerSubtitle}>Hành vi người dùng</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.userSegments} filename="user_behavior" compact />
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
              title="Total Users"
              value={data.overview.totalUsers?.toLocaleString()}
              icon={Users}
              iconColor={COLORS.purple}
              trend={data.overview.totalUsersChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalUsersChange > 0 ? '+' : ''}${data.overview.totalUsersChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Active Users"
              value={data.overview.activeUsers?.toLocaleString()}
              icon={Activity}
              iconColor={COLORS.success}
              trend={data.overview.activeUsersChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.activeUsersChange > 0 ? '+' : ''}${data.overview.activeUsersChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="New Users"
              value={data.overview.newUsers?.toLocaleString()}
              icon={UserPlus}
              iconColor={COLORS.cyan}
              trend={data.overview.newUsersChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.newUsersChange > 0 ? '+' : ''}${data.overview.newUsersChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Avg Session"
              value={`${data.overview.avgSessionDuration} min`}
              icon={Clock}
              iconColor={COLORS.gold}
              trend={data.overview.avgSessionDurationChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgSessionDurationChange > 0 ? '+' : ''}${data.overview.avgSessionDurationChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* DAU Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Daily Active Users (7 ngày)</Text>
              <TrendSparkline data={data.dailyActiveUsers} width={100} height={30} color={COLORS.success} />
            </View>
          </View>

          {/* User Journey */}
          <FunnelChart
            title="User Journey"
            data={data.userJourney}
            showDropoff={true}
            style={styles.funnelCard}
          />

          {/* User Segments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Segments</Text>
            <View style={styles.segmentsGrid}>
              {data.userSegments.map((segment, index) => {
                const Icon = segment.icon;
                return (
                  <View key={index} style={[styles.segmentCard, { borderLeftColor: segment.color }]}>
                    <View style={[styles.segmentIcon, { backgroundColor: `${segment.color}20` }]}>
                      <Icon size={18} color={segment.color} />
                    </View>
                    <Text style={styles.segmentValue}>{segment.value.toLocaleString()}</Text>
                    <Text style={styles.segmentLabel}>{segment.label}</Text>
                    <Text style={styles.segmentDesc}>{segment.description}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* User Segments Pie */}
          <PieChart
            title="Phân bố người dùng"
            data={data.userSegments}
            size={130}
            innerRadius={0.5}
            totalLabel="Total"
            style={styles.chartCard}
          />

          {/* Retention Cohort */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Retention Cohort</Text>
            <View style={styles.cohortTable}>
              <View style={styles.cohortHeader}>
                <Text style={[styles.cohortCell, { flex: 1.5 }]}>Cohort</Text>
                <Text style={[styles.cohortCell, { flex: 1 }]}>Day 1</Text>
                <Text style={[styles.cohortCell, { flex: 1 }]}>Day 7</Text>
                <Text style={[styles.cohortCell, { flex: 1 }]}>Day 14</Text>
                <Text style={[styles.cohortCell, { flex: 1 }]}>Day 30</Text>
              </View>
              {data.retentionCohort.map((row, index) => (
                <View key={index} style={styles.cohortRow}>
                  <Text style={[styles.cohortCell, { flex: 1.5, color: COLORS.textPrimary }]}>{row.week}</Text>
                  <View style={[styles.cohortCell, { flex: 1 }]}>
                    <View style={[styles.retentionBadge, { backgroundColor: `${COLORS.success}${Math.round(row.day1 * 0.8)}` }]}>
                      <Text style={styles.retentionText}>{row.day1}%</Text>
                    </View>
                  </View>
                  <View style={[styles.cohortCell, { flex: 1 }]}>
                    <View style={[styles.retentionBadge, { backgroundColor: `${COLORS.success}${Math.round(row.day7 * 1.5)}` }]}>
                      <Text style={styles.retentionText}>{row.day7}%</Text>
                    </View>
                  </View>
                  <View style={[styles.cohortCell, { flex: 1 }]}>
                    <View style={[styles.retentionBadge, { backgroundColor: `${COLORS.success}${Math.round(row.day14 * 1.8)}` }]}>
                      <Text style={styles.retentionText}>{row.day14}%</Text>
                    </View>
                  </View>
                  <View style={[styles.cohortCell, { flex: 1 }]}>
                    <View style={[styles.retentionBadge, { backgroundColor: row.day30 === '-' ? COLORS.glassBg : `${COLORS.success}${Math.round(row.day30 * 2)}` }]}>
                      <Text style={styles.retentionText}>{row.day30}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Entry/Exit Pages */}
          <View style={styles.pagesRow}>
            <TopItemsList
              title="Entry Pages"
              items={data.entryPages}
              maxItems={3}
              showRank={true}
              showProgress={false}
              style={styles.halfList}
            />
            <TopItemsList
              title="Exit Pages"
              items={data.exitPages}
              maxItems={3}
              showRank={true}
              showProgress={false}
              style={styles.halfList}
            />
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
  chartCard: { marginBottom: SPACING.md },

  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },

  segmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  segmentCard: {
    width: '48%',
    backgroundColor: GLASS.card,
    borderRadius: 12,
    padding: SPACING.sm,
    marginHorizontal: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
  },
  segmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  segmentValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  segmentLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginTop: 2 },
  segmentDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

  cohortTable: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  cohortHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  cohortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  cohortCell: { fontSize: 11, color: COLORS.textMuted },
  retentionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  retentionText: { fontSize: 10, fontWeight: '600', color: COLORS.textPrimary },

  pagesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfList: { flex: 1 },
});

export default UserBehaviorScreen;
