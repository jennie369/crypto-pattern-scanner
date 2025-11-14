import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import TradingChart from './components/TradingChart';
import PatternInfoUltraCompact from './components/PatternInfoUltraCompact';
import SubToolsPanel from './components/SubToolsPanel';
import MarketChatbotSection from './components/MarketChatbotSection';
import { scanPatterns, ScannerWebSocket, exportToCSV, downloadCSV } from '../../../../services/scannerAPI';
import { useScannerStore } from '../../../../stores/scannerStore';
import './ScannerPage.css';

/**
 * Scanner Page v2 - GEM Platform
 * 3-column layout with real-time pattern detection
 * Week 3, Day 18-21
 *
 * STATE PERSISTENCE: Uses Zustand store for persistent state across page refreshes
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
      setSelectedPattern(null); // Reset selection on new scan

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
    setSelectedPattern(pattern);
  };

  const handleCoinSelect = (symbol) => {
    console.log('[ScannerPage] Updating chart to:', symbol);
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

        {/* RIGHT - Sub-Tools (Top) + Pattern Info (Bottom) */}
        <div className="scanner-right">
          <div className="right-column-scroll-wrapper">
            <SubToolsPanel
              pattern={selectedPattern}
            />

            <PatternInfoUltraCompact
              pattern={selectedPattern}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
