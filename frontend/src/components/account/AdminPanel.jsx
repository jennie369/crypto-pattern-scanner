/**
 * AdminPanel Component
 * Quick admin actions - only visible to admins
 * Magenta theme for admin distinction
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Bell,
  Package,
  FileText,
  ChevronRight
} from 'lucide-react';
import './AdminPanel.css';

const ADMIN_ACTIONS = [
  {
    id: 'users',
    icon: Users,
    label: 'Quản lý User',
    path: '/admin/users',
    color: '#FF00FF'
  },
  {
    id: 'notifications',
    icon: Bell,
    label: 'Gửi thông báo',
    path: '/admin/notifications',
    color: '#00FFFF'
  },
  {
    id: 'products',
    icon: Package,
    label: 'Sản phẩm',
    path: '/admin/products',
    color: '#FFBD59'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    path: '/admin/analytics',
    color: '#8B5CF6'
  },
  {
    id: 'content',
    icon: FileText,
    label: 'Nội dung',
    path: '/admin/content',
    color: '#00FF88'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Cấu hình',
    path: '/admin/settings',
    color: '#FF4757'
  }
];

export function AdminPanel({ isAdmin = false }) {
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <Shield size={20} className="admin-icon" />
        <h3 className="admin-title">Admin Panel</h3>
      </div>

      <div className="admin-actions-grid">
        {ADMIN_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="admin-action-btn"
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon-wrapper" style={{ background: `${action.color}20` }}>
                <Icon size={20} style={{ color: action.color }} />
              </div>
              <span className="action-label">{action.label}</span>
              <ChevronRight size={16} className="action-arrow" />
            </button>
          );
        })}
      </div>

      <button
        className="admin-dashboard-btn"
        onClick={() => navigate('/admin')}
      >
        <Shield size={16} />
        Mở Admin Dashboard
      </button>
    </div>
  );
}

export default AdminPanel;
