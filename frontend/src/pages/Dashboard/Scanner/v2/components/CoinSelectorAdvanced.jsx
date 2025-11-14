import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react';
import {
  fetchBinanceCoins,
  getCoinsForTier,
  fetchCoinPrices,
  searchCoins,
  sortCoins,
  filterByCategory,
  TIER_LIMITS,
} from '../../../../../services/coinService';
import './CoinSelectorAdvanced.css';

/**
 * 💎 COIN SELECTOR ADVANCED
 * Full Binance integration with 3-tier access system
 * Features: Search, Filters, Categories, Favorites, Real-time prices
 */
export const CoinSelectorAdvanced = ({ selectedCoin, onSelectCoin, userTier = 'FREE' }) => {
  // State
  const [allCoins, setAllCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [priceData, setPriceData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('gem_coin_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch coins on mount
  useEffect(() => {
    loadCoins();
  }, []);

  // Fetch prices every 30 seconds
  useEffect(() => {
    if (displayedCoins.length > 0) {
      loadPrices();
      const interval = setInterval(loadPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [displayedCoins]);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [allCoins, searchQuery, activeCategory, sortBy, favorites]);

  const loadCoins = async () => {
    setLoading(true);
    try {
      const coins = await fetchBinanceCoins();
      const tierCoins = getCoinsForTier(userTier, coins);
      setAllCoins(tierCoins);
    } catch (error) {
      console.error('Failed to load coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    const symbols = displayedCoins.map(coin => coin.symbol);
    const prices = await fetchCoinPrices(symbols);
    setPriceData(prices);
  };

  const applyFiltersAndSort = () => {
    let result = [...allCoins];

    // Apply search
    if (searchQuery) {
      result = searchCoins(result, searchQuery);
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      result = filterByCategory(result, activeCategory);
    }

    // Apply favorites filter
    if (sortBy === 'favorites') {
      result = result.filter(coin => favorites.includes(coin.symbol));
    }

    // Apply sort
    result = sortCoins(result, priceData, sortBy);

    setDisplayedCoins(result);
  };

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(fav => fav !== symbol)
      : [...favorites, symbol];
    setFavorites(newFavorites);
    localStorage.setItem('gem_coin_favorites', JSON.stringify(newFavorites));
  };

  const handleCoinSelect = (coin) => {
    onSelectCoin(coin.symbol);
    setIsOpen(false);
  };

  const handleRefresh = async () => {
    await loadCoins();
    await loadPrices();
  };

  const getTierInfo = () => {
    const limit = TIER_LIMITS[userTier];
    const total = allCoins.length;
    return {
      limit: limit === Infinity ? 'Unlimited' : limit,
      total,
      tierName: userTier,
    };
  };

  const tierInfo = getTierInfo();

  const categories = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'defi', name: 'DeFi', icon: '💰' },
    { id: 'layer1', name: 'Layer 1', icon: '⛓️' },
    { id: 'layer2', name: 'Layer 2', icon: '🔗' },
    { id: 'meme', name: 'Meme', icon: '🐶' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'ai', name: 'AI', icon: '🤖' },
  ];

  return (
    <div className="coin-selector-advanced">
      {/* Trigger Button */}
      <button
        className="coin-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="trigger-label">Coin:</span>
        <span className="trigger-coin">{selectedCoin || 'Select'}</span>
        {priceData[selectedCoin] && (
          <span className={`trigger-change ${priceData[selectedCoin].change24h >= 0 ? 'positive' : 'negative'}`}>
            {priceData[selectedCoin].change24h >= 0 ? '+' : ''}
            {priceData[selectedCoin].change24h.toFixed(2)}%
          </span>
        )}
        <span className="trigger-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Panel */}
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

            {/* Panel */}
            <motion.div
              className="coin-selector-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="panel-header">
                <div className="header-left">
                  <h3>Select Coin</h3>
                  <div className="tier-badge">
                    <span className={`tier-label tier-${userTier.toLowerCase()}`}>
                      {tierInfo.tierName}
                    </span>
                    <span className="tier-count">
                      {tierInfo.total} / {tierInfo.limit} coins
                    </span>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="icon-btn" onClick={handleRefresh} title="Refresh">
                    <RefreshCw size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => setIsOpen(false)} title="Close">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="panel-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search coins... (BTC, ETH, SOL)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="panel-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Sort Controls */}
              <div className="panel-controls">
                <div className="control-label">Sort by:</div>
                <div className="sort-buttons">
                  <button
                    className={`sort-btn ${sortBy === 'volume' ? 'active' : ''}`}
                    onClick={() => setSortBy('volume')}
                  >
                    📊 Volume
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'gainers' ? 'active' : ''}`}
                    onClick={() => setSortBy('gainers')}
                  >
                    <TrendingUp size={14} /> Gainers
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'losers' ? 'active' : ''}`}
                    onClick={() => setSortBy('losers')}
                  >
                    <TrendingDown size={14} /> Losers
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'favorites' ? 'active' : ''}`}
                    onClick={() => setSortBy('favorites')}
                  >
                    <Star size={14} /> Favorites
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'alphabetical' ? 'active' : ''}`}
                    onClick={() => setSortBy('alphabetical')}
                  >
                    A-Z
                  </button>
                </div>
              </div>

              {/* Coin Grid */}
              <div className="panel-coins">
                {loading ? (
                  <div className="loading-state">
                    <RefreshCw className="loading-spinner" size={32} />
                    <p>Loading coins from Binance...</p>
                  </div>
                ) : displayedCoins.length === 0 ? (
                  <div className="empty-state">
                    <p>No coins found</p>
                    <small>Try adjusting your filters</small>
                  </div>
                ) : (
                  <div className="coins-grid">
                    {displayedCoins.map((coin, index) => {
                      const price = priceData[coin.symbol];
                      const isFavorite = favorites.includes(coin.symbol);
                      const isSelected = selectedCoin === coin.symbol;

                      return (
                        <motion.div
                          key={coin.symbol}
                          className={`coin-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleCoinSelect(coin)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Favorite Star */}
                          <button
                            className={`favorite-star ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => toggleFavorite(coin.symbol, e)}
                          >
                            <Star size={14} fill={isFavorite ? '#FFBD59' : 'none'} />
                          </button>

                          {/* Coin Info */}
                          <div className="coin-info">
                            <div className="coin-symbol">{coin.symbol}</div>
                            <div className="coin-name">{coin.baseAsset}</div>
                          </div>

                          {/* Price Info */}
                          {price ? (
                            <div className="coin-price-info">
                              <div className="coin-price">
                                ${price.price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: price.price < 1 ? 6 : 2,
                                })}
                              </div>
                              <div className={`coin-change ${price.change24h >= 0 ? 'positive' : 'negative'}`}>
                                {price.change24h >= 0 ? '+' : ''}
                                {price.change24h.toFixed(2)}%
                              </div>
                            </div>
                          ) : (
                            <div className="coin-price-loading">Loading...</div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="panel-footer">
                <div className="footer-info">
                  Showing {displayedCoins.length} of {allCoins.length} coins
                </div>
                {userTier === 'FREE' && (
                  <div className="upgrade-hint">
                    💎 Upgrade to <strong>TIER 2</strong> for 100 coins or <strong>TIER 3</strong> for 300+ coins
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinSelectorAdvanced;
