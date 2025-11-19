import React, { useMemo, useState } from 'react';
import { Download, Edit2, XCircle, BarChart3, CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Badge } from '../../../../../components-v2/Badge';
import { exportPositionsToCSV } from '../../../../../utils/csvExport';
import EditPositionModal from './EditPositionModal';
import AddPositionModal from './AddPositionModal';
import ClosePositionModal from './ClosePositionModal';
import './OpenPositionsTable.css';

export const OpenPositionsTable = ({ positions = [], onClose, onUpdate, onRefresh, onAddPosition, onCreateTransaction }) => {
  const [editingPosition, setEditingPosition] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [closingPosition, setClosingPosition] = useState(null);

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

  const handleOpenCloseModal = (position) => {
    setClosingPosition(position);
  };

  const handleConfirmClose = async (positionId, exitPrice, pnlData) => {
    try {
      // 1. Create SELL transaction
      if (onCreateTransaction) {
        const position = positions.find(p => p.id === positionId);
        if (position) {
          const transaction = {
            symbol: position.symbol,
            transaction_type: 'SELL',
            quantity: position.quantity,
            price: exitPrice,
            total_value: pnlData.totalValue,
            realized_pnl: pnlData.pnl,
            pattern_type: position.pattern_type || 'Manual Entry',
            transaction_at: new Date().toISOString(),
          };

          await onCreateTransaction(transaction);
        }
      }

      // 2. Remove position from holdings
      if (onClose) {
        await onClose(positionId);
      }

      // 3. Refresh data
      if (onRefresh) {
        onRefresh();
      }

      alert(`Position closed successfully!\nP&L: ${pnlData.pnl >= 0 ? '+' : ''}$${Math.abs(Math.round(pnlData.pnl)).toLocaleString()}`);
    } catch (error) {
      console.error('Error closing position:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  const handleAddPosition = async (positionData) => {
    if (onAddPosition) {
      const result = await onAddPosition(positionData);
      if (result?.success) {
        console.log('Position added successfully');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(result?.error || 'Failed to add position');
      }
    }
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
  };

  const handleSaveEdit = async (positionId, updates) => {
    if (onUpdate) {
      const result = await onUpdate(positionId, updates);
      if (result?.success) {
        console.log('Position updated successfully');
        setEditingPosition(null);
      } else {
        throw new Error(result?.error || 'Failed to update position');
      }
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportPositionsToCSV(exportData, `open-positions-${timestamp}`);
  };

  return (
    <div className="open-positions-table">
      <div className="table-header">
        <h3 className="heading-sm">Open Positions ({positions.length})</h3>
        <div className="header-actions">
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            + Add Position
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
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
                    <BarChart3 size={48} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p>No open positions</p>
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
                          onClick={() => handleEdit(position)}
                          title="Edit SL/TP"
                        >
                          <Edit2 size={14} />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCloseModal(position)}
                          title="Close position"
                        >
                          <XCircle size={14} />
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

      {/* Add Position Modal */}
      {showAddModal && (
        <AddPositionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPosition}
        />
      )}

      {/* Edit Position Modal */}
      {editingPosition && (
        <EditPositionModal
          position={editingPosition}
          onClose={() => setEditingPosition(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Close Position Modal */}
      {closingPosition && (
        <ClosePositionModal
          position={closingPosition}
          onClose={() => setClosingPosition(null)}
          onConfirm={handleConfirmClose}
        />
      )}
    </div>
  );
};

export default OpenPositionsTable;
