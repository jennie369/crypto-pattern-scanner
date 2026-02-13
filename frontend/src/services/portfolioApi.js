/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Portfolio API Service - TIER 2
 *
 * Manages portfolio holdings and transactions with entry type analytics
 *
 * Features:
 * - CRUD operations for holdings and transactions
 * - Entry type tracking (RETEST vs BREAKOUT vs OTHER)
 * - Portfolio statistics and P&L calculation
 * - Entry type analytics (win rate, avg R, profit by type)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '../lib/supabaseClient';

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO HOLDINGS - Current Positions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all holdings for current user
 * @returns {Promise<Array>} Array of holdings
 */
export async function fetchHoldings(userId) {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return { data: null, error };
  }
}

/**
 * Add new holding (opens position)
 * @param {Object} holding - Holding data
 * @returns {Promise<Object>} Created holding
 */
export async function addHolding(userId, holding) {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .insert([{
        user_id: userId,
        symbol: holding.symbol,
        quantity: holding.quantity,
        avg_entry_price: holding.avg_entry_price,
        current_price: holding.current_price || holding.avg_entry_price,
        total_cost: holding.quantity * holding.avg_entry_price,
        current_value: holding.quantity * (holding.current_price || holding.avg_entry_price),
        unrealized_pnl: 0,
        unrealized_pnl_percent: 0,
        notes: holding.notes || null
      }])
      .select()
      .single();

    if (error) throw error;

    // Also create a BUY transaction
    await addTransaction(userId, {
      symbol: holding.symbol,
      transaction_type: 'BUY',
      quantity: holding.quantity,
      price: holding.avg_entry_price,
      entry_type: holding.entry_type || 'OTHER',
      pattern_type: holding.pattern_type || null,
      zone_status_at_entry: holding.zone_status_at_entry || null,
      confirmation_type: holding.confirmation_type || null,
      notes: holding.notes || null
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error adding holding:', error);
    return { data: null, error };
  }
}

/**
 * Update holding (modify position or update current price)
 * @param {string} holdingId - Holding ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated holding
 */
export async function updateHolding(holdingId, updates) {
  try {
    // Recalculate values if quantity or price changed
    let calculatedUpdates = { ...updates };

    if (updates.current_price) {
      const { data: holding } = await supabase
        .from('portfolio_holdings')
        .select('quantity, avg_entry_price')
        .eq('id', holdingId)
        .single();

      if (holding) {
        const currentValue = holding.quantity * updates.current_price;
        const totalCost = holding.quantity * holding.avg_entry_price;
        const unrealizedPnl = currentValue - totalCost;
        const unrealizedPnlPercent = (unrealizedPnl / totalCost) * 100;

        calculatedUpdates = {
          ...calculatedUpdates,
          current_value: currentValue,
          unrealized_pnl: unrealizedPnl,
          unrealized_pnl_percent: unrealizedPnlPercent
        };
      }
    }

    const { data, error } = await supabase
      .from('portfolio_holdings')
      .update(calculatedUpdates)
      .eq('id', holdingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating holding:', error);
    return { data: null, error };
  }
}

/**
 * Delete holding (close position)
 * @param {string} holdingId - Holding ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteHolding(holdingId) {
  try {
    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting holding:', error);
    return { success: false, error };
  }
}

/**
 * Update current prices for all holdings
 * @param {Array} priceUpdates - Array of { symbol, price }
 * @returns {Promise<Object>} Success status
 */
export async function updateHoldingPrices(userId, priceUpdates) {
  try {
    const promises = priceUpdates.map(async ({ symbol, price }) => {
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('id, quantity, avg_entry_price')
        .eq('user_id', userId)
        .eq('symbol', symbol);

      if (holdings && holdings.length > 0) {
        return Promise.all(holdings.map(holding => {
          const currentValue = holding.quantity * price;
          const totalCost = holding.quantity * holding.avg_entry_price;
          const unrealizedPnl = currentValue - totalCost;
          const unrealizedPnlPercent = (unrealizedPnl / totalCost) * 100;

          return supabase
            .from('portfolio_holdings')
            .update({
              current_price: price,
              current_value: currentValue,
              unrealized_pnl: unrealizedPnl,
              unrealized_pnl_percent: unrealizedPnlPercent
            })
            .eq('id', holding.id);
        }));
      }
    });

    await Promise.all(promises);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating holding prices:', error);
    return { success: false, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO TRANSACTIONS - Trade History
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all transactions for current user
 * @param {Object} filters - Optional filters (symbol, type, entry_type)
 * @returns {Promise<Array>} Array of transactions
 */
export async function fetchTransactions(userId, filters = {}) {
  try {
    let query = supabase
      .from('portfolio_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_at', { ascending: false });

    if (filters.symbol) {
      query = query.eq('symbol', filters.symbol);
    }

    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
    }

    if (filters.entry_type) {
      query = query.eq('entry_type', filters.entry_type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error };
  }
}

/**
 * Add new transaction
 * @param {Object} transaction - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
export async function addTransaction(userId, transaction) {
  try {
    const { data, error } = await supabase
      .from('portfolio_transactions')
      .insert([{
        user_id: userId,
        symbol: transaction.symbol,
        transaction_type: transaction.transaction_type, // BUY or SELL
        quantity: transaction.quantity,
        price: transaction.price,
        total_amount: transaction.quantity * transaction.price,
        fees: transaction.fees || 0,
        // 🆕 Entry Type Analytics Fields
        entry_type: transaction.entry_type || 'OTHER', // RETEST, BREAKOUT, OTHER
        pattern_type: transaction.pattern_type || null, // DPD, UPU, etc.
        zone_status_at_entry: transaction.zone_status_at_entry || null, // Fresh, Tested, etc.
        confirmation_type: transaction.confirmation_type || null, // PIN_BAR, HAMMER, etc.
        risk_reward_ratio: transaction.risk_reward_ratio || null,
        realized_pnl: transaction.realized_pnl || null,
        realized_pnl_percent: transaction.realized_pnl_percent || null,
        notes: transaction.notes || null
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { data: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate portfolio statistics
 * @returns {Promise<Object>} Portfolio stats
 */
export async function getPortfolioStats(userId) {
  try {
    // Fetch all holdings
    const { data: holdings } = await fetchHoldings(userId);

    if (!holdings || holdings.length === 0) {
      return {
        data: {
          totalValue: 0,
          totalCost: 0,
          totalPnl: 0,
          totalPnlPercent: 0,
          holdingsCount: 0,
          topGainer: null,
          topLoser: null
        },
        error: null
      };
    }

    // Calculate totals
    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.total_cost || 0), 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    // Find top gainer and loser
    const sortedByPnlPercent = [...holdings].sort((a, b) =>
      (b.unrealized_pnl_percent || 0) - (a.unrealized_pnl_percent || 0)
    );

    const topGainer = sortedByPnlPercent[0];
    const topLoser = sortedByPnlPercent[sortedByPnlPercent.length - 1];

    return {
      data: {
        totalValue,
        totalCost,
        totalPnl,
        totalPnlPercent,
        holdingsCount: holdings.length,
        topGainer,
        topLoser,
        holdings
      },
      error: null
    };
  } catch (error) {
    console.error('Error calculating portfolio stats:', error);
    return { data: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY TYPE ANALYTICS - RETEST vs BREAKOUT Performance
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze entry type performance (RETEST vs BREAKOUT vs OTHER)
 * @returns {Promise<Object>} Entry type analytics
 */
export async function getEntryTypeAnalytics(userId) {
  try {
    // Fetch all SELL transactions (closed positions with realized P&L)
    const { data: transactions } = await supabase
      .from('portfolio_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', 'SELL')
      .not('realized_pnl', 'is', null)
      .order('transaction_at', { ascending: false });

    if (!transactions || transactions.length === 0) {
      return {
        data: {
          retest: { trades: 0, winRate: 0, avgPnl: 0, avgRR: 0, totalProfit: 0 },
          breakout: { trades: 0, winRate: 0, avgPnl: 0, avgRR: 0, totalProfit: 0 },
          other: { trades: 0, winRate: 0, avgPnl: 0, avgRR: 0, totalProfit: 0 },
          overall: { trades: 0, winRate: 0, avgPnl: 0, totalProfit: 0 },
          recommendation: 'CHỈ TRADE RETEST!'
        },
        error: null
      };
    }

    // Group by entry type
    const byEntryType = {
      RETEST: transactions.filter(t => t.entry_type === 'RETEST'),
      BREAKOUT: transactions.filter(t => t.entry_type === 'BREAKOUT'),
      OTHER: transactions.filter(t => t.entry_type === 'OTHER')
    };

    // Calculate stats for each entry type
    const calculateStats = (trades) => {
      if (trades.length === 0) {
        return { trades: 0, winRate: 0, avgPnl: 0, avgRR: 0, totalProfit: 0 };
      }

      const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
      const winRate = (wins.length / trades.length) * 100;
      const totalProfit = trades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
      const avgPnl = totalProfit / trades.length;

      const rrTrades = trades.filter(t => t.risk_reward_ratio);
      const avgRR = rrTrades.length > 0
        ? rrTrades.reduce((sum, t) => sum + t.risk_reward_ratio, 0) / rrTrades.length
        : 0;

      return {
        trades: trades.length,
        winRate: parseFloat(winRate.toFixed(2)),
        avgPnl: parseFloat(avgPnl.toFixed(2)),
        avgRR: parseFloat(avgRR.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        wins: wins.length,
        losses: trades.length - wins.length
      };
    };

    const retestStats = calculateStats(byEntryType.RETEST);
    const breakoutStats = calculateStats(byEntryType.BREAKOUT);
    const otherStats = calculateStats(byEntryType.OTHER);

    // Overall stats
    const overallWins = transactions.filter(t => (t.realized_pnl || 0) > 0);
    const overallStats = {
      trades: transactions.length,
      winRate: parseFloat(((overallWins.length / transactions.length) * 100).toFixed(2)),
      avgPnl: parseFloat((transactions.reduce((sum, t) => sum + (t.realized_pnl || 0), 0) / transactions.length).toFixed(2)),
      totalProfit: parseFloat(transactions.reduce((sum, t) => sum + (t.realized_pnl || 0), 0).toFixed(2))
    };

    // Generate recommendation
    let recommendation = 'CHỈ TRADE RETEST!';
    if (retestStats.winRate > breakoutStats.winRate && retestStats.trades >= 5) {
      recommendation = `✅ RETEST has ${(retestStats.winRate - breakoutStats.winRate).toFixed(1)}% higher win rate! CHỈ TRADE RETEST!`;
    } else if (breakoutStats.winRate > retestStats.winRate && breakoutStats.trades >= 5) {
      recommendation = `⚠️ Your data shows BREAKOUT performing better, but GEM system recommends RETEST for consistency.`;
    }

    return {
      data: {
        retest: retestStats,
        breakout: breakoutStats,
        other: otherStats,
        overall: overallStats,
        recommendation,
        // Chart data
        comparisonData: [
          { type: 'RETEST', winRate: retestStats.winRate, avgPnl: retestStats.avgPnl, trades: retestStats.trades },
          { type: 'BREAKOUT', winRate: breakoutStats.winRate, avgPnl: breakoutStats.avgPnl, trades: breakoutStats.trades },
          { type: 'OTHER', winRate: otherStats.winRate, avgPnl: otherStats.avgPnl, trades: otherStats.trades }
        ]
      },
      error: null
    };
  } catch (error) {
    console.error('Error calculating entry type analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get entry type distribution (pie chart data)
 * @returns {Promise<Object>} Entry type distribution
 */
export async function getEntryTypeDistribution(userId) {
  try {
    const { data: transactions } = await supabase
      .from('portfolio_transactions')
      .select('entry_type')
      .eq('user_id', userId)
      .eq('transaction_type', 'BUY'); // Only count entries

    if (!transactions || transactions.length === 0) {
      return {
        data: [
          { type: 'RETEST', count: 0, percentage: 0 },
          { type: 'BREAKOUT', count: 0, percentage: 0 },
          { type: 'OTHER', count: 0, percentage: 0 }
        ],
        error: null
      };
    }

    const retestCount = transactions.filter(t => t.entry_type === 'RETEST').length;
    const breakoutCount = transactions.filter(t => t.entry_type === 'BREAKOUT').length;
    const otherCount = transactions.filter(t => t.entry_type === 'OTHER').length;
    const total = transactions.length;

    return {
      data: [
        { type: 'RETEST', count: retestCount, percentage: ((retestCount / total) * 100).toFixed(1) },
        { type: 'BREAKOUT', count: breakoutCount, percentage: ((breakoutCount / total) * 100).toFixed(1) },
        { type: 'OTHER', count: otherCount, percentage: ((otherCount / total) * 100).toFixed(1) }
      ],
      error: null
    };
  } catch (error) {
    console.error('Error getting entry type distribution:', error);
    return { data: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADING JOURNAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all journal entries for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Journal entries
 */
export async function fetchJournalEntries(userId) {
  try {
    const { data, error } = await supabase
      .from('trading_journal')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return { data: null, error };
  }
}

/**
 * Add new journal entry
 * @param {string} userId - User ID
 * @param {Object} entry - Entry data
 * @returns {Promise<Object>} Created entry
 */
export async function addJournalEntry(userId, entry) {
  try {
    const { data, error } = await supabase
      .from('trading_journal')
      .insert([{
        user_id: userId,
        title: entry.title,
        content: entry.content,
        tags: entry.tags || [],
        entry_date: entry.date || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding journal entry:', error);
    return { data: null, error };
  }
}

/**
 * Update journal entry
 * @param {string} entryId - Entry ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated entry
 */
export async function updateJournalEntry(entryId, updates) {
  try {
    const { data, error } = await supabase
      .from('trading_journal')
      .update({
        title: updates.title,
        content: updates.content,
        tags: updates.tags,
        entry_date: updates.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return { data: null, error };
  }
}

/**
 * Delete journal entry
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteJournalEntry(entryId) {
  try {
    const { error } = await supabase
      .from('trading_journal')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { success: false, error };
  }
}

export default {
  // Holdings
  fetchHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
  updateHoldingPrices,
  // Transactions
  fetchTransactions,
  addTransaction,
  // Stats
  getPortfolioStats,
  getEntryTypeAnalytics,
  getEntryTypeDistribution,
  // Journal
  fetchJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
};
