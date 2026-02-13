import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import './AddPositionModal.css';

/**
 * Add Position Modal
 * Allow users to manually add a new position
 */
export const AddPositionModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    entryPrice: '',
    quantity: '',
    stopLoss: '',
    takeProfit: '',
    patternType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.symbol || !formData.entryPrice || !formData.quantity) {
      setError('Please fill in Symbol, Entry Price, and Quantity');
      return;
    }

    const entryPrice = parseFloat(formData.entryPrice);
    const quantity = parseFloat(formData.quantity);
    const stopLoss = formData.stopLoss ? parseFloat(formData.stopLoss) : null;
    const takeProfit = formData.takeProfit ? parseFloat(formData.takeProfit) : null;

    if (isNaN(entryPrice) || entryPrice <= 0) {
      setError('Entry Price must be a positive number');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (stopLoss !== null && (isNaN(stopLoss) || stopLoss <= 0)) {
      setError('Stop Loss must be a positive number');
      return;
    }

    if (takeProfit !== null && (isNaN(takeProfit) || takeProfit <= 0)) {
      setError('Take Profit must be a positive number');
      return;
    }

    try {
      setLoading(true);

      // Format symbol (ensure it has /USDT)
      let symbol = formData.symbol.toUpperCase().trim();
      if (!symbol.includes('/')) {
        symbol = `${symbol}/USDT`;
      }

      const newPosition = {
        symbol,
        avg_entry_price: entryPrice,
        quantity,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        pattern_type: formData.patternType.trim() || 'Manual Entry',
        current_price: entryPrice, // Initial current price = entry price
      };

      await onSave(newPosition);
      onClose();
    } catch (err) {
      console.error('Error adding position:', err);
      setError(err.message || 'Failed to add position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-position-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-md">
            <TrendingUp size={24} style={{ display: 'inline', marginRight: '8px' }} />
            Add New Position
          </h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Symbol */}
            <div className="form-field">
              <label className="field-label">Symbol *</label>
              <Input
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value)}
                placeholder="BTC, ETH, BTC/USDT..."
                disabled={loading}
              />
              <p className="field-hint">Enter coin symbol (e.g., BTC or BTC/USDT)</p>
            </div>

            {/* Entry Price */}
            <div className="form-field">
              <label className="field-label">Entry Price * ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => handleChange('entryPrice', e.target.value)}
                placeholder="42000"
                disabled={loading}
              />
            </div>

            {/* Quantity */}
            <div className="form-field">
              <label className="field-label">Quantity *</label>
              <Input
                type="number"
                step="0.00000001"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="0.1"
                disabled={loading}
              />
            </div>

            {/* Pattern Type */}
            <div className="form-field">
              <label className="field-label">Pattern Type</label>
              <Input
                value={formData.patternType}
                onChange={(e) => handleChange('patternType', e.target.value)}
                placeholder="Bullish Engulfing, Hammer..."
                disabled={loading}
              />
              <p className="field-hint">Optional - Leave blank for "Manual Entry"</p>
            </div>

            {/* Stop Loss */}
            <div className="form-field">
              <label className="field-label">Stop Loss ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.stopLoss}
                onChange={(e) => handleChange('stopLoss', e.target.value)}
                placeholder="41000"
                disabled={loading}
              />
              <p className="field-hint">Optional - Set your stop loss price</p>
            </div>

            {/* Take Profit */}
            <div className="form-field">
              <label className="field-label">Take Profit ($)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.takeProfit}
                onChange={(e) => handleChange('takeProfit', e.target.value)}
                placeholder="45000"
                disabled={loading}
              />
              <p className="field-hint">Optional - Set your take profit target</p>
            </div>
          </div>

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
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : (
                <>
                  <CheckCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Add Position
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPositionModal;
