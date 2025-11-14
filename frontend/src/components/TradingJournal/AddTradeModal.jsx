import React, { useState } from 'react'
import './AddTradeModal.css'

export default function AddTradeModal({ onClose, onSubmit, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState(
    initialData
      ? {
          symbol: initialData.symbol || '',
          position_type: initialData.position_type || 'long',
          entry_price: initialData.entry_price || '',
          exit_price: initialData.exit_price || '',
          quantity: initialData.quantity || '',
          stop_loss: initialData.stop_loss || '',
          take_profit: initialData.take_profit || '',
          pattern_used: initialData.pattern_used || '',
          notes: initialData.notes || '',
          entry_at: initialData.entry_at ? new Date(initialData.entry_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }
      : {
          symbol: '',
          position_type: 'long',
          entry_price: '',
          exit_price: '',
          quantity: '',
          stop_loss: '',
          take_profit: '',
          pattern_used: '',
          notes: '',
          entry_at: new Date().toISOString().split('T')[0]
        }
  )

  const [calculating, setCalculating] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatePL = () => {
    const { entry_price, exit_price, quantity, position_type } = formData

    if (!entry_price || !exit_price || !quantity) return null

    const entry = parseFloat(entry_price)
    const exit = parseFloat(exit_price)
    const qty = parseFloat(quantity)

    let pl = 0
    if (position_type === 'long') {
      pl = (exit - entry) * qty
    } else {
      pl = (entry - exit) * qty
    }

    const plPercent = ((exit - entry) / entry) * 100 * (position_type === 'long' ? 1 : -1)

    return { profit_loss: pl, profit_loss_percent: plPercent }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!formData.symbol || !formData.entry_price || !formData.quantity) {
      alert('⚠️ Vui lòng điền đủ thông tin bắt buộc')
      return
    }

    // Calculate P&L if exit_price exists
    const plData = formData.exit_price ? calculatePL() : {}

    // Prepare data
    const tradeData = {
      symbol: formData.symbol.toUpperCase(),
      position_type: formData.position_type,
      entry_price: parseFloat(formData.entry_price),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      quantity: parseFloat(formData.quantity),
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
      pattern_used: formData.pattern_used || null,
      notes: formData.notes || null,
      entry_at: new Date(formData.entry_at).toISOString(),
      exit_at: formData.exit_price ? new Date().toISOString() : null,
      ...plData
    }

    onSubmit(tradeData)
  }

  // Calculate live P&L preview
  const plPreview = formData.exit_price ? calculatePL() : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-trade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{isEdit ? '✏️ Sửa Trade' : '➕ Thêm Trade Mới'}</h2>

        <form onSubmit={handleSubmit} className="trade-form">
          <div className="form-row">
            <div className="form-group">
              <label>Symbol <span className="required">*</span></label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="BTCUSDT"
                required
              />
            </div>

            <div className="form-group">
              <label>Position Type <span className="required">*</span></label>
              <select
                name="position_type"
                value={formData.position_type}
                onChange={handleChange}
              >
                <option value="long">LONG</option>
                <option value="short">SHORT</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entry Price <span className="required">*</span></label>
              <input
                type="number"
                step="0.01"
                name="entry_price"
                value={formData.entry_price}
                onChange={handleChange}
                placeholder="50000"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity <span className="required">*</span></label>
              <input
                type="number"
                step="0.00001"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0.5"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Exit Price</label>
              <input
                type="number"
                step="0.01"
                name="exit_price"
                value={formData.exit_price}
                onChange={handleChange}
                placeholder="55000 (optional)"
              />
            </div>

            <div className="form-group">
              <label>Entry Date <span className="required">*</span></label>
              <input
                type="date"
                name="entry_at"
                value={formData.entry_at}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {plPreview && (
            <div className="pl-preview">
              <div className="pl-label">P&L Preview:</div>
              <div className={`pl-value ${plPreview.profit_loss >= 0 ? 'positive' : 'negative'}`}>
                ${plPreview.profit_loss.toFixed(2)} ({plPreview.profit_loss_percent.toFixed(2)}%)
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Stop Loss</label>
              <input
                type="number"
                step="0.01"
                name="stop_loss"
                value={formData.stop_loss}
                onChange={handleChange}
                placeholder="48000 (optional)"
              />
            </div>

            <div className="form-group">
              <label>Take Profit</label>
              <input
                type="number"
                step="0.01"
                name="take_profit"
                value={formData.take_profit}
                onChange={handleChange}
                placeholder="60000 (optional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pattern Used</label>
            <select
              name="pattern_used"
              value={formData.pattern_used}
              onChange={handleChange}
            >
              <option value="">-- Select Pattern --</option>
              <option value="DPD">DPD</option>
              <option value="UPU">UPU</option>
              <option value="UPD">UPD</option>
              <option value="DPU">DPU</option>
              <option value="HEAD_AND_SHOULDERS">Head & Shoulders</option>
              <option value="DOUBLE_TOP">Double Top</option>
              <option value="DOUBLE_BOTTOM">Double Bottom</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ghi chú về trade này..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              {isEdit ? '✅ Cập Nhật' : '✅ Thêm Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
