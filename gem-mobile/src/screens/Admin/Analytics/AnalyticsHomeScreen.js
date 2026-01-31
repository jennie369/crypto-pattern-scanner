/**
 * AnalyticsHomeScreen - Main Admin Analytics Dashboard
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Real-time metrics overview
 * - Today's summary with trends
 * - Top features usage
 * - Usage heatmap by hour/day
 * - Quick access to detailed views
 *
 * Created: January 30, 2026
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Eye,
  Zap,
  Clock,
  TrendingUp,
  Search,
  Heart,
  MessageCircle,
  ShoppingCart,
  BookOpen,
  BarChart3,
  Calendar,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Settings,
  Lightbulb,
} from 'lucide-react-native';

import { useAuth } from '../../../contexts/AuthContext';
import { adminAnalyticsService } from '../../../services/adminAnalyticsService';
import {
  MetricCard,
  HourlyHeatmap,
  FeatureBarChart,
} from '../../../components/Admin/Analytics';
import { COLORS, GRADIENTS, SPACING, GLASS } from '../../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =====================================================
// DATE RANGE FILTER
// =====================================================

const DateRangeFilter = ({ selected, onSelect }) => {
  const options = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'week', label: '7 ngày' },
    { key: 'month', label: '30 ngày' },
  ];

  return (
    <View style={styles.dateRangeContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.dateRangeButton,
            selected === option.key && styles.dateRangeButtonActive,
          ]}
          onPress={() => onSelect(option.key)}
        >
          <Text
            style={[
              styles.dateRangeText,
              selected === option.key && styles.dateRangeTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// =====================================================
// QUICK ACCESS CARD
// =====================================================

const QuickAccessCard = ({ icon: Icon, title, subtitle, onPress, color = COLORS.purple }) => (
  <TouchableOpacity style={styles.quickAccessCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.quickAccessIcon, { backgroundColor: `${color}20` }]}>
      <Icon size={20} color={color} />
    </View>
    <View style={styles.quickAccessText}>
      <Text style={styles.quickAccessTitle}>{title}</Text>
      <Text style={styles.quickAccessSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

// =====================================================
// MAIN SCREEN
// =====================================================

const AnalyticsHomeScreen = ({ navigation }) => {
  const { user, userTier } = useAuth();

  // State
  const [loading, setLoading] = useState(false) // Never blocks UI;
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [error, setError] = useState(null);

  // Data state
  const [overview, setOverview] = useState(null);
  const [topFeatures, setTopFeatures] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [realtimeUsers, setRealtimeUsers] = useState(null);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Calculate date range
      const endDate = new Date().toISOString();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Fetch all data in parallel
      const [overviewResult, topFeaturesResult, heatmapResult, realtimeResult] = await Promise.all([
        adminAnalyticsService.getDashboardOverview(startDate.toISOString(), endDate),
        adminAnalyticsService.getTopFeaturesToday(),
        adminAnalyticsService.getHourlyHeatmap(dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : 30),
        adminAnalyticsService.getRealtimeUsers(),
      ]);

      if (overviewResult.success) {
        setOverview(overviewResult.data);
      }

      if (topFeaturesResult.success) {
        setTopFeatures(topFeaturesResult.data || []);
      }

      if (heatmapResult.success) {
        setHeatmapData(heatmapResult.data || []);
      }

      if (realtimeResult.success) {
        setRealtimeUsers(realtimeResult.data);
      }

    } catch (err) {
      console.error('[AnalyticsHome] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const metrics = useMemo(() => {
    if (!overview) {
      return {
        totalUsers: { value: '0', trend: null, trendValue: null },
        activeUsers: { value: '0', trend: null, trendValue: null },
        pageViews: { value: '0', trend: null, trendValue: null },
        avgSession: { value: '0m', trend: null, trendValue: null },
      };
    }

    // Format numbers
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num?.toString() || '0';
    };

    // Format duration
    const formatDuration = (seconds) => {
      if (!seconds || seconds < 60) return `${seconds || 0}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    // Calculate trend
    const getTrend = (current, previous) => {
      if (!previous || previous === 0) return { trend: null, trendValue: null };
      const change = ((current - previous) / previous) * 100;
      return {
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        trendValue: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      };
    };

    return {
      totalUsers: {
        value: formatNumber(overview.total_users || 0),
        ...getTrend(overview.total_users, overview.prev_total_users),
      },
      activeUsers: {
        value: formatNumber(overview.active_users || 0),
        ...getTrend(overview.active_users, overview.prev_active_users),
      },
      pageViews: {
        value: formatNumber(overview.page_views || 0),
        ...getTrend(overview.page_views, overview.prev_page_views),
      },
      avgSession: {
        value: formatDuration(overview.avg_session_duration || 0),
        ...getTrend(overview.avg_session_duration, overview.prev_avg_session_duration),
      },
    };
  }, [overview]);

  // Format feature data for chart
  const featureChartData = useMemo(() => {
    return (topFeatures || []).map(f => ({
      name: f.feature_name || f.event_name || 'Unknown',
      category: f.category || f.event_category || 'default',
      value: f.count || f.usage_count || 0,
      trend: f.trend,
      trendValue: f.trend_value,
    }));
  }, [topFeatures]);

  // =====================================================
  // NAVIGATION HANDLERS
  // =====================================================

  const navigateToDetail = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>Tổng quan hoạt động</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={20}
                color={COLORS.purple}
                style={refreshing ? { opacity: 0.5 } : undefined}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigateToDetail('AnalyticsSettings')}
            >
              <Settings size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range Filter */}
        <DateRangeFilter selected={dateRange} onSelect={setDateRange} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            )}
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Real-time Badge */}
          {realtimeUsers && (
            <View style={styles.realtimeBadge}>
              <View style={styles.realtimeDot} />
            )}
              <Text style={styles.realtimeText}>
                {realtimeUsers.active_users_15min || 0} người dùng đang hoạt động
              </Text>
            )}
            </View>
          )}

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Người dùng"
              value={metrics.totalUsers.value}
              subtitle="Tổng số"
              icon={Users}
              iconColor={COLORS.purple}
              trend={metrics.totalUsers.trend}
              trendValue={metrics.totalUsers.trendValue}
              color={COLORS.purple}
              size="medium"
              style={styles.metricCardHalf}
            />
            <MetricCard
              title="Hoạt động"
              value={metrics.activeUsers.value}
              subtitle="Đang hoạt động"
              icon={Zap}
              iconColor={COLORS.gold}
              trend={metrics.activeUsers.trend}
              trendValue={metrics.activeUsers.trendValue}
              color={COLORS.gold}
              size="medium"
              style={styles.metricCardHalf}
            />
            <MetricCard
              title="Lượt xem"
              value={metrics.pageViews.value}
              subtitle="Tổng page views"
              icon={Eye}
              iconColor={COLORS.success}
              trend={metrics.pageViews.trend}
              trendValue={metrics.pageViews.trendValue}
              color={COLORS.success}
              size="medium"
              style={styles.metricCardHalf}
            />
            <MetricCard
              title="Thời gian"
              value={metrics.avgSession.value}
              subtitle="Trung bình/phiên"
              icon={Clock}
              iconColor="#FF6B9D"
              trend={metrics.avgSession.trend}
              trendValue={metrics.avgSession.trendValue}
              color="#FF6B9D"
              size="medium"
              style={styles.metricCardHalf}
            />
          </View>

          {/* Top Features */}
          <FeatureBarChart
            title="Tính năng phổ biến"
            data={featureChartData}
            maxItems={8}
            onFeaturePress={(item) => {
              if (item.action === 'showAll') {
                navigateToDetail('FeatureUsage');
              } else {
                navigateToDetail('FeatureUsage', { category: item.category });
              }
            }}
            style={styles.section}
          />

          {/* Usage Heatmap */}
          <HourlyHeatmap
            title="Hoạt động theo giờ"
            data={heatmapData}
            valueLabel="hoạt động"
            onCellPress={(cell) => {
              console.log('[Analytics] Heatmap cell pressed:', cell);
            }}
            style={styles.section}
          />

          {/* Quick Access */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionTitle}>Phân tích chi tiết</Text>

            <QuickAccessCard
              icon={Search}
              title="Scanner Analytics"
              subtitle="Patterns, timeframes, symbols"
              color="#FFD700"
              onPress={() => navigateToDetail('ScannerAnalytics')}
            />

            <QuickAccessCard
              icon={Heart}
              title="Ritual Analytics"
              subtitle="Completion rates, streaks"
              color="#FF6B9D"
              onPress={() => navigateToDetail('RitualAnalytics')}
            />

            <QuickAccessCard
              icon={MessageCircle}
              title="Chatbot Analytics"
              subtitle="Conversations, ratings"
              color="#6A5BFF"
              onPress={() => navigateToDetail('ChatbotAnalytics')}
            />

            <QuickAccessCard
              icon={ShoppingCart}
              title="Shop Analytics"
              subtitle="Products, conversions"
              color="#4CAF50"
              onPress={() => navigateToDetail('ShopAnalytics')}
            />

            <QuickAccessCard
              icon={Users}
              title="User Behavior"
              subtitle="Journey, segments, retention"
              color="#00BCD4"
              onPress={() => navigateToDetail('UserBehavior')}
            />

            <QuickAccessCard
              icon={BarChart3}
              title="Feature Usage"
              subtitle="Categories, trends, completion"
              color="#9C27B0"
              onPress={() => navigateToDetail('FeatureUsage')}
            />

            <QuickAccessCard
              icon={TrendingUp}
              title="Affiliate Analytics"
              subtitle="KOL, commissions, conversions"
              color="#FF9800"
              onPress={() => navigateToDetail('AffiliateAnalytics')}
            />

            <QuickAccessCard
              icon={Lightbulb}
              title="AI Insights"
              subtitle="Recommendations & predictions"
              color="#E91E63"
              onPress={() => navigateToDetail('AIInsights')}
            />
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GLASS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Date Range
  dateRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: GLASS.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  dateRangeButtonActive: {
    backgroundColor: COLORS.purple,
  },
  dateRangeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  dateRangeTextActive: {
    color: '#FFFFFF',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 20,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: '600',
  },

  // Realtime Badge
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  realtimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  metricCardHalf: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  // Section
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Quick Access
  quickAccessSection: {
    marginTop: SPACING.sm,
  },
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.card,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default AnalyticsHomeScreen;
