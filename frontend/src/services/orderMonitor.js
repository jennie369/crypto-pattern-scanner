/**
 * Order Monitor Service
 * Monitors pending orders and executes them when price conditions are met
 *
 * Features:
 * - Real-time monitoring via Binance WebSocket
 * - Auto-execution of limit and stop-limit orders
 * - OCO (One-Cancels-Other) logic for TP/SL orders
 * - Fallback to REST API if WebSocket disconnects
 */

import { supabase } from '../lib/supabaseClient';
import binanceWS from './binanceWebSocket';

/**
 * Helper function to update balance and holdings after order execution
 */
async function updateBalanceAndHoldings({
  userId,
  accountId,
  symbol,
  side,
  quantity,
  price,
  fee,
}) {
  console.log('💰 [updateBalanceAndHoldings] Called:', { userId, accountId, symbol, side, quantity, price, fee });

  // Get account
  const { data: account, error: accountError } = await supabase
    .from('paper_trading_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    throw new Error('Account not found');
  }

  const totalValue = quantity * price;

  if (side === 'buy') {
    // BUY: Deduct balance, add holdings
    const totalCost = totalValue + fee;
    const newBalance = account.balance - totalCost;

    // Update account balance
    await supabase
      .from('paper_trading_accounts')
      .update({
        balance: newBalance,
        total_trades: (account.total_trades || 0) + 1,
        last_trade_at: new Date().toISOString()
      })
      .eq('id', accountId);

    // Update holdings - check if exists
    const { data: existingHolding } = await supabase
      .from('paper_trading_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (existingHolding) {
      // Update existing holding - recalculate average price
      const newQuantity = existingHolding.quantity + quantity;
      const newTotalCost = existingHolding.total_cost + (quantity * price);
      const newAvgPrice = newTotalCost / newQuantity;

      await supabase
        .from('paper_trading_holdings')
        .update({
          quantity: newQuantity,
          avg_buy_price: newAvgPrice,
          total_cost: newTotalCost,
          current_price: price
        })
        .eq('id', existingHolding.id);
    } else {
      // Create new holding
      await supabase
        .from('paper_trading_holdings')
        .insert({
          user_id: userId,
          account_id: accountId,
          symbol: symbol.toUpperCase(),
          quantity,
          avg_buy_price: price,
          total_cost: quantity * price,
          current_price: price
        });
    }

    console.log('✅ [updateBalanceAndHoldings] BUY completed - Balance updated, holdings added');

  } else if (side === 'sell') {
    // SELL: Add balance (proceeds), reduce holdings
    const proceeds = totalValue - fee;

    // Get holding
    const { data: holding } = await supabase
      .from('paper_trading_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (!holding) {
      throw new Error('No holding found to sell');
    }

    // Calculate P&L
    const cost = quantity * holding.avg_buy_price;
    const pnl = proceeds - cost;
    const pnlPercentage = ((price - holding.avg_buy_price) / holding.avg_buy_price) * 100;
    const isWinningTrade = pnl > 0;

    // Update account balance and stats
    const newBalance = account.balance + proceeds;

    await supabase
      .from('paper_trading_accounts')
      .update({
        balance: newBalance,
        total_trades: (account.total_trades || 0) + 1,
        winning_trades: (account.winning_trades || 0) + (isWinningTrade ? 1 : 0),
        losing_trades: (account.losing_trades || 0) + (isWinningTrade ? 0 : 1),
        win_rate: (((account.winning_trades || 0) + (isWinningTrade ? 1 : 0)) / ((account.total_trades || 0) + 1)) * 100,
        realized_pnl: (account.realized_pnl || 0) + pnl,
        total_pnl: (account.total_pnl || 0) + pnl,
        best_trade: Math.max(account.best_trade || 0, pnl),
        worst_trade: Math.min(account.worst_trade || 0, pnl),
        last_trade_at: new Date().toISOString()
      })
      .eq('id', accountId);

    // Update or delete holding
    const newQuantity = holding.quantity - quantity;

    if (newQuantity <= 0) {
      // Delete holding
      await supabase
        .from('paper_trading_holdings')
        .delete()
        .eq('id', holding.id);
    } else {
      // Update holding
      const newTotalCost = holding.total_cost - (quantity * holding.avg_buy_price);

      await supabase
        .from('paper_trading_holdings')
        .update({
          quantity: newQuantity,
          total_cost: newTotalCost,
          current_price: price
        })
        .eq('id', holding.id);
    }

    console.log('✅ [updateBalanceAndHoldings] SELL completed - Balance updated, holdings reduced, P&L:', pnl);
  }
}

/**
 * OrderMonitor Class
 * Singleton service to monitor and execute pending orders
 */
class OrderMonitor {
  constructor() {
    this.activeSubscriptions = new Map();
    this.pendingOrders = [];
    this.isMonitoring = false;
    this.userId = null;
    this.accountId = null;
  }

  /**
   * Start monitoring orders for a user
   * @param {string} userId - User UUID
   * @param {string} accountId - Account UUID
   */
  async startMonitoring(userId, accountId) {
    if (this.isMonitoring && this.userId === userId) {
      console.log('🔍 [OrderMonitor] Already monitoring for this user');
      return;
    }

    this.userId = userId;
    this.accountId = accountId;
    this.isMonitoring = true;

    console.log('🔍 [OrderMonitor] Starting monitoring for user:', userId);

    // Fetch all pending orders
    await this.refreshPendingOrders();

    // Subscribe to price updates for each unique symbol
    const symbols = [...new Set(this.pendingOrders.map(o => o.symbol))];
    console.log(`📋 [OrderMonitor] Monitoring ${this.pendingOrders.length} pending orders across ${symbols.length} symbols`);

    symbols.forEach(symbol => {
      this.subscribeToPriceUpdates(symbol);
    });
  }

  /**
   * Refresh list of pending orders from database
   */
  async refreshPendingOrders() {
    if (!this.userId || !this.accountId) return;

    const { data: orders, error } = await supabase
      .from('paper_trading_orders')
      .select('*')
      .eq('user_id', this.userId)
      .eq('account_id', this.accountId)
      .eq('status', 'pending');

    if (error) {
      console.error('❌ [OrderMonitor] Failed to fetch pending orders:', error);
      return;
    }

    this.pendingOrders = orders || [];

    // Subscribe to new symbols if needed
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
   * @param {string} symbol - Trading pair
   */
  subscribeToPriceUpdates(symbol) {
    if (this.activeSubscriptions.has(symbol)) {
      return; // Already subscribed
    }

    const unsubscribe = binanceWS.subscribe(symbol, (update) => {
      if (update.price && update.price > 0) {
        this.checkOrders(symbol, update.price);
      }
    });

    this.activeSubscriptions.set(symbol, unsubscribe);
    console.log(`📡 [OrderMonitor] Subscribed to price updates for ${symbol}`);
  }

  /**
   * Check if any orders should be executed at current price
   * @param {string} symbol - Trading pair
   * @param {number} currentPrice - Current market price
   */
  async checkOrders(symbol, currentPrice) {
    const ordersToCheck = this.pendingOrders.filter(o => o.symbol === symbol);

    for (const order of ordersToCheck) {
      let shouldExecute = false;

      if (order.order_type === 'limit') {
        // Limit BUY: Execute when price <= limit_price
        // Limit SELL: Execute when price >= limit_price
        if (order.side === 'buy' && currentPrice <= order.limit_price) {
          shouldExecute = true;
        } else if (order.side === 'sell' && currentPrice >= order.limit_price) {
          shouldExecute = true;
        }
      } else if (order.order_type === 'stop-limit') {
        // Stop-limit BUY: Execute when price >= stop_price
        // Stop-limit SELL: Execute when price <= stop_price
        if (order.side === 'buy' && currentPrice >= order.stop_price) {
          shouldExecute = true;
        } else if (order.side === 'sell' && currentPrice <= order.stop_price) {
          shouldExecute = true;
        }
      }

      if (shouldExecute) {
        console.log(`🎯 [OrderMonitor] Order ${order.id} triggered at ${currentPrice}`);
        await this.executeOrder(order, currentPrice);
      }
    }
  }

  /**
   * Execute a pending order
   * @param {Object} order - Order object
   * @param {number} executionPrice - Price to execute at
   */
  async executeOrder(order, executionPrice) {
    try {
      console.log(`⚡ [OrderMonitor] Executing order ${order.id}`, {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        executionPrice
      });

      // Update order status to filled
      const { error: updateError } = await supabase
        .from('paper_trading_orders')
        .update({
          status: 'filled',
          price: executionPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`❌ [OrderMonitor] Failed to update order ${order.id}:`, updateError);
        return;
      }

      // Release reserved balance if this was a pending buy order
      if (order.side === 'buy') {
        const totalCost = order.total_value + order.fee;
        await supabase
          .from('paper_trading_accounts')
          .update({
            reserved_balance: Math.max(0, (order.reserved_balance || 0) - totalCost)
          })
          .eq('id', order.account_id);
      }

      // Update balance and holdings
      await updateBalanceAndHoldings({
        userId: order.user_id,
        accountId: order.account_id,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice,
        fee: order.fee,
      });

      // Remove from pending list
      this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);

      // If this was a TP/SL order, cancel the other linked order (OCO logic)
      if (order.linked_order_type && order.parent_order_id) {
        await this.cancelLinkedOrders(order.parent_order_id, order.id);
      }

      console.log(`✅ [OrderMonitor] Order ${order.id} executed successfully at ${executionPrice}`);

    } catch (error) {
      console.error(`❌ [OrderMonitor] Failed to execute order ${order.id}:`, error);
    }
  }

  /**
   * Cancel other TP/SL orders when one executes (OCO - One Cancels Other)
   * @param {string} parentOrderId - Parent order ID
   * @param {string} executedOrderId - ID of the order that was executed
   */
  async cancelLinkedOrders(parentOrderId, executedOrderId) {
    console.log(`🔗 [OrderMonitor] Cancelling linked orders for parent ${parentOrderId}`);

    const { data: cancelledOrders, error } = await supabase
      .from('paper_trading_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('parent_order_id', parentOrderId)
      .neq('id', executedOrderId)
      .eq('status', 'pending')
      .select();

    if (error) {
      console.error('❌ [OrderMonitor] Failed to cancel linked orders:', error);
    } else {
      console.log(`✅ [OrderMonitor] Cancelled ${cancelledOrders?.length || 0} linked orders`);

      // Remove cancelled orders from pending list
      const cancelledIds = cancelledOrders?.map(o => o.id) || [];
      this.pendingOrders = this.pendingOrders.filter(o => !cancelledIds.includes(o.id));
    }
  }

  /**
   * Add a new pending order to monitor
   * @param {Object} order - Order object
   */
  addOrder(order) {
    if (order.status === 'pending') {
      this.pendingOrders.push(order);

      // Subscribe to symbol if not already subscribed
      if (!this.activeSubscriptions.has(order.symbol)) {
        this.subscribeToPriceUpdates(order.symbol);
      }

      console.log(`➕ [OrderMonitor] Added new pending order ${order.id} for ${order.symbol}`);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    console.log('🛑 [OrderMonitor] Stopping monitoring');

    this.activeSubscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });

    this.activeSubscriptions.clear();
    this.pendingOrders = [];
    this.isMonitoring = false;
    this.userId = null;
    this.accountId = null;
  }
}

// Export singleton instance
export const orderMonitor = new OrderMonitor();

// Also export the class for testing
export { OrderMonitor };
