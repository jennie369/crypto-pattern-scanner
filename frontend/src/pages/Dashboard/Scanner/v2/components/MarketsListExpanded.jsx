import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import './MarketsListExpanded.css';

/**
 * Markets List Expanded Component
 * Full-featured market data with search, filters, sorting, and favorites
 * Height: 450px (350% increase from 100px)
 */
export const MarketsListExpanded = ({ onSelectCoin, selectedCoin }) => {
  const [markets, setMarkets] = useState([]);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('gem_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Initialize market data (Expanded to 20 coins)
  useEffect(() => {
    const mockMarkets = [
      { symbol: 'BTC', name: 'Bitcoin', price: 102123.6, change: 2.5, volume: 45000000000 },
      { symbol: 'ETH', name: 'Ethereum', price: 3422.1, change: 1.8, volume: 25000000000 },
      { symbol: 'BNB', name: 'BNB', price: 957.5, change: -0.5, volume: 2500000000 },
      { symbol: 'SOL', name: 'Solana', price: 520.4, change: 5.2, volume: 3500000000 },
      { symbol: 'ADA', name: 'Cardano', price: 0.5, change: -1.2, volume: 850000000 },
      { symbol: 'XRP', name: 'Ripple', price: 0.62, change: 3.1, volume: 1200000000 },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.08, change: 4.5, volume: 950000000 },
      { symbol: 'DOT', name: 'Polkadot', price: 6.75, change: -2.3, volume: 480000000 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.92, change: 6.7, volume: 720000000 },
      { symbol: 'LINK', name: 'Chainlink', price: 15.23, change: 2.9, volume: 680000000 },
      { symbol: 'UNI', name: 'Uniswap', price: 8.45, change: -1.8, volume: 320000000 },
      { symbol: 'ATOM', name: 'Cosmos', price: 10.12, change: 1.2, volume: 290000000 },
      { symbol: 'LTC', name: 'Litecoin', price: 92.5, change: -0.8, volume: 580000000 },
      { symbol: 'AVAX', name: 'Avalanche', price: 37.8, change: 8.2, volume: 640000000 },
      { symbol: 'FIL', name: 'Filecoin', price: 5.32, change: -3.5, volume: 210000000 },
      { symbol: 'ALGO', name: 'Algorand', price: 0.24, change: 2.1, volume: 180000000 },
      { symbol: 'VET', name: 'VeChain', price: 0.04, change: 7.3, volume: 150000000 },
      { symbol: 'ICP', name: 'Internet Computer', price: 12.45, change: -4.2, volume: 380000000 },
      { symbol: 'NEAR', name: 'NEAR Protocol', price: 5.67, change: 5.8, volume: 420000000 },
      { symbol: 'APT', name: 'Aptos', price: 11.23, change: 9.4, volume: 550000000 },
    ];

    setMarkets(mockMarkets);
    setFilteredMarkets(mockMarkets);
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...markets];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(market =>
        market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter === 'favorites') {
      result = result.filter(market => favorites.includes(market.symbol));
    } else if (activeFilter === 'gainers') {
      result = result.filter(market => market.change > 0).sort((a, b) => b.change - a.change);
    } else if (activeFilter === 'losers') {
      result = result.filter(market => market.change < 0).sort((a, b) => a.change - b.change);
    }

    // Apply sorting
    if (activeFilter !== 'gainers' && activeFilter !== 'losers') {
      switch (sortBy) {
        case 'volume':
          result.sort((a, b) => b.volume - a.volume);
          break;
        case 'change':
          result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
          break;
        case 'price':
          result.sort((a, b) => b.price - a.price);
          break;
        default:
          break;
      }
    }

    setFilteredMarkets(result);
  }, [markets, searchQuery, activeFilter, sortBy, favorites]);

  const toggleFavorite = (symbol) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(fav => fav !== symbol)
      : [...favorites, symbol];

    setFavorites(newFavorites);
    localStorage.setItem('gem_favorites', JSON.stringify(newFavorites));
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const handleMarketClick = (market) => {
    onSelectCoin && onSelectCoin(`${market.symbol}USDT`);
  };

  return (
    <div className="markets-list-expanded">
      {/* Search Bar */}
      <div className="markets-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Buttons & Sort Dropdown */}
      <div className="markets-controls">
        <div className="filter-buttons">
          <button
            className={activeFilter === 'all' ? 'active' : ''}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={activeFilter === 'favorites' ? 'active' : ''}
            onClick={() => setActiveFilter('favorites')}
          >
            <Star size={14} />
            Favorites
          </button>
          <button
            className={activeFilter === 'gainers' ? 'active' : ''}
            onClick={() => setActiveFilter('gainers')}
          >
            <TrendingUp size={14} />
            Gainers
          </button>
          <button
            className={activeFilter === 'losers' ? 'active' : ''}
            onClick={() => setActiveFilter('losers')}
          >
            <TrendingDown size={14} />
            Losers
          </button>
        </div>

        <select
          className="sort-dropdown"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="volume">Volume</option>
          <option value="change">Change</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Markets Table */}
      <div className="markets-table-container">
        <div className="markets-header">
          <span></span> {/* Star column */}
          <span>Symbol</span>
          <span>Price</span>
          <span>24h Change</span>
          <span>Volume</span>
        </div>

        <div className="markets-body">
          {filteredMarkets.length === 0 ? (
            <div className="no-results">
              <span>No markets found</span>
            </div>
          ) : (
            filteredMarkets.map((market) => {
              const isSelected = selectedCoin && (selectedCoin === `${market.symbol}USDT` || selectedCoin === market.symbol);
              return (
                <div
                  key={market.symbol}
                  className={`market-row-expanded ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleMarketClick(market)}
                >

                <button
                  className={`favorite-btn ${favorites.includes(market.symbol) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(market.symbol);
                  }}
                >
                  <Star size={16} fill={favorites.includes(market.symbol) ? '#FFBD59' : 'none'} />
                </button>

                <div className="market-symbol">
                  <span className="symbol-text">{market.symbol}/USDT</span>
                  <span className="symbol-name">{market.name}</span>
                </div>

                <div className="market-price">
                  ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </div>

                <div className={`market-change ${market.change >= 0 ? 'positive' : 'negative'}`}>
                  {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}%
                </div>

                <div className="market-volume">
                  {formatVolume(market.volume)}
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketsListExpanded;
