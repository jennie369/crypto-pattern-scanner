import React, { useState, useEffect } from 'react';
import { Fish, Info, DollarSign, BarChart3, Trophy, RefreshCw, AlertTriangle } from 'lucide-react';
import { whaleTrackerService } from '../services/whaleTrackerService';
import { supabase } from '../lib/supabaseClient';
// import './WhaleTracker.css'; // Commented out to use global styles from components.css

const WhaleTracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [exchangeFlows, setExchangeFlows] = useState([]);
  const [topWhales, setTopWhales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions', 'flows', 'whales'

  const [filters, setFilters] = useState({
    symbol: 'ALL',
    type: 'ALL',
    minAmount: 500000
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load transactions from database
      const txData = await whaleTrackerService.getRecentTransactions(filters);
      setTransactions(txData);

      // Load exchange flows (mock for free tier)
      const flowsData = await whaleTrackerService.getExchangeFlows();
      setExchangeFlows(flowsData);

      // Load top whales
      const whalesData = await whaleTrackerService.getTopWhales(100);
      setTopWhales(whalesData);

    } catch (err) {
      console.error('Error loading whale data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch new ETH transactions
      const ethTxs = await whaleTrackerService.fetchEthTransactions(filters.minAmount);
      console.log(`Fetched ${ethTxs.length} ETH transactions`);

      // Fetch new BTC transactions
      const btcTxs = await whaleTrackerService.fetchBtcTransactions(filters.minAmount);
      console.log(`Fetched ${btcTxs.length} BTC transactions`);

      // Reload all data
      await loadData();

    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="whale-tracker-page">
      <div className="page-header">
        <h1 style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '48px',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFBD59 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 80px rgba(255, 189, 89, 0.5)',
          marginBottom: '16px'
        }}>
          <Fish size={40} style={{ marginRight: '12px', display: 'inline-block', verticalAlign: 'middle' }} /> Whale Tracker
        </h1>
        <p>Track smart money movements • Free Tier: ETH & BTC only • Updates every 5-10 minutes</p>
      </div>

      {/* Notice Banner */}
      <div className="notice-banner" style={{
        background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 217, 255, 0.25)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        transition: 'all 0.3s ease'
      }}>
        <span className="notice-icon"><Info size={20} style={{ marginRight: '8px' }} /></span>
        <div className="notice-content">
          <strong>Using FREE APIs:</strong> Data from Etherscan (ETH) and Blockchain.info (BTC).
          Updates every 5-10 minutes. For real-time alerts, upgrade to paid whale API.
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <DollarSign size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Transactions
        </button>
        <button
          className={`tab ${activeTab === 'flows' ? 'active' : ''}`}
          onClick={() => setActiveTab('flows')}
        >
          <BarChart3 size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Exchange Flows
        </button>
        <button
          className={`tab ${activeTab === 'whales' ? 'active' : ''}`}
          onClick={() => setActiveTab('whales')}
        >
          <Trophy size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Top Whales
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-tab">
          {/* Filter Panel */}
          <div className="filter-panel" style={{
            background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 189, 89, 0.22)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s ease',
            marginBottom: '24px'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.35)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.45)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.22)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.35)';
          }}>
            <div className="filter-group">
              <label>Symbol</label>
              <select
                value={filters.symbol}
                onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
              >
                <option value="ALL">All Symbols</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Transaction Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="ALL">All Types</option>
                <option value="transfer">Transfer</option>
                <option value="deposit">Deposit to Exchange</option>
                <option value="withdrawal">Withdrawal from Exchange</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Amount</label>
              <select
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: parseInt(e.target.value) })}
              >
                <option value="500000">$500K+</option>
                <option value="1000000">$1M+</option>
                <option value="5000000">$5M+</option>
                <option value="10000000">$10M+</option>
              </select>
            </div>

            <button className="refresh-btn" onClick={refreshData} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Loading...
                </>
              ) : (
                <>
                  <RefreshCw size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Refresh
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon"><AlertTriangle size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /></span>
              <span>{error}</span>
            </div>
          )}

          {/* Transaction List */}
          <div className="transaction-list" style={{
            background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.22)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s ease'
          }}>
            {loading && transactions.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <div>Loading whale transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><DollarSign size={48} style={{ opacity: 0.5 }} /></div>
                <div className="empty-title">No transactions found</div>
                <div className="empty-description">
                  Click "Refresh" to fetch latest whale movements
                </div>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className={`transaction-item impact-${tx.market_impact?.toLowerCase()}`} style={{
                  background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.25) 0%, rgba(30, 42, 94, 0.3) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.3s ease'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                }}>
                  <div className="tx-header">
                    <span className="tx-symbol">{tx.symbol}</span>
                    <span className={`tx-type ${tx.transaction_type}`}>
                      {tx.transaction_type}
                    </span>
                    <span className={`tx-impact ${tx.market_impact?.toLowerCase()}`}>
                      {tx.market_impact}
                    </span>
                    <span className="tx-time">
                      {new Date(tx.block_timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="tx-amount">
                    ${tx.amount_usd?.toLocaleString()} ({tx.amount?.toFixed(4)} {tx.symbol})
                  </div>

                  <div className="tx-flow">
                    <div className="tx-address">
                      <span className="address-label">From:</span>
                      <span className="address-value">{tx.from_label}</span>
                      <span className="address-hash">
                        {tx.from_address?.substring(0, 10)}...{tx.from_address?.slice(-8)}
                      </span>
                    </div>
                    <div className="tx-arrow">→</div>
                    <div className="tx-address">
                      <span className="address-label">To:</span>
                      <span className="address-value">{tx.to_label}</span>
                      <span className="address-hash">
                        {tx.to_address?.substring(0, 10)}...{tx.to_address?.slice(-8)}
                      </span>
                    </div>
                  </div>

                  <div className="tx-footer">
                    <a
                      href={tx.blockchain === 'ETH'
                        ? `https://etherscan.io/tx/${tx.tx_hash}`
                        : `https://blockchain.info/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explorer-link"
                    >
                      View on Explorer →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Exchange Flows Tab */}
      {activeTab === 'flows' && (
        <div className="flows-tab">
          <div className="flows-notice" style={{
            background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s ease'
          }}>
            <span className="notice-icon"><Info size={20} style={{ marginRight: '8px' }} /></span>
            <span>Exchange flow data is mock data. Paid APIs (CryptoQuant/Glassnode) required for real data.</span>
          </div>

          <div className="flows-grid">
            {exchangeFlows.map((flow, idx) => (
              <div key={idx} className="flow-card" style={{
                background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 189, 89, 0.22)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.35)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.45)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.22)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.35)';
              }}>
                <div className="flow-header">
                  <span className="flow-exchange">{flow.exchange}</span>
                  <span className="flow-symbol">{flow.symbol}</span>
                </div>

                <div className="flow-data">
                  <div className="flow-item inflow">
                    <span className="flow-label">Inflow (24h):</span>
                    <span className="flow-value">{flow.inflow_24h?.toLocaleString()} {flow.symbol}</span>
                  </div>

                  <div className="flow-item outflow">
                    <span className="flow-label">Outflow (24h):</span>
                    <span className="flow-value">{flow.outflow_24h?.toLocaleString()} {flow.symbol}</span>
                  </div>

                  <div className={`flow-item netflow ${flow.netflow_24h > 0 ? 'positive' : 'negative'}`}>
                    <span className="flow-label">Net Flow:</span>
                    <span className="flow-value">
                      {flow.netflow_24h > 0 ? '+' : ''}{flow.netflow_24h?.toLocaleString()} {flow.symbol}
                    </span>
                  </div>
                </div>

                <div className="flow-indicator">
                  {flow.netflow_24h > 0 ? (
                    <div className="indicator-bullish">
                      <BarChart3 size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Outflow (Bullish)
                    </div>
                  ) : (
                    <div className="indicator-bearish">
                      <BarChart3 size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Inflow (Bearish)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Whales Tab */}
      {activeTab === 'whales' && (
        <div className="whales-tab">
          {topWhales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Fish size={48} style={{ opacity: 0.5 }} /></div>
              <div className="empty-title">No whale wallets tracked yet</div>
              <div className="empty-description">
                Whale wallet tracking requires manual input or paid API
              </div>
            </div>
          ) : (
            <div className="whales-table-container" style={{
              background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(30, 42, 94, 0.4) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.22)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}>
              <table className="whales-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Address</th>
                    <th>Label</th>
                    <th>Blockchain</th>
                    <th>Balance</th>
                    <th>USD Value</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {topWhales.map((whale) => (
                    <tr key={whale.id}>
                      <td>{whale.rank}</td>
                      <td className="address-cell">
                        {whale.address?.substring(0, 10)}...{whale.address?.slice(-8)}
                      </td>
                      <td>{whale.label || 'Unknown'}</td>
                      <td>
                        <span className="blockchain-badge">{whale.blockchain}</span>
                      </td>
                      <td>{whale.balance?.toLocaleString()}</td>
                      <td className="usd-value">${whale.balance_usd?.toLocaleString()}</td>
                      <td className="date-cell">
                        {new Date(whale.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhaleTracker;
