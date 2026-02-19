import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from './adminUtils';
import {
  Users,
  BarChart3,
  Settings,
  Lock,
  Shield,
  XCircle,
  Clock,
  Crown,
  User,
  CircleDollarSign,
  TrendingUp,
  FileText,
  Wallet,
  AlertCircle,
  Award,
  Bell,
  Image as ImageIcon,
  Calendar,
  Send,
  Settings2,
  Bot,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import '../Admin.css';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, profile, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    adminUsers: 0,
    totalScans: 0,
    totalAffiliates: 0,
    totalCtvs: 0,
    pendingApplications: 0,
    pendingWithdrawals: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadAnalytics();
    }
  }, [user, profile?.role]);

  const loadAnalytics = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analytics request timeout')), 10000)
      );

      const usersQuery = supabase
        .from('profiles')
        .select('scanner_tier, role');

      const { data: usersData, error: usersError } = await Promise.race([usersQuery, timeoutPromise]);

      if (usersError) throw usersError;

      const tierCounts = usersData.reduce((acc, user) => {
        if (user.role === 'admin') {
          acc.adminUsers++;
        } else if (!user.scanner_tier || user.scanner_tier === 'FREE') {
          acc.freeUsers++;
        } else {
          acc.premiumUsers++;
        }
        acc.totalUsers++;
        return acc;
      }, { totalUsers: 0, freeUsers: 0, premiumUsers: 0, adminUsers: 0 });

      const scansQuery = supabase
        .from('scan_history')
        .select('id', { count: 'exact', head: true });

      const { data: scansData } = await Promise.race([scansQuery, timeoutPromise]);

      const { data: partnerStats } = await supabase
        .from('profiles')
        .select('partner_role, partner_tier')
        .not('partner_role', 'is', null);

      let affiliateCount = 0;
      let ctvCount = 0;
      if (partnerStats) {
        partnerStats.forEach(p => {
          if (p.partner_role === 'affiliate') affiliateCount++;
          if (p.partner_role === 'ctv') ctvCount++;
        });
      }

      const { count: pendingApps } = await supabase
        .from('partnership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingWithdrs } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'approved', 'processing']);

      const { data: commissionsData } = await supabase
        .from('affiliate_commissions')
        .select('commission_amount');

      const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

      setAnalytics({
        ...tierCounts,
        totalScans: scansData || 0,
        totalAffiliates: affiliateCount,
        totalCtvs: ctvCount,
        pendingApplications: pendingApps || 0,
        pendingWithdrawals: pendingWithdrs || 0,
        totalCommissions,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><Clock size={48} /></div>
          <h2>{t('loading') || 'Loading...'}</h2>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><Lock size={48} /></div>
          <h2>Yeu Cau Dang Nhap</h2>
          <p>Ban can dang nhap de truy cap Bang Quan Tri.</p>
          <p>Vui long vao <strong><Settings size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cai Dat</strong> de dang nhap hoac tao tai khoan.</p>
        </div>
      </div>
    );
  }

  // Check admin role
  if (!isAdmin()) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><XCircle size={48} /></div>
          <h2>Khong Co Quyen Truy Cap</h2>
          <p>Ban can quyen ADMIN de truy cap trang nay.</p>
          <p>Hien tai ban la: <strong>{profile?.role || 'user'}</strong></p>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/applications', icon: FileText, label: 'Don Dang Ky', badge: analytics.pendingApplications },
    { to: '/admin/withdrawals', icon: Wallet, label: 'Rut Tien', badge: analytics.pendingWithdrawals },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/notifications', icon: Bell, label: 'Thong Bao' },
    { to: '/admin/banners', icon: ImageIcon, label: 'Banners' },
    { to: '/admin/calendar', icon: Calendar, label: 'Lich Noi Dung' },
    { to: '/admin/autologs', icon: Send, label: 'Auto-Post Logs' },
    { to: '/admin/platforms', icon: Settings2, label: 'Nen Tang' },
    { to: '/admin/seedcontent', icon: Bot, label: 'Seed Content' },
    { to: '/admin/system', icon: Settings, label: 'System' },
  ];

  return (
    <div className="admin-page">
      {/* Header with Admin Badge */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />Admin Dashboard</h1>
          <p className="subtitle">Quan ly he thong GEM Platform</p>
        </div>
        <div className="admin-badge-large">ADMIN</div>
      </div>

      {/* Pending Actions Alert */}
      {(analytics.pendingApplications > 0 || analytics.pendingWithdrawals > 0) && (
        <div className="admin-alert-card">
          <h3 className="admin-alert-title"><AlertCircle size={18} /> Can xu ly</h3>
          <div className="admin-alert-items">
            {analytics.pendingApplications > 0 && (
              <button className="admin-alert-item" onClick={() => navigate('/admin/applications')}>
                <FileText size={18} color="#FF9F43" />
                <span>{analytics.pendingApplications} don dang ky cho duyet</span>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            )}
            {analytics.pendingWithdrawals > 0 && (
              <button className="admin-alert-item" onClick={() => navigate('/admin/withdrawals')}>
                <Wallet size={18} color="#00FF88" />
                <span>{analytics.pendingWithdrawals} yeu cau rut tien cho</span>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <h2 className="admin-section-title">Tong Quan</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <Users size={32} color="#4D9DE0" />
          <span className="admin-stat-value">{analytics.totalUsers}</span>
          <span className="admin-stat-label">Tong Users</span>
        </div>
        <div className="admin-stat-card">
          <User size={32} color="#FF9F43" />
          <span className="admin-stat-value">{analytics.totalAffiliates}</span>
          <span className="admin-stat-label">Affiliates (3%)</span>
        </div>
        <div className="admin-stat-card">
          <Award size={32} color="#00FF88" />
          <span className="admin-stat-value">{analytics.totalCtvs}</span>
          <span className="admin-stat-label">CTVs (10-30%)</span>
        </div>
        <div className="admin-stat-card">
          <Crown size={32} color="#8B5CF6" />
          <span className="admin-stat-value">{analytics.adminUsers}</span>
          <span className="admin-stat-label">Admin Users</span>
        </div>
      </div>

      {/* Financial Stats */}
      <h2 className="admin-section-title">Tai Chinh</h2>
      <div className="admin-financial-cards">
        <div className="admin-financial-card revenue">
          <TrendingUp size={36} color="#00F0FF" />
          <div className="admin-financial-info">
            <span className="admin-financial-label">Doanh thu thang nay</span>
            <span className="admin-financial-value">{formatCurrency(0)}</span>
          </div>
        </div>
        <div className="admin-financial-card commission">
          <CircleDollarSign size={36} color="#FFBD59" />
          <div className="admin-financial-info">
            <span className="admin-financial-label">Tong hoa hong da tra</span>
            <span className="admin-financial-value">{formatCurrency(analytics.totalCommissions)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Quan Ly */}
      <h2 className="admin-section-title">Quan Ly</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/applications')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 159, 67, 0.2)' }}>
            <FileText size={24} color="#FF9F43" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Duyet Don Dang Ky</span>
            <span className="admin-action-subtitle">{analytics.pendingApplications} don cho xu ly</span>
          </div>
          {analytics.pendingApplications > 0 && (
            <span className="admin-action-badge">{analytics.pendingApplications}</span>
          )}
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/withdrawals')}>
          <div className="admin-action-icon" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
            <Wallet size={24} color="#00FF88" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Xu Ly Rut Tien</span>
            <span className="admin-action-subtitle">{analytics.pendingWithdrawals} yeu cau cho</span>
          </div>
          {analytics.pendingWithdrawals > 0 && (
            <span className="admin-action-badge">{analytics.pendingWithdrawals}</span>
          )}
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/users')}>
          <div className="admin-action-icon" style={{ background: 'rgba(77, 157, 224, 0.2)' }}>
            <Users size={24} color="#4D9DE0" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quan Ly Users</span>
            <span className="admin-action-subtitle">Xem & chinh sua thong tin users</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/analytics')}>
          <div className="admin-action-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <BarChart3 size={24} color="#8B5CF6" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Bao Cao & Thong Ke</span>
            <span className="admin-action-subtitle">Chi tiet doanh thu & hieu suat</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/notifications')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
            <Bell size={24} color="#FFBD59" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Gui Thong Bao</span>
            <span className="admin-action-subtitle">Thong bao he thong den users</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/banners')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 107, 107, 0.2)' }}>
            <ImageIcon size={24} color="#FF6B6B" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quan Ly Banner</span>
            <span className="admin-action-subtitle">Banner quang cao Portfolio</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Noi Dung & Auto-Post Section */}
      <h2 className="admin-section-title">Noi Dung & Auto-Post</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/calendar')}>
          <div className="admin-action-icon" style={{ background: 'rgba(0, 200, 255, 0.2)' }}>
            <Calendar size={24} color="#00C8FF" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Lich Noi Dung</span>
            <span className="admin-action-subtitle">Quan ly & len lich bai dang</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/autologs')}>
          <div className="admin-action-icon" style={{ background: 'rgba(76, 175, 80, 0.2)' }}>
            <Send size={24} color="#4CAF50" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Nhat Ky Auto-Post</span>
            <span className="admin-action-subtitle">Theo doi dang bai tu dong</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/platforms')}>
          <div className="admin-action-icon" style={{ background: 'rgba(156, 39, 176, 0.2)' }}>
            <Settings2 size={24} color="#9C27B0" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Ket Noi Nen Tang</span>
            <span className="admin-action-subtitle">Facebook, TikTok, YouTube...</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Seed Content & AI Bot Section */}
      <h2 className="admin-section-title">Seed Content & AI Bot</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/seedcontent')}>
          <div className="admin-action-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <Bot size={24} color="#8B5CF6" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quan Ly Seed Content</span>
            <span className="admin-action-subtitle">Users, posts, AI bot 24/7</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Course Admin Section */}
      <h2 className="admin-section-title">Quan Ly Khoa Hoc</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/courses/admin')}>
          <div className="admin-action-icon" style={{ background: 'rgba(0, 217, 255, 0.2)' }}>
            <GraduationCap size={24} color="#00D9FF" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quan Ly Khoa Hoc</span>
            <span className="admin-action-subtitle">Tao, sua, xoa courses & lessons</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* System Settings Section */}
      <h2 className="admin-section-title">He Thong</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/system')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
            <Settings size={24} color="#FFBD59" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">System Settings</span>
            <span className="admin-action-subtitle">Cau hinh he thong</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Tab Navigation */}
      <h2 className="admin-section-title" style={{ marginTop: '40px' }}>Chi Tiet Quan Ly</h2>
      <div className="admin-tabs">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            <item.icon size={16} /> {item.label}
            {item.badge > 0 && (
              <span className="tab-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Route content renders here */}
      <Outlet />
    </div>
  );
}
