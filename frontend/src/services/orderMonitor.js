/**
 * Order Monitor Service — Unified Tables
 * Monitors paper_pending_orders and executes when price conditions are met.
 * On trigger: INSERT into paper_trades (status='OPEN'), UPDATE pending to 'FILLED',
 * update user_paper_trade_settings balance.
 *
 * TP/SL are now columns on paper_trades rows — the server cron handles auto-close.
 * This monitor only handles pending LIMIT / STOP_LIMIT orders from the web UI.
 */

import { supabase } from '../lib/supabaseClient';
import binanceWS from './binanceWebSocket';

const TRADING_FEE_RATE = 0.001;

/**
 * OrderMonitor Class — Singleton
 */
class OrderMonitor {
  constructor() {
    this.activeSubscriptions = new Map();
    this.pendingOrders = [];
    this.isMonitoring = false;
    this.userId = null;
  }

  /**
   * Start monitoring orders for a user
   * @param {string} userId - User UUID
   */
  async startMonitoring(userId) {
    if (this.isMonitoring && this.userId === userId) {
      console.log('[OrderMonitor] Already monitoring for this user');
      return;
    }

    this.userId = userId;
    this.isMonitoring = true;

    console.log('[OrderMonitor] Starting monitoring for user:', userId);

    await this.refreshPendingOrders();

    const symbols = [...new Set(this.pendingOrders.map(o => o.symbol))];
    console.log(`[OrderMonitor] Monitoring ${this.pendingOrders.length} pending orders across ${symbols.length} symbols`);

    symbols.forEach(symbol => {
      this.subscribeToPriceUpdates(symbol);
    });
  }

  /**
   * Refresh list of pending orders from paper_pending_orders
   */
  async refreshPendingOrders() {
    if (!this.userId) return;

    const { data: orders, error } = await supabase
      .from('paper_pending_orders')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'PENDING');

    if (error) {
      console.error('[OrderMonitor] Failed to fetch pending orders:', error);
      return;
    }

    this.pendingOrders = orders || [];

    // Subscribe to new symbols
    const currentSymbols = [...this.activeSubscriptions.keys()];
    const newSymbols = [...new Set(this.pendingOrders.map(o => o.symbol))].filter(
      sym => !currentSymbols.includes(sym)
    );

    newSymbols.forEach(symbol => {
      this.subscribeToPriceUpdates(symbol);
    });
  }

  /**
   * Subscribe to price updates for a symbol
   */
  subscribeToPriceUpdates(symbol) {
    if (this.activeSubscriptions.has(symbol)) return;

    const unsubscribe = binanceWS.subscribe(symbol, (update) => {
      if (update.price && update.price > 0) {
        this.checkOrders(symbol, update.price);
      }
    });

    this.activeSubscriptions.set(symbol, unsubscribe);
    console.log(`[OrderMonitor] Subscribed to ${symbol}`);
  }

  /**
   * Check if any pending orders should trigger at current price
   */
  async checkOrders(symbol, currentPrice) {
    const ordersToCheck = this.pendingOrders.filter(o => o.symbol === symbol);

    for (const order of ordersToCheck) {
      let shouldExecute = false;

      if (order.order_type === 'limit') {
        // Limit BUY (LONG): Execute when price <= limit_price
        if (order.direction === 'LONG' && currentPrice <= order.limit_price) {
          shouldExecute = true;
        }
        // Limit SHORT: Execute when price >= limit_price (not used for web, but handle)
        if (order.direction === 'SHORT' && currentPrice >= order.limit_price) {
          shouldExecute = true;
        }
      } else if (order.order_type === 'stop_limit' || order.order_type === 'stop-limit') {
        // Stop-limit BUY (LONG): Execute when price >= stop_price
        if (order.direction === 'LONG' && currentPrice >= order.stop_price) {
          shouldExecute = true;
        }
        // Stop-limit SHORT: Execute when price <= stop_price
        if (order.direction === 'SHORT' && currentPrice <= order.stop_price) {
          shouldExecute = true;
        }
      }

      if (shouldExecute) {
        console.log(`[OrderMonitor] Order ${order.id} triggered at ${currentPrice}`);
        await this.executeOrder(order, currentPrice);
      }
    }
  }

  /**
   * Execute a triggered pending order:
   * 1. INSERT into paper_trades with status='OPEN'
   * 2. UPDATE paper_pending_orders to 'FILLED'
   * 3. UPDATE user_paper_trade_settings balance
   */
  async executeOrder(order, executionPrice) {
    try {
      console.log(`[OrderMonitor] Executing order ${order.id}`, {
        symbol: order.symbol,
        direction: order.direction,
        quantity: order.quantity,
        executionPrice
      });

      // Remove from local pending list immediately to prevent double-execution
      this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);

      // 1. Mark pending order as FILLED (atomic guard on PENDING status)
      const { error: fillError } = await supabase
        .from('paper_pending_orders')
        .update({
          status: 'FILLED',
          filled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('status', 'PENDING');

      if (fillError) {
        console.error(`[OrderMonitor] Failed to fill order ${order.id}:`, fillError);
        return;
      }

      // 2. INSERT into paper_trades with status='OPEN'
      const totalValue = order.quantity * executionPrice;

      const { data: trade, error: tradeError } = await supabase
        .from('paper_trades')
        .insert([{
          user_id: order.user_id,
          symbol: order.symbol,
          direction: order.direction,
          side: order.direction === 'LONG' ? 'buy' : 'sell',
          status: 'OPEN',
          entry_price: executionPrice,
          price: executionPrice,
          quantity: order.quantity,
          position_size: totalValue,
          total_value: totalValue,
          margin: totalValue,
          position_value: totalValue,
          leverage: order.leverage || 1,
          order_type: order.order_type === 'limit' ? 'LIMIT' : 'STOP_LIMIT',
          trade_mode: 'custom',
          stop_loss: order.stop_loss || null,
          take_profit: order.take_profit || null,
          opened_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (tradeError) {
        console.error(`[OrderMonitor] Failed to create trade for order ${order.id}:`, tradeError);
        return;
      }

      // 3. Update balance — deduct cost (margin was already deducted at order time,
      //    but we need to adjust for actual execution price vs. limit price)
      const { data: settings } = await supabase
        .from('user_paper_trade_settings')
        .select('balance, total_trades')
        .eq('user_id', order.user_id)
        .single();

      if (settings) {
        // Balance was already deducted when the pending order was created.
        // If execution price differs from limit price, adjust the difference.
        const originalCost = (order.limit_price || order.stop_price) * order.quantity * (1 + TRADING_FEE_RATE);
        const actualCost = executionPrice * order.quantity * (1 + TRADING_FEE_RATE);
        const adjustment = originalCost - actualCost; // positive = we get money back

        await supabase
          .from('user_paper_trade_settings')
          .update({
            balance: settings.balance + adjustment,
            total_trades: (settings.total_trades || 0) + 1,
            last_trade_at: new Date().toISOString(),
          })
          .eq('user_id', order.user_id);
      }

      console.log(`[OrderMonitor] Order ${order.id} executed → trade ${trade.id} at ${executionPrice}`);

    } catch (error) {
      console.error(`[OrderMonitor] Failed to execute order ${order.id}:`, error);
    }
  }

  /**
   * Add a new pending order to monitor (called after creating a pending order)
   */
  addOrder(order) {
    if (order.status === 'PENDING' || order.status === 'pending') {
      this.pendingOrders.push(order);

      if (!this.activeSubscriptions.has(order.symbol)) {
        this.subscribeToPriceUpdates(order.symbol);
      }

      console.log(`[OrderMonitor] Added pending order ${order.id} for ${order.symbol}`);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    console.log('[OrderMonitor] Stopping monitoring');

    this.activeSubscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });

    this.activeSubscriptions.clear();
    this.pendingOrders = [];
    this.isMonitoring = false;
    this.userId = null;
  }
}

// Export singleton instance
export const orderMonitor = new OrderMonitor();

// Also export the class for testing
export { OrderMonitor };
