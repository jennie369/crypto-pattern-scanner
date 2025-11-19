import React from 'react';
import { Target, Clipboard, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import './PatternDetails.css';

export const PatternDetails = ({ pattern }) => {
  if (!pattern) {
    return (
      <div className="pattern-details-empty">
        <div className="empty-icon">
          <Target size={48} />
        </div>
        <h3 className="heading-sm">No Pattern Selected</h3>
        <p className="text-sm text-secondary">
          Select a pattern from scan results to view details
        </p>
      </div>
    );
  }

  const calculateProfitLoss = () => {
    const stopLossPercent = ((pattern.stopLoss - pattern.entry) / pattern.entry * 100);
    const takeProfitPercent = ((pattern.takeProfit - pattern.entry) / pattern.entry * 100);
    return { stopLossPercent, takeProfitPercent };
  };

  const { stopLossPercent, takeProfitPercent } = calculateProfitLoss();

  const calculatePositionSize = (accountSize = 10000, riskPercent = 2) => {
    const riskAmount = accountSize * (riskPercent / 100);
    const stopLossDifference = Math.abs(pattern.entry - pattern.stopLoss);
    const positionSize = riskAmount / stopLossDifference;
    return { riskAmount, positionSize };
  };

  const { riskAmount, positionSize } = calculatePositionSize();

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffInMinutes = Math.floor((now - detected) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  return (
    <div className="pattern-details">
      {/* Pattern Header */}
      <div className="pattern-header">
        <div className="pattern-title">
          <div className="pattern-icon">
            <Target size={24} />
          </div>
          <div>
            <h3 className="heading-sm">{pattern.patternName}</h3>
            <p className="text-xs text-secondary">{pattern.pattern} Pattern</p>
          </div>
        </div>
        <div className={`confidence-badge ${pattern.confidence >= 80 ? 'high' : pattern.confidence >= 60 ? 'medium' : 'low'}`}>
          {pattern.confidence}%
        </div>
      </div>

      {/* Pattern Info */}
      <div className="pattern-info-section">
        <div className="info-row">
          <span className="info-label">Coin</span>
          <span className="info-value">{pattern.coin}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Timeframe</span>
          <span className="info-value">{pattern.timeframe}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Detected</span>
          <span className="info-value">{getTimeAgo(pattern.detectedAt)}</span>
        </div>
      </div>

      {/* Trade Parameters */}
      <div className="pattern-section">
        <h4 className="section-title">Trade Parameters</h4>
        <div className="trade-params">
          <div className="param-item">
            <div className="param-label">Entry Price</div>
            <div className="param-value entry">${pattern.entry.toLocaleString()}</div>
          </div>

          <div className="param-item">
            <div className="param-label">Stop Loss</div>
            <div className="param-value stop-loss">
              ${pattern.stopLoss.toLocaleString()}
              <span className="param-percent">({stopLossPercent > 0 ? '+' : ''}{stopLossPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="param-item">
            <div className="param-label">Take Profit</div>
            <div className="param-value take-profit">
              ${pattern.takeProfit.toLocaleString()}
              <span className="param-percent">({takeProfitPercent > 0 ? '+' : ''}{takeProfitPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="param-item highlight">
            <div className="param-label">Risk : Reward</div>
            <div className="param-value">
              1 : {pattern.riskReward.toFixed(2)} {pattern.riskReward >= 2 ? <CheckCircle size={16} color="#0ECB81" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} /> : <AlertTriangle size={16} color="#FFBD59" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Position Sizing */}
      <div className="pattern-section">
        <h4 className="section-title">Position Sizing</h4>
        <div className="position-sizing">
          <div className="sizing-input">
            <span className="sizing-label">Account Size</span>
            <span className="sizing-value">$10,000</span>
          </div>
          <div className="sizing-input">
            <span className="sizing-label">Risk Per Trade</span>
            <span className="sizing-value">2%</span>
          </div>
          <div className="sizing-result">
            <span className="sizing-label">Position Size</span>
            <span className="sizing-value highlight">${riskAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pattern-actions">
        <button className="action-btn primary">
          <Clipboard size={16} />
          <span>Copy Trade Details</span>
        </button>
        <button className="action-btn secondary">
          <Save size={16} />
          <span>Save to Journal</span>
        </button>
      </div>
    </div>
  );
};

export default PatternDetails;
