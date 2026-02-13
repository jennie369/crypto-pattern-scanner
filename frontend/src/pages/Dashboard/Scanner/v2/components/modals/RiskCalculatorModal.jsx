import React, { useState } from 'react';
import './Modal.css';

export const RiskCalculatorModal = ({ pattern, onClose }) => {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);

  if (!pattern) return null;

  const calculateRisk = () => {
    const riskAmount = accountSize * (riskPercent / 100);
    const stopLossDiff = Math.abs(pattern.entry - pattern.stopLoss);
    const positionSize = riskAmount / stopLossDiff;
    const potentialProfit = positionSize * Math.abs(pattern.takeProfit - pattern.entry);

    return {
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(4),
      potentialProfit: potentialProfit.toFixed(2),
      riskReward: (potentialProfit / riskAmount).toFixed(2),
    };
  };

  const results = calculateRisk();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">🧮</span>
            <div>
              <h2>Risk Calculator</h2>
              <span className="modal-tier-badge tier-2">TIER 2</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Input Parameters */}
          <div className="modal-section">
            <h3 className="modal-section-title">Account Settings</h3>
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
                <label className="modal-label">Risk Per Trade (%)</label>
                <input
                  type="number"
                  className="modal-input"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  min="0.5"
                  max="10"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Calculation Results */}
          <div className="modal-section">
            <h3 className="modal-section-title">Calculation Results</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                <div>
                  <div className="modal-label">Risk Amount</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#F6465D' }}>
                    ${results.riskAmount}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Position Size</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-cyan)' }}>
                    {results.positionSize} {pattern.coin.split('/')[0]}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Potential Profit</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: '#00FF88' }}>
                    ${results.potentialProfit}
                  </div>
                </div>
                <div>
                  <div className="modal-label">Risk/Reward</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)' }}>
                    1:{results.riskReward}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Summary */}
          <div className="modal-section">
            <h3 className="modal-section-title">Trade Summary</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Entry Price</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${pattern.entry.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Stop Loss</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${pattern.stopLoss.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">Take Profit</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>${pattern.takeProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculatorModal;
