import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  BarChart3,
  Settings,
  Lock,
  Shield,
  XCircle,
  Clock,
  FileText,
  Wallet,
  Bell,
  Image as ImageIcon,
  Calendar,
  Send,
  Settings2,
  Bot,
  Home,
} from 'lucide-react';
import '../Admin.css';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><Lock size={48} /></div>
          <h2>Yêu Cầu Đăng Nhập</h2>
          <p>Bạn cần đăng nhập để truy cập Bảng Quản Trị.</p>
          <p>Vui lòng vào <strong><Settings size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cài Đặt</strong> để đăng nhập hoặc tạo tài khoản.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><XCircle size={48} /></div>
          <h2>Không Có Quyền Truy Cập</h2>
          <p>Bạn cần quyền ADMIN để truy cập trang này.</p>
          <p>Hiện tại bạn là: <strong>{profile?.role || 'user'}</strong></p>
        </div>
      </div>
    );
  }

  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  const navItems = [
    { to: '/admin', icon: Home, label: 'Tổng Quan', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/applications', icon: FileText, label: 'Đơn Đăng Ký' },
    { to: '/admin/withdrawals', icon: Wallet, label: 'Rút Tiền' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/notifications', icon: Bell, label: 'Thông Báo' },
    { to: '/admin/banners', icon: ImageIcon, label: 'Banners' },
    { to: '/admin/calendar', icon: Calendar, label: 'Lịch Nội Dung' },
    { to: '/admin/autologs', icon: Send, label: 'Auto-Post Logs' },
    { to: '/admin/platforms', icon: Settings2, label: 'Nền Tảng' },
    { to: '/admin/seedcontent', icon: Bot, label: 'Seed Content' },
    { to: '/admin/system', icon: Settings, label: 'Hệ Thống' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />Admin Dashboard</h1>
          <p className="subtitle">Quản lý hệ thống GEM Platform</p>
        </div>
        <div className="admin-badge-large">ADMIN</div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            <item.icon size={16} /> {item.label}
          </NavLink>
        ))}
      </div>

      {/* Route content renders here */}
      <Outlet />
    </div>
  );
}
