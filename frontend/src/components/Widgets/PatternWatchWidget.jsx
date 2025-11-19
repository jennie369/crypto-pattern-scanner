import React, { useState, useEffect } from 'react';
import './Widget.css';

export const PatternWatchWidget = ({ data, size = 'medium' }) => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPriceData();

    // Update every 60 seconds
    const interval = setInterval(fetchPriceData, 60000);

    return () => clearInterval(interval);
  }, [data.coin]);

  const fetchPriceData = async () => {
    try {
      // Fetch current price
      const priceResponse = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${data.coin}USDT`
      );
      const priceData = await priceResponse.json();

      // Fetch 24h stats
      const statsResponse = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${data.coin}USDT`
      );
      const statsData = await statsResponse.json();

      if (priceData.price && statsData.priceChangePercent) {
        setCurrentPrice(parseFloat(priceData.price));
        setPriceChange24h(parseFloat(statsData.priceChangePercent));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch pattern watch data:', error);
      setIsLoading(false);
    }
  };

  const getPatternIcon = (pattern) => {
    const icons = {
      'Head & Shoulders': '📊',
      'Double Top': '⏫',
      'Double Bottom': '⏬',
      'Triangle': '🔺',
      'Flag': '🚩',
      'Wedge': '📐',
      'Cup & Handle': '☕'
    };
    return icons[pattern] || '📈';
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`widget pattern-watch-widget ${size}`}>
      <div className="widget-header">
        <span className="widget-icon">{getPatternIcon(data.pattern)}</span>
        <h4>Pattern Watch</h4>
        <span className="widget-status">Active</span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            Loading data...
          </div>
        ) : (
          <>
            <div className="pattern-info">
              <div className="pattern-row">
                <span className="label">Coin:</span>
                <span className="value">{data.coin}</span>
              </div>

              <div className="pattern-row">
                <span className="label">Pattern:</span>
                <span className="value">{data.pattern}</span>
              </div>

              <div className="pattern-row">
                <span className="label">Timeframe:</span>
                <span className="value">{data.timeframe}</span>
              </div>

              <div className="pattern-row">
                <span className="label">Current Price:</span>
                <span className="value">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="pattern-row">
                <span className="label">24h Change:</span>
                <span className={`value ${priceChange24h >= 0 ? 'positive' : 'negative'}`} style={{
                  color: priceChange24h >= 0 ? '#00ff88' : '#ff4466'
                }}>
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  Confidence
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00D9FF' }}>
                  {data.confidence}%
                </span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${data.confidence}%` }}
                />
              </div>
            </div>

            {data.detectedAt && (
              <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center'
              }}>
                Detected: {formatTimestamp(data.detectedAt)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
