-- ========================================
-- Migration: Add Take Profit / Stop Loss to Holdings
-- Date: 2025-01-20
-- Purpose: Add TP/SL columns to paper_trading_holdings table
-- ========================================

-- Add take_profit and stop_loss columns to paper_trading_holdings
ALTER TABLE paper_trading_holdings
ADD COLUMN IF NOT EXISTS take_profit DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(20,8);

-- Add indexes for TP/SL lookups
CREATE INDEX IF NOT EXISTS idx_paper_holdings_take_profit
ON paper_trading_holdings(take_profit)
WHERE take_profit IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paper_holdings_stop_loss
ON paper_trading_holdings(stop_loss)
WHERE stop_loss IS NOT NULL;

-- Add column comments for documentation
COMMENT ON COLUMN paper_trading_holdings.take_profit IS 'Take profit target price - automatically close position when profit target reached';
COMMENT ON COLUMN paper_trading_holdings.stop_loss IS 'Stop loss trigger price - automatically close position when loss limit reached';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify migration success
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'paper_trading_holdings'
  AND column_name IN ('take_profit', 'stop_loss');

  IF column_count = 2 THEN
    RAISE NOTICE '✅ Migration successful: take_profit and stop_loss columns added to paper_trading_holdings';
  ELSE
    RAISE WARNING '⚠️  Migration incomplete: Only % of 2 columns found', column_count;
  END IF;
END $$;
