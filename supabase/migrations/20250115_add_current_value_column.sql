-- ========================================
-- ADD CURRENT_VALUE COLUMN
-- Frontend uses 'current_value' but DB has 'total_value'
-- ========================================

-- Add missing columns
ALTER TABLE portfolio_holdings
  ADD COLUMN IF NOT EXISTS current_value DECIMAL(20, 2),
  ADD COLUMN IF NOT EXISTS total_cost DECIMAL(20, 2);

-- Migrate data from total_value to current_value
UPDATE portfolio_holdings
SET current_value = total_value
WHERE current_value IS NULL;

-- Calculate total_cost from quantity * avg_entry_price
UPDATE portfolio_holdings
SET total_cost = quantity * avg_entry_price
WHERE total_cost IS NULL;

-- Create a trigger to auto-calculate values
CREATE OR REPLACE FUNCTION sync_portfolio_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate total_cost from quantity * avg_entry_price
  IF NEW.quantity IS NOT NULL AND NEW.avg_entry_price IS NOT NULL THEN
    NEW.total_cost = NEW.quantity * NEW.avg_entry_price;
  END IF;

  -- Auto-calculate current_value from quantity * current_price
  IF NEW.current_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
    NEW.current_value = NEW.quantity * NEW.current_price;
    NEW.total_value = NEW.current_value;
  END IF;

  -- Auto-calculate unrealized_pnl and unrealized_pnl_percent
  IF NEW.current_value IS NOT NULL AND NEW.total_cost IS NOT NULL THEN
    NEW.unrealized_pnl = NEW.current_value - NEW.total_cost;

    IF NEW.total_cost > 0 THEN
      NEW.unrealized_pnl_percent = ((NEW.current_value - NEW.total_cost) / NEW.total_cost) * 100;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_portfolio_current_value ON portfolio_holdings;
DROP TRIGGER IF EXISTS trigger_sync_portfolio_calculated_fields ON portfolio_holdings;
CREATE TRIGGER trigger_sync_portfolio_calculated_fields
  BEFORE INSERT OR UPDATE ON portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION sync_portfolio_calculated_fields();

-- Force reload schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Portfolio holdings schema fully updated!';
  RAISE NOTICE '📋 Added columns: current_value, total_cost';
  RAISE NOTICE '🔧 Auto-calculation trigger created for:';
  RAISE NOTICE '   - total_cost = quantity * avg_entry_price';
  RAISE NOTICE '   - current_value = quantity * current_price';
  RAISE NOTICE '   - unrealized_pnl = current_value - total_cost';
  RAISE NOTICE '   - unrealized_pnl_percent = ((current_value - total_cost) / total_cost) * 100';
END $$;
