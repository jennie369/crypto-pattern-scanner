-- =====================================================
-- FIX ADMIN RLS POLICIES
-- Date: 2025-11-28
-- Description: Update RLS policies to match AuthContext admin check
-- =====================================================

-- Create helper function for admin check
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

-- =====================================================
-- FIX PARTNERSHIP_APPLICATIONS RLS POLICIES
-- =====================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;

-- Create new admin policy with correct logic
CREATE POLICY "Admins can manage all applications"
  ON partnership_applications FOR ALL
  TO authenticated
  USING (is_admin_user());

-- =====================================================
-- FIX WITHDRAWAL_REQUESTS RLS POLICIES
-- =====================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;

-- Create new admin policy with correct logic
CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  TO authenticated
  USING (is_admin_user());

-- =====================================================
-- CREATE CURRENCY_PACKAGES TABLE IF NOT EXISTS
-- =====================================================

-- Create table if it doesn't exist (should exist from 20251127_12_major_features.sql)
CREATE TABLE IF NOT EXISTS currency_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_vnd INT NOT NULL,
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;

-- Create policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'currency_packages'
    AND policyname = 'Currency packages are viewable by everyone'
  ) THEN
    CREATE POLICY "Currency packages are viewable by everyone"
      ON currency_packages FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- Ensure currency_packages has seed data
INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured, is_active) VALUES
  ('Starter Pack', 100, 22000, 0, FALSE, TRUE),
  ('Popular Pack', 500, 99000, 50, TRUE, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE, TRUE),
  ('VIP Pack', 5000, 890000, 1000, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check function exists
SELECT 'is_admin_user function' as check_item,
       CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_admin_user')
            THEN 'OK' ELSE 'MISSING' END as status;

-- Check policies exist
SELECT 'partnership_applications admin policy' as check_item,
       CASE WHEN EXISTS(
         SELECT 1 FROM pg_policies
         WHERE tablename = 'partnership_applications'
         AND policyname = 'Admins can manage all applications'
       ) THEN 'OK' ELSE 'MISSING' END as status;

SELECT 'withdrawal_requests admin policy' as check_item,
       CASE WHEN EXISTS(
         SELECT 1 FROM pg_policies
         WHERE tablename = 'withdrawal_requests'
         AND policyname = 'Admins can manage all withdrawals'
       ) THEN 'OK' ELSE 'MISSING' END as status;

-- Check currency packages
SELECT 'currency_packages data' as check_item,
       CASE WHEN (SELECT COUNT(*) FROM currency_packages WHERE is_active = true) >= 4
            THEN 'OK' ELSE 'MISSING DATA' END as status;
