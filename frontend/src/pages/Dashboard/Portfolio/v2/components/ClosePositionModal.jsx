import React, { useState, useMemo } from 'react';
import { XCircle, AlertCircle, BarChart3, CheckCircle, X as XIcon } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import './ClosePositionModal.css';

/**
 * Close Position Modal
 * Allow users to close a position with exit price and create SELL transaction
 */
export const ClosePositionModal = ({ position, onClose, onConfirm }) => {
  const [exitPrice, setExitPrice] = useState(position.current_price || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate P&L based on exit price
  const calculatedPnL = useMemo(() => {
    const exit = parseFloat(exitPrice);
    if (isNaN(exit) || exit <= 0) return null;

    const entry = position.avg_entry_price || 0;
    const qty = position.quantity || 0;
    const pnl = (exit - entry) * qty;
    const pnlPercent = entry > 0 ? ((exit - entry) / entry) * 100 : 0;

    return {
      pnl,
      pnlPercent,
      totalValue: exit * qty,
    };
  }, [exitPrice, position]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const exit = parseFloat(exitPrice);
    if (isNaN(exit) || exit <= 0) {
      setError('Exit price must be a positive number');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(position.id, exit, calculatedPnL);
      onClose();
    } catch (err) {
      console.error('Error closing position:', err);
      setError(err.message || 'Failed to close position');
    } finally {
      setLoading(false);
    }
  };

  const baseCoin = position.symbol?.split('/')[0] || position.symbol?.split('USDT')[0] || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content close-position-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-md">
            <XCircle size={24} style={{ display: 'inline', marginRight: '8px', color: '#ef4444' }} />
            Close Position
          </h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Position Summary */}
          <div className="position-summary">
            <div className="summary-row">
              <span className="summary-label">Symbol:</span>
              <span className="summary-value">{position.symbol}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Entry Price:</span>
              <span className="summary-value">${(position.avg_entry_price || 0).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Quantity:</span>
              <span className="summary-value">{position.quantity} {baseCoin}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Current Price:</span>
              <span className="summary-value">${(position.current_price || 0).toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Exit Price Input */}
            <div className="form-field">
              <label className="field-label">Exit Price ($) *</label>
              <Input
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Enter exit price"
                disabled={loading}
                autoFocus
              />
              <p className="field-hint">
                Current market price: ${(position.current_price || 0).toLocaleString()}
              </p>
            </div>

            {/* Calculated P&L Preview */}
            {calculatedPnL && (
              <div className="pnl-preview">
                <h4 className="preview-title">
                  <BarChart3 size={18} style={{ display: 'inline', marginRight: '6px' }} />
                  P&L Preview
                </h4>
                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="preview-label">Exit Value:</span>
                    <span className="preview-value">
                      ${Math.round(calculatedPnL.totalValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Realized P&L:</span>
                    <span className={`preview-value ${calculatedPnL.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {calculatedPnL.pnl >= 0 ? '+' : ''}${Math.abs(Math.round(calculatedPnL.pnl)).toLocaleString()}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">P&L %:</span>
                    <span className={`preview-value ${calculatedPnL.pnlPercent >= 0 ? 'positive' : 'negative'}`}>
                      {calculatedPnL.pnlPercent >= 0 ? '+' : ''}{calculatedPnL.pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="preview-item result-badge">
                    <span className={`badge ${calculatedPnL.pnl >= 0 ? 'win' : 'loss'}`}>
                      {calculatedPnL.pnl >= 0 ? (
                        <>
                          <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          WIN
                        </>
                      ) : (
                        <>
                          <XIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          LOSS
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={loading || !calculatedPnL}
              >
                {loading ? 'Closing...' : (
                  <>
                    <XCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    Confirm Close
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClosePositionModal;
