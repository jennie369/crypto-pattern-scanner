import React, { useEffect, useRef } from 'react';
import './TradingViewWidget.css';

/**
 * TradingViewWidget Component
 *
 * Reusable TradingView chart widget component
 *
 * Props:
 * - symbol: Trading pair (e.g., "BTCUSDT")
 * - interval: Timeframe (e.g., "15", "60", "240", "D")
 * - containerId: Unique ID for the chart container
 * - height: Chart height (default: 500px)
 * - showStudies: Whether to show technical indicators
 * - studies: Array of study names to display
 * - onChartReady: Callback when chart is loaded
 */
export default function TradingViewWidget({
  symbol = 'BTCUSDT',
  interval = '60',
  containerId,
  height = 500,
  showStudies = true,
  studies = ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
  onChartReady = null
}) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Wait for TradingView script to load
    if (!window.TradingView) {
      console.warn('TradingView library not loaded yet');
      return;
    }

    // Clean up existing widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create new widget
    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: interval,
        timezone: 'Asia/Ho_Chi_Minh',
        theme: 'dark',
        style: '1', // Candles
        locale: 'en',
        toolbar_bg: '#1a1a2e',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        hide_side_toolbar: false,
        save_image: true,
        container_id: containerId,
        studies: showStudies ? studies : [],
        // Additional settings
        backgroundColor: '#1a1a2e',
        gridColor: 'rgba(255, 255, 255, 0.05)',
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: false,
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650'
      });

      // Callback when chart is ready
      if (onChartReady && widgetRef.current) {
        widgetRef.current.onChartReady(() => {
          onChartReady(widgetRef.current);
        });
      }

    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }

    // Cleanup on unmount
    return () => {
      if (widgetRef.current && widgetRef.current.remove) {
        widgetRef.current.remove();
      }
    };

  }, [symbol, interval, containerId, showStudies, studies]);

  return (
    <div className="tradingview-widget-wrapper" style={{ height: `${height}px` }}>
      <div
        ref={containerRef}
        id={containerId}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
