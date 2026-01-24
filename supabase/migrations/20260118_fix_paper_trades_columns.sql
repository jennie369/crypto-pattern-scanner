-- ========================================
-- Fix Paper Trades Table - Add Missing Columns
-- Created: 2026-01-18
-- Purpose: Add missing columns to match paperTradeService.js
-- ========================================

-- Add 'direction' column (map from 'side' or add new)
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS direction TEXT;

-- Add 'entry_price' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS entry_price DECIMAL(20, 8);

-- Add 'position_size' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS position_size DECIMAL(20, 8);

-- Add 'timeframe' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS timeframe TEXT;

-- Add 'exit_reason' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS exit_reason TEXT;

-- Add 'result' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS result TEXT;

-- Add 'realized_pnl' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS realized_pnl DECIMAL(20, 8);

-- Add 'realized_pnl_percent' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS realized_pnl_percent DECIMAL(10, 4);

-- Add 'pattern_data' column for storing full pattern JSON
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS pattern_data JSONB;

-- Add 'updated_at' column
ALTER TABLE public.paper_trades
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate existing data: copy 'side' to 'direction' if direction is null
UPDATE public.paper_trades
SET direction = CASE
  WHEN side = 'buy' THEN 'LONG'
  WHEN side = 'sell' THEN 'SHORT'
  ELSE side
END
WHERE direction IS NULL AND side IS NOT NULL;

-- Migrate existing data: copy 'price' to 'entry_price' if entry_price is null
UPDATE public.paper_trades
SET entry_price = price
WHERE entry_price IS NULL AND price IS NOT NULL;

-- Migrate existing data: copy 'total_value' to 'position_size' if position_size is null
UPDATE public.paper_trades
SET position_size = total_value
WHERE position_size IS NULL AND total_value IS NOT NULL;

-- Migrate existing data: copy 'pnl' to 'realized_pnl' if realized_pnl is null
UPDATE public.paper_trades
SET realized_pnl = pnl
WHERE realized_pnl IS NULL AND pnl IS NOT NULL;

-- Migrate existing data: copy 'pnl_percent' to 'realized_pnl_percent' if realized_pnl_percent is null
UPDATE public.paper_trades
SET realized_pnl_percent = pnl_percent
WHERE realized_pnl_percent IS NULL AND pnl_percent IS NOT NULL;

-- Create user_paper_trade_settings if not exists
CREATE TABLE IF NOT EXISTS public.user_paper_trade_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 10000.00,
  initial_balance DECIMAL(20, 8) NOT NULL DEFAULT 10000.00,
  total_trades INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_pnl DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_paper_trade_settings
ALTER TABLE public.user_paper_trade_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can view own settings"
  ON public.user_paper_trade_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can insert own settings"
  ON public.user_paper_trade_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_paper_trade_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_paper_trade_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_paper_trade_settings TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_paper_trades_direction ON public.paper_trades(direction);
CREATE INDEX IF NOT EXISTS idx_paper_trades_entry_price ON public.paper_trades(entry_price);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns were added
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'paper_trades'
  AND column_name IN ('direction', 'entry_price', 'position_size', 'realized_pnl');

  RAISE NOTICE '✅ Added/verified % required columns to paper_trades', col_count;

  -- Check user_paper_trade_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_paper_trade_settings') THEN
    RAISE NOTICE '✅ user_paper_trade_settings table exists';
  ELSE
    RAISE NOTICE '❌ user_paper_trade_settings table NOT created';
  END IF;
END $$;
