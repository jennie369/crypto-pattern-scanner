import React, { useState } from 'react';
import { Card } from '../../../../../components-v2/Card';
import EquityChart from './EquityChart';
import './OverviewDashboard.css';

export const OverviewDashboard = ({ stats }) => {
  return (
    <div className="overview-dashboard">
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Card 1: Total Value */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Portfolio Value</div>
          <div className="stat-value">
            ${stats.totalValue.toLocaleString()}
          </div>
          <div className={`stat-change ${stats.totalPnLPercent >= 0 ? 'positive' : 'negative'}`}>
            {stats.totalPnLPercent >= 0 ? '+' : ''}
            ${stats.totalPnL.toLocaleString()} ({stats.totalPnLPercent}%)
          </div>
        </Card>

        {/* Card 2: Total P&L */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">📈</div>
          <div className="stat-label">Total P&L</div>
          <div className="stat-value text-gradient-gold">
            +${stats.totalPnL.toLocaleString()}
          </div>
          <div className="stat-change positive">
            +{stats.totalPnLPercent}% All Time
          </div>
        </Card>

        {/* Card 3: Win Rate */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">
            {stats.winRate}%
          </div>
          <div className="stat-change">
            {stats.winTrades}/{stats.totalTrades} trades ✅
          </div>
        </Card>

        {/* Card 4: Active Positions */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">📊</div>
          <div className="stat-label">Active Positions</div>
          <div className="stat-value">
            {stats.activePositions}
          </div>
          <div className="stat-change">
            ${stats.exposure.toLocaleString()} exposure
          </div>
        </Card>
      </div>

      {/* Equity Curve Chart */}
      <EquityChart />
    </div>
  );
};

export default OverviewDashboard;
