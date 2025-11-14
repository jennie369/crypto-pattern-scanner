import React, { useState, useEffect } from 'react';
import './ChartHeader.css';

const TIMEFRAMES = [
  { value: '1m', label: '1min' },
  { value: '3m', label: '3min' },
  { value: '5m', label: '5min' },
  { value: '15m', label: '15min' },
  { value: '30m', label: '30min' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '6h', label: '6h' },
  { value: '1d', label: '1d' },
  { value: '3d', label: '3d' },
  { value: '1w', label: '1w' },
  { value: '1M', label: '1M' },
];

function ChartHeader({ selectedCoin, currentPrice, priceChange, onTimeframeChange, onDirectionChange }) {
  const [timeframe, setTimeframe] = useState('15m');
  const [direction, setDirection] = useState('market'); // 'market', 'short', 'long'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  const handleDirectionChange = (dir) => {
    setDirection(dir);
    if (onDirectionChange) {
      onDirectionChange(dir);
    }
  };

  const toggleFullscreen = () => {
    const chartElement = document.getElementById('main-chart-container');
    if (chartElement) {
      if (!document.fullscreenElement) {
        chartElement.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTime = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="chart-header">
      {/* Coin Info Row */}
      <div className="coin-info-row">
        <div className="coin-name">
          <span className="coin-icon">🪙</span>
          <span className="coin-symbol">{selectedCoin || 'BTCUSDT'}</span>
          <span className="coin-type">Perpetual</span>
        </div>

        <div className="coin-price">
          <span className="price-value">{formatPrice(currentPrice)}</span>
          <span className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange || 0).toFixed(2)}%
          </span>
        </div>

        <div className="coin-time">
          <span className="time-icon">📅</span>
          <span className="time-text">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="timeframe-buttons">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            className={`timeframe-btn ${timeframe === tf.value ? 'active' : ''}`}
            onClick={() => handleTimeframeChange(tf.value)}
          >
            {tf.label}
          </button>
        ))}

        <button
          className="fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          🔍 {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* Direction Selector */}
      <div className="direction-selector">
        <button
          className={`direction-btn ${direction === 'market' ? 'active' : ''}`}
          onClick={() => handleDirectionChange('market')}
        >
          Market
        </button>
        <button
          className={`direction-btn short ${direction === 'short' ? 'active' : ''}`}
          onClick={() => handleDirectionChange('short')}
        >
          SHORT 🔴
        </button>
        <button
          className={`direction-btn long ${direction === 'long' ? 'active' : ''}`}
          onClick={() => handleDirectionChange('long')}
        >
          LONG 🟢
        </button>
      </div>
    </div>
  );
}

export default ChartHeader;
