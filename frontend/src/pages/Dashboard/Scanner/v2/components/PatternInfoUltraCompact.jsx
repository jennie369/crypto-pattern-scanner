import React from 'react';
import { Copy, Save, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import './PatternInfoUltraCompact.css';

/**
 * Pattern Info Ultra Compact - Single card design
 * 60% more compact than PatternDetails (400px → 160px)
 * Single-line header + 2x2 grid + actions
 */
export const PatternInfoUltraCompact = ({ pattern }) => {
  if (!pattern) {
    return (
      <div className="pattern-info-compact-empty">
        <Target size={32} className="empty-icon" color="rgba(255, 189, 89, 0.5)" />
        <span className="empty-text">Select a pattern</span>
      </div>
    );
  }

  const calculatePercentages = () => {
    const stopLossPercent = ((pattern.stopLoss - pattern.entry) / pattern.entry * 100);
    const takeProfitPercent = ((pattern.takeProfit - pattern.entry) / pattern.entry * 100);
    return { stopLossPercent, takeProfitPercent };
  };

  const { stopLossPercent, takeProfitPercent } = calculatePercentages();

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffInMinutes = Math.floor((now - detected) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1m ago';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1h ago';
    return `${diffInHours}h ago`;
  };

  const handleCopy = () => {
    const tradeDetails = `
${pattern.patternName} - ${pattern.coin}
Timeframe: ${pattern.timeframe}
Confidence: ${pattern.confidence}%

Entry: $${pattern.entry.toLocaleString()}
Stop Loss: $${pattern.stopLoss.toLocaleString()} (${stopLossPercent.toFixed(2)}%)
Take Profit: $${pattern.takeProfit.toLocaleString()} (${takeProfitPercent.toFixed(2)}%)
Risk:Reward: 1:${pattern.riskReward.toFixed(2)}
    `.trim();

    navigator.clipboard.writeText(tradeDetails);
    alert('Trade details copied to clipboard!');
  };

  const handleSave = () => {
    // TODO: Integrate with trading journal
    alert('Save to Journal feature coming soon!');
  };

  const getConfidenceClass = () => {
    if (pattern.confidence >= 80) return 'high';
    if (pattern.confidence >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="pattern-info-compact">
      {/* Single-Line Header */}
      <div className="compact-header">
        <div className="header-left">
          <span className="pattern-name">{pattern.patternName}</span>
          <span className={`confidence-pill ${getConfidenceClass()}`}>
            {pattern.confidence}%
          </span>
        </div>
        <div className="header-right">
          <span className="metadata-item">
            <span className="metadata-label">Coin:</span>
            <span className="metadata-value">{pattern.coin}</span>
          </span>
          <span className="metadata-divider">|</span>
          <span className="metadata-item">
            <span className="metadata-label">TF:</span>
            <span className="metadata-value">{pattern.timeframe}</span>
          </span>
          <span className="metadata-divider">|</span>
          <span className="metadata-item">
            <span className="metadata-value">{getTimeAgo(pattern.detectedAt)}</span>
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pattern-info-content">
        {/* 2x2 Grid for Trade Parameters */}
        <div className="compact-grid">
          <div className="grid-item">
            <div className="item-label">Entry</div>
            <div className="item-value entry">${pattern.entry.toLocaleString()}</div>
          </div>

          <div className="grid-item">
            <div className="item-label">Stop Loss</div>
            <div className="item-value stop-loss">
              ${pattern.stopLoss.toLocaleString()}
              <span className="item-percent">({stopLossPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="grid-item">
            <div className="item-label">Take Profit</div>
            <div className="item-value take-profit">
              ${pattern.takeProfit.toLocaleString()}
              <span className="item-percent">({takeProfitPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="grid-item highlight">
            <div className="item-label">Risk : Reward</div>
            <div className="item-value">
              1:{pattern.riskReward.toFixed(2)}
              {pattern.riskReward >= 2 ? <CheckCircle size={14} color="#0ECB81" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} /> : <AlertTriangle size={14} color="#FFBD59" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Actions */}
      <div className="compact-actions">
        <button className="action-btn-compact primary" onClick={handleCopy}>
          <Copy size={16} />
          <span>Copy</span>
        </button>
        <button className="action-btn-compact secondary" onClick={handleSave}>
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default PatternInfoUltraCompact;
