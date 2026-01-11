/**
 * GEM Scanner - Pending Order Service
 * CRUD operations for pending orders (Limit, Stop Limit, Stop Market)
 * Includes trigger checking and order execution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import paperTradeService from './paperTradeService';
import { notifyOrderFilled, notifyStopTriggered } from './paperTradeNotificationService';

// AsyncStorage keys
const STORAGE_KEYS = {
  PENDING_ORDERS: '@gem_pending_orders',
  LAST_SYNC: '@gem_pending_orders_last_sync',
};

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get pending orders from local storage
 */
const getLocalOrders = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ORDERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[pendingOrderService] getLocalOrders error:', error);
    return [];
  }
};

/**
 * Save pending orders to local storage
 */
const saveLocalOrders = async (orders) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ORDERS, JSON.stringify(orders));
  } catch (error) {
    console.error('[pendingOrderService] saveLocalOrders error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// CREATE ORDER
// ═══════════════════════════════════════════════════════════

/**
 * Create a new pending order
 * @param {string} userId - User ID
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, order?: Object, error?: string}>}
 */
export const createPendingOrder = async (userId, orderData) => {
  try {
    // Build order data WITHOUT id - let Supabase generate UUID
    const orderFields = {
      user_id: userId,
      symbol: orderData.symbol,
      base_asset: orderData.base_asset,
      order_type: orderData.order_type,
      direction: orderData.direction,
      limit_price: orderData.limit_price || null,
      stop_price: orderData.stop_price || null,
      trigger_type: orderData.trigger_type || 'last_price',
      quantity: orderData.quantity,
      position_size: orderData.position_size,
      leverage: orderData.leverage,
      margin_mode: orderData.margin_mode || 'isolated',
      initial_margin: orderData.initial_margin,
      take_profit: orderData.take_profit || null,
      stop_loss: orderData.stop_loss || null,
      tp_trigger_type: orderData.tp_trigger_type || 'mark_price',
      sl_trigger_type: orderData.sl_trigger_type || 'mark_price',
      time_in_force: orderData.time_in_force || 'GTC',
      reduce_only: orderData.reduce_only || false,
      pattern_type: orderData.pattern_type || null,
      timeframe: orderData.timeframe || null,
      confidence: orderData.confidence || null,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let order = { ...orderFields };

    // Save to Supabase if user is logged in - Supabase will generate UUID
    if (userId) {
      const { data, error } = await supabase
        .from('paper_pending_orders')
        .insert([orderFields])  // Don't include id, let DB generate
        .select()
        .single();

      if (error) throw error;
      order = data;  // Use the complete order from Supabase with generated UUID
    } else {
      // Local only - generate a local ID
      order.id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Also save locally
    const localOrders = await getLocalOrders();
    localOrders.push(order);
    await saveLocalOrders(localOrders);

    console.log('[pendingOrderService] Created order:', order.id, order.order_type);
    return { success: true, order };
  } catch (error) {
    console.error('[pendingOrderService] createPendingOrder error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════
// GET ORDERS
// ═══════════════════════════════════════════════════════════

/**
 * Get all pending orders for a user
 * @param {string} userId - User ID
 * @param {string} symbol - Optional symbol filter
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getPendingOrders = async (userId, symbol = null) => {
  try {
    let orders = [];

    // Active statuses that need monitoring
    const activeStatuses = ['PENDING', 'TRIGGERED_PENDING'];

    // Try Supabase first
    if (userId) {
      let query = supabase
        .from('paper_pending_orders')
        .select('*')
        .eq('user_id', userId)
        .in('status', activeStatuses)
        .order('created_at', { ascending: false });

      if (symbol) {
        query = query.eq('symbol', symbol);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[pendingOrderService] Supabase error, using local:', error);
      } else {
        orders = data || [];
      }
    }

    // Fallback to local storage
    if (orders.length === 0) {
      const localOrders = await getLocalOrders();
      orders = localOrders.filter(o => activeStatuses.includes(o.status));
      if (symbol) {
        orders = orders.filter(o => o.symbol === symbol);
      }
    }

    return { data: orders, error: null };
  } catch (error) {
    console.error('[pendingOrderService] getPendingOrders error:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Get a single pending order by ID
 */
export const getPendingOrderById = async (orderId, userId = null) => {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('paper_pending_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        return { data, error: null };
      }
    }

    // Fallback to local
    const localOrders = await getLocalOrders();
    const order = localOrders.find(o => o.id === orderId);
    return { data: order || null, error: order ? null : 'Order not found' };
  } catch (error) {
    console.error('[pendingOrderService] getPendingOrderById error:', error);
    return { data: null, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE ORDER
// ═══════════════════════════════════════════════════════════

/**
 * Update a pending order
 * @param {string} orderId - Order ID
 * @param {Object} updates - Fields to update
 */
export const updatePendingOrder = async (orderId, updates, userId = null) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update in Supabase
    if (userId) {
      const { error } = await supabase
        .from('paper_pending_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    }

    // Update locally
    const localOrders = await getLocalOrders();
    const index = localOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      localOrders[index] = { ...localOrders[index], ...updateData };
      await saveLocalOrders(localOrders);
    }

    console.log('[pendingOrderService] Updated order:', orderId);
    return { success: true };
  } catch (error) {
    console.error('[pendingOrderService] updatePendingOrder error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════
// CANCEL ORDER
// ═══════════════════════════════════════════════════════════

/**
 * Cancel a pending order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 */
export const cancelPendingOrder = async (orderId, reason = 'User cancelled', userId = null) => {
  try {
    const updateData = {
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
    };

    // Update in Supabase
    if (userId) {
      const { error } = await supabase
        .from('paper_pending_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    }

    // Update locally
    const localOrders = await getLocalOrders();
    const index = localOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      localOrders[index] = { ...localOrders[index], ...updateData };
      await saveLocalOrders(localOrders);
    }

    console.log('[pendingOrderService] Cancelled order:', orderId, reason);
    return { success: true };
  } catch (error) {
    console.error('[pendingOrderService] cancelPendingOrder error:', error);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════
// TRIGGER CHECKING
// ═══════════════════════════════════════════════════════════

/**
 * Check and trigger orders based on current prices
 * @param {Object} prices - Map of symbol -> { last: price, mark: price }
 * @param {string} userId - User ID
 * @returns {Promise<{triggered: number, executed: number, errors: number}>}
 */
export const checkAndTriggerOrders = async (prices, userId = null) => {
  const stats = { triggered: 0, executed: 0, errors: 0 };

  try {
    const { data: orders } = await getPendingOrders(userId);

    for (const order of orders) {
      const priceData = prices[order.symbol];
      if (!priceData) continue;

      const triggerPrice = order.trigger_type === 'mark_price'
        ? priceData.mark || priceData.last
        : priceData.last;

      const shouldTrigger = checkTriggerCondition(order, triggerPrice);

      if (shouldTrigger) {
        stats.triggered++;
        console.log('[pendingOrderService] Triggering order:', order.id, order.order_type);

        try {
          await executeTriggeredOrder(order, priceData.last, userId);
          stats.executed++;
        } catch (error) {
          console.error('[pendingOrderService] Execute error:', error);
          stats.errors++;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('[pendingOrderService] checkAndTriggerOrders error:', error);
    return stats;
  }
};

/**
 * Check if order should be triggered
 */
const checkTriggerCondition = (order, currentPrice) => {
  const { order_type, direction, stop_price, limit_price } = order;

  switch (order_type) {
    case 'limit':
      // Limit order: triggers when price is at or better than limit
      if (direction === 'LONG') {
        return currentPrice <= limit_price;
      } else {
        return currentPrice >= limit_price;
      }

    case 'stop_limit':
    case 'stop_market':
      // Stop orders: triggers when price crosses stop
      if (direction === 'LONG') {
        // Long stop: triggers when price goes above stop
        return currentPrice >= stop_price;
      } else {
        // Short stop: triggers when price goes below stop
        return currentPrice <= stop_price;
      }

    default:
      return false;
  }
};

/**
 * Execute a triggered order
 */
const executeTriggeredOrder = async (order, executionPrice, userId) => {
  // For stop_limit, check if limit condition is met
  if (order.order_type === 'stop_limit' && order.limit_price) {
    let limitConditionMet = false;

    if (order.direction === 'LONG') {
      // LONG Stop Limit: After trigger, fill when price <= limitPrice
      limitConditionMet = executionPrice <= order.limit_price;
    } else {
      // SHORT Stop Limit: After trigger, fill when price >= limitPrice
      limitConditionMet = executionPrice >= order.limit_price;
    }

    if (!limitConditionMet) {
      // Limit condition NOT met - mark as TRIGGERED_PENDING, continue waiting
      await updatePendingOrder(order.id, {
        status: 'TRIGGERED_PENDING',
        triggered_at: new Date().toISOString(),
      }, userId);

      console.log('[pendingOrderService] Stop Limit triggered but limit not met:', order.id,
        'executionPrice:', executionPrice, 'limitPrice:', order.limit_price);

      // Send notification that stop triggered
      await notifyStopTriggered({
        ...order,
        triggerPrice: executionPrice,
        waitingForLimit: true,
      }, userId);

      return; // Don't execute yet, wait for limit condition
    }

    // Limit condition met - fill at limit price
    console.log('[pendingOrderService] Stop Limit: both conditions met, filling at limitPrice');
  }

  // Mark as triggered
  await updatePendingOrder(order.id, {
    status: 'TRIGGERED',
    triggered_at: new Date().toISOString(),
  }, userId);

  // Determine fill price
  // - Limit orders: fill at limit_price
  // - Stop Market: fill at execution (market) price
  // - Stop Limit (condition met): fill at limit_price
  let fillPrice = executionPrice;

  if (order.order_type === 'limit') {
    fillPrice = order.limit_price;
  } else if (order.order_type === 'stop_limit' && order.limit_price) {
    fillPrice = order.limit_price;
  }
  // stop_market fills at executionPrice (market price)

  // Create position via paperTradeService
  // Build pattern object as expected by openPosition
  const pattern = {
    symbol: order.symbol,
    direction: order.direction,
    entry: fillPrice,
    entryPrice: fillPrice,
    stopLoss: order.stop_loss,
    takeProfit: order.take_profit,
    target: order.take_profit,
    patternType: order.pattern_type || 'pending_order',
    type: order.pattern_type || 'pending_order',
    timeframe: order.timeframe || '4h',
    confidence: order.confidence || 75,
    riskReward: order.risk_reward || 2,
  };

  // Calculate margin from order data
  const positionSize = order.initial_margin || ((order.quantity * fillPrice) / order.leverage);

  // paperTradeService.openPosition returns position directly (not {success, position})
  // Wrap in try-catch for proper error handling
  let position;
  try {
    position = await paperTradeService.openPosition({
      pattern,
      positionSize,
      userId,
      leverage: order.leverage || 10,
      tradeMode: order.trade_mode || 'custom',
      currentMarketPrice: fillPrice, // Ensure it executes at fill price
    });
  } catch (error) {
    // Mark as rejected on error
    await updatePendingOrder(order.id, {
      status: 'REJECTED',
      cancel_reason: error.message || 'Failed to execute',
    }, userId);

    throw new Error(error.message || 'Failed to execute order');
  }

  if (position && position.id) {
    // Mark order as filled
    await updatePendingOrder(order.id, {
      status: 'FILLED',
      filled_at: new Date().toISOString(),
      filled_price: fillPrice,
      filled_quantity: order.quantity,
      position_id: position.id,
    }, userId);

    // Send notification
    await notifyOrderFilled({
      ...order,
      filledPrice: fillPrice,
    }, userId);

    console.log('[pendingOrderService] Order filled:', order.id, '@', fillPrice);
  } else {
    // Mark as rejected if no valid position returned
    await updatePendingOrder(order.id, {
      status: 'REJECTED',
      cancel_reason: 'Invalid position returned',
    }, userId);

    throw new Error('Failed to execute order - invalid position');
  }
};

// ═══════════════════════════════════════════════════════════
// LIMIT ORDER FILL CHECK
// ═══════════════════════════════════════════════════════════

/**
 * Check limit orders for fills (called periodically)
 * @param {Object} prices - Current prices by symbol
 * @param {string} userId - User ID
 */
export const checkLimitOrderFills = async (prices, userId = null) => {
  try {
    const { data: orders } = await getPendingOrders(userId);

    // Check regular PENDING limit orders
    const limitOrders = orders.filter(o => o.order_type === 'limit' && o.status === 'PENDING');

    for (const order of limitOrders) {
      const currentPrice = prices[order.symbol]?.last;
      if (!currentPrice) continue;

      let shouldFill = false;

      if (order.direction === 'LONG') {
        // Long limit fills when price <= limit price
        shouldFill = currentPrice <= order.limit_price;
      } else {
        // Short limit fills when price >= limit price
        shouldFill = currentPrice >= order.limit_price;
      }

      if (shouldFill) {
        console.log('[pendingOrderService] Limit order fill:', order.id, 'at', order.limit_price);
        await executeTriggeredOrder(order, order.limit_price, userId);
      }
    }

    // Check TRIGGERED_PENDING stop_limit orders (stop triggered, waiting for limit)
    const triggeredPendingOrders = orders.filter(o =>
      o.order_type === 'stop_limit' && o.status === 'TRIGGERED_PENDING'
    );

    for (const order of triggeredPendingOrders) {
      const currentPrice = prices[order.symbol]?.last;
      if (!currentPrice) continue;

      let limitConditionMet = false;

      if (order.direction === 'LONG') {
        // LONG: fill when price <= limitPrice
        limitConditionMet = currentPrice <= order.limit_price;
      } else {
        // SHORT: fill when price >= limitPrice
        limitConditionMet = currentPrice >= order.limit_price;
      }

      if (limitConditionMet) {
        console.log('[pendingOrderService] Stop Limit order limit condition met:', order.id, 'at', order.limit_price);
        await executeTriggeredOrder(order, order.limit_price, userId);
      }
    }
  } catch (error) {
    console.error('[pendingOrderService] checkLimitOrderFills error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════

/**
 * Clean up expired orders
 */
export const cleanupExpiredOrders = async (userId = null) => {
  try {
    const now = new Date();

    // Update in Supabase
    if (userId) {
      await supabase
        .from('paper_pending_orders')
        .update({
          status: 'EXPIRED',
          cancelled_at: now.toISOString(),
          cancel_reason: 'Order TTL expired',
        })
        .eq('status', 'PENDING')
        .lt('expires_at', now.toISOString());
    }

    // Update locally
    const localOrders = await getLocalOrders();
    const updated = localOrders.map(order => {
      if (order.status === 'PENDING' && order.expires_at && new Date(order.expires_at) < now) {
        return {
          ...order,
          status: 'EXPIRED',
          cancelled_at: now.toISOString(),
          cancel_reason: 'Order TTL expired',
        };
      }
      return order;
    });
    await saveLocalOrders(updated);

    console.log('[pendingOrderService] Cleaned up expired orders');
  } catch (error) {
    console.error('[pendingOrderService] cleanupExpiredOrders error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════

/**
 * Get pending order stats
 */
export const getPendingOrderStats = async (userId = null) => {
  try {
    const { data: orders } = await getPendingOrders(userId);

    const stats = {
      total: orders.length,
      byType: {},
      bySymbol: {},
      totalMargin: 0,
    };

    for (const order of orders) {
      // By type
      stats.byType[order.order_type] = (stats.byType[order.order_type] || 0) + 1;

      // By symbol
      stats.bySymbol[order.symbol] = (stats.bySymbol[order.symbol] || 0) + 1;

      // Total margin
      stats.totalMargin += order.initial_margin || 0;
    }

    return stats;
  } catch (error) {
    console.error('[pendingOrderService] getPendingOrderStats error:', error);
    return { total: 0, byType: {}, bySymbol: {}, totalMargin: 0 };
  }
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const pendingOrderService = {
  createPendingOrder,
  getPendingOrders,
  getPendingOrderById,
  updatePendingOrder,
  cancelPendingOrder,
  checkAndTriggerOrders,
  checkLimitOrderFills,
  cleanupExpiredOrders,
  getPendingOrderStats,
};

export default pendingOrderService;
