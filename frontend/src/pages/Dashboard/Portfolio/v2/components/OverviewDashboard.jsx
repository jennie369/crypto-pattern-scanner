import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Target, BarChart3, CheckCircle } from 'lucide-react';
import { Card } from '../../../../../components-v2/Card';
import { calculateWinLossStats } from '../../../../../utils/portfolioStats';
import EquityChart from './EquityChart';
import { AssetAllocationChart } from './AssetAllocationChart';
import './OverviewDashboard.css';

export const OverviewDashboard = ({ stats, transactions = [], holdings = [] }) => {
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

  // Calculate Win/Loss statistics from closed trades
  const winLossStats = useMemo(() => {
    return calculateWinLossStats(transactions);
  }, [transactions]);

  // Format win rate stats for display
  const winRateStats = {
    winRate: winLossStats.winRate || 0,
    winTrades: winLossStats.wins || 0,
    totalTrades: winLossStats.totalTrades || 0,
    avgWin: winLossStats.avgWin || 0,
    avgLoss: winLossStats.avgLoss || 0,
    profitFactor: winLossStats.profitFactor || 0,
  };

  return (
    <div className="overview-dashboard">
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Card 1: Total Value */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
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
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
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
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">
            {winRateStats.winRate}%
          </div>
          <div className="stat-change">
            {winRateStats.winTrades}/{winRateStats.totalTrades} trades
            {winRateStats.totalTrades > 0 && (
              <CheckCircle size={16} style={{ display: 'inline', marginLeft: '4px' }} />
            )}
          </div>
          {winRateStats.totalTrades > 0 && (
            <div className="stat-details">
              <div className="stat-detail-row">
                <span className="detail-label">Avg Win:</span>
                <span className="detail-value positive">${winRateStats.avgWin.toFixed(2)}</span>
              </div>
              <div className="stat-detail-row">
                <span className="detail-label">Avg Loss:</span>
                <span className="detail-value negative">${winRateStats.avgLoss.toFixed(2)}</span>
              </div>
              <div className="stat-detail-row">
                <span className="detail-label">Profit Factor:</span>
                <span className="detail-value">{winRateStats.profitFactor === Infinity ? '∞' : winRateStats.profitFactor.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Card 4: Active Positions */}
        <Card variant="stat" hoverable>
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-label">Active Positions</div>
          <div className="stat-value">
            {portfolioStats.activePositions}
          </div>
          <div className="stat-change">
            ${Math.round(portfolioStats.totalValue).toLocaleString()} total
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Equity Curve Chart */}
        <EquityChart />

        {/* Asset Allocation Pie Chart */}
        <AssetAllocationChart holdings={holdings} />
      </div>
    </div>
  );
};

export default OverviewDashboard;
