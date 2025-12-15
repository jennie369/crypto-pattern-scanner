-- =====================================================
-- AFFILIATE & CTV SYSTEM - COMPLETE MIGRATION
-- Date: 2025-12-14
-- Description: Đảm bảo tất cả tables, columns, functions cho Affiliate/CTV system
-- =====================================================

-- =====================================================
-- PART 1: ENSURE PROFILES COLUMNS EXIST
-- =====================================================

DO $$
BEGIN
  -- Affiliate code (unique identifier)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'affiliate_code') THEN
    ALTER TABLE profiles ADD COLUMN affiliate_code VARCHAR(50) UNIQUE;
  END IF;

  -- Partnership role: null (none), 'affiliate', 'ctv'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_role') THEN
    ALTER TABLE profiles ADD COLUMN partnership_role VARCHAR(20);
  END IF;

  -- CTV tier (text: beginner, growing, master, grand)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ctv_tier') THEN
    ALTER TABLE profiles ADD COLUMN ctv_tier VARCHAR(20) DEFAULT 'beginner';
  END IF;

  -- Total commission earned
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_commission') THEN
    ALTER TABLE profiles ADD COLUMN total_commission NUMERIC DEFAULT 0;
  END IF;

  -- Available balance for withdrawal
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'available_balance') THEN
    ALTER TABLE profiles ADD COLUMN available_balance NUMERIC DEFAULT 0;
  END IF;

  -- Total withdrawn
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'withdrawn_total') THEN
    ALTER TABLE profiles ADD COLUMN withdrawn_total NUMERIC DEFAULT 0;
  END IF;

  -- Total sales for tier calculation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_sales') THEN
    ALTER TABLE profiles ADD COLUMN total_sales NUMERIC DEFAULT 0;
  END IF;

  -- Partnership approved date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_approved_at') THEN
    ALTER TABLE profiles ADD COLUMN partnership_approved_at TIMESTAMPTZ;
  END IF;

  -- Expo Push Token for notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'expo_push_token') THEN
    ALTER TABLE profiles ADD COLUMN expo_push_token TEXT;
  END IF;

  -- Legacy push_token column (ensure exists for backwards compatibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'push_token') THEN
    ALTER TABLE profiles ADD COLUMN push_token TEXT;
  END IF;
END $$;

-- =====================================================
-- PART 2: ENSURE AFFILIATE_PROFILES TABLE AND COLUMNS
-- =====================================================

-- Create affiliate_profiles if not exists
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'affiliate',
  ctv_tier TEXT DEFAULT 'beginner',
  referral_code VARCHAR(50),
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'affiliate_profiles_user_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE affiliate_profiles
        ADD CONSTRAINT affiliate_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      -- Constraint already exists
    END;
  END IF;
END $$;

-- Add referral_code column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_profiles' AND column_name = 'referral_code') THEN
    ALTER TABLE affiliate_profiles ADD COLUMN referral_code VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_profiles' AND column_name = 'available_balance') THEN
    ALTER TABLE affiliate_profiles ADD COLUMN available_balance DECIMAL(15,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_profiles' AND column_name = 'total_commission') THEN
    ALTER TABLE affiliate_profiles ADD COLUMN total_commission DECIMAL(15,2) DEFAULT 0;
  END IF;
END $$;

-- RLS for affiliate_profiles
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can view own affiliate profile" ON affiliate_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own affiliate profile" ON affiliate_profiles;
CREATE POLICY "Users can manage own affiliate profile" ON affiliate_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all affiliate profiles" ON affiliate_profiles;
CREATE POLICY "Admins can manage all affiliate profiles" ON affiliate_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- PART 3: ENSURE AFFILIATE_REFERRALS COLUMNS
-- =====================================================

-- Ensure affiliate_referrals has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'product_id') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN product_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'product_type') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN product_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'ip_address') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN ip_address TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'user_agent') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN user_agent TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'referrer_url') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN referrer_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'landing_page') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN landing_page TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'clicked_at') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN clicked_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'converted_at') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN converted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'order_id') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN order_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'affiliate_referrals' AND column_name = 'order_amount') THEN
    ALTER TABLE affiliate_referrals ADD COLUMN order_amount NUMERIC;
  END IF;
END $$;

-- =====================================================
-- PART 4: HELPER FUNCTION - Get Commission Rate
-- =====================================================

CREATE OR REPLACE FUNCTION get_commission_rate(
  p_role TEXT,
  p_tier TEXT,
  p_product_type TEXT DEFAULT 'digital'
)
RETURNS NUMERIC AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  -- Affiliate always gets 3%
  IF p_role = 'affiliate' THEN
    RETURN 0.03;
  END IF;

  -- CTV rates based on tier and product type
  IF p_role = 'ctv' THEN
    IF p_product_type = 'physical' THEN
      -- Physical product rates
      CASE p_tier
        WHEN 'beginner' THEN v_rate := 0.05;
        WHEN 'growing' THEN v_rate := 0.07;
        WHEN 'master' THEN v_rate := 0.10;
        WHEN 'grand' THEN v_rate := 0.15;
        ELSE v_rate := 0.05;
      END CASE;
    ELSE
      -- Digital product rates (courses, scanner, chatbot)
      CASE p_tier
        WHEN 'beginner' THEN v_rate := 0.10;
        WHEN 'growing' THEN v_rate := 0.15;
        WHEN 'master' THEN v_rate := 0.20;
        WHEN 'grand' THEN v_rate := 0.30;
        ELSE v_rate := 0.10;
      END CASE;
    END IF;
    RETURN v_rate;
  END IF;

  -- Default
  RETURN 0.03;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: FUNCTION - Track Referral Click
-- =====================================================

CREATE OR REPLACE FUNCTION track_referral_click(
  p_affiliate_code TEXT,
  p_product_id TEXT DEFAULT NULL,
  p_product_type TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer_url TEXT DEFAULT NULL,
  p_landing_page TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_referral_id UUID;
BEGIN
  -- Find affiliate by code
  SELECT id INTO v_affiliate_id
  FROM profiles
  WHERE affiliate_code = p_affiliate_code;

  IF v_affiliate_id IS NULL THEN
    -- Try finding in affiliate_codes table
    SELECT user_id INTO v_affiliate_id
    FROM affiliate_codes
    WHERE code = p_affiliate_code;
  END IF;

  IF v_affiliate_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Create referral record
  INSERT INTO affiliate_referrals (
    affiliate_id,
    referral_code,
    product_id,
    product_type,
    ip_address,
    user_agent,
    referrer_url,
    landing_page,
    clicked_at,
    status
  ) VALUES (
    v_affiliate_id,
    p_affiliate_code,
    p_product_id,
    p_product_type,
    p_ip_address,
    p_user_agent,
    p_referrer_url,
    p_landing_page,
    NOW(),
    'clicked'
  )
  RETURNING id INTO v_referral_id;

  -- Increment clicks on affiliate_codes
  UPDATE affiliate_codes
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE code = p_affiliate_code;

  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 6: FUNCTION - Convert Referral
-- =====================================================

CREATE OR REPLACE FUNCTION convert_referral(
  p_affiliate_code TEXT,
  p_order_id TEXT,
  p_order_amount NUMERIC,
  p_buyer_email TEXT DEFAULT NULL,
  p_buyer_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_affiliate_id UUID;
  v_referral RECORD;
  v_partner_role TEXT;
  v_partner_tier TEXT;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Find affiliate
  SELECT id, partnership_role, ctv_tier INTO v_affiliate_id, v_partner_role, v_partner_tier
  FROM profiles
  WHERE affiliate_code = p_affiliate_code;

  IF v_affiliate_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Affiliate not found');
  END IF;

  -- Find latest referral for this affiliate code (not yet converted)
  SELECT * INTO v_referral
  FROM affiliate_referrals
  WHERE affiliate_id = v_affiliate_id
  AND status = 'clicked'
  ORDER BY clicked_at DESC
  LIMIT 1;

  -- Update referral status
  IF v_referral.id IS NOT NULL THEN
    UPDATE affiliate_referrals
    SET
      status = 'converted',
      converted_at = NOW(),
      order_id = p_order_id,
      order_amount = p_order_amount,
      referred_user_id = p_buyer_user_id
    WHERE id = v_referral.id;
  END IF;

  -- Calculate commission
  v_commission_rate := get_commission_rate(v_partner_role, v_partner_tier, 'digital');
  v_commission_amount := p_order_amount * v_commission_rate;

  -- Record commission
  INSERT INTO affiliate_commissions (
    affiliate_id,
    commission_rate,
    commission_amount,
    status,
    created_at
  ) VALUES (
    v_affiliate_id,
    v_commission_rate,
    v_commission_amount,
    'pending',
    NOW()
  );

  -- Update affiliate stats
  UPDATE profiles
  SET
    total_sales = COALESCE(total_sales, 0) + p_order_amount,
    total_commission = COALESCE(total_commission, 0) + v_commission_amount,
    available_balance = COALESCE(available_balance, 0) + v_commission_amount,
    updated_at = NOW()
  WHERE id = v_affiliate_id;

  UPDATE affiliate_profiles
  SET
    total_sales = COALESCE(total_sales, 0) + p_order_amount,
    updated_at = NOW()
  WHERE user_id = v_affiliate_id;

  RETURN json_build_object(
    'success', true,
    'affiliate_id', v_affiliate_id,
    'commission_rate', v_commission_rate,
    'commission_amount', v_commission_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 7: FUNCTION - Get Affiliate Stats
-- =====================================================

CREATE OR REPLACE FUNCTION get_affiliate_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_profile RECORD;
  v_referrals_count INTEGER;
  v_converted_count INTEGER;
  v_pending_commission NUMERIC;
  v_paid_commission NUMERIC;
  v_this_month_sales NUMERIC;
  v_this_month_commission NUMERIC;
BEGIN
  -- Get profile data
  SELECT
    affiliate_code,
    partnership_role,
    ctv_tier,
    total_sales,
    total_commission,
    available_balance,
    withdrawn_total
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Count referrals
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'converted')
  INTO v_referrals_count, v_converted_count
  FROM affiliate_referrals
  WHERE affiliate_id = p_user_id;

  -- Get commission stats
  SELECT
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'pending'), 0),
    COALESCE(SUM(commission_amount) FILTER (WHERE status = 'paid'), 0)
  INTO v_pending_commission, v_paid_commission
  FROM affiliate_commissions
  WHERE affiliate_id = p_user_id;

  -- This month stats
  SELECT
    COALESCE(SUM(order_amount), 0),
    COALESCE(SUM(order_amount) *
      get_commission_rate(v_profile.partnership_role, v_profile.ctv_tier, 'digital'), 0)
  INTO v_this_month_sales, v_this_month_commission
  FROM affiliate_referrals
  WHERE affiliate_id = p_user_id
  AND status = 'converted'
  AND converted_at >= date_trunc('month', NOW());

  RETURN json_build_object(
    'affiliate_code', v_profile.affiliate_code,
    'role', v_profile.partnership_role,
    'tier', v_profile.ctv_tier,
    'total_sales', COALESCE(v_profile.total_sales, 0),
    'total_commission', COALESCE(v_profile.total_commission, 0),
    'available_balance', COALESCE(v_profile.available_balance, 0),
    'withdrawn_total', COALESCE(v_profile.withdrawn_total, 0),
    'referrals_count', v_referrals_count,
    'converted_count', v_converted_count,
    'pending_commission', v_pending_commission,
    'paid_commission', v_paid_commission,
    'this_month_sales', v_this_month_sales,
    'this_month_commission', v_this_month_commission
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 8: FUNCTION - Auto Upgrade CTV Tier
-- =====================================================

CREATE OR REPLACE FUNCTION auto_upgrade_ctv_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_total_sales NUMERIC;
  v_current_tier TEXT;
  v_new_tier TEXT;
  v_role TEXT;
BEGIN
  -- Get current data
  SELECT partnership_role, ctv_tier, total_sales
  INTO v_role, v_current_tier, v_total_sales
  FROM profiles
  WHERE id = p_user_id;

  -- Only upgrade CTVs
  IF v_role != 'ctv' THEN
    RETURN v_current_tier;
  END IF;

  -- Determine new tier based on sales thresholds
  IF v_total_sales >= 600000000 THEN
    v_new_tier := 'grand';
  ELSIF v_total_sales >= 300000000 THEN
    v_new_tier := 'master';
  ELSIF v_total_sales >= 100000000 THEN
    v_new_tier := 'growing';
  ELSE
    v_new_tier := 'beginner';
  END IF;

  -- Update if tier changed
  IF v_new_tier != v_current_tier THEN
    UPDATE profiles
    SET ctv_tier = v_new_tier, updated_at = NOW()
    WHERE id = p_user_id;

    UPDATE affiliate_profiles
    SET ctv_tier = v_new_tier, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 9: INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_profiles_partnership_role ON profiles(partnership_role);

-- Affiliate referrals indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_code ON affiliate_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_clicked ON affiliate_referrals(clicked_at DESC);

-- =====================================================
-- PART 10: GRANT PERMISSIONS
-- =====================================================

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_commission_rate(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_referral_click(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION convert_referral(TEXT, TEXT, NUMERIC, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_affiliate_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_upgrade_ctv_tier(UUID) TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Affiliate System Complete Migration - Done!';
  RAISE NOTICE 'Tables checked/created: profiles columns, affiliate_profiles, affiliate_referrals';
  RAISE NOTICE 'Functions created: get_commission_rate, track_referral_click, convert_referral, get_affiliate_stats, auto_upgrade_ctv_tier';
END $$;

-- Show verification
SELECT 'Affiliate System Migration Complete' as status,
       NOW() as completed_at;
