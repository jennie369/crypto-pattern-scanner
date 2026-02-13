import React from 'react';
import { DollarSign, Wallet, TrendingUp, TrendingDown, Gem } from 'lucide-react';
import './PortfolioStats.css';

/**
 * PortfolioStats Component
 *
 * Summary cards showing key portfolio metrics
 *
 * Features:
 * - Total portfolio value
 * - Total cost basis
 * - Total unrealized P&L with percentage
 * - Number of holdings
 * - Color-coded profit/loss display
 */
export default function PortfolioStats({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="portfolio-stats-summary">

      {/* Total Value */}
      <div className="stat-card total-value">
        <div className="stat-icon"><DollarSign size={24} /></div>
        <div className="stat-content">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">${stats.totalValue?.toLocaleString() || 0}</div>
          <div className="stat-hint">Current market value</div>
        </div>
      </div>

      {/* Total Cost */}
      <div className="stat-card total-cost">
        <div className="stat-icon"><Wallet size={24} /></div>
        <div className="stat-content">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">${stats.totalCost?.toLocaleString() || 0}</div>
          <div className="stat-hint">Initial investment</div>
        </div>
      </div>

      {/* Total P&L */}
      <div className={`stat-card total-pnl ${stats.totalPnl >= 0 ? 'positive' : 'negative'}`}>
        <div className="stat-icon">{stats.totalPnl >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}</div>
        <div className="stat-content">
          <div className="stat-label">Total P&L</div>
          <div className="stat-value">
            {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl?.toLocaleString() || 0}
          </div>
          <div className="stat-percent">
            {stats.totalPnl >= 0 ? '+' : ''}{stats.totalPnlPercent?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Holdings Count */}
      <div className="stat-card holdings-count">
        <div className="stat-icon"><Gem size={24} /></div>
        <div className="stat-content">
          <div className="stat-label">Holdings</div>
          <div className="stat-value">{stats.holdingsCount || 0}</div>
          <div className="stat-hint">Active positions</div>
        </div>
      </div>

    </div>
  );
}
