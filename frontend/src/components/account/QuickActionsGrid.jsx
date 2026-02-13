/**
 * QuickActionsGrid Component
 * 6 quick action cards for common tasks
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ShoppingBag,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import './QuickActionsGrid.css';

const DEFAULT_ACTIONS = [
  {
    id: 'portfolio',
    icon: Wallet,
    label: 'Portfolio',
    description: 'Xem danh mục',
    path: '/portfolio',
    color: '#00FF88'
  },
  {
    id: 'shop',
    icon: ShoppingBag,
    label: 'Shop',
    description: 'Mua sắm',
    path: '/shop',
    color: '#FFBD59'
  },
  {
    id: 'courses',
    icon: BookOpen,
    label: 'Khóa học',
    description: 'Học trading',
    path: '/courses',
    color: '#8B5CF6'
  },
  {
    id: 'chatbot',
    icon: MessageCircle,
    label: 'Gemral AI',
    description: 'Tư vấn AI',
    path: '/chatbot',
    color: '#00D9FF'
  },
  {
    id: 'scanner',
    icon: BarChart3,
    label: 'Scanner',
    description: 'Quét thị trường',
    path: '/scanner',
    color: '#FF6B6B'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Cài đặt',
    description: 'Tùy chỉnh',
    path: '/settings',
    color: '#A0AEC0'
  }
];

export function QuickActionsGrid({ actions = DEFAULT_ACTIONS }) {
  const navigate = useNavigate();

  return (
    <div className="quick-actions-grid">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            className="quick-action-card"
            onClick={() => navigate(action.path)}
          >
            <div
              className="action-icon-bg"
              style={{ background: `${action.color}15`, borderColor: `${action.color}30` }}
            >
              <Icon size={24} style={{ color: action.color }} />
            </div>
            <span className="action-label">{action.label}</span>
            <span className="action-desc">{action.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActionsGrid;
