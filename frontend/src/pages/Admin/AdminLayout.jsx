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
          <h2>Y\u00EAu C\u1EA7u \u0110\u0103ng Nh\u1EADp</h2>
          <p>B\u1EA1n c\u1EA7n \u0111\u0103ng nh\u1EADp \u0111\u1EC3 truy c\u1EADp B\u1EA3ng Qu\u1EA3n Tr\u1ECB.</p>
          <p>Vui l\u00F2ng v\u00E0o <strong><Settings size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> C\u00E0i \u0110\u1EB7t</strong> \u0111\u1EC3 \u0111\u0103ng nh\u1EADp ho\u1EB7c t\u1EA1o t\u00E0i kho\u1EA3n.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="admin-page">
        <div className="auth-required">
          <div className="auth-icon"><XCircle size={48} /></div>
          <h2>Kh\u00F4ng C\u00F3 Quy\u1EC1n Truy C\u1EADp</h2>
          <p>B\u1EA1n c\u1EA7n quy\u1EC1n ADMIN \u0111\u1EC3 truy c\u1EADp trang n\u00E0y.</p>
          <p>Hi\u1EC7n t\u1EA1i b\u1EA1n l\u00E0: <strong>{profile?.role || 'user'}</strong></p>
        </div>
      </div>
    );
  }

  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  const navItems = [
    { to: '/admin', icon: Home, label: 'T\u1ED5ng Quan', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/applications', icon: FileText, label: '\u0110\u01A1n \u0110\u0103ng K\u00FD' },
    { to: '/admin/withdrawals', icon: Wallet, label: 'R\u00FAt Ti\u1EC1n' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/notifications', icon: Bell, label: 'Th\u00F4ng B\u00E1o' },
    { to: '/admin/banners', icon: ImageIcon, label: 'Banners' },
    { to: '/admin/calendar', icon: Calendar, label: 'L\u1ECBch N\u1ED9i Dung' },
    { to: '/admin/autologs', icon: Send, label: 'Auto-Post Logs' },
    { to: '/admin/platforms', icon: Settings2, label: 'N\u1EC1n T\u1EA3ng' },
    { to: '/admin/seedcontent', icon: Bot, label: 'Seed Content' },
    { to: '/admin/system', icon: Settings, label: 'H\u1EC7 Th\u1ED1ng' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px' }} />Admin Dashboard</h1>
          <p className="subtitle">Qu\u1EA3n l\u00FD h\u1EC7 th\u1ED1ng GEM Platform</p>
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

      {/* Route content renders here — immediately visible */}
      <Outlet />
    </div>
  );
}
