/**
 * SettingsMenu Component
 * List of settings items with icons
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './SettingsMenu.css';

const MENU_SECTIONS = [
  {
    title: 'Tài khoản',
    items: [
      {
        id: 'profile',
        icon: User,
        label: 'Hồ sơ cá nhân',
        path: '/profile',
        color: '#8B5CF6'
      },
      {
        id: 'security',
        icon: Lock,
        label: 'Bảo mật',
        path: '/settings/security',
        color: '#00FF88'
      },
      {
        id: 'notifications',
        icon: Bell,
        label: 'Thông báo',
        path: '/settings/notifications',
        color: '#FFBD59'
      },
      {
        id: 'subscription',
        icon: CreditCard,
        label: 'Gói đăng ký',
        path: '/settings/subscription',
        color: '#00D9FF'
      }
    ]
  },
  {
    title: 'Ứng dụng',
    items: [
      {
        id: 'language',
        icon: Globe,
        label: 'Ngôn ngữ',
        path: '/settings/language',
        color: '#FF6B6B',
        value: 'Tiếng Việt'
      },
      {
        id: 'theme',
        icon: Moon,
        label: 'Giao diện',
        path: '/settings/theme',
        color: '#A0AEC0',
        value: 'Tối'
      },
      {
        id: 'devices',
        icon: Smartphone,
        label: 'Thiết bị',
        path: '/settings/devices',
        color: '#8B5CF6'
      }
    ]
  },
  {
    title: 'Hỗ trợ',
    items: [
      {
        id: 'help',
        icon: HelpCircle,
        label: 'Trung tâm hỗ trợ',
        path: '/help',
        color: '#00D9FF'
      },
      {
        id: 'terms',
        icon: FileText,
        label: 'Điều khoản dịch vụ',
        path: '/terms',
        color: '#A0AEC0'
      },
      {
        id: 'privacy',
        icon: Shield,
        label: 'Chính sách bảo mật',
        path: '/privacy',
        color: '#00FF88'
      }
    ]
  }
];

export function SettingsMenu() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      await signOut();
      navigate('/auth');
    }
  };

  return (
    <div className="settings-menu-container">
      {MENU_SECTIONS.map((section) => (
        <div key={section.title} className="settings-section">
          <h4 className="settings-section-title">{section.title}</h4>
          <div className="settings-items">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="settings-item"
                  onClick={() => navigate(item.path)}
                >
                  <div
                    className="settings-item-icon"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <span className="settings-item-label">{item.label}</span>
                  {item.value && (
                    <span className="settings-item-value">{item.value}</span>
                  )}
                  <ChevronRight size={16} className="settings-item-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </button>

      {/* Version Info */}
      <div className="version-info">
        <span>GEM Platform v2.0.0</span>
      </div>
    </div>
  );
}

export default SettingsMenu;
