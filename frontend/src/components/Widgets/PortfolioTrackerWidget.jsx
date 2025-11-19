import React, { useState, useEffect } from 'react';
import './Widget.css';

export const PortfolioTrackerWidget = ({ data, size = 'medium' }) => {
  const [holdings, setHoldings] = useState(data.holdings || []);
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    updatePortfolio();

    // Update every 60 seconds
    const interval = setInterval(updatePortfolio, 60000);

    return () => clearInterval(interval);
  }, [data.holdings]);

  const updatePortfolio = async () => {
    try {
      const updatedHoldings = await Promise.all(
        data.holdings.map(async (holding) => {
          try {
            // Fetch current price
            const priceResponse = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${holding.coin}USDT`
            );
            const priceData = await priceResponse.json();

            // Fetch 24h change
            const statsResponse = await fetch(
              `https://api.binance.com/api/v3/ticker/24hr?symbol=${holding.coin}USDT`
            );
            const statsData = await statsResponse.json();

            const currentPrice = parseFloat(priceData.price);
            const value = holding.amount * currentPrice;
            const change = parseFloat(statsData.priceChangePercent);

            return {
              ...holding,
              currentPrice,
              value,
              change24h: change
            };
          } catch (error) {
            console.error(`Failed to fetch data for ${holding.coin}:`, error);
            return holding;
          }
        })
      );

      setHoldings(updatedHoldings);

      // Calculate total value
      const total = updatedHoldings.reduce((sum, h) => sum + (h.value || 0), 0);
      setTotalValue(total);

      // Calculate weighted average 24h change
      const totalChange = updatedHoldings.reduce((sum, h) => {
        const weight = (h.value || 0) / total;
        return sum + (h.change24h || 0) * weight;
      }, 0);
      setChange24h(totalChange);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to update portfolio:', error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatAmount = (amount) => {
    if (amount >= 1) {
      return amount.toFixed(4);
    }
    return amount.toFixed(6);
  };

  return (
    <div className={`widget portfolio-tracker-widget ${size}`}>
      <div className="widget-header">
        <span className="widget-icon">💼</span>
        <h4>Portfolio Tracker</h4>
        <span className="widget-status">
          {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'}
        </span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            Loading portfolio...
          </div>
        ) : (
          <>
            {/* Holdings List */}
            <div className="holdings-list">
              {holdings.slice(0, size === 'small' ? 3 : size === 'medium' ? 5 : 10).map((holding, idx) => (
                <div key={idx} className="holding-item">
                  <div className="holding-coin">
                    <span className="coin-symbol">{holding.coin}</span>
                    <span className="coin-amount">{formatAmount(holding.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className="holding-value">
                      {formatCurrency(holding.value || 0)}
                    </span>
                    {holding.change24h !== undefined && (
                      <span style={{
                        fontSize: '11px',
                        color: holding.change24h >= 0 ? '#00ff88' : '#ff4466',
                        fontWeight: '600'
                      }}>
                        {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {holdings.length > (size === 'small' ? 3 : size === 'medium' ? 5 : 10) && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '8px'
                }}>
                  +{holdings.length - (size === 'small' ? 3 : size === 'medium' ? 5 : 10)} more assets
                </div>
              )}
            </div>

            {/* Portfolio Summary */}
            <div className="portfolio-summary">
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                  Total Value
                </div>
                <div className="total-value">
                  {formatCurrency(totalValue)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                  24h Change
                </div>
                <div className={`change ${change24h >= 0 ? 'positive' : 'negative'}`} style={{
                  fontSize: '18px'
                }}>
                  {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center'
            }}>
              Updates every 60 seconds
            </div>
          </>
        )}
      </div>
    </div>
  );
};
