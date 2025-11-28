/**
 * Gemral - Admin Dashboard Screen
 * Main admin control panel with stats and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  Users,
  CreditCard,
  FileEdit,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalPartners: 0,
    totalUsers: 0,
    totalCommission: 0,
    monthlyRevenue: 0,
    activeAffiliates: 0,
    activeCTVs: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Pending applications
      const { count: apps } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Pending withdrawals
      const { count: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Total partners
      const { count: partners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('partnership_role', 'is', null);

      // Total users
      const { count: users } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active affiliates
      const { count: affiliates } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_role', 'affiliate');

      // Active CTVs
      const { count: ctvs } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_role', 'ctv');

      // Total commission paid
      const { data: commissions } = await supabase
        .from('profiles')
        .select('total_commission')
        .not('total_commission', 'is', null);

      const totalCommission = commissions?.reduce(
        (sum, c) => sum + (parseFloat(c.total_commission) || 0),
        0
      ) || 0;

      // Monthly revenue (this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Try to get monthly orders - table may not exist yet
      let monthlyRevenue = 0;
      try {
        const { data: monthlyOrders, error: ordersError } = await supabase
          .from('shopify_orders')
          .select('total_price')
          .eq('financial_status', 'paid')
          .gte('paid_at', startOfMonth.toISOString());

        if (!ordersError && monthlyOrders) {
          monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
        }
      } catch (orderError) {
        console.warn('[AdminDashboard] shopify_orders table not available:', orderError.message);
      }

      setStats({
        pendingApplications: apps || 0,
        pendingWithdrawals: withdrawals || 0,
        totalPartners: partners || 0,
        totalUsers: users || 0,
        totalCommission,
        monthlyRevenue,
        activeAffiliates: affiliates || 0,
        activeCTVs: ctvs || 0,
      });
    } catch (error) {
      console.error('[AdminDashboard] Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.accessDenied}>
            <ShieldCheck size={64} color={COLORS.error} />
            <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
            <Text style={styles.accessDeniedText}>
              Bạn không có quyền truy cập trang này
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFD700"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <ShieldCheck size={28} color="#FFD700" />
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Quản lý hệ thống Gemral
              </Text>
            </View>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>

          {/* Pending Actions Alert */}
          {(stats.pendingApplications > 0 || stats.pendingWithdrawals > 0) && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>Cần xử lý</Text>
              <View style={styles.alertItems}>
                {stats.pendingApplications > 0 && (
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => navigation.navigate('AdminApplications')}
                  >
                    <FileEdit size={18} color="#FF9800" />
                    <Text style={styles.alertItemText}>
                      {stats.pendingApplications} đơn đăng ký chờ duyệt
                    </Text>
                    <ChevronRight size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
                {stats.pendingWithdrawals > 0 && (
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => navigation.navigate('AdminWithdrawals')}
                  >
                    <CreditCard size={18} color="#4CAF50" />
                    <Text style={styles.alertItemText}>
                      {stats.pendingWithdrawals} yêu cầu rút tiền chờ
                    </Text>
                    <ChevronRight size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Stats Overview */}
          <Text style={styles.sectionTitle}>Tổng Quan</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={28} color="#2196F3" />
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Tổng Users</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={28} color="#FF9800" />
              <Text style={styles.statValue}>{stats.activeAffiliates}</Text>
              <Text style={styles.statLabel}>Affiliates (3%)</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={28} color="#4CAF50" />
              <Text style={styles.statValue}>{stats.activeCTVs}</Text>
              <Text style={styles.statLabel}>CTVs (10-30%)</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={28} color="#9C27B0" />
              <Text style={styles.statValue}>{stats.activeAffiliates + stats.activeCTVs}</Text>
              <Text style={styles.statLabel}>Tổng Đối tác</Text>
            </View>
          </View>

          {/* Financial Stats */}
          <Text style={styles.sectionTitle}>Tài Chính</Text>
          <View style={styles.financialCards}>
            <View style={[styles.financialCard, styles.revenueCard]}>
              <TrendingUp size={32} color="#00BCD4" />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Doanh thu tháng này</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.monthlyRevenue)}
                </Text>
              </View>
            </View>

            <View style={[styles.financialCard, styles.commissionCard]}>
              <DollarSign size={32} color="#FFD700" />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Tổng hoa hồng đã trả</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.totalCommission)}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quản Lý</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminApplications')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
                <FileEdit size={24} color="#FF9800" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Duyệt Đơn Đăng Ký</Text>
                <Text style={styles.actionSubtitle}>
                  {stats.pendingApplications} đơn chờ xử lý
                </Text>
              </View>
              {stats.pendingApplications > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>
                    {stats.pendingApplications}
                  </Text>
                </View>
              )}
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminWithdrawals')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                <CreditCard size={24} color="#4CAF50" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Xử Lý Rút Tiền</Text>
                <Text style={styles.actionSubtitle}>
                  {stats.pendingWithdrawals} yêu cầu chờ
                </Text>
              </View>
              {stats.pendingWithdrawals > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>
                    {stats.pendingWithdrawals}
                  </Text>
                </View>
              )}
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminUsers')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(33, 150, 243, 0.2)' }]}>
                <Users size={24} color="#2196F3" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Quản Lý Users</Text>
                <Text style={styles.actionSubtitle}>
                  Xem & chỉnh sửa thông tin users
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminReports')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(156, 39, 176, 0.2)' }]}>
                <BarChart3 size={24} color="#9C27B0" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Báo Cáo & Thống Kê</Text>
                <Text style={styles.actionSubtitle}>Chi tiết doanh thu & hiệu suất</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#FFF',
    fontSize: 16,
  },

  // Access Denied
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.error,
    marginTop: SPACING.lg,
  },
  accessDeniedText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },

  // Alert Card
  alertCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: SPACING.md,
  },
  alertItems: {
    gap: SPACING.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  alertItemText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Financial Cards
  financialCards: {
    gap: 12,
    marginBottom: SPACING.lg,
  },
  financialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
  },
  revenueCard: {
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  commissionCard: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  financialInfo: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  financialValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },

  // Actions
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default AdminDashboardScreen;
