-- =====================================================
-- FIX ALL DATABASE ERRORS
-- Run this in Supabase SQL Editor
-- Date: 2025-11-28
-- =====================================================

-- =====================================================
-- STEP 1: Add gems column to profiles
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gems INT DEFAULT 0;

-- =====================================================
-- STEP 2: Create gems_transactions table
-- =====================================================
CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id TEXT,
  balance_before INT,
  balance_after INT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gems_tx_user ON gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_tx_type ON gems_transactions(type);

ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own gem transactions" ON gems_transactions;
CREATE POLICY "Users view own gem transactions" ON gems_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 3: Create affiliate_sales table
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  order_id TEXT,
  order_number TEXT,
  order_total NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0.03,
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aff_sales_partner ON affiliate_sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_aff_sales_status ON affiliate_sales(status);

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners view own sales" ON affiliate_sales;
CREATE POLICY "Partners view own sales" ON affiliate_sales
  FOR SELECT USING (auth.uid() = partner_id);

-- =====================================================
-- STEP 4: Create partnerships table
-- =====================================================
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'affiliate',
  affiliate_code TEXT UNIQUE,
  ctv_tier INT DEFAULT 1,
  total_commission NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  withdrawn_total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnerships_user ON partnerships(user_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_code ON partnerships(affiliate_code);

ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own partnership" ON partnerships;
CREATE POLICY "Users view own partnership" ON partnerships
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: Create shopify_products table
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
  price NUMERIC DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_shop_products_handle ON shopify_products(handle);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shopify_products(status);

ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view active products" ON shopify_products;
CREATE POLICY "Anyone view active products" ON shopify_products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role full access products" ON shopify_products;
CREATE POLICY "Service role full access products" ON shopify_products
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- STEP 6: Create user_purchases table if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_tier TEXT,
  product_name TEXT,
  purchase_price NUMERIC,
  currency TEXT DEFAULT 'VND',
  shopify_order_id TEXT,
  is_subscription BOOLEAN DEFAULT false,
  subscription_interval TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, product_type)
);

ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own purchases" ON user_purchases;
CREATE POLICY "Users view own purchases" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 7: Create/Replace get_partnership_status function
-- =====================================================
CREATE OR REPLACE FUNCTION get_partnership_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_partnership RECORD;
  v_application RECORD;
  v_is_ctv_eligible BOOLEAN := false;
BEGIN
  -- Check if user has purchased any course
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

  -- Check for application
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
    'partnership_role', COALESCE(v_partnership.role, NULL),
    'affiliate_code', COALESCE(v_partnership.affiliate_code, NULL),
    'ctv_tier', COALESCE(v_partnership.ctv_tier, NULL),
    'total_commission', COALESCE(v_partnership.total_commission, 0),
    'available_balance', COALESCE(v_partnership.available_balance, 0),
    'application_status', COALESCE(v_application.status, NULL),
    'application_type', COALESCE(v_application.application_type, NULL),
    'application_date', v_application.created_at,
    'rejection_reason', v_application.rejection_reason
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: Fix Admin RLS policies with is_admin_user function
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (
      role = 'admin'
      OR role = 'ADMIN'
      OR is_admin = true
      OR scanner_tier = 'ADMIN'
      OR chatbot_tier = 'ADMIN'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix partnership_applications RLS for admins
DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;
CREATE POLICY "Admins can manage all applications"
  ON partnership_applications FOR ALL
  TO authenticated
  USING (is_admin_user() OR auth.uid() = user_id);

-- Fix withdrawal_requests RLS for admins
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  TO authenticated
  USING (is_admin_user() OR auth.uid() = partner_id);

-- =====================================================
-- STEP 9: Create currency_packages table
-- =====================================================
CREATE TABLE IF NOT EXISTS currency_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_vnd INT NOT NULL,
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view active packages" ON currency_packages;
CREATE POLICY "Anyone view active packages" ON currency_packages
  FOR SELECT USING (is_active = true);

-- Insert default packages
INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured, is_active) VALUES
  ('Starter Pack', 100, 22000, 0, FALSE, TRUE),
  ('Popular Pack', 500, 99000, 50, TRUE, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE, TRUE),
  ('VIP Pack', 5000, 890000, 1000, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'All tables created successfully!' as result;

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'gems_transactions',
  'affiliate_sales',
  'partnerships',
  'shopify_products',
  'user_purchases',
  'currency_packages'
)
ORDER BY table_name;
