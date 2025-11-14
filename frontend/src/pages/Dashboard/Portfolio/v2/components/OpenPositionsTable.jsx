import React, { useMemo } from 'react';
import { Button } from '../../../../../components-v2/Button';
import { Badge } from '../../../../../components-v2/Badge';
import { exportPositionsToCSV } from '../../../../../utils/csvExport';
import './OpenPositionsTable.css';

export const OpenPositionsTable = ({ positions = [], onClose, onUpdate, onRefresh }) => {
  // Transform API data to match export format
  const exportData = useMemo(() => {
    return positions.map(pos => ({
      coin: pos.symbol || 'Unknown',
      pattern: pos.pattern_type || '-',
      entry: pos.avg_entry_price || 0,
      current: pos.current_price || 0,
      pnl: pos.unrealized_pnl || 0,
      pnlPercent: pos.unrealized_pnl_percent || 0,
      amount: pos.quantity || 0,
      leverage: 1, // TODO: Add leverage field if needed
      openDate: pos.created_at || new Date().toISOString(),
    }));
  }, [positions]);

  const handleClose = async (id) => {
    if (!window.confirm('Are you sure you want to close this position?')) {
      return;
    }

    if (onClose) {
      const result = await onClose(id);
      if (result?.success) {
        console.log('Position closed successfully');
      } else {
        console.error('Failed to close position:', result?.error);
        alert('Failed to close position. Please try again.');
      }
    }
  };

  const handleEdit = (id) => {
    // TODO: Open SL/TP edit modal
    console.log('Edit position:', id);
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportPositionsToCSV(exportData, `open-positions-${timestamp}`);
  };

  return (
    <div className="open-positions-table">
      <div className="table-header">
        <h3 className="heading-sm">Open Positions ({positions.length})</h3>
        <Button variant="outline" size="sm" icon="📥" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Pattern</th>
              <th>Entry</th>
              <th>Current</th>
              <th>P&L</th>
              <th>Amount</th>
              <th>Opened</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-message">
                    <p>📊 No open positions</p>
                    <p className="empty-hint">Your open positions will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              positions.map(position => {
                const pnl = position.unrealized_pnl || 0;
                const pnlPercent = position.unrealized_pnl_percent || 0;
                const symbol = position.symbol || 'Unknown';
                const baseCoin = symbol.split('/')[0] || symbol.split('USDT')[0] || symbol;

                return (
                  <tr key={position.id}>
                    <td>
                      <strong className="crypto-pair">{symbol}</strong>
                    </td>
                    <td>
                      <Badge variant="cyan" size="sm">
                        {position.pattern_type || '-'}
                      </Badge>
                    </td>
                    <td className="price-secondary">
                      ${(position.avg_entry_price || 0).toLocaleString()}
                    </td>
                    <td className="price-secondary">
                      ${(position.current_price || 0).toLocaleString()}
                    </td>
                    <td>
                      <div className={`pnl-cell ${pnl >= 0 ? 'positive' : 'negative'}`}>
                        <div className="pnl-amount">
                          {pnl >= 0 ? '+' : ''}${Math.abs(Math.round(pnl)).toLocaleString()}
                        </div>
                        <div className="pnl-percent">
                          {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td>
                      {position.quantity || 0} {baseCoin}
                    </td>
                    <td className="text-muted">
                      {new Date(position.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(position.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClose(position.id)}
                        >
                          Close
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenPositionsTable;
