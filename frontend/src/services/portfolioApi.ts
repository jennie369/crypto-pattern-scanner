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
import type {
  PortfolioHolding,
  NewHoldingInput,
  PortfolioTransaction,
  NewTransactionInput,
  TransactionFilters,
  PortfolioStats,
  EntryTypeAnalytics,
  EntryTypeStats,
  EntryTypeDistribution,
  JournalEntry,
  NewJournalEntryInput,
  ApiResponse,
  OperationResult,
  HoldingPriceUpdate,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO HOLDINGS - Current Positions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all holdings for current user
 */
export async function fetchHoldings(userId: string): Promise<ApiResponse<PortfolioHolding[]>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as PortfolioHolding[], error: null };
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Add new holding (opens position)
 */
export async function addHolding(
  userId: string,
  holding: NewHoldingInput
): Promise<ApiResponse<PortfolioHolding>> {
  try {
    const currentPrice = holding.current_price ?? holding.avg_entry_price;
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .insert([{
        user_id: userId,
        symbol: holding.symbol,
        quantity: holding.quantity,
        avg_entry_price: holding.avg_entry_price,
        current_price: currentPrice,
        total_cost: holding.quantity * holding.avg_entry_price,
        current_value: holding.quantity * currentPrice,
        unrealized_pnl: 0,
        unrealized_pnl_percent: 0,
        notes: holding.notes ?? null
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
      entry_type: holding.entry_type ?? 'OTHER',
      pattern_type: holding.pattern_type ?? null,
      zone_status_at_entry: holding.zone_status_at_entry ?? null,
      confirmation_type: holding.confirmation_type ?? null,
      notes: holding.notes ?? null
    });

    return { data: data as PortfolioHolding, error: null };
  } catch (error) {
    console.error('Error adding holding:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update holding (modify position or update current price)
 */
export async function updateHolding(
  holdingId: string,
  updates: Partial<PortfolioHolding>
): Promise<ApiResponse<PortfolioHolding>> {
  try {
    let calculatedUpdates = { ...updates };

    if (updates.current_price !== undefined) {
      const { data: holding } = await supabase
        .from('portfolio_holdings')
        .select('quantity, avg_entry_price')
        .eq('id', holdingId)
        .single();

      if (holding) {
        const currentValue = (holding.quantity as number) * updates.current_price;
        const totalCost = (holding.quantity as number) * (holding.avg_entry_price as number);
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
    return { data: data as PortfolioHolding, error: null };
  } catch (error) {
    console.error('Error updating holding:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Delete holding (close position)
 */
export async function deleteHolding(holdingId: string): Promise<OperationResult> {
  try {
    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting holding:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Update current prices for all holdings
 */
export async function updateHoldingPrices(
  userId: string,
  priceUpdates: HoldingPriceUpdate[]
): Promise<OperationResult> {
  try {
    const promises = priceUpdates.map(async ({ symbol, price }) => {
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('id, quantity, avg_entry_price')
        .eq('user_id', userId)
        .eq('symbol', symbol);

      if (holdings && holdings.length > 0) {
        return Promise.all(holdings.map(holding => {
          const quantity = holding.quantity as number;
          const avgEntryPrice = holding.avg_entry_price as number;
          const currentValue = quantity * price;
          const totalCost = quantity * avgEntryPrice;
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
    return { success: false, error: error as Error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO TRANSACTIONS - Trade History
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all transactions for current user
 */
export async function fetchTransactions(
  userId: string,
  filters: TransactionFilters = {}
): Promise<ApiResponse<PortfolioTransaction[]>> {
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
    return { data: data as PortfolioTransaction[], error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Add new transaction
 */
export async function addTransaction(
  userId: string,
  transaction: NewTransactionInput
): Promise<ApiResponse<PortfolioTransaction>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_transactions')
      .insert([{
        user_id: userId,
        symbol: transaction.symbol,
        transaction_type: transaction.transaction_type,
        quantity: transaction.quantity,
        price: transaction.price,
        total_amount: transaction.quantity * transaction.price,
        fees: transaction.fees ?? 0,
        entry_type: transaction.entry_type ?? 'OTHER',
        pattern_type: transaction.pattern_type ?? null,
        zone_status_at_entry: transaction.zone_status_at_entry ?? null,
        confirmation_type: transaction.confirmation_type ?? null,
        risk_reward_ratio: transaction.risk_reward_ratio ?? null,
        realized_pnl: transaction.realized_pnl ?? null,
        realized_pnl_percent: transaction.realized_pnl_percent ?? null,
        notes: transaction.notes ?? null
      }])
      .select()
      .single();

    if (error) throw error;
    return { data: data as PortfolioTransaction, error: null };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { data: null, error: error as Error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate portfolio statistics
 */
export async function getPortfolioStats(userId: string): Promise<ApiResponse<PortfolioStats>> {
  try {
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

    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.total_cost || 0), 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

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
    return { data: null, error: error as Error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY TYPE ANALYTICS - RETEST vs BREAKOUT Performance
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze entry type performance (RETEST vs BREAKOUT vs OTHER)
 */
export async function getEntryTypeAnalytics(
  userId: string
): Promise<ApiResponse<EntryTypeAnalytics>> {
  try {
    const { data: transactions } = await supabase
      .from('portfolio_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', 'SELL')
      .not('realized_pnl', 'is', null)
      .order('transaction_at', { ascending: false });

    const typedTransactions = transactions as PortfolioTransaction[] | null;

    if (!typedTransactions || typedTransactions.length === 0) {
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

    const byEntryType = {
      RETEST: typedTransactions.filter(t => t.entry_type === 'RETEST'),
      BREAKOUT: typedTransactions.filter(t => t.entry_type === 'BREAKOUT'),
      OTHER: typedTransactions.filter(t => t.entry_type === 'OTHER')
    };

    const calculateStats = (trades: PortfolioTransaction[]): EntryTypeStats => {
      if (trades.length === 0) {
        return { trades: 0, winRate: 0, avgPnl: 0, avgRR: 0, totalProfit: 0 };
      }

      const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
      const winRate = (wins.length / trades.length) * 100;
      const totalProfit = trades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
      const avgPnl = totalProfit / trades.length;

      const rrTrades = trades.filter(t => t.risk_reward_ratio !== null);
      const avgRR = rrTrades.length > 0
        ? rrTrades.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / rrTrades.length
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

    const overallWins = typedTransactions.filter(t => (t.realized_pnl || 0) > 0);
    const overallStats = {
      trades: typedTransactions.length,
      winRate: parseFloat(((overallWins.length / typedTransactions.length) * 100).toFixed(2)),
      avgPnl: parseFloat((typedTransactions.reduce((sum, t) => sum + (t.realized_pnl || 0), 0) / typedTransactions.length).toFixed(2)),
      totalProfit: parseFloat(typedTransactions.reduce((sum, t) => sum + (t.realized_pnl || 0), 0).toFixed(2))
    };

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
    return { data: null, error: error as Error };
  }
}

/**
 * Get entry type distribution (pie chart data)
 */
export async function getEntryTypeDistribution(
  userId: string
): Promise<ApiResponse<EntryTypeDistribution[]>> {
  try {
    const { data: transactions } = await supabase
      .from('portfolio_transactions')
      .select('entry_type')
      .eq('user_id', userId)
      .eq('transaction_type', 'BUY');

    interface EntryTypeRecord {
      entry_type: string;
    }

    const typedTransactions = transactions as EntryTypeRecord[] | null;

    if (!typedTransactions || typedTransactions.length === 0) {
      return {
        data: [
          { type: 'RETEST', count: 0, percentage: '0' },
          { type: 'BREAKOUT', count: 0, percentage: '0' },
          { type: 'OTHER', count: 0, percentage: '0' }
        ],
        error: null
      };
    }

    const retestCount = typedTransactions.filter(t => t.entry_type === 'RETEST').length;
    const breakoutCount = typedTransactions.filter(t => t.entry_type === 'BREAKOUT').length;
    const otherCount = typedTransactions.filter(t => t.entry_type === 'OTHER').length;
    const total = typedTransactions.length;

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
    return { data: null, error: error as Error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADING JOURNAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all journal entries for user
 */
export async function fetchJournalEntries(userId: string): Promise<ApiResponse<JournalEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('trading_journal')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as JournalEntry[], error: null };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Add new journal entry
 */
export async function addJournalEntry(
  userId: string,
  entry: NewJournalEntryInput
): Promise<ApiResponse<JournalEntry>> {
  try {
    const { data, error } = await supabase
      .from('trading_journal')
      .insert([{
        user_id: userId,
        title: entry.title,
        content: entry.content,
        tags: entry.tags ?? [],
        entry_date: entry.date ?? new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data: data as JournalEntry, error: null };
  } catch (error) {
    console.error('Error adding journal entry:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update journal entry
 */
export async function updateJournalEntry(
  entryId: string,
  updates: Partial<NewJournalEntryInput>
): Promise<ApiResponse<JournalEntry>> {
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
    return { data: data as JournalEntry, error: null };
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Delete journal entry
 */
export async function deleteJournalEntry(entryId: string): Promise<OperationResult> {
  try {
    const { error } = await supabase
      .from('trading_journal')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { success: false, error: error as Error };
  }
}

export default {
  fetchHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
  updateHoldingPrices,
  fetchTransactions,
  addTransaction,
  getPortfolioStats,
  getEntryTypeAnalytics,
  getEntryTypeDistribution,
  fetchJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
};
