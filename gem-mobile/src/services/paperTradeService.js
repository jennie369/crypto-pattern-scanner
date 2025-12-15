/**
 * Gemral - Paper Trade Service
 * Simulated trading with local storage + Supabase sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  POSITIONS: 'gem_paper_positions',
  HISTORY: 'gem_paper_history',
  BALANCE: 'gem_paper_balance',
  INITIAL_BALANCE: 'gem_paper_initial_balance',
};

const DEFAULT_INITIAL_BALANCE = 10000; // $10,000 paper money (default)

class PaperTradeService {
  constructor() {
    this.openPositions = [];
    this.tradeHistory = [];
    this.balance = DEFAULT_INITIAL_BALANCE;
    this.initialBalance = DEFAULT_INITIAL_BALANCE; // User-configurable initial balance
    this.initialized = false;
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  async init() {
    if (this.initialized) return;

    try {
      console.log('[PaperTrade] Initializing...');

      // Load from local storage
      const [positions, history, balance, initialBalance] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE),
      ]);

      this.openPositions = positions ? JSON.parse(positions) : [];
      this.tradeHistory = history ? JSON.parse(history) : [];
      this.initialBalance = initialBalance ? parseFloat(initialBalance) : DEFAULT_INITIAL_BALANCE;
      this.balance = balance ? parseFloat(balance) : this.initialBalance;

      this.initialized = true;

      console.log('[PaperTrade] Loaded:', {
        positions: this.openPositions.length,
        history: this.tradeHistory.length,
        balance: this.balance,
        initialBalance: this.initialBalance,
      });
    } catch (error) {
      console.error('[PaperTrade] Init error:', error);
      this.openPositions = [];
      this.tradeHistory = [];
      this.initialBalance = DEFAULT_INITIAL_BALANCE;
      this.balance = DEFAULT_INITIAL_BALANCE;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // OPEN POSITION
  // ═══════════════════════════════════════════════════════════

  async openPosition(params) {
    await this.init();

    const { pattern, positionSize, userId, leverage = 1 } = params;

    // Validate
    if (!pattern || !positionSize || positionSize <= 0) {
      throw new Error('Invalid parameters');
    }

    if (positionSize > this.balance) {
      throw new Error('Insufficient balance');
    }

    // Generate unique ID
    const id = `PT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calculate quantity
    const quantity = positionSize / pattern.entry;

    // Create position object
    const position = {
      id,
      orderId: id,

      // User
      userId: userId || 'anonymous',

      // Symbol & Pattern
      symbol: pattern.symbol,
      baseAsset: pattern.symbol?.replace('USDT', ''),
      direction: pattern.direction, // 'LONG' or 'SHORT'
      patternType: pattern.type,
      timeframe: pattern.timeframe,
      confidence: pattern.confidence,

      // Prices
      entryPrice: pattern.entry,
      stopLoss: pattern.stopLoss,
      takeProfit: pattern.targets?.[0] || pattern.target1 || pattern.entry * (pattern.direction === 'LONG' ? 1.02 : 0.98),
      takeProfit2: pattern.targets?.[1] || pattern.target2,

      // Position sizing
      positionSize: positionSize, // USDT amount
      quantity: quantity, // Coin quantity
      leverage: leverage,

      // Risk calculations
      riskAmount: Math.abs(pattern.entry - pattern.stopLoss) * quantity,
      rewardAmount: Math.abs((pattern.targets?.[0] || pattern.entry * 1.02) - pattern.entry) * quantity,
      riskRewardRatio: this.calculateRR(pattern),

      // Timestamps
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Status
      status: 'OPEN',

      // P&L tracking
      currentPrice: pattern.entry,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,

      // Source
      source: 'PATTERN_SCANNER',
    };

    // Deduct from balance
    this.balance -= positionSize;

    // Add to positions
    this.openPositions.push(position);

    // Save to storage
    await this.saveAll();

    // Sync to Supabase
    await this.syncPositionToSupabase(position, 'INSERT');

    console.log('[PaperTrade] Position opened:', {
      id: position.id,
      symbol: position.symbol,
      direction: position.direction,
      size: positionSize,
    });

    return position;
  }

  // ═══════════════════════════════════════════════════════════
  // CLOSE POSITION
  // ═══════════════════════════════════════════════════════════

  async closePosition(positionId, exitPrice, exitReason = 'MANUAL') {
    await this.init();

    const positionIndex = this.openPositions.findIndex((p) => p.id === positionId);

    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = { ...this.openPositions[positionIndex] };

    // Calculate final P&L
    const isLong = position.direction === 'LONG';
    const priceDiff = isLong
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice;

    const realizedPnL = priceDiff * position.quantity;
    const realizedPnLPercent = (priceDiff / position.entryPrice) * 100;

    // Create closed trade record
    const closedTrade = {
      ...position,

      // Exit info
      exitPrice: exitPrice,
      exitReason: exitReason, // 'MANUAL', 'STOP_LOSS', 'TAKE_PROFIT'
      closedAt: new Date().toISOString(),

      // Final P&L
      realizedPnL: realizedPnL,
      realizedPnLPercent: realizedPnLPercent,

      // Result
      result: realizedPnL >= 0 ? 'WIN' : 'LOSS',
      status: 'CLOSED',

      // Duration
      holdingTime: this.calculateHoldingTime(position.openedAt),
    };

    // Return position size + P&L to balance
    this.balance += position.positionSize + realizedPnL;

    // Remove from open positions
    this.openPositions.splice(positionIndex, 1);

    // Add to history (at beginning)
    this.tradeHistory.unshift(closedTrade);

    // Keep only last 100 trades in history
    if (this.tradeHistory.length > 100) {
      this.tradeHistory = this.tradeHistory.slice(0, 100);
    }

    // Save to storage
    await this.saveAll();

    // Sync to Supabase
    await this.syncPositionToSupabase(closedTrade, 'UPDATE');

    console.log('[PaperTrade] Position closed:', {
      id: closedTrade.id,
      result: closedTrade.result,
      pnl: realizedPnL.toFixed(2),
      reason: exitReason,
    });

    return closedTrade;
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE PRICES & CHECK SL/TP
  // ═══════════════════════════════════════════════════════════

  async updatePrices(currentPrices) {
    await this.init();

    if (this.openPositions.length === 0) return { closed: [], updated: [] };

    const closedPositions = [];
    const updatedPositions = [];

    for (const position of [...this.openPositions]) {
      const currentPrice = currentPrices[position.symbol];
      if (!currentPrice) continue;

      const isLong = position.direction === 'LONG';

      // Check Stop Loss
      const hitStopLoss = isLong
        ? currentPrice <= position.stopLoss
        : currentPrice >= position.stopLoss;

      if (hitStopLoss) {
        const closed = await this.closePosition(
          position.id,
          position.stopLoss,
          'STOP_LOSS'
        );
        closedPositions.push(closed);
        continue;
      }

      // Check Take Profit
      const hitTakeProfit = isLong
        ? currentPrice >= position.takeProfit
        : currentPrice <= position.takeProfit;

      if (hitTakeProfit) {
        const closed = await this.closePosition(
          position.id,
          position.takeProfit,
          'TAKE_PROFIT'
        );
        closedPositions.push(closed);
        continue;
      }

      // Update unrealized P&L
      const priceDiff = isLong
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;

      position.currentPrice = currentPrice;
      position.unrealizedPnL = priceDiff * position.quantity;
      position.unrealizedPnLPercent = (priceDiff / position.entryPrice) * 100;
      position.updatedAt = new Date().toISOString();

      updatedPositions.push(position);
    }

    // Save updated positions
    if (updatedPositions.length > 0 || closedPositions.length > 0) {
      await this.saveAll();
    }

    return { closed: closedPositions, updated: updatedPositions };
  }

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════

  getOpenPositions(userId = null) {
    if (userId) {
      return this.openPositions.filter((p) => p.userId === userId);
    }
    return [...this.openPositions];
  }

  getTradeHistory(userId = null, limit = 50) {
    let history = userId
      ? this.tradeHistory.filter((t) => t.userId === userId)
      : [...this.tradeHistory];

    return history.slice(0, limit);
  }

  getBalance() {
    return this.balance;
  }

  getPositionById(positionId) {
    return this.openPositions.find((p) => p.id === positionId);
  }

  // ═══════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════

  getStats(userId = null) {
    const history = this.getTradeHistory(userId, 1000);
    const openPositions = this.getOpenPositions(userId);

    // Calculate unrealized P&L from open positions
    const unrealizedPnL = openPositions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);

    // Calculate total position size in use
    const usedMargin = openPositions.reduce((sum, p) => sum + (p.positionSize || 0), 0);

    if (history.length === 0) {
      return {
        totalTrades: 0, // Closed trades count
        openTrades: openPositions.length,
        winRate: 0,
        totalPnL: unrealizedPnL, // Include unrealized P&L
        realizedPnL: 0,
        unrealizedPnL: unrealizedPnL,
        avgPnL: 0,
        wins: 0,
        losses: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgHoldingTime: '0h',
        profitFactor: 0,
        balance: this.balance,
        usedMargin: usedMargin,
        availableBalance: this.balance,
      };
    }

    const wins = history.filter((t) => t.result === 'WIN');
    const losses = history.filter((t) => t.result === 'LOSS');

    const realizedPnL = history.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const totalPnL = realizedPnL + unrealizedPnL; // Combined P&L

    const winPnL = wins.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const lossPnL = Math.abs(
      losses.reduce((sum, t) => sum + (t.realizedPnL || 0), 0)
    );

    const pnls = history.map((t) => t.realizedPnL || 0);
    const closedTradesCount = history.length;

    return {
      totalTrades: closedTradesCount, // Number of CLOSED trades
      openTrades: openPositions.length,
      winRate: closedTradesCount > 0 ? (wins.length / closedTradesCount) * 100 : 0,
      totalPnL: totalPnL, // Realized + Unrealized
      realizedPnL: realizedPnL,
      unrealizedPnL: unrealizedPnL,
      avgPnL: closedTradesCount > 0 ? realizedPnL / closedTradesCount : 0,
      wins: wins.length,
      losses: losses.length,
      bestTrade: pnls.length > 0 ? Math.max(...pnls, 0) : 0,
      worstTrade: pnls.length > 0 ? Math.min(...pnls, 0) : 0,
      profitFactor: lossPnL > 0 ? winPnL / lossPnL : winPnL,
      balance: this.balance,
      usedMargin: usedMargin,
      availableBalance: this.balance,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  calculateRR(pattern) {
    if (!pattern.entry || !pattern.stopLoss || !pattern.targets?.[0]) {
      return '1:2';
    }

    const risk = Math.abs(pattern.entry - pattern.stopLoss);
    const reward = Math.abs(pattern.targets[0] - pattern.entry);

    if (risk === 0) return '1:2';

    const ratio = reward / risk;
    return `1:${ratio.toFixed(1)}`;
  }

  calculateHoldingTime(openedAt) {
    const opened = new Date(openedAt);
    const now = new Date();
    const diffMs = now - opened;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  // ═══════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════

  async saveAll() {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.POSITIONS,
          JSON.stringify(this.openPositions)
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.HISTORY,
          JSON.stringify(this.tradeHistory)
        ),
        AsyncStorage.setItem(STORAGE_KEYS.BALANCE, this.balance.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.INITIAL_BALANCE, this.initialBalance.toString()),
      ]);
    } catch (error) {
      console.error('[PaperTrade] Save error:', error);
    }
  }

  /**
   * Reset all data and start fresh with current initial balance
   * Clears all positions and history, resets balance to initialBalance
   */
  async resetAll() {
    this.openPositions = [];
    this.tradeHistory = [];
    this.balance = this.initialBalance; // Use user-configured initial balance
    await this.saveAll();
    console.log('[PaperTrade] Reset complete with balance:', this.initialBalance);
    return {
      balance: this.balance,
      initialBalance: this.initialBalance,
    };
  }

  /**
   * Get the current initial balance setting
   */
  getInitialBalance() {
    return this.initialBalance;
  }

  /**
   * Set a new initial balance for paper trading
   * @param {number} amount - New initial balance (min $100, max $10,000,000)
   * @param {boolean} resetAccount - If true, also reset all positions/history
   */
  async setInitialBalance(amount, resetAccount = false) {
    await this.init();

    // Validate amount
    const MIN_BALANCE = 100;
    const MAX_BALANCE = 10000000; // 10 million

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Số tiền không hợp lệ');
    }

    if (amount < MIN_BALANCE) {
      throw new Error(`Số tiền tối thiểu là $${MIN_BALANCE.toLocaleString()}`);
    }

    if (amount > MAX_BALANCE) {
      throw new Error(`Số tiền tối đa là $${MAX_BALANCE.toLocaleString()}`);
    }

    const oldInitialBalance = this.initialBalance;
    this.initialBalance = amount;

    if (resetAccount) {
      // Full reset with new initial balance
      this.openPositions = [];
      this.tradeHistory = [];
      this.balance = amount;
    } else {
      // Adjust current balance by the difference
      // New balance = current balance + (new initial - old initial)
      const difference = amount - oldInitialBalance;
      this.balance += difference;

      // Ensure balance doesn't go negative
      if (this.balance < 0) {
        this.balance = 0;
      }
    }

    await this.saveAll();

    console.log('[PaperTrade] Initial balance set:', {
      oldInitialBalance,
      newInitialBalance: this.initialBalance,
      currentBalance: this.balance,
      resetAccount,
    });

    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
      resetAccount,
    };
  }

  /**
   * Reset to default initial balance ($10,000) and clear all data
   */
  async resetToDefault() {
    this.initialBalance = DEFAULT_INITIAL_BALANCE;
    this.openPositions = [];
    this.tradeHistory = [];
    this.balance = DEFAULT_INITIAL_BALANCE;
    await this.saveAll();
    console.log('[PaperTrade] Reset to default complete');
    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
    };
  }

  /**
   * Recalculate balance based on history and open positions
   * Use this to fix corrupted balance data
   * Formula: Balance = initialBalance + sum(realizedPnL) - sum(openPositionSizes)
   */
  async recalculateBalance() {
    await this.init();

    // Sum of all realized P&L from closed trades
    const totalRealizedPnL = this.tradeHistory.reduce((sum, t) => {
      return sum + (t.realizedPnL || 0);
    }, 0);

    // Sum of position sizes currently in use (locked in open trades)
    const usedMargin = this.openPositions.reduce((sum, p) => {
      return sum + (p.positionSize || 0);
    }, 0);

    // Correct balance = Initial + Profits/Losses - Currently Used Margin
    const correctBalance = this.initialBalance + totalRealizedPnL - usedMargin;

    console.log('[PaperTrade] Recalculating balance:', {
      initial: this.initialBalance,
      totalRealizedPnL,
      usedMargin,
      oldBalance: this.balance,
      newBalance: correctBalance,
    });

    this.balance = correctBalance;
    await this.saveAll();

    return {
      oldBalance: this.balance,
      newBalance: correctBalance,
      initialBalance: this.initialBalance,
      totalRealizedPnL,
      usedMargin,
    };
  }

  /**
   * Get equity (balance + unrealized P&L)
   * This is the "real" account value including floating profits/losses
   */
  getEquity(userId = null) {
    const openPositions = this.getOpenPositions(userId);
    const unrealizedPnL = openPositions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);
    const usedMargin = openPositions.reduce((sum, p) => sum + (p.positionSize || 0), 0);

    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
      usedMargin: usedMargin,
      unrealizedPnL: unrealizedPnL,
      equity: this.balance + usedMargin + unrealizedPnL, // Total account value
      availableBalance: this.balance, // Free margin
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUPABASE SYNC
  // ═══════════════════════════════════════════════════════════

  async syncPositionToSupabase(position, action = 'INSERT') {
    try {
      if (!position.userId || position.userId === 'anonymous') return;

      const data = {
        id: position.id,
        user_id: position.userId,
        symbol: position.symbol,
        direction: position.direction,
        pattern_type: position.patternType,
        timeframe: position.timeframe,
        entry_price: position.entryPrice,
        stop_loss: position.stopLoss,
        take_profit: position.takeProfit,
        position_size: position.positionSize,
        quantity: position.quantity,
        status: position.status,
        opened_at: position.openedAt,
        closed_at: position.closedAt || null,
        exit_price: position.exitPrice || null,
        exit_reason: position.exitReason || null,
        realized_pnl: position.realizedPnL || null,
        result: position.result || null,
      };

      if (action === 'INSERT') {
        await supabase.from('paper_trades').insert(data);
      } else {
        await supabase.from('paper_trades').update(data).eq('id', position.id);
      }
    } catch (error) {
      console.log('[PaperTrade] Supabase sync error (non-critical):', error.message);
    }
  }

  async loadFromSupabase(userId) {
    try {
      const { data, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'OPEN');

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge with local positions
        for (const serverPos of data) {
          const localExists = this.openPositions.find((p) => p.id === serverPos.id);
          if (!localExists) {
            this.openPositions.push(this.mapFromSupabase(serverPos));
          }
        }
        await this.saveAll();
      }
    } catch (error) {
      console.log('[PaperTrade] Load from Supabase error:', error.message);
    }
  }

  mapFromSupabase(data) {
    return {
      id: data.id,
      userId: data.user_id,
      symbol: data.symbol,
      direction: data.direction,
      patternType: data.pattern_type,
      timeframe: data.timeframe,
      entryPrice: data.entry_price,
      stopLoss: data.stop_loss,
      takeProfit: data.take_profit,
      positionSize: data.position_size,
      quantity: data.quantity,
      status: data.status,
      openedAt: data.opened_at,
      currentPrice: data.entry_price,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
    };
  }
}

// Export singleton instance
const paperTradeService = new PaperTradeService();
export default paperTradeService;
