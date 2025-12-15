/**
 * Gemral - Account Screen (Tài Sản)
 * Complete profile + Orders + Affiliate + Portfolio + Settings
 *
 * UI Style merged from AssetsHomeScreen:
 * - Stats Cards (Gems, Thu nhập, Affiliate)
 * - Admin Panel with Magenta theme
 * - Action Cards Grid
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Package,
  Share2,
  Wallet,
  HelpCircle,
  FileText,
  LogOut,
  Bell,
  Lock,
  Camera,
  Edit2,
  Copy,
  ExternalLink,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Plus,
  LayoutDashboard,
  ShieldCheck,
  Users,
  CreditCard,
  BarChart3,
  FileEdit,
  Gem,
  DollarSign,
  Music,
  Zap,
  Shield,
  UserCheck,
  Bookmark,
  Link2,
  Rocket,
  Clock,
  Star,
  ArrowUpRight,
  ShoppingBag,
  Gift,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services/forumService';
import { signOut, supabase } from '../../services/supabase';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import AffiliateSection from './components/AffiliateSection';

// Dashboard Widget Components (Day 17-19)
import {
  GoalTrackingCard,
  AffirmationCard,
  ActionChecklistCard,
  StatsWidget,
} from '../../components/GemMaster';
import widgetManagementService from '../../services/widgetManagementService';

export default function AccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, profile: authProfile, isAdmin } = useAuth();
  const scrollViewRef = useRef(null);
  const dashboardSectionRef = useRef(null);

  // State
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Dashboard Widgets State (Day 17-19)
  const [widgets, setWidgets] = useState([]);
  const [isWidgetSectionCollapsed, setIsWidgetSectionCollapsed] = useState(false);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);

  // Admin Stats State
  const [adminStats, setAdminStats] = useState({
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalPartners: 0,
    totalUsers: 0,
  });

  // Assets Stats State (from AssetsHomeScreen)
  const [assetStats, setAssetStats] = useState({
    gems: 0,
    earnings: 0,
    affiliate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Deep link / Notification State (Day 20-22)
  const [highlightedWidgetId, setHighlightedWidgetId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadData();
        loadUserWidgets();
        // Load admin stats if user is admin
        if (isAdmin) {
          loadAdminStats();
        }
      } else {
        setLoading(false);
        setIsLoadingWidgets(false);
      }
    }, [user?.id, isAdmin])
  );

  // Handle deep link from notification (scroll to widget, expand dashboard, show confetti)
  useEffect(() => {
    const params = route.params;
    if (!params) return;

    // Handle expandDashboard
    if (params.expandDashboard) {
      setIsWidgetSectionCollapsed(false);
    }

    // Handle scrollToWidget
    if (params.scrollToWidget) {
      handleDeepLinkToWidget(params.scrollToWidget);
    }

    // Handle showConfetti (for milestone celebrations)
    if (params.showConfetti) {
      setShowConfetti(true);
      // Fire confetti after a short delay
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }, 500);
      // Auto-hide confetti state after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }

    // Clear params after handling
    if (params.scrollToWidget || params.expandDashboard || params.showConfetti) {
      navigation.setParams({
        scrollToWidget: undefined,
        expandDashboard: undefined,
        showConfetti: undefined,
      });
    }
  }, [route.params?.scrollToWidget, route.params?.expandDashboard, route.params?.showConfetti]);

  const loadData = async () => {
    try {
      // Load profile info
      const profileData = await forumService.getUserProfile(user.id);
      setProfile(profileData || authProfile);

      // Load stats
      const userStats = await forumService.getUserStats(user.id);
      setStats(userStats);

      // Load asset stats (from AssetsHomeScreen)
      await loadAssetStats();
    } catch (error) {
      console.error('[Account] Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load asset statistics (merged from AssetsHomeScreen)
  const loadAssetStats = async () => {
    try {
      // Load user gems from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('gems')
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

      setAssetStats({
        gems: profileData?.gems || 0,
        earnings: totalEarnings * 200, // Convert Gems to VND
        affiliate: totalAffiliate,
      });

      setRecentActivity(activity || []);
    } catch (error) {
      console.error('[Account] Load asset stats error:', error);
    }
  };

  // ⚡ Load Admin Stats
  const loadAdminStats = async () => {
    try {
      // Pending partnership applications
      const { count: pendingApps } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Pending withdrawal requests
      const { count: pendingWithdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Total partners
      const { count: totalPartners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('partnership_role', 'is', null);

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setAdminStats({
        pendingApplications: pendingApps || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        totalPartners: totalPartners || 0,
        totalUsers: totalUsers || 0,
      });

      console.log('[Account] Admin stats loaded:', {
        pendingApps,
        pendingWithdrawals,
        totalPartners,
        totalUsers
      });
    } catch (error) {
      console.error('[Account] Load admin stats error:', error);
    }
  };

  // Load user widgets (Day 17-19)
  const loadUserWidgets = async () => {
    try {
      setIsLoadingWidgets(true);
      const userWidgets = await widgetManagementService.getUserWidgets(user.id);
      setWidgets(userWidgets);

      // Auto-collapse if >3 widgets
      const savedPreference = await AsyncStorage.getItem('dashboard_collapsed');
      if (savedPreference !== null) {
        setIsWidgetSectionCollapsed(savedPreference === 'true');
      } else {
        setIsWidgetSectionCollapsed(userWidgets.length > 3);
      }
    } catch (error) {
      console.error('[Account] Load widgets error:', error);
    } finally {
      setIsLoadingWidgets(false);
    }
  };

  // Handle deep link to widget
  const handleDeepLinkToWidget = async (widgetId) => {
    // Expand dashboard section
    setIsWidgetSectionCollapsed(false);

    // Set highlighted widget
    setHighlightedWidgetId(widgetId);

    // Wait for render then scroll
    setTimeout(() => {
      if (dashboardSectionRef.current && scrollViewRef.current) {
        dashboardSectionRef.current.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({
              y: y - 20,
              animated: true,
            });
          },
          () => console.warn('[Account] measureLayout failed')
        );
      }
    }, 300);

    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedWidgetId(null);
    }, 3000);
  };

  // Toggle dashboard section collapse
  const toggleDashboardSection = async () => {
    const newState = !isWidgetSectionCollapsed;
    setIsWidgetSectionCollapsed(newState);
    await AsyncStorage.setItem('dashboard_collapsed', newState.toString());
  };

  // Navigate to GemMaster to create new goals
  // Shows choice: Manual add or Ask Gemral
  const navigateToGemMaster = () => {
    Alert.alert(
      'Thêm Mục Tiêu Mới',
      'Bạn muốn tạo mục tiêu như thế nào?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: '✍️ Tự nhập',
          onPress: () => {
            // TODO: Show manual goal creation modal
            Alert.alert('Coming Soon', 'Tính năng tự nhập mục tiêu sẽ sớm có mặt!');
          }
        },
        {
          text: '🤖 Hỏi Gemral',
          onPress: () => {
            navigation.navigate('GemMaster', {
              initialPrompt: 'Tôi muốn đặt mục tiêu mới. Hãy giúp tôi xác định mục tiêu rõ ràng.'
            });
          }
        }
      ]
    );
  };

  // Render widget based on type
  const renderWidget = (widget) => {
    const isHighlighted = highlightedWidgetId === widget.id;

    // Wrapper with highlight effect
    const WidgetWrapper = ({ children }) => (
      <View
        style={[
          styles.widgetWrapper,
          isHighlighted && styles.widgetHighlighted,
        ]}
      >
        {children}
      </View>
    );

    switch (widget.type) {
      case 'GOAL_CARD':
        return (
          <WidgetWrapper key={widget.id}>
            <GoalTrackingCard
              widget={widget}
              onUpdate={loadUserWidgets}
              isHighlighted={isHighlighted}
            />
          </WidgetWrapper>
        );
      case 'AFFIRMATION_CARD':
        return (
          <WidgetWrapper key={widget.id}>
            <AffirmationCard
              widget={widget}
              onComplete={loadUserWidgets}
              isHighlighted={isHighlighted}
            />
          </WidgetWrapper>
        );
      case 'ACTION_CHECKLIST':
        return (
          <WidgetWrapper key={widget.id}>
            <ActionChecklistCard
              widget={widget}
              onTaskToggle={loadUserWidgets}
              isHighlighted={isHighlighted}
            />
          </WidgetWrapper>
        );
      case 'STATS_WIDGET':
        return (
          <WidgetWrapper key={widget.id}>
            <StatsWidget
              widget={widget}
              userId={user?.id}
              isHighlighted={isHighlighted}
            />
          </WidgetWrapper>
        );
      default:
        return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const promises = [loadData(), loadUserWidgets()];
    if (isAdmin) {
      promises.push(loadAdminStats());
    }
    await Promise.all(promises);
    setRefreshing(false);
  };

  // ⚡ RENDER ADMIN DASHBOARD SECTION - MAGENTA THEME
  const renderAdminDashboard = () => {
    if (!isAdmin) {
      return null;
    }

    return (
      <View style={styles.adminSection}>
        {/* Admin Header */}
        <View style={styles.adminHeader}>
          <Shield size={20} color="#FF00FF" />
          <Text style={styles.adminHeaderText}>ADMIN PANEL</Text>
        </View>

        {/* Main Dashboard Button */}
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

        {/* Quick Actions Row 1 */}
        <View style={styles.adminQuickActions}>
          <TouchableOpacity
            style={styles.adminQuickBtn}
            onPress={() => navigation.navigate('AdminApplications')}
          >
            <FileText size={18} color={COLORS.gold} />
            <Text style={styles.adminQuickText}>Đơn đăng ký</Text>
            {adminStats.pendingApplications > 0 && (
              <View style={styles.adminBadgeCount}>
                <Text style={styles.adminBadgeCountText}>{adminStats.pendingApplications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminQuickBtn}
            onPress={() => navigation.navigate('AdminWithdrawals')}
          >
            <CreditCard size={18} color={COLORS.success} />
            <Text style={styles.adminQuickText}>Rút tiền</Text>
            {adminStats.pendingWithdrawals > 0 && (
              <View style={styles.adminBadgeCount}>
                <Text style={styles.adminBadgeCountText}>{adminStats.pendingWithdrawals}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminQuickBtn}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Users size={18} color={COLORS.info} />
            <Text style={styles.adminQuickText}>Users</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row 2 - Course Management */}
        <View style={styles.adminQuickActions}>
          <TouchableOpacity
            style={[styles.adminQuickBtn, styles.adminQuickBtnWide]}
            onPress={() => navigation.navigate('AdminCourses')}
          >
            <GraduationCap size={18} color="#A855F7" />
            <Text style={styles.adminQuickText}>Quản lý khóa học</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminQuickBtn, styles.adminQuickBtnWide]}
            onPress={() => navigation.navigate('GrantAccess')}
          >
            <UserCheck size={18} color="#10B981" />
            <Text style={styles.adminQuickText}>Cấp quyền truy cập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        },
      ]
    );
  };

  const copyReferralCode = async () => {
    try {
      const code = user?.referral_code || 'GEM' + (user?.id?.slice(0, 6) || '').toUpperCase();
      await Clipboard.setStringAsync(code);
      Alert.alert('✅ Thành công', `Đã sao chép mã giới thiệu: ${code}`);
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể sao chép mã giới thiệu');
    }
  };

  const handleProfileSave = (updatedProfile) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  // Not logged in state
  if (!user) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.notLoggedIn}>
            <User size={60} color={COLORS.textMuted} />
            <Text style={styles.notLoggedInTitle}>Chưa đăng nhập</Text>
            <Text style={styles.notLoggedInText}>
              Đăng nhập để quản lý tài khoản của bạn
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <LinearGradient
                colors={GRADIENTS.primaryButton}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </LinearGradient>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const username = profile?.username || user?.email?.split('@')[0] || '';
  const bio = profile?.bio || 'Chưa có tiểu sử';
  const avatarUrl = profile?.avatar_url;

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
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
          {/* ═══════════════════════════════════════════ */}
          {/* PROFILE HEADER */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setEditModalVisible(true)}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={GRADIENTS.avatar} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.cameraButton}>
                <Camera size={14} color={COLORS.textPrimary} />
              </View>
            </TouchableOpacity>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{displayName}</Text>
              {username && <Text style={styles.username}>@{username}</Text>}
              <Text style={styles.bio} numberOfLines={2}>{bio}</Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit2 size={16} color={COLORS.gold} />
              <Text style={styles.editButtonText}>Sửa</Text>
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* STATS ROW */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('ProfileFull', { tab: 'posts' })}
            >
              <Text style={styles.statNumber}>{stats.postsCount}</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* View Full Profile Button */}
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => navigation.navigate('ProfileFull')}
          >
            <User size={18} color={COLORS.purple} />
            <Text style={styles.viewProfileText}>Xem trang cá nhân đầy đủ</Text>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* ═══════════════════════════════════════════ */}
          {/* ⚡ ADMIN DASHBOARD SECTION - MAGENTA THEME */}
          {/* ═══════════════════════════════════════════ */}
          {renderAdminDashboard()}

          {/* ═══════════════════════════════════════════ */}
          {/* ASSET STATS CARDS (from AssetsHomeScreen) */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.assetStatsContainer}>
            <View style={styles.assetStatCard}>
              <View style={styles.assetStatIconContainer}>
                <Gem size={24} color={COLORS.gold} />
              </View>
              <Text style={[styles.assetStatValue, { color: COLORS.gold }]}>
                {assetStats.gems.toLocaleString()}
              </Text>
              <Text style={styles.assetStatLabel}>Gems</Text>
              <Text style={styles.assetStatSubtitle}>
                ~ {(assetStats.gems * 200).toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.assetStatCard}>
              <View style={styles.assetStatIconContainer}>
                <DollarSign size={24} color={COLORS.success} />
              </View>
              <Text style={[styles.assetStatValue, { color: COLORS.success }]}>
                {(assetStats.earnings / 1000).toFixed(0)}K
              </Text>
              <Text style={styles.assetStatLabel}>Thu nhập</Text>
              <Text style={styles.assetStatSubtitle}>Tháng này</Text>
            </View>
            <View style={styles.assetStatCard}>
              <View style={styles.assetStatIconContainer}>
                <Link2 size={24} color={COLORS.info} />
              </View>
              <Text style={[styles.assetStatValue, { color: COLORS.info }]}>
                {(assetStats.affiliate / 1000).toFixed(0)}K
              </Text>
              <Text style={styles.assetStatLabel}>Affiliate</Text>
              <Text style={styles.assetStatSubtitle}>Hoa hồng</Text>
            </View>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* QUICK ACTIONS GRID (from AssetsHomeScreen) */}
          {/* ═══════════════════════════════════════════ */}
          <Text style={styles.quickActionsSectionTitle}>Quản lý tài sản</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Gem size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Ví Gems</Text>
              <Text style={styles.actionSubtitle}>Mua & quản lý</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Earnings')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(58, 247, 166, 0.15)' }]}>
                <DollarSign size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionTitle}>Thu Nhập</Text>
              <Text style={styles.actionSubtitle}>Xem & rút tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('EarningsHistory')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <TrendingUp size={24} color={COLORS.purple} />
              </View>
              <Text style={styles.actionTitle}>Giao Dịch</Text>
              <Text style={styles.actionSubtitle}>Lịch sử chi tiêu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BoostedPosts')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                <Rocket size={24} color="#EC4899" />
              </View>
              <Text style={styles.actionTitle}>Boost</Text>
              <Text style={styles.actionSubtitle}>Quảng cáo bài</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Portfolio')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <BarChart3 size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionTitle}>Portfolio</Text>
              <Text style={styles.actionSubtitle}>Thống kê</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SoundLibrary')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Music size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>Âm Thanh</Text>
              <Text style={styles.actionSubtitle}>Thư viện</Text>
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* DASHBOARD WIDGETS SECTION (Day 17-19) */}
          {/* Position #2 - Right after Profile Header */}
          {/* ═══════════════════════════════════════════ */}
          {widgets.length > 0 ? (
            <View
              ref={dashboardSectionRef}
              style={styles.dashboardSection}
            >
              <TouchableOpacity
                style={styles.dashboardHeader}
                onPress={toggleDashboardSection}
                activeOpacity={0.7}
              >
                <View style={styles.dashboardHeaderLeft}>
                  <LayoutDashboard size={SPACING.xl} color={COLORS.gold} />
                  <Text style={styles.dashboardTitle}>Dashboard - Goals & Actions</Text>
                </View>
                {isWidgetSectionCollapsed ? (
                  <ChevronDown size={SPACING.xxl} color={COLORS.gold} />
                ) : (
                  <ChevronUp size={SPACING.xxl} color={COLORS.gold} />
                )}
              </TouchableOpacity>

              {!isWidgetSectionCollapsed && (
                <View style={styles.widgetsContainer}>
                  {widgets.map(renderWidget)}

                  {/* Add New Goal Button */}
                  <TouchableOpacity
                    style={styles.addWidgetButton}
                    onPress={navigateToGemMaster}
                    activeOpacity={0.8}
                  >
                    <Plus size={SPACING.xxl} color={COLORS.gold} />
                    <Text style={styles.addWidgetText}>Thêm Mục Tiêu Mới</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Empty State - No widgets yet */
            !isLoadingWidgets && (
              <View style={styles.emptyDashboard}>
                <View style={styles.emptyIconContainer}>
                  <LayoutDashboard size={48} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có mục tiêu nào</Text>
                <Text style={styles.emptyText}>
                  Chat với GEM AI để tạo goals & affirmations!
                </Text>
                <TouchableOpacity
                  style={styles.createGoalButton}
                  onPress={navigateToGemMaster}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createGoalButtonText}>Bắt Đầu Ngay</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: ĐƠN HÀNG CỦA TÔI */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đơn Hàng Của Tôi</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Shop', { screen: 'Orders' })}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Package size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Tất cả đơn hàng</Text>
                <Text style={styles.menuSubtext}>Xem lịch sử mua hàng</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Order Status Quick Links */}
            <View style={styles.orderStatusRow}>
              <TouchableOpacity
                style={styles.orderStatusItem}
                onPress={() => navigation.navigate('Shop', { screen: 'Orders', params: { filter: 'pending' } })}
              >
                <View style={[styles.orderStatusIcon, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
                  <Package size={18} color={COLORS.gold} />
                </View>
                <Text style={styles.orderStatusText}>Chờ xử lý</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.orderStatusItem}
                onPress={() => navigation.navigate('Shop', { screen: 'Orders', params: { filter: 'shipping' } })}
              >
                <View style={[styles.orderStatusIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                  <Package size={18} color={COLORS.purple} />
                </View>
                <Text style={styles.orderStatusText}>Đang giao</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.orderStatusItem}
                onPress={() => navigation.navigate('Shop', { screen: 'Orders', params: { filter: 'delivered' } })}
              >
                <View style={[styles.orderStatusIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                  <Package size={18} color={COLORS.success} />
                </View>
                <Text style={styles.orderStatusText}>Đã giao</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: AFFILIATE - Dynamic based on status */}
          {/* ═══════════════════════════════════════════ */}
          <AffiliateSection user={user} navigation={navigation} />

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: PORTFOLIO / TÀI SẢN */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài Sản</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Portfolio')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(58, 247, 166, 0.15)' }]}>
                <Wallet size={20} color={COLORS.success} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Portfolio</Text>
                <Text style={styles.menuSubtext}>Quản lý tài sản crypto</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('PaperTradeHistory')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <TrendingUp size={20} color={COLORS.purple} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Paper Trade History</Text>
                <Text style={styles.menuSubtext}>Lịch sử giao dịch giả lập</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: KHÓA HỌC CỦA TÔI */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khóa Học Của Tôi</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Courses')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 200, 255, 0.15)' }]}>
                <GraduationCap size={20} color={COLORS.cyan} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Tất cả khóa học</Text>
                <Text style={styles.menuSubtext}>Khám phá & đăng ký khóa học</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Courses', { filter: 'enrolled' })}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <BookOpen size={20} color={COLORS.purple} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Đang học</Text>
                <Text style={styles.menuSubtext}>Tiếp tục khóa học của bạn</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: CREATOR TOOLS */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Creator Tools</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Wallet')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Gem size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Ví Gems</Text>
                <Text style={styles.menuSubtext}>Quản lý gems & nạp thêm</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Earnings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(58, 247, 166, 0.15)' }]}>
                <DollarSign size={20} color={COLORS.success} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Thu Nhập</Text>
                <Text style={styles.menuSubtext}>Xem thu nhập từ gifts & tips</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SoundLibrary')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <Music size={20} color={COLORS.purple} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Thư Viện Âm Thanh</Text>
                <Text style={styles.menuSubtext}>Âm thanh cho bài viết của bạn</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('BoostedPosts')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 140, 0, 0.15)' }]}>
                <Zap size={20} color="#FF8C00" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Bài Đăng Boost</Text>
                <Text style={styles.menuSubtext}>Quản lý bài viết đang được boost</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: TÀI KHOẢN */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài Khoản</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <User size={20} color={COLORS.purple} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Thông tin cá nhân</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setPasswordModalVisible(true)}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <Lock size={20} color={COLORS.error} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Bell size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Cài đặt thông báo</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('PrivacySettings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(0, 200, 255, 0.15)' }]}>
                <Shield size={20} color={COLORS.cyan} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Cài đặt quyền riêng tư</Text>
                <Text style={styles.menuSubtext}>Ai có thể xem bài viết của bạn</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CloseFriends')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(58, 247, 166, 0.15)' }]}>
                <UserCheck size={20} color={COLORS.success} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Bạn thân</Text>
                <Text style={styles.menuSubtext}>Quản lý danh sách bạn thân</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SavedPosts')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Bookmark size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Bài viết đã lưu</Text>
                <Text style={styles.menuSubtext}>Các bài viết bạn đã bookmark</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: KHÁC */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khác</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <HelpCircle size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Trợ giúp & Hỗ trợ</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Terms')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <FileText size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Điều khoản sử dụng</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <LogOut size={20} color={COLORS.error} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, { color: COLORS.error }]}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          profile={profile}
          onSave={handleProfileSave}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={passwordModalVisible}
          onClose={() => setPasswordModalVisible(false)}
        />

        {/* Confetti for milestone celebrations (Day 20-22) */}
        {showConfetti && (
          <View style={styles.confettiContainer}>
            <View style={styles.confetti}>
              {/* Simple confetti dots animation */}
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.confettiDot,
                    {
                      left: `${Math.random() * 100}%`,
                      backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FF6347'][i % 5],
                      animationDelay: `${Math.random() * 1}s`,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

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
    paddingTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  // Not Logged In
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
  },
  notLoggedInTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  notLoggedInText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    paddingHorizontal: SPACING.huge,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.bgMid,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgMid,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  displayName: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bio: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    gap: 6,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // View Profile Button
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  viewProfileText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.purple,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  menuSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutItem: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },

  // Order Status Row
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  orderStatusItem: {
    alignItems: 'center',
  },
  orderStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderStatusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },

  // Affiliate Card
  affiliateCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  affiliateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  affiliateInfo: {
    marginLeft: SPACING.md,
  },
  affiliateTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  affiliateCode: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginTop: 4,
  },
  affiliateActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  affiliateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: SPACING.sm,
  },
  affiliateButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  affiliateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  commissionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.lg,
  },
  commissionItem: {
    flex: 1,
    alignItems: 'center',
  },
  commissionValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },
  commissionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // ═══════════════════════════════════════════
  // Dashboard Section Styles (Day 17-19)
  // ═══════════════════════════════════════════
  dashboardSection: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  dashboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dashboardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  widgetsContainer: {
    padding: SPACING.md,
  },
  addWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
    marginTop: SPACING.xs,
  },
  addWidgetText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Empty Dashboard State
  emptyDashboard: {
    padding: SPACING.huge,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: GLASS.borderRadius,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyIconContainer: {
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  createGoalButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    backgroundColor: COLORS.gold,
    borderRadius: SPACING.md,
  },
  createGoalButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgMid,
  },

  // ═══════════════════════════════════════════
  // Deep Link / Notification Styles (Day 20-22)
  // ═══════════════════════════════════════════
  widgetWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  widgetHighlighted: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },

  // Confetti Container
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 999,
  },
  confetti: {
    flex: 1,
  },
  confettiDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -10,
  },

  // ═══════════════════════════════════════════
  // ⚡ ADMIN DASHBOARD STYLES - MAGENTA THEME
  // ═══════════════════════════════════════════
  adminSection: {
    backgroundColor: 'rgba(255, 0, 255, 0.08)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
  adminQuickBtnWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 50,
  },
  adminQuickText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  adminBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  adminBadgeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },

  // ═══════════════════════════════════════════
  // ASSET STATS CARDS (from AssetsHomeScreen)
  // ═══════════════════════════════════════════
  assetStatsContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  assetStatCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  assetStatIconContainer: {
    marginBottom: SPACING.sm,
  },
  assetStatValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  assetStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },
  assetStatSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSubtle,
  },

  // ═══════════════════════════════════════════
  // QUICK ACTIONS GRID (from AssetsHomeScreen)
  // ═══════════════════════════════════════════
  quickActionsSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
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
});
