import React, { useState } from 'react';
import { Fish, Circle, Bell } from 'lucide-react';
import './Modal.css';

export const WhaleTrackerModal = ({ pattern, onClose }) => {
  const [filterType, setFilterType] = useState('all');

  if (!pattern) return null;

  const whaleTransactions = [
    { id: 1, type: 'buy', amount: 1250, value: 52625000, address: '0x1a2b...3c4d', time: '5m ago', exchange: 'Binance' },
    { id: 2, type: 'sell', amount: 890, value: 37485000, address: '0x5e6f...7g8h', time: '12m ago', exchange: 'Coinbase' },
    { id: 3, type: 'transfer', amount: 2100, value: 88410000, address: '0x9i0j...1k2l', time: '25m ago', exchange: 'Cold Wallet' },
    { id: 4, type: 'buy', amount: 567, value: 23875500, address: '0x3m4n...5o6p', time: '1h ago', exchange: 'Kraken' },
  ];

  const filteredTransactions = filterType === 'all'
    ? whaleTransactions
    : whaleTransactions.filter(tx => tx.type === filterType);

  const whaleMetrics = {
    totalBuys: whaleTransactions.filter(tx => tx.type === 'buy').reduce((sum, tx) => sum + tx.amount, 0),
    totalSells: whaleTransactions.filter(tx => tx.type === 'sell').reduce((sum, tx) => sum + tx.amount, 0),
    netFlow: 0,
  };

  whaleMetrics.netFlow = whaleMetrics.totalBuys - whaleMetrics.totalSells;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Fish size={24} /></span>
            <div>
              <h2>Whale Tracker</h2>
              <span className="modal-tier-badge tier-3">TIER 3</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Whale Flow Summary */}
          <div className="modal-section">
            <h3 className="modal-section-title">Whale Flow (24h)</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="modal-label">Total Buys</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#00FF88', marginTop: 'var(--space-xs)' }}>
                    {whaleMetrics.totalBuys.toLocaleString()} {pattern.coin.split('/')[0]}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="modal-label">Total Sells</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#F6465D', marginTop: 'var(--space-xs)' }}>
                    {whaleMetrics.totalSells.toLocaleString()} {pattern.coin.split('/')[0]}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="modal-label">Net Flow</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: whaleMetrics.netFlow > 0 ? '#00FF88' : '#F6465D', marginTop: 'var(--space-xs)' }}>
                    {whaleMetrics.netFlow > 0 ? '+' : ''}{whaleMetrics.netFlow.toLocaleString()} {pattern.coin.split('/')[0]}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md)',
                background: whaleMetrics.netFlow > 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                border: `1px solid ${whaleMetrics.netFlow > 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(246, 70, 93, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: whaleMetrics.netFlow > 0 ? '#00FF88' : '#F6465D', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)' }}>
                  <Circle size={16} fill={whaleMetrics.netFlow > 0 ? '#00FF88' : '#F6465D'} stroke="none" />
                  {whaleMetrics.netFlow > 0 ? 'Whales are accumulating' : 'Whales are distributing'}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Filter */}
          <div className="modal-section">
            <h3 className="modal-section-title">Recent Whale Transactions</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {['all', 'buy', 'sell', 'transfer'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      flex: 1,
                      padding: 'var(--space-xs) var(--space-sm)',
                      background: filterType === type ? 'rgba(255, 189, 89, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      border: filterType === type ? '1px solid var(--brand-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: '300px', overflowY: 'auto' }}>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: 'var(--space-md)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: `3px solid ${tx.type === 'buy' ? '#00FF88' : tx.type === 'sell' ? '#F6465D' : '#00D9FF'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
                      <div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-bold)',
                          textTransform: 'uppercase',
                          background: tx.type === 'buy' ? 'rgba(0, 255, 136, 0.15)' : tx.type === 'sell' ? 'rgba(246, 70, 93, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                          color: tx.type === 'buy' ? '#00FF88' : tx.type === 'sell' ? '#F6465D' : '#00D9FF',
                        }}>
                          {tx.type}
                        </span>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                          {tx.address} • {tx.exchange}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                          {tx.amount.toLocaleString()} {pattern.coin.split('/')[0]}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-gold)' }}>
                          ${tx.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {tx.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Whale Alerts */}
          <div style={{ padding: 'var(--space-md)', background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <Bell size={24} color="var(--brand-cyan)" />
              <div>
                <div style={{ fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>Whale Alert Enabled</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Get notified when whales make large transactions
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Set Alerts</button>
        </div>
      </div>
    </div>
  );
};

export default WhaleTrackerModal;
