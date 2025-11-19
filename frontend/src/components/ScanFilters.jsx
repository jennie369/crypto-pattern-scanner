import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  Search, X, BarChart3, User, Mountain, Triangle, Flag, Coffee,
  TrendingUp, Circle, Gem, Clock, Target, Settings, RefreshCw, CheckCircle, Star
} from 'lucide-react';
import './ScanFilters.css';

/**
 * Advanced Scanner Filters Component
 * Provides comprehensive filtering options for pattern scanning
 */
function ScanFilters({ onApplyFilters, onClose }) {
  const { t } = useTranslation();

  // State for all filters
  const [selectedCoins, setSelectedCoins] = useState([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState(['1h']);
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [minRiskReward, setMinRiskReward] = useState(1.5);
  const [zoneStatus, setZoneStatus] = useState('all');
  const [coinSearchQuery, setCoinSearchQuery] = useState('');

  // Available options
  const availableCoins = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'top10' },
    { symbol: 'ETHUSDT', name: 'Ethereum', category: 'top10' },
    { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'top10' },
    { symbol: 'SOLUSDT', name: 'Solana', category: 'layer1' },
    { symbol: 'XRPUSDT', name: 'Ripple', category: 'top10' },
    { symbol: 'ADAUSDT', name: 'Cardano', category: 'layer1' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'meme' },
    { symbol: 'MATICUSDT', name: 'Polygon', category: 'layer2' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', category: 'layer1' },
    { symbol: 'DOTUSDT', name: 'Polkadot', category: 'layer1' },
    { symbol: 'LINKUSDT', name: 'Chainlink', category: 'defi' },
    { symbol: 'UNIUSDT', name: 'Uniswap', category: 'defi' },
    { symbol: 'ATOMUSDT', name: 'Cosmos', category: 'layer1' },
    { symbol: 'LTCUSDT', name: 'Litecoin', category: 'top10' },
    { symbol: 'ETCUSDT', name: 'Ethereum Classic', category: 'layer1' },
    { symbol: 'TRXUSDT', name: 'Tron', category: 'layer1' },
    { symbol: 'APTUSDT', name: 'Aptos', category: 'layer1' },
    { symbol: 'ARBUSDT', name: 'Arbitrum', category: 'layer2' },
    { symbol: 'OPUSDT', name: 'Optimism', category: 'layer2' },
    { symbol: 'NEARUSDT', name: 'Near Protocol', category: 'layer1' },
  ];

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour', recommended: true },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
  ];

  const patternTypes = [
    { id: 'head_shoulders', name: 'Head & Shoulders', icon: <User size={16} /> },
    { id: 'double_top', name: 'Double Top', icon: <Mountain size={16} /> },
    { id: 'double_bottom', name: 'Double Bottom', icon: <Mountain size={16} /> },
    { id: 'ascending_triangle', name: 'Ascending Triangle', icon: <Triangle size={16} /> },
    { id: 'descending_triangle', name: 'Descending Triangle', icon: <Triangle size={16} /> },
    { id: 'symmetrical_triangle', name: 'Symmetrical Triangle', icon: <Triangle size={16} /> },
    { id: 'flag', name: 'Flag', icon: <Flag size={16} /> },
    { id: 'pennant', name: 'Pennant', icon: <Flag size={16} /> },
    { id: 'cup_handle', name: 'Cup & Handle', icon: <Coffee size={16} /> },
    { id: 'wedge', name: 'Wedge', icon: <TrendingUp size={16} /> },
    { id: 'channel', name: 'Channel', icon: <BarChart3 size={16} /> },
    { id: 'supply_zone', name: 'Supply Zone', icon: <Circle size={16} className="supply-icon" fill="currentColor" /> },
    { id: 'demand_zone', name: 'Demand Zone', icon: <Circle size={16} className="demand-icon" fill="currentColor" /> },
    { id: 'gem_frequency', name: 'GEM Frequency Pattern', icon: <Gem size={16} /> },
  ];

  const coinCategories = [
    { id: 'top10', label: 'Top 10', count: 0 },
    { id: 'layer1', label: 'Layer 1', count: 0 },
    { id: 'layer2', label: 'Layer 2', count: 0 },
    { id: 'defi', label: 'DeFi', count: 0 },
    { id: 'meme', label: 'Meme Coins', count: 0 },
  ];

  // Calculate category counts
  coinCategories.forEach(cat => {
    cat.count = availableCoins.filter(c => c.category === cat.id).length;
  });

  // Filter coins by search query
  const filteredCoins = availableCoins.filter(coin =>
    coin.symbol.toLowerCase().includes(coinSearchQuery.toLowerCase()) ||
    coin.name.toLowerCase().includes(coinSearchQuery.toLowerCase())
  );

  // Toggle coin selection
  const toggleCoin = (symbol) => {
    setSelectedCoins(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Select all coins in category
  const selectCategory = (categoryId) => {
    const categoryCoins = availableCoins
      .filter(c => c.category === categoryId)
      .map(c => c.symbol);
    setSelectedCoins(prev => [...new Set([...prev, ...categoryCoins])]);
  };

  // Select/Deselect all visible coins
  const toggleAllCoins = () => {
    if (selectedCoins.length === filteredCoins.length) {
      setSelectedCoins([]);
    } else {
      setSelectedCoins(filteredCoins.map(c => c.symbol));
    }
  };

  // Toggle timeframe
  const toggleTimeframe = (tf) => {
    setSelectedTimeframes(prev =>
      prev.includes(tf)
        ? prev.filter(t => t !== tf)
        : [...prev, tf]
    );
  };

  // Toggle pattern
  const togglePattern = (patternId) => {
    setSelectedPatterns(prev =>
      prev.includes(patternId)
        ? prev.filter(p => p !== patternId)
        : [...prev, patternId]
    );
  };

  // Select all patterns
  const toggleAllPatterns = () => {
    if (selectedPatterns.length === patternTypes.length) {
      setSelectedPatterns([]);
    } else {
      setSelectedPatterns(patternTypes.map(p => p.id));
    }
  };

  // Apply filters
  const handleApply = () => {
    const filters = {
      coins: selectedCoins.length > 0 ? selectedCoins : availableCoins.map(c => c.symbol),
      timeframes: selectedTimeframes,
      patterns: selectedPatterns.length > 0 ? selectedPatterns : patternTypes.map(p => p.id),
      direction: selectedDirection,
      confidenceThreshold: confidenceThreshold / 100,
      minRiskReward,
      zoneStatus,
    };

    console.log('🔍 Applying filters:', filters);
    onApplyFilters(filters);
  };

  // Reset to defaults
  const handleReset = () => {
    setSelectedCoins([]);
    setSelectedTimeframes(['1h']);
    setSelectedPatterns([]);
    setSelectedDirection('all');
    setConfidenceThreshold(70);
    setMinRiskReward(1.5);
    setZoneStatus('all');
    setCoinSearchQuery('');
  };

  return (
    <div className="scan-filters-overlay" onClick={onClose}>
      <div className="scan-filters-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="filters-header">
          <div>
            <h2><Search size={24} /> {t('scanFilters')}</h2>
            <p className="filters-subtitle">{t('customizeScan')}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="filters-content">

          {/* COIN SELECTION */}
          <div className="filter-section">
            <div className="section-header">
              <h3><Gem size={20} /> {t('selectCoins')}</h3>
              <div className="section-actions">
                <button
                  className="btn-small"
                  onClick={toggleAllCoins}
                >
                  {selectedCoins.length === filteredCoins.length ? t('deselectAll') : t('selectAll')}
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="search-box">
              <input
                type="text"
                placeholder={t('searchCoins')}
                value={coinSearchQuery}
                onChange={(e) => setCoinSearchQuery(e.target.value)}
              />
              <span className="search-icon"><Search size={16} /></span>
            </div>

            {/* Category Quick Select */}
            <div className="category-chips">
              {coinCategories.map(cat => (
                <button
                  key={cat.id}
                  className="category-chip"
                  onClick={() => selectCategory(cat.id)}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Coin List */}
            <div className="coin-list">
              {filteredCoins.map(coin => (
                <label key={coin.symbol} className="coin-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCoins.includes(coin.symbol)}
                    onChange={() => toggleCoin(coin.symbol)}
                  />
                  <span className="coin-info">
                    <span className="coin-symbol">{coin.symbol.replace('USDT', '')}</span>
                    <span className="coin-name">{coin.name}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="selection-summary">
              {selectedCoins.length > 0
                ? `${selectedCoins.length} ${t('coinsSelected')}`
                : t('allCoinsSelected')}
            </div>
          </div>

          {/* TIMEFRAME SELECTION */}
          <div className="filter-section">
            <div className="section-header">
              <h3><Clock size={20} /> {t('selectTimeframes')}</h3>
            </div>

            <div className="timeframe-grid">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  className={`timeframe-btn ${selectedTimeframes.includes(tf.value) ? 'active' : ''} ${tf.recommended ? 'recommended' : ''}`}
                  onClick={() => toggleTimeframe(tf.value)}
                >
                  {tf.label}
                  {tf.recommended && <span className="badge"><Star size={12} /></span>}
                </button>
              ))}
            </div>

            <div className="selection-summary">
              {selectedTimeframes.length} {t('timeframesSelected')}
            </div>
          </div>

          {/* PATTERN TYPE SELECTION */}
          <div className="filter-section">
            <div className="section-header">
              <h3><BarChart3 size={20} /> {t('selectPatterns')}</h3>
              <button
                className="btn-small"
                onClick={toggleAllPatterns}
              >
                {selectedPatterns.length === patternTypes.length ? t('deselectAll') : t('selectAll')}
              </button>
            </div>

            <div className="pattern-grid">
              {patternTypes.map(pattern => (
                <label key={pattern.id} className="pattern-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPatterns.includes(pattern.id)}
                    onChange={() => togglePattern(pattern.id)}
                  />
                  <span className="pattern-info">
                    <span className="pattern-icon">{pattern.icon}</span>
                    <span className="pattern-name">{pattern.name}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="selection-summary">
              {selectedPatterns.length > 0
                ? `${selectedPatterns.length} ${t('patternsSelected')}`
                : t('allPatternsSelected')}
            </div>
          </div>

          {/* ADVANCED FILTERS */}
          <div className="filter-section">
            <div className="section-header">
              <h3><Settings size={20} /> {t('advancedFilters')}</h3>
            </div>

            {/* Direction Filter */}
            <div className="filter-group">
              <label>{t('direction')}</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="direction"
                    value="all"
                    checked={selectedDirection === 'all'}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                  />
                  <span>{t('all')}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="direction"
                    value="bullish"
                    checked={selectedDirection === 'bullish'}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                  />
                  <span><Circle size={12} fill="currentColor" className="bullish-icon" /> {t('bullish')}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="direction"
                    value="bearish"
                    checked={selectedDirection === 'bearish'}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                  />
                  <span><Circle size={12} fill="currentColor" className="bearish-icon" /> {t('bearish')}</span>
                </label>
              </div>
            </div>

            {/* Confidence Threshold */}
            <div className="filter-group">
              <label>
                {t('minConfidence')}: <strong>{confidenceThreshold}%</strong>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Risk/Reward Ratio */}
            <div className="filter-group">
              <label>
                {t('minRiskReward')}: <strong>1:{minRiskReward}</strong>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={minRiskReward}
                onChange={(e) => setMinRiskReward(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>1:1</span>
                <span>1:3</span>
                <span>1:5</span>
              </div>
            </div>

            {/* Zone Status */}
            <div className="filter-group">
              <label>{t('zoneStatus')}</label>
              <select
                value={zoneStatus}
                onChange={(e) => setZoneStatus(e.target.value)}
                className="select-input"
              >
                <option value="all">{t('all')}</option>
                <option value="fresh">{t('fresh')} (★ {t('best')})</option>
                <option value="retested">{t('retested')}</option>
              </select>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="filters-footer">
          <button className="btn-reset" onClick={handleReset}>
            <RefreshCw size={16} /> {t('resetFilters')}
          </button>
          <button className="btn-apply" onClick={handleApply}>
            <CheckCircle size={16} /> {t('applyFilters')} & {t('scanNow')}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ScanFilters;
