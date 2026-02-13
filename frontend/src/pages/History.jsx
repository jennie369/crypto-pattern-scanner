import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, CircleDot, CheckCircle, XCircle, Mail } from 'lucide-react';
import './History.css';

/**
 * History Page
 * Shows pattern detection history and past trades
 */
function History() {
  const [filter, setFilter] = useState('all'); // all, bullish, bearish

  // Mock history data
  const historyData = [
    {
      id: 1,
      symbol: 'BTCUSDT',
      pattern: 'DPD',
      patternIcon: '🔴📉⏸️📉',
      direction: 'bearish',
      entry: 110598,
      exit: 112345,
      result: 'win',
      profit: 1.58,
      date: '2025-11-02 14:23',
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      pattern: 'UPU',
      patternIcon: '🟢📈⏸️📈',
      direction: 'bullish',
      entry: 3425,
      exit: 3512,
      result: 'win',
      profit: 2.54,
      date: '2025-11-02 13:15',
    },
    {
      id: 3,
      symbol: 'SOLUSDT',
      pattern: 'UPD',
      patternIcon: '🔄📈⏸️📉',
      direction: 'bearish',
      entry: 187,
      exit: 185,
      result: 'loss',
      profit: -1.07,
      date: '2025-11-02 12:05',
    },
  ];

  const filteredHistory = historyData.filter(item => {
    if (filter === 'all') return true;
    return item.direction === filter;
  });

  return (
    <div className="history-page">
      <div className="history-header">
        <h1><BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />Pattern Detection History</h1>
        <p className="subtitle">Track your past pattern detections and trading performance</p>
      </div>

      {/* Filter Buttons */}
      <div className="history-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Patterns
        </button>
        <button
          className={`filter-btn bullish ${filter === 'bullish' ? 'active' : ''}`}
          onClick={() => setFilter('bullish')}
        >
          <TrendingUp size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Bullish
        </button>
        <button
          className={`filter-btn bearish ${filter === 'bearish' ? 'active' : ''}`}
          onClick={() => setFilter('bearish')}
        >
          <TrendingDown size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Bearish
        </button>
      </div>

      {/* History Table */}
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Pattern</th>
              <th>Direction</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Result</th>
              <th>Profit %</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map(item => (
                <tr key={item.id} className={`history-row ${item.result}`}>
                  <td className="date-cell">{item.date}</td>
                  <td className="symbol-cell">{item.symbol}</td>
                  <td className="pattern-cell">
                    <span className="pattern-icon">{item.patternIcon}</span>
                    <span className="pattern-name">{item.pattern}</span>
                  </td>
                  <td className={`direction-cell ${item.direction}`}>
                    {item.direction === 'bullish' ? <><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />LONG</> : <><TrendingDown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />SHORT</>}
                  </td>
                  <td className="price-cell">${item.entry.toLocaleString()}</td>
                  <td className="price-cell">${item.exit.toLocaleString()}</td>
                  <td className={`result-cell ${item.result}`}>
                    {item.result === 'win' ? <><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Win</> : <><XCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Loss</>}
                  </td>
                  <td className={`profit-cell ${item.profit >= 0 ? 'positive' : 'negative'}`}>
                    {item.profit >= 0 ? '+' : ''}{item.profit}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-icon"><Mail size={48} /></div>
                  <p>No history found for this filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics Summary */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-label">Total Patterns</div>
          <div className="stat-value">{historyData.length}</div>
        </div>
        <div className="stat-card win">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">66.7%</div>
        </div>
        <div className="stat-card profit">
          <div className="stat-label">Total Profit</div>
          <div className="stat-value">+3.05%</div>
        </div>
      </div>
    </div>
  );
}

export default History;
