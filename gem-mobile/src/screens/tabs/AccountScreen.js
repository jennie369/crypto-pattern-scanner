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
  Pressable,
  Image,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  InteractionManager,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
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
  Eye,
  Sparkles,
  Target,
  Fingerprint,
  Scan,
  X,
  Globe,
  Radio,
  Building2,
} from 'lucide-react-native';
import { Switch } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import { useAuth } from '../../contexts/AuthContext';
import useScrollToTop from '../../hooks/useScrollToTop';
import { forumService } from '../../services/forumService';
import { signOut, supabase } from '../../services/supabase';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import AffiliateSection from './components/AffiliateSection';
import MyCoursesSection from './components/MyCoursesSection';
import { useSponsorBanners } from '../../components/SponsorBannerSection';
import SponsorBanner from '../../components/SponsorBanner';
import biometricService from '../../services/biometricService';
import BiometricSetupModal from '../../components/Auth/BiometricSetupModal';
import { getSession } from '../../services/supabase';
import { UserBadges } from '../../components/UserBadge';
import { UpgradeBanner } from '../../components/upgrade';

// ============================================
// GLOBAL CACHE - persists across tab switches
// ============================================
const accountCache = {
  profile: null,
  stats: null,
  assetStats: null,
  adminStats: null,
  lastFetch: 0,
  CACHE_DURATION: 300000, // 5 minutes - reduced API calls for better performance
};

export default function AccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, profile: authProfile, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State - initialize from cache for instant display
  const [profile, setProfile] = useState(() => accountCache.profile);
  const [stats, setStats] = useState(() => accountCache.stats || { postsCount: 0, followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(!accountCache.profile); // false if cache exists
  const [refreshing, setRefreshing] = useState(false);

  // Double-tap to scroll to top and refresh
  const { scrollViewRef } = useScrollToTop('Account', async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  });

  // Sponsor banners - use hook to fetch ALL banners for distribution
  const { banners: sponsorBanners, dismissBanner, userId: bannerUserId } = useSponsorBanners('account', refreshing);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Biometric State
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('Sinh trắc học');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(true);
  const [currentRefreshToken, setCurrentRefreshToken] = useState(null);


  // Admin Stats State - initialize from cache
  const [adminStats, setAdminStats] = useState(() => accountCache.adminStats || {
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalPartners: 0,
    totalUsers: 0,
  });

  // Assets Stats State - initialize from cache
  const [assetStats, setAssetStats] = useState(() => accountCache.assetStats || {
    gems: 0,
    earnings: 0,
    affiliate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Deep link / Notification State (Day 20-22)
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  // Load data on focus - with global caching
  // Key principle: NEVER show loading if we have ANY cached data
  // Use InteractionManager to defer heavy operations until after animation completes
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        // IMMEDIATELY sync from cache - no waiting
        if (accountCache.profile) {
          setLoading(false);
          if (profile !== accountCache.profile) setProfile(accountCache.profile);
          if (accountCache.stats && stats !== accountCache.stats) setStats(accountCache.stats);
          if (accountCache.assetStats && assetStats !== accountCache.assetStats) setAssetStats(accountCache.assetStats);
          if (isAdmin && accountCache.adminStats && adminStats !== accountCache.adminStats) setAdminStats(accountCache.adminStats);
        }

        // Defer API calls until AFTER animation completes - makes tab switch instant
        const task = InteractionManager.runAfterInteractions(() => {
          const now = Date.now();
          const cacheExpired = now - accountCache.lastFetch > accountCache.CACHE_DURATION;

          if (!accountCache.profile || cacheExpired) {
            loadData();
            if (isAdmin) {
              loadAdminStats();
            }
          }
        });

        return () => task.cancel();
      } else {
        setLoading(false);
      }
    }, [user?.id, isAdmin])
  );

  // Handle deep link from notification - navigate to VisionBoard
  useEffect(() => {
    const params = route.params;
    if (!params) return;

    // Handle openVisionBoard or expandDashboard (legacy) - navigate to VisionBoard screen
    if (params.openVisionBoard || params.expandDashboard) {
      const tab = params.visionBoardTab || params.scrollToWidget || 'affirmation';
      navigation.navigate('VisionBoard', { tab });
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
    if (params.openVisionBoard || params.expandDashboard || params.showConfetti || params.visionBoardTab) {
      navigation.setParams({
        openVisionBoard: undefined,
        expandDashboard: undefined,
        visionBoardTab: undefined,
        showConfetti: undefined,
      });
    }
  }, [route.params?.openVisionBoard, route.params?.expandDashboard, route.params?.showConfetti, route.params?.visionBoardTab]);

  // Check biometric status on mount
  useEffect(() => {
    const checkBiometricStatus = async () => {
      setBiometricLoading(true);
      try {
        const support = await biometricService.checkSupport();
        const enabled = await biometricService.isEnabled();
        const typeName = await biometricService.getTypeName();

        setBiometricSupported(support.supported);
        setBiometricEnabled(enabled);
        setBiometricType(typeName || support.typeName || 'Sinh trắc học');
      } catch (err) {
        console.error('[AccountScreen] checkBiometricStatus error:', err);
      } finally {
        setBiometricLoading(false);
      }
    };

    checkBiometricStatus();
  }, []);

  const loadData = async () => {
    try {
      // Run all API calls in PARALLEL for faster loading
      const [profileData, userStats, assetData] = await Promise.all([
        forumService.getUserProfile(user.id).catch(e => {
          console.warn('[Account] Profile load error:', e);
          return null;
        }),
        forumService.getUserStats(user.id).catch(e => {
          console.warn('[Account] Stats load error:', e);
          return { postsCount: 0, followersCount: 0, followingCount: 0 };
        }),
        loadAssetStatsParallel(), // New parallel version
      ]);

      const finalProfile = profileData || authProfile;
      setProfile(finalProfile);
      setStats(userStats);

      // Update global cache for instant display on next tab switch
      accountCache.profile = finalProfile;
      accountCache.stats = userStats;
      accountCache.lastFetch = Date.now();
    } catch (error) {
      console.error('[Account] Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load asset statistics - PARALLEL version for faster loading
  const loadAssetStatsParallel = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Run ALL 4 queries in PARALLEL
      const [profileResult, earningsResult, affiliateResult, activityResult] = await Promise.all([
        // 1. User gems from profile
        supabase
          .from('profiles')
          .select('gems')
          .eq('id', user.id)
          .single(),
        // 2. Earnings this month
        supabase
          .from('gems_transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'earning')
          .gte('created_at', startOfMonth.toISOString()),
        // 3. Affiliate commission
        supabase
          .from('affiliate_sales')
          .select('commission')
          .eq('partner_id', user.id)
          .eq('status', 'confirmed'),
        // 4. Recent activity
        supabase
          .from('gems_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalAffiliate = affiliateResult.data?.reduce((sum, s) => sum + s.commission, 0) || 0;

      const newAssetStats = {
        gems: profileResult.data?.gems || 0,
        earnings: totalEarnings * 200, // Convert Gems to VND
        affiliate: totalAffiliate,
      };
      setAssetStats(newAssetStats);
      accountCache.assetStats = newAssetStats; // Update cache

      setRecentActivity(activityResult.data || []);
    } catch (error) {
      console.error('[Account] Load asset stats error:', error);
    }
  };

  // Legacy load asset statistics (kept for reference)
  const loadAssetStats = async () => {
    await loadAssetStatsParallel();
  };

  // ⚡ Load Admin Stats - PARALLEL version for faster loading
  const loadAdminStats = async () => {
    // Helper to safely run a query
    const safeQuery = async (queryFn) => {
      try {
        return await queryFn();
      } catch (e) {
        return { count: 0, error: e };
      }
    };

    try {
      // Run ALL 4 queries in PARALLEL
      const [pendingAppsResult, pendingWithdrawalsResult, partnersResult, usersResult] = await Promise.all([
        // 1. Pending partnership applications
        safeQuery(() => supabase
          .from('partnership_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')),
        // 2. Pending withdrawal requests
        safeQuery(() => supabase
          .from('withdrawal_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')),
        // 3. Total partners
        safeQuery(() => supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('partnership_role', 'is', null)),
        // 4. Total users
        safeQuery(() => supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })),
      ]);

      const pendingApps = pendingAppsResult?.count || 0;
      const pendingWithdrawals = pendingWithdrawalsResult?.error ? 0 : (pendingWithdrawalsResult?.count || 0);
      const totalPartners = partnersResult?.count || 0;
      const totalUsers = usersResult?.count || 0;

      const newAdminStats = {
        pendingApplications: pendingApps,
        pendingWithdrawals: pendingWithdrawals,
        totalPartners: totalPartners,
        totalUsers: totalUsers,
      };
      setAdminStats(newAdminStats);
      accountCache.adminStats = newAdminStats; // Update cache

      console.log('[Account] Admin stats loaded:', { pendingApps, pendingWithdrawals, totalPartners, totalUsers });
    } catch (error) {
      console.error('[Account] Admin stats load error:', error);
    }
  };

  // ========== BIOMETRIC HANDLERS ==========
  // Get refresh token for biometric setup
  const getRefreshToken = async () => {
    try {
      const { session } = await getSession();
      return session?.refresh_token || null;
    } catch (err) {
      console.error('[AccountScreen] getRefreshToken error:', err);
      return null;
    }
  };

  const handleBiometricToggle = async (value) => {
    if (value) {
      // Muốn bật → lấy refresh token và show setup modal
      const refreshToken = await getRefreshToken();
      setCurrentRefreshToken(refreshToken);
      setShowBiometricModal(true);
    } else {
      // Muốn tắt → confirm và disable
      alert({
        type: 'warning',
        title: 'Tắt đăng nhập sinh trắc học?',
        message: 'Bạn sẽ cần nhập email và mật khẩu để đăng nhập lần sau.',
        buttons: [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Tắt',
            style: 'destructive',
            onPress: async () => {
              const result = await biometricService.disable();
              if (result.success) {
                setBiometricEnabled(false);
              } else {
                alert({
                  type: 'error',
                  title: 'Lỗi',
                  message: result.error || 'Không thể tắt sinh trắc học',
                });
              }
            },
          },
        ],
      });
    }
  };

  const handleBiometricSetupSuccess = (typeName) => {
    setBiometricEnabled(true);
    setBiometricType(typeName);
    console.log('[AccountScreen] Biometric enabled successfully:', typeName);
  };

  const handleBiometricSetupClose = () => {
    setShowBiometricModal(false);
  };


  const onRefresh = async () => {
    setRefreshing(true);
    const promises = [loadData()];
    if (isAdmin) {
      promises.push(loadAdminStats());
    }
    await Promise.all(promises);
    setRefreshing(false);
  };

  // ⚡ RENDER ADMIN DASHBOARD SECTION - Subtle theme matching app
  const renderAdminDashboard = () => {
    if (!isAdmin) {
      return null;
    }

    return (
      <View style={styles.adminSection}>
        {/* Admin Header */}
        <View style={styles.adminHeader}>
          <Shield size={18} color={COLORS.gold} />
          <Text style={styles.adminHeaderText}>ADMIN PANEL</Text>
        </View>

        {/* Main Dashboard Button */}
        <TouchableOpacity
          style={styles.adminMainButton}
          onPress={() => navigation.navigate('AdminDashboard')}
          activeOpacity={0.8}
        >
          <View style={styles.adminButtonContent}>
            <Settings size={18} color={COLORS.textPrimary} />
            <Text style={styles.adminButtonText}>Quản Lý Hệ Thống</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
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
            <CreditCard size={18} color={COLORS.gold} />
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
            <Users size={18} color={COLORS.gold} />
            <Text style={styles.adminQuickText}>Users</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row 2 - Course Management */}
        <View style={styles.adminQuickActions}>
          <TouchableOpacity
            style={[styles.adminQuickBtn, styles.adminQuickBtnWide]}
            onPress={() => navigation.navigate('AdminCourses')}
          >
            <GraduationCap size={18} color={COLORS.gold} />
            <Text style={styles.adminQuickText}>Quản lý khóa học</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminQuickBtn, styles.adminQuickBtnWide]}
            onPress={() => navigation.navigate('GrantAccess')}
          >
            <UserCheck size={18} color={COLORS.gold} />
            <Text style={styles.adminQuickText}>Cấp quyền truy cập</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row 3 - Exchange Affiliate */}
        <View style={[styles.adminQuickActions, { marginTop: SPACING.sm }]}>
          <TouchableOpacity
            style={[styles.adminQuickBtn, styles.adminQuickBtnWide]}
            onPress={() => navigation.navigate('AffiliateExchangeAdmin')}
          >
            <Building2 size={18} color={COLORS.gold} />
            <Text style={styles.adminQuickText}>Exchange Affiliate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    alert({
      type: 'warning',
      title: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            console.log('[AccountScreen] Logout button pressed, calling signOut...');
            try {
              const result = await signOut();
              console.log('[AccountScreen] SignOut result:', result);
            } catch (error) {
              console.error('[AccountScreen] SignOut error:', error);
            }
          }
        },
      ],
    });
  };

  const copyReferralCode = async () => {
    try {
      const code = user?.referral_code || 'GEM' + (user?.id?.slice(0, 6) || '').toUpperCase();
      await Clipboard.setStringAsync(code);
      alert({
        type: 'success',
        title: 'Thành công',
        message: `Đã sao chép mã giới thiệu: ${code}`,
      });
    } catch (error) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể sao chép mã giới thiệu',
      });
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

  // REMOVED: Blocking loading state - UI should always render immediately
  // Data loads in background, content shows from cache or with defaults

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
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                <UserBadges user={profile} size="small" maxBadges={3} />
              </View>
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
          {/* 📚 MY COURSES SECTION - Moved up before Vision Board */}
          {/* ═══════════════════════════════════════════ */}
          <MyCoursesSection navigation={navigation} />

          {/* ═══════════════════════════════════════════ */}
          {/* VISION BOARD - Goals & Affirmations */}
          {/* ═══════════════════════════════════════════ */}
          <Pressable
            style={({ pressed }) => [
              styles.visionBoardCard,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => {
              console.log('[AccountScreen] VisionBoard card pressed');
              navigation.navigate('VisionBoard');
            }}
          >
            <View style={styles.visionBoardContent}>
              <View style={styles.visionBoardLeft}>
                <View style={styles.visionBoardIconRow}>
                  <Eye size={20} color={COLORS.gold} />
                  <Sparkles size={14} color={COLORS.gold} style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.visionBoardTitle}>Vision Board</Text>
                <Text style={styles.visionBoardSubtitle}>Mục tiêu & Affirmations</Text>
              </View>
              <View style={styles.visionBoardRight}>
                <View style={styles.visionBoardStats}>
                  <View style={styles.visionBoardStatItem}>
                    <Target size={14} color={COLORS.gold} />
                    <Text style={styles.visionBoardStatText}>Goals</Text>
                  </View>
                  <View style={styles.visionBoardStatItem}>
                    <Sparkles size={14} color={COLORS.gold} />
                    <Text style={styles.visionBoardStatText}>Daily</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </View>
            </View>
          </Pressable>

          {/* ═══════════════════════════════════════════ */}
          {/* AI LIVESTREAM - Avatar AI bán hàng tự động */}
          {/* ═══════════════════════════════════════════ */}
          <Pressable
            style={({ pressed }) => [
              styles.livestreamCard,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => {
              console.log('[AccountScreen] Livestream card pressed');
              navigation.navigate('LivestreamList');
            }}
          >
            <View style={styles.livestreamContent}>
              <View style={styles.livestreamLeft}>
                <View style={styles.livestreamIconRow}>
                  <Radio size={20} color={COLORS.error} />
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.livestreamTitle}>AI Livestream</Text>
                <Text style={styles.livestreamSubtitle}>Avatar AI bán hàng tự động</Text>
              </View>
              <View style={styles.livestreamRight}>
                <ChevronRight size={20} color={COLORS.textMuted} />
              </View>
            </View>
          </Pressable>

          {/* ═══════════════════════════════════════════ */}
          {/* 🚀 UPGRADE BANNER - For free users */}
          {/* ═══════════════════════════════════════════ */}
          <UpgradeBanner
            banner={{
              title: 'Nâng cấp tài khoản',
              subtitle: 'Mở khóa tất cả tính năng premium',
              cta_text: 'Xem các gói',
              icon_name: 'sparkles',
              trigger_screen: 'account_screen',
            }}
            tierType="scanner"
            variant="prominent"
            style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}
          />

          {/* ═══════════════════════════════════════════ */}
          {/* ⚡ ADMIN DASHBOARD SECTION - MAGENTA THEME */}
          {/* ═══════════════════════════════════════════ */}
          {renderAdminDashboard()}

          {/* ═══════════════════════════════════════════ */}
          {/* ASSET STATS CARDS - Touchable with navigation */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.assetStatsContainer}>
            <TouchableOpacity
              style={styles.assetStatCard}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.7}
            >
              <View style={styles.assetStatIconContainer}>
                <Gem size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.assetStatValue}>
                {assetStats.gems.toLocaleString()}
              </Text>
              <Text style={styles.assetStatLabel}>Gems</Text>
              <Text style={styles.assetStatSubtitle}>
                ~ {(assetStats.gems * 200).toLocaleString()}đ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.assetStatCard}
              onPress={() => navigation.navigate('Earnings')}
              activeOpacity={0.7}
            >
              <View style={styles.assetStatIconContainer}>
                <DollarSign size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.assetStatValue}>
                {assetStats.earnings > 0
                  ? assetStats.earnings >= 1000
                    ? `${(assetStats.earnings / 1000).toFixed(0)}K`
                    : assetStats.earnings.toLocaleString()
                  : '0'}
              </Text>
              <Text style={styles.assetStatLabel}>Thu nhập</Text>
              <Text style={styles.assetStatSubtitle}>Tháng này</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.assetStatCard}
              onPress={() => navigation.navigate('AffiliateDashboard')}
              activeOpacity={0.7}
            >
              <View style={styles.assetStatIconContainer}>
                <Link2 size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.assetStatValue}>
                {assetStats.affiliate > 0
                  ? assetStats.affiliate >= 1000
                    ? `${(assetStats.affiliate / 1000).toFixed(0)}K`
                    : assetStats.affiliate.toLocaleString()
                  : '0'}
              </Text>
              <Text style={styles.assetStatLabel}>Affiliate</Text>
              <Text style={styles.assetStatSubtitle}>Hoa hồng</Text>
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* QUICK ACTIONS GRID - All icons gold */}
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
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <DollarSign size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Thu Nhập</Text>
              <Text style={styles.actionSubtitle}>Xem & rút tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('EarningsHistory')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <TrendingUp size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Giao Dịch</Text>
              <Text style={styles.actionSubtitle}>Lịch sử chi tiêu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BoostedPosts')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Rocket size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Boost</Text>
              <Text style={styles.actionSubtitle}>Quảng cáo bài</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Portfolio')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <BarChart3 size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Portfolio</Text>
              <Text style={styles.actionSubtitle}>Thống kê</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SoundLibrary')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Music size={24} color={COLORS.gold} />
              </View>
              <Text style={styles.actionTitle}>Âm Thanh</Text>
              <Text style={styles.actionSubtitle}>Thư viện</Text>
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: GEM ECONOMY - All icons gold */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gem Economy</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('GemPackList')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Gem size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Mua Gems</Text>
                <Text style={styles.menuSubtext}>Nạp Gems để sử dụng dịch vụ</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('DailyCheckin')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Clock size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Điểm danh</Text>
                <Text style={styles.menuSubtext}>Nhận 5 Gems miễn phí mỗi ngày</Text>
              </View>
              <View style={styles.gemBadge}>
                <Gift size={12} color={COLORS.gold} />
                <Text style={[styles.gemBadgeText, { color: COLORS.gold }]}>+5</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: ĐƠN HÀNG CỦA TÔI - All icons gold */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đơn Hàng Của Tôi</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Package size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Tất cả đơn hàng</Text>
                <Text style={styles.menuSubtext}>Theo dõi đơn hàng từ Shopify</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Link Order Button */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('LinkOrder')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Link2 size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Liên kết đơn hàng</Text>
                <Text style={styles.menuSubtext}>Liên kết đơn mua bằng email khác</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: AFFILIATE - Dynamic based on status */}
          {/* ═══════════════════════════════════════════ */}
          <AffiliateSection user={user} navigation={navigation} />

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: PORTFOLIO / TÀI SẢN - All icons gold */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài Sản</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Portfolio')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Wallet size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Portfolio</Text>
                <Text style={styles.menuSubtext}>Quản lý tài sản crypto</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ExchangeAccounts')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Building2 size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Tài khoản sàn</Text>
                <Text style={styles.menuSubtext}>Đăng ký & quản lý sàn giao dịch</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('PaperTradeHistory')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <TrendingUp size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Paper Trade History</Text>
                <Text style={styles.menuSubtext}>Lịch sử giao dịch giả lập</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('KarmaDashboard')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Sparkles size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Karma Dashboard</Text>
                <Text style={styles.menuSubtext}>Điểm karma & level của bạn</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: CÀI ĐẶT - All icons gold */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Settings size={18} color={COLORS.gold} />
              <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: SPACING.sm }]}>Cài Đặt</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <User size={20} color={COLORS.gold} />
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
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Lock size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Biometric Toggle - Chỉ hiện nếu thiết bị hỗ trợ */}
            {biometricSupported && (
              <View style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                  {biometricType?.includes('Face') || biometricType?.includes('khuôn mặt') ? (
                    <Scan size={20} color={COLORS.gold} />
                  ) : (
                    <Fingerprint size={20} color={COLORS.gold} />
                  )}
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuText}>Đăng nhập bằng {biometricType}</Text>
                  <Text style={styles.menuSubtext}>
                    {biometricEnabled ? 'Đã bật' : 'Chưa bật'}
                  </Text>
                </View>
                {biometricLoading ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: 'rgba(255, 189, 89, 0.5)' }}
                    thumbColor={biometricEnabled ? COLORS.gold : COLORS.textMuted}
                  />
                )}
              </View>
            )}

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
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Shield size={20} color={COLORS.gold} />
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
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <UserCheck size={20} color={COLORS.gold} />
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

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Globe size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
                <Text style={styles.menuSubtext}>Ngôn ngữ, tiền tệ, giao diện</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: KHÁC - All icons gold */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khác</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <HelpCircle size={20} color={COLORS.gold} />
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
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <FileText size={20} color={COLORS.gold} />
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

          {/* Sponsor Banners - distributed */}
          {sponsorBanners.map((banner) => (
            <SponsorBanner
              key={banner.id}
              banner={banner}
              navigation={navigation}
              userId={bannerUserId}
              onDismiss={dismissBanner}
            />
          ))}

          {/* Bottom spacing */}
          <View style={{ height: CONTENT_BOTTOM_PADDING }} />
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

        {/* Biometric Setup Modal */}
        <BiometricSetupModal
          visible={showBiometricModal}
          onClose={handleBiometricSetupClose}
          onSuccess={handleBiometricSetupSuccess}
          email={user?.email}
          refreshToken={currentRefreshToken}
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

        {AlertComponent}
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
    paddingBottom: CONTENT_BOTTOM_PADDING + 40,
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

  // Name row with badges
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.sm,
    gap: 4,
  },
  gemBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
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
  // Vision Board Card Styles - Subtle, matching app theme
  // ═══════════════════════════════════════════
  visionBoardCard: {
    marginBottom: SPACING.lg,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  visionBoardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  visionBoardLeft: {
    flex: 1,
  },
  visionBoardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  visionBoardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  visionBoardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  visionBoardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  visionBoardStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  visionBoardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visionBoardStatText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // ═══════════════════════════════════════════
  // AI Livestream Card Styles
  // ═══════════════════════════════════════════
  livestreamCard: {
    marginBottom: SPACING.lg,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  livestreamContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  livestreamLeft: {
    flex: 1,
  },
  livestreamIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  liveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  livestreamTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  livestreamSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  livestreamRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  // ⚡ ADMIN DASHBOARD STYLES - Subtle, matching app theme
  // ═══════════════════════════════════════════
  adminSection: {
    backgroundColor: GLASS.background,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  adminHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    letterSpacing: 1.5,
  },
  adminMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adminButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  adminQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  adminQuickBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.1)',
  },
  adminQuickBtnWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 48,
  },
  adminQuickText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  adminBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  adminBadgeCountText: {
    fontSize: 10,
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
