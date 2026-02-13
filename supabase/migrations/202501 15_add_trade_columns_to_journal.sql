-- ========================================
-- ADD TRADE COLUMNS TO TRADING JOURNAL
-- Fix: Add missing columns for trade tracking
-- ========================================

-- Add trade-related columns to trading_journal table
ALTER TABLE public.trading_journal
  ADD COLUMN IF NOT EXISTS symbol TEXT,
  ADD COLUMN IF NOT EXISTS position_type TEXT CHECK (position_type IN ('long', 'short')),
  ADD COLUMN IF NOT EXISTS entry_price DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS exit_price DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS quantity DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS take_profit DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS pattern_used TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS profit_loss DECIMAL(18, 8),
  ADD COLUMN IF NOT EXISTS profit_loss_percent DECIMAL(10, 4),
  ADD COLUMN IF NOT EXISTS exit_date DATE;

-- Update the title constraint to be nullable (for trades that might not have a title)
ALTER TABLE public.trading_journal
  ALTER COLUMN title DROP NOT NULL;

-- Create indexes for trade queries
CREATE INDEX IF NOT EXISTS idx_trading_journal_symbol ON public.trading_journal(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_journal_position_type ON public.trading_journal(position_type);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Trade columns added to trading_journal table!';
  RAISE NOTICE '📊 New columns: symbol, position_type, entry_price, exit_price, quantity, stop_loss, take_profit, pattern_used, notes, profit_loss, profit_loss_percent, exit_date';
END $$;
