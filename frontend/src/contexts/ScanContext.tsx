import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { DetectedPattern, ScanFilters } from '../types';

/** Scan result with signal */
interface ScanResult extends DetectedPattern {
  signal?: string;
}

/** Scan summary */
interface ScanSummary {
  totalResults: number;
  buySignals: number;
  sellSignals: number;
  lastScanTime: Date | null;
  filters: ScanFilters | null;
}

/** Scan context value interface */
interface ScanContextValue {
  scanResults: ScanResult[];
  lastScanTime: Date | null;
  scanFilters: ScanFilters | null;
  saveScanResults: (results: ScanResult[], filters: ScanFilters) => void;
  clearScanResults: () => void;
  getScanSummary: () => ScanSummary;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

interface ScanProviderProps {
  children: ReactNode;
}

export function ScanProvider({ children }: ScanProviderProps): React.ReactElement {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanFilters, setScanFilters] = useState<ScanFilters | null>(null);

  // Save scan results
  const saveScanResults = useCallback((results: ScanResult[], filters: ScanFilters): void => {
    console.log('[ScanContext] Saving scan results:', results.length, 'patterns');
    setScanResults(results);
    setLastScanTime(new Date());
    setScanFilters(filters);
  }, []);

  // Clear scan results
  const clearScanResults = useCallback((): void => {
    console.log('[ScanContext] Clearing scan results');
    setScanResults([]);
    setLastScanTime(null);
    setScanFilters(null);
  }, []);

  // Get scan summary
  const getScanSummary = useCallback((): ScanSummary => {
    return {
      totalResults: scanResults.length,
      buySignals: scanResults.filter(r => r.signal?.includes('BUY')).length,
      sellSignals: scanResults.filter(r => r.signal?.includes('SELL')).length,
      lastScanTime,
      filters: scanFilters,
    };
  }, [scanResults, lastScanTime, scanFilters]);

  const value: ScanContextValue = {
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
export function useScan(): ScanContextValue {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
