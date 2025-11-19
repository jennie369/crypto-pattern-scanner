import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import TradingChart from './components/TradingChart';
import PatternInfoUltraCompact from './components/PatternInfoUltraCompact';
import SubToolsPanel from './components/SubToolsPanel';
import MarketChatbotSection from './components/MarketChatbotSection';
import PaperTradingPanel from '../../../../components/PaperTradingPanel/PaperTradingPanel';
import OpenPositionsWidget from '../../../../components/PaperTrading/OpenPositionsWidget';
import RecentTradesSection from '../../../../components/PaperTrading/RecentTradesSection';
import { scanPatterns, ScannerWebSocket, exportToCSV, downloadCSV } from '../../../../services/scannerAPI';
import { useScannerStore } from '../../../../stores/scannerStore';
import './ScannerPage.css';

/**
 * Scanner Page v2 - GEM Platform
 * 3-column layout with real-time pattern detection
 * Week 3, Day 18-21
 *
 * STATE PERSISTENCE: Uses Zustand store for persistent state across page refreshes
 * UPDATED: 2025-01-19 - Testing ultra-simple widgets
 */
export const ScannerPage = () => {
  // Zustand store for persistent state
  const {
    scanResults,
    selectedPattern,
    isScanning,
    setScanResults,
    setSelectedPattern,
    setIsScanning,
  } = useScannerStore();

  // Local state for errors (don't persist)
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT'); // Coin for chart
  const wsRef = useRef(null);

  // Paper trading panel state
  const [showPaperTradingPanel, setShowPaperTradingPanel] = useState(false);
  const [paperTradingSymbol, setPaperTradingSymbol] = useState(null);

  // Initialize WebSocket on mount
  useEffect(() => {
    wsRef.current = new ScannerWebSocket();

    // Setup WebSocket callbacks
    wsRef.current.onPattern((pattern) => {
      console.log('New pattern detected:', pattern);
      // Add new pattern to results (Zustand store)
      // Access current state directly to avoid stale closure
      const currentResults = useScannerStore.getState().scanResults;
      setScanResults([pattern, ...currentResults]);
    });

    wsRef.current.onPrice((priceUpdate) => {
      console.log('Price update:', priceUpdate);
      // Update pattern prices if needed
    });

    wsRef.current.onError((error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [setScanResults]);

  const handleScan = async (filters) => {
    console.log('[ScannerPage] Starting scan with filters:', filters);
    setIsScanning(true);
    setError(null); // Clear previous errors

    try {
      // Call actual scan API
      const results = await scanPatterns(filters);
      console.log('[ScannerPage] Scan results:', results);

      setScanResults(results);

      // Auto-select best pattern (highest confidence + BTC tiebreaker)
      if (results.length > 0) {
        const sorted = [...results].sort((a, b) => {
          // Primary: Highest confidence
          if (Math.abs(b.confidence - a.confidence) > 0.1) {
            return b.confidence - a.confidence;
          }
          // Secondary: Prefer BTC if confidence equal
          const aIsBTC = a.coin.toUpperCase().includes('BTC');
          const bIsBTC = b.coin.toUpperCase().includes('BTC');
          if (bIsBTC && !aIsBTC) return 1;
          if (aIsBTC && !bIsBTC) return -1;
          // Tertiary: Alphabetical
          return a.coin.localeCompare(b.coin);
        });

        const bestPattern = sorted[0];

        // Validate best pattern before selecting
        if (bestPattern && bestPattern.coin) {
          console.log('[Scanner] [OK] Auto-selected best pattern:', bestPattern.coin, `(${bestPattern.confidence}% confidence)`);
          setSelectedPattern(bestPattern);
          setSelectedCoin(bestPattern.coin);
        } else {
          console.warn('[Scanner] [WARN] Best pattern missing coin property:', bestPattern);
        }
      } else {
        // No results: clear selection
        setSelectedPattern(null);
        console.log('[Scanner] [WARN] No patterns found');
      }

      // Connect WebSocket for real-time updates
      if (wsRef.current && filters.coins && filters.coins.length > 0) {
        wsRef.current.connect(filters.coins);
      }
    } catch (error) {
      console.error('[ScannerPage] Scan error:', error);
      setError(error.message || 'Failed to scan patterns. Please try again.');
      alert(`Scan failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsScanning(false);
      console.log('[ScannerPage] Scan complete');
    }
  };

  const handleSelectPattern = (pattern) => {
    try {
      // Validate pattern object
      if (!pattern) {
        console.error('[Scanner] [ERROR] Pattern is null/undefined');
        return;
      }

      if (!pattern.coin) {
        console.error('[Scanner] [ERROR] Pattern missing coin property:', pattern);
        return;
      }

      console.log('[Scanner] [SELECT] Pattern selected:', pattern.coin, pattern.pattern);
      setSelectedPattern(pattern);
      setSelectedCoin(pattern.coin);

    } catch (error) {
      console.error('[Scanner] [ERROR] Error in handleSelectPattern:', error);
      console.error('[Scanner] Pattern data:', pattern);
    }
  };

  const handleCoinSelect = (symbol) => {
    console.log('[Scanner] [COIN] Market coin selected:', symbol);
    setSelectedPattern(null); // Clear pattern lines when manually selecting coin
    setSelectedCoin(symbol);
  };

  const handleExportResults = () => {
    if (scanResults.length === 0) {
      alert('No results to export');
      return;
    }

    const csv = exportToCSV(scanResults);
    const filename = `pattern-scan-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleOpenPaperTrading = (symbol) => {
    console.log('[ScannerPage] Opening paper trading panel for:', symbol);
    setPaperTradingSymbol(symbol);
    setShowPaperTradingPanel(true);
  };

  const handleClosePaperTrading = () => {
    console.log('[ScannerPage] Closing paper trading panel');
    setShowPaperTradingPanel(false);
    setPaperTradingSymbol(null);
  };

  return (
    <div className="scanner-page-v2">
      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(246, 70, 93, 0.1)',
          border: '1px solid #F6465D',
          borderRadius: '8px',
          color: '#F6465D',
          marginBottom: '16px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="scanner-layout">
        {/* LEFT - Control Panel */}
        <div className="scanner-left">
          <ControlPanel
            onScan={handleScan}
            isScanning={isScanning}
            results={scanResults}
            onSelectPattern={handleSelectPattern}
            selectedPattern={selectedPattern}
            onOpenPaperTrading={handleOpenPaperTrading}
          />
        </div>

        {/* CENTER - Trading Chart + Market/Chatbot */}
        <div className="scanner-center">
          <TradingChart
            pattern={selectedPattern}
            symbol={selectedCoin}
          />

          <MarketChatbotSection
            onSelectCoin={handleCoinSelect}
            selectedCoin={selectedCoin}
          />
        </div>

        {/* RIGHT - Sub-Tools (Top) + Pattern Info (Bottom) + Paper Trading Widgets */}
        <div className="scanner-right">
          <div className="right-column-scroll-wrapper">
            <SubToolsPanel
              pattern={selectedPattern}
            />

            <PatternInfoUltraCompact
              pattern={selectedPattern}
            />

            {/* Paper Trading Widgets - ULTRA-SIMPLE VERSION (No API calls) */}
            <div className="paper-trading-widgets-section">
              <OpenPositionsWidget
                onOpenPaperTrading={handleOpenPaperTrading}
              />

              <RecentTradesSection />
            </div>
          </div>
        </div>
      </div>

      {/* Paper Trading Side Panel - Renders outside scanner-layout for proper overlay */}
      <PaperTradingPanel
        isOpen={showPaperTradingPanel}
        symbol={paperTradingSymbol}
        onClose={handleClosePaperTrading}
        prefilledSide="buy"
      />
    </div>
  );
};

export default ScannerPage;
