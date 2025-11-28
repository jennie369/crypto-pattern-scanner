import React, { useState, useEffect } from 'react';
import { BarChart3, ScrollText, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTradingMode } from '../../../../contexts/TradingModeContext';
import { usePortfolio } from '../../../../hooks/usePortfolio';
import { usePricePolling } from '../../../../hooks/usePricePolling';
import { LoadingSpinner } from '../../../../components-v2/LoadingSpinner';
import { ErrorMessage } from '../../../../components-v2/ErrorMessage';
import TradingModeToggle from '../../../../components/TradingModeToggle';
import OverviewDashboard from './components/OverviewDashboard';
import OpenPositionsTable from './components/OpenPositionsTable';
import TradeHistory from './components/TradeHistory';
import TradingJournal from './components/TradingJournal';
import { getAccount, getHoldings, getOrders } from '../../../../services/paperTrading';
import './PortfolioPage.css';

/**
 * Portfolio Tracker Page v2 - Gemral
 * Track portfolio performance, trades, and journal
 */
export const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState('positions');
  const { user } = useAuth();
  const { mode, isPaperMode, isRealMode } = useTradingMode();

  // Paper trading state
  const [paperAccount, setPaperAccount] = useState(null);
  const [paperHoldings, setPaperHoldings] = useState([]);
  const [paperOrders, setPaperOrders] = useState([]);
  const [paperLoading, setPaperLoading] = useState(false);

  // Use portfolio hook for REAL trading data management
  const {
    holdings: realHoldings,
    transactions: realTransactions,
    stats: realStats,
    loading: realLoading,
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

  // Load paper trading data when in paper mode
  useEffect(() => {
    if (isPaperMode && user) {
      loadPaperData();
    }
  }, [isPaperMode, user]);

  const loadPaperData = async () => {
    setPaperLoading(true);
    try {
      const [accountResult, holdingsData, ordersData] = await Promise.all([
        getAccount(user.id),
        getHoldings(user.id),
        getOrders(user.id, 50)
      ]);

      if (accountResult.success) {
        setPaperAccount(accountResult.account);
      }
      setPaperHoldings(holdingsData);
      setPaperOrders(ordersData);
    } catch (error) {
      console.error('Error loading paper trading data:', error);
    } finally {
      setPaperLoading(false);
    }
  };

  // Determine which data to use based on mode
  const holdings = isPaperMode ? paperHoldings : realHoldings;
  const transactions = isPaperMode ? paperOrders : realTransactions;
  const stats = isPaperMode ? {
    totalValue: paperAccount?.balance || 0,
    totalPnL: paperAccount?.total_pnl || 0,
    totalPnLPercentage: paperAccount?.total_pnl ? ((paperAccount.total_pnl / paperAccount.initial_balance) * 100) : 0,
    winRate: paperAccount?.win_rate || 0,
    totalTrades: paperAccount?.total_trades || 0,
    bestTrade: paperAccount?.best_trade || 0,
    worstTrade: paperAccount?.worst_trade || 0,
  } : realStats;
  const loading = isPaperMode ? paperLoading : realLoading;

  // Real-time price polling (every 30 seconds)
  const { prices, lastUpdate, isPolling, refreshPrices } = usePricePolling(
    holdings,
    (priceUpdates) => {
      // Update portfolio prices when new data arrives
      updatePrices(priceUpdates);
    },
    30000 // 30 second interval
  );

  // Calculate active positions count for badge
  const activePositionsCount = holdings?.length || 0;

  const tabs = [
    { id: 'positions', label: 'Open Positions', icon: BarChart3, badge: activePositionsCount },
    { id: 'history', label: 'Trade History', icon: ScrollText, badge: null },
    { id: 'journal', label: 'Trading Journal', icon: FileText, badge: null },
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
      {/* Trading Mode Toggle Header */}
      <div className="portfolio-mode-header">
        <div className="mode-info">
          <h1>Portfolio Tracker</h1>
          <span className={`mode-badge-large ${mode}`}>
            {isPaperMode ? '📄 PAPER TRADING' : '💰 REAL TRADING'}
          </span>
        </div>
        <TradingModeToggle size="medium" showLabel={false} />
      </div>

      {/* Overview Dashboard */}
      <OverviewDashboard stats={stats} transactions={transactions} />

      {/* Price Update Indicator */}
      {lastUpdate && (
        <div className="price-update-indicator">
          <span className={`status-dot ${isPolling ? 'polling' : 'idle'}`}></span>
          <span className="update-text">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {isPolling && ' (updating...)'}
          </span>
          <button
            className="refresh-btn-inline"
            onClick={refreshPrices}
            disabled={isPolling}
            title="Refresh prices now"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="portfolio-tabs">
        <div className="tab-navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="tab-badge">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'positions' && (
            <OpenPositionsTable
              positions={holdings}
              onClose={removeHolding}
              onUpdate={modifyHolding}
              onRefresh={refreshHoldings}
              onAddPosition={createHolding}
              onCreateTransaction={createTransaction}
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
