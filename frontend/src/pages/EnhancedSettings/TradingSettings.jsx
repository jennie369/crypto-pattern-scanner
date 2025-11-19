/**
 * Trading Settings Component
 * - Default timeframe
 * - Risk percentage
 * - Enabled patterns
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Save, Loader, BarChart3, Clock, AlertTriangle, Target, TrendingUp, Mountain, Triangle as TriangleIcon, Ruler, Flag, Coffee } from 'lucide-react';

const TradingSettings = ({ settings, onUpdate, saving, showToast }) => {
  const { t } = useTranslation();
  const [trading, setTrading] = useState({
    defaultTimeframe: '1h',
    riskPercentage: 2,
    enabledPatterns: ['head_and_shoulders', 'double_top', 'double_bottom', 'triangle', 'wedge'],
  });

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
  ];

  const availablePatterns = [
    { id: 'head_and_shoulders', name: 'Head and Shoulders', icon: <BarChart3 size={32} /> },
    { id: 'double_top', name: 'Double Top', icon: <Mountain size={32} /> },
    { id: 'double_bottom', name: 'Double Bottom', icon: <TrendingUp size={32} /> },
    { id: 'triangle', name: 'Triangle', icon: <TriangleIcon size={32} /> },
    { id: 'wedge', name: 'Wedge', icon: <Ruler size={32} /> },
    { id: 'flag', name: 'Flag', icon: <Flag size={32} /> },
    { id: 'pennant', name: 'Pennant', icon: <Flag size={32} /> },
    { id: 'cup_and_handle', name: 'Cup and Handle', icon: <Coffee size={32} /> },
  ];

  // Load trading settings
  useEffect(() => {
    if (settings?.trading) {
      setTrading(settings.trading);
    }
  }, [settings]);

  const handleTimeframeChange = (value) => {
    setTrading((prev) => ({
      ...prev,
      defaultTimeframe: value,
    }));
  };

  const handleRiskChange = (value) => {
    setTrading((prev) => ({
      ...prev,
      riskPercentage: parseFloat(value),
    }));
  };

  const togglePattern = (patternId) => {
    setTrading((prev) => {
      const enabled = prev.enabledPatterns || [];
      const isEnabled = enabled.includes(patternId);

      return {
        ...prev,
        enabledPatterns: isEnabled
          ? enabled.filter((p) => p !== patternId)
          : [...enabled, patternId],
      };
    });
  };

  const handleSave = async () => {
    const result = await onUpdate({
      trading,
    });

    if (result.success) {
      showToast('Trading settings saved!', 'success');
    }
  };

  return (
    <div className="trading-settings-page">
      {/* Default Timeframe */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={20} /> Default Timeframe
        </h2>
        <p className="section-desc">Choose your preferred chart timeframe</p>

        <div className="setting-options" style={{ marginTop: '24px' }}>
          {timeframes.map((tf) => (
            <label
              key={tf.value}
              className={`option-card ${trading.defaultTimeframe === tf.value ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="timeframe"
                value={tf.value}
                checked={trading.defaultTimeframe === tf.value}
                onChange={(e) => handleTimeframeChange(e.target.value)}
              />
              <span className="option-icon"><Clock size={20} /></span>
              <span className="option-label">{tf.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Risk Percentage */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} /> Risk Management
        </h2>
        <p className="section-desc">Set your default risk percentage per trade</p>

        <div style={{ marginTop: '24px' }}>
          <div className="risk-slider-container">
            <label style={{ display: 'block', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
              Risk Per Trade: {trading.riskPercentage}%
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={trading.riskPercentage}
              onChange={(e) => handleRiskChange(e.target.value)}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: 'linear-gradient(to right, #00FF88 0%, #FFBD59 50%, #EF4444 100%)',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <span>0.5% (Conservative)</span>
              <span>2.5% (Moderate)</span>
              <span>5% (Aggressive)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enabled Patterns */}
      <div className="card-glass" style={{ marginBottom: '24px', padding: '32px' }}>
        <h2 className="section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} /> Pattern Detection
        </h2>
        <p className="section-desc">Choose which patterns to scan for</p>

        <div className="pattern-grid" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {availablePatterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`pattern-card ${
                trading.enabledPatterns?.includes(pattern.id) ? 'active' : ''
              }`}
              onClick={() => togglePattern(pattern.id)}
              style={{
                padding: '20px',
                background: trading.enabledPatterns?.includes(pattern.id)
                  ? 'rgba(255, 189, 89, 0.15)'
                  : 'rgba(17, 34, 80, 0.4)',
                border: trading.enabledPatterns?.includes(pattern.id)
                  ? '2px solid rgba(255, 189, 89, 0.8)'
                  : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: '8px' }}>{pattern.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                {pattern.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {saving ? (
            <>
              <Loader size={16} className="spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Trading Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TradingSettings;
