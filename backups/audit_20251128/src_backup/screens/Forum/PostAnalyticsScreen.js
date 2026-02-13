/**
 * Gemral - Post Analytics Screen
 * Shows detailed analytics for a post (author only)
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Eye,
  Users,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  BarChart3,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { analyticsService } from '../../services/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostAnalyticsScreen = ({ route, navigation }) => {
  const { postId, postTitle } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [postId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    const result = await analyticsService.getPostAnalytics(postId);

    if (result.success) {
      setAnalytics(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Stat card component
  const StatCard = ({ icon: Icon, iconColor, label, value, subtitle }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Icon size={24} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  // Simple bar chart for views over time
  const renderViewsChart = () => {
    if (!analytics?.viewsOverTime) return null;

    const maxViews = Math.max(...analytics.viewsOverTime.map(d => d.views), 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color={COLORS.cyan} />
          <Text style={styles.sectionTitle}>Luot xem 7 ngay qua</Text>
        </View>

        <View style={styles.chart}>
          {analytics.viewsOverTime.map((day, index) => {
            const height = (day.views / maxViews) * 100;
            const date = new Date(day.date);
            const dayLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' }).slice(0, 2);

            return (
              <View key={day.date} style={styles.chartBar}>
                <Text style={styles.chartBarValue}>{day.views}</Text>
                <View style={styles.chartBarContainer}>
                  <LinearGradient
                    colors={[COLORS.cyan, COLORS.purple]}
                    style={[styles.chartBarFill, { height: `${Math.max(height, 5)}%` }]}
                  />
                </View>
                <Text style={styles.chartBarLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Source breakdown
  const renderSourceBreakdown = () => {
    if (!analytics?.sourceBreakdown) return null;

    const sources = Object.entries(analytics.sourceBreakdown);
    if (sources.length === 0) return null;

    const total = sources.reduce((sum, [_, count]) => sum + count, 0);

    const sourceLabels = {
      feed: 'Bang tin',
      search: 'Tim kiem',
      profile: 'Trang ca nhan',
      hashtag: 'Hashtag',
      direct: 'Truc tiep',
    };

    return (
      <View style={styles.sourceContainer}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Nguon luot xem</Text>
        </View>

        {sources.map(([source, count]) => {
          const percentage = ((count / total) * 100).toFixed(0);

          return (
            <View key={source} style={styles.sourceItem}>
              <Text style={styles.sourceLabel}>{sourceLabels[source] || source}</Text>
              <View style={styles.sourceBarContainer}>
                <View style={[styles.sourceBar, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.sourceValue}>{count} ({percentage}%)</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Dang tai thong ke...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thong ke</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
              <Text style={styles.retryButtonText}>Thu lai</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Thong ke bai viet</Text>
            {postTitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {postTitle}
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Engagement Rate Banner */}
          <View style={styles.engagementBanner}>
            <Text style={styles.engagementLabel}>Ti le tuong tac</Text>
            <Text style={styles.engagementValue}>{analytics.engagementRate}%</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon={Eye}
              iconColor={COLORS.cyan}
              label="Luot xem"
              value={analytics.totalViews}
            />
            <StatCard
              icon={Users}
              iconColor={COLORS.purple}
              label="Nguoi xem"
              value={analytics.uniqueViewers}
            />
            <StatCard
              icon={Clock}
              iconColor={COLORS.gold}
              label="Thoi gian TB"
              value={`${analytics.avgViewDuration}s`}
            />
            <StatCard
              icon={Heart}
              iconColor={COLORS.error}
              label="Luot thich"
              value={analytics.likesCount}
            />
            <StatCard
              icon={MessageCircle}
              iconColor={COLORS.success}
              label="Binh luan"
              value={analytics.commentsCount}
            />
            <StatCard
              icon={Bookmark}
              iconColor={COLORS.gold}
              label="Luot luu"
              value={analytics.savesCount}
            />
          </View>

          {/* Views Chart */}
          {renderViewsChart()}

          {/* Source Breakdown */}
          {renderSourceBreakdown()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    maxWidth: 200,
  },
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  // Engagement banner
  engagementBanner: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  engagementLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    marginBottom: SPACING.sm,
  },
  engagementValue: {
    fontSize: TYPOGRAPHY.fontSize.giant,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Chart
  chartContainer: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  chartBarValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  chartBarContainer: {
    flex: 1,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  chartBarLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  // Source breakdown
  sourceContainer: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sourceLabel: {
    width: 80,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  sourceBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  sourceBar: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 4,
  },
  sourceValue: {
    width: 70,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default PostAnalyticsScreen;
