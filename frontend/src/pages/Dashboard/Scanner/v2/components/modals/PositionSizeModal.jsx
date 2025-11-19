import React, { useState } from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import './Modal.css';

export const PositionSizeModal = ({ pattern, onClose }) => {
  const [leverage, setLeverage] = useState(1);
  const [accountSize, setAccountSize] = useState(10000);

  if (!pattern) return null;

  const calculatePosition = () => {
    const riskPercent = 2;
    const riskAmount = accountSize * (riskPercent / 100);
    const stopLossDiff = Math.abs(pattern.entry - pattern.stopLoss);
    const positionSize = riskAmount / stopLossDiff;
    const leveragedPosition = positionSize * leverage;
    const margin = (leveragedPosition * pattern.entry) / leverage;

    return {
      positionSize: positionSize.toFixed(4),
      leveragedPosition: leveragedPosition.toFixed(4),
      margin: margin.toFixed(2),
      liquidationPrice: (pattern.entry * (1 - 1 / leverage)).toFixed(2),
    };
  };

  const results = calculatePosition();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Target size={24} /></span>
            <div>
              <h2>Position Size Calculator</h2>
              <span className="modal-tier-badge tier-2">TIER 2</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Settings */}
          <div className="modal-section">
            <h3 className="modal-section-title">Position Settings</h3>
            <div className="modal-card">
              <div className="modal-input-group">
                <label className="modal-label">Account Size ($)</label>
                <input
                  type="number"
                  className="modal-input"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                />
              </div>
              <div className="modal-input-group" style={{ marginTop: 'var(--space-sm)' }}>
                <label className="modal-label">Leverage (x)</label>
                <input
                  type="range"
                  className="modal-input"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  min="1"
                  max="125"
                  style={{ accentColor: 'var(--brand-gold)' }}
                />
                <div style={{ textAlign: 'center', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)', marginTop: 'var(--space-xs)' }}>
                  {leverage}x
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="modal-section">
            <h3 className="modal-section-title">Position Details</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div>
                  <div className="modal-label">Base Position Size</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>
                    {results.positionSize} {pattern.coin.split('/')[0]}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Leveraged Position</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)' }}>
                    {results.leveragedPosition} {pattern.coin.split('/')[0]}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Required Margin</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#00FF88' }}>
                    ${results.margin}
                  </div>
                </div>
                {leverage > 1 && (
                  <div>
                    <div className="modal-label">Liquidation Price (Est.)</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#F6465D' }}>
                      ${results.liquidationPrice}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          {leverage > 10 && (
            <div style={{ padding: 'var(--space-md)', background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <AlertTriangle size={24} color="#F6465D" />
                <div>
                  <div style={{ fontWeight: 'var(--font-bold)', color: '#F6465D' }}>High Leverage Warning</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                    Using leverage above 10x significantly increases liquidation risk. Trade with caution.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Apply Position</button>
        </div>
      </div>
    </div>
  );
};

export default PositionSizeModal;
