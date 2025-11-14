import React, { useMemo } from 'react';
import { Card } from '../../../../../components-v2/Card';
import EquityChart from './EquityChart';
import './OverviewDashboard.css';

export const OverviewDashboard = ({ stats }) => {
  // Handle both API data structure and mock data
  const portfolioStats = useMemo(() => {
    if (!stats) {
      return {
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        activePositions: 0,
        totalCost: 0,
      };
    }

    // API data structure uses different field names
    return {
      totalValue: stats.totalValue || 0,
      totalPnL: stats.totalPnl || stats.totalPnL || 0,
      totalPnLPercent: stats.totalPnlPercent || stats.totalPnLPercent || 0,
      activePositions: stats.holdingsCount || stats.activePositions || 0,
      totalCost: stats.totalCost || 0,
    };
  }, [stats]);

  // TODO: Fetch real win rate data from closed trades
  const winRateStats = {
    winRate: 0,
    winTrades: 0,
    totalTrades: 0,
  };

  return (
    <div className="overview-dashboard">
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Card 1: Total Value */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">
            ${Math.round(portfolioStats.totalValue).toLocaleString()}
          </div>
          <div className={`stat-change ${portfolioStats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {portfolioStats.totalPnL >= 0 ? '+' : ''}
            ${Math.abs(Math.round(portfolioStats.totalPnL)).toLocaleString()} ({portfolioStats.totalPnLPercent.toFixed(2)}%)
          </div>
        </Card>

        {/* Card 2: Total P&L */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">📈</div>
          <div className="stat-label">Total P&L</div>
          <div className={`stat-value ${portfolioStats.totalPnL >= 0 ? 'text-gradient-gold' : ''}`}>
            {portfolioStats.totalPnL >= 0 ? '+' : ''}${Math.abs(Math.round(portfolioStats.totalPnL)).toLocaleString()}
          </div>
          <div className={`stat-change ${portfolioStats.totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {portfolioStats.totalPnL >= 0 ? '+' : ''}{portfolioStats.totalPnLPercent.toFixed(2)}% All Time
          </div>
        </Card>

        {/* Card 3: Win Rate */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">
            {winRateStats.winRate}%
          </div>
          <div className="stat-change">
            {winRateStats.winTrades}/{winRateStats.totalTrades} trades
            {winRateStats.totalTrades > 0 && ' ✅'}
          </div>
        </Card>

        {/* Card 4: Active Positions */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">📊</div>
          <div className="stat-label">Active Positions</div>
          <div className="stat-value">
            {portfolioStats.activePositions}
          </div>
          <div className="stat-change">
            ${Math.round(portfolioStats.totalValue).toLocaleString()} total
          </div>
        </Card>
      </div>

      {/* Equity Curve Chart */}
      <EquityChart />
    </div>
  );
};

export default OverviewDashboard;
