import React, { useState, useMemo } from 'react';
import { RefreshCw, Download, ScrollText } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import { Badge } from '../../../../../components-v2/Badge';
import { exportTradeHistoryToCSV } from '../../../../../utils/csvExport';
import './TradeHistory.css';

export const TradeHistory = ({ transactions = [], onRefresh }) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    coin: '',
    pattern: 'All',
    status: 'All',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transform API data to display format
  const trades = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    return transactions
      .filter(t => t.transaction_type === 'SELL') // Only show closed trades
      .map(t => ({
        id: t.id,
        date: t.transaction_at || t.created_at,
        coin: t.symbol || 'Unknown',
        pattern: t.pattern_type || '-',
        entry: t.price || 0, // For SELL transaction, this is exit price
        exit: t.price || 0,
        pnl: t.realized_pnl || 0,
        pnlPercent: t.realized_pnl_percent || 0,
        rr: t.risk_reward_ratio || 0,
        status: (t.realized_pnl || 0) >= 0 ? 'win' : 'loss',
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
  }, [transactions]);

  // Apply filters
  const filteredTrades = useMemo(() => {
    let filtered = [...trades];

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Filter by coin
    if (filters.coin) {
      const coinLower = filters.coin.toLowerCase();
      filtered = filtered.filter(t => t.coin.toLowerCase().includes(coinLower));
    }

    // Filter by pattern
    if (filters.pattern && filters.pattern !== 'All') {
      filtered = filtered.filter(t => t.pattern === filters.pattern);
    }

    // Filter by status
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(t => t.status === filters.status.toLowerCase());
    }

    return filtered;
  }, [trades, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrades.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrades, currentPage]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportTradeHistoryToCSV(filteredTrades, `trade-history-${timestamp}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="trade-history">
      {/* Filters */}
      <div className="filters-bar">
        <Input
          type="date"
          label="From"
          size="sm"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
        />
        <Input
          type="date"
          label="To"
          size="sm"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
        />
        <Input
          type="text"
          label="Coin"
          placeholder="BTC, ETH..."
          size="sm"
          value={filters.coin}
          onChange={(e) => setFilters({...filters, coin: e.target.value})}
        />
        <div className="filter-actions">
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Coin</th>
              <th>Pattern</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>P&L</th>
              <th>R:R</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-message">
                    <ScrollText size={48} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p>No trade history</p>
                    <p className="empty-hint">
                      {filteredTrades.length === 0 && trades.length > 0
                        ? 'No trades match your filters'
                        : 'Your closed trades will appear here'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTrades.map(trade => (
              <tr key={trade.id}>
                <td>{new Date(trade.date).toLocaleDateString()}</td>
                <td><strong>{trade.coin}</strong></td>
                <td>
                  <Badge variant="cyan" size="sm">{trade.pattern}</Badge>
                </td>
                <td className="price-secondary">${trade.entry.toLocaleString()}</td>
                <td className="price-secondary">${trade.exit.toLocaleString()}</td>
                <td className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                  <div className="pnl-cell">
                    <div className="pnl-amount">
                      {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
                    </div>
                    <div className="pnl-percent">
                      {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%
                    </div>
                  </div>
                </td>
                <td className="rr-cell">1:{trade.rr}</td>
                <td>
                  <Badge variant={trade.status === 'win' ? 'green' : 'red'} size="sm">
                    {trade.status.toUpperCase()}
                  </Badge>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTrades.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
            {filteredTrades.length !== trades.length && ` (filtered from ${trades.length})`}
          </span>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Prev
              </Button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and adjacent pages
                    return page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, arr) => {
                    // Add ellipsis
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="pagination-ellipsis">...</span>}
                        <button
                          className={`page-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
