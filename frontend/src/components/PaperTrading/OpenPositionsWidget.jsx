import React from 'react';
import './OpenPositionsWidget.css';

// ULTRA-SIMPLE VERSION - No hooks, no API calls
export const OpenPositionsWidget = ({ onOpenPaperTrading }) => {
  return (
    <div className="open-positions-widget">
      <div className="widget-header">
        <h3>Open Positions (0)</h3>
        <button className="btn-refresh">🔄</button>
      </div>
      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <p>No open positions</p>
        <span className="empty-hint">Start paper trading to see positions here</span>
      </div>
    </div>
  );
};

export default OpenPositionsWidget;
