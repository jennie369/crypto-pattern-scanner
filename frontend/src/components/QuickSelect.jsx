import React from 'react';
import { Zap, Circle } from 'lucide-react';
import './QuickSelect.css';

const QUICK_SELECT_COINS = [
  { symbol: 'BTCUSDT', label: 'BTC', icon: '₿', free: true },
  { symbol: 'ETHUSDT', label: 'ETH', icon: 'Ξ', free: false },
  { symbol: 'BNBUSDT', label: 'BNB', icon: '●', free: false },
  { symbol: 'SOLUSDT', label: 'SOL', icon: '◎', free: false },
  { symbol: 'XRPUSDT', label: 'XRP', icon: '✕', free: false },
  { symbol: 'ADAUSDT', label: 'ADA', icon: '₳', free: false },
  { symbol: 'DOGEUSDT', label: 'DOGE', icon: 'Ð', free: false },
  { symbol: 'AVAXUSDT', label: 'AVAX', icon: '▲', free: false },
  { symbol: 'MATICUSDT', label: 'MATIC', icon: '⬡', free: false },
];

function QuickSelect({ selectedCoin, onSelectCoin, patterns }) {
  // Check which coins have patterns
  const hasPattern = (symbol) => {
    if (!patterns) return false;
    return patterns.hasOwnProperty(symbol);
  };

  const handleSelect = (symbol) => {
    if (hasPattern(symbol) && onSelectCoin) {
      onSelectCoin(symbol);
    }
  };

  return (
    <div className="quick-select">
      <div className="quick-select-header">
        <h4 className="quick-select-title"><Zap className="w-4 h-4 inline mr-1" /> Quick Select</h4>
        <span className="quick-select-subtitle">Coins with patterns detected</span>
      </div>

      <div className="quick-select-grid">
        {QUICK_SELECT_COINS.map((coin) => {
          const coinHasPattern = hasPattern(coin.symbol);
          const isActive = selectedCoin === coin.symbol;

          return (
            <button
              key={coin.symbol}
              className={`quick-select-btn ${isActive ? 'active' : ''} ${
                !coinHasPattern ? 'no-pattern' : ''
              }`}
              onClick={() => handleSelect(coin.symbol)}
              disabled={!coinHasPattern}
              title={
                coinHasPattern
                  ? `${coin.label} - Pattern detected`
                  : `${coin.label} - No pattern`
              }
            >
              <span className="coin-icon">{coin.icon}</span>
              <span className="coin-label">{coin.label}</span>
              {coin.free && <span className="free-badge">FREE</span>}
              {coinHasPattern && <span className="pattern-indicator"><Circle className="w-2 h-2 fill-current" /></span>}
            </button>
          );
        })}
      </div>

      <div className="quick-select-legend">
        <span className="legend-item">
          <span className="legend-dot active-dot"><Circle className="w-2 h-2 fill-current" /></span> Pattern Found
        </span>
        <span className="legend-item">
          <span className="legend-dot inactive-dot"><Circle className="w-2 h-2 fill-current" /></span> No Pattern
        </span>
      </div>
    </div>
  );
}

export default QuickSelect;
