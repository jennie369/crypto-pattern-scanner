-- =====================================================
-- FIX MISSING TABLES AND COLUMNS
-- Date: 2025-11-28
-- Description: Create missing tables and add missing columns
-- Errors fixed:
-- 1. gems_transactions - 404 (table doesn't exist)
-- 2. affiliate_sales.partner_id - 400 (column doesn't exist)
-- 3. profiles.gems - 400 (column doesn't exist)
-- 4. get_partnership_status - financial_status column
-- =====================================================

-- =====================================================
-- 1. ADD GEMS COLUMN TO PROFILES
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'gems'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gems INT DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE GEMS_TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction type
  type TEXT NOT NULL CHECK (type IN ('purchase', 'earning', 'spending', 'gift', 'refund', 'bonus')),

  -- Amount (positive for additions, stored as positive always)
  amount INT NOT NULL,

  -- Description
  description TEXT,
  reference_type TEXT, -- 'order', 'gift', 'tip', 'boost', etc.
  reference_id TEXT,   -- ID of the related entity

  -- Balance tracking
  balance_before INT,
  balance_after INT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gems_transactions_user ON gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_type ON gems_transactions(type);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created ON gems_transactions(created_at DESC);

-- RLS
ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON gems_transactions;
CREATE POLICY "Users can view own transactions"
  ON gems_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access gems_transactions" ON gems_transactions;
CREATE POLICY "Service role full access gems_transactions"
  ON gems_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. CREATE/FIX AFFILIATE_SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Partner who made the referral
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Customer who made the purchase (via referral)
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Order info
  order_id TEXT,
  order_number TEXT,
  order_total NUMERIC NOT NULL DEFAULT 0,

  -- Commission
  commission NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.03, -- 3% default

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),

  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table exists but missing partner_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'affiliate_sales' AND column_name = 'partner_id'
  ) THEN
    ALTER TABLE affiliate_sales ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_partner ON affiliate_sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_status ON affiliate_sales(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_created ON affiliate_sales(created_at DESC);

-- RLS
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own sales" ON affiliate_sales;
CREATE POLICY "Partners can view own sales"
  ON affiliate_sales FOR SELECT
  USING (auth.uid() = partner_id);

-- =====================================================
-- 4. FIX PARTNERSHIP_APPLICATIONS TABLE
-- Add financial_status column if missing
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partnership_applications' AND column_name = 'financial_status'
  ) THEN
    ALTER TABLE partnership_applications ADD COLUMN financial_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- =====================================================
-- 5. FIX/CREATE GET_PARTNERSHIP_STATUS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_partnership_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_partnership RECORD;
  v_application RECORD;
  v_is_ctv_eligible BOOLEAN := false;
BEGIN
  -- Check if user has purchased any course (makes them CTV eligible)
  SELECT EXISTS (
    SELECT 1 FROM user_purchases
    WHERE user_id = p_user_id
    AND product_type = 'course'
    AND is_active = true
  ) INTO v_is_ctv_eligible;

  -- Check for active partnership
  SELECT * INTO v_partnership
  FROM partnerships
  WHERE user_id = p_user_id
  AND status = 'active'
  LIMIT 1;

  -- Check for pending/rejected application
  SELECT * INTO v_application
  FROM partnership_applications
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Build result
  v_result := jsonb_build_object(
    'has_partnership', v_partnership IS NOT NULL,
    'has_application', v_application IS NOT NULL,
    'is_ctv_eligible', v_is_ctv_eligible,
    'partnership_role', v_partnership.role,
    'affiliate_code', v_partnership.affiliate_code,
    'ctv_tier', v_partnership.ctv_tier,
    'total_commission', COALESCE(v_partnership.total_commission, 0),
    'available_balance', COALESCE(v_partnership.available_balance, 0),
    'application_status', v_application.status,
    'application_type', v_application.type,
    'application_date', v_application.created_at,
    'rejection_reason', v_application.rejection_reason
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE PARTNERSHIPS TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Partnership info
  role TEXT NOT NULL CHECK (role IN ('affiliate', 'ctv')),
  affiliate_code TEXT UNIQUE,
  ctv_tier INT DEFAULT 1 CHECK (ctv_tier >= 1 AND ctv_tier <= 4),

  -- Commission tracking
  total_commission NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  withdrawn_total NUMERIC DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),

  -- Timestamps
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partnerships_user ON partnerships(user_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_code ON partnerships(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);

-- RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own partnership" ON partnerships;
CREATE POLICY "Users can view own partnership"
  ON partnerships FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREATE SHOPIFY_PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  description_html TEXT,
  handle TEXT,
  product_type TEXT,
  vendor TEXT DEFAULT 'Yinyang Masters',
  tags TEXT[],
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC,
  currency TEXT DEFAULT 'VND',
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  inventory_quantity INT DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny',
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopify_products_handle ON shopify_products(handle);
CREATE INDEX IF NOT EXISTS idx_shopify_products_status ON shopify_products(status);
CREATE INDEX IF NOT EXISTS idx_shopify_products_tags ON shopify_products USING gin(tags);

-- RLS
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON shopify_products;
CREATE POLICY "Anyone can view active products"
  ON shopify_products FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Service role full access shopify" ON shopify_products;
CREATE POLICY "Service role full access shopify"
  ON shopify_products FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'profiles.gems' as item,
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gems')
       THEN 'OK' ELSE 'MISSING' END as status
UNION ALL
SELECT 'gems_transactions table',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='gems_transactions')
       THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'affiliate_sales table',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='affiliate_sales')
       THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'partnerships table',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='partnerships')
       THEN 'OK' ELSE 'MISSING' END
UNION ALL
SELECT 'shopify_products table',
  CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='shopify_products')
       THEN 'OK' ELSE 'MISSING' END;
