import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Star, X, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CoinSelectorCompact.css';

const CoinSelectorCompact = ({ selectedCoins = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('volume');
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Load coins on mount
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
          symbol: item.symbol,
          baseAsset: item.symbol.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
          volume: parseFloat(item.quoteVolume),
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 100); // Top 100

      setCoins(usdtPairs);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('gem_favorite_coins');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const toggleFavorite = (symbol) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    localStorage.setItem('gem_favorite_coins', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleCoin = (symbol) => {
    if (selectedCoins.includes(symbol)) {
      onChange(selectedCoins.filter(s => s !== symbol));
    } else {
      onChange([...selectedCoins, symbol]);
    }
  };

  const filteredCoins = coins
    .filter(coin => {
      if (searchTerm && !coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter === 'favorites' && !favorites.includes(coin.symbol)) {
        return false;
      }
      if (filter === 'gainers' && coin.change < 0) return false;
      if (filter === 'losers' && coin.change > 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume;
      if (sortBy === 'change') return Math.abs(b.change) - Math.abs(a.change);
      if (sortBy === 'alphabetical') return a.symbol.localeCompare(b.symbol);
      return 0;
    });

  const handleSelectAll = () => {
    const symbols = filteredCoins.map(c => c.symbol);
    onChange(symbols);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Render modal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="coin-selector-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="coin-selector-modal-compact"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="header-title">
                <h3>Select Coins to Scan</h3>
                <span className="coin-count">{filteredCoins.length} coins</span>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Controls */}
            <div className="modal-controls">
              {/* Search */}
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search coin... (BTC, ETH, SOL)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="filter-row">
                <div className="filter-buttons">
                  <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={filter === 'favorites' ? 'active' : ''}
                    onClick={() => setFilter('favorites')}
                  >
                    <Star size={14} />
                    Favorites
                  </button>
                  <button
                    className={filter === 'gainers' ? 'active' : ''}
                    onClick={() => setFilter('gainers')}
                  >
                    <TrendingUp size={14} />
                    Gainers
                  </button>
                  <button
                    className={filter === 'losers' ? 'active' : ''}
                    onClick={() => setFilter('losers')}
                  >
                    <TrendingDown size={14} />
                    Losers
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="volume">Volume</option>
                  <option value="change">Change</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>

            {/* Coin List - COMPACT! */}
            <div className="coin-list-container">
              <div className="coin-list-compact">
                {filteredCoins.map((coin) => {
                  const isSelected = selectedCoins.includes(coin.symbol);
                  const isFavorite = favorites.includes(coin.symbol);

                  return (
                    <div
                      key={coin.symbol}
                      className={`coin-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleCoin(coin.symbol)}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="coin-checkbox"
                      />

                      {/* Symbol */}
                      <div className="coin-symbol">
                        <span className="symbol-base">{coin.baseAsset}</span>
                        <span className="symbol-quote">/USDT</span>
                      </div>

                      {/* Price */}
                      <div className="coin-price">
                        ${coin.price >= 1 ? coin.price.toLocaleString(undefined, {maximumFractionDigits: 2}) : coin.price.toFixed(6)}
                      </div>

                      {/* Change */}
                      <div className={`coin-change ${coin.change >= 0 ? 'positive' : 'negative'}`}>
                        {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                      </div>

                      {/* Volume */}
                      <div className="coin-volume">
                        ${(coin.volume / 1000000).toFixed(1)}M
                      </div>

                      {/* Favorite */}
                      <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(coin.symbol);
                        }}
                      >
                        <Star size={14} fill={isFavorite ? '#FFBD59' : 'none'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <div className="footer-info">
                <span className="selected-count">
                  Selected: {selectedCoins.length} coins
                </span>
              </div>

              <div className="footer-actions">
                <button className="btn-secondary" onClick={handleClearAll}>
                  Clear All
                </button>
                <button className="btn-secondary" onClick={handleSelectAll}>
                  Select All
                </button>
                <button className="btn-primary" onClick={() => setIsOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger Button */}
      <div className="coin-selector-trigger" onClick={() => setIsOpen(true)}>
        <div className="trigger-content">
          <span className="trigger-label">
            {selectedCoins.length === 0
              ? 'Select coins to scan'
              : selectedCoins.length === 1
              ? selectedCoins[0].replace('USDT', '')
              : `${selectedCoins[0].replace('USDT', '')} +${selectedCoins.length - 1}`
            }
          </span>
          <span className="trigger-count">{selectedCoins.length} selected</span>
        </div>
        <ChevronDown size={16} />
      </div>

      {/* Portal Modal - Renders to document.body! */}
      {createPortal(modalContent, document.body)}
    </>
  );
};

export default CoinSelectorCompact;
