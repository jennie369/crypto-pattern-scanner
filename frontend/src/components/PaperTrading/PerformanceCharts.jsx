import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPerformanceData, getUserTier } from '../../services/paperTrading';
import './PerformanceCharts.css';

/**
 * Performance Charts Component (TIER2+ only)
 * Shows P&L over time, win rate trends, best/worst trades
 *
 * Props:
 * - period: 'day' | 'week' | 'month' | 'all' (default: 'week')
 */
export const PerformanceCharts = ({ period = 'week' }) => {
  const { user, isAdmin } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Load data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check tier
      const { tier } = await getUserTier(user.id);
      setUserTier(tier);

      // ✅ ADMIN BYPASS - Admins have access to ALL features
      const hasAccess = (isAdmin && isAdmin()) || ['TIER2', 'TIER3'].includes(tier);

      // Load performance data if TIER2+ or Admin
      if (hasAccess) {
        const result = await getPerformanceData(user.id, selectedPeriod);

        if (result.success) {
          setPerformanceData(result.data);
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  // Render upgrade prompt for FREE/TIER1 users (skip for admins)
  const hasAccess = (isAdmin && isAdmin()) || ['TIER2', 'TIER3'].includes(userTier);

  if (!loading && !hasAccess) {
    return (
      <div className="performance-charts-container">
        <div className="upgrade-wall">
          <div className="blur-content">
            {/* Blurred preview */}
            <div className="chart-placeholder">
              <div className="placeholder-line" style={{width: '80%'}}></div>
              <div className="placeholder-line" style={{width: '60%'}}></div>
              <div className="placeholder-line" style={{width: '90%'}}></div>
              <div className="placeholder-line" style={{width: '70%'}}></div>
            </div>
          </div>

          <div className="upgrade-overlay">
            <div className="upgrade-card">
              <div className="lock-icon">🔒</div>
              <h3>Unlock Performance Analytics</h3>
              <p>Track your trading performance with advanced charts and metrics</p>

              <div className="features-list">
                <h4>TIER2+ Benefits:</h4>
                <ul>
                  <li>✓ P&L over time charts</li>
                  <li>✓ Win rate trend analysis</li>
                  <li>✓ Best & worst trades breakdown</li>
                  <li>✓ Performance metrics dashboard</li>
                  <li>✓ Unlimited trades per day</li>
                </ul>
              </div>

              <button
                className="btn-upgrade"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade to TIER2
              </button>

              <div className="current-tier">
                Your tier: <span className="tier-badge">{userTier}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="performance-charts-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="performance-charts-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadData} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!performanceData || performanceData.totalTrades === 0) {
    return (
      <div className="performance-charts-container">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Trading Data Yet</h3>
          <p>Start paper trading to see your performance analytics here</p>
        </div>
      </div>
    );
  }

  const { totalTrades, sellOrders, winningTrades, losingTrades, winRate, totalPnl, bestTrade, worstTrade, orders } = performanceData;

  return (
    <div className="performance-charts-container">
      {/* Header */}
      <div className="charts-header">
        <h2>Performance Analytics</h2>

        {/* Period Selector */}
        <div className="period-selector">
          {['day', 'week', 'month', 'all'].map(p => (
            <button
              key={p}
              className={`period-btn ${selectedPeriod === p ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p)}
            >
              {p === 'day' && '24H'}
              {p === 'week' && '7D'}
              {p === 'month' && '30D'}
              {p === 'all' && 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-label">Total P&L</div>
          <div className={`metric-value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Win Rate</div>
          <div className={`metric-value ${winRate >= 50 ? 'positive' : 'negative'}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="metric-subtitle">
            {winningTrades}W / {losingTrades}L
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Trades</div>
          <div className="metric-value">{totalTrades}</div>
          <div className="metric-subtitle">
            {sellOrders} closed positions
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Best Trade</div>
          <div className="metric-value positive">
            +${bestTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Worst Trade</div>
          <div className="metric-value negative">
            ${worstTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* P&L Chart (Simple visualization) */}
      <div className="chart-section">
        <h3>P&L History</h3>
        <div className="simple-chart">
          {orders.slice(0, 10).reverse().map((order, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-label">{order.symbol}</div>
              <div className="chart-bar">
                <div
                  className={`bar ${order.pnl >= 0 ? 'positive' : 'negative'}`}
                  style={{
                    width: `${Math.abs(order.pnl) / Math.max(Math.abs(bestTrade), Math.abs(worstTrade)) * 100}%`,
                    minWidth: '2px'
                  }}
                >
                  <span className="bar-value">
                    ${order.pnl.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="recent-trades">
        <h3>Recent Closed Positions</h3>
        <div className="trades-table">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>P&L</th>
                <th>P&L %</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td className="symbol-cell">{order.symbol}</td>
                  <td>{order.quantity.toFixed(8)}</td>
                  <td>${order.price.toLocaleString()}</td>
                  <td className={order.pnl >= 0 ? 'positive' : 'negative'}>
                    {order.pnl >= 0 ? '+' : ''}${order.pnl.toFixed(2)}
                  </td>
                  <td className={order.pnl_percentage >= 0 ? 'positive' : 'negative'}>
                    {order.pnl_percentage >= 0 ? '+' : ''}{order.pnl_percentage.toFixed(2)}%
                  </td>
                  <td className="date-cell">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
