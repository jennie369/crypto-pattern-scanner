/**
 * GEM Mobile - Scanner Context
 * Persists scan results across tab navigation
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ScannerContext = createContext(null);

export const ScannerProvider = ({ children }) => {
  // Persisted scan state
  const [scanResults, setScanResults] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [selectedCoins, setSelectedCoins] = useState(['BTCUSDT']);
  const [selectedTimeframe, setSelectedTimeframeRaw] = useState('4h');
  const [multiTFResults, setMultiTFResults] = useState(null);
  // Zone state - persisted across tab navigation
  const [zones, setZones] = useState([]);

  // B3 FIX: Clear stale patterns when timeframe changes to prevent cross-TF leakage
  // P6 FIX #1: Add clearResults flag — pattern selection should NOT wipe results
  const setSelectedTimeframe = useCallback((newTf, { clearResults = true } = {}) => {
    setSelectedTimeframeRaw(prev => {
      if (prev !== newTf && clearResults) {
        // User-initiated timeframe change — clear old results
        // P6 FIX: Use queueMicrotask to avoid setState-inside-setState anti-pattern
        queueMicrotask(() => {
          setScanResults([]);
          setPatterns([]);
          setLastScanTime(null);
          setMultiTFResults(null);
          setZones([]);
        });
      }
      return newTf;
    });
  }, []);

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
    setZones([]);
  }, []);

  const value = useMemo(() => ({
    // State
    scanResults,
    patterns,
    lastScanTime,
    selectedCoins,
    selectedTimeframe,
    multiTFResults,
    zones,
    // Actions
    setScanResults,
    setPatterns,
    setLastScanTime,
    setSelectedCoins,
    setSelectedTimeframe,
    setMultiTFResults,
    setZones,
    updateScanResults,
    clearScanResults,
  }), [
    scanResults, patterns, lastScanTime, selectedCoins,
    selectedTimeframe, multiTFResults, zones,
    setSelectedTimeframe, updateScanResults, clearScanResults,
  ]);

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
