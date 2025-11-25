/**
 * GEM Platform - Account Screen (Tài Sản)
 * Complete profile + Orders + Affiliate + Portfolio + Settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  User,
  Settings,
  ChevronRight,
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
} from 'lucide-react-native';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services/forumService';
import { signOut } from '../../services/supabase';
import EditProfileModal from './components/EditProfileModal';

export default function AccountScreen() {
  const navigation = useNavigation();
  const { user, profile: authProfile } = useAuth();

  // State
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadData();
      } else {
        setLoading(false);
      }
    }, [user?.id])
  );

  const loadData = async () => {
    try {
      // Load profile info
      const profileData = await forumService.getUserProfile(user.id);
      setProfile(profileData || authProfile);

      // Load stats
      const userStats = await forumService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('[Account] Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

  const copyReferralCode = () => {
    const code = user?.referral_code || 'GEM' + (user?.id?.slice(0, 6) || '').toUpperCase();
    Alert.alert('Đã sao chép', `Mã giới thiệu: ${code}`);
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
          {/* SECTION: AFFILIATE */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chương Trình Affiliate</Text>

            <View style={styles.affiliateCard}>
              <View style={styles.affiliateHeader}>
                <Share2 size={24} color={COLORS.gold} />
                <View style={styles.affiliateInfo}>
                  <Text style={styles.affiliateTitle}>Mã giới thiệu của bạn</Text>
                  <Text style={styles.affiliateCode}>
                    {user?.referral_code || 'GEM' + (user?.id?.slice(0, 6) || '').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.affiliateActions}>
                <TouchableOpacity
                  style={styles.affiliateButton}
                  onPress={copyReferralCode}
                >
                  <Copy size={16} color={COLORS.textPrimary} />
                  <Text style={styles.affiliateButtonText}>Sao chép</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.affiliateButton, styles.affiliateButtonOutline]}
                >
                  <ExternalLink size={16} color={COLORS.gold} />
                  <Text style={[styles.affiliateButtonText, { color: COLORS.gold }]}>
                    Chi tiết
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Commission Stats */}
              <View style={styles.commissionRow}>
                <View style={styles.commissionItem}>
                  <Text style={styles.commissionValue}>$0.00</Text>
                  <Text style={styles.commissionLabel}>Hoa hồng tháng này</Text>
                </View>
                <View style={styles.commissionItem}>
                  <Text style={styles.commissionValue}>0</Text>
                  <Text style={styles.commissionLabel}>Người giới thiệu</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: PORTFOLIO / TÀI SẢN */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài Sản</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Trading')}
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
              onPress={() => navigation.navigate('Trading')}
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
          {/* SECTION: TÀI KHOẢN */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài Khoản</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setEditModalVisible(true)}
            >
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(106, 91, 255, 0.15)' }]}>
                <User size={20} color={COLORS.purple} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Thông tin cá nhân</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <Lock size={20} color={COLORS.error} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 189, 89, 0.15)' }]}>
                <Bell size={20} color={COLORS.gold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Cài đặt thông báo</Text>
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
              onPress={() => Linking.openURL('https://gemplatform.io/help')}
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
              onPress={() => Linking.openURL('https://gemplatform.io/terms')}
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
});
