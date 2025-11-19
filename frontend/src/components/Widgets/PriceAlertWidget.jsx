import React, { useState, useEffect } from 'react';
import './Widget.css';

export const PriceAlertWidget = ({ data, size = 'medium' }) => {
  const [currentPrice, setCurrentPrice] = useState(data.currentPrice || 0);
  const [priceChange, setPriceChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [alertTriggered, setAlertTriggered] = useState(false);

  useEffect(() => {
    // Fetch initial price
    fetchPrice();

    // Poll price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, [data.coin]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${data.coin}USDT`
      );
      const result = await response.json();

      if (result.price) {
        const newPrice = parseFloat(result.price);

        // Calculate price change
        if (currentPrice > 0) {
          const change = ((newPrice - currentPrice) / currentPrice) * 100;
          setPriceChange(change);
        }

        setCurrentPrice(newPrice);
        setIsLoading(false);

        // Check alert condition
        checkAlert(newPrice);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      setIsLoading(false);
    }
  };

  const checkAlert = (price) => {
    if (alertTriggered) return;

    const shouldAlert =
      (data.condition === 'above' && price >= data.targetPrice) ||
      (data.condition === 'below' && price <= data.targetPrice);

    if (shouldAlert) {
      setAlertTriggered(true);

      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 GEM Price Alert', {
          body: `${data.coin} đã ${data.condition === 'above' ? 'vượt' : 'giảm xuống'} $${data.targetPrice.toLocaleString()}`,
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    }
  };

  const progress = data.condition === 'above'
    ? Math.min((currentPrice / data.targetPrice) * 100, 100)
    : Math.max(100 - (currentPrice / data.targetPrice) * 100, 0);

  return (
    <div className={`widget price-alert-widget ${size}`}>
      <div className="widget-header">
        <span className="widget-icon">💰</span>
        <h4>{data.coin} Price Alert</h4>
        {alertTriggered && (
          <span className="widget-status">🔔 Triggered</span>
        )}
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            Loading price...
          </div>
        ) : (
          <>
            <div className="current-price">
              <span className="label">Current:</span>
              <span className="value">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {priceChange !== 0 && (
                <span className={`change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                </span>
              )}
            </div>

            <div className="target-price">
              <span className="label">Target:</span>
              <span className="value">${data.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="condition">{data.condition}</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center'
            }}>
              Updates every 30 seconds
            </div>
          </>
        )}
      </div>
    </div>
  );
};
