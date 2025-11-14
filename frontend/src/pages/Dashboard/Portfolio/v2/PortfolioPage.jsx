import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { LoadingSpinner } from '../../../components-v2/LoadingSpinner';
import { ErrorMessage } from '../../../components-v2/ErrorMessage';
import OverviewDashboard from './components/OverviewDashboard';
import OpenPositionsTable from './components/OpenPositionsTable';
import TradeHistory from './components/TradeHistory';
import TradingJournal from './components/TradingJournal';
import './PortfolioPage.css';

/**
 * Portfolio Tracker Page v2 - GEM Platform
 * Track portfolio performance, trades, and journal
 */
export const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState('positions');
  const { user } = useAuth();

  // Use portfolio hook for data management
  const {
    holdings,
    transactions,
    stats,
    loading,
    error,
    refreshHoldings,
    refreshTransactions,
    refreshStats,
    createHolding,
    modifyHolding,
    removeHolding,
    createTransaction,
    updatePrices,
    clearError,
    reload,
  } = usePortfolio(user?.id);

  // Calculate active positions count for badge
  const activePositionsCount = holdings?.length || 0;

  const tabs = [
    { id: 'positions', label: '📊 Open Positions', badge: activePositionsCount },
    { id: 'history', label: '📜 Trade History', badge: null },
    { id: 'journal', label: '📝 Trading Journal', badge: null },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="portfolio-page-v2">
        <LoadingSpinner size="lg" text="Loading portfolio data..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="portfolio-page-v2">
        <ErrorMessage
          error={error}
          title="Failed to Load Portfolio"
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="portfolio-page-v2">
      {/* Overview Dashboard */}
      <OverviewDashboard stats={stats} />

      {/* Tab Navigation */}
      <div className="portfolio-tabs">
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.badge !== null && tab.badge !== undefined && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'positions' && (
            <OpenPositionsTable
              positions={holdings}
              onClose={removeHolding}
              onUpdate={modifyHolding}
              onRefresh={refreshHoldings}
            />
          )}
          {activeTab === 'history' && (
            <TradeHistory
              transactions={transactions}
              onRefresh={refreshTransactions}
            />
          )}
          {activeTab === 'journal' && (
            <TradingJournal userId={user?.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
