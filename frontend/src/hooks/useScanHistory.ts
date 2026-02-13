/**
 * Scan History Hook
 * Manages user's pattern scanning history
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { PatternCode, Timeframe, TimeframeDisplay, TierLevel } from '../types';

/** Scan history record from database */
interface ScanHistoryRecord {
  id: string;
  user_id: string;
  symbols: string[];
  patterns_found: Record<string, PatternCode[]>;
  timeframe: Timeframe | TimeframeDisplay;
  tier_at_scan: TierLevel;
  created_at: string;
}

/** Input for saving a scan */
interface SaveScanInput {
  symbols: string[];
  patternsFound: Record<string, PatternCode[]>;
  timeframe: Timeframe | TimeframeDisplay;
}

/** Scan statistics */
interface ScanStats {
  totalScans: number;
  totalPatterns: number;
  mostScannedSymbol: string | null;
  mostCommonTimeframe: string | null;
}

/** Operation result */
interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
}

/** Scan history hook return type */
interface UseScanHistoryReturn {
  history: ScanHistoryRecord[];
  loading: boolean;
  error: string | null;
  saveScan: (input: SaveScanInput) => Promise<OperationResult<ScanHistoryRecord>>;
  deleteScan: (scanId: string) => Promise<OperationResult>;
  clearHistory: () => Promise<OperationResult>;
  reloadHistory: (limit?: number) => Promise<void>;
  getStats: () => ScanStats;
  getRecentScans: (count?: number) => ScanHistoryRecord[];
}

export function useScanHistory(): UseScanHistoryReturn {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<ScanHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load scan history from database
   */
  const loadHistory = async (limit: number = 50): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: historyError } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (historyError) throw historyError;

      setHistory((data as ScanHistoryRecord[]) || []);
    } catch (err) {
      console.error('Error loading history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load history on mount and when user changes
  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Save a new scan to history
   */
  const saveScan = useCallback(
    async ({ symbols, patternsFound, timeframe }: SaveScanInput): Promise<OperationResult<ScanHistoryRecord>> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const scanData = {
          user_id: user.id,
          symbols,
          patterns_found: patternsFound,
          timeframe,
          tier_at_scan: profile?.tier || 'free',
          created_at: new Date().toISOString(),
        };

        const { data, error: saveError } = await supabase
          .from('scan_history')
          .insert(scanData)
          .select()
          .single();

        if (saveError) throw saveError;

        const savedRecord = data as ScanHistoryRecord;

        // Add to local state
        setHistory((prev) => [savedRecord, ...prev]);

        return { success: true, data: savedRecord };
      } catch (err) {
        console.error('Error saving scan:', err);
        throw err;
      }
    },
    [user, profile]
  );

  /**
   * Delete a scan from history
   */
  const deleteScan = useCallback(
    async (scanId: string): Promise<OperationResult> => {
      if (!user) return { success: false };

      try {
        const { error: deleteError } = await supabase
          .from('scan_history')
          .delete()
          .eq('id', scanId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Remove from local state
        setHistory((prev) => prev.filter((scan) => scan.id !== scanId));

        return { success: true };
      } catch (err) {
        console.error('Error deleting scan:', err);
        throw err;
      }
    },
    [user]
  );

  /**
   * Clear all scan history
   */
  const clearHistory = useCallback(async (): Promise<OperationResult> => {
    if (!user) return { success: false };

    try {
      const { error: deleteError } = await supabase
        .from('scan_history')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setHistory([]);

      return { success: true };
    } catch (err) {
      console.error('Error clearing history:', err);
      throw err;
    }
  }, [user]);

  /**
   * Get scan statistics
   */
  const getStats = useCallback((): ScanStats => {
    if (!history.length) {
      return {
        totalScans: 0,
        totalPatterns: 0,
        mostScannedSymbol: null,
        mostCommonTimeframe: null,
      };
    }

    // Count total patterns found
    const totalPatterns = history.reduce((sum, scan) => {
      const patterns = scan.patterns_found || {};
      return sum + Object.keys(patterns).length;
    }, 0);

    // Find most scanned symbol
    const symbolCounts: Record<string, number> = {};
    history.forEach((scan) => {
      scan.symbols.forEach((symbol) => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      });
    });
    const sortedSymbols = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]);
    const mostScannedSymbol = sortedSymbols[0]?.[0] ?? null;

    // Find most common timeframe
    const timeframeCounts: Record<string, number> = {};
    history.forEach((scan) => {
      timeframeCounts[scan.timeframe] = (timeframeCounts[scan.timeframe] || 0) + 1;
    });
    const sortedTimeframes = Object.entries(timeframeCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonTimeframe = sortedTimeframes[0]?.[0] ?? null;

    return {
      totalScans: history.length,
      totalPatterns,
      mostScannedSymbol,
      mostCommonTimeframe,
    };
  }, [history]);

  /**
   * Get recent scans (last N)
   */
  const getRecentScans = useCallback(
    (count: number = 10): ScanHistoryRecord[] => {
      return history.slice(0, count);
    },
    [history]
  );

  return {
    history,
    loading,
    error,
    saveScan,
    deleteScan,
    clearHistory,
    reloadHistory: loadHistory,
    getStats,
    getRecentScans,
  };
}
