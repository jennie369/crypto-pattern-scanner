/**
 * Scan History Hook
 * Manages user's pattern scanning history
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export function useScanHistory() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
   * Load scan history from database
   */
  const loadHistory = async (limit = 50) => {
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

      setHistory(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save a new scan to history
   */
  const saveScan = useCallback(
    async ({ symbols, patternsFound, timeframe }) => {
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

        // Add to local state
        setHistory((prev) => [data, ...prev]);

        return { success: true, data };
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
    async (scanId) => {
      if (!user) return;

      try {
        const { error: deleteError } = await supabase
          .from('scan_history')
          .delete()
          .eq('id', scanId)
          .eq('user_id', user.id); // Security: only delete own scans

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
  const clearHistory = useCallback(async () => {
    if (!user) return;

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
  const getStats = useCallback(() => {
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
    const symbolCounts = {};
    history.forEach((scan) => {
      scan.symbols.forEach((symbol) => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      });
    });
    const mostScannedSymbol = Object.entries(symbolCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Find most common timeframe
    const timeframeCounts = {};
    history.forEach((scan) => {
      timeframeCounts[scan.timeframe] = (timeframeCounts[scan.timeframe] || 0) + 1;
    });
    const mostCommonTimeframe = Object.entries(timeframeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

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
    (count = 10) => {
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
