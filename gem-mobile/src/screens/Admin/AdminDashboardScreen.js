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
  Bell,
  Calendar,
  Send,
  Settings2,
  Image as ImageIcon,
  Bot,
  Gift,
  LayoutDashboard,
  BellRing,
  FileText,
  PieChart,
  Clock,
  History,
  ShoppingBag,
  Star,
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionExpirationService from '../../services/subscriptionExpirationService';

const AdminDashboardScreen = ({ navigation }) => {
  const { isAdmin, isManager } = useAuth();

  // Manager can access admin dashboard but with limited sections
  const hasAdminAccess = isAdmin || isManager;
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
    // Subscription expiration stats
    expiringToday: 0,
    expiring3Days: 0,
    expiring7Days: 0,
    totalExpiring: 0,
  });

  useEffect(() => {
    if (hasAdminAccess) {
      loadStats();
    }
  }, [hasAdminAccess]);

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

      // Get expiring subscriptions count
      let expiringStats = {
        expiringToday: 0,
        expiring3Days: 0,
        expiring7Days: 0,
        totalExpiring: 0,
      };
      try {
        const expiringResult = await subscriptionExpirationService.getExpiringUsersCount(7);
        if (expiringResult.success && expiringResult.data) {
          expiringStats = {
            expiringToday: expiringResult.data.expiring_today || 0,
            expiring3Days: expiringResult.data.expiring_3_days || 0,
            expiring7Days: expiringResult.data.expiring_7_days || 0,
            totalExpiring: expiringResult.data.total_expiring || 0,
          };
        }
      } catch (expiringError) {
        console.warn('[AdminDashboard] Expiring users stats not available:', expiringError.message);
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
        // Expiration stats
        ...expiringStats,
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

  // Redirect if not admin or manager
  if (!hasAdminAccess) {
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
          <ActivityIndicator size="large" color={COLORS.gold} />
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
              tintColor={COLORS.gold}
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
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <ShieldCheck size={28} color={COLORS.gold} />
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Quản lý hệ thống Gemral
              </Text>
            </View>
            <View style={[styles.adminBadge, isManager && styles.managerBadge]}>
              <Text style={[styles.adminBadgeText, isManager && styles.managerBadgeText]}>{isAdmin ? 'ADMIN' : 'MANAGER'}</Text>
            </View>
          </View>

          {/* Pending Actions Alert - ADMIN ONLY */}
          {isAdmin && (stats.pendingApplications > 0 || stats.pendingWithdrawals > 0) && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>Cần xử lý</Text>
              <View style={styles.alertItems}>
                {stats.pendingApplications > 0 && (
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => navigation.navigate('AdminApplications')}
                  >
                    <FileEdit size={18} color={COLORS.gold} />
                    <Text style={styles.alertItemText}>
                      {stats.pendingApplications} đơn đăng ký chờ duyệt
                    </Text>
                    <ChevronRight size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
                {stats.pendingWithdrawals > 0 && (
                  <TouchableOpacity
                    style={styles.alertItem}
                    onPress={() => navigation.navigate('AdminWithdrawals')}
                  >
                    <CreditCard size={18} color={COLORS.gold} />
                    <Text style={styles.alertItemText}>
                      {stats.pendingWithdrawals} yêu cầu rút tiền chờ
                    </Text>
                    <ChevronRight size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Stats Overview - ADMIN ONLY */}
          {isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Tổng Quan</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Users size={20} color={COLORS.gold} />
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>Tổng Users</Text>
                </View>

                <View style={styles.statCard}>
                  <Users size={20} color={COLORS.gold} />
                  <Text style={styles.statValue}>{stats.activeAffiliates}</Text>
                  <Text style={styles.statLabel}>Affiliates (3%)</Text>
                </View>

                <View style={styles.statCard}>
                  <Users size={20} color={COLORS.gold} />
                  <Text style={styles.statValue}>{stats.activeCTVs}</Text>
                  <Text style={styles.statLabel}>CTVs (10-30%)</Text>
                </View>

                <View style={styles.statCard}>
                  <Users size={20} color={COLORS.gold} />
                  <Text style={styles.statValue}>{stats.activeAffiliates + stats.activeCTVs}</Text>
                  <Text style={styles.statLabel}>Tổng Đối tác</Text>
                </View>
              </View>

              {/* Financial Stats - Side by side */}
              <Text style={styles.sectionTitle}>Tài Chính</Text>
              <View style={styles.financialRow}>
                <View style={styles.financialCardCompact}>
                  <TrendingUp size={20} color={COLORS.gold} />
                  <Text style={styles.financialValueCompact}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </Text>
                  <Text style={styles.financialLabelCompact}>Doanh thu tháng</Text>
                </View>

                <View style={styles.financialCardCompact}>
                  <DollarSign size={20} color={COLORS.gold} />
                  <Text style={styles.financialValueCompact}>
                    {formatCurrency(stats.totalCommission)}
                  </Text>
                  <Text style={styles.financialLabelCompact}>Hoa hồng đã trả</Text>
                </View>
              </View>
            </>
          )}

          {/* ========== QUICK ACTIONS GRID - ADMIN ONLY ========== */}
          {isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Quản Lý Chính</Text>
              <View style={styles.gridContainer}>
                {/* Duyệt Đơn */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminApplications')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <FileEdit size={22} color={COLORS.gold} />
                    {stats.pendingApplications > 0 && (
                      <View style={styles.gridBadge}>
                        <Text style={styles.gridBadgeText}>{stats.pendingApplications}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gridTitle}>Duyệt Đơn</Text>
                  <Text style={styles.gridSubtitle}>{stats.pendingApplications} chờ</Text>
                </TouchableOpacity>

                {/* Rút Tiền */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminWithdrawals')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <CreditCard size={22} color={COLORS.gold} />
                    {stats.pendingWithdrawals > 0 && (
                      <View style={styles.gridBadge}>
                        <Text style={styles.gridBadgeText}>{stats.pendingWithdrawals}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gridTitle}>Rút Tiền</Text>
                  <Text style={styles.gridSubtitle}>{stats.pendingWithdrawals} chờ</Text>
                </TouchableOpacity>

                {/* Quản Lý Users */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminUsers')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Users size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Users</Text>
                  <Text style={styles.gridSubtitle}>{stats.totalUsers} users</Text>
                </TouchableOpacity>

                {/* Báo Cáo */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminReports')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <BarChart3 size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Báo Cáo</Text>
                  <Text style={styles.gridSubtitle}>Thống kê</Text>
                </TouchableOpacity>

                {/* Thông Báo */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminNotifications')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Bell size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Thông Báo</Text>
                  <Text style={styles.gridSubtitle}>Gửi notify</Text>
                </TouchableOpacity>

                {/* Upgrade */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminUpgrade')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <TrendingUp size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Upgrade</Text>
                  <Text style={styles.gridSubtitle}>Tiers & Plan</Text>
                </TouchableOpacity>

                {/* Waitlist Leads */}
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('WaitlistLeads')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Send size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Waitlist</Text>
                  <Text style={styles.gridSubtitle}>Landing Leads</Text>
                </TouchableOpacity>
              </View>

              {/* ========== BANNERS & DISPLAY - ADMIN ONLY ========== */}
              <Text style={styles.sectionTitle}>Banners & Hiển Thị</Text>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminSponsorBanners')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <ImageIcon size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Portfolio</Text>
                  <Text style={styles.gridSubtitle}>Banner QC</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminShopBanners')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <ShoppingBag size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Shop</Text>
                  <Text style={styles.gridSubtitle}>Carousel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminCourseHighlights')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Star size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Courses</Text>
                  <Text style={styles.gridSubtitle}>Nổi bật</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminGiftCatalog')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Gift size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Quà Tặng</Text>
                  <Text style={styles.gridSubtitle}>Catalog</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ========== CONTENT HUB ========== */}
          <Text style={styles.sectionTitle}>Content Hub & Push</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('ContentDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <LayoutDashboard size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Hub</Text>
              <Text style={styles.gridSubtitle}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('PushEditor')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <BellRing size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Push</Text>
              <Text style={styles.gridSubtitle}>Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('TemplateLibrary')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <FileText size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Templates</Text>
              <Text style={styles.gridSubtitle}>Thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('ContentAnalytics')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <PieChart size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Analytics</Text>
              <Text style={styles.gridSubtitle}>Thống kê</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('ContentCalendar')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <Calendar size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Calendar</Text>
              <Text style={styles.gridSubtitle}>Lịch đăng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('AutoPostLogs')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <Send size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Auto-Post</Text>
              <Text style={styles.gridSubtitle}>Nhật ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('PlatformSettings')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <Settings2 size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Platforms</Text>
              <Text style={styles.gridSubtitle}>Kết nối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('AdminSeedContent')}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <Bot size={22} color={COLORS.gold} />
              </View>
              <Text style={styles.gridTitle}>Seed</Text>
              <Text style={styles.gridSubtitle}>AI Bot</Text>
            </TouchableOpacity>
          </View>

          {/* ========== SUBSCRIPTION SECTION - ADMIN ONLY ========== */}
          {isAdmin && (
            <>
              <Text style={styles.sectionTitle}>Subscription</Text>

              {/* Expiring Alert */}
              {stats.totalExpiring > 0 && (
                <View style={[styles.alertCard, { borderLeftWidth: 3, borderLeftColor: COLORS.gold }]}>
                  <View style={styles.alertItems}>
                    <TouchableOpacity
                      style={styles.alertItem}
                      onPress={() => navigation.navigate('AdminExpiringUsers')}
                    >
                      <Clock size={18} color={COLORS.gold} />
                      <Text style={styles.alertItemText}>
                        {stats.totalExpiring} sắp hết hạn (7 ngày)
                      </Text>
                      <ChevronRight size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    {stats.expiringToday > 0 && (
                      <View style={[styles.alertItem, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
                        <Clock size={18} color={COLORS.error} />
                        <Text style={[styles.alertItemText, { color: COLORS.error }]}>
                          {stats.expiringToday} hết hạn HÔM NAY!
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminExpiringUsers')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <Clock size={22} color={COLORS.gold} />
                    {stats.totalExpiring > 0 && (
                      <View style={styles.gridBadge}>
                        <Text style={styles.gridBadgeText}>{stats.totalExpiring}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gridTitle}>Hết Hạn</Text>
                  <Text style={styles.gridSubtitle}>Gia hạn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('AdminExpirationLogs')}
                  activeOpacity={0.8}
                >
                  <View style={styles.gridIconWrapper}>
                    <History size={22} color={COLORS.gold} />
                  </View>
                  <Text style={styles.gridTitle}>Revoke</Text>
                  <Text style={styles.gridSubtitle}>Lịch sử</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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
    paddingBottom: CONTENT_BOTTOM_PADDING + 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textPrimary,
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
    color: COLORS.gold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  managerBadge: {
    backgroundColor: '#3B82F6', // Blue for Manager
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  managerBadgeText: {
    color: '#FFF', // White text for Manager badge
  },

  // Alert Card
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  alertItems: {
    gap: SPACING.xs,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: SPACING.sm,
    borderRadius: 10,
  },
  alertItemText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Financial Cards - Compact Row
  financialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  financialCardCompact: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  financialValueCompact: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  financialLabelCompact: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  // Legacy financial styles (kept for compatibility)
  financialCards: {
    gap: 8,
    marginBottom: SPACING.sm,
  },
  financialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  financialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialInfo: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  // Grid Layout (NEW - Compact 3-column grid)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  gridCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  gridBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.burgundy,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  gridBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  gridSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },

  // Actions (Legacy - kept for compatibility)
  actionsContainer: {
    gap: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: SPACING.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  actionBadge: {
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: SPACING.xs,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default AdminDashboardScreen;
