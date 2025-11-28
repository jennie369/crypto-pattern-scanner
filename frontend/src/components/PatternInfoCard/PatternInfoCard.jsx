// ============================================
// 💎 PATTERN INFO CARD COMPONENT
// ============================================
// Displays pattern information with GEM design system

import React from 'react';
import { getPatternSignal } from '../../constants/patternSignals';
import './PatternInfoCard.css';

/**
 * PatternInfoCard Component
 *
 * Displays comprehensive pattern information:
 * - Signal direction (LONG/SHORT) with icons
 * - Pattern type and description
 * - Timeframe metadata (best, good, caution)
 * - Pattern state (FRESH, ACTIVE, WAITING, etc.)
 * - Entry, stop loss, target prices
 * - Win rate and R:R info
 * - Risk/reward visualization
 *
 * @param {Object} pattern - Pattern object with all metadata
 * @param {Function} onClick - Click handler for pattern selection
 * @param {Boolean} isSelected - Whether this pattern is currently selected
 */
export const PatternInfoCard = ({ pattern, onClick, isSelected = false }) => {
  if (!pattern) return null;

  const {
    patternType,
    symbol,
    timeframe,
    entry,
    stopLoss,
    target,
    zone,
    detectedAt,
    state,
    stateInfo,
    profitPercent,
    lossPercent,
    opacity = 1.0,
    highlight = false
  } = pattern;

  // Get signal metadata
  const signalInfo = getPatternSignal(patternType);
  const {
    signal,
    direction,
    type,
    color,
    iconColor,
    icon,
    label,
    fullLabel,
    description,
    expectedWinRate,
    avgRR,
    bestTimeframes,
    goodTimeframes,
    cautionTimeframes
  } = signalInfo;

  // Calculate R:R ratio
  const calculateRR = () => {
    if (!entry || !stopLoss || !target) return null;
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    return reward / risk;
  };

  const rr = calculateRR();

  // Check if current timeframe is in best/good/caution list
  const getTimeframeCategory = () => {
    if (bestTimeframes?.includes(timeframe)) return 'best';
    if (goodTimeframes?.includes(timeframe)) return 'good';
    if (cautionTimeframes?.includes(timeframe)) return 'caution';
    return 'unknown';
  };

  const timeframeCategory = getTimeframeCategory();

  // Format price
  const formatPrice = (price) => {
    if (!price) return '-';
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`pattern-info-card ${isSelected ? 'selected' : ''} ${highlight ? 'highlight' : ''} ${state?.toLowerCase()}`}
      onClick={onClick}
      style={{ opacity }}
    >
      {/* Header: Signal + State */}
      <div className="card-header">
        <div className="signal-badge" style={{ borderColor: iconColor }}>
          <span className="signal-icon" style={{ color: iconColor }}>{icon}</span>
          <span className="signal-label" style={{ color: iconColor }}>{direction}</span>
          <span className="signal-type">{type}</span>
        </div>

        {stateInfo && (
          <div
            className="state-badge"
            style={{
              color: stateInfo.color,
              backgroundColor: stateInfo.bgColor,
              borderColor: stateInfo.color
            }}
          >
            {stateInfo.label}
          </div>
        )}
      </div>

      {/* Pattern Info */}
      <div className="card-body">
        <div className="pattern-title">
          <h3>{patternType}</h3>
          <span className="pattern-symbol">{symbol}</span>
        </div>

        <p className="pattern-description">{description}</p>

        {/* Timeframe Info */}
        <div className="timeframe-info">
          <div className={`current-timeframe ${timeframeCategory}`}>
            <span className="tf-icon">⏱</span>
            <span className="tf-value">{timeframe}</span>
            {timeframeCategory === 'best' && <span className="tf-badge">⭐ BEST</span>}
            {timeframeCategory === 'good' && <span className="tf-badge">✓ GOOD</span>}
            {timeframeCategory === 'caution' && <span className="tf-badge">⚠ CAUTION</span>}
          </div>

          <div className="recommended-timeframes">
            <span className="tf-label">Best TF:</span>
            <div className="tf-chips">
              {bestTimeframes?.map(tf => (
                <span key={tf} className="tf-chip best">{tf}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className="price-levels">
          <div className="price-row target">
            <span className="price-label">🎯 Target</span>
            <span className="price-value">{formatPrice(target)}</span>
          </div>

          <div className="price-row entry">
            <span className="price-label">📍 Entry</span>
            <span className="price-value">{formatPrice(entry)}</span>
          </div>

          {zone && (
            <div className="price-row zone">
              <span className="price-label">📦 Zone</span>
              <span className="price-value">
                {formatPrice(zone.bottom)} - {formatPrice(zone.top)}
              </span>
            </div>
          )}

          <div className="price-row stop">
            <span className="price-label">🛑 Stop</span>
            <span className="price-value">{formatPrice(stopLoss)}</span>
          </div>
        </div>

        {/* Stats: Win Rate + R:R */}
        <div className="pattern-stats">
          <div className="stat-item">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{expectedWinRate}%</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <span className="stat-label">R:R</span>
            <span className="stat-value">
              {rr ? `1:${rr.toFixed(1)}` : `1:${avgRR}`}
            </span>
          </div>
        </div>

        {/* Result (if completed) */}
        {state === 'TARGET_HIT' && profitPercent && (
          <div className="pattern-result profit">
            <span className="result-icon">✅</span>
            <span className="result-label">Profit:</span>
            <span className="result-value">+{profitPercent.toFixed(2)}%</span>
          </div>
        )}

        {state === 'STOPPED_OUT' && lossPercent && (
          <div className="pattern-result loss">
            <span className="result-icon">❌</span>
            <span className="result-label">Loss:</span>
            <span className="result-value">-{lossPercent.toFixed(2)}%</span>
          </div>
        )}
      </div>

      {/* Footer: Detected Time */}
      <div className="card-footer">
        <span className="detected-time">
          🕐 Detected: {formatDate(detectedAt)}
        </span>
      </div>

      {/* Active Pulse Animation */}
      {stateInfo?.pulse && (
        <div className="pulse-ring" style={{ borderColor: stateInfo.color }}></div>
      )}
    </div>
  );
};

export default PatternInfoCard;
