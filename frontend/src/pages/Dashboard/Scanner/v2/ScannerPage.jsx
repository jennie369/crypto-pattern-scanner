import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import TradingChart from './components/TradingChart';
import PatternDetails from './components/PatternDetails';
import SubToolsPanel from './components/SubToolsPanel';
import { scanPatterns, ScannerWebSocket, exportToCSV, downloadCSV } from '../../../services/scannerAPI';
import './ScannerPage.css';

/**
 * Scanner Page v2 - GEM Platform
 * 3-column layout with real-time pattern detection
 * Week 3, Day 18-21
 */
export const ScannerPage = () => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const wsRef = useRef(null);

  // Initialize WebSocket on mount
  useEffect(() => {
    wsRef.current = new ScannerWebSocket();

    // Setup WebSocket callbacks
    wsRef.current.onPattern((pattern) => {
      console.log('New pattern detected:', pattern);
      // Add new pattern to results
      setScanResults(prev => [pattern, ...prev]);
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
  }, []);

  const handleScan = async (filters) => {
    setIsScanning(true);
    try {
      // Call actual scan API
      const results = await scanPatterns(filters);
      setScanResults(results);
      setSelectedPattern(null); // Reset selection on new scan

      // Connect WebSocket for real-time updates
      if (wsRef.current && filters.coins.length > 0) {
        wsRef.current.connect(filters.coins);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan patterns. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPattern = (pattern) => {
    setSelectedPattern(pattern);
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

        {/* CENTER - Trading Chart */}
        <div className="scanner-center">
          <TradingChart
            pattern={selectedPattern}
          />
        </div>

        {/* RIGHT - Pattern Details + Sub-Tools */}
        <div className="scanner-right">
          <PatternDetails
            pattern={selectedPattern}
          />

          <SubToolsPanel
            pattern={selectedPattern}
          />
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
