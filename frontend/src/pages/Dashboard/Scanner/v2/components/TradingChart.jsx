import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import './TradingChart.css';

/**
 * Trading Chart Component
 * Integration with TradingView Lightweight Charts
 */
export const TradingChart = ({ pattern }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  // Generate mock candlestick data
  const generateMockData = (basePrice) => {
    const data = [];
    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);

    for (let i = 100; i >= 0; i--) {
      const change = (Math.random() - 0.5) * (basePrice * 0.02);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);

      data.push({
        time: now - (i * 3600),
        open,
        high,
        low,
        close,
      });

      currentPrice = close;
    }

    return data;
  };

  // Generate mock volume data
  const generateMockVolumeData = (candleData) => {
    return candleData.map(candle => ({
      time: candle.time,
      value: Math.random() * 1000000 + 500000,
      color: candle.close >= candle.open ? 'rgba(0, 255, 136, 0.5)' : 'rgba(246, 70, 93, 0.5)',
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current || !pattern) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: {
        background: { color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00FF88',
      downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#00FF88',
      wickDownColor: '#F6465D',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // Set mock data
    const mockCandleData = generateMockData(pattern.entry);
    const mockVolumeData = generateMockVolumeData(mockCandleData);

    candlestickSeries.setData(mockCandleData);
    volumeSeries.setData(mockVolumeData);

    // Add pattern overlay lines
    const entryLine = candlestickSeries.createPriceLine({
      price: pattern.entry,
      color: '#00D9FF',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Entry',
    });

    const stopLossLine = candlestickSeries.createPriceLine({
      price: pattern.stopLoss,
      color: '#F6465D',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Stop Loss',
    });

    const takeProfitLine = candlestickSeries.createPriceLine({
      price: pattern.takeProfit,
      color: '#00FF88',
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Take Profit',
    });

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
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

      {/* Chart Area - TradingView Lightweight Charts */}
      <div className="chart-card">
        <div ref={chartContainerRef} className="chart-canvas" />
      </div>
    </div>
  );
};

export default TradingChart;
