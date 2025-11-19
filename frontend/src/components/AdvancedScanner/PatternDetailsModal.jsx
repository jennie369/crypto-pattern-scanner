import React, { useState } from 'react'
import { determineEntryStatus, checkConfirmationCandle } from '../../utils/entryWorkflow'
import EntryStatusDisplay from './EntryStatusDisplay'
import ZoneRetestTracker from './ZoneRetestTracker'
import ConfirmationIndicator from './ConfirmationIndicator'
import {
  X, BarChart3, Target, Star, CheckCircle, Circle, TrendingUp,
  TrendingDown, RefreshCw, AlertCircle, Bell, LineChart, Copy
} from 'lucide-react'
import './PatternDetailsModal.css'

/**
 * PatternDetailsModal Component
 *
 * Full-screen modal showing comprehensive pattern breakdown
 *
 * Features:
 * - Pattern info (type, confidence, timestamp)
 * - Zone details with retest tracker
 * - Entry workflow status
 * - Confirmation candle analysis
 * - Action buttons (Set Alert, View Chart, Copy Trade)
 *
 * Props:
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close callback
 * @param {Object} pattern - Pattern object
 * @param {number} currentPrice - Current market price
 * @param {Object} latestCandle - Latest candlestick data
 * @param {Function} onSetAlert - Alert creation callback
 * @param {Function} onViewChart - Chart navigation callback
 */
export default function PatternDetailsModal({
  isOpen,
  onClose,
  pattern,
  currentPrice,
  latestCandle,
  onSetAlert,
  onViewChart
}) {

  const [activeTab, setActiveTab] = useState('overview');

  // Don't render if not open
  if (!isOpen || !pattern) {
    return null;
  }

  // Calculate entry status
  const entryStatus = determineEntryStatus(pattern, currentPrice, latestCandle);

  // Check confirmation
  const confirmation = latestCandle && pattern.zone
    ? checkConfirmationCandle(latestCandle, pattern.zone.type)
    : null;

  // Pattern type info
  const patternInfo = getPatternInfo(pattern.pattern);

  // Zone info
  const zone = pattern.zone || {};

  return (
    <div className="pattern-modal-overlay" onClick={onClose}>
      <div className="pattern-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* ═══════════════════════════════════════════════════════════════════
             Modal Header
             ═══════════════════════════════════════════════════════════════════ */}
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="pattern-icon">{patternInfo.icon}</div>
            <div className="pattern-title-info">
              <h2 className="pattern-title">{patternInfo.label}</h2>
              <div className="pattern-subtitle">{pattern.symbol} • {pattern.timeframe}</div>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
             Tab Navigation
             ═══════════════════════════════════════════════════════════════════ */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} /> Overview
          </button>
          <button
            className={`modal-tab ${activeTab === 'entry' ? 'active' : ''}`}
            onClick={() => setActiveTab('entry')}
          >
            <Target size={16} /> Entry Status
          </button>
          <button
            className={`modal-tab ${activeTab === 'zone' ? 'active' : ''}`}
            onClick={() => setActiveTab('zone')}
          >
            <Star size={16} /> Zone Quality
          </button>
          <button
            className={`modal-tab ${activeTab === 'confirmation' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmation')}
          >
            <CheckCircle size={16} /> Confirmation
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
             Modal Body (Tabbed Content)
             ═══════════════════════════════════════════════════════════════════ */}
        <div className="modal-body">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h3 className="section-title"><BarChart3 size={20} /> Pattern Overview</h3>

              {/* Pattern Info Card */}
              <div className="info-card">
                <div className="info-row">
                  <span className="info-label">Pattern Type:</span>
                  <span className="info-value">{patternInfo.label}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Description:</span>
                  <span className="info-description">{patternInfo.description}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Confidence:</span>
                  <span className="info-value confidence-value">
                    {pattern.confidence}% {getConfidenceBadge(pattern.confidence)}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Detected At:</span>
                  <span className="info-value">
                    {pattern.detectedAt
                      ? new Date(pattern.detectedAt).toLocaleString('vi-VN')
                      : 'N/A'
                    }
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Current Price:</span>
                  <span className="info-value price-value">
                    ${currentPrice?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Zone Info Card */}
              {zone.type && (
                <div className="info-card zone-info-card">
                  <h4 className="card-title">
                    {zone.type === 'HFZ' ? <Circle className="zone-icon hfz" size={16} fill="currentColor" /> : <Circle className="zone-icon lfz" size={16} fill="currentColor" />} {zone.type} Zone
                  </h4>

                  <div className="info-row">
                    <span className="info-label">Zone Range:</span>
                    <span className="info-value">
                      ${zone.bottom?.toFixed(2)} - ${zone.top?.toFixed(2)}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Zone Mid:</span>
                    <span className="info-value">${zone.mid?.toFixed(2)}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Zone Type:</span>
                    <span className="info-value">
                      {zone.type === 'HFZ' ? 'Resistance (Short)' : 'Support (Long)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Trading Recommendation */}
              <div className={`recommendation-card ${entryStatus.allowEntry ? 'allow-entry' : 'wait-entry'}`}>
                <div className="recommendation-icon">
                  {entryStatus.allowEntry ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-title">
                    {entryStatus.allowEntry ? 'ENTRY ALLOWED!' : 'WAIT FOR RETEST'}
                  </div>
                  <div className="recommendation-message">
                    {entryStatus.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ENTRY STATUS TAB */}
          {activeTab === 'entry' && (
            <div className="tab-content">
              <h3 className="section-title"><Target size={20} /> Entry Workflow Status</h3>
              <EntryStatusDisplay
                pattern={pattern}
                currentPrice={currentPrice}
                currentStatus={entryStatus}
                onSetAlert={onSetAlert}
              />
            </div>
          )}

          {/* ZONE QUALITY TAB */}
          {activeTab === 'zone' && (
            <div className="tab-content">
              <h3 className="section-title"><Star size={20} /> Zone Quality & Retest Tracker</h3>
              {zone.type ? (
                <ZoneRetestTracker zone={zone} />
              ) : (
                <div className="no-data-message">
                  <AlertCircle size={20} /> No zone data available for this pattern
                </div>
              )}
            </div>
          )}

          {/* CONFIRMATION TAB */}
          {activeTab === 'confirmation' && (
            <div className="tab-content">
              <h3 className="section-title"><CheckCircle size={20} /> Confirmation Candle Analysis</h3>
              <ConfirmationIndicator confirmation={confirmation} />
            </div>
          )}

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
             Modal Footer (Action Buttons)
             ═══════════════════════════════════════════════════════════════════ */}
        <div className="modal-footer">
          <button
            className="action-btn btn-set-alert"
            onClick={() => onSetAlert && onSetAlert(pattern)}
          >
            <Bell size={16} /> Set Alert
          </button>

          <button
            className="action-btn btn-view-chart"
            onClick={() => onViewChart && onViewChart(pattern)}
          >
            <LineChart size={16} /> View on Chart
          </button>

          <button
            className="action-btn btn-copy-trade"
            onClick={() => copyTradeSetup(pattern, zone, entryStatus)}
          >
            <Copy size={16} /> Copy Setup
          </button>

          <button
            className="action-btn btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get pattern display info
 */
function getPatternInfo(patternType) {
  const patterns = {
    'DPD': {
      label: 'DPD (Drop-Pullback-Drop)',
      icon: <TrendingDown size={24} />,
      description: 'Bearish continuation pattern - Price drops, pulls back to HFZ resistance, then drops again'
    },
    'UPU': {
      label: 'UPU (Up-Pullback-Up)',
      icon: <TrendingUp size={24} />,
      description: 'Bullish continuation pattern - Price rises, pulls back to LFZ support, then rises again'
    },
    'UPD': {
      label: 'UPD (Up-Pullback-Drop)',
      icon: <RefreshCw size={24} />,
      description: 'Reversal pattern - Price rises then reverses at HFZ resistance'
    },
    'DPU': {
      label: 'DPU (Drop-Pullback-Up)',
      icon: <RefreshCw size={24} />,
      description: 'Reversal pattern - Price drops then reverses at LFZ support'
    },
    'HFZ': {
      label: 'HFZ (High Frequency Zone)',
      icon: <Circle size={24} className="hfz-icon" fill="currentColor" />,
      description: 'Resistance zone where price frequently rejects'
    },
    'LFZ': {
      label: 'LFZ (Low Frequency Zone)',
      icon: <Circle size={24} className="lfz-icon" fill="currentColor" />,
      description: 'Support zone where price frequently bounces'
    }
  };

  return patterns[patternType] || {
    label: patternType,
    icon: <BarChart3 size={24} />,
    description: 'Pattern detected'
  };
}

/**
 * Get confidence badge
 */
function getConfidenceBadge(confidence) {
  if (confidence >= 80) return <><Circle size={12} fill="currentColor" className="badge-high" /> High</>;
  if (confidence >= 60) return <><Circle size={12} fill="currentColor" className="badge-medium" /> Medium</>;
  return <><Circle size={12} fill="currentColor" className="badge-low" /> Low</>;
}

/**
 * Copy trade setup to clipboard
 */
function copyTradeSetup(pattern, zone, entryStatus) {
  const setup = `
🎯 TRADE SETUP - ${pattern.pattern}

Symbol: ${pattern.symbol}
Timeframe: ${pattern.timeframe}
Confidence: ${pattern.confidence}%

${zone.type} Zone: $${zone.bottom?.toFixed(2)} - $${zone.top?.toFixed(2)}
Zone Mid: $${zone.mid?.toFixed(2)}

Entry Status: ${entryStatus.message}

${entryStatus.allowEntry ? '✅ ENTRY ALLOWED' : '⚠️ WAIT FOR RETEST'}

---
Generated by GEM Trading Academy
  `.trim();

  navigator.clipboard.writeText(setup).then(() => {
    alert('[CheckCircle] Trade setup copied to clipboard!');
  }).catch(() => {
    alert('[XCircle] Failed to copy to clipboard');
  });
}
