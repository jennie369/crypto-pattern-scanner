import React, { useEffect, useRef } from 'react';
import './TradingChart.css';

/**
 * Trading Chart Component
 * Integration with TradingView Lightweight Charts
 *
 * NOTE: Lightweight Charts library needs to be installed:
 * npm install lightweight-charts
 *
 * For now, this is a placeholder with mock UI
 */
export const TradingChart = ({ pattern }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !pattern) return;

    // TODO: Initialize Lightweight Charts
    // import { createChart } from 'lightweight-charts';
    // const chart = createChart(chartContainerRef.current, {
    //   width: chartContainerRef.current.clientWidth,
    //   height: 500,
    //   layout: {
    //     background: { color: 'transparent' },
    //     textColor: '#D9D9D9',
    //   },
    //   grid: {
    //     vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
    //     horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
    //   },
    // });

    // const candlestickSeries = chart.addCandlestickSeries({
    //   upColor: '#00FF88',
    //   downColor: '#F6465D',
    //   borderVisible: false,
    //   wickUpColor: '#00FF88',
    //   wickDownColor: '#F6465D',
    // });

    // Add volume bars, pattern overlays, etc.

    return () => {
      // Cleanup chart
      if (chartRef.current) {
        // chartRef.current.remove();
      }
    };
  }, [pattern]);

  if (!pattern) {
    return (
      <div className="chart-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">📊</div>
          <h3 className="heading-md">No Pattern Selected</h3>
          <p className="text-base text-secondary">
            Start a scan or select a pattern from results to view the chart
          </p>
          <div className="placeholder-features">
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Real-time candlestick chart</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Pattern overlays & zones</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>WebSocket live updates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-chart-container">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="chart-info">
          <span className="chart-symbol">{pattern.coin}</span>
          <span className="chart-badge badge-purple">{pattern.timeframe}</span>
          <span className="chart-badge badge-cyan">{pattern.pattern}</span>
          <span className={`chart-badge ${pattern.confidence >= 80 ? 'badge-green' : 'badge-orange'}`}>
            {pattern.confidence}% Confidence
          </span>
        </div>
        <div className="chart-controls">
          <button className="chart-control-btn" title="Screenshot">
            📸
          </button>
          <button className="chart-control-btn" title="Indicators">
            📊
          </button>
          <button className="chart-control-btn" title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      {/* Chart Area - Placeholder for now */}
      <div className="chart-card">
        <div ref={chartContainerRef} className="chart-canvas">
          <div className="chart-placeholder-mock">
            <div className="mock-chart-header">
              <div className="mock-price-info">
                <div className="mock-price">${pattern.entry.toLocaleString()}</div>
                <div className="mock-change">+2.34%</div>
              </div>
            </div>

            <div className="mock-chart-area">
              <div className="mock-candlesticks">
                {/* Simplified candlestick visualization */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`mock-candle ${Math.random() > 0.5 ? 'green' : 'red'}`}
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      bottom: `${Math.random() * 20}%`
                    }}
                  />
                ))}
              </div>

              {/* Pattern overlays */}
              <div className="pattern-overlays">
                <div className="pattern-line entry-line">
                  <span className="line-label">Entry: ${pattern.entry.toLocaleString()}</span>
                </div>
                <div className="pattern-line stop-loss-line">
                  <span className="line-label">Stop Loss: ${pattern.stopLoss.toLocaleString()}</span>
                </div>
                <div className="pattern-line take-profit-line">
                  <span className="line-label">Take Profit: ${pattern.takeProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="chart-integration-notice">
              <p>📊 Chart Integration: Install <code>lightweight-charts</code> library</p>
              <p className="text-xs">npm install lightweight-charts</p>
            </div>
          </div>
        </div>

        {/* Volume Bar (placeholder) */}
        <div className="volume-bar">
          <div className="volume-label">Volume</div>
          <div className="volume-chart">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`volume-bar-item ${Math.random() > 0.5 ? 'vol-green' : 'vol-red'}`}
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
