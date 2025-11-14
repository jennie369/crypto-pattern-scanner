import React from 'react';
import './EntryTypeAnalytics.css';

/**
 * EntryTypeAnalytics Component
 *
 * Displays comprehensive entry type performance analysis
 * comparing RETEST, BREAKOUT, and OTHER entries
 *
 * Features:
 * - Recommendation banner based on data
 * - Entry type comparison cards (RETEST, BREAKOUT, OTHER)
 * - Win rate, avg P&L, avg R:R, total profit metrics
 * - Overall performance summary
 * - Color-coded visualizations
 * - Data-driven trading recommendations
 */
export default function EntryTypeAnalytics({ analytics }) {
  // Handle loading or no data state
  if (!analytics) {
    return (
      <div className="entry-type-analytics">
        <div className="analytics-empty">
          <div className="empty-icon">📊</div>
          <p>No analytics data available</p>
          <small>Complete some trades to see entry type performance</small>
        </div>
      </div>
    );
  }

  const { retest, breakout, other, overall, recommendation } = analytics;

  // Determine recommendation style
  const getRecommendationStyle = () => {
    if (recommendation.includes('RETEST')) {
      return 'success';
    } else if (recommendation.includes('BREAKOUT')) {
      return 'warning';
    }
    return 'info';
  };

  return (
    <div className="entry-type-analytics">

      {/* Page Header */}
      <div className="analytics-header">
        <h2>📈 Entry Type Performance Analysis</h2>
        <p className="analytics-subtitle">
          Compare RETEST vs BREAKOUT entries to optimize your trading strategy
        </p>
      </div>

      {/* Recommendation Banner */}
      <div className={`recommendation-banner ${getRecommendationStyle()}`}>
        <div className="banner-icon">🎯</div>
        <div className="banner-content">
          <div className="banner-title">Trading Recommendation</div>
          <div className="banner-message">{recommendation}</div>
        </div>
      </div>

      {/* Entry Type Comparison Cards */}
      <div className="entry-type-comparison">

        {/* RETEST Card */}
        <div className="entry-type-card retest">
          <div className="card-header">
            <span className="card-icon">✅</span>
            <div className="card-title-group">
              <span className="card-title">RETEST Entries</span>
              <span className="card-subtitle">Recommended Strategy</span>
            </div>
          </div>

          <div className="card-stats">
            <div className="stat-item">
              <div className="stat-label">Total Trades</div>
              <div className="stat-value">{retest.trades}</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value large">{retest.winRate.toFixed(1)}%</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg P&L</div>
              <div className={`stat-value ${retest.avgPnl >= 0 ? 'positive' : 'negative'}`}>
                {retest.avgPnl >= 0 ? '+' : ''}${retest.avgPnl.toLocaleString()}
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg R:R</div>
              <div className="stat-value">1:{retest.avgRR.toFixed(2)}</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value large ${retest.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                {retest.totalProfit >= 0 ? '+' : ''}${retest.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="footer-badge success">✅ Preferred Strategy</div>
          </div>
        </div>

        {/* BREAKOUT Card */}
        <div className="entry-type-card breakout">
          <div className="card-header">
            <span className="card-icon">⚠️</span>
            <div className="card-title-group">
              <span className="card-title">BREAKOUT Entries</span>
              <span className="card-subtitle">High Risk Strategy</span>
            </div>
          </div>

          <div className="card-stats">
            <div className="stat-item">
              <div className="stat-label">Total Trades</div>
              <div className="stat-value">{breakout.trades}</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value large">{breakout.winRate.toFixed(1)}%</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg P&L</div>
              <div className={`stat-value ${breakout.avgPnl >= 0 ? 'positive' : 'negative'}`}>
                {breakout.avgPnl >= 0 ? '+' : ''}${breakout.avgPnl.toLocaleString()}
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg R:R</div>
              <div className="stat-value">1:{breakout.avgRR.toFixed(2)}</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value large ${breakout.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                {breakout.totalProfit >= 0 ? '+' : ''}${breakout.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="footer-badge warning">⚠️ Not Recommended</div>
          </div>
        </div>

        {/* OTHER Card */}
        <div className="entry-type-card other">
          <div className="card-header">
            <span className="card-icon">❓</span>
            <div className="card-title-group">
              <span className="card-title">OTHER Entries</span>
              <span className="card-subtitle">Unclassified Trades</span>
            </div>
          </div>

          <div className="card-stats">
            <div className="stat-item">
              <div className="stat-label">Total Trades</div>
              <div className="stat-value">{other.trades}</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value large">{other.winRate.toFixed(1)}%</div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg P&L</div>
              <div className={`stat-value ${other.avgPnl >= 0 ? 'positive' : 'negative'}`}>
                {other.avgPnl >= 0 ? '+' : ''}${other.avgPnl.toLocaleString()}
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-label">Avg R:R</div>
              <div className="stat-value">-</div>
            </div>

            <div className="stat-item highlight">
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value large ${other.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                {other.totalProfit >= 0 ? '+' : ''}${other.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="footer-badge info">❓ Review Strategy</div>
          </div>
        </div>

      </div>

      {/* Overall Performance Summary */}
      <div className="overall-performance">
        <h3>📊 Overall Trading Performance</h3>

        <div className="overall-grid">
          <div className="overall-stat">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-label">Total Trades</div>
              <div className="stat-value">{overall.trades}</div>
            </div>
          </div>

          <div className="overall-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Overall Win Rate</div>
              <div className="stat-value">{overall.winRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="overall-stat">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Avg P&L per Trade</div>
              <div className={`stat-value ${overall.avgPnl >= 0 ? 'positive' : 'negative'}`}>
                {overall.avgPnl >= 0 ? '+' : ''}${overall.avgPnl.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="overall-stat">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Total Profit</div>
              <div className={`stat-value ${overall.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                {overall.totalProfit >= 0 ? '+' : ''}${overall.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="performance-insights">
        <h3>💡 Key Insights</h3>

        <div className="insights-grid">
          {/* Win Rate Comparison */}
          {retest.winRate > breakout.winRate && (
            <div className="insight-card">
              <div className="insight-icon">✅</div>
              <div className="insight-content">
                <div className="insight-title">RETEST Win Rate Advantage</div>
                <div className="insight-message">
                  RETEST entries have a <strong>{(retest.winRate - breakout.winRate).toFixed(1)}%</strong> higher
                  win rate than BREAKOUT entries
                </div>
              </div>
            </div>
          )}

          {/* Profit Comparison */}
          {retest.totalProfit > breakout.totalProfit && (
            <div className="insight-card">
              <div className="insight-icon">💰</div>
              <div className="insight-content">
                <div className="insight-title">Higher Profit with RETEST</div>
                <div className="insight-message">
                  RETEST entries generated <strong>${(retest.totalProfit - breakout.totalProfit).toLocaleString()}</strong> more
                  profit than BREAKOUT entries
                </div>
              </div>
            </div>
          )}

          {/* Sample Size Warning */}
          {(retest.trades < 10 || breakout.trades < 10) && (
            <div className="insight-card warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <div className="insight-title">Small Sample Size</div>
                <div className="insight-message">
                  Trade more to get statistically significant results (minimum 10 trades per entry type recommended)
                </div>
              </div>
            </div>
          )}

          {/* Strategy Recommendation */}
          {retest.winRate >= 60 && (
            <div className="insight-card success">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <div className="insight-title">Excellent RETEST Performance</div>
                <div className="insight-message">
                  Your RETEST strategy is performing excellently with a {retest.winRate.toFixed(1)}% win rate.
                  Continue focusing on RETEST entries!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
