/**
 * Analytics Dashboard Screen
 * Phase 5: Production
 *
 * Analytics dashboard features:
 * - Revenue Analytics
 * - Engagement Metrics
 * - AI Performance Analytics
 * - User Growth
 * - System Health Overview
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import tokens from '../../utils/tokens';
import { healthCheckService, HEALTH_STATUS_ENUM } from '../../services/healthCheckService';

const { width } = Dimensions.get('window');

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

const MetricCard = ({ title, value, subtitle, icon, trend, trendValue, color }) => {
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#9E9E9E';
  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';

  return (
    <View style={[styles.metricCard, { borderLeftColor: color || tokens.colors.primary }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={20} color={color || tokens.colors.primary} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricFooter}>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
            <Ionicons name={trendIcon} size={12} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// CHART BAR COMPONENT
// ============================================================================

const ChartBar = ({ label, value, maxValue, color }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View style={styles.chartBar}>
      <Text style={styles.chartBarLabel}>{label}</Text>
      <View style={styles.chartBarTrack}>
        <View
          style={[
            styles.chartBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.chartBarValue}>{value}</Text>
    </View>
  );
};

// ============================================================================
// HEALTH STATUS COMPONENT
// ============================================================================

const HealthStatusCard = ({ services }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case HEALTH_STATUS_ENUM.HEALTHY:
        return '#4CAF50';
      case HEALTH_STATUS_ENUM.DEGRADED:
        return '#FF9800';
      case HEALTH_STATUS_ENUM.UNHEALTHY:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.healthCard}>
      <Text style={styles.sectionTitle}>Trang thai he thong</Text>
      <View style={styles.healthGrid}>
        {Object.entries(services).map(([name, data]) => (
          <View key={name} style={styles.healthItem}>
            <View
              style={[
                styles.healthDot,
                { backgroundColor: getStatusColor(data.status) },
              ]}
            />
            <Text style={styles.healthName}>{name}</Text>
            <Text style={styles.healthLatency}>
              {data.latency ? `${data.latency}ms` : 'N/A'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

const AnalyticsDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('today'); // today, week, month
  const [analytics, setAnalytics] = useState({
    revenue: {},
    engagement: {},
    aiPerformance: {},
    userGrowth: {},
    topProducts: [],
    healthServices: {},
  });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchAnalytics = useCallback(async () => {
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch dashboard stats
      const { data: dashboardStats } = await supabase.rpc('get_admin_dashboard_stats');

      // Fetch analytics events summary
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_name, properties')
        .gte('timestamp', startDate.toISOString());

      // Calculate metrics from events
      let totalRevenue = 0;
      let totalOrders = 0;
      let totalViews = 0;
      let totalComments = 0;
      let totalGifts = 0;

      analyticsEvents?.forEach((event) => {
        switch (event.event_name) {
          case 'purchase':
            totalRevenue += parseFloat(event.properties?.order_value || 0);
            totalOrders++;
            break;
          case 'product_view':
            totalViews++;
            break;
          case 'livestream_comment':
            totalComments++;
            break;
          case 'gift_sent':
            totalGifts++;
            break;
        }
      });

      // Fetch AI performance metrics
      const { data: aiResponses } = await supabase
        .from('ai_responses')
        .select('latency_ms, response_tier')
        .gte('created_at', startDate.toISOString());

      let avgLatency = 0;
      const tierCounts = { tier1: 0, tier2: 0, tier3: 0 };

      if (aiResponses?.length > 0) {
        avgLatency = aiResponses.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / aiResponses.length;
        aiResponses.forEach((r) => {
          if (r.response_tier && tierCounts[r.response_tier] !== undefined) {
            tierCounts[r.response_tier]++;
          }
        });
      }

      // Fetch user growth
      const { data: newUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .gte('created_at', startDate.toISOString());

      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });

      // Fetch top products
      const { data: topProductsData } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('event_name', 'product_view')
        .gte('timestamp', startDate.toISOString());

      const productViews = {};
      topProductsData?.forEach((event) => {
        const productId = event.properties?.product_id;
        if (productId) {
          productViews[productId] = (productViews[productId] || 0) + 1;
        }
      });

      const topProducts = Object.entries(productViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, views]) => ({ id, views }));

      // Fetch health status
      const healthData = await healthCheckService.getSystemHealth();

      setAnalytics({
        revenue: {
          total: totalRevenue,
          orders: totalOrders,
          avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        engagement: {
          views: totalViews,
          comments: totalComments,
          gifts: totalGifts,
          ...dashboardStats,
        },
        aiPerformance: {
          avgLatency: Math.round(avgLatency),
          totalResponses: aiResponses?.length || 0,
          tierCounts,
        },
        userGrowth: {
          newUsers: newUsers?.length || 0,
          totalUsers: totalUsers || 0,
        },
        topProducts,
        healthServices: healthData.services || {},
      });
    } catch (error) {
      console.error('[AnalyticsDashboard] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Dang tai analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="download-outline" size={24} color={tokens.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeContainer}>
        {['today', 'week', 'month'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.dateRangeBtn, dateRange === range && styles.dateRangeBtnActive]}
            onPress={() => setDateRange(range)}
          >
            <Text
              style={[
                styles.dateRangeBtnText,
                dateRange === range && styles.dateRangeBtnTextActive,
              ]}
            >
              {range === 'today' ? 'Hom nay' : range === 'week' ? '7 ngay' : '30 ngay'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Revenue Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Doanh thu"
            value={`${(analytics.revenue.total || 0).toLocaleString('vi-VN')}d`}
            subtitle="Tong doanh thu"
            icon="cash-outline"
            color="#4CAF50"
            trend="up"
            trendValue="12%"
          />
          <MetricCard
            title="Don hang"
            value={analytics.revenue.orders || 0}
            subtitle="Tong don"
            icon="cart-outline"
            color="#2196F3"
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Gia tri TB"
            value={`${Math.round(analytics.revenue.avgOrderValue || 0).toLocaleString('vi-VN')}d`}
            subtitle="Moi don hang"
            icon="pricetag-outline"
            color="#9C27B0"
          />
          <MetricCard
            title="Users moi"
            value={analytics.userGrowth.newUsers || 0}
            subtitle={`/ ${analytics.userGrowth.totalUsers || 0} tong`}
            icon="people-outline"
            color="#FF9800"
            trend="up"
            trendValue="8%"
          />
        </View>

        {/* Engagement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement</Text>
          <View style={styles.engagementGrid}>
            <View style={styles.engagementItem}>
              <Ionicons name="eye-outline" size={24} color={tokens.colors.primary} />
              <Text style={styles.engagementValue}>{analytics.engagement.views || 0}</Text>
              <Text style={styles.engagementLabel}>Views</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="chatbubble-outline" size={24} color="#4CAF50" />
              <Text style={styles.engagementValue}>{analytics.engagement.comments || 0}</Text>
              <Text style={styles.engagementLabel}>Comments</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="gift-outline" size={24} color="#FF9800" />
              <Text style={styles.engagementValue}>{analytics.engagement.gifts || 0}</Text>
              <Text style={styles.engagementLabel}>Gifts</Text>
            </View>
            <View style={styles.engagementItem}>
              <Ionicons name="heart-outline" size={24} color="#E91E63" />
              <Text style={styles.engagementValue}>{analytics.engagement.active_users || 0}</Text>
              <Text style={styles.engagementLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* AI Performance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Performance</Text>
          <View style={styles.aiStats}>
            <View style={styles.aiStatItem}>
              <Text style={styles.aiStatValue}>{analytics.aiPerformance.avgLatency || 0}ms</Text>
              <Text style={styles.aiStatLabel}>Avg Latency</Text>
            </View>
            <View style={styles.aiStatItem}>
              <Text style={styles.aiStatValue}>{analytics.aiPerformance.totalResponses || 0}</Text>
              <Text style={styles.aiStatLabel}>Total Responses</Text>
            </View>
          </View>
          <View style={styles.tierBreakdown}>
            <ChartBar
              label="Tier 1"
              value={analytics.aiPerformance.tierCounts?.tier1 || 0}
              maxValue={analytics.aiPerformance.totalResponses || 1}
              color="#4CAF50"
            />
            <ChartBar
              label="Tier 2"
              value={analytics.aiPerformance.tierCounts?.tier2 || 0}
              maxValue={analytics.aiPerformance.totalResponses || 1}
              color="#2196F3"
            />
            <ChartBar
              label="Tier 3"
              value={analytics.aiPerformance.tierCounts?.tier3 || 0}
              maxValue={analytics.aiPerformance.totalResponses || 1}
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {analytics.topProducts.length > 0 ? (
            analytics.topProducts.map((product, index) => (
              <View key={product.id} style={styles.topProductItem}>
                <Text style={styles.topProductRank}>#{index + 1}</Text>
                <Text style={styles.topProductId} numberOfLines={1}>
                  {product.id}
                </Text>
                <Text style={styles.topProductViews}>{product.views} views</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>Chua co du lieu</Text>
          )}
        </View>

        {/* System Health */}
        <HealthStatusCard services={analytics.healthServices} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: tokens.colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text,
  },
  exportBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },

  // Date Range
  dateRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateRangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: tokens.colors.card,
  },
  dateRangeBtnActive: {
    backgroundColor: tokens.colors.primary,
  },
  dateRangeBtnText: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  dateRangeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: tokens.colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text,
    marginBottom: 4,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricSubtitle: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: tokens.colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 12,
  },

  // Engagement
  engagementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementItem: {
    alignItems: 'center',
  },
  engagementValue: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text,
    marginTop: 4,
  },
  engagementLabel: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },

  // AI Stats
  aiStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  aiStatItem: {
    alignItems: 'center',
  },
  aiStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  aiStatLabel: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginTop: 4,
  },
  tierBreakdown: {
    gap: 8,
  },

  // Chart Bar
  chartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartBarLabel: {
    width: 50,
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  chartBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: tokens.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartBarValue: {
    width: 40,
    fontSize: 12,
    color: tokens.colors.text,
    textAlign: 'right',
  },

  // Top Products
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  topProductRank: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  topProductId: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.text,
  },
  topProductViews: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  noDataText: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Health
  healthCard: {
    backgroundColor: tokens.colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  healthGrid: {
    gap: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  healthName: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.text,
  },
  healthLatency: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
});

export default AnalyticsDashboardScreen;
