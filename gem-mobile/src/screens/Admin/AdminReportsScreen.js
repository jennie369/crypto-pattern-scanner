/**
 * Gemral - Admin Reports & Statistics Screen
 * Analytics and reporting for admin
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Shield,
  UserPlus,
  MessageSquare,
  Crown,
  Percent,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const AdminReportsScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d'); // 7d, 30d, 90d, all
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalAffiliates: 0,
    totalCTVs: 0,
    totalCommission: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    tierBreakdown: {
      FREE: 0,
      TIER1: 0,
      TIER2: 0,
      TIER3: 0,
      ADMIN: 0,
    },
    chatbotQueries: 0,
    scannerUsage: 0,
  });

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get affiliates
      const { count: totalAffiliates } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('partnership_type', 'affiliate');

      // Get CTVs
      const { count: totalCTVs } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('partnership_type', 'ctv');

      // Get tier breakdown
      const { data: profiles } = await supabase
        .from('profiles')
        .select('scanner_tier, chatbot_tier, role');

      const tierBreakdown = {
        FREE: 0,
        TIER1: 0,
        TIER2: 0,
        TIER3: 0,
        ADMIN: 0,
      };

      if (profiles) {
        profiles.forEach((p) => {
          const tier = p.scanner_tier || 'FREE';
          if (p.role === 'admin' || tier === 'ADMIN') {
            tierBreakdown.ADMIN++;
          } else if (tierBreakdown[tier] !== undefined) {
            tierBreakdown[tier]++;
          } else {
            tierBreakdown.FREE++;
          }
        });
      }

      // Get withdrawal stats
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('status, amount');

      let pendingWithdrawals = 0;
      let completedWithdrawals = 0;
      let totalCommission = 0;

      if (withdrawals) {
        withdrawals.forEach((w) => {
          if (w.status === 'pending' || w.status === 'approved') {
            pendingWithdrawals += w.amount || 0;
          }
          if (w.status === 'completed') {
            completedWithdrawals += w.amount || 0;
          }
          totalCommission += w.amount || 0;
        });
      }

      // Get chatbot usage
      const { count: chatbotQueries } = await supabase
        .from('chatbot_quota')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalAffiliates: totalAffiliates || 0,
        totalCTVs: totalCTVs || 0,
        totalCommission,
        pendingWithdrawals,
        completedWithdrawals,
        tierBreakdown,
        chatbotQueries: chatbotQueries || 0,
        scannerUsage: 0,
      });
    } catch (error) {
      console.error('[AdminReports] Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
  }, [loadStats]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats Card component
  const StatsCard = ({ icon: Icon, label, value, color, suffix }) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statsValue}>
        {value}
        {suffix && <Text style={styles.statsSuffix}>{suffix}</Text>}
      </Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  // Tier Bar component
  const TierBar = ({ tier, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <View style={styles.tierBar}>
        <View style={styles.tierBarHeader}>
          <Text style={[styles.tierBarLabel, { color }]}>{tier}</Text>
          <Text style={styles.tierBarCount}>
            {count} ({percentage.toFixed(1)}%)
          </Text>
        </View>
        <View style={styles.tierBarTrack}>
          <View
            style={[
              styles.tierBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  // Access denied
  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.accessDenied}>
            <Shield size={64} color={COLORS.error} />
            <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
            <Text style={styles.accessDeniedText}>
              Bạn không có quyền truy cập trang này
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo & Thống kê</Text>
          <TouchableOpacity>
            <Download size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Date Range Filter */}
        <View style={styles.dateRangeContainer}>
          {['7d', '30d', '90d', 'all'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.dateRangeButton,
                dateRange === range && styles.dateRangeButtonActive,
              ]}
              onPress={() => setDateRange(range)}
            >
              <Text
                style={[
                  styles.dateRangeText,
                  dateRange === range && styles.dateRangeTextActive,
                ]}
              >
                {range === '7d'
                  ? '7 ngày'
                  : range === '30d'
                  ? '30 ngày'
                  : range === '90d'
                  ? '90 ngày'
                  : 'Tất cả'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* User Stats */}
            <Text style={styles.sectionTitle}>Người dùng</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                icon={Users}
                label="Tổng Users"
                value={stats.totalUsers}
                color={COLORS.primary}
              />
              <StatsCard
                icon={UserPlus}
                label="Mới tháng này"
                value={stats.newUsersThisMonth}
                color="#4ADE80"
              />
            </View>

            {/* Partnership Stats */}
            <Text style={styles.sectionTitle}>Đối tác</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                icon={Percent}
                label="Affiliates (3%)"
                value={stats.totalAffiliates}
                color="#FFBD59"
              />
              <StatsCard
                icon={Crown}
                label="CTVs (10-30%)"
                value={stats.totalCTVs}
                color="#6A5BFF"
              />
            </View>

            {/* Financial Stats */}
            <Text style={styles.sectionTitle}>Tài chính</Text>
            <View style={styles.financialCard}>
              <View style={styles.financialRow}>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Tổng Commission</Text>
                  <Text style={styles.financialValue}>
                    {formatCurrency(stats.totalCommission)}
                  </Text>
                </View>
              </View>
              <View style={styles.financialRow}>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Chờ rút</Text>
                  <Text style={[styles.financialValue, { color: '#FFBD59' }]}>
                    {formatCurrency(stats.pendingWithdrawals)}
                  </Text>
                </View>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Đã thanh toán</Text>
                  <Text style={[styles.financialValue, { color: '#4ADE80' }]}>
                    {formatCurrency(stats.completedWithdrawals)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tier Breakdown */}
            <Text style={styles.sectionTitle}>Phân bố Tier</Text>
            <View style={styles.tierBreakdownCard}>
              <TierBar
                tier="FREE"
                count={stats.tierBreakdown.FREE}
                total={stats.totalUsers}
                color="#FF6B6B"
              />
              <TierBar
                tier="TIER1"
                count={stats.tierBreakdown.TIER1}
                total={stats.totalUsers}
                color="#FFBD59"
              />
              <TierBar
                tier="TIER2"
                count={stats.tierBreakdown.TIER2}
                total={stats.totalUsers}
                color="#6A5BFF"
              />
              <TierBar
                tier="TIER3"
                count={stats.tierBreakdown.TIER3}
                total={stats.totalUsers}
                color="#FFD700"
              />
              <TierBar
                tier="ADMIN"
                count={stats.tierBreakdown.ADMIN}
                total={stats.totalUsers}
                color="#FF00FF"
              />
            </View>

            {/* Usage Stats */}
            <Text style={styles.sectionTitle}>Sử dụng</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                icon={MessageSquare}
                label="Chatbot Queries"
                value={stats.chatbotQueries}
                color="#4ADE80"
              />
              <StatsCard
                icon={BarChart3}
                label="Scanner Usage"
                value={stats.scannerUsage}
                color="#FFBD59"
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  dateRangeButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateRangeButtonActive: {
    backgroundColor: COLORS.primary + '30',
    borderColor: COLORS.primary,
  },
  dateRangeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  dateRangeTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statsValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statsSuffix: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  statsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  financialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  financialRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  financialValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  tierBreakdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tierBar: {
    marginBottom: SPACING.md,
  },
  tierBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  tierBarLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  tierBarCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  tierBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tierBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  accessDeniedTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  accessDeniedText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default AdminReportsScreen;
