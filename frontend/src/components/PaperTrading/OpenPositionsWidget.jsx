// PROPS-DRIVEN VERSION - Data managed by parent (ScannerPage)
import React, { useState, useMemo } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import CustomSelect from '../CustomSelect/CustomSelect';
import EditPositionModal from '../../pages/Dashboard/Portfolio/v2/components/EditPositionModal';
import './OpenPositionsWidget.css';

export const OpenPositionsWidget = ({
  positions = [],
  prices = {},
  loading = false,
  onOpenPaperTrading,
  onRefresh,
  onClosePosition,
  onUpdatePosition
}) => {
  const [sortBy, setSortBy] = useState('pnl_desc'); // pnl_desc, pnl_asc, symbol_asc, entry_asc
  const [editingPosition, setEditingPosition] = useState(null);

  // Handle save edit
  const handleSaveEdit = async (positionId, updates) => {
    if (onUpdatePosition) {
      await onUpdatePosition(positionId, updates);
    }
    setEditingPosition(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  // Calculate P&L for a position
  const calculatePnL = (position) => {
    const entryPrice = position.avg_buy_price || 0;
    const currentPrice = prices[position.symbol] || entryPrice;
    const quantity = position.quantity || 0;

    if (entryPrice === 0) {
      return { pnl: 0, pnlPercent: 0 };
    }

    const pnl = (currentPrice - entryPrice) * quantity;
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
    return { pnl, pnlPercent };
  };

  // Sort positions based on selected sort option
  const sortedPositions = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    const sorted = [...positions].sort((a, b) => {
      switch (sortBy) {
        case 'pnl_desc': {
          const pnlA = calculatePnL(a).pnlPercent;
          const pnlB = calculatePnL(b).pnlPercent;
          return pnlB - pnlA; // Highest P&L first
        }
        case 'pnl_asc': {
          const pnlA = calculatePnL(a).pnlPercent;
          const pnlB = calculatePnL(b).pnlPercent;
          return pnlA - pnlB; // Lowest P&L first
        }
        case 'symbol_asc':
          return (a.symbol || '').localeCompare(b.symbol || ''); // A-Z
        case 'entry_asc':
          return (a.avg_buy_price || 0) - (b.avg_buy_price || 0); // Lowest entry first
        default:
          return 0;
      }
    });

    return sorted;
  }, [positions, prices, sortBy]);

  return (
    <div className="open-positions-widget">
      <div className="widget-header">
        <h3>Open Positions ({positions.length})</h3>
        <div className="header-controls">
          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'pnl_desc', label: 'P&L: High to Low' },
              { value: 'pnl_asc', label: 'P&L: Low to High' },
              { value: 'symbol_asc', label: 'Symbol: A-Z' },
              { value: 'entry_asc', label: 'Entry: Low to High' }
            ]}
          />
          <button
            className="btn-refresh"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh positions"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={48} style={{ margin: '0 auto 8px', opacity: 0.5, color: '#FFBD59' }} />
          <p>No open positions</p>
          <span className="empty-hint">Start paper trading to see positions here</span>
        </div>
      ) : (
        <div className="positions-list">
          {sortedPositions.map((position) => {
            const { pnl, pnlPercent } = calculatePnL(position);
            const isProfitable = pnl >= 0;

            return (
              <div key={position.id} className="position-item">
                <div className="position-header">
                  <span className="symbol">{position.symbol || 'Unknown'}</span>
                  <span className={`pnl ${isProfitable ? 'profit' : 'loss'}`}>
                    {isProfitable ? '+' : ''}{(pnlPercent || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="position-details">
                  <div className="detail-row">
                    <span>Entry:</span>
                    <span>${(position.avg_buy_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Current:</span>
                    <span>${(prices[position.symbol] || position.avg_buy_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Qty:</span>
                    <span>{position.quantity || 0}</span>
                  </div>
                  <div className="detail-row strong">
                    <span>P&L:</span>
                    <span className={isProfitable ? 'profit' : 'loss'}>
                      {isProfitable ? '+' : ''}${(pnl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="position-actions">
                  <button
                    className="btn-edit"
                    onClick={() => setEditingPosition(position)}
                    title="Edit this position"
                  >
                    Edit
                  </button>
                  {onClosePosition && (
                    <button
                      className="btn-close-position"
                      onClick={() => onClosePosition(position.id, position.symbol)}
                      title="Close this position"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Position Modal */}
      {editingPosition && (
        <EditPositionModal
          position={{
            ...editingPosition,
            current_price: prices[editingPosition.symbol] || editingPosition.avg_buy_price
          }}
          onClose={() => setEditingPosition(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default OpenPositionsWidget;
