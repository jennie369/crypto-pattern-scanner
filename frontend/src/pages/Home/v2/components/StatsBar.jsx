import React, { useState, useEffect } from 'react';
import './StatsBar.css';

export const StatsBar = () => {
  // Simulate real-time updates
  const [stats, setStats] = useState({
    traders: 5234,
    trades: 686,
    winRate: 68,
    patterns: 24,
  });

  useEffect(() => {
    // Update traders count every 5 seconds
    const interval = setInterval(() => {
      setStats(prev => ({
        traders: prev.traders + Math.floor(Math.random() * 5),
        trades: prev.trades,
        winRate: prev.winRate,
        patterns: prev.patterns,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-value animate-pulse">{stats.traders.toLocaleString()}</div>
            <div className="stat-label">Active Traders</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.trades}</div>
            <div className="stat-label">Backtested Trades</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-value text-gradient-gold">{stats.winRate}%</div>
            <div className="stat-label">Win Rate</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">{stats.patterns}</div>
            <div className="stat-label">Pattern Algorithms</div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">
              <span className="status-dot"></span>
              LIVE
            </div>
            <div className="stat-label">Real-time Binance Data</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
