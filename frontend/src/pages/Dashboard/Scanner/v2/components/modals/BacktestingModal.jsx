import React, { useState } from 'react';
import { FlaskConical, RotateCw, Play, BarChart3 } from 'lucide-react';
import './Modal.css';

export const BacktestingModal = ({ pattern, onClose }) => {
  const [backtestPeriod, setBacktestPeriod] = useState('30d');
  const [isRunning, setIsRunning] = useState(false);

  if (!pattern) return null;

  const backtestResults = {
    '30d': { winRate: 68, totalTrades: 24, avgProfit: 3.2, avgLoss: -1.5, profitFactor: 2.13 },
    '90d': { winRate: 72, totalTrades: 68, avgProfit: 3.5, avgLoss: -1.4, profitFactor: 2.5 },
    '1y': { winRate: 65, totalTrades: 287, avgProfit: 3.1, avgLoss: -1.6, profitFactor: 1.94 },
  };

  const results = backtestResults[backtestPeriod];

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><FlaskConical size={24} /></span>
            <div>
              <h2>Professional Backtesting</h2>
              <span className="modal-tier-badge tier-3">TIER 3</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Backtest Configuration */}
          <div className="modal-section">
            <h3 className="modal-section-title">Backtest Configuration</h3>
            <div className="modal-card">
              <div className="modal-input-group">
                <label className="modal-label">Pattern Type</label>
                <input
                  type="text"
                  className="modal-input"
                  value={pattern.pattern}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div className="modal-input-group" style={{ marginTop: 'var(--space-sm)' }}>
                <label className="modal-label">Backtest Period</label>
                <select
                  className="modal-input"
                  value={backtestPeriod}
                  onChange={(e) => setBacktestPeriod(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last 1 Year</option>
                </select>
              </div>
              <button
                onClick={handleRunBacktest}
                disabled={isRunning}
                style={{
                  width: '100%',
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  background: isRunning ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, var(--brand-gold), #FFBD59)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: isRunning ? 'var(--text-secondary)' : 'var(--bg-base)',
                  fontWeight: 'var(--font-bold)',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-xs)',
                }}
              >
                {isRunning ? <><RotateCw size={16} className="spin" /> Running Backtest...</> : <><Play size={16} /> Run Backtest</>}
              </button>
            </div>
          </div>

          {/* Results Overview */}
          <div className="modal-section">
            <h3 className="modal-section-title">Backtest Results</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(0, 255, 136, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <div className="modal-label">Win Rate</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#00FF88', marginTop: 'var(--space-xs)' }}>
                    {results.winRate}%
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(0, 217, 255, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <div className="modal-label">Total Trades</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)', marginTop: 'var(--space-xs)' }}>
                    {results.totalTrades}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(255, 189, 89, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <div className="modal-label">Avg Profit</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)', marginTop: 'var(--space-xs)' }}>
                    +{results.avgProfit}%
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', background: 'rgba(246, 70, 93, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <div className="modal-label">Avg Loss</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#F6465D', marginTop: 'var(--space-xs)' }}>
                    {results.avgLoss}%
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'rgba(255, 189, 89, 0.1)', border: '2px solid var(--brand-gold)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="modal-label">Profit Factor</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Higher is better (1.0+ is profitable)
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)' }}>
                    {results.profitFactor}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="modal-section">
            <h3 className="modal-section-title">Equity Curve</h3>
            <div className="modal-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}><BarChart3 size={64} /></div>
                <p>Equity curve visualization</p>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                  Shows portfolio value over time using {pattern.pattern} pattern
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Export Report</button>
        </div>
      </div>
    </div>
  );
};

export default BacktestingModal;
