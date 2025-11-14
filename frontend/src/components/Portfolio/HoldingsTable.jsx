import React from 'react';
import './HoldingsTable.css';

/**
 * HoldingsTable Component
 *
 * Table displaying current portfolio holdings
 *
 * Features:
 * - Shows all open positions
 * - Real-time P&L calculation
 * - Entry price and current price display
 * - Close position action
 * - Responsive design
 */
export default function HoldingsTable({ holdings, onDelete }) {
  // Empty state
  if (holdings.length === 0) {
    return (
      <div className="holdings-table-empty">
        <div className="empty-icon">💎</div>
        <p>No holdings to display</p>
        <small>Add a position to start tracking</small>
      </div>
    );
  }

  return (
    <div className="holdings-table-wrapper">
      <table className="holdings-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Avg Entry</th>
            <th>Current Price</th>
            <th>Total Cost</th>
            <th>Current Value</th>
            <th>P&L</th>
            <th>P&L %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(holding => (
            <tr key={holding.id}>
              <td className="symbol-cell">
                <span className="symbol-name">{holding.symbol}</span>
              </td>
              <td className="quantity-cell">{holding.quantity}</td>
              <td className="price-cell">${holding.avg_entry_price?.toLocaleString()}</td>
              <td className="price-cell">${holding.current_price?.toLocaleString()}</td>
              <td className="value-cell">${holding.total_cost?.toLocaleString()}</td>
              <td className="value-cell">${holding.current_value?.toLocaleString()}</td>
              <td className={`pnl-cell ${holding.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
                {holding.unrealized_pnl >= 0 ? '+' : ''}${holding.unrealized_pnl?.toLocaleString()}
              </td>
              <td className={`pnl-percent-cell ${holding.unrealized_pnl_percent >= 0 ? 'positive' : 'negative'}`}>
                {holding.unrealized_pnl_percent >= 0 ? '+' : ''}{holding.unrealized_pnl_percent?.toFixed(2)}%
              </td>
              <td className="actions-cell">
                <button
                  className="btn-close-position"
                  onClick={() => onDelete(holding.id)}
                  title="Close position"
                >
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="holdings-mobile">
        {holdings.map(holding => (
          <div key={holding.id} className="holding-card">
            <div className="card-header">
              <span className="card-symbol">{holding.symbol}</span>
              <span className={`card-pnl ${holding.unrealized_pnl_percent >= 0 ? 'positive' : 'negative'}`}>
                {holding.unrealized_pnl_percent >= 0 ? '+' : ''}{holding.unrealized_pnl_percent?.toFixed(2)}%
              </span>
            </div>

            <div className="card-body">
              <div className="card-row">
                <span className="row-label">Quantity:</span>
                <span className="row-value">{holding.quantity}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Avg Entry:</span>
                <span className="row-value">${holding.avg_entry_price?.toLocaleString()}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Current Price:</span>
                <span className="row-value">${holding.current_price?.toLocaleString()}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Total Cost:</span>
                <span className="row-value">${holding.total_cost?.toLocaleString()}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Current Value:</span>
                <span className="row-value">${holding.current_value?.toLocaleString()}</span>
              </div>
              <div className="card-row">
                <span className="row-label">P&L:</span>
                <span className={`row-value ${holding.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
                  {holding.unrealized_pnl >= 0 ? '+' : ''}${holding.unrealized_pnl?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card-footer">
              <button
                className="btn-close-position"
                onClick={() => onDelete(holding.id)}
              >
                Close Position
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
