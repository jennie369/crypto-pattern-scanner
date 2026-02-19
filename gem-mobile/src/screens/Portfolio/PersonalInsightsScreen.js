/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERSONAL INSIGHTS SCREEN
 * ROI Proof System - Phase D
 * Main dashboard showing personal progress, community comparison, and insights
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  DollarSign,
  Calendar,
  Info,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS, GLASS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { useAuth } from '../../contexts/AuthContext';
import { proofAnalyticsService } from '../../services/proofAnalyticsService';
import { HealthStatusBadge, HealthStatusCard } from '../../components/roi/HealthStatusBadge';
import PersonalProgressChart from '../../components/roi/PersonalProgressChart';
import { CommunityComparisonList } from '../../components/roi/CommunityComparisonBar';
import { InsightsList, NextStepsList } from '../../components/roi/InsightCard';
import InsightsOnboarding from '../../components/roi/InsightsOnboarding';
import accountHealthService from '../../services/accountHealthService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * KPI Icon mapping
 */
const KPI_ICONS = {
  win_rate: TrendingUp,
  discipline: Shield,
  pnl: DollarSign,
  rituals: Calendar,
};

/**
 * KPICard Component
 */
const KPICard = ({ kpi }) => {
  const IconComponent = KPI_ICONS[kpi.id] || Info;
  const isPositiveChange = (kpi.change ?? 0) > 0;
  const changeColor = isPositiveChange ? COLORS.success : (kpi.change < 0 ? COLORS.error : COLORS.textMuted);

  // Format value
  const formatValue = (value) => {
    if (value == null) return '0';
    if (kpi.prefix) return `${kpi.prefix}${value.toFixed(0)}`;
    if (kpi.suffix === '%') return `${value.toFixed(1)}%`;
    return value.toFixed(0);
  };

  // Format change
  const formatChange = (change) => {
    if (change == null || change === 0) return null;
    const sign = change > 0 ? '+' : '';
    if (kpi.suffix === '%') return `${sign}${change.toFixed(1)}%`;
    if (kpi.prefix) return `${sign}${kpi.prefix}${change.toFixed(0)}`;
    return `${sign}${change.toFixed(0)}`;
  };

  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconContainer, { backgroundColor: `${kpi.color}20` }]}>
        <IconComponent size={20} color={kpi.color} strokeWidth={2} />
      </View>
      <Text style={styles.kpiValue}>{formatValue(kpi.value)}</Text>
      <Text style={styles.kpiLabel}>{kpi.label}</Text>
      {formatChange(kpi.change) && (
        <Text style={[styles.kpiChange, { color: changeColor }]}>
          {formatChange(kpi.change)}
        </Text>
      )}
      {kpi.percentile != null && (
        <Text style={styles.kpiPercentile}>
          Top {100 - kpi.percentile}%
        </Text>
      )}
    </View>
  );
};

/**
 * Access restricted banner for FREE users
 */
const AccessRestrictedBanner = ({ onUpgrade }) => (
  <TouchableOpacity style={styles.restrictedBanner} onPress={onUpgrade} activeOpacity={0.8}>
    <Lock size={24} color={COLORS.gold} />
    <View style={styles.restrictedContent}>
      <Text style={styles.restrictedTitle}>Nâng cấp để mở khóa</Text>
      <Text style={styles.restrictedText}>
        Biểu đồ, so sánh cộng đồng và phân tích AI chỉ dành cho TIER1+
      </Text>
    </View>
    <ChevronRight size={20} color={COLORS.gold} />
  </TouchableOpacity>
);

/**
 * PersonalInsightsScreen Component
 */
const PersonalInsightsScreen = ({ navigation }) => {
  const { user, profile } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [progress, setProgress] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [insights, setInsights] = useState([]);
  const [nextSteps, setNextSteps] = useState([]);
  const [health, setHealth] = useState(null);

  // Access control
  const scannerTier = profile?.scanner_tier || 'FREE';
  const isPremium = scannerTier !== 'FREE';

  // Load data
  const loadData = useCallback(async (showLoading = true) => {
    if (!user?.id) return;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const results = await Promise.allSettled([
        proofAnalyticsService.getPersonalProgress(user.id),
        proofAnalyticsService.getMonthlyEvolution(user.id),
        proofAnalyticsService.getCommunityComparison(user.id),
        proofAnalyticsService.getPersonalInsights(user.id),
        proofAnalyticsService.getNextSteps(user.id),
        accountHealthService.getLatestSnapshot(user.id),
      ]);

      // Extract results (handle partial failures)
      const [progressRes, evolutionRes, comparisonRes, insightsRes, stepsRes, healthRes] = results;

      if (progressRes.status === 'fulfilled' && progressRes.value.success) {
        setProgress(progressRes.value.data);
      }

      if (evolutionRes.status === 'fulfilled' && evolutionRes.value.success) {
        setEvolution(evolutionRes.value.data);
      }

      if (comparisonRes.status === 'fulfilled' && comparisonRes.value.success) {
        setComparison(comparisonRes.value.data);
      }

      if (insightsRes.status === 'fulfilled' && insightsRes.value.success) {
        setInsights(insightsRes.value.data);
      }

      if (stepsRes.status === 'fulfilled' && stepsRes.value.success) {
        setNextSteps(stepsRes.value.data);
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.success) {
        setHealth(healthRes.value.data);
      }
    } catch (err) {
      console.error('[PersonalInsightsScreen] Load error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[PersonalInsights] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => loadData(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  // Handle step press
  const handleStepPress = (step) => {
    if (step.action && navigation) {
      navigation.navigate(step.action);
    }
  };

  // Handle upgrade press
  const handleUpgradePress = () => {
    navigation?.navigate('UpgradeScreen');
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang phân tích dữ liệu...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error && !progress) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
            >
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personal Insights</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Insights</Text>
          <View style={styles.headerRight}>
            {health && (
              <HealthStatusBadge
                status={health.health_status}
                showLabel={false}
                size="sm"
              />
            )}
          </View>
        </View>

        {/* Onboarding Modal */}
        <InsightsOnboarding />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
        >
          {/* Section 1: Progress Summary (4 KPIs) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan tiến bộ</Text>
            <Text style={styles.sectionSubtitle}>
              {progress?.practiceLevel
                ? proofAnalyticsService.getPracticeLevelLabel(progress.practiceLevel)
                : 'Đang phân tích...'}
            </Text>

            <View style={styles.kpiGrid}>
              {progress?.kpis?.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </View>
          </View>

          {/* Section 2: Monthly Evolution (Chart) - Premium only */}
          <View style={styles.section}>
            {isPremium ? (
              <PersonalProgressChart
                data={evolution}
                metric="winRate"
                title="Tiến bộ theo tháng"
              />
            ) : (
              <View style={styles.lockedSection}>
                <Text style={styles.sectionTitle}>Biểu đồ tiến bộ</Text>
                <AccessRestrictedBanner onUpgrade={handleUpgradePress} />
              </View>
            )}
          </View>

          {/* Section 3: Community Comparison - Premium only */}
          <View style={styles.section}>
            {isPremium && comparison ? (
              <CommunityComparisonList
                comparisons={comparison.comparisons}
                cohortName={comparison.cohortName}
              />
            ) : !isPremium ? (
              <View style={styles.lockedSection}>
                <Text style={styles.sectionTitle}>So sánh cộng đồng</Text>
                <AccessRestrictedBanner onUpgrade={handleUpgradePress} />
              </View>
            ) : null}
          </View>

          {/* Section 4: AI Insights - Premium only */}
          <View style={styles.section}>
            {isPremium ? (
              <InsightsList
                insights={insights}
                title="Phân tích AI"
              />
            ) : (
              <View style={styles.lockedSection}>
                <Text style={styles.sectionTitle}>Phân tích AI</Text>
                <AccessRestrictedBanner onUpgrade={handleUpgradePress} />
              </View>
            )}
          </View>

          {/* Section 5: Next Steps */}
          <View style={styles.section}>
            <NextStepsList
              steps={nextSteps}
              title="Bước tiếp theo"
              onStepPress={handleStepPress}
            />
          </View>

          {/* Health Card (if critical) */}
          {health?.isCritical && (
            <View style={styles.section}>
              <HealthStatusCard
                status={health.health_status}
                balancePct={health.balance_pct}
                message={accountHealthService.getHealthMessage(health.health_status, health.balance_pct)}
              />
            </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 2,
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  kpiValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  kpiLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  kpiChange: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.xs,
  },
  kpiPercentile: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginTop: 2,
  },

  // Locked section
  lockedSection: {
    backgroundColor: GLASS.backgroundColor,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  // Restricted banner
  restrictedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginTop: SPACING.sm,
  },
  restrictedContent: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  restrictedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  restrictedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});

export default PersonalInsightsScreen;
