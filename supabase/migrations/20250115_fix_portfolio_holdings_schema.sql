-- ========================================
-- FIX PORTFOLIO HOLDINGS SCHEMA
-- Add missing columns for Portfolio Tracker v2
-- ========================================

-- Add missing columns to portfolio_holdings
ALTER TABLE portfolio_holdings
  ADD COLUMN IF NOT EXISTS avg_entry_price DECIMAL(20, 8),
  ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(20, 8),
  ADD COLUMN IF NOT EXISTS take_profit DECIMAL(20, 8),
  ADD COLUMN IF NOT EXISTS pattern_type TEXT,
  ADD COLUMN IF NOT EXISTS unrealized_pnl DECIMAL(20, 2),
  ADD COLUMN IF NOT EXISTS unrealized_pnl_percent DECIMAL(10, 4);

-- Migrate data from avg_buy_price to avg_entry_price (if exists)
UPDATE portfolio_holdings
SET avg_entry_price = avg_buy_price
WHERE avg_entry_price IS NULL;

-- Update profit_loss to unrealized_pnl
UPDATE portfolio_holdings
SET unrealized_pnl = profit_loss
WHERE unrealized_pnl IS NULL;

-- Update profit_loss_percent to unrealized_pnl_percent
UPDATE portfolio_holdings
SET unrealized_pnl_percent = profit_loss_percent
WHERE unrealized_pnl_percent IS NULL;

-- Add NOT NULL constraint to avg_entry_price (after migration)
ALTER TABLE portfolio_holdings
  ALTER COLUMN avg_entry_price SET NOT NULL;

-- Create index for pattern_type
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_pattern_type ON portfolio_holdings(pattern_type);

-- Force Supabase to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Portfolio holdings schema updated successfully!';
  RAISE NOTICE '📋 Added columns: avg_entry_price, stop_loss, take_profit, pattern_type, unrealized_pnl, unrealized_pnl_percent';
END $$;
