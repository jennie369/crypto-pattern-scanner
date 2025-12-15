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
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionExpirationService from '../../services/subscriptionExpirationService';

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
    // Subscription expiration stats
    expiringToday: 0,
    expiring3Days: 0,
    expiring7Days: 0,
    totalExpiring: 0,
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

          {/* Stats Overview */}
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

          {/* Financial Stats */}
          <Text style={styles.sectionTitle}>Tài Chính</Text>
          <View style={styles.financialCards}>
            <View style={styles.financialCard}>
              <View style={styles.financialIconContainer}>
                <TrendingUp size={18} color={COLORS.gold} />
              </View>
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Doanh thu tháng này</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.monthlyRevenue)}
                </Text>
              </View>
            </View>

            <View style={styles.financialCard}>
              <View style={styles.financialIconContainer}>
                <DollarSign size={18} color={COLORS.gold} />
              </View>
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
              <View style={styles.actionIcon}>
                <FileEdit size={18} color={COLORS.gold} />
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
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminWithdrawals')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <CreditCard size={18} color={COLORS.gold} />
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
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminUsers')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Users size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Quản Lý Users</Text>
                <Text style={styles.actionSubtitle}>
                  Xem & chỉnh sửa thông tin users
                </Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminReports')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <BarChart3 size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Báo Cáo & Thống Kê</Text>
                <Text style={styles.actionSubtitle}>Chi tiết doanh thu & hiệu suất</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminNotifications')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Bell size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Gửi Thông Báo</Text>
                <Text style={styles.actionSubtitle}>Thông báo hệ thống đến users</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSponsorBanners')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <ImageIcon size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Quản Lý Banner</Text>
                <Text style={styles.actionSubtitle}>Banner quảng cáo Portfolio</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content Hub & Push Notifications Section */}
          <Text style={styles.sectionTitle}>Content Hub & Push</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ContentDashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <LayoutDashboard size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Content Hub</Text>
                <Text style={styles.actionSubtitle}>Dashboard tổng quan nội dung</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('PushEditor')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <BellRing size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Tạo Push Notification</Text>
                <Text style={styles.actionSubtitle}>Gửi thông báo đẩy đến users</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('TemplateLibrary')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <FileText size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Thư Viện Templates</Text>
                <Text style={styles.actionSubtitle}>Push & Post templates</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ContentAnalytics')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <PieChart size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Analytics</Text>
                <Text style={styles.actionSubtitle}>Thống kê push & content</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Auto-Post & Content Calendar Section */}
          <Text style={styles.sectionTitle}>Nội Dung & Auto-Post</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ContentCalendar')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Calendar size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Lịch Nội Dung</Text>
                <Text style={styles.actionSubtitle}>Quản lý & lên lịch bài đăng</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AutoPostLogs')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Send size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Nhật Ký Auto-Post</Text>
                <Text style={styles.actionSubtitle}>Theo dõi đăng bài tự động</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('PlatformSettings')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Settings2 size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Kết Nối Nền Tảng</Text>
                <Text style={styles.actionSubtitle}>Facebook, TikTok, YouTube...</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Seed Content & AI Bot Section */}
          <Text style={styles.sectionTitle}>Seed Content & AI Bot</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSeedContent')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Bot size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Quản Lý Seed Content</Text>
                <Text style={styles.actionSubtitle}>Users, posts, AI bot 24/7</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Gift Catalog Section */}
          <Text style={styles.sectionTitle}>Quản lý Quà tặng</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminGiftCatalog')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Gift size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Danh mục quà</Text>
                <Text style={styles.actionSubtitle}>Thêm, sửa, xóa quà tặng</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Subscription Expiration Section */}
          <Text style={styles.sectionTitle}>Quản Lý Subscription</Text>

          {/* Expiring Alert Card */}
          {stats.totalExpiring > 0 && (
            <View style={[styles.alertCard, { borderLeftWidth: 3, borderLeftColor: COLORS.gold }]}>
              <View style={styles.alertItems}>
                <TouchableOpacity
                  style={styles.alertItem}
                  onPress={() => navigation.navigate('AdminExpiringUsers')}
                >
                  <Clock size={18} color={COLORS.gold} />
                  <Text style={styles.alertItemText}>
                    {stats.totalExpiring} subscriptions sắp hết hạn (7 ngày)
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

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminExpiringUsers')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Clock size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Users Sắp Hết Hạn</Text>
                <Text style={styles.actionSubtitle}>
                  Xem & gia hạn subscription users
                </Text>
              </View>
              {stats.totalExpiring > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>
                    {stats.totalExpiring}
                  </Text>
                </View>
              )}
              <ChevronRight size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminExpirationLogs')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <History size={18} color={COLORS.gold} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Lịch Sử Revoke</Text>
                <Text style={styles.actionSubtitle}>
                  Xem subscriptions đã bị hủy
                </Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
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
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
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

  // Financial Cards
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

  // Actions
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
