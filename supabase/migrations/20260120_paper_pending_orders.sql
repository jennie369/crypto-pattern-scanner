-- ========================================
-- Paper Pending Orders Table Migration
-- Created: 2026-01-20
-- Purpose: Create paper_pending_orders table for limit/stop orders
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Create paper_pending_orders table
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.paper_pending_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Symbol info
  symbol TEXT NOT NULL,
  base_asset TEXT,

  -- Order type: 'limit', 'stop_limit', 'stop_market'
  order_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),

  -- Prices
  limit_price DECIMAL(20, 8),
  stop_price DECIMAL(20, 8),
  trigger_type TEXT DEFAULT 'last_price',

  -- Position sizing
  quantity DECIMAL(20, 8) NOT NULL,
  position_size DECIMAL(20, 8) NOT NULL,
  leverage INTEGER DEFAULT 10,
  margin_mode TEXT DEFAULT 'isolated',
  initial_margin DECIMAL(20, 8),

  -- TP/SL
  take_profit DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  tp_trigger_type TEXT DEFAULT 'mark_price',
  sl_trigger_type TEXT DEFAULT 'mark_price',

  -- Order settings
  time_in_force TEXT DEFAULT 'GTC',
  reduce_only BOOLEAN DEFAULT FALSE,

  -- Pattern info
  pattern_type TEXT,
  timeframe TEXT,
  confidence DECIMAL(5, 2),

  -- Status: 'PENDING', 'FILLED', 'CANCELLED', 'EXPIRED'
  status TEXT NOT NULL DEFAULT 'PENDING',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_paper_pending_orders_user_id ON public.paper_pending_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_pending_orders_status ON public.paper_pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_paper_pending_orders_user_status ON public.paper_pending_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_paper_pending_orders_symbol ON public.paper_pending_orders(symbol);

-- RLS Policies
ALTER TABLE public.paper_pending_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pending orders" ON public.paper_pending_orders;
CREATE POLICY "Users can view own pending orders"
  ON public.paper_pending_orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pending orders" ON public.paper_pending_orders;
CREATE POLICY "Users can insert own pending orders"
  ON public.paper_pending_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending orders" ON public.paper_pending_orders;
CREATE POLICY "Users can update own pending orders"
  ON public.paper_pending_orders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pending orders" ON public.paper_pending_orders;
CREATE POLICY "Users can delete own pending orders"
  ON public.paper_pending_orders FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.paper_pending_orders TO authenticated;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_pending_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pending_orders_updated_at ON public.paper_pending_orders;
CREATE TRIGGER set_pending_orders_updated_at
  BEFORE UPDATE ON public.paper_pending_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pending_orders_updated_at();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ paper_pending_orders table created!';
END $$;
