import React, { useState, useEffect } from 'react';
import './MarketChatbotSection.css';

/**
 * Markets List Component
 * Shows top crypto markets with prices and 24h changes
 */
export const MarketsList = ({ onSelectCoin }) => {
  const [markets, setMarkets] = useState([]);

  // TODO: Replace with real Binance API
  useEffect(() => {
    const mockMarkets = [
      { symbol: 'BTC', name: 'Bitcoin', price: 102123.6, change: 2.5, volume: 45000000000 },
      { symbol: 'ETH', name: 'Ethereum', price: 3422.1, change: 1.8, volume: 25000000000 },
      { symbol: 'BNB', name: 'BNB', price: 957.5, change: -0.5, volume: 2500000000 },
      { symbol: 'SOL', name: 'Solana', price: 520.4, change: 5.2, volume: 3500000000 },
      { symbol: 'ADA', name: 'Cardano', price: 0.5, change: -1.2, volume: 850000000 },
    ];

    setMarkets(mockMarkets);
  }, []);

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const handleMarketClick = (market) => {
    onSelectCoin && onSelectCoin(`${market.symbol}USDT`);
  };

  return (
    <div className="markets-list">
      <div className="markets-header">
        <span>Symbol</span>
        <span>Price</span>
        <span>24h Change</span>
        <span>Volume</span>
      </div>

      {markets.map((market) => (
        <div
          key={market.symbol}
          className="market-row"
          onClick={() => handleMarketClick(market)}
        >
          <div className="market-symbol">
            <span className="symbol-text">{market.symbol}/USDT</span>
          </div>

          <div className="market-price">
            ${market.price.toLocaleString()}
          </div>

          <div className={`market-change ${market.change >= 0 ? 'positive' : 'negative'}`}>
            {market.change >= 0 ? '+' : ''}{market.change}%
          </div>

          <div className="market-volume">
            {formatVolume(market.volume)}
          </div>
        </div>
      ))}

      <button className="view-all-btn">
        View All Markets →
      </button>
    </div>
  );
};

export default MarketsList;
