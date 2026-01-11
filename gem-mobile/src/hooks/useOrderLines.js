/**
 * GEM Scanner - useOrderLines Hook
 * Manages order lines state and real-time updates for chart display
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { orderLinesService, LINE_TYPES } from '../services/orderLinesService';
import { chartPreferencesService } from '../services/chartPreferencesService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing order lines on chart
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {boolean} enabled - Whether order lines are enabled
 * @param {number} refreshTrigger - Increment to force refresh (for position close events)
 * @returns {Object} Order lines state and controls
 */
export function useOrderLines(symbol, enabled = true, refreshTrigger = 0) {
  const { user } = useAuth();
  const [orderLines, setOrderLines] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshIntervalRef = useRef(null);

  // Initialize preferences
  useEffect(() => {
    const initPreferences = async () => {
      try {
        const prefs = await chartPreferencesService.init(user?.id);
        setPreferences(prefs);
      } catch (err) {
        console.error('[useOrderLines] Preferences init error:', err);
      }
    };

    initPreferences();
  }, [user?.id]);

  // Fetch order lines
  const fetchOrderLines = useCallback(async () => {
    if (!symbol || !enabled) {
      setOrderLines([]);
      setLoading(false);
      return;
    }

    try {
      const visibility = chartPreferencesService.getOrderLineVisibility();
      const lines = await orderLinesService.getOrderLinesForSymbol(symbol, visibility);
      setOrderLines(lines);
      setError(null);
    } catch (err) {
      console.error('[useOrderLines] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, enabled]);

  // Set up update callback
  useEffect(() => {
    orderLinesService.setOnUpdateCallback((lines) => {
      setOrderLines(lines);
    });

    return () => {
      orderLinesService.setOnUpdateCallback(null);
    };
  }, []);

  // Fetch on mount and when symbol changes
  useEffect(() => {
    setLoading(true);
    fetchOrderLines();
  }, [fetchOrderLines]);

  // Auto-refresh every 5 seconds for real-time PnL updates
  useEffect(() => {
    if (!enabled || !symbol) return;

    refreshIntervalRef.current = setInterval(() => {
      fetchOrderLines();
    }, 5000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [enabled, symbol, fetchOrderLines]);

  // Force refresh when refreshTrigger changes (e.g., position closed)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('[useOrderLines] Force refresh triggered:', refreshTrigger);
      fetchOrderLines();
    }
  }, [refreshTrigger, fetchOrderLines]);

  // Toggle visibility setting
  const toggleVisibility = useCallback(async (key) => {
    try {
      const newPrefs = await chartPreferencesService.toggleVisibility(key);
      setPreferences(newPrefs);
      // Refetch lines with new visibility settings
      await fetchOrderLines();
    } catch (err) {
      console.error('[useOrderLines] Toggle visibility error:', err);
    }
  }, [fetchOrderLines]);

  // Update TP/SL via drag
  const updateTPSL = useCallback(async (positionId, updates) => {
    try {
      await orderLinesService.updatePositionTPSL(positionId, updates);
      return true;
    } catch (err) {
      console.error('[useOrderLines] Update TP/SL error:', err);
      return false;
    }
  }, []);

  // Update pending order price via drag
  const updatePendingPrice = useCallback(async (orderId, newPrice) => {
    try {
      await orderLinesService.updatePendingOrderPrice(orderId, newPrice);
      return true;
    } catch (err) {
      console.error('[useOrderLines] Update pending price error:', err);
      return false;
    }
  }, []);

  // Get lines by type
  const getLinesByType = useCallback((type) => {
    return orderLines.filter(line => line.type === type);
  }, [orderLines]);

  // Get entry lines
  const entryLines = orderLines.filter(
    line => line.type === LINE_TYPES.ENTRY || line.type === LINE_TYPES.PENDING_ENTRY
  );

  // Get TP lines
  const tpLines = orderLines.filter(
    line => line.type === LINE_TYPES.TAKE_PROFIT || line.type === LINE_TYPES.PENDING_TP
  );

  // Get SL lines
  const slLines = orderLines.filter(
    line => line.type === LINE_TYPES.STOP_LOSS || line.type === LINE_TYPES.PENDING_SL
  );

  // Get liquidation lines
  const liquidationLines = orderLines.filter(
    line => line.type === LINE_TYPES.LIQUIDATION
  );

  // Refresh manually
  const refresh = useCallback(() => {
    setLoading(true);
    fetchOrderLines();
  }, [fetchOrderLines]);

  // Count positions and pending orders
  const positionCount = orderLines.filter(
    line => line.type === LINE_TYPES.ENTRY && !line.isPending
  ).length;

  const pendingCount = orderLines.filter(
    line => line.type === LINE_TYPES.PENDING_ENTRY
  ).length;

  return {
    // State
    orderLines,
    preferences,
    loading,
    error,

    // Categorized lines
    entryLines,
    tpLines,
    slLines,
    liquidationLines,

    // Actions
    refresh,
    toggleVisibility,
    updateTPSL,
    updatePendingPrice,
    getLinesByType,

    // Utils
    hasOrderLines: orderLines.length > 0,
    lineCount: orderLines.length,
    positionCount,
    pendingCount,
  };
}

export default useOrderLines;
