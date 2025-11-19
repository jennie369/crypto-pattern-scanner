import React, { useState, useEffect } from 'react';
import { BarChart3, Target, StopCircle, DollarSign, TrendingUp, TrendingDown, Copy, Check, AlertTriangle, Star } from 'lucide-react';
import { generatePatternThumbnail, generateMockCandleData } from '../utils/patternImageGenerator';
import { formatPrice as formatCurrencyPrice, getCurrentCurrency } from '../utils/currencyConverter';
import PatternAnalysisModal from './PatternAnalysisModal';
import {
  BullishCandle,
  BearishCandle,
  PauseCandle,
  MiniPatternChart,
  HFZIcon,
  LFZIcon
} from './CandlestickIcons';
import './TradingInfoSidebar.css';

/**
 * TradingInfoSidebar Component
 * Displays trading metrics with copy functionality
 *
 * Props:
 * - pattern: Current pattern data with entry/SL/TP
 * - symbol: Current symbol
 */
export default function TradingInfoSidebar({ pattern, symbol }) {
  const [copiedField, setCopiedField] = useState(null);
  const [patternImage, setPatternImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  console.log('📊 TradingInfoSidebar - showAnalysisModal:', showAnalysisModal);

  // Load currency from settings
  useEffect(() => {
    console.log('=== TRADING INFO SIDEBAR: Loading currency ===');

    const loadCurrency = () => {
      const currentCurrency = getCurrentCurrency();
      console.log('💱 getCurrentCurrency() returned:', currentCurrency);
      setCurrency(currentCurrency);
      console.log('✅ Currency state set to:', currentCurrency);
    };

    loadCurrency();

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      console.log('🔔 TRADING INFO SIDEBAR: Received settingsUpdated event!');
      console.log('Event detail:', event.detail);

      if (event.detail && event.detail.currency) {
        const newCurrency = event.detail.currency;
        console.log(`💱 Updating currency: ${currency} → ${newCurrency}`);
        setCurrency(newCurrency);
        console.log('✅ Currency updated in TradingInfoSidebar!');
      }
    };

    console.log('👂 Adding event listener for settingsUpdated...');
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      console.log('🧹 Removing event listener for settingsUpdated');
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Generate pattern thumbnail when pattern changes
  useEffect(() => {
    if (!pattern) {
      setPatternImage(null);
      return;
    }

    const generateImage = async () => {
      setLoadingImage(true);
      try {
        // Generate mock candle data for pattern visualization
        const candles = generateMockCandleData(pattern, 50);

        // Generate thumbnail with highlighted area
        const imageUrl = await generatePatternThumbnail(pattern, candles, {
          width: 300,
          height: 200,
          highlightOpacity: 0.2,
        });

        setPatternImage(imageUrl);
      } catch (error) {
        console.error('Error generating pattern image:', error);
      } finally {
        setLoadingImage(false);
      }
    };

    // Only generate if pattern doesn't already have an image
    if (!pattern.patternImage) {
      generateImage();
    } else {
      setPatternImage(pattern.patternImage);
    }
  }, [pattern]);

  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value.toString());
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '---';
    return formatCurrencyPrice(price, currency);
  };

  const calculateRiskReward = () => {
    if (!pattern) return '---';
    const risk = Math.abs(pattern.entry - pattern.stopLoss);
    const reward = Math.abs(pattern.takeProfit[0] - pattern.entry);
    const ratio = (reward / risk).toFixed(2);
    return `1:${ratio}`;
  };

  const calculateProfitPercent = (tp) => {
    if (!pattern) return '0.00';
    const percent = ((tp - pattern.entry) / pattern.entry) * 100;
    return Math.abs(percent).toFixed(2);
  };

  // Render pattern candlestick icons based on pattern code
  const renderPatternIcons = () => {
    const patternCode = pattern.patternCode || '';
    const size = 36;

    // Use MiniPatternChart for known patterns
    if (['DPD', 'UPU', 'UPD', 'DPU'].includes(patternCode)) {
      return <MiniPatternChart pattern={patternCode} size={120} />;
    }

    // For zone patterns, show zone icon
    if (patternCode === 'HFZ') {
      return <HFZIcon size={40} />;
    }
    if (patternCode === 'LFZ') {
      return <LFZIcon size={40} />;
    }

    // Fallback: render based on direction
    if (pattern.direction === 'bullish') {
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <BullishCandle size={size} />
          <PauseCandle size={size} />
          <BullishCandle size={size} />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <BearishCandle size={size} />
          <PauseCandle size={size} />
          <BearishCandle size={size} />
        </div>
      );
    }
  };

  if (!pattern) {
    return (
      <div className="trading-info-sidebar">
        <div className="sidebar-header">
          <h3><BarChart3 className="w-5 h-5 inline mr-1" /> Trading Info</h3>
        </div>
        <div className="no-pattern">
          <p>Select a coin to view trading information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-info-sidebar">
      <div className="sidebar-header">
        <h3><BarChart3 className="w-5 h-5 inline mr-1" /> Trading Info</h3>
        <span className="symbol-display">{symbol} Perp</span>
      </div>

      <div className="info-content">
        {/* GEM FREQUENCY METHOD - Pattern Info */}
        <div className="info-section gem-pattern">
          <div className="section-title">
            <span>GEM Frequency Pattern</span>
          </div>

          <div className="pattern-display">
            <div className="pattern-icon-large">{renderPatternIcons()}</div>
            <div className="pattern-details">
              <div className="pattern-name-gem">
                {pattern.patternType}
                <span className={`pattern-code ${pattern.patternCategory}`}>
                  {pattern.patternCode || 'N/A'}
                </span>
              </div>
              <div className="pattern-category">
                {pattern.patternCategory === 'continuation' && <><BarChart3 className="w-4 h-4 inline mr-1" /> Continuation Pattern</>}
                {pattern.patternCategory === 'reversal' && <><TrendingUp className="w-4 h-4 inline mr-1" /> Reversal Pattern</>}
                {pattern.patternCategory === 'zone' && <><Target className="w-4 h-4 inline mr-1" /> Supply/Demand Zone</>}
              </div>
            </div>
          </div>

          {/* Zone Status - CRITICAL for GEM Method */}
          {pattern.zoneStatus && (
            <div className="zone-status-container">
              <div className="zone-status-label">Zone Status:</div>
              <div className={`zone-status-badge ${pattern.zoneStatus}`}>
                {pattern.zoneStatus === 'fresh' && <><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /> Fresh (Best)</>}
                {pattern.zoneStatus === 'tested_1x' && <><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /> Tested 1x (Good)</>}
                {pattern.zoneStatus === 'tested_2x' && <><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /><Star className="w-3 h-3 inline" /> Tested 2x (Okay)</>}
                {pattern.zoneStatus === 'weak' && <><AlertTriangle className="w-3 h-3 inline" /> Tested 3+ (Skip)</>}
              </div>
              <div className="retest-count">
                Retest Count: <span className="count-value">{pattern.retestCount || 0}</span>
              </div>
            </div>
          )}

          {/* CRITICAL WARNING - Wait for Retest! */}
          {pattern.waitingRetest && (
            <div className="retest-warning">
              <div className="warning-icon"><AlertTriangle className="w-6 h-6" /></div>
              <div className="warning-text">
                <strong>WAIT FOR RETEST!</strong>
                <p>Do NOT entry at breakout. Entry when price retests this zone with confirmation.</p>
              </div>
            </div>
          )}

          {/* Direction & Confidence */}
          <div className="pattern-meta">
            <span className={`direction-badge ${pattern.direction}`}>
              {pattern.direction === 'bullish' ? <><TrendingUp className="w-4 h-4 inline mr-1 text-green-500" /> LONG</> : <><TrendingDown className="w-4 h-4 inline mr-1 text-red-500" /> SHORT</>}
            </span>
            <span className="confidence-display">
              <span>Confidence:</span>
              <span className="confidence-value">{(pattern.confidence * 100).toFixed(0)}%</span>
            </span>
          </div>
        </div>

        {/* Trading Metrics */}
        <div className="info-section metrics">
          <div className="section-title">Entry & Exit Levels</div>

          {/* Entry */}
          <div className="metric-row entry">
            <div className="metric-label">
              <span className="icon"><Target className="w-4 h-4" /></span>
              <span>Entry Price</span>
            </div>
            <div className="metric-value-group">
              <span className="value">${formatPrice(pattern.entry)}</span>
              <button
                className={`copy-btn ${copiedField === 'entry' ? 'copied' : ''}`}
                onClick={() => handleCopy('entry', pattern.entry)}
              >
                {copiedField === 'entry' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stop Loss */}
          <div className="metric-row stop-loss">
            <div className="metric-label">
              <span className="icon"><StopCircle className="w-4 h-4" /></span>
              <span>Stop Loss</span>
            </div>
            <div className="metric-value-group">
              <span className="value">${formatPrice(pattern.stopLoss)}</span>
              <button
                className={`copy-btn ${copiedField === 'stopLoss' ? 'copied' : ''}`}
                onClick={() => handleCopy('stopLoss', pattern.stopLoss)}
              >
                {copiedField === 'stopLoss' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Take Profit Levels */}
          {pattern.takeProfit.map((tp, index) => (
            <div key={index} className="metric-row take-profit">
              <div className="metric-label">
                <span className="icon"><DollarSign className="w-4 h-4" /></span>
                <span>TP {index + 1}</span>
                <span className="profit-percent">+{calculateProfitPercent(tp)}%</span>
              </div>
              <div className="metric-value-group">
                <span className="value">${formatPrice(tp)}</span>
                <button
                  className={`copy-btn ${copiedField === `tp${index}` ? 'copied' : ''}`}
                  onClick={() => handleCopy(`tp${index}`, tp)}
                >
                  {copiedField === `tp${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Risk Analysis */}
        <div className="info-section risk-analysis">
          <div className="section-title">Risk Analysis</div>

          <div className="risk-row">
            <span className="risk-label">Risk/Reward Ratio</span>
            <span className="risk-value highlight">{calculateRiskReward()}</span>
          </div>

          <div className="risk-row">
            <span className="risk-label">Pattern Strength</span>
            <span className={`risk-value ${pattern.confidence >= 0.8 ? 'strong' : 'moderate'}`}>
              {pattern.confidence >= 0.8 ? 'Strong' : 'Moderate'}
            </span>
          </div>

          <div className="risk-row">
            <span className="risk-label">Detected At</span>
            <span className="risk-value">
              {new Date(pattern.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="info-section quick-actions">
          <div className="section-title">Quick Actions</div>

          <button
            className="action-btn primary"
            onClick={() => {
              console.log('🔥 View Full Analysis clicked!');
              setShowAnalysisModal(true);
            }}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" /> View Full Analysis
          </button>
          <button
            className="action-btn secondary"
            onClick={() => {
              const text = `${symbol} - ${pattern.patternType}\nEntry: ${pattern.entry}\nSL: ${pattern.stopLoss}\nTP: ${pattern.takeProfit.join(', ')}`;
              handleCopy('all', text);
            }}
          >
            {copiedField === 'all' ? <><Check className="w-4 h-4 inline mr-1" /> Copied All</> : <><Copy className="w-4 h-4 inline mr-1" /> Copy All Levels</>}
          </button>
        </div>

        {/* Pattern Image - CRITICAL: Shows highlighted pattern area */}
        <div className="info-section pattern-preview">
          <div className="section-title"><TrendingUp className="w-4 h-4 inline mr-1" /> Pattern Chart Visualization</div>

          {loadingImage ? (
            <div className="pattern-image-loading">
              <div className="loading-spinner"></div>
              <p>Generating chart...</p>
            </div>
          ) : patternImage ? (
            <div className="pattern-image-container">
              <img src={patternImage} alt={pattern.patternType} />
              <div className="pattern-image-caption">
                <span className="caption-icon"><AlertTriangle className="w-4 h-4" /></span>
                <span className="caption-text">Highlighted area shows {pattern.patternCode} zone</span>
              </div>
            </div>
          ) : (
            <div className="pattern-image-placeholder">
              <span className="placeholder-icon">{pattern.patternIcon || <BarChart3 className="w-8 h-8" />}</span>
              <span className="placeholder-text">Chart preview unavailable</span>
            </div>
          )}
        </div>
      </div>

      {/* Pattern Analysis Modal */}
      {showAnalysisModal && pattern && (
        <PatternAnalysisModal
          pattern={pattern}
          displayCurrency={currency}
          onClose={() => {
            console.log('❌ Closing analysis modal');
            setShowAnalysisModal(false);
          }}
        />
      )}
    </div>
  );
}
