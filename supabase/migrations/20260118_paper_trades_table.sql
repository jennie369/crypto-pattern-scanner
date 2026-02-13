-- ========================================
-- Paper Trades Table Migration
-- Created: 2026-01-18
-- Purpose: Create paper_trades and user_paper_trade_settings tables
--          to match paperTradeService.js expectations
-- ========================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Create user_paper_trade_settings table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.user_paper_trade_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Balance tracking
  balance DECIMAL(20, 8) NOT NULL DEFAULT 10000.00,
  initial_balance DECIMAL(20, 8) NOT NULL DEFAULT 10000.00,

  -- Statistics
  total_trades INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_pnl DECIMAL(20, 8) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_paper_trade_settings_user_id
  ON public.user_paper_trade_settings(user_id);

-- RLS Policies
ALTER TABLE public.user_paper_trade_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trade settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can view own paper trade settings"
  ON public.user_paper_trade_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own paper trade settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can insert own paper trade settings"
  ON public.user_paper_trade_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own paper trade settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can update own paper trade settings"
  ON public.user_paper_trade_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Create paper_trades table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Trade details
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  pattern_type TEXT,
  timeframe TEXT,

  -- Prices
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  exit_price DECIMAL(20, 8),

  -- Position sizing
  position_size DECIMAL(20, 8) NOT NULL,
  margin DECIMAL(20, 8),
  position_value DECIMAL(20, 8),
  quantity DECIMAL(20, 8),
  leverage INTEGER DEFAULT 10,
  confidence DECIMAL(5, 2),

  -- Status
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'PENDING', 'CANCELLED')),
  order_type TEXT DEFAULT 'MARKET' CHECK (order_type IN ('MARKET', 'LIMIT')),
  exit_reason TEXT,
  result TEXT CHECK (result IN ('WIN', 'LOSS', 'BREAKEVEN', NULL)),

  -- P&L
  realized_pnl DECIMAL(20, 8),
  realized_pnl_percent DECIMAL(10, 4),

  -- Timestamps
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  pending_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  holding_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Dual Mode fields
  trade_mode TEXT DEFAULT 'pattern' CHECK (trade_mode IN ('pattern', 'custom')),
  pattern_entry DECIMAL(20, 8),
  pattern_sl DECIMAL(20, 8),
  pattern_tp DECIMAL(20, 8),
  entry_deviation_percent DECIMAL(10, 4) DEFAULT 0,
  sl_deviation_percent DECIMAL(10, 4) DEFAULT 0,
  tp_deviation_percent DECIMAL(10, 4) DEFAULT 0,

  -- AI Analysis
  ai_score INTEGER DEFAULT 0,
  ai_feedback JSONB,

  -- Pattern data for chart
  pattern_data JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_trades_user_id ON public.paper_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_trades_status ON public.paper_trades(status);
CREATE INDEX IF NOT EXISTS idx_paper_trades_user_status ON public.paper_trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_paper_trades_symbol ON public.paper_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_trades_opened_at ON public.paper_trades(opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trades_closed_at ON public.paper_trades(closed_at DESC);

-- RLS Policies
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trades" ON public.paper_trades;
CREATE POLICY "Users can view own paper trades"
  ON public.paper_trades FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own paper trades" ON public.paper_trades;
CREATE POLICY "Users can insert own paper trades"
  ON public.paper_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own paper trades" ON public.paper_trades;
CREATE POLICY "Users can update own paper trades"
  ON public.paper_trades FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own paper trades" ON public.paper_trades;
CREATE POLICY "Users can delete own paper trades"
  ON public.paper_trades FOR DELETE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Create trigger for updated_at
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.handle_paper_trades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_paper_trades_updated_at ON public.paper_trades;
CREATE TRIGGER set_paper_trades_updated_at
  BEFORE UPDATE ON public.paper_trades
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paper_trades_updated_at();

DROP TRIGGER IF EXISTS set_user_paper_trade_settings_updated_at ON public.user_paper_trade_settings;
CREATE TRIGGER set_user_paper_trade_settings_updated_at
  BEFORE UPDATE ON public.user_paper_trade_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paper_trades_updated_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Grant permissions
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRANT ALL ON public.paper_trades TO authenticated;
GRANT ALL ON public.user_paper_trade_settings TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Reload schema cache
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Paper Trades migration completed!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '   - paper_trades (for position tracking)';
  RAISE NOTICE '   - user_paper_trade_settings (for balance/settings)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS policies enabled for user-level security';
  RAISE NOTICE '';
  RAISE NOTICE '💰 Default initial balance: $10,000 USDT';
END $$;
