-- =====================================================
-- CHECK AFFILIATE SYSTEM TABLES & FUNCTIONS
-- Run this in Supabase SQL Editor to verify setup
-- =====================================================

-- 1. CHECK REQUIRED TABLES
SELECT '=== CHECKING TABLES ===' as info;

SELECT
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users',
  'affiliate_profiles',
  'affiliate_referrals',
  'affiliate_sales',
  'affiliate_commissions',
  'commission_sales',
  'shopify_orders',
  'shopify_webhook_logs',
  'pending_tier_upgrades',
  'course_enrollments',
  'monthly_kpi_performance'
)
ORDER BY table_name;

-- 2. CHECK shopify_orders COLUMNS
SELECT '=== SHOPIFY_ORDERS COLUMNS ===' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shopify_orders'
ORDER BY ordinal_position;

-- 3. CHECK affiliate_profiles COLUMNS
SELECT '=== AFFILIATE_PROFILES COLUMNS ===' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'affiliate_profiles'
ORDER BY ordinal_position;

-- 4. CHECK commission_sales COLUMNS (if exists)
SELECT '=== COMMISSION_SALES COLUMNS ===' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'commission_sales'
ORDER BY ordinal_position;

-- 5. CHECK FUNCTIONS
SELECT '=== CHECKING FUNCTIONS ===' as info;

SELECT
  proname as function_name,
  '✅ EXISTS' as status
FROM pg_proc
WHERE proname IN (
  'get_commission_rate',
  'calculate_commission',
  'calculate_commission_v2',
  'process_order_commission',
  'determine_product_type',
  'record_course_enrollment',
  'calculate_monthly_kpi_bonus',
  'get_partner_commission_summary',
  'check_tier_progression'
)
ORDER BY proname;

-- 6. SAMPLE DATA CHECK
SELECT '=== SAMPLE DATA ===' as info;

-- Recent webhook logs
SELECT 'Recent Webhook Logs:' as info;
SELECT id, topic, shopify_id, processed, created_at
FROM shopify_webhook_logs
ORDER BY created_at DESC
LIMIT 5;

-- Recent orders
SELECT 'Recent Shopify Orders:' as info;
SELECT shopify_order_id, email, total_price, financial_status, partner_id, created_at
FROM shopify_orders
ORDER BY created_at DESC
LIMIT 5;

-- Affiliate profiles
SELECT 'Affiliate Profiles:' as info;
SELECT user_id, referral_code, role, ctv_tier, total_sales
FROM affiliate_profiles
LIMIT 5;

-- Commission records
SELECT 'Commission Sales:' as info;
SELECT * FROM commission_sales
ORDER BY created_at DESC
LIMIT 5;

-- 7. TEST COMMISSION RATE FUNCTION (if exists)
SELECT '=== TEST COMMISSION RATES ===' as info;

-- Try calling get_commission_rate if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_commission_rate') THEN
    RAISE NOTICE 'Testing get_commission_rate function...';
    -- Test calls would go here
  ELSE
    RAISE NOTICE 'get_commission_rate function not found';
  END IF;
END $$;

SELECT '=== CHECK COMPLETE ===' as info;
