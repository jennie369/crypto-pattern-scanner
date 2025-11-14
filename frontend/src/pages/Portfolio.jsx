import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TierGuard from '../components/TierGuard/TierGuard';
import AddHoldingModal from '../components/Portfolio/AddHoldingModal';
import PortfolioChart from '../components/Portfolio/PortfolioChart';
import HoldingsTable from '../components/Portfolio/HoldingsTable';
import PortfolioStats from '../components/Portfolio/PortfolioStats';
import EntryTypeAnalytics from '../components/Portfolio/EntryTypeAnalytics';
import * as portfolioApi from '../services/portfolioApi';
// import './Portfolio.css'; // Commented out to use global styles from components.css

/**
 * Portfolio Page - TIER 2
 *
 * Features:
 * - Portfolio holdings tracker
 * - Transaction history
 * - Entry type analytics (RETEST vs BREAKOUT)
 * - Portfolio stats and P&L
 *
 * Access: scanner_tier >= 'premium'
 */
export default function Portfolio() {
  const { user } = useAuth();

  // Portfolio data state
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [entryTypeAnalytics, setEntryTypeAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState('overview'); // overview, holdings, history, analytics
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);

  // Load portfolio data on mount
  useEffect(() => {
    if (user) {
      loadPortfolioData();
    }
  }, [user]);

  const loadPortfolioData = async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [
        holdingsRes,
        transactionsRes,
        statsRes,
        analyticsRes
      ] = await Promise.all([
        portfolioApi.fetchHoldings(user.id),
        portfolioApi.fetchTransactions(user.id, { limit: 50 }),
        portfolioApi.getPortfolioStats(user.id),
        portfolioApi.getEntryTypeAnalytics(user.id)
      ]);

      if (holdingsRes.data) setHoldings(holdingsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (analyticsRes.data) setEntryTypeAnalytics(analyticsRes.data);

    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHolding = async (holdingData) => {
    const result = await portfolioApi.addHolding(user.id, holdingData);

    if (result.data) {
      setShowAddModal(false);
      loadPortfolioData(); // Refresh data
    } else {
      alert('Error adding holding: ' + result.error.message);
    }
  };

  const handleDeleteHolding = async (holdingId) => {
    if (!window.confirm('Are you sure you want to close this position?')) {
      return;
    }

    const result = await portfolioApi.deleteHolding(holdingId);

    if (result.success) {
      loadPortfolioData(); // Refresh data
    } else {
      alert('Error deleting holding: ' + result.error.message);
    }
  };

  return (
    <TierGuard requiredTier="premium" featureName="Portfolio Tracker">
      <div className="portfolio-page">

        {/* Page Header */}
        <div className="portfolio-header">
          <div className="header-content">
            <h1>💼 Portfolio Tracker</h1>
            <p className="header-subtitle">Track your holdings and analyze entry type performance</p>
          </div>

          <button className="btn-add-holding" onClick={() => setShowAddModal(true)}>
            + Add Position
          </button>
        </div>

        {/* Portfolio Stats Summary */}
        {!loading && <PortfolioStats stats={stats} />}

        {/* Tab Navigation */}
        <div className="portfolio-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setActiveTab('holdings')}
          >
            💎 Holdings ({holdings.length})
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History ({transactions.length})
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Entry Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="portfolio-content">

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading portfolio data...</p>
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="overview-tab">
              <h2>📊 Portfolio Overview</h2>

              {holdings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Holdings Yet</h3>
                  <p>Click "Add Position" to start tracking your portfolio</p>
                  <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add First Position
                  </button>
                </div>
              ) : (
                <>
                  <div className="overview-grid">
                    {/* Top Gainer */}
                    {stats?.topGainer && stats.topGainer.unrealized_pnl_percent > 0 && (
                      <div className="overview-card top-gainer">
                        <div className="card-label">🔥 Top Gainer</div>
                        <div className="card-symbol">{stats.topGainer.symbol}</div>
                        <div className="card-value positive">
                          +{stats.topGainer.unrealized_pnl_percent?.toFixed(2)}%
                        </div>
                      </div>
                    )}

                    {/* Top Loser */}
                    {stats?.topLoser && stats.topLoser.unrealized_pnl_percent < 0 && (
                      <div className="overview-card top-loser">
                        <div className="card-label">📉 Top Loser</div>
                        <div className="card-symbol">{stats.topLoser.symbol}</div>
                        <div className="card-value negative">
                          {stats.topLoser.unrealized_pnl_percent?.toFixed(2)}%
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="overview-card quick-actions">
                      <div className="card-label">⚡ Quick Actions</div>
                      <button onClick={() => setActiveTab('analytics')}>
                        View Entry Analytics
                      </button>
                      <button onClick={() => setShowAddModal(true)}>
                        Add New Position
                      </button>
                    </div>
                  </div>

                  {/* Portfolio Allocation Chart */}
                  <PortfolioChart holdings={holdings} />
                </>
              )}
            </div>
          )}

          {!loading && activeTab === 'holdings' && (
            <div className="holdings-tab">
              <h2>💎 Current Holdings ({holdings.length})</h2>
              <HoldingsTable holdings={holdings} onDelete={handleDeleteHolding} />
            </div>
          )}

          {!loading && activeTab === 'history' && (
            <div className="history-tab">
              <h2>📜 Transaction History ({transactions.length})</h2>

              {transactions.length === 0 ? (
                <div className="empty-state">
                  <p>No transaction history</p>
                </div>
              ) : (
                <div className="transactions-table-wrapper">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Entry Type</th>
                        <th>Pattern</th>
                        <th>Realized P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.transaction_at).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <span className={`tx-type ${tx.transaction_type.toLowerCase()}`}>
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td>{tx.symbol}</td>
                          <td>{tx.quantity}</td>
                          <td>${tx.price?.toLocaleString()}</td>
                          <td>
                            <span className={`entry-type ${tx.entry_type?.toLowerCase()}`}>
                              {tx.entry_type || '-'}
                            </span>
                          </td>
                          <td>{tx.pattern_type || '-'}</td>
                          <td className={tx.realized_pnl >= 0 ? 'positive' : 'negative'}>
                            {tx.realized_pnl
                              ? `${tx.realized_pnl >= 0 ? '+' : ''}$${tx.realized_pnl?.toLocaleString()}`
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'analytics' && (
            <EntryTypeAnalytics analytics={entryTypeAnalytics} />
          )}

        </div>

        {/* Add Holding Modal */}
        <AddHoldingModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddHolding}
        />

      </div>
    </TierGuard>
  );
}
