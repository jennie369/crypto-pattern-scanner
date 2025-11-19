import React from 'react';
import { BarChart3, TrendingUp, ChartLine } from 'lucide-react';
import './Modal.css';

export const AnalyticsModal = ({ pattern, onClose }) => {
  if (!pattern) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><BarChart3 size={24} /></span>
            <div>
              <h2>Pattern Analytics</h2>
              <span className="modal-tier-badge tier-free">FREE</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Pattern Overview */}
          <div className="modal-section">
            <h3 className="modal-section-title">Pattern Overview</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
                <div>
                  <div className="modal-label">Pattern Type</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>
                    {pattern.patternName}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Confidence</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: pattern.confidence >= 80 ? '#00FF88' : '#FFBD59' }}>
                    {pattern.confidence}%
                  </div>
                </div>
                <div>
                  <div className="modal-label">Timeframe</div>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    {pattern.timeframe}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Detected At</div>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    {new Date(pattern.detectedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk/Reward Analysis */}
          <div className="modal-section">
            <h3 className="modal-section-title">Risk/Reward Analysis</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Entry Price</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)' }}>${pattern.entry.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Stop Loss</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#F6465D' }}>${pattern.stopLoss.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Take Profit</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#00FF88' }}>${pattern.takeProfit.toLocaleString()}</span>
                </div>
                <div style={{ padding: 'var(--space-sm)', background: 'rgba(0, 217, 255, 0.1)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="modal-label">Risk:Reward Ratio</span>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>
                      1 : {pattern.riskReward.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Performance */}
          <div className="modal-section">
            <h3 className="modal-section-title">Historical Performance</h3>
            <div className="modal-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'center' }}><TrendingUp size={48} /></div>
                <p>Historical data will be displayed here</p>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                  Win rate, average profit, and pattern statistics
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

export default AnalyticsModal;
