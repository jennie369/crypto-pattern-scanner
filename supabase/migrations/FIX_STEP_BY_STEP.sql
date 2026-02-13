-- =====================================================
-- FIX DATABASE ERRORS - STEP BY STEP
-- Run each step separately if errors occur
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
ALTER TABLE gems_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own gem transactions" ON gems_transactions;
CREATE POLICY "Users view own gem transactions" ON gems_transactions FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 3: FIX affiliate_sales table (ADD missing columns)
-- =====================================================
-- First, add partner_id column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'partner_id') THEN
    ALTER TABLE affiliate_sales ADD COLUMN partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'customer_id') THEN
    ALTER TABLE affiliate_sales ADD COLUMN customer_id UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'order_id') THEN
    ALTER TABLE affiliate_sales ADD COLUMN order_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'order_total') THEN
    ALTER TABLE affiliate_sales ADD COLUMN order_total NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'commission') THEN
    ALTER TABLE affiliate_sales ADD COLUMN commission NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'commission_rate') THEN
    ALTER TABLE affiliate_sales ADD COLUMN commission_rate NUMERIC DEFAULT 0.03;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliate_sales' AND column_name = 'status') THEN
    ALTER TABLE affiliate_sales ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Partners view own sales" ON affiliate_sales;
CREATE POLICY "Partners view own sales" ON affiliate_sales FOR SELECT USING (auth.uid() = partner_id);

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
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own partnership" ON partnerships;
CREATE POLICY "Users view own partnership" ON partnerships FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: Create shopify_products table
-- =====================================================
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  handle TEXT,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  tags TEXT[],
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view active products" ON shopify_products;
CREATE POLICY "Anyone view active products" ON shopify_products FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Service role full access products" ON shopify_products;
CREATE POLICY "Service role full access products" ON shopify_products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- STEP 6: Create user_purchases table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_tier TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, product_type)
);
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own purchases" ON user_purchases;
CREATE POLICY "Users view own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 7: Create currency_packages table + seed data
-- =====================================================
CREATE TABLE IF NOT EXISTS currency_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_vnd INT NOT NULL,
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);
ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view active packages" ON currency_packages;
CREATE POLICY "Anyone view active packages" ON currency_packages FOR SELECT USING (is_active = true);

INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured, is_active) VALUES
  ('Starter Pack', 100, 22000, 0, FALSE, TRUE),
  ('Popular Pack', 500, 99000, 50, TRUE, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE, TRUE),
  ('VIP Pack', 5000, 890000, 1000, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: Create get_partnership_status function
-- =====================================================
DROP FUNCTION IF EXISTS get_partnership_status(UUID);
CREATE OR REPLACE FUNCTION get_partnership_status(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_partnership RECORD;
  v_application RECORD;
  v_is_ctv_eligible BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_purchases
    WHERE user_id = user_id_param AND product_type = 'course' AND is_active = true
  ) INTO v_is_ctv_eligible;

  SELECT * INTO v_partnership FROM partnerships WHERE user_id = user_id_param AND status = 'active' LIMIT 1;
  SELECT * INTO v_application FROM partnership_applications WHERE user_id = user_id_param ORDER BY created_at DESC LIMIT 1;

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
    'application_type', v_application.application_type,
    'application_date', v_application.created_at,
    'rejection_reason', v_application.rejection_reason
  );
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 9: Create is_admin_user function + fix RLS
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'ADMIN' OR is_admin = true OR scanner_tier = 'ADMIN' OR chatbot_tier = 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;
CREATE POLICY "Admins can manage all applications" ON partnership_applications FOR ALL TO authenticated USING (is_admin_user() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests FOR ALL TO authenticated USING (is_admin_user() OR auth.uid() = partner_id);

-- =====================================================
-- STEP 10: Fix withdrawal_requests FK to profiles
-- =====================================================
-- Add FK from withdrawal_requests.partner_id to profiles.id
DO $$
BEGIN
  -- Check if FK exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'withdrawal_requests_partner_id_profiles_fkey'
    AND table_name = 'withdrawal_requests'
  ) THEN
    -- Add FK constraint
    ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_partner_id_profiles_fkey
    FOREIGN KEY (partner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Also add missing columns to profiles for the join query
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'affiliate_code') THEN
    ALTER TABLE profiles ADD COLUMN affiliate_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_role') THEN
    ALTER TABLE profiles ADD COLUMN partnership_role TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ctv_tier') THEN
    ALTER TABLE profiles ADD COLUMN ctv_tier INT;
  END IF;
END $$;

-- =====================================================
-- STEP 11: Fix shopify_orders table - add missing columns
-- =====================================================
DO $$
BEGIN
  -- Add financial_status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shopify_orders' AND column_name = 'financial_status') THEN
    ALTER TABLE shopify_orders ADD COLUMN financial_status TEXT;
  END IF;
  -- Add paid_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shopify_orders' AND column_name = 'paid_at') THEN
    ALTER TABLE shopify_orders ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
  -- Add total_price if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shopify_orders' AND column_name = 'total_price') THEN
    ALTER TABLE shopify_orders ADD COLUMN total_price NUMERIC DEFAULT 0;
  END IF;
END $$;

-- If table doesn't exist at all, create it
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id TEXT UNIQUE,
  order_number TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  total_price NUMERIC DEFAULT 0,
  subtotal_price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  financial_status TEXT DEFAULT 'pending',
  fulfillment_status TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  shipping_address JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own orders" ON shopify_orders;
CREATE POLICY "Users view own orders" ON shopify_orders FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'All fixes applied successfully!' as result;
