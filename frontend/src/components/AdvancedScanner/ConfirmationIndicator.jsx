import React from 'react'
import './ConfirmationIndicator.css'

/**
 * ConfirmationIndicator Component
 *
 * Displays confirmation candle signal details
 *
 * Confirmation Types:
 * - PIN_BAR: Long wick (>60%), small body (<30%)
 * - HAMMER: Bullish reversal (long lower wick)
 * - SHOOTING_STAR: Bearish reversal (long upper wick)
 * - ENGULFING: Full body engulfing (future feature)
 * - DOJI: Indecision (NOT a confirmation)
 *
 * Props:
 * @param {Object} confirmation - Confirmation data from checkConfirmationCandle()
 *   {
 *     hasConfirmation: boolean,
 *     type: 'PIN_BAR' | 'HAMMER' | 'SHOOTING_STAR' | 'ENGULFING' | 'DOJI',
 *     strength: 'Weak' | 'Medium' | 'Strong',
 *     direction: 'bullish' | 'bearish' | 'neutral',
 *     details: { upperWickPercent, bodyPercent, description }
 *   }
 */
export default function ConfirmationIndicator({ confirmation }) {

  // Handle no confirmation case
  if (!confirmation || !confirmation.hasConfirmation) {
    return (
      <div className="confirmation-indicator no-confirmation">
        <div className="no-conf-icon">⏳</div>
        <div className="no-conf-message">
          <div className="no-conf-title">Chờ Nến Xác Nhận</div>
          <div className="no-conf-subtitle">
            {confirmation?.type === 'DOJI'
              ? '🔴 Doji phát hiện - Chờ nến tiếp theo'
              : '⏳ Pin Bar / Hammer / Shooting Star'
            }
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Confirmation Detected - Display Details
  // ═══════════════════════════════════════════════════════════════════════════

  const { type, strength, direction, details } = confirmation;

  // Get type info
  const typeInfo = getConfirmationTypeInfo(type);

  // Get strength color
  const strengthColor = {
    'Strong': '#10B981',   // Green
    'Medium': '#F59E0B',   // Orange
    'Weak': '#EF4444'      // Red
  }[strength] || '#3B82F6'; // Blue default

  // Get direction color
  const directionColor = direction === 'bullish' ? '#10B981' : direction === 'bearish' ? '#EF4444' : '#888';
  const directionIcon = direction === 'bullish' ? '📈' : direction === 'bearish' ? '📉' : '➡️';

  return (
    <div className="confirmation-indicator has-confirmation">

      {/* 🎯 READY TO ENTER Banner (only for Strong confirmations) */}
      {strength === 'Strong' && (
        <div className="ready-banner">
          <div className="ready-icon">🎯</div>
          <div className="ready-content">
            <div className="ready-title">READY TO ENTER!</div>
            <div className="ready-subtitle">
              {typeInfo.label} confirmation detected
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="conf-header">
        <div className="conf-type">
          <div className="conf-type-icon" style={{ color: strengthColor }}>
            {typeInfo.icon}
          </div>
          <div className="conf-type-label">{typeInfo.label}</div>
        </div>

        <div className="conf-strength">
          <div className="strength-badge" style={{
            background: strengthColor + '20',
            borderColor: strengthColor,
            color: strengthColor
          }}>
            {strength}
          </div>
        </div>
      </div>

      {/* Direction */}
      <div className="conf-direction">
        <span className="direction-label">Direction:</span>
        <span className="direction-value" style={{ color: directionColor }}>
          {directionIcon} {direction.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="conf-details">
        <div className="detail-description">{details.description}</div>

        {/* Wick/Body Percentages */}
        {details.upperWickPercent && (
          <div className="detail-row">
            <span className="detail-label">Upper Wick:</span>
            <span className="detail-value">{details.upperWickPercent}</span>
          </div>
        )}

        {details.lowerWickPercent && (
          <div className="detail-row">
            <span className="detail-label">Lower Wick:</span>
            <span className="detail-value">{details.lowerWickPercent}</span>
          </div>
        )}

        {details.bodyPercent && (
          <div className="detail-row">
            <span className="detail-label">Body Size:</span>
            <span className="detail-value">{details.bodyPercent}</span>
          </div>
        )}

        {details.lowerWickRatio && (
          <div className="detail-row">
            <span className="detail-label">Wick Ratio:</span>
            <span className="detail-value">{details.lowerWickRatio}</span>
          </div>
        )}

        {details.upperWickRatio && (
          <div className="detail-row">
            <span className="detail-label">Wick Ratio:</span>
            <span className="detail-value">{details.upperWickRatio}</span>
          </div>
        )}
      </div>

      {/* Visual Candle Representation */}
      <div className="candle-visual">
        <div className="candle-label">Candle Pattern:</div>
        <div className="candle-diagram">
          {renderCandlePattern(type, direction, strengthColor)}
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get confirmation type display info
 */
function getConfirmationTypeInfo(type) {
  const types = {
    'PIN_BAR': {
      label: 'Pin Bar',
      icon: '📍',
      description: 'Long wick showing rejection'
    },
    'HAMMER': {
      label: 'Hammer',
      icon: '🔨',
      description: 'Bullish reversal pattern'
    },
    'SHOOTING_STAR': {
      label: 'Shooting Star',
      icon: '⭐',
      description: 'Bearish reversal pattern'
    },
    'ENGULFING': {
      label: 'Engulfing',
      icon: '🔄',
      description: 'Full body engulfing'
    },
    'DOJI': {
      label: 'Doji',
      icon: '➕',
      description: 'Indecision candle'
    }
  };

  return types[type] || { label: type, icon: '📊', description: 'Confirmation detected' };
}

/**
 * Render ASCII-style candle pattern
 */
function renderCandlePattern(type, direction, color) {
  if (type === 'PIN_BAR') {
    if (direction === 'bearish') {
      // Bearish Pin Bar - long upper wick
      return (
        <div className="candle-ascii">
          <div className="candle-wick upper-wick" style={{ borderColor: color, height: '40px' }}></div>
          <div className="candle-body bearish-body" style={{ background: color }}></div>
          <div className="candle-wick lower-wick" style={{ borderColor: color, height: '5px' }}></div>
        </div>
      );
    } else {
      // Bullish Pin Bar - long lower wick
      return (
        <div className="candle-ascii">
          <div className="candle-wick upper-wick" style={{ borderColor: color, height: '5px' }}></div>
          <div className="candle-body bullish-body" style={{ background: color }}></div>
          <div className="candle-wick lower-wick" style={{ borderColor: color, height: '40px' }}></div>
        </div>
      );
    }
  }

  if (type === 'HAMMER') {
    // Hammer - long lower wick, small body at top
    return (
      <div className="candle-ascii">
        <div className="candle-wick upper-wick" style={{ borderColor: color, height: '2px' }}></div>
        <div className="candle-body bullish-body" style={{ background: color }}></div>
        <div className="candle-wick lower-wick" style={{ borderColor: color, height: '45px' }}></div>
      </div>
    );
  }

  if (type === 'SHOOTING_STAR') {
    // Shooting Star - long upper wick, small body at bottom
    return (
      <div className="candle-ascii">
        <div className="candle-wick upper-wick" style={{ borderColor: color, height: '45px' }}></div>
        <div className="candle-body bearish-body" style={{ background: color }}></div>
        <div className="candle-wick lower-wick" style={{ borderColor: color, height: '2px' }}></div>
      </div>
    );
  }

  // Default candle
  return (
    <div className="candle-ascii">
      <div className="candle-wick upper-wick" style={{ borderColor: color, height: '15px' }}></div>
      <div className="candle-body" style={{ background: color }}></div>
      <div className="candle-wick lower-wick" style={{ borderColor: color, height: '15px' }}></div>
    </div>
  );
}
