/**
 * Account Dashboard - Main Hub (like Binance Square)
 * Layout: CompactSidebar | 3-column content (Profile + Widgets | Stats + Activity | Quick Actions + Notifications)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';
import {
  User,
  TrendingUp,
  Activity,
  DollarSign,
  Bell,
  Settings,
  Award,
  Users,
  BarChart3,
  MessageSquare,
  Star,
  ChevronRight,
  Calendar,
  Target,
  Zap,
  Briefcase
} from 'lucide-react';
import UserBadges from '../../components/UserBadge/UserBadges';
import { Card } from '../../components-v2/Card';
import NewsFeed from './components/NewsFeed';
import { WidgetFactory } from '../../components/Widgets/WidgetFactory';
import { supabase } from '../../lib/supabaseClient';
import './AccountDashboard.css';

const AccountDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Get Portfolio data
  const {
    stats: portfolioStats,
    transactions,
    loading: portfolioLoading
  } = usePortfolio(user?.id);

  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    // Load dashboard activity
    setRecentActivity([
      {
        id: 1,
        type: 'pattern',
        title: 'Head & Shoulders detected on BTC/USDT',
        time: '2 hours ago',
        icon: 'TrendingUp'
      },
      {
        id: 2,
        type: 'trade',
        title: 'Closed ETH/USDT position +$450',
        time: '5 hours ago',
        icon: 'DollarSign'
      },
      {
        id: 3,
        type: 'community',
        title: 'New comment on your analysis',
        time: '1 day ago',
        icon: 'MessageSquare'
      }
    ]);

    setNotifications([
      {
        id: 1,
        title: 'Scanner quota reset',
        desc: 'Your daily scans have been refreshed',
        time: 'Just now',
        unread: true
      },
      {
        id: 2,
        title: 'New achievement unlocked',
        desc: 'Consistent Trader badge earned!',
        time: '2 hours ago',
        unread: true
      }
    ]);
  };

  if (loading) {
    return (
      <div className="account-dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const getTierColor = (tier) => {
    const colors = {
      'FREE': '#7B68EE',
      'TIER1': '#00D9FF',
      'TIER2': '#FFBD59',
      'TIER3': '#FFFFFF'
    };
    return colors[tier] || '#7B68EE';
  };

  const getTierGradient = (tier) => {
    const gradients = {
      'FREE': 'linear-gradient(135deg, rgba(123, 104, 238, 0.15) 0%, rgba(123, 104, 238, 0.05) 100%)',
      'TIER1': 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(0, 217, 255, 0.05) 100%)',
      'TIER2': 'linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%)',
      'TIER3': 'linear-gradient(135deg, #FFBD59 0%, #9C0612 100%)'
    };
    return gradients[tier] || gradients['FREE'];
  };

  // Calculate portfolio stats for display
  const portfolioData = portfolioStats ? {
    totalValue: portfolioStats.totalValue || 0,
    totalPnL: portfolioStats.totalPnl || portfolioStats.totalPnL || 0,
    totalPnLPercent: portfolioStats.totalPnlPercent || portfolioStats.totalPnLPercent || 0,
    activePositions: portfolioStats.holdingsCount || portfolioStats.activePositions || 0
  } : {
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    activePositions: 0
  };

  // Calculate win/loss stats
  const calculateWinRate = () => {
    if (!transactions || transactions.length === 0) return { winRate: 0, wins: 0, total: 0 };

    const closedTrades = transactions.filter(t => t.type === 'sell');
    const wins = closedTrades.filter(t => (t.realizedPnl || 0) > 0).length;
    const total = closedTrades.length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    return { winRate, wins, total };
  };

  const winRateData = calculateWinRate();

  // Define stats object for Quick Stats Widget
  const stats = {
    winRate: winRateData.winRate || 0,
    profitLoss: portfolioData.totalPnL || 0,
    totalTrades: winRateData.total || 0
  };

  return (
    <div className="account-dashboard-wrapper">
      <div className="account-dashboard">
        {/* Dashboard Content */}
        <div className="account-dashboard-content">
        <div className="account-layout-3col">
        {/* ===== LEFT COLUMN: Profile + Widgets ===== */}
        <aside className="account-left">
          {/* Profile Card */}
          <div className="widget-card profile-card" style={{ background: getTierGradient(profile?.scanner_tier || 'FREE') }}>
            <div className="profile-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || 'User'} />
              ) : (
                <div className="avatar-placeholder">
                  <User size={48} />
                </div>
              )}
            </div>

            <h2 className="profile-name">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
            <p className="profile-email">{user?.email}</p>

            <div className="profile-tier" style={{ color: getTierColor(profile?.scanner_tier || 'FREE') }}>
              {profile?.scanner_tier || 'FREE'} Member
            </div>

            {/* User Badges */}
            <div className="profile-badges">
              <UserBadges user={profile} size="medium" />
            </div>

            <button className="btn-edit-profile" onClick={() => navigate('/profile')}>
              <Settings size={16} /> Edit Profile
            </button>
          </div>

          {/* Quick Stats Widget */}
          <div className="widget-card">
            <h3 className="widget-title">Quick Stats</h3>
            <div className="quick-stats-list">
              <div className="quick-stat-item">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value" style={{ color: '#10B981' }}>{stats.winRate}%</span>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Total P&L</span>
                <span className="stat-value" style={{ color: stats.profitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                  ${stats.profitLoss.toLocaleString()}
                </span>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Trades</span>
                <span className="stat-value">{stats.totalTrades}</span>
              </div>
            </div>
          </div>

          {/* Tier Usage Widget */}
          <div className="widget-card">
            <h3 className="widget-title">Tier Usage</h3>
            <div className="tier-usage-content">
              <div className="usage-item">
                <span className="usage-label">Daily Scans</span>
                <div className="usage-bar">
                  <div className="usage-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="usage-text">12 / 20</span>
              </div>
              <div className="usage-item">
                <span className="usage-label">AI Predictions</span>
                <div className="usage-bar">
                  <div className="usage-fill" style={{ width: '40%' }}></div>
                </div>
                <span className="usage-text">8 / 20</span>
              </div>
            </div>
            <button className="btn-upgrade" onClick={() => navigate('/pricing')}>
              <Star size={16} /> Upgrade Tier
            </button>
          </div>
        </aside>

        {/* ===== CENTER COLUMN: Stats + Activity Feed ===== */}
        <main className="account-center">
          <h1 className="dashboard-title">Account Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {profile?.full_name || 'Trader'}!</p>

          {/* Portfolio Stats Grid - Click to navigate */}
          <div className="portfolio-stats-section">
            <div className="section-header">
              <div className="header-left">
                <Briefcase size={24} className="section-icon" />
                <h2 className="section-title">Portfolio Overview</h2>
              </div>
              <button
                className="btn-view-portfolio"
                onClick={() => navigate('/portfolio')}
              >
                View Full Portfolio <ChevronRight size={16} />
              </button>
            </div>

            <div className="stats-grid" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              {/* Card 1: Total Portfolio Value */}
              <Card variant="stat" hoverable>
                <div className="stat-icon" style={{ background: 'rgba(255, 189, 89, 0.1)' }}>
                  <DollarSign size={24} style={{ color: '#FFBD59' }} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-label">Total Portfolio Value</h4>
                  <p className="stat-number">
                    ${Math.round(portfolioData.totalValue).toLocaleString()}
                  </p>
                  <span className={`stat-change ${portfolioData.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                    {portfolioData.totalPnL >= 0 ? '+' : ''}
                    ${Math.abs(Math.round(portfolioData.totalPnL)).toLocaleString()}
                    ({portfolioData.totalPnLPercent.toFixed(2)}%)
                  </span>
                </div>
              </Card>

              {/* Card 2: Total P&L */}
              <Card variant="stat" hoverable>
                <div className="stat-icon" style={{ background: portfolioData.totalPnL >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                  <TrendingUp size={24} style={{ color: portfolioData.totalPnL >= 0 ? '#10B981' : '#EF4444' }} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-label">Total P&L</h4>
                  <p className={`stat-number ${portfolioData.totalPnL >= 0 ? 'text-gradient-gold' : ''}`}
                     style={{ color: portfolioData.totalPnL >= 0 ? '#10B981' : '#EF4444' }}>
                    {portfolioData.totalPnL >= 0 ? '+' : ''}
                    ${Math.abs(Math.round(portfolioData.totalPnL)).toLocaleString()}
                  </p>
                  <span className={`stat-change ${portfolioData.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                    {portfolioData.totalPnL >= 0 ? '+' : ''}{portfolioData.totalPnLPercent.toFixed(2)}% All Time
                  </span>
                </div>
              </Card>

              {/* Card 3: Win Rate */}
              <Card variant="stat" hoverable>
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Target size={24} style={{ color: '#3B82F6' }} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-label">Win Rate</h4>
                  <p className="stat-number">{winRateData.winRate}%</p>
                  <span className="stat-change">
                    {winRateData.wins}/{winRateData.total} trades
                  </span>
                </div>
              </Card>

              {/* Card 4: Active Positions */}
              <Card variant="stat" hoverable>
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <BarChart3 size={24} style={{ color: '#8B5CF6' }} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-label">Active Positions</h4>
                  <p className="stat-number">{portfolioData.activePositions}</p>
                  <span className="stat-change">
                    ${Math.round(portfolioData.totalValue).toLocaleString()} total
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* News Feed Widget */}
          <NewsFeed />

          {/* Achievements */}
          <div className="achievements-section">
            <div className="section-header">
              <h2 className="section-title">Recent Achievements</h2>
              <button className="btn-view-all" onClick={() => navigate('/achievements')}>
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="achievements-grid">
              <div className="achievement-badge">
                <Award size={32} style={{ color: '#FFBD59' }} />
                <p className="achievement-name">Consistent Trader</p>
              </div>
              <div className="achievement-badge">
                <Target size={32} style={{ color: '#10B981' }} />
                <p className="achievement-name">Perfect Week</p>
              </div>
              <div className="achievement-badge locked">
                <Zap size={32} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p className="achievement-name">High Roller</p>
              </div>
            </div>
          </div>
        </main>

        {/* ===== RIGHT COLUMN: Quick Actions + Notifications ===== */}
        <aside className="account-right">
          {/* Quick Actions */}
          <div className="widget-card">
            <h3 className="widget-title">Quick Actions</h3>
            <div className="quick-actions-list">
              <button className="quick-action-btn" onClick={() => navigate('/scanner')}>
                <BarChart3 size={18} />
                <span>Scan Market</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/ai-prediction')}>
                <Zap size={18} />
                <span>AI Prediction</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/backtesting')}>
                <Activity size={18} />
                <span>Backtest Strategy</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/forum')}>
                <Users size={18} />
                <span>Join Community</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Notifications</h3>
              <Bell size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-desc">{notif.desc}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                  {notif.unread && <div className="notification-dot"></div>}
                </div>
              ))}
            </div>
            <button className="btn-view-all-notif" onClick={() => navigate('/notifications')}>
              View All Notifications
            </button>
          </div>

          {/* Calendar Widget */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Economic Calendar</h3>
              <Calendar size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <div className="calendar-events">
              <div className="calendar-event high-impact">
                <div className="event-time">14:00</div>
                <div className="event-info">
                  <p className="event-title">FOMC Meeting</p>
                  <span className="event-impact">High Impact</span>
                </div>
              </div>
              <div className="calendar-event medium-impact">
                <div className="event-time">16:30</div>
                <div className="event-info">
                  <p className="event-title">NFP Report</p>
                  <span className="event-impact">Medium Impact</span>
                </div>
              </div>
            </div>
            <button className="btn-view-all-notif" onClick={() => navigate('/calendar')}>
              View Full Calendar
            </button>
          </div>
        </aside>
      </div>
      </div>
    </div>
    </div>
  );
};

export default AccountDashboard;
