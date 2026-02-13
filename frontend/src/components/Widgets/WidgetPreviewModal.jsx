import React, { useState } from 'react';
import { WidgetFactory } from './WidgetFactory';
import './WidgetPreviewModal.css';

export const WidgetPreviewModal = ({ widget, onSave, onClose, userTier }) => {
  const [widgetName, setWidgetName] = useState('');
  const [size, setSize] = useState('medium');

  const handleSave = () => {
    onSave({
      ...widget,
      name: widgetName || getDefaultName(),
      size,
      createdAt: new Date().toISOString()
    });
  };

  const getDefaultName = () => {
    const typeNames = {
      price_alert: `${widget.data.coin} Price Alert`,
      pattern_watch: `${widget.data.pattern} Watch`,
      portfolio_tracker: 'My Portfolio',
      daily_reading: 'Daily Reading'
    };
    return typeNames[widget.type] || 'Widget';
  };

  return (
    <div className="widget-preview-overlay" onClick={onClose}>
      <div className="widget-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>📌 Widget Preview</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {/* Suggestion */}
        <p className="suggestion">{widget.suggestion}</p>

        {/* Preview Area */}
        <div className="preview-area">
          <div className="preview-label">Preview:</div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <WidgetFactory widget={widget} size={size} />
          </div>
        </div>

        {/* Widget Settings */}
        <div className="widget-settings">
          <div className="setting-group">
            <label htmlFor="widget-name">Widget Name (optional):</label>
            <input
              id="widget-name"
              type="text"
              placeholder={getDefaultName()}
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              className="widget-name-input"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="widget-size">Size:</label>
            <div className="size-selector">
              <button
                onClick={() => setSize('small')}
                className={`size-btn ${size === 'small' ? 'active' : ''}`}
              >
                Small
              </button>
              <button
                onClick={() => setSize('medium')}
                className={`size-btn ${size === 'medium' ? 'active' : ''}`}
              >
                Medium
              </button>
              <button
                onClick={() => setSize('large')}
                className={`size-btn ${size === 'large' ? 'active' : ''}`}
              >
                Large
              </button>
            </div>
          </div>
        </div>

        {/* Tier Info */}
        {userTier && (
          <div className="tier-info">
            <span className="tier-badge">{userTier}</span>
            <span className="tier-text">
              {userTier === 'FREE' && '⚠️ Upgrade to TIER1 to save widgets'}
              {userTier === 'TIER1' && '✅ You can save up to 3 widgets'}
              {userTier === 'TIER2' && '✅ You can save up to 10 widgets'}
              {userTier === 'TIER3' && '✅ Unlimited widgets'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={userTier === 'FREE'}
          >
            {userTier === 'FREE' ? '🔒 Upgrade Required' : '💾 Save to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};
