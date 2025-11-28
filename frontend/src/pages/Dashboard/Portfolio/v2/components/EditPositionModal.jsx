import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import TPSLInput from '../../../../../components/TPSLInput/TPSLInput';
import './EditPositionModal.css';

/**
 * Edit Position Modal
 * Allows users to update Stop Loss and Take Profit for open positions
 */
export const EditPositionModal = ({ position, onClose, onSave }) => {
  const [tpData, setTPData] = useState(null);
  const [slData, setSLData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // No calculation functions needed - TPSLInput component handles all calculations

  // Validate form - using TP/SL data from calculator
  const validate = () => {
    const newErrors = {};
    const entry = position?.avg_buy_price || 0;

    // TP/SL calculator handles validation automatically
    // Just check if values make sense
    if (tpData?.price && tpData.price <= entry) {
      newErrors.takeProfit = 'Take profit must be above entry price';
    }

    if (slData?.price && slData.price >= entry) {
      newErrors.stopLoss = 'Stop loss must be below entry price';
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
        stop_loss: slData?.price || null,
        take_profit: tpData?.price || null,
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

  // Render modal using Portal at document.body level to escape scroll container
  return ReactDOM.createPortal(
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
              <span className="info-label">COIN:</span>
              <span className="info-value crypto-pair">{position.symbol}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ENTRY PRICE:</span>
              <span className="info-value">${position.avg_buy_price?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">CURRENT PRICE:</span>
              <span className="info-value">${position.current_price?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">AMOUNT:</span>
              <span className="info-value">{position.quantity || 0} {position.symbol}</span>
            </div>
          </div>

          {/* TP/SL Calculator */}
          <div className="modal-form">
            <TPSLInput
              entryPrice={position.avg_buy_price}
              currentPrice={position.current_price}
              quantity={position.quantity}
              side="buy"
              initialTP={position.take_profit}
              initialSL={position.stop_loss}
              onTPChange={setTPData}
              onSLChange={setSLData}
            />

            {errors.submit && (
              <div className="error-message">
                <p>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  {errors.submit}
                </p>
              </div>
            )}

            {errors.takeProfit && (
              <div className="error-message">
                <p>{errors.takeProfit}</p>
              </div>
            )}

            {errors.stopLoss && (
              <div className="error-message">
                <p>{errors.stopLoss}</p>
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
    </div>,
    document.body
  );
};

export default EditPositionModal;
