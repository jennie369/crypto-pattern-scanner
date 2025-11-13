import React, { useState } from 'react';
import ResultsList from './ResultsList';
import './ControlPanel.css';

export const ControlPanel = ({ onScan, isScanning, results, onSelectPattern, selectedPattern }) => {
  const [selectedCoins, setSelectedCoins] = useState(['BTC', 'ETH']);
  const [timeframe, setTimeframe] = useState('1H');
  const [patternFilter, setPatternFilter] = useState('All');

  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI'];
  const timeframes = ['5m', '15m', '1H', '4H', '1D'];
  const patterns = ['All', 'DPD', 'UPU', 'UPD', 'DPU', 'H&S', 'Double Top', 'Double Bottom', 'Triangle'];

  const handleCoinToggle = (coin) => {
    setSelectedCoins(prev =>
      prev.includes(coin)
        ? prev.filter(c => c !== coin)
        : [...prev, coin]
    );
  };

  const handleSelectAll = () => {
    setSelectedCoins(coins);
  };

  const handleClearAll = () => {
    setSelectedCoins([]);
  };

  const handleScan = () => {
    onScan({
      coins: selectedCoins,
      timeframe,
      pattern: patternFilter,
    });
  };

  return (
    <div className="control-panel">
      {/* Header */}
      <div className="panel-header">
        <h2 className="heading-sm">Scan Controls</h2>
        <p className="text-xs text-secondary">Configure scan parameters</p>
      </div>

      {/* Coin Selection */}
      <div className="control-section">
        <label className="control-label">Select Coins ({selectedCoins.length})</label>

        <div className="quick-filters">
          <button
            className="quick-filter-btn"
            onClick={handleSelectAll}
            disabled={isScanning}
          >
            Select All
          </button>
          <button
            className="quick-filter-btn"
            onClick={handleClearAll}
            disabled={isScanning}
          >
            Clear All
          </button>
        </div>

        <div className="coin-checkboxes">
          {coins.map(coin => (
            <label key={coin} className="coin-checkbox">
              <input
                type="checkbox"
                checked={selectedCoins.includes(coin)}
                onChange={() => handleCoinToggle(coin)}
                disabled={isScanning}
              />
              <span className="coin-label">{coin}/USDT</span>
              <span className="coin-icon">📈</span>
            </label>
          ))}
        </div>
      </div>

      {/* Timeframe Selection */}
      <div className="control-section">
        <label className="control-label">Timeframe</label>
        <div className="timeframe-buttons">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
              disabled={isScanning}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Filter */}
      <div className="control-section">
        <label className="control-label">Pattern Filter</label>
        <select
          className="pattern-select"
          value={patternFilter}
          onChange={(e) => setPatternFilter(e.target.value)}
          disabled={isScanning}
        >
          {patterns.map(pattern => (
            <option key={pattern} value={pattern}>{pattern}</option>
          ))}
        </select>
      </div>

      {/* Scan Button */}
      <button
        className={`scan-button ${isScanning ? 'scanning' : ''}`}
        onClick={handleScan}
        disabled={selectedCoins.length === 0 || isScanning}
      >
        {isScanning ? (
          <>
            <span className="scan-spinner"></span>
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>Start Scan</span>
          </>
        )}
      </button>

      {/* Results List */}
      {results.length > 0 && (
        <ResultsList
          results={results}
          onSelect={onSelectPattern}
          selectedPattern={selectedPattern}
        />
      )}
    </div>
  );
};

export default ControlPanel;
