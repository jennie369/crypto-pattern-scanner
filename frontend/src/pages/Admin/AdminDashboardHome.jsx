import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from './adminUtils';
import {
  Users,
  BarChart3,
  Settings,
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

export default function AdminDashboardHome() {
  const { user, profile } = useAuth();
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

  return (
    <>
      {/* Pending Actions Alert */}
      {(analytics.pendingApplications > 0 || analytics.pendingWithdrawals > 0) && (
        <div className="admin-alert-card">
          <h3 className="admin-alert-title"><AlertCircle size={18} /> Cần xử lý</h3>
          <div className="admin-alert-items">
            {analytics.pendingApplications > 0 && (
              <button className="admin-alert-item" onClick={() => navigate('/admin/applications')}>
                <FileText size={18} color="#FF9F43" />
                <span>{analytics.pendingApplications} đơn đăng ký chờ duyệt</span>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            )}
            {analytics.pendingWithdrawals > 0 && (
              <button className="admin-alert-item" onClick={() => navigate('/admin/withdrawals')}>
                <Wallet size={18} color="#00FF88" />
                <span>{analytics.pendingWithdrawals} yêu cầu rút tiền chờ</span>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <h2 className="admin-section-title">Tổng Quan</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <Users size={32} color="#4D9DE0" />
          <span className="admin-stat-value">{analytics.totalUsers}</span>
          <span className="admin-stat-label">Tổng Users</span>
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
      <h2 className="admin-section-title">Tài Chính</h2>
      <div className="admin-financial-cards">
        <div className="admin-financial-card revenue">
          <TrendingUp size={36} color="#00F0FF" />
          <div className="admin-financial-info">
            <span className="admin-financial-label">Doanh thu tháng này</span>
            <span className="admin-financial-value">{formatCurrency(0)}</span>
          </div>
        </div>
        <div className="admin-financial-card commission">
          <CircleDollarSign size={36} color="#FFBD59" />
          <div className="admin-financial-info">
            <span className="admin-financial-label">Tổng hoa hồng đã trả</span>
            <span className="admin-financial-value">{formatCurrency(analytics.totalCommissions)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Quản Lý */}
      <h2 className="admin-section-title">Quản Lý</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/applications')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 159, 67, 0.2)' }}>
            <FileText size={24} color="#FF9F43" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Duyệt Đơn Đăng Ký</span>
            <span className="admin-action-subtitle">{analytics.pendingApplications} đơn chờ xử lý</span>
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
            <span className="admin-action-title">Xử Lý Rút Tiền</span>
            <span className="admin-action-subtitle">{analytics.pendingWithdrawals} yêu cầu chờ</span>
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
            <span className="admin-action-title">Quản Lý Users</span>
            <span className="admin-action-subtitle">Xem & chỉnh sửa thông tin users</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/analytics')}>
          <div className="admin-action-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <BarChart3 size={24} color="#8B5CF6" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Báo Cáo & Thống Kê</span>
            <span className="admin-action-subtitle">Chi tiết doanh thu & hiệu suất</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/notifications')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
            <Bell size={24} color="#FFBD59" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Gửi Thông Báo</span>
            <span className="admin-action-subtitle">Thông báo hệ thống đến users</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/banners')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 107, 107, 0.2)' }}>
            <ImageIcon size={24} color="#FF6B6B" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quản Lý Banner</span>
            <span className="admin-action-subtitle">Banner quảng cáo Portfolio</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Nội Dung & Auto-Post Section */}
      <h2 className="admin-section-title">Nội Dung & Auto-Post</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/calendar')}>
          <div className="admin-action-icon" style={{ background: 'rgba(0, 200, 255, 0.2)' }}>
            <Calendar size={24} color="#00C8FF" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Lịch Nội Dung</span>
            <span className="admin-action-subtitle">Quản lý & lên lịch bài đăng</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/autologs')}>
          <div className="admin-action-icon" style={{ background: 'rgba(76, 175, 80, 0.2)' }}>
            <Send size={24} color="#4CAF50" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Nhật Ký Auto-Post</span>
            <span className="admin-action-subtitle">Theo dõi đăng bài tự động</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <button className="admin-action-card" onClick={() => navigate('/admin/platforms')}>
          <div className="admin-action-icon" style={{ background: 'rgba(156, 39, 176, 0.2)' }}>
            <Settings2 size={24} color="#9C27B0" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Kết Nối Nền Tảng</span>
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
            <span className="admin-action-title">Quản Lý Seed Content</span>
            <span className="admin-action-subtitle">Users, posts, AI bot 24/7</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* Course Admin Section */}
      <h2 className="admin-section-title">Quản Lý Khóa Học</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/courses/admin')}>
          <div className="admin-action-icon" style={{ background: 'rgba(0, 217, 255, 0.2)' }}>
            <GraduationCap size={24} color="#00D9FF" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Quản Lý Khóa Học</span>
            <span className="admin-action-subtitle">Tạo, sửa, xóa courses & lessons</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      {/* System Settings Section */}
      <h2 className="admin-section-title">Hệ Thống</h2>
      <div className="admin-quick-actions">
        <button className="admin-action-card" onClick={() => navigate('/admin/system')}>
          <div className="admin-action-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
            <Settings size={24} color="#FFBD59" />
          </div>
          <div className="admin-action-content">
            <span className="admin-action-title">Cài Đặt Hệ Thống</span>
            <span className="admin-action-subtitle">Cấu hình hệ thống</span>
          </div>
          <ChevronDown size={20} style={{ transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>
    </>
  );
}
