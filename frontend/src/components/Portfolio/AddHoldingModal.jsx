import React, { useState } from 'react';
import './AddHoldingModal.css';

/**
 * AddHoldingModal Component
 *
 * Modal form for adding new portfolio positions
 *
 * Features:
 * - Symbol, quantity, entry price inputs
 * - Entry type selection (RETEST, BREAKOUT, OTHER)
 * - Pattern type selection
 * - Current price input
 * - Form validation
 * - Auto-calculate total cost
 */
export default function AddHoldingModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    entryPrice: '',
    currentPrice: '',
    entryType: 'RETEST',
    patternType: ''
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.symbol || formData.symbol.trim() === '') {
      newErrors.symbol = 'Symbol is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Entry price must be greater than 0';
    }

    if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }

    if (!formData.entryType) {
      newErrors.entryType = 'Entry type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const holdingData = {
      symbol: formData.symbol.toUpperCase().trim(),
      quantity: parseFloat(formData.quantity),
      avg_entry_price: parseFloat(formData.entryPrice),
      current_price: parseFloat(formData.currentPrice),
      entry_type: formData.entryType,
      pattern_type: formData.patternType.trim() || null
    };

    onSubmit(holdingData);

    // Reset form
    setFormData({
      symbol: '',
      quantity: '',
      entryPrice: '',
      currentPrice: '',
      entryType: 'RETEST',
      patternType: ''
    });
    setErrors({});
  };

  // Calculate total cost
  const totalCost = formData.quantity && formData.entryPrice
    ? parseFloat(formData.quantity) * parseFloat(formData.entryPrice)
    : 0;

  // Calculate unrealized P&L
  const unrealizedPnL = formData.quantity && formData.entryPrice && formData.currentPrice
    ? (parseFloat(formData.currentPrice) - parseFloat(formData.entryPrice)) * parseFloat(formData.quantity)
    : 0;

  const unrealizedPnLPercent = formData.entryPrice && formData.currentPrice
    ? ((parseFloat(formData.currentPrice) - parseFloat(formData.entryPrice)) / parseFloat(formData.entryPrice)) * 100
    : 0;

  if (!isOpen) return null;

  return (
    <div className="add-holding-modal-overlay" onClick={onClose}>
      <div className="add-holding-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="modal-header">
          <h2>➕ Add New Position</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Modal Body */}
        <form className="add-holding-form" onSubmit={handleSubmit}>

          {/* Symbol Input */}
          <div className="form-group">
            <label htmlFor="symbol">Symbol *</label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="BTC, ETH, SOL..."
              className={errors.symbol ? 'error' : ''}
            />
            {errors.symbol && <span className="error-message">{errors.symbol}</span>}
          </div>

          {/* Quantity and Entry Price Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0.00"
                step="0.00000001"
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="entryPrice">Entry Price (USD) *</label>
              <input
                type="number"
                id="entryPrice"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className={errors.entryPrice ? 'error' : ''}
              />
              {errors.entryPrice && <span className="error-message">{errors.entryPrice}</span>}
            </div>
          </div>

          {/* Current Price and Entry Type Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentPrice">Current Price (USD) *</label>
              <input
                type="number"
                id="currentPrice"
                name="currentPrice"
                value={formData.currentPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className={errors.currentPrice ? 'error' : ''}
              />
              {errors.currentPrice && <span className="error-message">{errors.currentPrice}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="entryType">Entry Type *</label>
              <select
                id="entryType"
                name="entryType"
                value={formData.entryType}
                onChange={handleChange}
                className={errors.entryType ? 'error' : ''}
              >
                <option value="RETEST">✅ RETEST (Recommended)</option>
                <option value="BREAKOUT">⚠️ BREAKOUT (Not Recommended)</option>
                <option value="OTHER">❓ OTHER</option>
              </select>
              {errors.entryType && <span className="error-message">{errors.entryType}</span>}
            </div>
          </div>

          {/* Pattern Type Input */}
          <div className="form-group">
            <label htmlFor="patternType">Pattern Type (Optional)</label>
            <input
              type="text"
              id="patternType"
              name="patternType"
              value={formData.patternType}
              onChange={handleChange}
              placeholder="DPD, UPU, HFZ, LFZ..."
            />
            <small className="input-hint">Enter the GEM pattern that triggered this entry</small>
          </div>

          {/* Entry Type Warning for BREAKOUT */}
          {formData.entryType === 'BREAKOUT' && (
            <div className="warning-banner">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <div className="warning-title">BREAKOUT Entry Detected</div>
                <div className="warning-message">
                  Remember: RETEST entries have higher win rates! Only enter BREAKOUT if you have strong confirmation.
                </div>
              </div>
            </div>
          )}

          {/* Calculation Preview */}
          {totalCost > 0 && (
            <div className="calculation-preview">
              <h3>📊 Position Preview</h3>

              <div className="preview-row">
                <span className="preview-label">Total Cost:</span>
                <span className="preview-value">${totalCost.toLocaleString()}</span>
              </div>

              {formData.currentPrice && (
                <>
                  <div className="preview-row">
                    <span className="preview-label">Current Value:</span>
                    <span className="preview-value">
                      ${(parseFloat(formData.quantity) * parseFloat(formData.currentPrice)).toLocaleString()}
                    </span>
                  </div>

                  <div className="preview-row">
                    <span className="preview-label">Unrealized P&L:</span>
                    <span className={`preview-value ${unrealizedPnL >= 0 ? 'positive' : 'negative'}`}>
                      {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString()}
                      ({unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnLPercent.toFixed(2)}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              ➕ Add Position
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
