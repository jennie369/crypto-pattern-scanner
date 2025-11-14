import React, { useState } from 'react';
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

  // Mock data - replace with API calls
  const portfolioStats = {
    totalValue: 234567,
    totalPnL: 45234,
    totalPnLPercent: 23.7,
    winRate: 68,
    totalTrades: 686,
    winTrades: 467,
    activePositions: 12,
    exposure: 125430,
  };

  const tabs = [
    { id: 'positions', label: '📊 Open Positions', badge: portfolioStats.activePositions },
    { id: 'history', label: '📜 Trade History', badge: null },
    { id: 'journal', label: '📝 Trading Journal', badge: null },
  ];

  return (
    <div className="portfolio-page-v2">
      {/* Overview Dashboard */}
      <OverviewDashboard stats={portfolioStats} />

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
              {tab.badge && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'positions' && <OpenPositionsTable />}
          {activeTab === 'history' && <TradeHistory />}
          {activeTab === 'journal' && <TradingJournal />}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
