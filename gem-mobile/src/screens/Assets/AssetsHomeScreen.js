/**
 * Gemral - Assets Home Screen
 * Main hub for user assets management
 * Uses design tokens from tokens.js
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  Gem,
  Wallet,
  DollarSign,
  Link2,
  TrendingUp,
  Rocket,
  BarChart3,
  Music,
  Settings,
  ChevronRight,
  ShoppingBag,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Shield,
  Users,
  FileText,
  CreditCard,
} from 'lucide-react-native';

import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import AffiliateSection from '../tabs/components/AffiliateSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AssetsHomeScreen = () => {
  const navigation = useNavigation();
  const { user, profile, isAdmin } = useAuth();

  const [stats, setStats] = useState({
    gems: 0,
    earnings: 0,
    affiliate: 0,
    followers: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user stats
      const { data: profileData } = await supabase
        .from('profiles')
        .select('gems, scanner_tier, followers_count')
        .eq('id', user.id)
        .single();

      // Load earnings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: earnings } = await supabase
        .from('gems_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'earning')
        .gte('created_at', startOfMonth.toISOString());

      const totalEarnings = earnings?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Load affiliate commission
      const { data: affiliate } = await supabase
        .from('affiliate_sales')
        .select('commission')
        .eq('partner_id', user.id)
        .eq('status', 'confirmed');

      const totalAffiliate = affiliate?.reduce((sum, s) => sum + s.commission, 0) || 0;

      // Load recent activity
      const { data: activity } = await supabase
        .from('gems_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        gems: profileData?.gems || 0,
        earnings: totalEarnings * 200, // Convert Gems to VND (1 Gem = 200 VND)
        affiliate: totalAffiliate,
        followers: profileData?.followers_count || 0,
      });

      setRecentActivity(activity || []);
    } catch (error) {
      console.error('[AssetsHome] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [user?.id]);

  const getTierLabel = () => {
    const tier = profile?.scanner_tier || 'FREE';
    return tier.replace('_', ' ');
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Tài Sản Của Tôi</Text>
              <Text style={styles.headerSubtitle}>
                Tier: {getTierLabel()} • {stats.followers} Followers
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <Settings size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* ⚡ ADMIN DASHBOARD SECTION - FIRST POSITION */}
          {/* ═══════════════════════════════════════════ */}
          {isAdmin && (
            <View style={styles.adminSection}>
              <View style={styles.adminHeader}>
                <Shield size={20} color="#FF00FF" />
                <Text style={styles.adminHeaderText}>ADMIN PANEL</Text>
              </View>

              {/* Main Admin Dashboard Button */}
              <TouchableOpacity
                style={styles.adminMainButton}
                onPress={() => navigation.navigate('AdminDashboard')}
                activeOpacity={0.8}
              >
                <View style={styles.adminButtonContent}>
                  <Settings size={20} color="#FFF" />
                  <Text style={styles.adminButtonText}>Quản Lý Hệ Thống</Text>
                </View>
                <ChevronRight size={20} color="#FFF" />
              </TouchableOpacity>

              {/* Quick Admin Actions */}
              <View style={styles.adminQuickActions}>
                <TouchableOpacity
                  style={styles.adminQuickBtn}
                  onPress={() => navigation.navigate('AdminApplications')}
                >
                  <FileText size={18} color={COLORS.gold} />
                  <Text style={styles.adminQuickText}>Đơn đăng ký</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adminQuickBtn}
                  onPress={() => navigation.navigate('AdminWithdrawals')}
                >
                  <CreditCard size={18} color={COLORS.success} />
                  <Text style={styles.adminQuickText}>Rút tiền</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adminQuickBtn}
                  onPress={() => navigation.navigate('AdminUsers')}
                >
                  <Users size={18} color={COLORS.info} />
                  <Text style={styles.adminQuickText}>Users</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <StatCard
              icon={<Gem size={24} color={COLORS.gold} />}
              label="Gems"
              value={stats.gems.toLocaleString()}
              subtitle={`~ ${(stats.gems * 200).toLocaleString()}d`}
              color={COLORS.gold}
            />
            <StatCard
              icon={<DollarSign size={24} color={COLORS.success} />}
              label="Thu nhập"
              value={`${(stats.earnings / 1000).toFixed(0)}K`}
              subtitle="Tháng này"
              color={COLORS.success}
            />
            <StatCard
              icon={<Link2 size={24} color={COLORS.info} />}
              label="Affiliate"
              value={`${(stats.affiliate / 1000).toFixed(0)}K`}
              subtitle="Hoa hồng"
              color={COLORS.info}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quản lý tài sản</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon={<Gem size={24} color={COLORS.gold} />}
              title="Ví Gems"
              subtitle="Mua & quản lý"
              onPress={() => navigation.navigate('Wallet')}
              iconBg="rgba(255, 189, 89, 0.15)"
            />
            <ActionCard
              icon={<DollarSign size={24} color={COLORS.success} />}
              title="Thu Nhập"
              subtitle="Xem & rút tiền"
              onPress={() => navigation.navigate('Earnings')}
              iconBg="rgba(58, 247, 166, 0.15)"
            />
            <ActionCard
              icon={<TrendingUp size={24} color={COLORS.purple} />}
              title="Giao Dịch"
              subtitle="Lịch sử chi tiêu"
              onPress={() => navigation.navigate('EarningsHistory')}
              iconBg="rgba(106, 91, 255, 0.15)"
            />
            <ActionCard
              icon={<Rocket size={24} color="#EC4899" />}
              title="Boost"
              subtitle="Quảng cáo bài"
              onPress={() => navigation.navigate('BoostedPosts')}
              iconBg="rgba(236, 72, 153, 0.15)"
            />
{/* Affiliate card removed - Use AffiliateSection below for proper flow */}
            <ActionCard
              icon={<BarChart3 size={24} color="#8B5CF6" />}
              title="Portfolio"
              subtitle="Thống kê"
              onPress={() => navigation.navigate('Portfolio')}
              iconBg="rgba(139, 92, 246, 0.15)"
            />
            <ActionCard
              icon={<Music size={24} color="#F59E0B" />}
              title="Âm Thanh"
              subtitle="Thư viện"
              onPress={() => navigation.navigate('SoundLibrary')}
              iconBg="rgba(245, 158, 11, 0.15)"
            />
            <ActionCard
              icon={<Settings size={24} color={COLORS.textMuted} />}
              title="Cài Đặt"
              subtitle="Tài khoản"
              onPress={() => navigation.navigate('ProfileSettings')}
              iconBg="rgba(107, 114, 128, 0.15)"
            />
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* AFFILIATE SECTION - Proper 4-scenario flow */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.affiliateSectionContainer}>
            <AffiliateSection user={user} navigation={navigation} />
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <ActivityItem key={item.id || index} activity={item} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Clock size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
              </View>
            )}
          </View>

          {/* Upgrade CTA (for FREE users) */}
          {profile?.scanner_tier === 'FREE' && (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => navigation.navigate('Shop', { screen: 'Pricing' })}
            >
              <View style={styles.upgradeIconContainer}>
                <Star size={28} color={COLORS.gold} fill={COLORS.gold} />
              </View>
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Nâng cấp lên TIER 1</Text>
                <Text style={styles.upgradeSubtitle}>
                  Mở khóa thêm nhiều tính năng • Chỉ từ 11M VND
                </Text>
              </View>
              <ChevronRight size={24} color={COLORS.gold} />
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ============ SUB COMPONENTS ============

const StatCard = ({ icon, label, value, subtitle, color }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>{icon}</View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
);

const ActionCard = ({ icon, title, subtitle, onPress, iconBg }) => (
  <TouchableOpacity
    style={styles.actionCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.actionIconContainer, { backgroundColor: iconBg }]}>
      {icon}
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ activity }) => {
  const getActivityDetails = () => {
    switch (activity.type) {
      case 'purchase':
        return {
          icon: <ShoppingBag size={20} color={COLORS.success} />,
          title: 'Mua Gems',
          amount: `+${activity.amount}`,
          color: COLORS.success,
        };
      case 'gift':
        return {
          icon: <Gift size={20} color={COLORS.error} />,
          title: 'Tặng Gift',
          amount: `-${activity.amount}`,
          color: COLORS.error,
        };
      case 'boost':
        return {
          icon: <Rocket size={20} color={COLORS.warning} />,
          title: 'Boost bài viết',
          amount: `-${activity.amount}`,
          color: COLORS.warning,
        };
      case 'earning':
        return {
          icon: <ArrowUpRight size={20} color={COLORS.success} />,
          title: 'Nhận Gift',
          amount: `+${activity.amount}`,
          color: COLORS.success,
        };
      default:
        return {
          icon: <Gem size={20} color={COLORS.textMuted} />,
          title: 'Giao dịch',
          amount: activity.amount,
          color: COLORS.textMuted,
        };
    }
  };

  const details = getActivityDetails();
  const timeAgo = getTimeAgo(new Date(activity.created_at));

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>{details.icon}</View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle}>{details.title}</Text>
        <Text style={styles.activityTime}>{timeAgo}</Text>
      </View>
      <Text style={[styles.activityAmount, { color: details.color }]}>
        {details.amount} Gems
      </Text>
    </View>
  );
};

// Helper function
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// ============ STYLES ============

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
    paddingBottom: SPACING.huge,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statIconContainer: {
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSubtle,
  },

  // Section Title
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionCard: {
    width: (SCREEN_WIDTH - SPACING.md * 3) / 2,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  actionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Recent Activity
  activitySection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  activityAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },

  // Upgrade CTA
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
    borderRadius: GLASS.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  upgradeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  upgradeSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },

  // Admin Section styles
  adminSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 0, 255, 0.08)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 255, 0.4)',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  adminHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FF00FF',
    letterSpacing: 2,
  },
  adminMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adminButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  adminQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  adminQuickBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
  },
  adminQuickText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Affiliate Section Container
  affiliateSectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default AssetsHomeScreen;
