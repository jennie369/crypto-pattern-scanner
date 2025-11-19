import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders } from '../../services/paperTrading';
import './RecentTradesSection.css';

export const RecentTradesSection = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      loadRecentTrades();
    } else {
      setLoading(false); // Stop loading if no user
    }
  }, [user]);

  const loadRecentTrades = async () => {
    setLoading(true);
    try {
      // Fetch last 10 orders
      const orders = await getOrders(user.id, 10);

      // Filter only SELL orders (closed positions) with P&L
      const closedTrades = orders.filter(o => o.side === 'sell' && o.pnl !== null && o.pnl !== undefined);

      setTrades(closedTrades.slice(0, 10)); // Limit to 10
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recent-trades-section">
        <h3>Recent Trades</h3>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="recent-trades-section">
        <h3>Recent Trades (0)</h3>
        <div className="empty-state">
          <span className="empty-icon">📜</span>
          <p>No trades yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-trades-section">
      <div className="section-header">
        <h3>Recent Trades ({trades.length})</h3>
        <button className="btn-view-all" onClick={() => window.location.href = '/portfolio'}>
          View All
        </button>
      </div>

      <div className="trades-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={index}>
                <td className="time-cell">
                  {new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="symbol-cell">{trade.symbol}</td>
                <td>{trade.quantity.toFixed(8)}</td>
                <td>${trade.price.toLocaleString()}</td>
                <td className={trade.pnl >= 0 ? 'profit' : 'loss'}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} USDT
                  {trade.pnl_percentage && (
                    <span className="pnl-percentage">
                      {' '}({trade.pnl_percentage >= 0 ? '+' : ''}{trade.pnl_percentage.toFixed(2)}%)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTradesSection;
