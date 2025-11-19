import React, { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Target,
  DollarSign,
  BarChart3,
  Flame,
  Activity
} from 'lucide-react';
import leaderboardService from '../../services/leaderboard';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import './Leaderboard.css';

// Icon mapper for metric icons
const iconMap = {
  Target,
  DollarSign,
  BarChart3,
  TrendingUp,
  Flame,
  Activity
};

const MetricIcon = ({ iconName, size = 16 }) => {
  const Icon = iconMap[iconName];
  return Icon ? <Icon size={size} /> : null;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('win_rate');
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  const metrics = leaderboardService.getMetrics();
  const periods = leaderboardService.getPeriods();

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMetric, selectedPeriod]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard({
        metric: selectedMetric,
        period: selectedPeriod
      });
      setLeaderboard(data.leaderboard);

      // Get user rank
      if (user) {
        const rank = await leaderboardService.getUserRank(user.id, selectedMetric);
        setUserRank(rank);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} color="#FFD700" />;
    if (rank === 2) return <Crown size={22} color="#C0C0C0" />;
    if (rank === 3) return <Crown size={20} color="#CD7F32" />;
    return null;
  };

  const getRankChange = (change) => {
    if (change > 0) return { icon: <TrendingUp size={16} />, color: '#00FF88' };
    if (change < 0) return { icon: <TrendingDown size={16} />, color: '#EF4444' };
    return { icon: <Minus size={16} />, color: 'rgba(255, 255, 255, 0.4)' };
  };

  const formatValue = (value, metric) => {
    const metricInfo = metrics.find(m => m.id === metric);
    if (!metricInfo || value === null || value === undefined) return '-';

    if (metricInfo.suffix === '%') {
      return `${parseFloat(value).toFixed(2)}%`;
    }
    if (metricInfo.suffix === '$') {
      return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value;
  };

  return (
    <div className="leaderboard-container">
      {/* Filters */}
      <div className="leaderboard-filters card-glass">
        {/* Metric Filter */}
        <div className="filter-section">
          <label className="filter-label">Xếp Hạng Theo</label>
          <div className="filter-buttons">
            {metrics.map(metric => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`filter-btn ${selectedMetric === metric.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MetricIcon iconName={metric.icon} size={16} />
                <span>{metric.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Period Filter */}
        <div className="filter-section">
          <label className="filter-label">Thời Gian</label>
          <div className="filter-buttons">
            {periods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`filter-btn ${selectedPeriod === period.id ? 'active period' : ''}`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <div className="user-rank-card card-glass">
          <div className="rank-badge">
            #{userRank}
          </div>
          <div className="rank-info">
            <p className="rank-label">Xếp Hạng Của Bạn</p>
            <h3 className="rank-title">
              Top {userRank} / {leaderboard.length}
            </h3>
          </div>
          <Trophy size={32} color="#FFBD59" />
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="leaderboard-table card-glass">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <Trophy size={64} color="rgba(255, 255, 255, 0.3)" />
            <h3>No Rankings Yet</h3>
            <p>Start trading to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="th-rank">Hạng</th>
                  <th className="th-trader">Trader</th>
                  <th className="th-value">
                    {metrics.find(m => m.id === selectedMetric)?.label}
                  </th>
                  <th className="th-change">Thay Đổi</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isUser = entry.user_id === user?.id;
                  const rankChange = getRankChange(entry.rank_change);
                  const metricValue = entry[leaderboardService.getOrderColumn(selectedMetric)];

                  return (
                    <tr
                      key={entry.user_id}
                      className={`leaderboard-row ${isUser ? 'current-user' : ''}`}
                    >
                      {/* Rank */}
                      <td className="td-rank">
                        <div className="rank-cell">
                          {getRankIcon(entry.rank)}
                          <span className={`rank-number ${entry.rank <= 3 ? 'top-rank' : ''}`}>
                            {entry.rank}
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="td-user">
                        <div className="user-cell">
                          <img
                            src={entry.profiles?.avatar_url || '/default-avatar.png'}
                            alt={entry.profiles?.display_name || 'User'}
                            className={`user-avatar ${entry.rank <= 3 ? 'top-avatar' : ''}`}
                          />
                          <div className="user-details">
                            <div className="user-name-badges">
                              <h4 className="user-name">
                                {entry.profiles?.display_name || 'Anonymous'}
                                {isUser && <span className="you-badge">YOU</span>}
                              </h4>
                              <UserBadges user={entry.profiles} size="small" />
                            </div>
                            <p className="user-meta">
                              {entry.profiles?.scanner_tier?.toUpperCase() || 'FREE'} •
                              Tham gia {new Date(entry.profiles?.created_at).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Metric Value */}
                      <td className="td-value">
                        <span className="metric-value">
                          {formatValue(metricValue, selectedMetric)}
                        </span>
                      </td>

                      {/* Rank Change */}
                      <td className="td-change">
                        <div className="rank-change" style={{ color: rankChange.color }}>
                          {rankChange.icon}
                          <span>{Math.abs(entry.rank_change) || '-'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
