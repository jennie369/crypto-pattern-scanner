/**
 * FeatureUsageScreen - Feature Usage Analytics
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Feature breakdown by category
 * - Trend comparison (this week vs last week)
 * - Top features by usage
 * - Completion rates by feature
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
  Layers,
  Scan,
  Heart,
  MessageCircle,
  ShoppingBag,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  BarChart2,
} from 'lucide-react-native';

import {
  MetricCard,
  TopItemsList,
  FeatureBarChart,
  DateRangePicker,
  RefreshButton,
  ExportButton,
  LoadingSkeleton,
  TrendSparkline,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const CATEGORY_ICONS = {
  Scanner: Scan,
  Rituals: Heart,
  GemMaster: MessageCircle,
  Shop: ShoppingBag,
  Courses: BookOpen,
};

const FeatureUsageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');
  const [data, setData] = useState({
    overview: {},
    categories: [],
    topFeatures: [],
    featureComparison: [],
    completionRates: [],
    dailyUsage: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setData({
        overview: {
          totalActions: 89456,
          totalActionsChange: 15.5,
          uniqueFeatures: 24,
          uniqueFeaturesChange: 0,
          avgActionsPerUser: 12.5,
          avgActionsPerUserChange: 8.3,
          completionRate: 78.5,
          completionRateChange: 3.2,
        },
        categories: [
          { label: 'Scanner', value: 25678, thisWeek: 25678, lastWeek: 22345, change: 14.9, color: COLORS.purple },
          { label: 'Rituals', value: 18456, thisWeek: 18456, lastWeek: 16789, change: 9.9, color: '#FF6B9D' },
          { label: 'GemMaster', value: 15234, thisWeek: 15234, lastWeek: 12567, change: 21.2, color: COLORS.cyan },
          { label: 'Shop', value: 12456, thisWeek: 12456, lastWeek: 11234, change: 10.9, color: COLORS.gold },
          { label: 'Courses', value: 9876, thisWeek: 9876, lastWeek: 8765, change: 12.7, color: COLORS.success },
        ],
        topFeatures: [
          { id: '1', label: 'Pattern Scan', value: 18765, category: 'Scanner', color: COLORS.purple },
          { id: '2', label: 'Heart Expansion', value: 8456, category: 'Rituals', color: '#FF6B9D' },
          { id: '3', label: 'Tarot Reading', value: 6234, category: 'GemMaster', color: COLORS.cyan },
          { id: '4', label: 'Course View', value: 5678, category: 'Courses', color: COLORS.success },
          { id: '5', label: 'Product View', value: 4567, category: 'Shop', color: COLORS.gold },
        ],
        featureComparison: [
          { feature: 'Pattern Scan', thisWeek: 18765, lastWeek: 16234 },
          { feature: 'Heart Expansion', thisWeek: 8456, lastWeek: 7890 },
          { feature: 'Tarot Reading', thisWeek: 6234, lastWeek: 4567 },
          { feature: 'Course View', thisWeek: 5678, lastWeek: 5234 },
          { feature: 'Product View', thisWeek: 4567, lastWeek: 4123 },
        ],
        completionRates: [
          { label: 'Rituals', value: 82.5 },
          { label: 'Scanner', value: 95.2 },
          { label: 'Courses', value: 45.8 },
          { label: 'Chatbot', value: 78.3 },
          { label: 'Checkout', value: 32.5 },
        ],
        dailyUsage: [12456, 13567, 14234, 13890, 14567, 15234, 15890],
      });
    } catch (error) {
      console.error('[FeatureUsage] Fetch error:', error);
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
              <Text style={styles.headerTitle}>Feature Usage</Text>
              <Text style={styles.headerSubtitle}>Sử dụng tính năng</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <RefreshButton onRefresh={onRefresh} loading={refreshing} compact />
            <ExportButton data={data.categories} filename="feature_usage" compact />
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
              title="Total Actions"
              value={data.overview.totalActions?.toLocaleString()}
              icon={Layers}
              iconColor={COLORS.purple}
              trend={data.overview.totalActionsChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.totalActionsChange > 0 ? '+' : ''}${data.overview.totalActionsChange}%`}
              size="small"
              style={styles.metricCard}
            />
            <MetricCard
              title="Actions/User"
              value={data.overview.avgActionsPerUser?.toFixed(1)}
              icon={BarChart2}
              iconColor={COLORS.cyan}
              trend={data.overview.avgActionsPerUserChange > 0 ? 'up' : 'down'}
              trendValue={`${data.overview.avgActionsPerUserChange > 0 ? '+' : ''}${data.overview.avgActionsPerUserChange}%`}
              size="small"
              style={styles.metricCard}
            />
          </View>

          {/* Daily Usage Trend */}
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.cardTitle}>Actions (7 ngày)</Text>
              <TrendSparkline data={data.dailyUsage} width={100} height={30} color={COLORS.purple} />
            </View>
          </View>

          {/* Category Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage by Category</Text>
            <View style={styles.categoryTable}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryHeaderCell, { flex: 2 }]}>Category</Text>
                <Text style={[styles.categoryHeaderCell, { flex: 1.5 }]}>This Week</Text>
                <Text style={[styles.categoryHeaderCell, { flex: 1.5 }]}>Last Week</Text>
                <Text style={[styles.categoryHeaderCell, { flex: 1 }]}>Change</Text>
              </View>
              {data.categories.map((category, index) => {
                const Icon = CATEGORY_ICONS[category.label] || Layers;
                return (
                  <View key={index} style={styles.categoryRow}>
                    <View style={[styles.categoryCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                        <Icon size={14} color={category.color} />
                      </View>
                      <Text style={styles.categoryName}>{category.label}</Text>
                    </View>
                    <Text style={[styles.categoryCell, { flex: 1.5 }]}>{category.thisWeek.toLocaleString()}</Text>
                    <Text style={[styles.categoryCell, { flex: 1.5, color: COLORS.textMuted }]}>{category.lastWeek.toLocaleString()}</Text>
                    <View style={[styles.categoryCell, { flex: 1 }]}>
                      <View style={[styles.changeBadge, { backgroundColor: category.change > 0 ? `${COLORS.success}20` : `${COLORS.error}20` }]}>
                        {category.change > 0 ? (
                          <TrendingUp size={10} color={COLORS.success} />
                        ) : (
                          <TrendingDown size={10} color={COLORS.error} />
                        )}
                        <Text style={[styles.changeText, { color: category.change > 0 ? COLORS.success : COLORS.error }]}>
                          {Math.abs(category.change)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Top Features */}
          <TopItemsList
            title="Top Features"
            items={data.topFeatures}
            maxItems={5}
            showRank={true}
            style={styles.listCard}
          />

          {/* Completion Rates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completion Rates</Text>
            <View style={styles.completionCard}>
              {data.completionRates.map((item, index) => (
                <View key={index} style={styles.completionRow}>
                  <Text style={styles.completionLabel}>{item.label}</Text>
                  <View style={styles.completionBarContainer}>
                    <View
                      style={[
                        styles.completionBar,
                        {
                          width: `${item.value}%`,
                          backgroundColor: item.value >= 70 ? COLORS.success : item.value >= 50 ? COLORS.warning : COLORS.error,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.completionValue}>{item.value}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Feature Comparison Chart */}
          <FeatureBarChart
            title="This Week vs Last Week"
            data={data.categories.map(c => ({ label: c.label, value: c.thisWeek }))}
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
    marginHorizontal: -4,
    marginBottom: SPACING.md,
  },
  metricCard: { flex: 1, paddingHorizontal: 4 },

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

  categoryTable: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  categoryHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  categoryHeaderCell: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  categoryCell: { fontSize: 13, color: COLORS.textPrimary },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  changeText: { fontSize: 11, fontWeight: '600' },

  listCard: { marginBottom: SPACING.md },
  chartCard: { marginBottom: SPACING.md },

  completionCard: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completionLabel: { width: 80, fontSize: 12, color: COLORS.textSecondary },
  completionBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  completionBar: { height: '100%', borderRadius: 8 },
  completionValue: { width: 45, fontSize: 12, color: COLORS.textPrimary, textAlign: 'right', fontWeight: '600' },
});

export default FeatureUsageScreen;
