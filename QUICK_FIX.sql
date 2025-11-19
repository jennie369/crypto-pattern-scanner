-- ========================================
-- QUICK FIX: Supabase Schema Cache Issue
-- ========================================
-- Run these queries in order in Supabase SQL Editor
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor

-- STEP 1: Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'backtest%';

-- Expected: If returns rows, tables exist (go to STEP 2)
-- If empty, tables don't exist (skip to STEP 3)

-- ========================================

-- STEP 2: Drop old tables (ONLY if they exist from STEP 1)
DROP TABLE IF EXISTS backtesttrades CASCADE;
DROP TABLE IF EXISTS backtestresults CASCADE;
DROP TABLE IF EXISTS backtestconfigs CASCADE;
DROP TABLE IF EXISTS ai_predictions CASCADE;
DROP TABLE IF EXISTS whale_alerts CASCADE;
DROP TABLE IF EXISTS whale_transactions CASCADE;
DROP TABLE IF EXISTS whale_wallets CASCADE;

-- ========================================

-- STEP 3: Deploy full migration
-- Open the migration file: supabase/migrations/20250110_tier3_elite_tools.sql
-- Copy ALL its contents and paste here, then run

-- ========================================

-- STEP 4: Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- ========================================

-- STEP 5: Grant TIER 3 access
UPDATE profiles
SET scanner_tier = 'TIER3'
WHERE email = 'your-email@example.com';  -- ⚠️ Replace with your actual email

-- ========================================

-- STEP 6: Verify avg_loss column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'backtestresults'
  AND column_name = 'avg_loss';

-- Expected: Should return 'avg_loss'
-- If empty, schema cache not refreshed - wait 30 seconds and re-run STEP 4

-- ========================================

-- STEP 7: Verify TIER 3 access
SELECT id, email, scanner_tier, course_tier
FROM profiles
WHERE id = auth.uid();

-- Expected: scanner_tier should be 'TIER3'

-- ========================================
-- ✅ DONE! Test backtesting at:
-- http://localhost:5173/tier3/backtesting
-- ========================================
