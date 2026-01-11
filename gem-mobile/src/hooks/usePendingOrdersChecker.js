/**
 * GEM Scanner - Pending Orders Checker Hook
 * Periodically checks pending orders against current prices
 * Triggers fills for Limit orders and Stop orders
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import {
  checkAndTriggerOrders,
  checkLimitOrderFills,
  getPendingOrders,
} from '../services/pendingOrderService';
import binanceService from '../services/binanceService';

const CHECK_INTERVAL = 5000; // 5 seconds

/**
 * Hook to check pending orders periodically
 * @param {string} userId - Current user ID
 * @param {boolean} enabled - Whether to enable checking
 */
export const usePendingOrdersChecker = (userId, enabled = true) => {
  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Check all pending orders
  const checkOrders = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      // Get symbols from pending orders
      const { data: orders } = await getPendingOrders(userId);
      if (!orders || orders.length === 0) return;

      // Get unique symbols
      const symbols = [...new Set(orders.map(o => o.symbol))];

      // Fetch current prices for all symbols
      const prices = {};
      for (const symbol of symbols) {
        try {
          const priceData = await binanceService.getCurrentPrice(symbol);
          if (priceData) {
            prices[symbol] = {
              last: priceData,
              mark: priceData, // For paper trading, use same as last
            };
          }
        } catch (e) {
          console.warn('[usePendingOrdersChecker] Failed to get price for', symbol);
        }
      }

      if (Object.keys(prices).length === 0) return;

      // Check Stop orders (Stop Limit, Stop Market)
      const triggerStats = await checkAndTriggerOrders(prices, userId);
      if (triggerStats.triggered > 0) {
        console.log('[usePendingOrdersChecker] Triggered:', triggerStats);
      }

      // Check Limit orders and TRIGGERED_PENDING orders
      await checkLimitOrderFills(prices, userId);

    } catch (error) {
      console.error('[usePendingOrdersChecker] Error:', error);
    }
  }, [userId, enabled]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - check immediately
        checkOrders();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [checkOrders]);

  // Set up interval
  useEffect(() => {
    if (!enabled || !userId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkOrders();

    // Set up periodic check
    intervalRef.current = setInterval(checkOrders, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, enabled, checkOrders]);

  // Manual trigger
  return { checkOrders };
};

export default usePendingOrdersChecker;
