import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import './EditPositionModal.css';

/**
 * Edit Position Modal
 * Allows users to update Stop Loss and Take Profit for open positions
 */
export const EditPositionModal = ({ position, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    stopLoss: '',
    takeProfit: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form with position data
  useEffect(() => {
    if (position) {
      setFormData({
        stopLoss: position.stop_loss || '',
        takeProfit: position.take_profit || '',
      });
    }
  }, [position]);

  // Calculate risk/reward ratio
  const calculateRR = () => {
    const entry = position?.avg_entry_price || 0;
    const sl = parseFloat(formData.stopLoss) || 0;
    const tp = parseFloat(formData.takeProfit) || 0;

    if (!entry || !sl || !tp) return null;

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);

    if (risk === 0) return null;

    return (reward / risk).toFixed(2);
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    const entry = position?.avg_entry_price || 0;

    if (formData.stopLoss) {
      const sl = parseFloat(formData.stopLoss);
      if (isNaN(sl) || sl <= 0) {
        newErrors.stopLoss = 'Invalid stop loss price';
      } else if (sl >= entry) {
        newErrors.stopLoss = 'Stop loss must be below entry price';
      }
    }

    if (formData.takeProfit) {
      const tp = parseFloat(formData.takeProfit);
      if (isNaN(tp) || tp <= 0) {
        newErrors.takeProfit = 'Invalid take profit price';
      } else if (tp <= entry) {
        newErrors.takeProfit = 'Take profit must be above entry price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const updates = {
        stop_loss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        take_profit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
      };

      await onSave(position.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update position:', error);
      setErrors({ submit: 'Failed to update position. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!position) return null;

  const riskReward = calculateRR();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-sm">Edit Position</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Position Info */}
          <div className="position-info">
            <div className="info-row">
              <span className="info-label">Coin:</span>
              <span className="info-value crypto-pair">{position.symbol}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Entry Price:</span>
              <span className="info-value">${position.avg_entry_price?.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Current Price:</span>
              <span className="info-value">${position.current_price?.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Amount:</span>
              <span className="info-value">{position.quantity} {position.symbol?.split('/')[0]}</span>
            </div>
          </div>

          {/* Form */}
          <div className="modal-form">
            <Input
              type="number"
              label="Stop Loss"
              placeholder="Enter stop loss price..."
              value={formData.stopLoss}
              onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
              error={errors.stopLoss}
              step="0.01"
            />

            <Input
              type="number"
              label="Take Profit"
              placeholder="Enter take profit price..."
              value={formData.takeProfit}
              onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
              error={errors.takeProfit}
              step="0.01"
            />

            {/* Risk/Reward Display */}
            {riskReward && (
              <div className="rr-display">
                <span className="rr-label">Risk/Reward Ratio:</span>
                <span className="rr-value">1:{riskReward}</span>
              </div>
            )}

            {errors.submit && (
              <div className="error-message">
                <p>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPositionModal;
