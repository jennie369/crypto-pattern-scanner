import React, { useState } from 'react';
import { Button } from '../../../../../components-v2/Button';
import { Badge } from '../../../../../components-v2/Badge';
import './OpenPositionsTable.css';

export const OpenPositionsTable = () => {
  // Mock data - replace with API call
  const [positions, setPositions] = useState([
    {
      id: 1,
      coin: 'BTC/USDT',
      pattern: 'DPD',
      entry: 42150,
      current: 43200,
      pnl: 1050,
      pnlPercent: 2.49,
      amount: 0.5,
      leverage: 1,
      openDate: '2024-11-10',
    },
    {
      id: 2,
      coin: 'ETH/USDT',
      pattern: 'UPU',
      entry: 2245,
      current: 2198,
      pnl: -47,
      pnlPercent: -2.09,
      amount: 2,
      leverage: 1,
      openDate: '2024-11-12',
    },
    {
      id: 3,
      coin: 'SOL/USDT',
      pattern: 'DPD',
      entry: 98.5,
      current: 105.2,
      pnl: 13.4,
      pnlPercent: 6.8,
      amount: 10,
      leverage: 1,
      openDate: '2024-11-13',
    },
  ]);

  const handleClose = (id) => {
    // TODO: Close position API call
    console.log('Close position:', id);
  };

  const handleEdit = (id) => {
    // TODO: Edit SL/TP modal
    console.log('Edit position:', id);
  };

  return (
    <div className="open-positions-table">
      <div className="table-header">
        <h3 className="heading-sm">Open Positions ({positions.length})</h3>
        <Button variant="outline" size="sm" icon="📥">
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
            {positions.map(position => (
              <tr key={position.id}>
                <td>
                  <strong className="crypto-pair">{position.coin}</strong>
                </td>
                <td>
                  <Badge variant="cyan" size="sm">
                    {position.pattern}
                  </Badge>
                </td>
                <td className="price-secondary">
                  ${position.entry.toLocaleString()}
                </td>
                <td className="price-secondary">
                  ${position.current.toLocaleString()}
                </td>
                <td>
                  <div className={`pnl-cell ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                    <div className="pnl-amount">
                      {position.pnl >= 0 ? '+' : ''}${Math.abs(position.pnl).toLocaleString()}
                    </div>
                    <div className="pnl-percent">
                      {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%
                    </div>
                  </div>
                </td>
                <td>
                  {position.amount} {position.coin.split('/')[0]}
                </td>
                <td className="text-muted">
                  {new Date(position.openDate).toLocaleDateString()}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenPositionsTable;
