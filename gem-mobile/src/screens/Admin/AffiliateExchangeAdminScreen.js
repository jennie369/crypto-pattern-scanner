/**
 * =====================================================
 * AffiliateExchangeAdminScreen
 * =====================================================
 *
 * Admin dashboard for Exchange Affiliate statistics:
 * - Stats overview (clicks, signups, deposits, trades)
 * - Breakdown by exchange
 * - Date range filter
 * - Conversion funnel visualization
 *
 * Access: ADMIN only
 *
 * =====================================================
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
  Modal,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Users,
  Wallet,
  Activity,
  ChevronDown,
  BarChart2,
} from 'lucide-react-native';

// Theme
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

// Services
import { exchangeAffiliateService } from '../../services/exchangeAffiliateService';

// Constants
import { getExchangeConfig, EXCHANGE_CONFIGS } from '../../constants/exchangeConfig';

// Loading state
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Date Range Options
 */
const DATE_RANGES = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
  { key: 'all', label: 'Tất cả', days: 365 },
];

/**
 * Stat Card Component
 */
const StatCard = ({ icon: Icon, label, value, trend }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Icon size={20} color={COLORS.purple} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    {trend && (
      <View style={styles.trendBadge}>
        <TrendingUp size={12} color={COLORS.success} />
        <Text style={styles.trendText}>{trend}</Text>
      </View>
    )}
  </View>
);

/**
 * Funnel Step Component
 */
const FunnelStep = ({ label, value, total, isLast }) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  const barWidth = total > 0 ? (value / total) * 100 : 0;

  return (
    <View style={styles.funnelStep}>
      <View style={styles.funnelHeader}>
        <Text style={styles.funnelLabel}>{label}</Text>
        <Text style={styles.funnelValue}>{value}</Text>
      </View>
      <View style={styles.funnelBarContainer}>
        <View style={[styles.funnelBar, { width: `${barWidth}%` }]} />
      </View>
      {!isLast && (
        <Text style={styles.funnelConversion}>
          {percentage}% chuyển đổi
        </Text>
      )}
    </View>
  );
};

/**
 * Exchange Row Component
 */
const ExchangeRow = ({ exchange, stats }) => {
  const config = getExchangeConfig(exchange);

  return (
    <View style={styles.exchangeRow}>
      <View style={styles.exchangeInfo}>
        <View style={[styles.exchangeDot, { backgroundColor: config?.color || COLORS.purple }]} />
        <Text style={styles.exchangeName}>{config?.displayName || exchange}</Text>
      </View>
      <View style={styles.exchangeStats}>
        <View style={styles.exchangeStat}>
          <Text style={styles.exchangeStatValue}>{stats.link_clicks || 0}</Text>
          <Text style={styles.exchangeStatLabel}>Nhấp</Text>
        </View>
        <View style={styles.exchangeStat}>
          <Text style={styles.exchangeStatValue}>{stats.registered || 0}</Text>
          <Text style={styles.exchangeStatLabel}>Đăng ký</Text>
        </View>
        <View style={styles.exchangeStat}>
          <Text style={styles.exchangeStatValue}>{stats.deposited || 0}</Text>
          <Text style={styles.exchangeStatLabel}>Nạp</Text>
        </View>
        <View style={styles.exchangeStat}>
          <Text style={[
            styles.exchangeStatValue,
            { color: parseFloat(stats.click_to_signup_rate || 0) > 20 ? COLORS.success : COLORS.textSecondary }
          ]}>
            {stats.click_to_signup_rate || 0}%
          </Text>
          <Text style={styles.exchangeStatLabel}>Tỷ lệ</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Main AffiliateExchangeAdminScreen
 */
const AffiliateExchangeAdminScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [stats, setStats] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load stats
  useEffect(() => {
    loadStats();
  }, [dateRange]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[AffiliateExchangeAdmin] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => {
        loadStats();
      }, 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const range = DATE_RANGES.find(r => r.key === dateRange);
      const startDate = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000);

      const data = await exchangeAffiliateService.getAffiliateStats(startDate);
      setStats(data);
    } catch (error) {
      console.error('[AffiliateExchangeAdmin] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [dateRange]);

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      </SafeAreaView>
    );
  }

  const summary = stats?.summary || {};
  const byExchange = stats?.by_exchange || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê Affiliate</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={16} color={COLORS.textSecondary} />
          <Text style={styles.dateRangeText}>
            {DATE_RANGES.find(r => r.key === dateRange)?.label}
          </Text>
          <ChevronDown size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Range Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.dateRangePicker}>
            <Text style={styles.dateRangePickerTitle}>Chọn khoảng thời gian</Text>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.dateRangeOption,
                  dateRange === range.key && styles.dateRangeOptionActive,
                ]}
                onPress={() => {
                  setDateRange(range.key);
                  setShowDatePicker(false);
                }}
              >
                <Text style={[
                  styles.dateRangeOptionText,
                  dateRange === range.key && styles.dateRangeOptionTextActive,
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.purple}
          />
        }
      >
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={Users}
            label="Lượt nhấp"
            value={summary.total_link_clicks || 0}
          />
          <StatCard
            icon={Users}
            label="Đăng ký"
            value={summary.total_signups || 0}
          />
          <StatCard
            icon={Wallet}
            label="Nạp tiền"
            value={summary.total_deposits || 0}
          />
          <StatCard
            icon={Activity}
            label="Giao dịch đầu"
            value={summary.total_trades || 0}
          />
        </View>

        {/* Conversion Funnel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phễu chuyển đổi</Text>
          <View style={styles.funnelContainer}>
            <FunnelStep
              label="Lượt nhấp"
              value={summary.total_link_clicks || 0}
              total={summary.total_link_clicks || 1}
            />
            <FunnelStep
              label="Đăng ký"
              value={summary.total_signups || 0}
              total={summary.total_link_clicks || 1}
            />
            <FunnelStep
              label="Xác thực KYC"
              value={summary.total_kyc || 0}
              total={summary.total_signups || 1}
            />
            <FunnelStep
              label="Nạp tiền đầu"
              value={summary.total_deposits || 0}
              total={summary.total_kyc || 1}
            />
            <FunnelStep
              label="Giao dịch đầu"
              value={summary.total_trades || 0}
              total={summary.total_deposits || 1}
              isLast
            />
          </View>
        </View>

        {/* By Exchange */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo sàn giao dịch</Text>
          <View style={styles.exchangeList}>
            {byExchange.length > 0 ? (
              byExchange.map((item, index) => (
                <ExchangeRow
                  key={item.exchange || index}
                  exchange={item.exchange}
                  stats={item}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
            )}
          </View>
        </View>

        {/* Daily Trend (simplified) */}
        {stats?.daily_trend && stats.daily_trend.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xu hướng theo ngày</Text>
            <View style={styles.trendContainer}>
              {stats.daily_trend.slice(-7).map((day, index) => (
                <View key={index} style={styles.trendDay}>
                  <View style={styles.trendBars}>
                    <View
                      style={[
                        styles.trendBar,
                        styles.trendBarClicks,
                        { height: Math.min((day.clicks || 0) * 2, 60) },
                      ]}
                    />
                    <View
                      style={[
                        styles.trendBar,
                        styles.trendBarSignups,
                        { height: Math.min((day.signups || 0) * 5, 60) },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendLabel}>
                    {new Date(day.date).getDate()}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.trendLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotClicks]} />
                <Text style={styles.legendText}>Lượt nhấp</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotSignups]} />
                <Text style={styles.legendText}>Đăng ký</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 32,
  },
  // Date range
  dateRangeContainer: {
    padding: SPACING.md,
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  dateRangeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRangePicker: {
    backgroundColor: COLORS.bgMid,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minWidth: 200,
    borderWidth: 1,
    borderColor: COLORS.purple + '40',
  },
  dateRangePickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  dateRangeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  dateRangeOptionActive: {
    backgroundColor: COLORS.purple + '30',
  },
  dateRangeOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dateRangeOptionTextActive: {
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  statContent: {},
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  trendBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    color: COLORS.success,
  },
  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  // Funnel
  funnelContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  funnelStep: {
    marginBottom: SPACING.md,
  },
  funnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  funnelLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  funnelValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  funnelBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  funnelBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.purple,
  },
  funnelConversion: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  // Exchange list
  exchangeList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  exchangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exchangeName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  exchangeStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  exchangeStat: {
    alignItems: 'center',
  },
  exchangeStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  exchangeStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    padding: SPACING.lg,
    color: COLORS.textMuted,
  },
  // Daily trend
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  trendDay: {
    alignItems: 'center',
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 4,
  },
  trendBar: {
    width: 8,
    borderRadius: 2,
    minHeight: 4,
  },
  trendBarClicks: {
    backgroundColor: COLORS.purple,
  },
  trendBarSignups: {
    backgroundColor: COLORS.cyan,
  },
  trendLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotClicks: {
    backgroundColor: COLORS.purple,
  },
  legendDotSignups: {
    backgroundColor: COLORS.cyan,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

export default AffiliateExchangeAdminScreen;
