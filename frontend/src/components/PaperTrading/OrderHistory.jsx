import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getUserTier } from '../../services/paperTrading';
import './OrderHistory.css';

/**
 * Order History Component
 * Displays order history with filters
 * Advanced filters (TIER1+): date range, symbol, side
 *
 * Props:
 * - limit: Number of orders to show (default: 50)
 */
export const OrderHistory = ({ limit = 50 }) => {
  const { user, isAdmin } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userTier, setUserTier] = useState('FREE');

  // Filter state
  const [filters, setFilters] = useState({
    symbol: '',
    side: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load data
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, filters]);

  const loadOrders = async () => {
    setLoading(true);

    try {
      // Check tier
      const { tier } = await getUserTier(user.id);
      setUserTier(tier);

      // Apply filters (only if TIER1+)
      const appliedFilters = ['TIER1', 'TIER2', 'TIER3'].includes(tier) ? filters : {};

      // Load orders
      const ordersData = await getOrders(user.id, limit, appliedFilters);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      symbol: '',
      side: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const exportToCSV = () => {
    // ✅ ADMIN BYPASS - Admins have access to ALL features
    const hasExportAccess = (isAdmin && isAdmin()) || userTier === 'TIER3';

    // Export functionality (TIER3+ or Admin only)
    if (!hasExportAccess) {
      alert('Export feature requires TIER3. Please upgrade.');
      return;
    }

    const csvHeader = 'Date,Symbol,Side,Quantity,Price,Total Value,Fee,P&L,P&L %,Status\n';
    const csvRows = orders.map(order => {
      return [
        new Date(order.created_at).toISOString(),
        order.symbol,
        order.side,
        order.quantity,
        order.price,
        order.total_value,
        order.fee,
        order.pnl || 0,
        order.pnl_percentage || 0,
        order.status
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper-trading-orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="order-history-container">
      {/* Header */}
      <div className="history-header">
        <h2>Order History</h2>

        {/* Export Button (TIER3+ or Admin) */}
        <button
          className={`btn-export ${((isAdmin && isAdmin()) || userTier === 'TIER3') ? '' : 'disabled'}`}
          onClick={exportToCSV}
          disabled={!((isAdmin && isAdmin()) || userTier === 'TIER3') || orders.length === 0}
        >
          {((isAdmin && isAdmin()) || userTier === 'TIER3') ? '📥 Export CSV' : '🔒 Export (TIER3+)'}
        </button>
      </div>

      {/* Filters (TIER1+) */}
      <div className="filters-section">
        {['TIER1', 'TIER2', 'TIER3'].includes(userTier) ? (
          <>
            <div className="filters-row">
              <div className="filter-group">
                <label>Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., BTCUSDT"
                  value={filters.symbol}
                  onChange={(e) => handleFilterChange('symbol', e.target.value.toUpperCase())}
                />
              </div>

              <div className="filter-group">
                <label>Side</label>
                <select
                  value={filters.side}
                  onChange={(e) => handleFilterChange('side', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div className="filter-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </>
        ) : (
          <div className="filters-locked">
            <span className="lock-icon">🔒</span>
            <span>Advanced filters require TIER1 or higher</span>
            <button
              className="btn-upgrade-small"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No Orders Yet</h3>
          <p>Your order history will appear here after you make your first paper trade</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Value</th>
                <th>Fee</th>
                <th>P&L</th>
                <th>P&L %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className={`order-row ${order.side}`}>
                  <td className="date-cell">
                    <div className="date-primary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="date-secondary">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="symbol-cell">{order.symbol}</td>
                  <td>
                    <span className={`side-badge ${order.side}`}>
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                  <td>{order.quantity.toFixed(8)}</td>
                  <td>${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                  <td>${order.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="fee-cell">${order.fee.toFixed(4)}</td>
                  <td className={order.pnl ? (order.pnl >= 0 ? 'positive' : 'negative') : ''}>
                    {order.pnl ? (
                      <>
                        {order.pnl >= 0 ? '+' : ''}${order.pnl.toFixed(2)}
                      </>
                    ) : (
                      <span className="na">—</span>
                    )}
                  </td>
                  <td className={order.pnl_percentage ? (order.pnl_percentage >= 0 ? 'positive' : 'negative') : ''}>
                    {order.pnl_percentage ? (
                      <>
                        {order.pnl_percentage >= 0 ? '+' : ''}{order.pnl_percentage.toFixed(2)}%
                      </>
                    ) : (
                      <span className="na">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && orders.length > 0 && (
        <div className="orders-summary">
          <div className="summary-item">
            <span className="summary-label">Total Orders:</span>
            <span className="summary-value">{orders.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Buy Orders:</span>
            <span className="summary-value">{orders.filter(o => o.side === 'buy').length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Sell Orders:</span>
            <span className="summary-value">{orders.filter(o => o.side === 'sell').length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total P&L:</span>
            <span className={`summary-value ${orders.reduce((sum, o) => sum + (o.pnl || 0), 0) >= 0 ? 'positive' : 'negative'}`}>
              {orders.reduce((sum, o) => sum + (o.pnl || 0), 0) >= 0 ? '+' : ''}
              ${orders.reduce((sum, o) => sum + (o.pnl || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
