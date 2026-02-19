/**
 * Paper Trading Service — Unified Tables
 * Writes to mobile tables (user_paper_trade_settings, paper_trades, paper_pending_orders)
 * so the server cron monitors ALL trades (web + mobile).
 *
 * Web trades use: leverage=1, direction='LONG', trade_mode='custom'
 * Return adaptors shim legacy field names so UI components stay unchanged.
 *
 * Tier Access:
 * - FREE: Basic trading (10 trades/day, no stop orders)
 * - TIER1: Stop-loss/Take-profit + 50 trades/day
 * - TIER2: Performance analytics + unlimited trades
 * - TIER3: Advanced analytics + export data
 */

import { supabase } from '../lib/supabaseClient';
import binanceWS from './binanceWebSocket';

// Constants
const TRADING_FEE_RATE = 0.001; // 0.1% fee (Binance standard)
const INITIAL_BALANCE = 10000.00; // 10K USDT (matches mobile)

// ─────────────────────────────────────────────────────────────────────────────
// Return Adaptors — shim mobile columns → legacy web field names
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shim a paper_trades row to look like the old paper_trading_holdings shape.
 * UI reads: id, symbol, avg_buy_price, quantity, total_cost, current_price
 */
function adaptTradeToHolding(trade) {
  return {
    ...trade,
    avg_buy_price: trade.entry_price,
    total_cost: trade.margin || trade.position_size || (trade.entry_price * trade.quantity),
    current_price: trade.current_price || trade.entry_price,
    // Keep original fields too
    entry_price: trade.entry_price,
    margin: trade.margin,
  };
}

/**
 * Shim a paper_trades row to look like the old paper_trading_orders shape.
 * UI reads: id, symbol, side, price, quantity, realized_pnl, fee, status, created_at
 */
function adaptTradeToOrder(trade) {
  const isOpen = trade.status === 'OPEN';
  const isClosed = trade.status === 'CLOSED';
  const positionValue = isClosed
    ? (trade.exit_price || trade.entry_price) * trade.quantity
    : trade.entry_price * trade.quantity;

  return {
    ...trade,
    // Legacy field mappings
    side: isClosed ? 'sell' : 'buy',
    price: isClosed ? trade.exit_price : trade.entry_price,
    total_value: positionValue,
    fee: positionValue * TRADING_FEE_RATE,
    pnl: trade.realized_pnl || null,
    pnl_percentage: trade.realized_pnl_percent || null,
    realized_pnl: trade.realized_pnl || null,
    // Map status: OPEN/CLOSED → 'filled', CANCELLED → 'cancelled'
    status: (isOpen || isClosed) ? 'filled' : trade.status?.toLowerCase() || 'filled',
  };
}

/**
 * Shim a paper_pending_orders row to look like the old paper_trading_orders shape.
 */
function adaptPendingToOrder(pending) {
  const positionValue = (pending.limit_price || pending.stop_price || 0) * pending.quantity;
  return {
    ...pending,
    side: 'buy', // All web pending orders are buys (LONG)
    price: pending.limit_price || pending.stop_price,
    order_type: pending.order_type === 'stop_limit' ? 'stop-limit' : pending.order_type,
    total_value: positionValue,
    fee: positionValue * TRADING_FEE_RATE,
    pnl: null,
    pnl_percentage: null,
    realized_pnl: null,
    status: pending.status?.toLowerCase() || 'pending',
  };
}

/**
 * Shim user_paper_trade_settings → old paper_trading_accounts shape.
 */
function adaptSettingsToAccount(settings) {
  if (!settings) return null;
  return {
    ...settings,
    // Legacy field names
    winning_trades: settings.total_wins,
    losing_trades: settings.total_losses,
    realized_pnl: settings.total_realized_pnl || settings.total_pnl || 0,
    unrealized_pnl: 0, // Computed client-side from positions
    best_trade: 0,
    worst_trade: 0,
    avg_win: 0,
    avg_loss: 0,
    profit_factor: 0,
    reserved_balance: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier functions (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user's tier and expiration
 */
export async function getUserTier(userId) {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('scanner_tier, scanner_tier_expires_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user tier:', error);
    return { tier: 'FREE', expiresAt: null, isExpired: false };
  }

  const expiresAt = user.scanner_tier_expires_at;
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return {
    tier: isExpired ? 'FREE' : user.scanner_tier,
    expiresAt,
    isExpired
  };
}

/**
 * Validate user has required tier access
 */
export async function validateTierAccess(userId, requiredTiers) {
  const { tier } = await getUserTier(userId);
  return requiredTiers.includes(tier);
}

/**
 * Get daily trade limit based on tier
 */
export async function getDailyTradeLimit(userId) {
  const { tier } = await getUserTier(userId);

  const limits = {
    'FREE': 10,
    'TIER1': 50,
    'TIER2': 999999,
    'TIER3': 999999
  };

  return limits[tier] || 10;
}

/**
 * Check if user has reached daily trade limit
 * Counts from paper_trades (not the old paper_trading_orders)
 */
export async function checkDailyTradeLimit(userId) {
  const limit = await getDailyTradeLimit(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('paper_trades')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('Error checking trade limit:', error);
    return { allowed: true, remaining: limit, limit };
  }

  const todayTrades = count || 0;
  const remaining = Math.max(0, limit - todayTrades);

  return {
    allowed: todayTrades < limit,
    remaining,
    limit,
    used: todayTrades
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Account functions → user_paper_trade_settings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize paper trading account
 */
export async function initializeAccount(userId) {
  const { data: existing, error: checkError } = await supabase
    .from('user_paper_trade_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { success: true, account: adaptSettingsToAccount(existing), message: 'Account already exists' };
  }

  const { data: account, error } = await supabase
    .from('user_paper_trade_settings')
    .insert([{
      user_id: userId,
      balance: INITIAL_BALANCE,
      initial_balance: INITIAL_BALANCE
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating paper trading account:', error);
    return { success: false, error: error.message };
  }

  return { success: true, account: adaptSettingsToAccount(account), message: 'Account created successfully' };
}

/**
 * Get user's paper trading account
 */
export async function getAccount(userId) {
  const { data: settings, error } = await supabase
    .from('user_paper_trade_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return await initializeAccount(userId);
    }
    console.error('Error fetching account:', error);
    return { success: false, error: error.message };
  }

  return { success: true, account: adaptSettingsToAccount(settings) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Buy → INSERT paper_trades (market) or paper_pending_orders (limit/stop)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute buy order
 */
export async function executeBuy(userId, symbol, quantity, price, options = {}) {
  let params;
  if (typeof userId === 'object') {
    params = userId;
  } else {
    params = {
      userId,
      symbol,
      quantity,
      price,
      orderType: 'market',
      ...options
    };
  }

  const {
    userId: uid,
    symbol: sym,
    quantity: qty,
    price: currentPrice,
    orderType = 'market',
    limitPrice = null,
    stopPrice = null,
    timeInForce = 'GTC',
    reduceOnly = false,
    takeProfitPrice = null,
    stopLossPrice = null,
  } = params;

  console.log('[Paper Trading] executeBuy:', { uid, sym, qty, currentPrice, orderType });

  try {
    // Validate order type
    if (orderType === 'limit' && !limitPrice) {
      return { success: false, error: 'Limit price required for limit orders' };
    }
    if (orderType === 'stop-limit' && (!stopPrice || !limitPrice)) {
      return { success: false, error: 'Stop price and limit price required for stop-limit orders' };
    }

    // Check daily trade limit
    const tradeLimit = await checkDailyTradeLimit(uid);
    if (!tradeLimit.allowed) {
      const { tier } = await getUserTier(uid);
      return {
        success: false,
        error: `Daily trade limit reached (${tradeLimit.limit} trades/day for ${tier}). Upgrade to increase limit.`
      };
    }

    // Get account
    const { account } = await getAccount(uid);
    if (!account) {
      return { success: false, error: 'Paper trading account not found. Please contact support.' };
    }

    // Determine execution price
    let executionPrice;
    if (orderType === 'market') {
      executionPrice = currentPrice;
    } else {
      executionPrice = limitPrice;
    }

    // Calculate cost
    const totalValue = qty * executionPrice;
    const fee = totalValue * TRADING_FEE_RATE;
    const totalCost = totalValue + fee;

    // Check balance
    if (account.balance < totalCost) {
      return {
        success: false,
        error: `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${account.balance.toFixed(2)}`
      };
    }

    // ── MARKET ORDER: INSERT into paper_trades with status='OPEN' ──
    if (orderType === 'market') {
      const { data: trade, error: tradeError } = await supabase
        .from('paper_trades')
        .insert([{
          user_id: uid,
          symbol: sym.toUpperCase(),
          direction: 'LONG',
          side: 'buy',
          status: 'OPEN',
          entry_price: executionPrice,
          price: executionPrice,
          quantity: qty,
          position_size: totalValue,
          total_value: totalValue,
          margin: totalValue,       // leverage=1, so margin = full cost
          position_value: totalValue,
          leverage: 1,
          order_type: 'MARKET',
          trade_mode: 'custom',
          stop_loss: stopLossPrice || null,
          take_profit: takeProfitPrice || null,
          opened_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (tradeError) {
        console.error('[Paper Trading] Error creating trade:', tradeError);
        return { success: false, error: tradeError.message };
      }

      // Update balance & stats
      const newBalance = account.balance - totalCost;
      const { error: balanceError } = await supabase
        .from('user_paper_trade_settings')
        .update({
          balance: newBalance,
          total_trades: (account.total_trades || 0) + 1,
          last_trade_at: new Date().toISOString()
        })
        .eq('user_id', uid);

      if (balanceError) {
        console.error('[Paper Trading] Error updating balance:', balanceError);
        throw new Error(`Failed to update balance: ${balanceError.message}`);
      }

      // Return shimmed order shape for UI compatibility
      return {
        success: true,
        order: adaptTradeToOrder(trade),
        newBalance
      };
    }

    // ── LIMIT / STOP-LIMIT: INSERT into paper_pending_orders ──
    const { data: pendingOrder, error: pendingError } = await supabase
      .from('paper_pending_orders')
      .insert([{
        user_id: uid,
        symbol: sym.toUpperCase(),
        order_type: orderType === 'stop-limit' ? 'stop_limit' : orderType,
        direction: 'LONG',
        limit_price: limitPrice,
        stop_price: stopPrice || null,
        quantity: qty,
        position_size: totalValue,
        leverage: 1,
        initial_margin: totalValue,
        time_in_force: timeInForce,
        reduce_only: reduceOnly,
        take_profit: takeProfitPrice || null,
        stop_loss: stopLossPrice || null,
        status: 'PENDING',
      }])
      .select()
      .single();

    if (pendingError) {
      console.error('[Paper Trading] Error creating pending order:', pendingError);
      return { success: false, error: pendingError.message };
    }

    // Deduct balance for pending buy
    const newBalance = account.balance - totalCost;
    await supabase
      .from('user_paper_trade_settings')
      .update({ balance: newBalance })
      .eq('user_id', uid);

    return {
      success: true,
      order: adaptPendingToOrder(pendingOrder),
      newBalance
    };

  } catch (error) {
    console.error('[Paper Trading] Exception in executeBuy:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sell → UPDATE paper_trades SET status='CLOSED' (full close only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute sell order — closes an OPEN position fully
 */
export async function executeSell(userId, symbol, quantity, price, options = {}) {
  let params;
  if (typeof userId === 'object') {
    params = userId;
  } else {
    params = {
      userId,
      symbol,
      quantity,
      price,
      orderType: 'market',
      ...options
    };
  }

  const {
    userId: uid,
    symbol: sym,
    quantity: qty,
    price: currentPrice,
    orderType = 'market',
  } = params;

  console.log('[Paper Trading] executeSell:', { uid, sym, qty, currentPrice, orderType });

  try {
    // Check daily trade limit
    const tradeLimit = await checkDailyTradeLimit(uid);
    if (!tradeLimit.allowed) {
      const { tier } = await getUserTier(uid);
      return {
        success: false,
        error: `Daily trade limit reached (${tradeLimit.limit} trades/day for ${tier}). Upgrade to increase limit.`
      };
    }

    // Get account
    const { account } = await getAccount(uid);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Find OPEN position for this symbol
    const { data: trade, error: tradeError } = await supabase
      .from('paper_trades')
      .select('*')
      .eq('user_id', uid)
      .eq('symbol', sym.toUpperCase())
      .eq('status', 'OPEN')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (tradeError || !trade) {
      return { success: false, error: 'No open position found for this symbol' };
    }

    if (trade.quantity < qty) {
      return {
        success: false,
        error: `Insufficient holdings. Available: ${trade.quantity}, Requested: ${qty}`
      };
    }

    // Calculate P&L
    const executionPrice = currentPrice;
    const totalValue = qty * executionPrice;
    const fee = totalValue * TRADING_FEE_RATE;
    const proceeds = totalValue - fee;
    const cost = qty * trade.entry_price;
    const pnl = proceeds - cost;
    const pnlPercentage = ((executionPrice - trade.entry_price) / trade.entry_price) * 100;
    const result = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN';

    // Atomic close: UPDATE paper_trades WHERE id AND status='OPEN'
    const { data: closedTrade, error: closeError } = await supabase
      .from('paper_trades')
      .update({
        status: 'CLOSED',
        exit_price: executionPrice,
        realized_pnl: pnl,
        pnl: pnl,
        realized_pnl_percent: pnlPercentage,
        pnl_percent: pnlPercentage,
        result,
        exit_reason: 'manual_close',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', trade.id)
      .eq('status', 'OPEN')   // Atomic guard
      .select()
      .single();

    if (closeError) {
      console.error('[Paper Trading] Error closing trade:', closeError);
      return { success: false, error: closeError.message };
    }

    // Update account balance + stats
    const isWinningTrade = pnl > 0;
    const newBalance = account.balance + proceeds;
    const newTotalTrades = (account.total_trades || 0) + 1;
    const newWins = (account.winning_trades || 0) + (isWinningTrade ? 1 : 0);
    const newLosses = (account.losing_trades || 0) + (isWinningTrade ? 0 : 1);

    const { error: balanceError } = await supabase
      .from('user_paper_trade_settings')
      .update({
        balance: newBalance,
        total_trades: newTotalTrades,
        total_wins: newWins,
        total_losses: newLosses,
        win_rate: newTotalTrades > 0 ? (newWins / newTotalTrades) * 100 : 0,
        total_pnl: (account.realized_pnl || 0) + pnl,
        total_realized_pnl: (account.realized_pnl || 0) + pnl,
        last_trade_at: new Date().toISOString()
      })
      .eq('user_id', uid);

    if (balanceError) {
      console.error('[Paper Trading] Error updating balance:', balanceError);
      throw new Error(`Failed to update balance: ${balanceError.message}`);
    }

    return {
      success: true,
      order: adaptTradeToOrder(closedTrade),
      newBalance,
      pnl,
      pnlPercentage
    };

  } catch (error) {
    console.error('[Paper Trading] Exception in executeSell:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Holdings → paper_trades WHERE status='OPEN'
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user's holdings (open positions) with real-time prices
 */
export async function getHoldings(userId) {
  const { data: trades, error } = await supabase
    .from('paper_trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }

  // Enrich with real-time prices + shim to holding shape
  const enriched = (trades || []).map(trade => {
    const cached = binanceWS.getCurrentPrice(trade.symbol);
    const currentPrice = cached ? cached.price : trade.entry_price;
    const totalCost = trade.margin || trade.position_size || (trade.entry_price * trade.quantity);
    const currentValue = trade.quantity * currentPrice;
    const unrealizedPnl = currentValue - totalCost;
    const pnlPercentage = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

    return {
      ...adaptTradeToHolding(trade),
      current_price: currentPrice,
      current_value: currentValue,
      unrealized_pnl: unrealizedPnl,
      pnl_percentage: pnlPercentage
    };
  });

  return enriched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders → paper_trades (all statuses) + paper_pending_orders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get order history
 */
export async function getOrders(userId, limit = 50, filters = {}) {
  // Fetch completed trades
  let tradesQuery = supabase
    .from('paper_trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.symbol) {
    tradesQuery = tradesQuery.eq('symbol', filters.symbol.toUpperCase());
  }
  if (filters.dateFrom) {
    tradesQuery = tradesQuery.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    tradesQuery = tradesQuery.lte('created_at', filters.dateTo);
  }

  // Fetch pending orders
  let pendingQuery = supabase
    .from('paper_pending_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters.symbol) {
    pendingQuery = pendingQuery.eq('symbol', filters.symbol.toUpperCase());
  }

  const [tradesResult, pendingResult] = await Promise.all([
    tradesQuery,
    pendingQuery,
  ]);

  if (tradesResult.error) {
    console.error('Error fetching trades:', tradesResult.error);
  }
  if (pendingResult.error) {
    console.error('Error fetching pending orders:', pendingResult.error);
  }

  const trades = (tradesResult.data || []).map(adaptTradeToOrder);
  const pending = (pendingResult.data || []).map(adaptPendingToOrder);

  // Merge, sort by created_at desc, apply limit
  const all = [...trades, ...pending]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  // Apply side filter after adaptor mapping
  if (filters.side) {
    return all.filter(o => o.side === filters.side);
  }

  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// Position management → direct UPDATE on paper_trades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Close a position by its ID
 */
export async function closePosition(holdingId, userId) {
  console.log('[closePosition] Closing position:', holdingId);

  try {
    // Fetch the OPEN trade
    const { data: trade, error: fetchError } = await supabase
      .from('paper_trades')
      .select('*')
      .eq('id', holdingId)
      .eq('user_id', userId)
      .eq('status', 'OPEN')
      .single();

    if (fetchError || !trade) {
      throw new Error('Position not found');
    }

    // Get current market price
    let currentPrice = 0;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const priceResponse = await fetch(
        `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${trade.symbol}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      const priceData = await priceResponse.json();
      currentPrice = parseFloat(priceData.price);
    } catch (err) {
      // Fallback to spot API
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const spotResponse = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${trade.symbol}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const spotData = await spotResponse.json();
        currentPrice = parseFloat(spotData.price);
      } catch (spotErr) {
        throw new Error('Unable to fetch current price');
      }
    }

    if (!currentPrice || currentPrice <= 0) {
      throw new Error('Unable to fetch current price');
    }

    // Execute sell to close the position
    const result = await executeSell(
      userId,
      trade.symbol,
      trade.quantity,
      currentPrice,
      { orderType: 'market' }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to close position');
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('[closePosition] Error:', error);
    throw error;
  }
}

/**
 * Update a position (TP/SL fields on paper_trades)
 */
export async function updatePosition(holdingId, updates) {
  try {
    // Map legacy field names to paper_trades columns
    const mappedUpdates = {};
    if ('stop_loss' in updates) mappedUpdates.stop_loss = updates.stop_loss;
    if ('take_profit' in updates) mappedUpdates.take_profit = updates.take_profit;
    if ('stopLoss' in updates) mappedUpdates.stop_loss = updates.stopLoss;
    if ('takeProfit' in updates) mappedUpdates.take_profit = updates.takeProfit;
    // Pass through any other valid paper_trades columns
    for (const key of ['stop_loss', 'take_profit', 'quantity']) {
      if (key in updates && !(key in mappedUpdates)) {
        mappedUpdates[key] = updates[key];
      }
    }
    mappedUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('paper_trades')
      .update(mappedUpdates)
      .eq('id', holdingId)
      .eq('status', 'OPEN');

    if (error) {
      console.error('Error updating position:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating position:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel order → UPDATE paper_pending_orders + return margin
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel a pending order and return reserved balance
 */
export async function cancelOrder({ userId, orderId }) {
  console.log('[cancelOrder] Cancelling order:', { userId, orderId });

  try {
    // Get order details from paper_pending_orders
    const { data: order, error: fetchError } = await supabase
      .from('paper_pending_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      console.error('[cancelOrder] Order not found:', fetchError);
      return { success: false, error: 'Order not found or access denied' };
    }

    if (order.status !== 'PENDING') {
      return {
        success: false,
        error: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`
      };
    }

    // Cancel the pending order
    const { error: cancelError } = await supabase
      .from('paper_pending_orders')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'PENDING');  // Atomic guard

    if (cancelError) {
      console.error('[cancelOrder] Failed to cancel order:', cancelError);
      return { success: false, error: cancelError.message };
    }

    // Return reserved margin to balance
    const marginToReturn = order.initial_margin || order.position_size || (
      (order.limit_price || order.stop_price || 0) * order.quantity * (1 + TRADING_FEE_RATE)
    );

    if (marginToReturn > 0) {
      const { data: settings } = await supabase
        .from('user_paper_trade_settings')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (settings) {
        await supabase
          .from('user_paper_trade_settings')
          .update({
            balance: settings.balance + marginToReturn
          })
          .eq('user_id', userId);

        console.log('[cancelOrder] Returned margin:', marginToReturn);
      }
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      cancelledOrderId: orderId,
      linkedOrdersCancelled: 0,
    };

  } catch (error) {
    console.error('[cancelOrder] Exception:', error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance data → paper_trades WHERE status='CLOSED'
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get performance data (TIER2+ only)
 */
export async function getPerformanceData(userId, period = 'all') {
  const hasAccess = await validateTierAccess(userId, ['TIER2', 'TIER3']);
  if (!hasAccess) {
    return {
      success: false,
      error: 'Performance analytics require TIER2 or higher. Please upgrade your subscription.'
    };
  }

  const now = new Date();
  let dateFrom;

  switch (period) {
    case 'day':
      dateFrom = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      dateFrom = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      dateFrom = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      dateFrom = null;
  }

  let query = supabase
    .from('paper_trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'CLOSED')
    .order('closed_at', { ascending: false });

  if (dateFrom) {
    query = query.gte('closed_at', dateFrom.toISOString());
  }

  const { data: closedTrades, error } = await query;

  if (error) {
    console.error('Error fetching performance data:', error);
    return { success: false, error: error.message };
  }

  const trades = closedTrades || [];
  const winningTrades = trades.filter(t => t.result === 'WIN');
  const losingTrades = trades.filter(t => t.result !== 'WIN');

  const totalPnl = trades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.realized_pnl || 0)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.realized_pnl || 0)) : 0;

  return {
    success: true,
    data: {
      totalTrades: trades.length,
      sellOrders: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnl,
      bestTrade,
      worstTrade,
      orders: trades.slice(0, 10).map(adaptTradeToOrder),
      period
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset → RPC reset_paper_trade_account + delete paper_pending_orders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reset account
 */
export async function resetAccount(userId) {
  try {
    // Use RPC to reset paper trades + settings
    const { data: settings, error: rpcError } = await supabase
      .rpc('reset_paper_trade_account', {
        p_user_id: userId,
        p_initial_balance: INITIAL_BALANCE
      });

    if (rpcError) {
      console.error('Error resetting account via RPC:', rpcError);
      return { success: false, error: rpcError.message };
    }

    // Also delete pending orders
    await supabase
      .from('paper_pending_orders')
      .delete()
      .eq('user_id', userId);

    return { success: true, message: 'Account reset successfully' };

  } catch (error) {
    console.error('Error resetting account:', error);
    return { success: false, error: error.message };
  }
}
