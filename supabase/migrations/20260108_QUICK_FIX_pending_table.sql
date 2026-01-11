-- =====================================================
-- QUICK FIX: Create ALL missing pending tables
-- Run this in Supabase SQL Editor to fix signup error
-- Date: 2026-01-08
-- =====================================================

-- 1. pending_tier_upgrades (ROOT CAUSE of signup failure)
CREATE TABLE IF NOT EXISTS pending_tier_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(255),
  product_type VARCHAR(50) NOT NULL,
  tier_purchased VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2),
  bundle_scanner_tier VARCHAR(50),
  bundle_chatbot_tier VARCHAR(50),
  bundle_duration_months INTEGER,
  partner_id UUID,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_tier_upgrades_email ON pending_tier_upgrades(email);
CREATE INDEX IF NOT EXISTS idx_pending_tier_upgrades_applied ON pending_tier_upgrades(applied);

-- 2. pending_gem_credits (for gem pack purchases)
CREATE TABLE IF NOT EXISTS pending_gem_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  gems_amount INTEGER NOT NULL,
  pack_name VARCHAR(255),
  order_id VARCHAR(255),
  variant_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  claimed_at TIMESTAMPTZ,
  claimed_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_gem_credits_email ON pending_gem_credits(email);
CREATE INDEX IF NOT EXISTS idx_pending_gem_credits_status ON pending_gem_credits(status);

-- 3. pending_gem_purchases (legacy fallback)
CREATE TABLE IF NOT EXISTS pending_gem_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(255),
  gem_amount INTEGER NOT NULL,
  price_paid DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'VND',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_gem_purchases_email ON pending_gem_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_gem_purchases_applied ON pending_gem_purchases(applied);

-- 4. pending_course_access (for course purchases)
CREATE TABLE IF NOT EXISTS pending_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  course_id UUID NOT NULL,
  shopify_order_id VARCHAR(255),
  access_type VARCHAR(50) DEFAULT 'purchase',
  price_paid DECIMAL(15,2),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_course_access_email ON pending_course_access(email);
CREATE INDEX IF NOT EXISTS idx_pending_course_access_applied ON pending_course_access(applied);

-- Enable RLS on all tables
ALTER TABLE pending_tier_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_gem_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_gem_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_course_access ENABLE ROW LEVEL SECURITY;

-- Service role policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Service role full access" ON pending_tier_upgrades;
  CREATE POLICY "Service role full access" ON pending_tier_upgrades FOR ALL USING (true);

  DROP POLICY IF EXISTS "Service role full access" ON pending_gem_credits;
  CREATE POLICY "Service role full access" ON pending_gem_credits FOR ALL USING (true);

  DROP POLICY IF EXISTS "Service role full access" ON pending_gem_purchases;
  CREATE POLICY "Service role full access" ON pending_gem_purchases FOR ALL USING (true);

  DROP POLICY IF EXISTS "Service role full access" ON pending_course_access;
  CREATE POLICY "Service role full access" ON pending_course_access FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Some policies already exist, continuing...';
END $$;

-- Verify tables exist
SELECT
  'TABLES CREATED:' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pending_tier_upgrades') as pending_tier_upgrades,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pending_gem_credits') as pending_gem_credits,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pending_gem_purchases') as pending_gem_purchases,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pending_course_access') as pending_course_access;
