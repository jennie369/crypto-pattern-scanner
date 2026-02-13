/**
 * GEM Scanner - Pending Orders Checker Hook
 *
 * @deprecated DEPRECATED as of 2026-02-13 (MASTER_FIX_PLAN B2)
 * This hook created a DUAL monitoring system alongside paperTradeService.checkPendingOrders().
 * paperTradeService is the single source of truth for pending order monitoring.
 * Pending order CRUD still lives in pendingOrderService.js.
 *
 * This hook is kept for reference but should NOT be imported anywhere.
 * paperTradeService.startGlobalMonitoring() handles all monitoring.
 */

// No-op export to prevent import errors if any file still references this
export const usePendingOrdersChecker = (_userId, _enabled = true) => {
  console.warn('[usePendingOrdersChecker] DEPRECATED: paperTradeService handles all monitoring. Remove this import.');
  return { checkOrders: async () => {} };
};

export default usePendingOrdersChecker;
