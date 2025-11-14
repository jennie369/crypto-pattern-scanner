import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Star, Gem } from 'lucide-react';
import './CoinSelectorDropdown.css';

/**
 * Compact Coin Selector Dropdown Component
 * Replaces the long checkbox list with a searchable dropdown
 *
 * @param {Array} selected - Currently selected coins
 * @param {Function} onChange - Callback when selection changes
 * @param {Number} maxCoins - Maximum coins allowed (from tier)
 * @param {String} tier - User's current tier (FREE, TIER1, TIER2, TIER3)
 */
export const CoinSelectorDropdown = ({ selected = [], onChange, maxCoins = 2, tier = 'FREE' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCoins, setAllCoins] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch coins from Binance API
  useEffect(() => {
    fetchCoins();
    loadFavorites();
  }, []);

  const fetchCoins = async () => {
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
      const data = await response.json();

      const usdtPairs = data
        .filter(item => item.symbol.endsWith('USDT'))
        .map(item => ({
          symbol: item.symbol.replace('USDT', ''),
          fullSymbol: item.symbol,
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 100);

      setAllCoins(usdtPairs);
    } catch (error) {
      console.error('Error fetching coins:', error);
      // Fallback to mock data
      setAllCoins([
        { symbol: 'BTC', fullSymbol: 'BTCUSDT', price: 102123.6, change: 2.5 },
        { symbol: 'ETH', fullSymbol: 'ETHUSDT', price: 3422.1, change: 1.8 },
        { symbol: 'BNB', fullSymbol: 'BNBUSDT', price: 957.5, change: -0.5 },
      ]);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('gem_favorite_coins');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    localStorage.setItem('gem_favorite_coins', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  // Filter coins based on search
  const filteredCoins = allCoins.filter(coin =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleCoin = (symbol) => {
    const isCurrentlySelected = selected.includes(symbol);

    if (isCurrentlySelected) {
      // Allow unselecting
      onChange(selected.filter(s => s !== symbol));
    } else {
      // Check tier limit (TIER3 has no practical limit with 997)
      if (selected.length >= maxCoins && tier !== 'TIER3') {
        alert(`🔒 ${tier} tier is limited to ${maxCoins} coins at a time.\n\n✅ Upgrade to select more coins!`);
        return;
      }
      onChange([...selected, symbol]);
    }
  };

  const handleSelectAll = () => {
    // TIER3 can select all coins without limit
    if (tier === 'TIER3') {
      onChange(filteredCoins.map(c => c.fullSymbol || c.symbol));
      return;
    }

    // Other tiers have limits
    if (filteredCoins.length > maxCoins) {
      alert(`🔒 ${tier} tier is limited to ${maxCoins} coins.\n\nSelecting first ${maxCoins} coins only.`);
      onChange(filteredCoins.slice(0, maxCoins).map(c => c.fullSymbol || c.symbol));
    } else {
      onChange(filteredCoins.map(c => c.fullSymbol || c.symbol));
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="coin-selector-dropdown" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          <span className="selected-coin">
            {selected.length > 0 ? `${selected[0]}/USDT` : 'Select Coins'}
          </span>
          {selected.length > 1 && (
            <span className="count-badge">+{selected.length - 1} more</span>
          )}
          {tier === 'TIER3' && selected.length > 2 && (
            <span className="tier-badge-inline">
              <Gem size={14} />
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {/* Selection Info */}
      <div className="selection-info">
        <span className="coin-count">
          {selected.length}/{tier === 'TIER3' ? '997+' : maxCoins} coins
        </span>
        <span className={`tier-badge tier-${tier.toLowerCase()}`}>{tier}</span>
      </div>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="dropdown-modal">
          {/* Search Bar */}
          <div className="dropdown-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Coin List */}
          <div className="coin-list-scrollable">
            {filteredCoins.map((coin) => {
              const isSelected = selected.includes(coin.fullSymbol || coin.symbol);
              const isFavorite = favorites.includes(coin.fullSymbol || coin.symbol);
              return (
                <div
                  key={coin.symbol}
                  className={`coin-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleCoin(coin.fullSymbol || coin.symbol)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="coin-symbol">{coin.symbol}/USDT</span>
                  <span className="coin-price">${coin.price >= 1 ? coin.price.toFixed(2) : coin.price.toFixed(6)}</span>
                  <span className={`coin-change ${getChangeColor(coin.change)}`}>
                    {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
                  </span>
                  <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(coin.fullSymbol || coin.symbol, e)}
                  >
                    <Star size={14} fill={isFavorite ? '#FFBD59' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="dropdown-footer">
            <button className="footer-btn" onClick={handleSelectAll}>
              Select All
            </button>
            <button className="footer-btn" onClick={handleClearAll}>
              Clear All
            </button>
            {tier === 'TIER3' && (
              <div className="tier-badge-footer">
                TIER3
                <span className="unlimited-badge">997+ coins</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinSelectorDropdown;
