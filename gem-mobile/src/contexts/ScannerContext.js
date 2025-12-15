/**
 * GEM Mobile - Scanner Context
 * Persists scan results across tab navigation
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ScannerContext = createContext(null);

export const ScannerProvider = ({ children }) => {
  // Persisted scan state
  const [scanResults, setScanResults] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [selectedCoins, setSelectedCoins] = useState(['BTCUSDT']);
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [multiTFResults, setMultiTFResults] = useState(null);

  // Update scan results
  const updateScanResults = useCallback((results, allPatterns, time) => {
    setScanResults(results);
    setPatterns(allPatterns);
    setLastScanTime(time);
  }, []);

  // Clear scan results
  const clearScanResults = useCallback(() => {
    setScanResults([]);
    setPatterns([]);
    setLastScanTime(null);
    setMultiTFResults(null);
  }, []);

  const value = {
    // State
    scanResults,
    patterns,
    lastScanTime,
    selectedCoins,
    selectedTimeframe,
    multiTFResults,
    // Actions
    setScanResults,
    setPatterns,
    setLastScanTime,
    setSelectedCoins,
    setSelectedTimeframe,
    setMultiTFResults,
    updateScanResults,
    clearScanResults,
  };

  return (
    <ScannerContext.Provider value={value}>
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};

export default ScannerContext;
