import React, { useState, useEffect } from 'react';
import './Widget.css';

export const DailyReadingWidget = ({ data, size = 'medium' }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    updateTimeRemaining();

    // Update every minute
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [data.validUntil]);

  const updateTimeRemaining = () => {
    if (!data.validUntil) {
      setTimeRemaining('No expiration');
      return;
    }

    const now = new Date();
    const expiry = new Date(data.validUntil);
    const diff = expiry - now;

    if (diff <= 0) {
      setIsExpired(true);
      setTimeRemaining('Expired');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      setTimeRemaining(`${days} day${days > 1 ? 's' : ''} left`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m left`);
    } else {
      setTimeRemaining(`${minutes}m left`);
    }
  };

  const getReadingIcon = () => {
    if (data.readingType === 'iching') return '☯️';
    if (data.readingType === 'tarot') return '🃏';
    return '🔮';
  };

  const getReadingTitle = () => {
    if (data.hexagram) return data.hexagram;
    if (data.card) return data.card;
    return 'Daily Reading';
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={`widget daily-reading-widget ${size} ${isExpired ? 'expired' : ''}`}>
      <div className="widget-header">
        <span className="widget-icon">{getReadingIcon()}</span>
        <h4>Daily Reading</h4>
        {!isExpired && (
          <span className="widget-status" style={{
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#8B5CF6'
          }}>
            {timeRemaining}
          </span>
        )}
        {isExpired && (
          <span className="widget-status" style={{
            background: 'rgba(255, 68, 102, 0.2)',
            color: '#ff4466'
          }}>
            Expired
          </span>
        )}
      </div>

      <div className="widget-body">
        <div className="reading-content">
          <div className="hexagram-name">
            {getReadingTitle()}
          </div>

          <div className="interpretation">
            {truncateText(data.interpretation, size === 'small' ? 100 : size === 'medium' ? 200 : 300)}
          </div>

          {data.tradingAdvice && (
            <div className="trading-advice">
              <strong>💡 Trading Insight:</strong>
              <br />
              {truncateText(data.tradingAdvice, size === 'small' ? 80 : size === 'medium' ? 150 : 250)}
            </div>
          )}

          {data.validUntil && (
            <div className="valid-until">
              {isExpired ? (
                '⏰ Reading has expired - request a new one!'
              ) : (
                `⏰ Valid until ${new Date(data.validUntil).toLocaleString('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`
              )}
            </div>
          )}
        </div>
      </div>

      {isExpired && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            color: '#ff4466',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            📅 Reading Expired
          </div>
        </div>
      )}
    </div>
  );
};
