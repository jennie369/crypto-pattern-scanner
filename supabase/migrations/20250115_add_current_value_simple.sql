-- ========================================
-- ADD CURRENT_VALUE & TOTAL_COST - SIMPLE VERSION
-- Run this step by step in Supabase SQL Editor
-- ========================================

-- STEP 1: Add missing columns
ALTER TABLE portfolio_holdings
  ADD COLUMN IF NOT EXISTS current_value NUMERIC(20, 2),
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(20, 2);

-- STEP 2: Migrate existing data
UPDATE portfolio_holdings
SET
  current_value = COALESCE(total_value, 0),
  total_cost = COALESCE(quantity * avg_entry_price, 0)
WHERE current_value IS NULL OR total_cost IS NULL;

-- STEP 3: Force reload schema cache
NOTIFY pgrst, 'reload schema';
