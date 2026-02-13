import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './TradingChart.css';

/**
 * Simplified TradingChart - Testing basic chart rendering
 */
export default function TradingChart({ symbol = 'BTCUSDT' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 600,
        layout: {
          background: { color: '#112250' },
          textColor: '#FFFFFF',
        },
      });

      // Add candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#0ECB81',
        downColor: '#F6465D',
      });

      // Simple mock data
      const mockData = [
        { time: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
        { time: '2024-01-02', open: 105, high: 115, low: 100, close: 110 },
        { time: '2024-01-03', open: 110, high: 120, low: 105, close: 115 },
      ];

      candleSeries.setData(mockData);
      chartRef.current = chart;
      setLoading(false);

      // Cleanup
      return () => {
        chart.remove();
      };
    } catch (error) {
      console.error('Chart error:', error);
      setLoading(false);
    }
  }, []);

  return (
    <div className="trading-chart-container">
      {loading && (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading chart...</p>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="chart"
        style={{ visibility: loading ? 'hidden' : 'visible' }}
      />
    </div>
  );
}
