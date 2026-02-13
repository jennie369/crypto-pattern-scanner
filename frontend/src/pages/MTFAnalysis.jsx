import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Grid3x3, Layers, CheckSquare, Square, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TierGuard from '../components/TierGuard/TierGuard';
// import './MTFAnalysis.css'; // Commented out to use global styles from components.css

/**
 * MTFAnalysis Page - TIER 2
 *
 * Multi-Timeframe Analysis page with 4 TradingView widgets
 * Displays charts for 15m, 1h, 4h, and 1d timeframes
 *
 * Features:
 * - 4 synchronized TradingView charts
 * - Symbol search and selection
 * - Zone overlay on charts (HFZ/LFZ marking)
 * - Timeframe selector
 * - Chart layout toggle (grid/stacked)
 *
 * Access: scanner_tier >= 'premium'
 */
export default function MTFAnalysis() {
  const { user } = useAuth();

  // State
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [layout, setLayout] = useState('grid'); // grid or stacked
  const [activeTimeframe, setActiveTimeframe] = useState(null); // for highlighting
  const [showZones, setShowZones] = useState(true);

  // Timeframe configuration
  const timeframes = [
    { id: '15', label: '15m', interval: '15', name: '15 Minutes' },
    { id: '60', label: '1h', interval: '60', name: '1 Hour' },
    { id: '240', label: '4h', interval: '240', name: '4 Hours' },
    { id: 'D', label: '1d', interval: 'D', name: '1 Day' }
  ];

  // Load TradingView widget script
  useEffect(() => {
    // Check if script already loaded
    if (document.getElementById('tradingview-widget-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      console.log('TradingView script loaded');
      initializeCharts();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Re-initialize charts when symbol changes
  useEffect(() => {
    if (window.TradingView) {
      initializeCharts();
    }
  }, [symbol, showZones]);

  // Initialize all TradingView charts
  const initializeCharts = () => {
    if (!window.TradingView) return;

    timeframes.forEach(tf => {
      const containerId = `tradingview_${tf.id}`;
      const container = document.getElementById(containerId);

      if (container) {
        // Clear existing widget
        container.innerHTML = '';

        // Create new widget
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: tf.interval,
          timezone: 'Asia/Ho_Chi_Minh',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#1a1a2e',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId,
          studies: showZones ? [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ] : []
        });
      }
    });
  };

  // Handle symbol change
  const handleSymbolChange = (e) => {
    const newSymbol = e.target.value.toUpperCase().trim();
    if (newSymbol) {
      setSymbol(newSymbol);
    }
  };

  // Handle symbol submit
  const handleSymbolSubmit = (e) => {
    e.preventDefault();
    initializeCharts();
  };

  return (
    <TierGuard requiredTier="premium" featureName="Multi-Timeframe Analysis">
      <div className="mtf-analysis-page">

        {/* Page Header */}
        <div className="mtf-header">
          <div className="header-content">
            <h1><BarChart3 size={32} style={{ marginRight: '12px', display: 'inline-block', verticalAlign: 'middle' }} /> Multi-Timeframe Analysis</h1>
            <p className="header-subtitle">Analyze patterns across 4 timeframes simultaneously</p>
          </div>

          {/* Symbol Search */}
          <form className="symbol-search" onSubmit={handleSymbolSubmit}>
            <input
              type="text"
              placeholder="Enter symbol (e.g., BTCUSDT)"
              value={symbol}
              onChange={handleSymbolChange}
              className="symbol-input"
            />
            <button type="submit" className="btn-search">
              <Search size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Load
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="mtf-controls">

          {/* Layout Toggle */}
          <div className="control-group">
            <label>Layout:</label>
            <div className="btn-group">
              <button
                className={`btn-toggle ${layout === 'grid' ? 'active' : ''}`}
                onClick={() => setLayout('grid')}
              >
                <Grid3x3 size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Grid (2x2)
              </button>
              <button
                className={`btn-toggle ${layout === 'stacked' ? 'active' : ''}`}
                onClick={() => setLayout('stacked')}
              >
                <Layers size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Stacked
              </button>
            </div>
          </div>

          {/* Zone Overlay Toggle */}
          <div className="control-group">
            <label>Indicators:</label>
            <button
              className={`btn-toggle ${showZones ? 'active' : ''}`}
              onClick={() => setShowZones(!showZones)}
            >
              {showZones ? <CheckSquare size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> : <Square size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />} Show MA + RSI
            </button>
          </div>

          {/* Current Symbol Display */}
          <div className="control-group">
            <label>Current Symbol:</label>
            <div className="current-symbol">{symbol}</div>
          </div>

        </div>

        {/* Timeframe Info Cards */}
        <div className="timeframe-info">
          {timeframes.map(tf => (
            <div
              key={tf.id}
              className={`tf-card ${activeTimeframe === tf.id ? 'active' : ''}`}
              onClick={() => setActiveTimeframe(tf.id)}
            >
              <div className="tf-label">{tf.label}</div>
              <div className="tf-name">{tf.name}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className={`charts-container ${layout}`}>

          {/* 15m Chart */}
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><TrendingUp size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> 15 Minutes</span>
              <span className="chart-desc">Short-term scalping</span>
            </div>
            <div id="tradingview_15" className="tradingview-widget"></div>
          </div>

          {/* 1h Chart */}
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><BarChart3 size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> 1 Hour</span>
              <span className="chart-desc">Intraday trends</span>
            </div>
            <div id="tradingview_60" className="tradingview-widget"></div>
          </div>

          {/* 4h Chart */}
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><BarChart3 size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> 4 Hours</span>
              <span className="chart-desc">Swing trading</span>
            </div>
            <div id="tradingview_240" className="tradingview-widget"></div>
          </div>

          {/* 1d Chart */}
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><Calendar size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Daily</span>
              <span className="chart-desc">Long-term position</span>
            </div>
            <div id="tradingview_D" className="tradingview-widget"></div>
          </div>

        </div>

        {/* Usage Tips */}
        <div className="mtf-tips">
          <h3><TrendingUp size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> How to Use Multi-Timeframe Analysis</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">1</div>
              <div className="tip-content">
                <div className="tip-title">Top-Down Analysis</div>
                <div className="tip-text">
                  Start from Daily → 4H → 1H → 15M to identify the bigger trend first
                </div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">2</div>
              <div className="tip-content">
                <div className="tip-title">Confirm with Higher Timeframes</div>
                <div className="tip-text">
                  Only take 15m entries if they align with 1H and 4H trend direction
                </div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">3</div>
              <div className="tip-content">
                <div className="tip-title">Find Confluences</div>
                <div className="tip-text">
                  Look for zones where multiple timeframes show support/resistance
                </div>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">4</div>
              <div className="tip-content">
                <div className="tip-title">RETEST Strategy</div>
                <div className="tip-text">
                  Wait for price to retest higher timeframe zones on lower timeframes
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </TierGuard>
  );
}
