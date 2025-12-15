-- =============================================
-- GEM Mobile - Portfolio System
-- Issue #22: Portfolio không hoạt động
-- =============================================

-- 1. Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one entry per user per symbol
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_user_symbol
ON public.portfolio_items(user_id, symbol);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_created ON public.portfolio_items(created_at DESC);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can view own portfolio" ON public.portfolio_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can insert own portfolio" ON public.portfolio_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can update own portfolio" ON public.portfolio_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can delete own portfolio" ON public.portfolio_items
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Portfolio Transactions Table (for history)
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE SET NULL,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_tx_user ON public.portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_tx_symbol ON public.portfolio_transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_tx_created ON public.portfolio_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.portfolio_transactions;
CREATE POLICY "Users can view own transactions" ON public.portfolio_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.portfolio_transactions;
CREATE POLICY "Users can insert own transactions" ON public.portfolio_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.portfolio_items IS 'User cryptocurrency portfolio holdings';
COMMENT ON TABLE public.portfolio_transactions IS 'Portfolio transaction history (buy/sell)';
