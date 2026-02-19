-- =============================================================================
-- Paper Trading Unification Migration
-- Migrates web-only tables → mobile tables so the cron monitors all trades
-- =============================================================================
-- Web tables (DEPRECATE):  paper_trading_accounts, paper_trading_holdings,
--                          paper_trading_orders, paper_trading_stop_orders
-- Mobile tables (ADOPT):   user_paper_trade_settings, paper_trades,
--                          paper_pending_orders
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Migrate paper_trading_accounts → user_paper_trade_settings
--    ON CONFLICT keep higher balance so we never lose a user's money
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO user_paper_trade_settings (
  user_id,
  balance,
  initial_balance,
  total_trades,
  total_wins,
  total_losses,
  win_rate,
  total_pnl,
  total_realized_pnl,
  last_trade_at,
  created_at,
  updated_at
)
SELECT
  pta.user_id,
  pta.balance,
  COALESCE(pta.initial_balance, 100000),
  COALESCE(pta.total_trades, 0),
  COALESCE(pta.winning_trades, 0),
  COALESCE(pta.losing_trades, 0),
  COALESCE(pta.win_rate, 0),
  COALESCE(pta.total_pnl, 0),
  COALESCE(pta.realized_pnl, 0),
  pta.last_trade_at,
  pta.created_at,
  NOW()
FROM paper_trading_accounts pta
WHERE pta.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  balance = GREATEST(EXCLUDED.balance, user_paper_trade_settings.balance),
  total_trades = GREATEST(EXCLUDED.total_trades, user_paper_trade_settings.total_trades),
  total_wins = GREATEST(EXCLUDED.total_wins, user_paper_trade_settings.total_wins),
  total_losses = GREATEST(EXCLUDED.total_losses, user_paper_trade_settings.total_losses),
  updated_at = NOW();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Migrate paper_trading_holdings → paper_trades (status='OPEN')
--    These are open positions that should now be monitored by the cron
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO paper_trades (
  user_id,
  symbol,
  direction,
  side,
  status,
  entry_price,
  price,
  quantity,
  position_size,
  total_value,
  margin,
  position_value,
  stop_loss,
  take_profit,
  leverage,
  order_type,
  trade_mode,
  opened_at,
  created_at,
  updated_at
)
SELECT
  pth.user_id,
  pth.symbol,
  'LONG',                                     -- all web trades are LONG (spot-style)
  'buy',                                      -- legacy side column
  'OPEN',
  pth.avg_buy_price,                          -- entry_price
  pth.avg_buy_price,                          -- legacy price column
  pth.quantity,
  pth.total_cost,                             -- position_size = total cost at leverage=1
  pth.total_cost,                             -- total_value
  pth.total_cost,                             -- margin = full cost (leverage=1)
  pth.quantity * pth.avg_buy_price,           -- position_value
  pth.stop_loss,                              -- if set on the holding
  pth.take_profit,                            -- if set on the holding
  1,                                          -- leverage=1 for spot
  'MARKET',
  'custom',                                   -- web trades are custom (not pattern-based)
  COALESCE(pth.created_at, NOW()),
  COALESCE(pth.created_at, NOW()),
  NOW()
FROM paper_trading_holdings pth
WHERE pth.user_id IS NOT NULL
  AND pth.quantity > 0;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Migrate filled paper_trading_orders (sells) → paper_trades (status='CLOSED')
--    Only migrate SELL orders that are filled — these represent completed trades
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO paper_trades (
  user_id,
  symbol,
  direction,
  side,
  status,
  entry_price,
  price,
  exit_price,
  quantity,
  position_size,
  total_value,
  margin,
  leverage,
  realized_pnl,
  pnl,
  realized_pnl_percent,
  pnl_percent,
  result,
  order_type,
  trade_mode,
  opened_at,
  closed_at,
  created_at,
  updated_at
)
SELECT
  pto.user_id,
  pto.symbol,
  'LONG',
  pto.side,
  CASE
    WHEN pto.status = 'filled' AND pto.side = 'sell' THEN 'CLOSED'
    WHEN pto.status = 'filled' AND pto.side = 'buy' THEN 'OPEN'
    ELSE 'CLOSED'
  END,
  pto.price,                                  -- entry_price (best we have)
  pto.price,
  CASE WHEN pto.side = 'sell' THEN pto.price ELSE NULL END,
  pto.quantity,
  pto.total_value,
  pto.total_value,
  pto.total_value,                            -- margin = full cost at leverage=1
  1,
  pto.pnl,
  pto.pnl,
  pto.pnl_percentage,
  pto.pnl_percentage,
  CASE
    WHEN pto.pnl > 0 THEN 'WIN'
    WHEN pto.pnl < 0 THEN 'LOSS'
    WHEN pto.pnl = 0 THEN 'BREAKEVEN'
    ELSE NULL
  END,
  UPPER(COALESCE(pto.order_type, 'MARKET')),
  'custom',
  pto.created_at,
  CASE WHEN pto.side = 'sell' THEN pto.updated_at ELSE NULL END,
  pto.created_at,
  NOW()
FROM paper_trading_orders pto
WHERE pto.status = 'filled'
  AND pto.user_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Migrate pending paper_trading_orders → paper_pending_orders
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO paper_pending_orders (
  user_id,
  symbol,
  order_type,
  direction,
  limit_price,
  stop_price,
  quantity,
  position_size,
  leverage,
  time_in_force,
  reduce_only,
  status,
  created_at,
  updated_at
)
SELECT
  pto.user_id,
  pto.symbol,
  CASE
    WHEN pto.order_type = 'stop-limit' THEN 'stop_limit'
    ELSE pto.order_type
  END,
  'LONG',                                     -- all web trades are LONG
  pto.limit_price,
  pto.stop_price,
  pto.quantity,
  pto.total_value,
  1,                                          -- leverage=1
  COALESCE(pto.time_in_force, 'GTC'),
  COALESCE(pto.reduce_only, false),
  'PENDING',
  pto.created_at,
  NOW()
FROM paper_trading_orders pto
WHERE pto.status = 'pending'
  AND pto.user_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Mark old tables as deprecated (add comment, keep as read-only backup)
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE paper_trading_accounts IS 'DEPRECATED 2026-02-19: Migrated to user_paper_trade_settings. Keep as read-only backup for 30 days.';
COMMENT ON TABLE paper_trading_holdings IS 'DEPRECATED 2026-02-19: Migrated to paper_trades WHERE status=OPEN. Keep as read-only backup for 30 days.';
COMMENT ON TABLE paper_trading_orders IS 'DEPRECATED 2026-02-19: Migrated to paper_trades + paper_pending_orders. Keep as read-only backup for 30 days.';
COMMENT ON TABLE paper_trading_stop_orders IS 'DEPRECATED 2026-02-19: TP/SL now stored on paper_trades row. Keep as read-only backup for 30 days.';

COMMIT;
