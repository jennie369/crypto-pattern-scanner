import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Star, Gem, Lock, CheckCircle } from 'lucide-react';
import './CoinSelectorDropdown.css';

/**
 * Compact Coin Selector Dropdown Component
 * Replaces the long checkbox list with a searchable dropdown
 *
 * @param {Array} selected - Currently selected coins
 * @param {Function} onChange - Callback when selection changes
 * @param {Number} maxCoins - Maximum coins allowed (from tier)
 * @param {String} tier - User's current tier (FREE, TIER1, TIER2, TIER3)
 * @param {Function} onFavoritesChange - Callback when favorites change (for scan result sorting)
 */
export const CoinSelectorDropdown = ({ selected = [], onChange, maxCoins = 2, tier = 'FREE', onFavoritesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCoins, setAllCoins] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch coins from Binance API
  useEffect(() => {
    const controller = new AbortController();
    fetchCoins(controller.signal);
    loadFavorites();
    return () => controller.abort();
  }, []);

  const fetchCoins = async (signal) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
        signal: signal || controller.signal,
      });
      const data = await response.json();

      // FIX: Get ALL USDT pairs (500+), not just 100
      const usdtPairs = data
        .filter(item => item.symbol.endsWith('USDT'))
        .map(item => ({
          symbol: item.symbol.replace('USDT', ''),
          fullSymbol: item.symbol,
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      // REMOVED: .slice(0, 100) - Now shows ALL coins

      setAllCoins(usdtPairs);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching coins:', error);
      // Fallback to mock data
      setAllCoins([
        { symbol: 'BTC', fullSymbol: 'BTCUSDT', price: 102123.6, change: 2.5 },
        { symbol: 'ETH', fullSymbol: 'ETHUSDT', price: 3422.1, change: 1.8 },
        { symbol: 'BNB', fullSymbol: 'BNBUSDT', price: 957.5, change: -0.5 },
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('gem_favorite_coins');
    if (saved) {
      const favs = JSON.parse(saved);
      setFavorites(favs);
      // Notify parent about favorites for scan result sorting
      if (onFavoritesChange) onFavoritesChange(favs);
    }
  };

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    localStorage.setItem('gem_favorite_coins', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    // Notify parent about favorites change
    if (onFavoritesChange) onFavoritesChange(newFavorites);
  };

  // Filter coins based on search AND sort favorites to top
  const filteredCoins = allCoins
    .filter(coin => coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aFav = favorites.includes(a.fullSymbol || a.symbol);
      const bFav = favorites.includes(b.fullSymbol || b.symbol);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // Keep original order for non-favorites
    });

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
        const lockIcon = '🔓';
        const checkIcon = '✓';
        alert(`${lockIcon} ${tier} tier is limited to ${maxCoins} coins at a time.\n\n${checkIcon} Upgrade to select more coins!`);
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
      const lockIcon = '🔓';
      alert(`${lockIcon} ${tier} tier is limited to ${maxCoins} coins.\n\nSelecting first ${maxCoins} coins only.`);
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

          {/* ACTION BUTTONS - MOVED TO TOP */}
          <div className="dropdown-actions-top">
            <button className="action-btn-top" onClick={handleSelectAll}>
              <CheckCircle size={12} />
              Select All
            </button>
            <button className="action-btn-top" onClick={handleClearAll}>
              <X size={12} />
              Clear
            </button>
            {tier === 'TIER3' && (
              <div className="tier-badge-top">
                <Gem size={10} />
                {allCoins.length}+ coins
              </div>
            )}
            <span className="coin-total-count">{allCoins.length} coins</span>
          </div>

          {/* Coin List */}
          <div className="coin-list-scrollable">
            {filteredCoins.map((coin) => {
              const isSelected = selected.includes(coin.fullSymbol || coin.symbol);
              const isFavorite = favorites.includes(coin.fullSymbol || coin.symbol);
              return (
                <div
                  key={coin.symbol}
                  className={`coin-item ${isSelected ? 'selected' : ''} ${isFavorite ? 'favorite' : ''}`}
                  onClick={() => toggleCoin(coin.fullSymbol || coin.symbol)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by onClick
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(coin.fullSymbol || coin.symbol, e)}
                  >
                    <Star size={12} fill={isFavorite ? '#FFBD59' : 'none'} />
                  </button>
                  <span className="coin-symbol">{coin.symbol}/USDT</span>
                  <span className="coin-price">${coin.price >= 1 ? coin.price.toFixed(2) : coin.price.toFixed(6)}</span>
                  <span className={`coin-change ${getChangeColor(coin.change)}`}>
                    {coin.change > 0 ? '+' : ''}{coin.change.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer - Simplified */}
          <div className="dropdown-footer">
            <span className="selected-count">{selected.length} selected</span>
            {tier === 'TIER3' && (
              <span className="tier-info">TIER3 Unlimited</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinSelectorDropdown;
