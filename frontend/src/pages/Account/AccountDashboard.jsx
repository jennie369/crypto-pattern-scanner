/**
 * Account Dashboard - Full Logic Implementation
 * Features: Real data from Supabase, working handlers, proper navigation
 * Tables used: profiles, forum_posts, user_follows, affiliate_profiles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  TrendingUp,
  DollarSign,
  Settings,
  ChevronRight,
  Gem,
  Link2,
  Wallet,
  Rocket,
  GraduationCap,
  BookOpen,
  Lock,
  Bell,
  Shield,
  Bookmark,
  HelpCircle,
  FileText,
  LogOut,
  Camera,
  Edit2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './AccountDashboard.css';

const AccountDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // ═══════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // User stats from database
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  // Asset stats from database
  const [assetStats, setAssetStats] = useState({
    gems: 0,
    totalCommission: 0,
    pendingCommission: 0
  });

  // Course stats
  const [courseStats, setCourseStats] = useState({
    enrolled: 0,
    inProgress: 0
  });

  // ═══════════════════════════════════════════
  // ADMIN CHECK - Follow DATABASE_SCHEMA.md
  // ═══════════════════════════════════════════
  const checkIsAdmin = useCallback(() => {
    if (!profile) return false;
    return (
      profile.is_admin === true ||
      profile.role === 'admin' ||
      profile.role === 'ADMIN' ||
      profile.scanner_tier === 'ADMIN' ||
      profile.chatbot_tier === 'ADMIN'
    );
  }, [profile]);

  const isAdmin = checkIsAdmin();

  // ═══════════════════════════════════════════
  // DATA FETCHING - Real Supabase queries
  // ═══════════════════════════════════════════
  const loadAllData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Parallel fetch all data
      await Promise.allSettled([
        loadUserStats(),
        loadAssetStats(),
        loadCourseStats()
      ]);

    } catch (err) {
      console.error('[AccountDashboard] Load error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ═══════════════════════════════════════════
  // LOAD USER STATS (posts, followers, following)
  // Tables: forum_posts, user_follows (per DATABASE_SCHEMA.md)
  // ═══════════════════════════════════════════
  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      // Get posts count from forum_posts (column: user_id)
      const { count: postsCount, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'published');

      if (postsError) {
        console.warn('[AccountDashboard] Posts count error:', postsError.message);
      }

      // Get followers count from user_follows
      const { count: followersCount, error: followersError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      if (followersError) {
        console.warn('[AccountDashboard] Followers count error:', followersError.message);
      }

      // Get following count from user_follows
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      if (followingError) {
        console.warn('[AccountDashboard] Following count error:', followingError.message);
      }

      setUserStats({
        postsCount: postsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0
      });

    } catch (err) {
      console.error('[AccountDashboard] loadUserStats error:', err);
    }
  };

  // ═══════════════════════════════════════════
  // LOAD ASSET STATS (gems, affiliate commission)
  // Tables: profiles (gems column), affiliate_profiles
  // ═══════════════════════════════════════════
  const loadAssetStats = async () => {
    if (!user?.id) return;

    try {
      // Get gems from profiles table (per DATABASE_SCHEMA.md line 111)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('[AccountDashboard] Profile gems error:', profileError.message);
      }

      // Get affiliate data from affiliate_profiles table
      let affiliateData = { total_commission: 0, pending_commission: 0 };
      const { data: affProfile, error: affError } = await supabase
        .from('affiliate_profiles')
        .select('total_commission, pending_commission')
        .eq('user_id', user.id)
        .single();

      if (affError && affError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user not an affiliate yet)
        console.warn('[AccountDashboard] Affiliate profile error:', affError.message);
      } else if (affProfile) {
        affiliateData = affProfile;
      }

      setAssetStats({
        gems: profileData?.gems || 0,
        totalCommission: affiliateData.total_commission || 0,
        pendingCommission: affiliateData.pending_commission || 0
      });

    } catch (err) {
      console.error('[AccountDashboard] loadAssetStats error:', err);
    }
  };

  // ═══════════════════════════════════════════
  // LOAD COURSE STATS
  // Tables: course_enrollments (if exists)
  // ═══════════════════════════════════════════
  const loadCourseStats = async () => {
    if (!user?.id) return;

    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('id, status, progress_percentage')
        .eq('user_id', user.id);

      if (enrollError) {
        // Table might not exist - not critical
        console.warn('[AccountDashboard] Course enrollments:', enrollError.message);
        return;
      }

      const enrolled = enrollments?.length || 0;
      const completed = enrollments?.filter(e =>
        e.status === 'completed' || (e.progress_percentage && e.progress_percentage >= 100)
      ).length || 0;

      setCourseStats({
        enrolled,
        inProgress: enrolled - completed
      });

    } catch (err) {
      console.error('[AccountDashboard] loadCourseStats error:', err);
    }
  };

  // ═══════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadAllData();
  }, [user, navigate, loadAllData]);

  // ═══════════════════════════════════════════
  // HANDLERS - All with real logic
  // ═══════════════════════════════════════════
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      try {
        await signOut();
        navigate('/auth');
      } catch (err) {
        console.error('[AccountDashboard] Logout error:', err);
        setError('Đăng xuất thất bại. Vui lòng thử lại.');
      }
    }
  };

  // Safe navigation handler
  const handleNavigate = useCallback((path) => {
    if (!path) {
      console.error('[AccountDashboard] Invalid navigation path');
      return;
    }
    navigate(path);
  }, [navigate]);

  // ═══════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════
  if (authLoading || loading) {
    return (
      <div className="account-dashboard-wrapper">
        <div className="account-dashboard account-loading">
          <div className="account-loading-container">
            <RefreshCw className="account-loading-spinner-icon" size={32} />
            <span className="account-loading-text">Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════
  if (error) {
    return (
      <div className="account-dashboard-wrapper">
        <div className="account-dashboard">
          <div className="account-error-container">
            <AlertCircle size={48} className="account-error-icon" />
            <h3 className="account-error-title">Đã xảy ra lỗi</h3>
            <p className="account-error-message">{error}</p>
            <button className="account-btn-retry" onClick={handleRefresh}>
              <RefreshCw size={18} />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // NOT AUTHENTICATED STATE
  // ═══════════════════════════════════════════
  if (!user) {
    return (
      <div className="account-dashboard-wrapper">
        <div className="account-dashboard">
          <div className="account-error-container">
            <User size={48} className="account-error-icon" />
            <h3 className="account-error-title">Chưa đăng nhập</h3>
            <p className="account-error-message">Vui lòng đăng nhập để xem trang này.</p>
            <button className="account-btn-retry" onClick={() => navigate('/auth')}>
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // DERIVED VALUES - with safe fallbacks
  // ═══════════════════════════════════════════
  const displayName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'User';
  const username = profile?.username || user?.email?.split('@')[0] || '';
  const bio = profile?.bio || 'Chưa có tiểu sử. Hãy cập nhật hồ sơ của bạn!';
  const avatarUrl = profile?.avatar_url || null;

  // Format numbers for display
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('vi-VN');
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="account-dashboard-wrapper">
      <div className="account-dashboard">
        <div className="account-content">

          {/* ═══════════════════════════════════════════ */}
          {/* PROFILE HEADER */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-profile-section">
            <div
              className="account-profile-avatar-container"
              onClick={() => handleNavigate('/profile')}
              role="button"
              tabIndex={0}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="account-profile-avatar" />
              ) : (
                <div className="account-avatar-placeholder">
                  <User size={48} />
                </div>
              )}
              <div className="account-camera-button">
                <Camera size={14} />
              </div>
            </div>

            <div className="account-profile-info">
              <h2 className="account-profile-name">{displayName}</h2>
              {username && <p className="account-profile-username">@{username}</p>}
              <p className="account-profile-bio">{bio}</p>
            </div>

            <button
              className="account-btn-edit-profile"
              onClick={() => handleNavigate('/settings/profile')}
            >
              <Edit2 size={16} />
              <span>Sửa</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* STATS ROW */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-stats-container">
            <div
              className="account-stat-item"
              onClick={() => handleNavigate('/profile?tab=posts')}
              role="button"
              tabIndex={0}
            >
              <span className="account-stat-number">{formatNumber(userStats.postsCount)}</span>
              <span className="account-stat-label">Bài viết</span>
            </div>
            <div className="account-stat-divider" />
            <div
              className="account-stat-item"
              onClick={() => handleNavigate('/profile?tab=followers')}
              role="button"
              tabIndex={0}
            >
              <span className="account-stat-number">{formatNumber(userStats.followersCount)}</span>
              <span className="account-stat-label">Followers</span>
            </div>
            <div className="account-stat-divider" />
            <div
              className="account-stat-item"
              onClick={() => handleNavigate('/profile?tab=following')}
              role="button"
              tabIndex={0}
            >
              <span className="account-stat-number">{formatNumber(userStats.followingCount)}</span>
              <span className="account-stat-label">Following</span>
            </div>
          </div>

          {/* View Full Profile Button */}
          <button
            className="account-view-profile-button"
            onClick={() => handleNavigate('/profile')}
          >
            <User size={18} />
            <span>Xem trang cá nhân đầy đủ</span>
            <ChevronRight size={18} />
          </button>

          {/* ═══════════════════════════════════════════ */}
          {/* ADMIN PANEL (if admin) */}
          {/* ═══════════════════════════════════════════ */}
          {isAdmin && (
            <div className="account-admin-section">
              <div className="account-admin-header">
                <Shield size={20} />
                <span>ADMIN PANEL</span>
              </div>
              <button
                className="account-admin-main-button"
                onClick={() => handleNavigate('/admin')}
              >
                <div className="account-admin-button-content">
                  <Settings size={20} />
                  <span>Quản Lý Hệ Thống</span>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* ASSET STATS CARDS */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-asset-stats-container">
            <div
              className="account-asset-stat-card"
              onClick={() => handleNavigate('/shop')}
              role="button"
              tabIndex={0}
            >
              <div className="account-asset-stat-icon gems">
                <Gem size={24} />
              </div>
              <span className="account-asset-stat-value gems">
                {formatNumber(assetStats.gems)}
              </span>
              <span className="account-asset-stat-label">Gems</span>
              <span className="account-asset-stat-subtitle">
                ~ {formatNumber(assetStats.gems * 200)}đ
              </span>
            </div>

            <div
              className="account-asset-stat-card"
              onClick={() => handleNavigate('/affiliate')}
              role="button"
              tabIndex={0}
            >
              <div className="account-asset-stat-icon earnings">
                <DollarSign size={24} />
              </div>
              <span className="account-asset-stat-value earnings">
                {formatNumber(assetStats.totalCommission)}
              </span>
              <span className="account-asset-stat-label">Thu nhập</span>
              <span className="account-asset-stat-subtitle">Tổng cộng</span>
            </div>

            <div
              className="account-asset-stat-card"
              onClick={() => handleNavigate('/affiliate')}
              role="button"
              tabIndex={0}
            >
              <div className="account-asset-stat-icon affiliate">
                <Link2 size={24} />
              </div>
              <span className="account-asset-stat-value affiliate">
                {formatNumber(assetStats.pendingCommission)}
              </span>
              <span className="account-asset-stat-label">Affiliate</span>
              <span className="account-asset-stat-subtitle">Chờ thanh toán</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* QUICK ACTIONS GRID */}
          {/* ═══════════════════════════════════════════ */}
          <h3 className="account-section-title">Quản lý tài sản</h3>
          <div className="account-actions-grid">
            <div
              className="account-action-card"
              onClick={() => handleNavigate('/shop')}
              role="button"
              tabIndex={0}
            >
              <div className="account-action-icon gems">
                <Gem size={24} />
              </div>
              <span className="account-action-title">Mua Gems</span>
              <span className="account-action-subtitle">Nạp & quản lý</span>
            </div>

            <div
              className="account-action-card"
              onClick={() => handleNavigate('/affiliate')}
              role="button"
              tabIndex={0}
            >
              <div className="account-action-icon earnings">
                <DollarSign size={24} />
              </div>
              <span className="account-action-title">Thu Nhập</span>
              <span className="account-action-subtitle">Xem & rút tiền</span>
            </div>

            <div
              className="account-action-card"
              onClick={() => handleNavigate('/portfolio')}
              role="button"
              tabIndex={0}
            >
              <div className="account-action-icon transactions">
                <TrendingUp size={24} />
              </div>
              <span className="account-action-title">Portfolio</span>
              <span className="account-action-subtitle">Quản lý tài sản</span>
            </div>

            <div
              className="account-action-card"
              onClick={() => handleNavigate('/pricing')}
              role="button"
              tabIndex={0}
            >
              <div className="account-action-icon boost">
                <Rocket size={24} />
              </div>
              <span className="account-action-title">Nâng cấp</span>
              <span className="account-action-subtitle">Gói dịch vụ</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: KHÓA HỌC CỦA TÔI */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-menu-section">
            <h3 className="account-section-title gold">Khóa Học Của Tôi</h3>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/courses')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon courses">
                <GraduationCap size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Tất cả khóa học</span>
                <span className="account-menu-subtext">
                  {courseStats.enrolled > 0
                    ? `${courseStats.enrolled} khóa đã đăng ký`
                    : 'Khám phá & đăng ký khóa học'}
                </span>
              </div>
              <ChevronRight size={20} />
            </div>

            {courseStats.inProgress > 0 && (
              <div
                className="account-menu-item"
                onClick={() => handleNavigate('/courses?filter=enrolled')}
                role="button"
                tabIndex={0}
              >
                <div className="account-menu-icon enrolled">
                  <BookOpen size={20} />
                </div>
                <div className="account-menu-content">
                  <span className="account-menu-text">Đang học</span>
                  <span className="account-menu-subtext">
                    {courseStats.inProgress} khóa đang tiến hành
                  </span>
                </div>
                <ChevronRight size={20} />
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: TÀI SẢN */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-menu-section">
            <h3 className="account-section-title gold">Tài Sản</h3>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/portfolio')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon portfolio">
                <Wallet size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Portfolio</span>
                <span className="account-menu-subtext">Quản lý tài sản crypto</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/scanner-v2')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon paper-trade">
                <TrendingUp size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Scanner</span>
                <span className="account-menu-subtext">Quét pattern & giao dịch</span>
              </div>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: CÀI ĐẶT */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-menu-section">
            <div className="account-section-header-row">
              <Settings size={18} className="account-settings-icon" />
              <h3 className="account-section-title red">Cài Đặt</h3>
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/settings/profile')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon profile">
                <User size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Thông tin cá nhân</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/settings/password')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon password">
                <Lock size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Đổi mật khẩu</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/settings/notifications')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon notifications">
                <Bell size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Cài đặt thông báo</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/forum/saved')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon saved">
                <Bookmark size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Bài viết đã lưu</span>
                <span className="account-menu-subtext">Các bài viết bạn đã bookmark</span>
              </div>
              <ChevronRight size={20} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SECTION: KHÁC */}
          {/* ═══════════════════════════════════════════ */}
          <div className="account-menu-section">
            <h3 className="account-section-title gold">Khác</h3>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/help')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon help">
                <HelpCircle size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Trợ giúp & Hỗ trợ</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item"
              onClick={() => handleNavigate('/terms')}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon terms">
                <FileText size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text">Điều khoản sử dụng</span>
              </div>
              <ChevronRight size={20} />
            </div>

            <div
              className="account-menu-item account-logout"
              onClick={handleLogout}
              role="button"
              tabIndex={0}
            >
              <div className="account-menu-icon logout">
                <LogOut size={20} />
              </div>
              <div className="account-menu-content">
                <span className="account-menu-text logout">Đăng xuất</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="account-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'account-spinning' : ''} />
            <span>{refreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
