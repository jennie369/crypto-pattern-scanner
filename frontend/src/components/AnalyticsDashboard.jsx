import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, MessageSquare, Zap, Star, X, RefreshCw } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [usageByDays, setUsageByDays] = useState([]);
  const [usageByMode, setUsageByMode] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const analytics = analyticsService.getAnalytics();
    setSummary(analyticsService.getSummary());
    setUsageByDays(analyticsService.getUsageByDays(7));
    setUsageByMode(analyticsService.getUsageByMode());
    setPopularQuestions(analytics.popularQuestions.slice(0, 5));
  };

  const handleReset = () => {
    analyticsService.resetAnalytics();
    loadAnalytics();
  };

  const handleExport = () => {
    analyticsService.exportAnalytics();
  };

  if (!summary) return null;

  const maxDayCount = Math.max(...usageByDays.map(d => d.count), 1);
  const maxModeCount = Math.max(...usageByMode.map(m => m.count), 1);

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h2 className="analytics-title">
              <BarChart3 size={24} />
              Analytics Dashboard
            </h2>
            <p className="analytics-subtitle">Chatbot Usage Statistics</p>
          </div>
          <button onClick={onClose} className="analytics-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 217, 255, 0.2)' }}>
              <MessageSquare size={24} style={{ color: '#00D9FF' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.totalMessages}</div>
              <div className="stat-label">Total Messages</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255, 189, 89, 0.2)' }}>
              <Zap size={24} style={{ color: '#FFBD59' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
              <Clock size={24} style={{ color: '#8B5CF6' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.averageSessionLength}</div>
              <div className="stat-label">Avg Session</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
              <TrendingUp size={24} style={{ color: '#00FF88' }} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.messagesLast7Days}</div>
              <div className="stat-label">Last 7 Days</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Daily Usage Chart */}
          <div className="chart-card">
            <h3 className="chart-title">
              <TrendingUp size={18} />
              Daily Usage (Last 7 Days)
            </h3>
            <div className="chart-container">
              {usageByDays.map((day, idx) => (
                <div key={idx} className="bar-wrapper">
                  <div className="bar-column">
                    <div
                      className="bar"
                      style={{
                        height: `${(day.count / maxDayCount) * 100}%`,
                        background: 'linear-gradient(180deg, #00D9FF, #0099CC)'
                      }}
                    >
                      {day.count > 0 && <span className="bar-value">{day.count}</span>}
                    </div>
                  </div>
                  <div className="bar-label">{day.label.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mode Usage Chart */}
          <div className="chart-card">
            <h3 className="chart-title">
              <BarChart3 size={18} />
              Usage by Mode
            </h3>
            <div className="mode-chart">
              {usageByMode.map((mode, idx) => (
                <div key={idx} className="mode-item">
                  <div className="mode-info">
                    <span className="mode-name">{mode.mode}</span>
                    <span className="mode-count">{mode.count}</span>
                  </div>
                  <div className="mode-bar-bg">
                    <div
                      className="mode-bar"
                      style={{
                        width: `${(mode.count / maxModeCount) * 100}%`,
                        background: mode.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="popular-section">
          <h3 className="section-title">
            <Star size={18} />
            Top Questions
          </h3>
          {popularQuestions.length > 0 ? (
            <div className="popular-list">
              {popularQuestions.map((q, idx) => (
                <div key={idx} className="popular-item">
                  <div className="popular-rank">#{idx + 1}</div>
                  <div className="popular-text">{q.text}</div>
                  <div className="popular-badge">{q.count}x</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MessageSquare size={48} style={{ opacity: 0.3 }} />
              <p>No questions asked yet</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="analytics-actions">
          <button onClick={handleExport} className="btn-secondary">
            Export Data
          </button>
          <button onClick={loadAnalytics} className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button onClick={handleReset} className="btn-danger">
            Reset Analytics
          </button>
        </div>

        {/* Footer Info */}
        <div className="analytics-footer">
          <p>
            <strong>Most Used Mode:</strong> {summary.mostUsedMode} &nbsp;|&nbsp;
            <strong>Avg/Day:</strong> {summary.averagePerDay} messages
          </p>
          <p className="text-muted">
            First session: {new Date(summary.firstSession).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}
