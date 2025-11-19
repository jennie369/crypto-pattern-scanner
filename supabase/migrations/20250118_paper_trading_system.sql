-- ========================================
-- Paper Trading System Migration
-- Created: 2025-01-18
-- Purpose: Complete paper trading with tier-based access control
-- ========================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: Create helper function for tier validation
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.check_tier_access(
  p_user_id UUID,
  p_required_tiers TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_tier TEXT;
  v_tier_expires_at TIMESTAMPTZ;
BEGIN
  -- Get user's scanner tier and expiration
  SELECT scanner_tier, scanner_tier_expires_at
  INTO v_user_tier, v_tier_expires_at
  FROM public.users
  WHERE id = p_user_id;

  -- If user not found, deny access
  IF v_user_tier IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if tier has expired
  IF v_tier_expires_at IS NOT NULL AND v_tier_expires_at < NOW() THEN
    -- Treat expired tier as FREE
    v_user_tier := 'FREE';
  END IF;

  -- Check if user's tier is in the required tiers list
  RETURN v_user_tier = ANY(p_required_tiers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 2: Create paper_trading_accounts table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_trading_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Balance tracking
  balance DECIMAL(20, 2) NOT NULL DEFAULT 100000.00,
  initial_balance DECIMAL(20, 2) NOT NULL DEFAULT 100000.00,

  -- P&L tracking
  total_pnl DECIMAL(20, 2) DEFAULT 0,
  realized_pnl DECIMAL(20, 2) DEFAULT 0,
  unrealized_pnl DECIMAL(20, 2) DEFAULT 0,

  -- Trade statistics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,

  -- Performance metrics
  best_trade DECIMAL(20, 2) DEFAULT 0,
  worst_trade DECIMAL(20, 2) DEFAULT 0,
  avg_win DECIMAL(20, 2) DEFAULT 0,
  avg_loss DECIMAL(20, 2) DEFAULT 0,
  profit_factor DECIMAL(10, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_trade_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_accounts_user_id ON public.paper_trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_accounts_balance ON public.paper_trading_accounts(balance DESC);
CREATE INDEX IF NOT EXISTS idx_paper_accounts_total_pnl ON public.paper_trading_accounts(total_pnl DESC);

-- RLS Policies
ALTER TABLE public.paper_trading_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trading account" ON public.paper_trading_accounts;
CREATE POLICY "Users can view own paper trading account"
  ON public.paper_trading_accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own paper trading account" ON public.paper_trading_accounts;
CREATE POLICY "Users can create own paper trading account"
  ON public.paper_trading_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own paper trading account" ON public.paper_trading_accounts;
CREATE POLICY "Users can update own paper trading account"
  ON public.paper_trading_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 3: Create paper_trading_orders table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_trading_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,

  -- Order details
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,

  -- Fees and P&L
  fee DECIMAL(20, 8) DEFAULT 0,
  pnl DECIMAL(20, 2) DEFAULT 0,
  pnl_percentage DECIMAL(10, 4) DEFAULT 0,

  -- Order status
  status TEXT DEFAULT 'filled' CHECK (status IN ('filled', 'cancelled', 'rejected')),

  -- Associated stop order (if any)
  stop_order_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_orders_user_id ON public.paper_trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_account_id ON public.paper_trading_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_symbol ON public.paper_trading_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_orders_created_at ON public.paper_trading_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_orders_user_symbol ON public.paper_trading_orders(user_id, symbol);

-- RLS Policies
ALTER TABLE public.paper_trading_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trading orders" ON public.paper_trading_orders;
CREATE POLICY "Users can view own paper trading orders"
  ON public.paper_trading_orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own paper trading orders" ON public.paper_trading_orders;
CREATE POLICY "Users can create own paper trading orders"
  ON public.paper_trading_orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    -- All tiers can create basic orders, but FREE has daily limit (checked in application layer)
    public.check_tier_access(auth.uid(), ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3'])
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 4: Create paper_trading_holdings table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_trading_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,

  -- Position details
  symbol TEXT NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(20, 8) NOT NULL,
  total_cost DECIMAL(20, 2) NOT NULL,

  -- Real-time P&L (updated by application)
  current_price DECIMAL(20, 8),
  current_value DECIMAL(20, 2),
  unrealized_pnl DECIMAL(20, 2) DEFAULT 0,
  pnl_percentage DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_price_update TIMESTAMPTZ,

  UNIQUE(user_id, symbol),
  CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_holdings_user_id ON public.paper_trading_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_holdings_account_id ON public.paper_trading_holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_holdings_symbol ON public.paper_trading_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_holdings_unrealized_pnl ON public.paper_trading_holdings(unrealized_pnl DESC);

-- RLS Policies
ALTER TABLE public.paper_trading_holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper trading holdings" ON public.paper_trading_holdings;
CREATE POLICY "Users can view own paper trading holdings"
  ON public.paper_trading_holdings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own paper trading holdings" ON public.paper_trading_holdings;
CREATE POLICY "Users can manage own paper trading holdings"
  ON public.paper_trading_holdings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 5: Create paper_trading_stop_orders table (TIER1+ only)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_trading_stop_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES public.paper_trading_holdings(id) ON DELETE CASCADE,

  -- Stop order details
  symbol TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('stop_loss', 'take_profit')),
  trigger_price DECIMAL(20, 8) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,

  -- Execution details
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'cancelled', 'expired')),
  triggered_at TIMESTAMPTZ,
  executed_order_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_stop_orders_user_id ON public.paper_trading_stop_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_stop_orders_account_id ON public.paper_trading_stop_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_stop_orders_symbol ON public.paper_trading_stop_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_stop_orders_status ON public.paper_trading_stop_orders(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_paper_stop_orders_holding ON public.paper_trading_stop_orders(holding_id);

-- RLS Policies
ALTER TABLE public.paper_trading_stop_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own paper stop orders" ON public.paper_trading_stop_orders;
CREATE POLICY "Users can view own paper stop orders"
  ON public.paper_trading_stop_orders FOR SELECT
  USING (auth.uid() = user_id);

-- CRITICAL: Only TIER1+ can create stop orders
DROP POLICY IF EXISTS "TIER1+ can create stop orders" ON public.paper_trading_stop_orders;
CREATE POLICY "TIER1+ can create stop orders"
  ON public.paper_trading_stop_orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    public.check_tier_access(auth.uid(), ARRAY['TIER1', 'TIER2', 'TIER3'])
  );

DROP POLICY IF EXISTS "Users can update own stop orders" ON public.paper_trading_stop_orders;
CREATE POLICY "Users can update own stop orders"
  ON public.paper_trading_stop_orders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stop orders" ON public.paper_trading_stop_orders;
CREATE POLICY "Users can delete own stop orders"
  ON public.paper_trading_stop_orders FOR DELETE
  USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 6: Create triggers for automatic updates
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_paper_trading_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_paper_accounts_updated_at ON public.paper_trading_accounts;
CREATE TRIGGER set_paper_accounts_updated_at
  BEFORE UPDATE ON public.paper_trading_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paper_trading_updated_at();

DROP TRIGGER IF EXISTS set_paper_holdings_updated_at ON public.paper_trading_holdings;
CREATE TRIGGER set_paper_holdings_updated_at
  BEFORE UPDATE ON public.paper_trading_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paper_trading_updated_at();

DROP TRIGGER IF EXISTS set_paper_stop_orders_updated_at ON public.paper_trading_stop_orders;
CREATE TRIGGER set_paper_stop_orders_updated_at
  BEFORE UPDATE ON public.paper_trading_stop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paper_trading_updated_at();

-- Trigger to auto-create paper trading account for new users
CREATE OR REPLACE FUNCTION public.handle_new_paper_trading_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.paper_trading_accounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_paper_account ON public.users;
CREATE TRIGGER on_user_created_paper_account
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_paper_trading_account();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 7: Create helper functions for tier limits
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to get daily trade limit by tier
CREATE OR REPLACE FUNCTION public.get_daily_trade_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_user_tier TEXT;
  v_tier_expires_at TIMESTAMPTZ;
BEGIN
  SELECT scanner_tier, scanner_tier_expires_at
  INTO v_user_tier, v_tier_expires_at
  FROM public.users
  WHERE id = p_user_id;

  -- Check expiration
  IF v_tier_expires_at IS NOT NULL AND v_tier_expires_at < NOW() THEN
    v_user_tier := 'FREE';
  END IF;

  -- Return limit based on tier
  CASE v_user_tier
    WHEN 'FREE' THEN RETURN 10;
    WHEN 'TIER1' THEN RETURN 50;
    WHEN 'TIER2' THEN RETURN 999999; -- Unlimited
    WHEN 'TIER3' THEN RETURN 999999; -- Unlimited
    ELSE RETURN 10; -- Default to FREE
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached daily trade limit
CREATE OR REPLACE FUNCTION public.check_daily_trade_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_today_trades INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get today's trade count
  SELECT COUNT(*)
  INTO v_today_trades
  FROM public.paper_trading_orders
  WHERE user_id = p_user_id
  AND created_at >= CURRENT_DATE;

  -- Get user's limit
  v_limit := public.get_daily_trade_limit(p_user_id);

  -- Return true if under limit
  RETURN v_today_trades < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 8: Grant permissions
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRANT ALL ON public.paper_trading_accounts TO authenticated;
GRANT ALL ON public.paper_trading_orders TO authenticated;
GRANT ALL ON public.paper_trading_holdings TO authenticated;
GRANT ALL ON public.paper_trading_stop_orders TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.check_tier_access(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_trade_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_daily_trade_limit(UUID) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 9: Reload schema and summary
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTIFY pgrst, 'reload schema';

DO $$
DECLARE
  account_count INTEGER;
  order_count INTEGER;
  holding_count INTEGER;
  stop_order_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO account_count FROM public.paper_trading_accounts;
  SELECT COUNT(*) INTO order_count FROM public.paper_trading_orders;
  SELECT COUNT(*) INTO holding_count FROM public.paper_trading_holdings;
  SELECT COUNT(*) INTO stop_order_count FROM public.paper_trading_stop_orders;

  RAISE NOTICE '✅ Paper Trading System migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '   - paper_trading_accounts (% rows)', account_count;
  RAISE NOTICE '   - paper_trading_orders (% rows)', order_count;
  RAISE NOTICE '   - paper_trading_holdings (% rows)', holding_count;
  RAISE NOTICE '   - paper_trading_stop_orders (% rows - TIER1+ only)', stop_order_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Tier access control:';
  RAISE NOTICE '   - FREE: Basic paper trading (10 trades/day, no stop orders)';
  RAISE NOTICE '   - TIER1: Stop-loss/Take-profit + 50 trades/day';
  RAISE NOTICE '   - TIER2: Performance analytics + unlimited trades';
  RAISE NOTICE '   - TIER3: Advanced analytics + export data';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Features:';
  RAISE NOTICE '   - RLS policies with tier validation';
  RAISE NOTICE '   - Auto-create account for new users';
  RAISE NOTICE '   - Helper functions for tier checks';
  RAISE NOTICE '   - Daily trade limit enforcement';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Initial balance: 100,000 USDT per account';
END $$;
