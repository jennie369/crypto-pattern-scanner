import React, { useState } from 'react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import { Badge } from '../../../../../components-v2/Badge';
import { exportTradeHistoryToCSV } from '../../../../../utils/csvExport';
import './TradeHistory.css';

export const TradeHistory = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    coin: '',
    pattern: 'All',
    status: 'All',
  });

  // Mock data - replace with API call
  const [trades, setTrades] = useState([
    {
      id: 1,
      date: '2024-11-10',
      coin: 'BTC/USDT',
      pattern: 'DPD',
      entry: 42150,
      exit: 43200,
      pnl: 1050,
      pnlPercent: 2.49,
      rr: 1.57,
      status: 'win',
    },
    {
      id: 2,
      date: '2024-11-09',
      coin: 'ETH/USDT',
      pattern: 'UPU',
      entry: 2300,
      exit: 2245,
      pnl: -55,
      pnlPercent: -2.39,
      rr: 0.8,
      status: 'loss',
    },
    {
      id: 3,
      date: '2024-11-08',
      coin: 'SOL/USDT',
      pattern: 'DPD',
      entry: 95.0,
      exit: 102.5,
      pnl: 75,
      pnlPercent: 7.89,
      rr: 2.1,
      status: 'win',
    },
    {
      id: 4,
      date: '2024-11-07',
      coin: 'ADA/USDT',
      pattern: 'UPU',
      entry: 0.35,
      exit: 0.38,
      pnl: 30,
      pnlPercent: 8.57,
      rr: 1.9,
      status: 'win',
    },
    {
      id: 5,
      date: '2024-11-06',
      coin: 'AVAX/USDT',
      pattern: 'DPD',
      entry: 18.5,
      exit: 17.8,
      pnl: -14,
      pnlPercent: -3.78,
      rr: 0.7,
      status: 'loss',
    },
  ]);

  const [filteredTrades, setFilteredTrades] = useState(trades);

  const handleFilter = () => {
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

    setFilteredTrades(filtered);
    console.log('Filtering with:', filters, 'Results:', filtered.length);
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportTradeHistoryToCSV(filteredTrades, `trade-history-${timestamp}`);
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
        <Button variant="primary" size="sm" icon="🔍" onClick={handleFilter}>
          Filter
        </Button>
        <Button variant="outline" size="sm" icon="📥" onClick={handleExport}>
          Export CSV
        </Button>
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
            {filteredTrades.map(trade => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="pagination">
        <span className="text-muted">
          Showing {filteredTrades.length} of {trades.length} trades
        </span>
      </div>
    </div>
  );
};

export default TradeHistory;
