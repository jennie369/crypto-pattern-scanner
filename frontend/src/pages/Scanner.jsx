import React, { useState, useEffect } from 'react';
import { User, Diamond, Infinity, Coins, TrendingUp, TrendingDown, Circle, Zap, Sparkles, ChevronRight } from 'lucide-react';
import CoinListSidebar from '../components/CoinListSidebar';
import QuickSelect from '../components/QuickSelect';
import TradingChart from '../components/TradingChart';
import TradingInfoSidebar from '../components/TradingInfoSidebar';
import ScanFilters from '../components/ScanFilters';
import AuthPromptModal from '../components/AuthPromptModal';
import QuotaDisplay from '../components/QuotaDisplay/QuotaDisplay';
import PriceTicker from '../components/PriceTicker/PriceTicker';
import PatternScanner from '../components/Scanner/PatternScanner';
import TradingJournal from '../components/TradingJournal/TradingJournal';
// TIER 2 Advanced Components
import PatternDetailsModal from '../components/AdvancedScanner/PatternDetailsModal';
import { determineEntryStatus } from '../utils/entryWorkflow';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useScan } from '../contexts/ScanContext';
import { useQuota } from '../hooks/useQuota';
import { useIpQuota } from '../hooks/useIpQuota';
import { useScanHistory } from '../hooks/useScanHistory';
// import './Scanner.css'; // Commented out to use global styles from components.css

/**
 * Scanner Page - Main pattern scanning interface with filters
 * This is the main page moved from App.jsx
 */
function Scanner() {
  const { t } = useTranslation();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [scannedCoins, setScannedCoins] = useState([]);
  const [scanResults, setScanResults] = useState([]); // Full scan results for sidebar display
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState('15m');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [triggerScan, setTriggerScan] = useState(0); // Counter to trigger scans
  const [directionFilter, setDirectionFilter] = useState('all'); // 'all', 'long', 'short'

  // 🆕 TIER 2 Advanced Mode State
  const [tier2Mode, setTier2Mode] = useState(false); // Toggle between basic and advanced mode
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [selectedPatternForModal, setSelectedPatternForModal] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [latestCandle, setLatestCandle] = useState(null);

  // Supabase hooks
  const { user, profile } = useAuth();
  const { quota, useQuotaSlot, refreshQuota } = useQuota();
  const { checkIpQuota, incrementIpScan, ipQuotaSummary } = useIpQuota();
  const { saveScan } = useScanHistory();

  // ✅ ScanContext - Persist results across page navigation
  const { scanResults: persistedResults, saveScanResults } = useScan();

  // ✅ Load persisted scan results on mount
  useEffect(() => {
    if (persistedResults && persistedResults.length > 0) {
      console.log('📦 [Scanner] Loading persisted scan results:', persistedResults.length);
      setScanResults(persistedResults);

      // Convert to scannedCoins format for sidebar
      const coins = persistedResults.map(result => ({
        symbol: result.symbol,
        patterns: [result.pattern],
        signal: result.signal,
        hasPattern: true
      }));
      setScannedCoins(coins);
    }
  }, []);

  // Mock pattern generator
  const generateMockPattern = (symbol, currentPrice, patternType = null) => {
    const gemPatterns = [
      { type: 'DPD', name: 'Down-Pause-Down', icon: '🔴📉⏸️📉', direction: 'bearish', category: 'continuation' },
      { type: 'UPU', name: 'Up-Pause-Up', icon: '🟢📈⏸️📈', direction: 'bullish', category: 'continuation' },
      { type: 'UPD', name: 'Up-Pause-Down', icon: '🔄📈⏸️📉', direction: 'bearish', category: 'reversal' },
      { type: 'DPU', name: 'Down-Pause-Up', icon: '🔄📉⏸️📈', direction: 'bullish', category: 'reversal' },
      { type: 'HFZ', name: 'High Frequency Zone', icon: '🔺🔴', direction: 'bearish', category: 'zone' },
      { type: 'LFZ', name: 'Low Frequency Zone', icon: '🔻🟢', direction: 'bullish', category: 'zone' }
    ];

    const pattern = patternType
      ? gemPatterns.find(p => p.type === patternType)
      : gemPatterns[Math.floor(Math.random() * gemPatterns.length)];

    const isLong = pattern.direction === 'bullish';
    const entryOffset = isLong ? -0.002 : 0.002;
    const slOffset = isLong ? -0.01 : 0.01;

    return {
      symbol,
      patternType: pattern.name,
      patternCode: pattern.type,
      patternIcon: pattern.icon,
      patternCategory: pattern.category,
      entry: currentPrice * (1 + entryOffset),
      stopLoss: currentPrice * (1 + slOffset),
      takeProfit: [
        currentPrice * (1 + (isLong ? 0.015 : -0.015)),
        currentPrice * (1 + (isLong ? 0.03 : -0.03)),
        currentPrice * (1 + (isLong ? 0.05 : -0.05))
      ],
      confidence: 0.75 + Math.random() * 0.2,
      timestamp: new Date().toISOString(),
      direction: pattern.direction,
      patternImage: null,
      zone: {
        type: pattern.type === 'HFZ' ? 'HFZ' : 'LFZ',
        high: currentPrice * 1.01,
        low: currentPrice * 0.99,
        mid: currentPrice
      },
      zoneStatus: 'fresh',
      retestCount: 0,
      waitingRetest: true,
    };
  };

  // Mock patterns
  const mockPatterns = {
    'BTCUSDT': generateMockPattern('BTCUSDT', 110598, 'DPD'),
    'ETHUSDT': generateMockPattern('ETHUSDT', 3425, 'UPU'),
    'SOLUSDT': generateMockPattern('SOLUSDT', 187, 'UPU'),
    'BNBUSDT': generateMockPattern('BNBUSDT', 1092, 'DPD'),
    'XRPUSDT': generateMockPattern('XRPUSDT', 2.53, 'LFZ'),
    'ADAUSDT': generateMockPattern('ADAUSDT', 0.61, 'DPU'),
    'DOGEUSDT': generateMockPattern('DOGEUSDT', 0.19, 'UPD'),
    'AVAXUSDT': generateMockPattern('AVAXUSDT', 18.89, 'UPU'),
    'DOTUSDT': generateMockPattern('DOTUSDT', 3.00, 'HFZ'),
    'MATICUSDT': generateMockPattern('MATICUSDT', 0.38, 'DPU'),
    'LINKUSDT': generateMockPattern('LINKUSDT', 17.43, 'UPU'),
    'UNIUSDT': generateMockPattern('UNIUSDT', 5.86, 'LFZ'),
    'ATOMUSDT': generateMockPattern('ATOMUSDT', 3.03, 'DPD'),
    'LTCUSDT': generateMockPattern('LTCUSDT', 100.17, 'UPD'),
    'NEARUSDT': generateMockPattern('NEARUSDT', 2.17, 'DPU'),
    'APTUSDT': generateMockPattern('APTUSDT', 4.56, 'HFZ'),
    'ARBUSDT': generateMockPattern('ARBUSDT', 0.42, 'UPU'),
    'OPUSDT': generateMockPattern('OPUSDT', 1.23, 'DPD'),
    'INJUSDT': generateMockPattern('INJUSDT', 12.34, 'LFZ'),
    'SUIUSDT': generateMockPattern('SUIUSDT', 1.87, 'UPU'),
  };

  // REMOVED: Auto-set pattern from mockPatterns
  // Pattern should only be set when user clicks a scan result
  // useEffect(() => {
  //   const pattern = mockPatterns[selectedSymbol];
  //   setSelectedPattern(pattern || null);
  // }, [selectedSymbol]);

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleApplyFilters = (filters) => {
    console.log('✅ Filters applied:', filters);
    setCurrentFilters(filters);
    setShowFilters(false);

    // Auto-trigger scan after applying filters
    setTimeout(() => {
      setTriggerScan(prev => prev + 1);
      console.log('🚀 Auto-triggering scan after filter apply');
    }, 300); // Small delay to let modal close smoothly
  };

  // Handle scan completion - convert results to pattern format and update state
  const handleScanComplete = (results) => {
    console.log('📊 Scan complete, processing results:', results);

    // Store full scan results for sidebar display
    setScanResults(results);

    // ✅ Save to ScanContext to persist across page navigation
    saveScanResults(results, currentFilters);
    console.log('💾 Saved scan results to context for persistence');

    // Convert scan results to scannedCoins array format
    // CoinListSidebar expects 'patterns' as array, not 'pattern' as string
    const newScannedCoins = results.map(result => ({
      symbol: result.symbol,
      patterns: [result.pattern], // Array format for CoinListSidebar compatibility
      signal: result.signal,
      hasPattern: true
    }));

    setScannedCoins(newScannedCoins);
    console.log('✅ Updated scannedCoins:', newScannedCoins);
    console.log('✅ Updated scanResults:', results);
  };

  // Handle result click - display pattern on chart
  const handleResultClick = (result) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖱️ COIN CLICKED:', result.symbol);
    console.log('👆 Full result:', result);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if signal is a buy signal (includes 'BUY')
    const isBuySignal = result.signal && result.signal.includes('BUY');

    // Convert scan result to pattern format for TradingChart
    const pattern = {
      symbol: result.symbol,
      pattern: result.pattern,
      patternType: result.pattern,
      patternCode: result.pattern.split(' ')[0].toUpperCase(),
      patternIcon: isBuySignal ? 'bullish' : 'bearish',
      patternCategory: 'scanned',
      entry: result.entry,
      stopLoss: result.stopLoss,
      takeProfit: [result.takeProfit, result.takeProfit * 1.01, result.takeProfit * 1.02],
      confidence: result.confidence,
      timestamp: result.timestamp,
      detectedAt: result.timestamp,
      timeframe: selectedInterval,
      direction: isBuySignal ? 'bullish' : 'bearish',
      patternImage: null,
      // 🆕 Zone data for TIER 2 advanced analysis
      zone: {
        type: isBuySignal ? 'LFZ' : 'HFZ',
        top: isBuySignal ? result.entry * 1.005 : result.stopLoss,
        bottom: isBuySignal ? result.stopLoss : result.entry * 0.995,
        mid: result.entry,
        testCount: Math.floor(Math.random() * 3), // Mock data
        createdAt: result.timestamp
      }
    };

    console.log('🔄 Setting selectedSymbol to:', result.symbol);
    setSelectedSymbol(result.symbol);
    setSelectedPattern(pattern);
    setCurrentPrice(result.entry); // Set current price for TIER 2

    // 🆕 TIER 2: Open advanced modal if user has access and TIER 2 mode is enabled
    if (hasTier2Access && tier2Mode) {
      console.log('💎 TIER 2: Opening PatternDetailsModal');
      setSelectedPatternForModal(pattern);

      // Generate mock latest candle for confirmation analysis
      const mockCandle = {
        open: result.entry * 0.998,
        high: result.entry * 1.002,
        low: result.entry * 0.995,
        close: result.entry,
        volume: 1000000,
        timestamp: new Date().toISOString()
      };
      setLatestCandle(mockCandle);
      setShowPatternModal(true);
    }

    console.log('✅ State updated - Chart should remount with key:', result.symbol);
  };

  // Filter scan results based on direction filter
  const filteredScanResults = scanResults.filter(result => {
    if (directionFilter === 'all') return true;
    if (directionFilter === 'long') return result.signal && result.signal.includes('BUY');
    if (directionFilter === 'short') return result.signal && result.signal.includes('SELL');
    return true;
  });

  // Get quota summary for display
  const quotaSummary = quota.loading ? null : {
    remaining: quota.remaining,
    total: quota.maxScans,
    canScan: quota.canScan
  };
  const isPremium = profile && profile.tier !== 'free';

  // 🆕 TIER 2 Access Check (scanner_tier >= 'premium')
  const tierLevels = {
    'free': 0,
    'pro': 1,
    'premium': 2,
    'vip': 3
  };
  const userTier = tierLevels[profile?.scanner_tier] || 0;
  const hasTier2Access = userTier >= 2; // premium or vip

  return (
    <div className="scanner-page">
      {/* Price Ticker at the top */}
      <PriceTicker />

      {/* User Status Bar */}
      {user && (
        <div className="user-status-bar">
          <div className="user-status-container">
            <div className="user-info">
              <span className="user-email"><User size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> {user.email}</span>
              <span className={`user-tier ${profile?.tier}`}>
                {isPremium ? <Diamond size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> : <Circle size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />} {profile?.tier?.toUpperCase() || 'FREE'}
              </span>
            </div>
            <div className="quota-info">
              {isPremium ? (
                <span className="quota-unlimited"><Infinity size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Unlimited Scans</span>
              ) : quotaSummary ? (
                <>
                  <span className="quota-text">Daily Scans:</span>
                  <span className={`quota-count ${quotaSummary.remaining === 0 ? 'depleted' : ''}`}>
                    {quotaSummary.remaining} / {quotaSummary.total}
                  </span>
                  {quotaSummary.remaining === 0 && (
                    <span className="upgrade-hint"><Diamond size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Upgrade for unlimited!</span>
                  )}
                </>
              ) : (
                <span className="quota-loading">Loading...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quota Display Component - Detailed quota info for FREE tier users */}
      {user && !isPremium && <QuotaDisplay />}

      {/* Login Prompt for Non-Authenticated Users */}
      {!user && (
        <div className="login-prompt-bar">
          <div className="login-prompt-container">
            <span className="prompt-icon"><Coins size={20} /></span>
            <span className="prompt-text">
              Bitcoin quét miễn phí!
              {ipQuotaSummary && (
                <span> ({ipQuotaSummary.remaining}/{ipQuotaSummary.total} lượt còn lại hôm nay)</span>
              )}
              {' '}Tạo tài khoản để quét tất cả coin. Go to <strong>Settings</strong> to create an account.
            </span>
          </div>
        </div>
      )}

      {/* Scan Controls */}
      <div className="scan-controls-bar">
        <div className="scan-controls-container">
          <div className="control-buttons">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowFilters(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #9C0612 0%, #6B0F1A 100%)',
                border: '2px solid #FFBD59',
                borderRadius: '50px',
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(156, 6, 18, 0.3)',
                position: 'relative',
                zIndex: 100,
                visibility: 'visible',
                opacity: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(156, 6, 18, 0.4), 0 0 20px rgba(255, 189, 89, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(156, 6, 18, 0.3)';
              }}
            >
              <Zap size={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> Bắt Đầu Scan
            </button>

            {/* Direction Filter Buttons */}
            <div className="direction-buttons">
              <button
                className={`btn-direction ${directionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDirectionFilter('all')}
              >
                MARKET
              </button>
              <button
                className={`btn-direction short ${directionFilter === 'short' ? 'active' : ''}`}
                onClick={() => setDirectionFilter('short')}
              >
                <span className="direction-indicator"><TrendingDown size={16} style={{ color: '#ef4444' }} /></span> SHORT
              </button>
              <button
                className={`btn-direction long ${directionFilter === 'long' ? 'active' : ''}`}
                onClick={() => setDirectionFilter('long')}
              >
                <span className="direction-indicator"><TrendingUp size={16} style={{ color: '#10b981' }} /></span> LONG
              </button>
            </div>

            {/* TIER 2 Mode Toggle (Only for premium+ users) */}
            {hasTier2Access && (
              <button
                className={`btn-tier2-mode ${tier2Mode ? 'active' : ''}`}
                onClick={() => setTier2Mode(!tier2Mode)}
                title="TIER 2 Advanced Pattern Analysis"
              >
                <Diamond size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> TIER 2 {tier2Mode ? 'ON' : 'OFF'}
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {currentFilters && (
            <div className="active-filters">
              <span className="filter-tag">
                <Coins size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> {currentFilters.coins?.length || 0} coins
              </span>
              <span className="filter-tag">
                <ChevronRight size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> {currentFilters.timeframes?.join(', ') || '1h'}
              </span>
              <span className="filter-tag">
                <TrendingUp size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> {currentFilters.patterns?.length || 3} patterns
              </span>
              <span className="filter-tag">
                <Sparkles size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> {Math.round((currentFilters.confidenceThreshold || 0.6) * 100)}% confidence
              </span>
              {currentFilters.direction && currentFilters.direction !== 'all' && (
                <span className="filter-tag">
                  {currentFilters.direction === 'bullish' ? <TrendingUp size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle', color: '#10b981' }} /> : <TrendingDown size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle', color: '#ef4444' }} />} {t(currentFilters.direction)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pattern Scanner Section */}
      <PatternScanner
        filters={currentFilters}
        onFilterChange={() => setShowFilters(true)}
        onScanStateChange={setIsScannerActive}
        onScanComplete={handleScanComplete}
        onResultClick={handleResultClick}
        triggerScan={triggerScan}
      />

      <div className={`app-layout ${isScannerActive ? 'focus-mode' : ''}`}>
        {/* Left Sidebar - 20% */}
        <aside className="sidebar-left">
          <QuickSelect
            selectedCoin={selectedSymbol}
            onSelectCoin={handleSymbolSelect}
            patterns={mockPatterns}
          />
          <CoinListSidebar
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSymbolSelect}
            scannedCoins={scannedCoins}
            scanResults={filteredScanResults}
            onScanResultClick={handleResultClick}
          />
        </aside>

        {/* Center Chart - 50% */}
        <main className="main-content">
          <TradingChart
            key={selectedSymbol} // ← Force remount when symbol changes
            symbol={selectedSymbol}
            interval={selectedInterval}
            patterns={selectedPattern ? [selectedPattern] : []}
            currentPrice={selectedPattern ? selectedPattern.entry : 0}
            isAuthenticated={!!user}
            onIntervalChange={setSelectedInterval}
          />
        </main>

        {/* Right Sidebar - 30% */}
        <aside className="sidebar-right">
          <TradingInfoSidebar
            pattern={selectedPattern}
            symbol={selectedSymbol}
          />
        </aside>
      </div>

      {/* Trading Journal - Available for all tiers */}
      {user && <TradingJournal />}

      {/* Filters Modal */}
      {showFilters && (
        <ScanFilters
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPromptModal
          onClose={() => setShowAuthPrompt(false)}
        />
      )}

      {/* 🆕 TIER 2 Advanced Pattern Details Modal */}
      {hasTier2Access && showPatternModal && selectedPatternForModal && (
        <PatternDetailsModal
          isOpen={showPatternModal}
          onClose={() => setShowPatternModal(false)}
          pattern={selectedPatternForModal}
          currentPrice={currentPrice}
          latestCandle={latestCandle}
          onSetAlert={(pattern) => {
            console.log('🔔 Set Alert for:', pattern);
            alert(`Alert set for ${pattern.symbol}!`);
          }}
          onViewChart={(pattern) => {
            console.log('📈 View on Chart:', pattern);
            setShowPatternModal(false);
          }}
        />
      )}

    </div>
  );
}

export default Scanner;
