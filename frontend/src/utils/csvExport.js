/**
 * CSV Export Utilities
 * Export data to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects
 * @param {Array} columns - Array of column configs { key, label }
 * @returns {string} CSV string
 */
export function convertToCSV(data, columns) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.label || col.key);
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];

      // Handle nested properties (e.g., "user.name")
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item);
      }

      // Apply formatter if provided
      if (col.formatter && value !== null && value !== undefined) {
        value = col.formatter(value, item);
      }

      // Escape special characters
      if (value === null || value === undefined) {
        return '';
      }

      // Convert to string and escape quotes
      const stringValue = String(value).replace(/"/g, '""');

      // Wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue}"`;
      }

      return stringValue;
    }).join(',');
  });

  // Combine header and data
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename (without extension)
 */
export function downloadCSV(csvContent, filename) {
  // Add BOM for UTF-8 Excel compatibility
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  // Create blob
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export positions to CSV
 * @param {Array} positions - Array of positions
 * @param {string} filename - Filename
 */
export function exportPositionsToCSV(positions, filename = 'positions') {
  const columns = [
    { key: 'coin', label: 'Coin' },
    { key: 'pattern', label: 'Pattern' },
    { key: 'entry', label: 'Entry Price', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'current', label: 'Current Price', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'pnl', label: 'P&L', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'pnlPercent', label: 'P&L %', formatter: (v) => `${v}%` },
    { key: 'amount', label: 'Amount' },
    { key: 'leverage', label: 'Leverage', formatter: (v) => `${v}x` },
    { key: 'openDate', label: 'Open Date' },
  ];

  const csv = convertToCSV(positions, columns);
  downloadCSV(csv, filename);
}

/**
 * Export trade history to CSV
 * @param {Array} trades - Array of trades
 * @param {string} filename - Filename
 */
export function exportTradeHistoryToCSV(trades, filename = 'trade-history') {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'coin', label: 'Coin' },
    { key: 'pattern', label: 'Pattern' },
    { key: 'entry', label: 'Entry Price', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'exit', label: 'Exit Price', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'pnl', label: 'P&L', formatter: (v) => `$${v.toLocaleString()}` },
    { key: 'pnlPercent', label: 'P&L %', formatter: (v) => `${v}%` },
    { key: 'rr', label: 'R:R', formatter: (v) => `1:${v}` },
    { key: 'status', label: 'Status', formatter: (v) => v.toUpperCase() },
  ];

  const csv = convertToCSV(trades, columns);
  downloadCSV(csv, filename);
}

/**
 * Export journal entries to CSV
 * @param {Array} entries - Array of journal entries
 * @param {string} filename - Filename
 */
export function exportJournalToCSV(entries, filename = 'trading-journal') {
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'content', label: 'Content', formatter: (v) => v.replace(/<[^>]*>/g, '') }, // Strip HTML
    { key: 'tags', label: 'Tags', formatter: (v) => Array.isArray(v) ? v.join('; ') : v },
  ];

  const csv = convertToCSV(entries, columns);
  downloadCSV(csv, filename);
}

/**
 * Export portfolio stats to CSV
 * @param {Object} stats - Portfolio stats
 * @param {string} filename - Filename
 */
export function exportPortfolioStatsToCSV(stats, filename = 'portfolio-stats') {
  const data = [
    { metric: 'Total Portfolio Value', value: `$${stats.totalValue.toLocaleString()}` },
    { metric: 'Total P&L', value: `$${stats.totalPnL.toLocaleString()}` },
    { metric: 'Total P&L %', value: `${stats.totalPnLPercent}%` },
    { metric: 'Win Rate', value: `${stats.winRate}%` },
    { metric: 'Total Trades', value: stats.totalTrades },
    { metric: 'Win Trades', value: stats.winTrades },
    { metric: 'Active Positions', value: stats.activePositions },
    { metric: 'Exposure', value: `$${stats.exposure.toLocaleString()}` },
  ];

  const columns = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ];

  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename);
}

export default {
  convertToCSV,
  downloadCSV,
  exportPositionsToCSV,
  exportTradeHistoryToCSV,
  exportJournalToCSV,
  exportPortfolioStatsToCSV,
};
