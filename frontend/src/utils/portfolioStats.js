/**
 * Portfolio Statistics Calculator
 * Calculate Win/Loss stats, performance metrics
 */

/**
 * Calculate Win/Loss statistics from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Win/Loss statistics
 */
export function calculateWinLossStats(transactions = []) {
  // Filter only SELL transactions (closed trades)
  const closedTrades = transactions.filter(t => t.transaction_type === 'SELL');

  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      totalPnL: 0,
      largestWin: 0,
      largestLoss: 0,
      expectancy: 0,
    };
  }

  // Separate wins and losses
  const wins = closedTrades.filter(t => (t.realized_pnl || 0) > 0);
  const losses = closedTrades.filter(t => (t.realized_pnl || 0) < 0);

  // Calculate totals
  const totalWinAmount = wins.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
  const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + (t.realized_pnl || 0), 0));
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);

  // Calculate averages
  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;

  // Calculate win rate
  const winRate = (wins.length / closedTrades.length) * 100;

  // Calculate profit factor
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;

  // Find largest win/loss
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.realized_pnl || 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.realized_pnl || 0)) : 0;

  // Calculate expectancy (average profit per trade)
  const expectancy = totalPnL / closedTrades.length;

  return {
    totalTrades: closedTrades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: Number(winRate.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    totalPnL: Number(totalPnL.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
  };
}

/**
 * Calculate performance by pattern type
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Stats grouped by pattern
 */
export function calculatePatternPerformance(transactions = []) {
  const closedTrades = transactions.filter(t => t.transaction_type === 'SELL');

  if (closedTrades.length === 0) return {};

  // Group by pattern
  const patternGroups = closedTrades.reduce((acc, trade) => {
    const pattern = trade.pattern_type || 'Unknown';
    if (!acc[pattern]) {
      acc[pattern] = [];
    }
    acc[pattern].push(trade);
    return {};
  }, {});

  // Calculate stats for each pattern
  const patternStats = {};
  Object.entries(patternGroups).forEach(([pattern, trades]) => {
    const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
    const totalPnL = trades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
    const winRate = (wins.length / trades.length) * 100;

    patternStats[pattern] = {
      totalTrades: trades.length,
      wins: wins.length,
      losses: trades.length - wins.length,
      winRate: Number(winRate.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      avgPnL: Number((totalPnL / trades.length).toFixed(2)),
    };
  });

  return patternStats;
}

/**
 * Calculate monthly performance
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Monthly stats
 */
export function calculateMonthlyPerformance(transactions = []) {
  const closedTrades = transactions.filter(t => t.transaction_type === 'SELL');

  if (closedTrades.length === 0) return [];

  // Group by month
  const monthlyGroups = closedTrades.reduce((acc, trade) => {
    const date = new Date(trade.transaction_at || trade.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(trade);
    return acc;
  }, {});

  // Calculate stats for each month
  const monthlyStats = Object.entries(monthlyGroups)
    .map(([month, trades]) => {
      const wins = trades.filter(t => (t.realized_pnl || 0) > 0);
      const totalPnL = trades.reduce((sum, t) => sum + (t.realized_pnl || 0), 0);
      const winRate = (wins.length / trades.length) * 100;

      return {
        month,
        totalTrades: trades.length,
        wins: wins.length,
        losses: trades.length - wins.length,
        winRate: Number(winRate.toFixed(2)),
        totalPnL: Number(totalPnL.toFixed(2)),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyStats;
}

/**
 * Calculate current drawdown
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Drawdown stats
 */
export function calculateDrawdown(transactions = []) {
  const closedTrades = transactions
    .filter(t => t.transaction_type === 'SELL')
    .sort((a, b) => new Date(a.transaction_at || a.created_at) - new Date(b.transaction_at || b.created_at));

  if (closedTrades.length === 0) {
    return {
      currentDrawdown: 0,
      maxDrawdown: 0,
      drawdownPercent: 0,
    };
  }

  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;

  closedTrades.forEach(trade => {
    runningTotal += trade.realized_pnl || 0;

    if (runningTotal > peak) {
      peak = runningTotal;
    }

    const drawdown = peak - runningTotal;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const currentDrawdown = peak - runningTotal;
  const drawdownPercent = peak > 0 ? (currentDrawdown / peak) * 100 : 0;

  return {
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    drawdownPercent: Number(drawdownPercent.toFixed(2)),
  };
}
