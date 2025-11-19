import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Hash,
  Newspaper,
  Calendar,
  History,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import './LeftSidebar.css';

/**
 * LeftSidebar Component - REDESIGNED TO LIST-STYLE NAVIGATION
 * Left column of 3-column Community Hub
 *
 * Features:
 * - List-style navigation (no card containers)
 * - Items: Home, Trending, Chủ đề (Categories), News, Events, History, Notification, Settings
 * - Collapsible categories section
 * - Active state highlighting
 */
export default function LeftSidebar({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  /**
   * Navigation items configuration
   */
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => navigate('/forum'),
      isActive: location.pathname === '/forum'
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      onClick: () => console.log('Trending clicked'),
      isActive: false
    },
    {
      id: 'categories',
      label: 'Chủ đề',
      icon: Hash,
      onClick: () => setCategoriesExpanded(!categoriesExpanded),
      isActive: false,
      hasSubmenu: true,
      isExpanded: categoriesExpanded
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      onClick: () => console.log('News clicked'),
      isActive: false
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      onClick: () => navigate('/events'),
      isActive: location.pathname === '/events'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      onClick: () => console.log('History clicked'),
      isActive: false
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: Bell,
      onClick: () => console.log('Notification clicked'),
      isActive: false
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/settings'),
      isActive: location.pathname === '/settings'
    }
  ];

  /**
   * Get category Vietnamese label
   */
  const getCategoryLabel = (slug) => {
    const labels = {
      'all': 'Tất cả',
      'trading-discussion': 'Thảo luận Trading',
      'pattern-help': 'Hỏi đáp Pattern',
      'spiritual': 'Tâm linh',
      'success-stories': 'Chia sẻ thành công',
      'questions': 'Hỏi & Đáp'
    };
    return labels[slug] || slug;
  };

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              <button
                className={`nav-item ${item.isActive ? 'active' : ''}`}
                onClick={item.onClick}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.hasSubmenu && (
                  <span className="nav-chevron">
                    {item.isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>
                )}
              </button>

              {/* Categories Submenu */}
              {item.id === 'categories' && item.isExpanded && (
                <div className="categories-submenu">
                  {/* All Categories */}
                  <button
                    className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => onCategoryChange('all')}
                  >
                    <Hash size={16} className="category-icon" />
                    <span className="category-name">Tất cả</span>
                  </button>

                  {/* Category Items */}
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      className={`category-item ${selectedCategory === category.slug ? 'active' : ''}`}
                      onClick={() => onCategoryChange(category.slug)}
                    >
                      <Hash size={16} className="category-icon" />
                      <span className="category-name">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Events Simplified Widget */}
      <div className="events-widget">
        <div className="events-widget-header">
          <Calendar size={16} />
          <h4>Sự kiện sắp tới</h4>
        </div>
        <div className="events-list">
          <div className="event-item">
            <div className="event-date">
              <span className="event-day">15</span>
              <span className="event-month">Jan</span>
            </div>
            <div className="event-info">
              <p className="event-title">Webinar: Trading Strategies</p>
              <p className="event-time">14:00 - 16:00</p>
            </div>
          </div>
          <div className="event-item">
            <div className="event-date">
              <span className="event-day">22</span>
              <span className="event-month">Jan</span>
            </div>
            <div className="event-info">
              <p className="event-title">Live Q&A Session</p>
              <p className="event-time">19:00 - 20:30</p>
            </div>
          </div>
        </div>
        <button className="view-all-events" onClick={() => navigate('/events')}>
          Xem tất cả →
        </button>
      </div>
    </aside>
  );
}
