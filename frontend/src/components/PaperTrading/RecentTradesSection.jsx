// PROPS-DRIVEN VERSION - Data managed by parent (ScannerPage)
import React from 'react';
import './RecentTradesSection.css';

export const RecentTradesSection = ({ trades = [] }) => {
  // Format date to human-readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="recent-trades-section">
      <h3>Recent Trades ({trades.length})</h3>

      {trades.length === 0 ? (
        <div className="empty-state">
          <p>No recent trades</p>
        </div>
      ) : (
        <div className="trades-list">
          {trades.map((trade) => {
            const realizedPnl = trade.realized_pnl || 0;
            const isProfitable = trade.side === 'sell' && realizedPnl > 0;
            const isLoss = trade.side === 'sell' && realizedPnl < 0;

            return (
              <div key={trade.id} className="trade-item">
                <div className="trade-header">
                  <span className="symbol">{trade.symbol || 'Unknown'}</span>
                  <span className={`side ${trade.side || 'buy'}`}>
                    {(trade.side || 'buy').toUpperCase()}
                  </span>
                </div>
                <div className="trade-details">
                  <div className="detail-row">
                    <span>Price:</span>
                    <span>${(trade.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Qty:</span>
                    <span>{trade.quantity || 0}</span>
                  </div>
                  {trade.side === 'sell' && trade.realized_pnl !== null && trade.realized_pnl !== undefined && (
                    <div className="detail-row strong">
                      <span>P&L:</span>
                      <span className={isProfitable ? 'profit' : isLoss ? 'loss' : ''}>
                        {isProfitable ? '+' : ''}${realizedPnl.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="detail-row time">
                    <span>{formatDate(trade.created_at || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTradesSection;
