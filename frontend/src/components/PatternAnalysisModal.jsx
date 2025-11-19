import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { formatPrice } from '../utils/currencyConverter';
import {
  X, BarChart3, Target, Circle, TrendingUp, AlertTriangle, Ruler,
  Edit3, CheckCircle, AlertCircle, Lightbulb, Copy, ExternalLink
} from 'lucide-react';
import './PatternAnalysisModal.css';

/**
 * Pattern Analysis Modal
 * Shows detailed analysis of detected pattern
 */
function PatternAnalysisModal({ pattern, displayCurrency, onClose }) {
  const { t } = useTranslation();

  console.log('🎨 PatternAnalysisModal rendering for:', pattern);

  // Calculate risk/reward ratio
  const calculateRR = () => {
    if (!pattern) return '0';
    const risk = Math.abs(pattern.entry - pattern.stopLoss);
    const reward = Math.abs(pattern.takeProfit[0] - pattern.entry);
    return (reward / risk).toFixed(2);
  };

  // Calculate position size suggestion
  const calculatePositionSize = (accountSize = 10000, riskPercent = 1) => {
    if (!pattern) return '0';
    const riskAmount = accountSize * (riskPercent / 100);
    const stopDistance = Math.abs(pattern.entry - pattern.stopLoss);
    const positionSize = riskAmount / stopDistance;
    return positionSize.toFixed(4);
  };

  const handleCopyAll = () => {
    const text = `${pattern.symbol} - ${pattern.patternType}
Entry: ${pattern.entry}
Stop Loss: ${pattern.stopLoss}
Take Profit: ${pattern.takeProfit.join(', ')}
Risk/Reward: 1:${calculateRR()}`;

    navigator.clipboard.writeText(text);
    console.log('📋 Copied all levels to clipboard');
  };

  const handleOpenBinance = () => {
    const symbol = pattern.symbol.replace('USDT', '_USDT');
    const url = `https://www.binance.com/en/futures/${symbol}`;
    window.open(url, '_blank');
    console.log('🔗 Opening Binance:', url);
  };

  if (!pattern) return null;

  return (
    <div className="analysis-modal-overlay" onClick={onClose}>
      <div className="analysis-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="analysis-header">
          <div className="header-left">
            <h2><BarChart3 size={24} /> {t('fullAnalysis')}</h2>
            <p className="pattern-name">{pattern.patternType}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Pattern Info */}
        <div className="analysis-section">
          <h3><Target size={20} /> {t('patternDetails')}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>{t('symbol')}:</label>
              <span>{pattern.symbol}</span>
            </div>
            <div className="info-item">
              <label>{t('direction')}:</label>
              <span className={`direction ${pattern.direction}`}>
                {pattern.direction === 'bullish' ? <Circle size={12} fill="currentColor" className="bullish-icon" /> : <Circle size={12} fill="currentColor" className="bearish-icon" />}
                {' '}
                {t(pattern.direction)}
              </span>
            </div>
            <div className="info-item">
              <label>{t('confidence')}:</label>
              <span className="confidence">{(pattern.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="info-item">
              <label>{t('detectedAt')}:</label>
              <span>{new Date(pattern.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className="analysis-section">
          <h3><TrendingUp size={20} /> {t('priceLevels')}</h3>
          <div className="price-levels">
            <div className="price-level entry">
              <label>{t('entry')}:</label>
              <span className="price">{formatPrice(pattern.entry, displayCurrency)}</span>
            </div>
            <div className="price-level stop-loss">
              <label>{t('stopLoss')}:</label>
              <span className="price">{formatPrice(pattern.stopLoss, displayCurrency)}</span>
            </div>
            {pattern.takeProfit.map((tp, index) => (
              <div key={index} className="price-level take-profit">
                <label>TP{index + 1}:</label>
                <span className="price">{formatPrice(tp, displayCurrency)}</span>
                <span className="profit-percent">
                  +{((Math.abs(tp - pattern.entry) / pattern.entry) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="analysis-section">
          <h3><AlertTriangle size={20} /> {t('riskAnalysis')}</h3>
          <div className="risk-metrics">
            <div className="metric-card">
              <div className="metric-label">{t('riskRewardRatio')}</div>
              <div className="metric-value">1:{calculateRR()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t('stopDistance')}</div>
              <div className="metric-value">
                {Math.abs(pattern.entry - pattern.stopLoss).toFixed(2)} USDT
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t('targetDistance')}</div>
              <div className="metric-value">
                {Math.abs(pattern.takeProfit[0] - pattern.entry).toFixed(2)} USDT
              </div>
            </div>
          </div>
        </div>

        {/* Position Sizing */}
        <div className="analysis-section">
          <h3><Ruler size={20} /> {t('positionSizing')}</h3>
          <div className="position-suggestions">
            <div className="position-row">
              <span>{t('risk1Percent')}:</span>
              <span className="position-value">
                {calculatePositionSize(10000, 1)} {pattern.symbol.replace('USDT', '')}
              </span>
            </div>
            <div className="position-row">
              <span>{t('risk2Percent')}:</span>
              <span className="position-value">
                {calculatePositionSize(10000, 2)} {pattern.symbol.replace('USDT', '')}
              </span>
            </div>
            <div className="position-row">
              <span>{t('risk3Percent')}:</span>
              <span className="position-value">
                {calculatePositionSize(10000, 3)} {pattern.symbol.replace('USDT', '')}
              </span>
            </div>
          </div>
          <p className="position-note">
            <Lightbulb size={16} className="note-icon" /> {t('positionSizeNote')}
          </p>
        </div>

        {/* Trading Notes */}
        <div className="analysis-section">
          <h3><Edit3 size={20} /> {t('tradingNotes')}</h3>
          <div className="trading-notes">
            <div className="note-item">
              <CheckCircle size={16} className="note-icon" />
              <span>{t('waitForConfirmation')}</span>
            </div>
            <div className="note-item">
              <AlertCircle size={16} className="note-icon" />
              <span>{t('setStopLossImmediately')}</span>
            </div>
            <div className="note-item">
              <Lightbulb size={16} className="note-icon" />
              <span>{t('considerMarketConditions')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="analysis-actions">
          <button className="btn-copy-all" onClick={handleCopyAll}>
            <Copy size={16} /> {t('copyAllLevels')}
          </button>
          <button className="btn-open-binance" onClick={handleOpenBinance}>
            <ExternalLink size={16} /> {t('openInBinance')}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PatternAnalysisModal;
