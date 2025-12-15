/**
 * Paper Trading Service
 * Manages virtual trading with tier-based access control
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
const INITIAL_BALANCE = 100000.00; // 100K USDT

/**
 * Get user's tier and expiration
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} { tier, expiresAt, isExpired }
 */
export async function getUserTier(userId) {
  const { data: user, error } = await supabase
    .from('users')
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
 * @param {string} userId - User UUID
 * @param {string[]} requiredTiers - Array of allowed tiers (e.g., ['TIER1', 'TIER2', 'TIER3'])
 * @returns {Promise<boolean>} True if user has access
 */
export async function validateTierAccess(userId, requiredTiers) {
  const { tier } = await getUserTier(userId);
  return requiredTiers.includes(tier);
}

/**
 * Get daily trade limit based on tier
 * @param {string} userId - User UUID
 * @returns {Promise<number>} Daily trade limit
 */
export async function getDailyTradeLimit(userId) {
  const { tier } = await getUserTier(userId);

  const limits = {
    'FREE': 10,
    'TIER1': 50,
    'TIER2': 999999, // Unlimited
    'TIER3': 999999  // Unlimited
  };

  return limits[tier] || 10;
}

/**
 * Check if user has reached daily trade limit
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} { allowed, remaining, limit }
 */
export async function checkDailyTradeLimit(userId) {
  const limit = await getDailyTradeLimit(userId);

  // Get today's trade count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('paper_trading_orders')
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

/**
 * Initialize paper trading account for user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Account data
 */
export async function initializeAccount(userId) {
  // Check if account already exists
  const { data: existing, error: checkError } = await supabase
    .from('paper_trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { success: true, account: existing, message: 'Account already exists' };
  }

  // Create new account
  const { data: account, error } = await supabase
    .from('paper_trading_accounts')
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

  return { success: true, account, message: 'Account created successfully' };
}

/**
 * Get user's paper trading account
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Account data
 */
export async function getAccount(userId) {
  const { data: account, error } = await supabase
    .from('paper_trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Account doesn't exist, create it
      return await initializeAccount(userId);
    }
    console.error('Error fetching account:', error);
    return { success: false, error: error.message };
  }

  return { success: true, account };
}

/**
 * Execute buy order
 * @param {Object} params - Order parameters
 * @param {string} params.userId - User UUID
 * @param {string} params.symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {number} params.quantity - Amount to buy
 * @param {number} params.price - Current market price
 * @param {string} params.orderType - 'market', 'limit', or 'stop-limit'
 * @param {number} params.limitPrice - Limit price (for limit/stop-limit orders)
 * @param {number} params.stopPrice - Stop trigger price (for stop-limit orders)
 * @param {string} params.timeInForce - 'GTC', 'IOC', or 'FOK'
 * @param {boolean} params.reduceOnly - Only reduce existing position
 * @param {number} params.takeProfitPrice - Take profit target price
 * @param {number} params.stopLossPrice - Stop loss trigger price
 * @returns {Promise<Object>} Order result
 */
export async function executeBuy(userId, symbol, quantity, price, options = {}) {
  // Support both old signature (positional) and new signature (object)
  let params;
  if (typeof userId === 'object') {
    // New signature: executeBuy({ userId, symbol, ... })
    params = userId;
  } else {
    // Old signature: executeBuy(userId, symbol, quantity, price)
    // Convert to new format for backward compatibility
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

  console.log('🔵 [Paper Trading Service] executeBuy called:', {
    userId: uid,
    symbol: sym,
    quantity: qty,
    price: currentPrice,
    orderType,
    limitPrice,
    stopPrice,
    timeInForce,
    reduceOnly,
    takeProfitPrice,
    stopLossPrice,
  });

  try {
    // Validate order type specific requirements
    if (orderType === 'limit' && !limitPrice) {
      return { success: false, error: 'Limit price required for limit orders' };
    }
    if (orderType === 'stop-limit' && (!stopPrice || !limitPrice)) {
      return { success: false, error: 'Stop price and limit price required for stop-limit orders' };
    }

    // Check daily trade limit
    console.log('📊 [Paper Trading Service] Checking daily trade limit...');
    const tradeLimit = await checkDailyTradeLimit(uid);
    console.log('📊 [Paper Trading Service] Trade limit result:', tradeLimit);

    if (!tradeLimit.allowed) {
      const { tier } = await getUserTier(uid);
      const errorMsg = `Daily trade limit reached (${tradeLimit.limit} trades/day for ${tier}). Upgrade to increase limit.`;
      console.error('❌ [Paper Trading Service] Trade limit exceeded:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }

    // Get account
    console.log('📊 [Paper Trading Service] Fetching account for userId:', uid);
    const { account } = await getAccount(uid);
    console.log('📊 [Paper Trading Service] Account data:', account);

    if (!account) {
      console.error('❌ [Paper Trading Service] Account not found for userId:', uid);
      return { success: false, error: 'Paper trading account not found. Please contact support.' };
    }

    if (!account.id) {
      console.error('❌ [Paper Trading Service] Account missing ID:', account);
      return { success: false, error: 'Invalid account data' };
    }

    console.log('✅ [Paper Trading Service] Account validated:', {
      accountId: account.id,
      balance: account.balance
    });

    // Determine execution price and status based on order type
    let executionPrice;
    let orderStatus;

    if (orderType === 'market') {
      executionPrice = currentPrice;
      orderStatus = 'filled'; // Market orders execute immediately
    } else if (orderType === 'limit') {
      executionPrice = limitPrice;
      orderStatus = 'pending'; // Wait for price to reach limit
    } else if (orderType === 'stop-limit') {
      executionPrice = limitPrice;
      orderStatus = 'pending'; // Wait for price to hit stop, then place limit order
    }

    // Calculate total cost
    const totalValue = qty * executionPrice;
    const fee = totalValue * TRADING_FEE_RATE;
    const totalCost = totalValue + fee;

    console.log('💰 [Paper Trading Service] Trade calculation:', {
      orderType,
      executionPrice,
      orderStatus,
      totalValue,
      fee,
      totalCost,
      currentBalance: account.balance
    });

    // Check sufficient balance
    if (account.balance < totalCost) {
      const errorMsg = `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${account.balance.toFixed(2)}`;
      console.error('❌ [Paper Trading Service] Insufficient balance:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }

    // Create order
    console.log('📝 [Paper Trading Service] Creating buy order in database...');
    const { data: order, error: orderError } = await supabase
      .from('paper_trading_orders')
      .insert([{
        user_id: uid,
        account_id: account.id,
        symbol: sym.toUpperCase(),
        side: 'buy',
        order_type: orderType,
        quantity: qty,
        price: executionPrice,
        limit_price: limitPrice,
        stop_price: stopPrice,
        time_in_force: timeInForce,
        reduce_only: reduceOnly,
        total_value: totalValue,
        fee,
        status: orderStatus,
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ [Paper Trading Service] Database error creating buy order:', orderError);
      return { success: false, error: orderError.message };
    }

    console.log('✅ [Paper Trading Service] Buy order created:', order);

    // Only update balance and holdings for market orders (filled immediately)
    // Pending orders will be updated when they execute
    if (orderType === 'market') {
      // Update account balance
      const newBalance = account.balance - totalCost;
      console.log('💰 [Paper Trading Service] Updating account balance to:', newBalance);

      const { error: balanceError } = await supabase
        .from('paper_trading_accounts')
        .update({
          balance: newBalance,
          total_trades: (account.total_trades || 0) + 1,
          last_trade_at: new Date().toISOString()
        })
        .eq('id', account.id);

      if (balanceError) {
        console.error('❌ [Paper Trading Service] Error updating account balance:', balanceError);
        throw new Error(`Failed to update balance: ${balanceError.message || JSON.stringify(balanceError)}`);
      }

      console.log('✅ [Paper Trading Service] Account balance updated successfully');

      // Update holdings
      console.log('📦 [Paper Trading Service] Updating holdings...');
      await updateHoldings(uid, account.id, sym, qty, executionPrice, 'buy');
      console.log('✅ [Paper Trading Service] Holdings updated');
    } else {
      // For pending orders, reserve balance
      const { error: reserveError } = await supabase
        .from('paper_trading_accounts')
        .update({
          reserved_balance: (account.reserved_balance || 0) + totalCost
        })
        .eq('id', account.id);

      if (reserveError) {
        console.error('❌ [Paper Trading Service] Error reserving balance:', reserveError);
      } else {
        console.log('💰 [Paper Trading Service] Balance reserved for pending order:', totalCost);
      }
    }

    // Create TP/SL orders if specified
    if (takeProfitPrice && takeProfitPrice > executionPrice) {
      console.log('📈 [Paper Trading Service] Creating TP order...');
      await createTPOrder({
        userId: uid,
        accountId: account.id,
        symbol: sym,
        quantity: qty,
        takeProfitPrice,
        parentOrderId: order.id,
      });
    }

    if (stopLossPrice && stopLossPrice < executionPrice) {
      console.log('📉 [Paper Trading Service] Creating SL order...');
      await createSLOrder({
        userId: uid,
        accountId: account.id,
        symbol: sym,
        quantity: qty,
        stopLossPrice,
        parentOrderId: order.id,
      });
    }

    console.log('✅ [Paper Trading Service] Buy order completed successfully');
    return { success: true, order, newBalance: account.balance - (orderType === 'market' ? totalCost : 0) };

  } catch (error) {
    console.error('❌ [Paper Trading Service] Exception in executeBuy:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute sell order
 * @param {Object} params - Order parameters (same as executeBuy)
 * @returns {Promise<Object>} Order result
 */
export async function executeSell(userId, symbol, quantity, price, options = {}) {
  // Support both old signature (positional) and new signature (object)
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

  console.log('🔵 [Paper Trading Service] executeSell called:', {
    userId: uid,
    symbol: sym,
    quantity: qty,
    price: currentPrice,
    orderType,
    limitPrice,
    stopPrice,
  });

  try {
    // Validate order type specific requirements
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
      return { success: false, error: 'Account not found' };
    }

    // Check holdings
    const { data: holding, error: holdingError } = await supabase
      .from('paper_trading_holdings')
      .select('*')
      .eq('user_id', uid)
      .eq('symbol', sym.toUpperCase())
      .single();

    if (holdingError || !holding) {
      return { success: false, error: 'No holdings found for this symbol' };
    }

    if (holding.quantity < qty) {
      return {
        success: false,
        error: `Insufficient holdings. Available: ${holding.quantity}, Requested: ${qty}`
      };
    }

    // Determine execution price and status
    let executionPrice;
    let orderStatus;

    if (orderType === 'market') {
      executionPrice = currentPrice;
      orderStatus = 'filled';
    } else if (orderType === 'limit') {
      executionPrice = limitPrice;
      orderStatus = 'pending';
    } else if (orderType === 'stop-limit') {
      executionPrice = limitPrice;
      orderStatus = 'pending';
    }

    // Calculate P&L (only for market orders)
    const totalValue = qty * executionPrice;
    const fee = totalValue * TRADING_FEE_RATE;
    const proceeds = totalValue - fee;
    const cost = qty * holding.avg_buy_price;
    const pnl = proceeds - cost;
    const pnlPercentage = ((executionPrice - holding.avg_buy_price) / holding.avg_buy_price) * 100;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('paper_trading_orders')
      .insert([{
        user_id: uid,
        account_id: account.id,
        symbol: sym.toUpperCase(),
        side: 'sell',
        order_type: orderType,
        quantity: qty,
        price: executionPrice,
        limit_price: limitPrice,
        stop_price: stopPrice,
        time_in_force: timeInForce,
        reduce_only: reduceOnly,
        total_value: totalValue,
        fee,
        pnl: orderType === 'market' ? pnl : null,
        pnl_percentage: orderType === 'market' ? pnlPercentage : null,
        status: orderStatus
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ [executeSell] Error creating sell order:', orderError);
      return { success: false, error: orderError.message };
    }

    console.log('✅ [executeSell] Sell order created:', order);

    // Only update balance and holdings for market orders
    if (orderType === 'market') {
      const newBalance = account.balance + proceeds;
      const isWinningTrade = pnl > 0;

      const { error: balanceError } = await supabase
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
        .eq('id', account.id);

      if (balanceError) {
        console.error('❌ [executeSell] Error updating account balance:', balanceError);
        throw new Error(`Failed to update balance: ${balanceError.message}`);
      }

      // Update holdings
      await updateHoldings(uid, account.id, sym, qty, executionPrice, 'sell');
      console.log('✅ [executeSell] Holdings updated, P&L:', pnl);
    }

    // Create TP/SL orders if specified (for sell orders, TP is lower, SL is higher)
    if (takeProfitPrice && takeProfitPrice < executionPrice) {
      console.log('📈 [executeSell] Creating TP order...');
      await createTPOrder({
        userId: uid,
        accountId: account.id,
        symbol: sym,
        quantity: qty,
        takeProfitPrice,
        parentOrderId: order.id,
      });
    }

    if (stopLossPrice && stopLossPrice > executionPrice) {
      console.log('📉 [executeSell] Creating SL order...');
      await createSLOrder({
        userId: uid,
        accountId: account.id,
        symbol: sym,
        quantity: qty,
        stopLossPrice,
        parentOrderId: order.id,
      });
    }

    return {
      success: true,
      order,
      newBalance: account.balance + (orderType === 'market' ? proceeds : 0),
      pnl: orderType === 'market' ? pnl : null,
      pnlPercentage: orderType === 'market' ? pnlPercentage : null
    };

  } catch (error) {
    console.error('❌ [executeSell] Exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update holdings after trade
 * @param {string} userId - User UUID
 * @param {string} accountId - Account UUID
 * @param {string} symbol - Trading pair
 * @param {number} quantity - Trade quantity
 * @param {number} price - Trade price
 * @param {string} side - 'buy' or 'sell'
 */
async function updateHoldings(userId, accountId, symbol, quantity, price, side) {
  console.log('📦 [Update Holdings] Called with:', { userId, accountId, symbol, quantity, price, side });

  const { data: holding, error: fetchError } = await supabase
    .from('paper_trading_holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('symbol', symbol.toUpperCase())
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is OK for new holdings
    console.error('❌ [Update Holdings] Fetch error:', fetchError);
  }

  console.log('📦 [Update Holdings] Existing holding:', holding);

  if (side === 'buy') {
    if (holding) {
      // Update existing holding
      const newQuantity = holding.quantity + quantity;
      const newTotalCost = holding.total_cost + (quantity * price);
      const newAvgPrice = newTotalCost / newQuantity;

      console.log('📦 [Update Holdings] Updating existing holding:', {
        oldQuantity: holding.quantity,
        newQuantity,
        newAvgPrice
      });

      const { error: updateError } = await supabase
        .from('paper_trading_holdings')
        .update({
          quantity: newQuantity,
          avg_buy_price: newAvgPrice,
          total_cost: newTotalCost,
          current_price: price
        })
        .eq('id', holding.id);

      if (updateError) {
        console.error('❌ [Update Holdings] Update failed:', updateError);
        throw new Error(`Failed to update holding: ${updateError.message}`);
      }

      console.log('✅ [Update Holdings] Holding updated successfully');
    } else {
      // Create new holding
      console.log('📦 [Update Holdings] Creating new holding');

      const { error: insertError } = await supabase
        .from('paper_trading_holdings')
        .insert([{
          user_id: userId,
          account_id: accountId,
          symbol: symbol.toUpperCase(),
          quantity,
          avg_buy_price: price,
          total_cost: quantity * price,
          current_price: price
        }]);

      if (insertError) {
        console.error('❌ [Update Holdings] Insert failed:', insertError);
        throw new Error(`Failed to create holding: ${insertError.message}`);
      }

      console.log('✅ [Update Holdings] Holding created successfully');
    }
  } else if (side === 'sell' && holding) {
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
  }
}

/**
 * Update a position (holding)
 * @param {string} holdingId - Holding ID
 * @param {Object} updates - Fields to update (stop_loss, take_profit, etc.)
 * @returns {Promise<Object>} Update result
 */
export async function updatePosition(holdingId, updates) {
  try {
    const { error } = await supabase
      .from('paper_trading_holdings')
      .update(updates)
      .eq('id', holdingId);

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

/**
 * Get user's holdings with real-time prices
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Holdings array
 */
export async function getHoldings(userId) {
  const { data: holdings, error } = await supabase
    .from('paper_trading_holdings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }

  // Enrich with real-time prices
  const enriched = holdings.map(holding => {
    const cached = binanceWS.getCurrentPrice(holding.symbol);
    const currentPrice = cached ? cached.price : holding.current_price;
    const currentValue = holding.quantity * currentPrice;
    const unrealizedPnl = currentValue - holding.total_cost;
    const pnlPercentage = (unrealizedPnl / holding.total_cost) * 100;

    return {
      ...holding,
      current_price: currentPrice,
      current_value: currentValue,
      unrealized_pnl: unrealizedPnl,
      pnl_percentage: pnlPercentage
    };
  });

  return enriched;
}

/**
 * Get order history
 * @param {string} userId - User UUID
 * @param {number} limit - Number of orders to fetch
 * @param {Object} filters - { symbol, side, dateFrom, dateTo }
 * @returns {Promise<Array>} Orders array
 */
export async function getOrders(userId, limit = 50, filters = {}) {
  let query = supabase
    .from('paper_trading_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Apply filters
  if (filters.symbol) {
    query = query.eq('symbol', filters.symbol.toUpperCase());
  }
  if (filters.side) {
    query = query.eq('side', filters.side);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return orders;
}

/**
 * Close a position by selling all holdings
 * @param {number} holdingId - Holding ID to close
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Close position result
 */
export async function closePosition(holdingId, userId) {
  console.log('🔴 [closePosition] Closing position:', holdingId);

  try {
    // Fetch holding details
    const { data: holding, error: fetchError } = await supabase
      .from('paper_trading_holdings')
      .select('*')
      .eq('id', holdingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !holding) {
      throw new Error('Position not found');
    }

    console.log('📊 [closePosition] Holding found:', holding);

    // Get current market price from Binance Futures API (better CORS support)
    let currentPrice = 0;
    try {
      const priceResponse = await fetch(
        `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${holding.symbol}`
      );
      const priceData = await priceResponse.json();
      currentPrice = parseFloat(priceData.price);
    } catch (err) {
      // Fallback to spot API if futures fails
      const spotResponse = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${holding.symbol}`
      );
      const spotData = await spotResponse.json();
      currentPrice = parseFloat(spotData.price);
    }

    if (!currentPrice || currentPrice <= 0) {
      throw new Error('Unable to fetch current price');
    }

    console.log('💰 [closePosition] Current price:', currentPrice);

    // Execute SELL order to close position
    const result = await executeSell(
      userId,
      holding.symbol,
      holding.quantity,
      currentPrice,
      {
        orderType: 'market'
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to close position');
    }

    console.log('✅ [closePosition] Position closed successfully');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ [closePosition] Error:', error);
    throw error;
  }
}

/**
 * Create stop order (TIER1+ only)
 * @param {string} userId - User UUID
 * @param {string} symbol - Trading pair
 * @param {string} orderType - 'stop_loss' or 'take_profit'
 * @param {number} triggerPrice - Price to trigger at
 * @param {number} quantity - Amount to sell
 * @returns {Promise<Object>} Stop order result
 */
export async function createStopOrder(userId, symbol, orderType, triggerPrice, quantity) {
  // Tier gate: TIER1+
  const hasAccess = await validateTierAccess(userId, ['TIER1', 'TIER2', 'TIER3']);
  if (!hasAccess) {
    return {
      success: false,
      error: 'Stop orders require TIER1 or higher. Please upgrade your subscription.'
    };
  }

  try {
    const { account } = await getAccount(userId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Verify holding exists
    const { data: holding, error: holdingError } = await supabase
      .from('paper_trading_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (holdingError || !holding) {
      return { success: false, error: 'No holdings found for this symbol' };
    }

    if (holding.quantity < quantity) {
      return { success: false, error: 'Insufficient holdings for stop order' };
    }

    // Create stop order
    const { data: stopOrder, error } = await supabase
      .from('paper_trading_stop_orders')
      .insert([{
        user_id: userId,
        account_id: account.id,
        holding_id: holding.id,
        symbol: symbol.toUpperCase(),
        order_type: orderType,
        trigger_price: triggerPrice,
        quantity,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating stop order:', error);
      return { success: false, error: error.message };
    }

    return { success: true, stopOrder };

  } catch (error) {
    console.error('Error creating stop order:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a Take Profit order linked to parent order
 * @param {Object} params - TP order parameters
 * @returns {Promise<Object>} TP order result
 */
export async function createTPOrder({
  userId,
  accountId,
  symbol,
  quantity,
  takeProfitPrice,
  parentOrderId,
}) {
  console.log('📈 [createTPOrder] Creating TP order:', {
    symbol,
    quantity,
    takeProfitPrice,
    parentOrderId,
  });

  try {
    // Get parent order to determine side
    const { data: parentOrder, error: parentError } = await supabase
      .from('paper_trading_orders')
      .select('side')
      .eq('id', parentOrderId)
      .single();

    if (parentError || !parentOrder) {
      console.error('❌ [createTPOrder] Parent order not found:', parentError);
      return { success: false, error: 'Parent order not found' };
    }

    // For BUY parent: TP is a SELL limit order at higher price
    // For SELL parent: TP is a BUY limit order at lower price
    const tpSide = parentOrder.side === 'buy' ? 'sell' : 'buy';

    const totalValue = quantity * takeProfitPrice;
    const fee = totalValue * TRADING_FEE_RATE;

    const { data: tpOrder, error } = await supabase
      .from('paper_trading_orders')
      .insert({
        user_id: userId,
        account_id: accountId,
        symbol: symbol.toUpperCase(),
        side: tpSide,
        order_type: 'limit',
        quantity,
        price: takeProfitPrice,
        limit_price: takeProfitPrice,
        status: 'pending',
        parent_order_id: parentOrderId,
        linked_order_type: 'TP',
        total_value: totalValue,
        fee,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [createTPOrder] Failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [createTPOrder] TP order created:', tpOrder);
    return { success: true, tpOrder };
  } catch (error) {
    console.error('❌ [createTPOrder] Exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a Stop Loss order linked to parent order
 * @param {Object} params - SL order parameters
 * @returns {Promise<Object>} SL order result
 */
export async function createSLOrder({
  userId,
  accountId,
  symbol,
  quantity,
  stopLossPrice,
  parentOrderId,
}) {
  console.log('📉 [createSLOrder] Creating SL order:', {
    symbol,
    quantity,
    stopLossPrice,
    parentOrderId,
  });

  try {
    // Get parent order to determine side
    const { data: parentOrder, error: parentError } = await supabase
      .from('paper_trading_orders')
      .select('side')
      .eq('id', parentOrderId)
      .single();

    if (parentError || !parentOrder) {
      console.error('❌ [createSLOrder] Parent order not found:', parentError);
      return { success: false, error: 'Parent order not found' };
    }

    // For BUY parent: SL is a SELL stop-limit order at lower price
    // For SELL parent: SL is a BUY stop-limit order at higher price
    const slSide = parentOrder.side === 'buy' ? 'sell' : 'buy';

    // Add slight buffer to limit price (0.5% worse than stop price)
    const limitPriceBuffer = slSide === 'sell' ? 0.995 : 1.005;
    const limitPrice = stopLossPrice * limitPriceBuffer;

    const totalValue = quantity * stopLossPrice;
    const fee = totalValue * TRADING_FEE_RATE;

    const { data: slOrder, error } = await supabase
      .from('paper_trading_orders')
      .insert({
        user_id: userId,
        account_id: accountId,
        symbol: symbol.toUpperCase(),
        side: slSide,
        order_type: 'stop-limit',
        quantity,
        price: stopLossPrice,
        stop_price: stopLossPrice,
        limit_price: limitPrice,
        status: 'pending',
        parent_order_id: parentOrderId,
        linked_order_type: 'SL',
        total_value: totalValue,
        fee,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [createSLOrder] Failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [createSLOrder] SL order created:', slOrder);
    return { success: true, slOrder };
  } catch (error) {
    console.error('❌ [createSLOrder] Exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a pending order
 * @param {Object} params - Cancel parameters
 * @returns {Promise<Object>} Cancel result
 */
export async function cancelOrder({ userId, orderId }) {
  console.log('🚫 [cancelOrder] Cancelling order:', { userId, orderId });

  try {
    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from('paper_trading_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      console.error('❌ [cancelOrder] Order not found:', fetchError);
      return { success: false, error: 'Order not found or access denied' };
    }

    // Check if order is cancellable
    if (order.status !== 'pending') {
      console.warn('⚠️  [cancelOrder] Order is not pending:', order.status);
      return {
        success: false,
        error: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`
      };
    }

    console.log('📋 [cancelOrder] Order found:', {
      symbol: order.symbol,
      side: order.side,
      order_type: order.order_type,
      quantity: order.quantity,
      status: order.status,
    });

    // Release reserved balance if this was a pending buy order
    if (order.side === 'buy' && (order.order_type === 'limit' || order.order_type === 'stop-limit')) {
      const totalCost = order.total_value + order.fee;

      console.log('💰 [cancelOrder] Releasing reserved balance:', totalCost);

      const { data: account } = await supabase
        .from('paper_trading_accounts')
        .select('reserved_balance')
        .eq('id', order.account_id)
        .single();

      if (account) {
        const newReservedBalance = Math.max(0, (account.reserved_balance || 0) - totalCost);

        const { error: updateError } = await supabase
          .from('paper_trading_accounts')
          .update({
            reserved_balance: newReservedBalance,
          })
          .eq('id', order.account_id);

        if (updateError) {
          console.error('❌ [cancelOrder] Failed to release reserved balance:', updateError);
        } else {
          console.log('✅ [cancelOrder] Reserved balance released:', {
            released: totalCost,
            newReservedBalance,
          });
        }
      }
    }

    // Update order status to cancelled
    const { error: cancelError } = await supabase
      .from('paper_trading_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (cancelError) {
      console.error('❌ [cancelOrder] Failed to update order status:', cancelError);
      return { success: false, error: cancelError.message };
    }

    // If this order has linked TP/SL orders, cancel them too
    const { data: linkedOrders, error: linkedError } = await supabase
      .from('paper_trading_orders')
      .select('id, symbol, side, order_type, linked_order_type')
      .eq('parent_order_id', orderId)
      .eq('status', 'pending');

    if (linkedError) {
      console.error('❌ [cancelOrder] Failed to fetch linked orders:', linkedError);
    } else if (linkedOrders && linkedOrders.length > 0) {
      console.log(`🔗 [cancelOrder] Found ${linkedOrders.length} linked orders to cancel:`, linkedOrders);

      // Cancel all linked orders
      const { error: cancelLinkedError } = await supabase
        .from('paper_trading_orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('parent_order_id', orderId)
        .eq('status', 'pending');

      if (cancelLinkedError) {
        console.error('❌ [cancelOrder] Failed to cancel linked orders:', cancelLinkedError);
      } else {
        console.log(`✅ [cancelOrder] Cancelled ${linkedOrders.length} linked TP/SL orders`);
      }
    }

    console.log('✅ [cancelOrder] Order cancelled successfully:', orderId);
    return {
      success: true,
      message: 'Order cancelled successfully',
      cancelledOrderId: orderId,
      linkedOrdersCancelled: linkedOrders?.length || 0,
    };

  } catch (error) {
    console.error('❌ [cancelOrder] Exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get performance data (TIER2+ only)
 * @param {string} userId - User UUID
 * @param {string} period - 'day', 'week', 'month', 'all'
 * @returns {Promise<Object>} Performance data
 */
export async function getPerformanceData(userId, period = 'all') {
  // Tier gate: TIER2+
  const hasAccess = await validateTierAccess(userId, ['TIER2', 'TIER3']);
  if (!hasAccess) {
    return {
      success: false,
      error: 'Performance analytics require TIER2 or higher. Please upgrade your subscription.'
    };
  }

  // Calculate date range
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

  // Get orders
  const orders = await getOrders(userId, 9999, {
    dateFrom: dateFrom?.toISOString()
  });

  // Calculate performance metrics
  const sellOrders = orders.filter(o => o.side === 'sell');
  const winningTrades = sellOrders.filter(o => o.pnl > 0);
  const losingTrades = sellOrders.filter(o => o.pnl <= 0);

  const totalPnl = sellOrders.reduce((sum, o) => sum + (o.pnl || 0), 0);
  const winRate = sellOrders.length > 0 ? (winningTrades.length / sellOrders.length) * 100 : 0;

  const bestTrade = sellOrders.length > 0 ? Math.max(...sellOrders.map(o => o.pnl || 0)) : 0;
  const worstTrade = sellOrders.length > 0 ? Math.min(...sellOrders.map(o => o.pnl || 0)) : 0;

  return {
    success: true,
    data: {
      totalTrades: orders.length,
      sellOrders: sellOrders.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnl,
      bestTrade,
      worstTrade,
      orders: sellOrders.slice(0, 10), // Top 10 recent trades
      period
    }
  };
}

/**
 * Reset account (for testing)
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Reset result
 */
export async function resetAccount(userId) {
  try {
    const { account } = await getAccount(userId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Reset account
    const { error: resetError } = await supabase
      .from('paper_trading_accounts')
      .update({
        balance: INITIAL_BALANCE,
        total_pnl: 0,
        realized_pnl: 0,
        unrealized_pnl: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        win_rate: 0,
        best_trade: 0,
        worst_trade: 0,
        avg_win: 0,
        avg_loss: 0,
        profit_factor: 0
      })
      .eq('id', account.id);

    if (resetError) {
      return { success: false, error: resetError.message };
    }

    // Delete holdings
    await supabase
      .from('paper_trading_holdings')
      .delete()
      .eq('user_id', userId);

    // Delete stop orders
    await supabase
      .from('paper_trading_stop_orders')
      .delete()
      .eq('user_id', userId);

    return { success: true, message: 'Account reset successfully' };

  } catch (error) {
    console.error('Error resetting account:', error);
    return { success: false, error: error.message };
  }
}
