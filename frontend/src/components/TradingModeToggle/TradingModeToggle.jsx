import React from 'react';
import { useTradingMode } from '../../contexts/TradingModeContext';
import './TradingModeToggle.css';

/**
 * Trading Mode Toggle Component
 * Switches between Real (gold) and Paper (blue) trading modes
 *
 * Props:
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 * - showLabel: boolean (default: true)
 * - className: string (optional additional classes)
 */
export const TradingModeToggle = ({
  size = 'medium',
  showLabel = true,
  className = ''
}) => {
  const { mode, toggleMode, isPaperMode, isRealMode } = useTradingMode();

  const handleToggle = () => {
    toggleMode();
  };

  return (
    <div className={`trading-mode-toggle-container ${className}`}>
      {showLabel && (
        <div className="trading-mode-label">
          <span className={`mode-text ${isRealMode ? 'active' : ''}`}>
            Real Trading
          </span>
        </div>
      )}

      <div
        className={`trading-mode-toggle ${size} ${mode}`}
        onClick={handleToggle}
        role="switch"
        aria-checked={isPaperMode}
        aria-label={`Switch to ${isPaperMode ? 'Real' : 'Paper'} trading mode`}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleToggle();
          }
        }}
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <span className="thumb-icon">
              {isRealMode ? '💰' : '📄'}
            </span>
          </div>

          <div className="toggle-labels">
            <span className="label-real">REAL</span>
            <span className="label-paper">PAPER</span>
          </div>
        </div>
      </div>

      {showLabel && (
        <div className="trading-mode-label">
          <span className={`mode-text ${isPaperMode ? 'active' : ''}`}>
            Paper Trading
          </span>
        </div>
      )}

      {/* Mode Badge */}
      <div className={`mode-badge ${mode}`}>
        <span className="badge-icon">{isRealMode ? '💰' : '📄'}</span>
        <span className="badge-text">{mode.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default TradingModeToggle;
