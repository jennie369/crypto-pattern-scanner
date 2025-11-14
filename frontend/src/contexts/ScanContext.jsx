import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * ScanContext - Persist scan results across page navigation
 * Prevents scan results from being lost when user navigates to other pages
 */

const ScanContext = createContext();

export function ScanProvider({ children }) {
  // Scan results state
  const [scanResults, setScanResults] = useState([]);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanFilters, setScanFilters] = useState(null);

  // Save scan results
  const saveScanResults = useCallback((results, filters) => {
    console.log('💾 [ScanContext] Saving scan results:', results.length, 'patterns');
    setScanResults(results);
    setLastScanTime(new Date());
    setScanFilters(filters);
  }, []);

  // Clear scan results
  const clearScanResults = useCallback(() => {
    console.log('🗑️ [ScanContext] Clearing scan results');
    setScanResults([]);
    setLastScanTime(null);
    setScanFilters(null);
  }, []);

  // Get scan summary
  const getScanSummary = useCallback(() => {
    return {
      totalResults: scanResults.length,
      buySignals: scanResults.filter(r => r.signal?.includes('BUY')).length,
      sellSignals: scanResults.filter(r => r.signal?.includes('SELL')).length,
      lastScanTime,
      filters: scanFilters,
    };
  }, [scanResults, lastScanTime, scanFilters]);

  const value = {
    scanResults,
    lastScanTime,
    scanFilters,
    saveScanResults,
    clearScanResults,
    getScanSummary,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

// Custom hook to use scan context
export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
