import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import './Modal.css';

export const MultiTimeframeModal = ({ pattern, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');

  if (!pattern) return null;

  const timeframes = ['5m', '15m', '1H', '4H', '1D', '1W'];
  const mtfData = {
    '5m': { trend: 'Bullish', strength: 65, signal: 'Buy' },
    '15m': { trend: 'Bullish', strength: 72, signal: 'Buy' },
    '1H': { trend: 'Bullish', strength: 80, signal: 'Strong Buy' },
    '4H': { trend: 'Neutral', strength: 50, signal: 'Hold' },
    '1D': { trend: 'Bearish', strength: 45, signal: 'Sell' },
    '1W': { trend: 'Bullish', strength: 68, signal: 'Buy' },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Clock size={24} /></span>
            <div>
              <h2>Multi-Timeframe Analysis</h2>
              <span className="modal-tier-badge tier-2">TIER 2</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Timeframe Grid */}
          <div className="modal-section">
            <h3 className="modal-section-title">All Timeframes</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    style={{
                      padding: 'var(--space-md)',
                      background: selectedTimeframe === tf ? 'rgba(255, 189, 89, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      border: selectedTimeframe === tf ? '2px solid var(--brand-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                      {tf}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: mtfData[tf].trend === 'Bullish' ? '#00FF88' : mtfData[tf].trend === 'Bearish' ? '#F6465D' : '#FFBD59', marginTop: 'var(--space-xs)' }}>
                      {mtfData[tf].signal}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Timeframe Details */}
          <div className="modal-section">
            <h3 className="modal-section-title">{selectedTimeframe} Analysis</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                <div>
                  <div className="modal-label">Trend</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: mtfData[selectedTimeframe].trend === 'Bullish' ? '#00FF88' : mtfData[selectedTimeframe].trend === 'Bearish' ? '#F6465D' : '#FFBD59' }}>
                    {mtfData[selectedTimeframe].trend}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Strength</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>
                    {mtfData[selectedTimeframe].strength}%
                  </div>
                </div>
                <div>
                  <div className="modal-label">Signal</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)' }}>
                    {mtfData[selectedTimeframe].signal}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <div className="modal-label" style={{ marginBottom: 'var(--space-sm)' }}>Trend Strength</div>
                <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${mtfData[selectedTimeframe].strength}%`,
                    background: mtfData[selectedTimeframe].trend === 'Bullish'
                      ? 'linear-gradient(90deg, #00FF88, #00CC6E)'
                      : mtfData[selectedTimeframe].trend === 'Bearish'
                      ? 'linear-gradient(90deg, #F6465D, #D23850)'
                      : 'linear-gradient(90deg, #FFBD59, #E8A74A)',
                    borderRadius: '6px'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Confluence */}
          <div className="modal-section">
            <h3 className="modal-section-title">Timeframe Confluence</h3>
            <div className="modal-card">
              <div style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                <div style={{ marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'center' }}>
                  {Object.values(mtfData).filter(d => d.trend === 'Bullish').length >= 4 ? <CheckCircle size={48} color="#00FF88" /> : <AlertTriangle size={48} color="#FFBD59" />}
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }}>
                  {Object.values(mtfData).filter(d => d.trend === 'Bullish').length} out of 6 timeframes bullish
                </div>
                <div className="modal-label" style={{ marginTop: 'var(--space-xs)' }}>
                  Strong confluence indicates higher probability trade
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Add to Watchlist</button>
        </div>
      </div>
    </div>
  );
};

export default MultiTimeframeModal;
