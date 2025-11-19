import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import ResultsList from './ResultsList';
import CoinSelectorDropdown from './CoinSelectorDropdown';
import './ControlPanel.css';

export const ControlPanel = ({ onScan, isScanning, results, onSelectPattern, selectedPattern, onOpenPaperTrading }) => {
  const { profile, getScannerTier } = useAuth();
  const [selectedCoins, setSelectedCoins] = useState(['BTCUSDT']); // Multi-coin support
  const [timeframe, setTimeframe] = useState('1H');
  const [patternFilter, setPatternFilter] = useState('All');

  const timeframes = ['5m', '15m', '1H', '4H', '1D'];

  // Tier limits configuration
  // Get actual tier from AuthContext
  const scannerTierRaw = getScannerTier ? getScannerTier() : 'free';

  // Normalize tier format (handle both 'free'/'tier3'/'TIER3'/'vip' formats)
  const normalizeTier = (tier) => {
    const tierLower = (tier || 'free').toLowerCase();
    if (tierLower === 'free') return 'FREE';
    if (tierLower === 'tier1' || tierLower === 'pro') return 'TIER1';
    if (tierLower === 'tier2' || tierLower === 'premium') return 'TIER2';
    if (tierLower === 'tier3' || tierLower === 'vip') return 'TIER3';
    return 'FREE'; // Default to FREE
  };

  const userTier = normalizeTier(scannerTierRaw);

  // ✅ TIER-BASED PATTERN FILTERING (per TIER_ACCESS_CHINH_XAC.md)
  const getAvailablePatterns = (tier) => {
    // Pattern definitions by tier
    const tierPatterns = {
      // FREE: 3 basic patterns
      'FREE': ['All', 'DPD', 'UPU', 'H&S'],

      // TIER 1: 7 patterns (✅ ALL IMPLEMENTED)
      'TIER1': [
        'All',
        'DPD',
        'UPU',
        'UPD',
        'DPU',
        'Double Top',
        'Double Bottom',
        'H&S'
      ],

      // TIER 2: 15 patterns (TIER 1 + 8 new)
      'TIER2': [
        'All',
        // TIER 1 patterns (7)
        'DPD', 'UPU', 'UPD', 'DPU', 'Double Top', 'Double Bottom', 'H&S',
        // TIER 2 new patterns (8) - ⚠️ NOT YET IMPLEMENTED
        'HFZ', 'LFZ', 'Inverse H&S', 'Rounding Bottom', 'Rounding Top',
        'Symmetrical Triangle', 'Ascending Triangle', 'Descending Triangle'
      ],

      // TIER 3: 24 patterns (TIER 2 + 9 new)
      'TIER3': [
        'All',
        // TIER 1 patterns (7)
        'DPD', 'UPU', 'UPD', 'DPU', 'Double Top', 'Double Bottom', 'H&S',
        // TIER 2 patterns (8)
        'HFZ', 'LFZ', 'Inverse H&S', 'Rounding Bottom', 'Rounding Top',
        'Symmetrical Triangle', 'Ascending Triangle', 'Descending Triangle',
        // TIER 3 new patterns (9) - ⚠️ NOT YET IMPLEMENTED
        'Bull Flag', 'Bear Flag', 'Flag', 'Wedge', 'Engulfing',
        'Morning/Evening Star', 'Cup & Handle', '3 Methods', 'Hammer'
      ]
    };

    return tierPatterns[tier] || tierPatterns['FREE'];
  };

  const patterns = getAvailablePatterns(userTier);

  // Debug logging
  console.log('[DEBUG] [ControlPanel] Tier Debug:', {
    scannerTierRaw,
    userTier,
    selectedCoins,
    availablePatterns: patterns.length,
    profile: profile ? { email: profile.email, scanner_tier: profile.scanner_tier } : null
  });

  const handleScan = () => {
    if (!selectedCoins || selectedCoins.length === 0) {
      alert('Please select at least one coin to scan.');
      return;
    }

    onScan({
      coins: selectedCoins, // Multi-coin support
      timeframe,
      pattern: patternFilter,
    });
  };

  return (
    <div className="control-panel">
      {/* Header - Compact */}
      <div className="panel-header-compact">
        <h2>Scan Controls</h2>
      </div>

      {/* Coin Selection - Dropdown Selector with Multi-Select */}
      <div className="control-section">
        <label className="control-label">Select Coins</label>
        <CoinSelectorDropdown
          selected={selectedCoins}
          onChange={setSelectedCoins}
          maxCoins={userTier === 'FREE' ? 2 : userTier === 'TIER1' ? 5 : userTier === 'TIER2' ? 20 : 997}
          tier={userTier}
        />
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

      {/* Scan Button - Compact */}
      <button
        className={`scan-button-compact ${isScanning ? 'scanning' : ''}`}
        onClick={handleScan}
        disabled={!selectedCoins || selectedCoins.length === 0 || isScanning}
      >
        {isScanning ? (
          <>
            <span className="scan-spinner"></span>
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <Search size={16} />
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
          onOpenPaperTrading={onOpenPaperTrading}
        />
      )}
    </div>
  );
};

export default ControlPanel;
