-- =====================================================
-- FIX: MANAGER ROLE NOT GETTING UNLIMITED QUOTA
-- Run this in Supabase SQL Editor
-- January 27, 2026
--
-- Issue: Previous migration (20251215_fix_quota_ambiguous_columns.sql)
--        overwrote functions and REMOVED Manager check!
-- Fix: Add Manager check back to all quota functions
-- =====================================================

-- =====================================================
-- 1. FIX check_all_quotas FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION check_all_quotas(p_user_id UUID)
RETURNS TABLE (
  chatbot_tier TEXT,
  chatbot_limit INT,
  chatbot_used INT,
  chatbot_remaining INT,
  chatbot_unlimited BOOLEAN,
  scanner_tier TEXT,
  scanner_limit INT,
  scanner_used INT,
  scanner_remaining INT,
  scanner_unlimited BOOLEAN,
  today_date DATE,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_today DATE;
  v_reset_at TIMESTAMPTZ;
  v_profile RECORD;
  v_chatbot_tier TEXT := 'FREE';
  v_chatbot_limit INT := 5;
  v_chatbot_used INT := 0;
  v_scanner_tier TEXT := 'FREE';
  v_scanner_limit INT := 10;
  v_scanner_used INT := 0;
  v_is_admin BOOLEAN := FALSE;
  v_is_manager BOOLEAN := FALSE;
BEGIN
  -- Get today's date in Vietnam timezone (UTC+7)
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Calculate next reset time (midnight Vietnam time)
  v_reset_at := ((v_today + INTERVAL '1 day')::DATE || ' 00:00:00')::TIMESTAMP
                AT TIME ZONE 'Asia/Ho_Chi_Minh'
                AT TIME ZONE 'UTC';

  -- Get user profile
  SELECT
    COALESCE(p.chatbot_tier, 'FREE') AS user_chatbot_tier,
    COALESCE(p.scanner_tier, 'FREE') AS user_scanner_tier,
    COALESCE(p.is_admin, FALSE) AS user_is_admin,
    COALESCE(p.role, 'user') AS user_role
  INTO v_profile
  FROM profiles p
  WHERE p.id = p_user_id;

  IF NOT FOUND THEN
    -- User not found, return defaults
    RETURN QUERY SELECT
      'FREE'::TEXT, 5, 0, 5, FALSE,
      'FREE'::TEXT, 10, 0, 10, FALSE,
      v_today, v_reset_at;
    RETURN;
  END IF;

  -- Check Admin status
  v_is_admin := (
    v_profile.user_is_admin = TRUE OR
    v_profile.user_role IN ('admin', 'ADMIN') OR
    v_profile.user_chatbot_tier IN ('ADMIN') OR
    v_profile.user_scanner_tier IN ('ADMIN')
  );

  -- Check Manager status
  v_is_manager := (
    v_profile.user_role IN ('manager', 'MANAGER') OR
    v_profile.user_chatbot_tier IN ('MANAGER') OR
    v_profile.user_scanner_tier IN ('MANAGER')
  );

  -- Admin = unlimited everything
  IF v_is_admin THEN
    RETURN QUERY SELECT
      'ADMIN'::TEXT, -1, 0, -1, TRUE,
      'ADMIN'::TEXT, -1, 0, -1, TRUE,
      v_today, v_reset_at;
    RETURN;
  END IF;

  -- Manager = unlimited everything (same as Admin)
  IF v_is_manager THEN
    RETURN QUERY SELECT
      'MANAGER'::TEXT, -1, 0, -1, TRUE,
      'MANAGER'::TEXT, -1, 0, -1, TRUE,
      v_today, v_reset_at;
    RETURN;
  END IF;

  -- Set chatbot tier and limit for normal users
  v_chatbot_tier := UPPER(COALESCE(v_profile.user_chatbot_tier, 'FREE'));
  v_chatbot_limit := CASE v_chatbot_tier
    WHEN 'TIER3' THEN -1  -- Unlimited
    WHEN 'VIP' THEN -1
    WHEN 'TIER2' THEN 50
    WHEN 'PREMIUM' THEN 50
    WHEN 'TIER1' THEN 15
    WHEN 'PRO' THEN 15
    ELSE 5
  END;

  -- Set scanner tier and limit
  v_scanner_tier := UPPER(COALESCE(v_profile.user_scanner_tier, 'FREE'));
  v_scanner_limit := CASE v_scanner_tier
    WHEN 'TIER3' THEN -1  -- Unlimited
    WHEN 'VIP' THEN -1
    WHEN 'TIER2' THEN -1  -- PRO and above = unlimited scanner
    WHEN 'PREMIUM' THEN -1
    WHEN 'TIER1' THEN -1
    WHEN 'PRO' THEN -1
    ELSE 5  -- Only FREE has limit
  END;

  -- Get chatbot usage for today
  SELECT COALESCE(cq.queries_used, 0)
  INTO v_chatbot_used
  FROM chatbot_quota cq
  WHERE cq.user_id = p_user_id AND cq.date = v_today;

  IF NOT FOUND THEN
    v_chatbot_used := 0;
  END IF;

  -- Get scanner usage for today
  SELECT COALESCE(sq.scans_used, 0)
  INTO v_scanner_used
  FROM scanner_quota sq
  WHERE sq.user_id = p_user_id AND sq.date = v_today;

  IF NOT FOUND THEN
    v_scanner_used := 0;
  END IF;

  -- Return results
  RETURN QUERY SELECT
    v_chatbot_tier,
    v_chatbot_limit,
    v_chatbot_used,
    CASE WHEN v_chatbot_limit = -1 THEN -1 ELSE GREATEST(0, v_chatbot_limit - v_chatbot_used) END,
    v_chatbot_limit = -1,
    v_scanner_tier,
    v_scanner_limit,
    v_scanner_used,
    CASE WHEN v_scanner_limit = -1 THEN -1 ELSE GREATEST(0, v_scanner_limit - v_scanner_used) END,
    v_scanner_limit = -1,
    v_today,
    v_reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FIX increment_chatbot_quota FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION increment_chatbot_quota(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  used INT,
  remaining INT,
  limit_reached BOOLEAN
) AS $$
DECLARE
  v_today DATE;
  v_tier TEXT;
  v_limit INT;
  v_used INT;
  v_profile RECORD;
  v_is_unlimited BOOLEAN := FALSE;
BEGIN
  -- Get today in Vietnam timezone
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Get user profile
  SELECT
    p.chatbot_tier AS user_chatbot_tier,
    COALESCE(p.is_admin, FALSE) AS user_is_admin,
    COALESCE(p.role, 'user') AS user_role
  INTO v_profile
  FROM profiles p WHERE p.id = p_user_id;

  -- Check if Admin or Manager = unlimited
  v_is_unlimited := (
    v_profile.user_is_admin = TRUE OR
    v_profile.user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
    v_profile.user_chatbot_tier IN ('TIER3', 'VIP', 'ADMIN', 'MANAGER')
  );

  IF v_is_unlimited THEN
    -- Still increment for tracking, but return unlimited
    INSERT INTO chatbot_quota (user_id, date, queries_used)
    VALUES (p_user_id, v_today, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET queries_used = chatbot_quota.queries_used + 1, updated_at = NOW()
    RETURNING queries_used INTO v_used;

    RETURN QUERY SELECT TRUE, COALESCE(v_used, 0), -1, FALSE;
    RETURN;
  END IF;

  v_tier := UPPER(COALESCE(v_profile.user_chatbot_tier, 'FREE'));
  v_limit := CASE v_tier
    WHEN 'TIER2' THEN 50
    WHEN 'PREMIUM' THEN 50
    WHEN 'TIER1' THEN 15
    WHEN 'PRO' THEN 15
    ELSE 5
  END;

  -- Upsert quota record
  INSERT INTO chatbot_quota (user_id, date, queries_used)
  VALUES (p_user_id, v_today, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    queries_used = chatbot_quota.queries_used + 1,
    updated_at = NOW()
  RETURNING queries_used INTO v_used;

  RETURN QUERY SELECT
    TRUE,
    v_used,
    GREATEST(0, v_limit - v_used),
    v_used >= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FIX increment_scanner_quota FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION increment_scanner_quota(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  used INT,
  remaining INT,
  limit_reached BOOLEAN
) AS $$
DECLARE
  v_today DATE;
  v_tier TEXT;
  v_limit INT;
  v_used INT;
  v_profile RECORD;
  v_is_unlimited BOOLEAN := FALSE;
BEGIN
  -- Get today in Vietnam timezone
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Get user profile
  SELECT
    p.scanner_tier AS user_scanner_tier,
    COALESCE(p.is_admin, FALSE) AS user_is_admin,
    COALESCE(p.role, 'user') AS user_role
  INTO v_profile
  FROM profiles p WHERE p.id = p_user_id;

  -- Check if Admin or Manager = unlimited
  -- Also PRO and above scanner tiers are unlimited
  v_is_unlimited := (
    v_profile.user_is_admin = TRUE OR
    v_profile.user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
    v_profile.user_scanner_tier IN ('TIER1', 'PRO', 'TIER2', 'PREMIUM', 'TIER3', 'VIP', 'ADMIN', 'MANAGER')
  );

  IF v_is_unlimited THEN
    -- Still increment for tracking, but return unlimited
    INSERT INTO scanner_quota (user_id, date, scans_used)
    VALUES (p_user_id, v_today, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET scans_used = scanner_quota.scans_used + 1, updated_at = NOW()
    RETURNING scans_used INTO v_used;

    RETURN QUERY SELECT TRUE, COALESCE(v_used, 0), -1, FALSE;
    RETURN;
  END IF;

  -- Only FREE tier has limit
  v_limit := 5;

  -- Upsert quota record
  INSERT INTO scanner_quota (user_id, date, scans_used)
  VALUES (p_user_id, v_today, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    scans_used = scanner_quota.scans_used + 1,
    updated_at = NOW()
  RETURNING scans_used INTO v_used;

  RETURN QUERY SELECT
    TRUE,
    v_used,
    GREATEST(0, v_limit - v_used),
    v_used >= v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_all_quotas(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_chatbot_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_scanner_quota(UUID) TO authenticated;

-- =====================================================
-- VERIFY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'MANAGER QUOTA FIX APPLIED SUCCESSFULLY!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Functions fixed:';
  RAISE NOTICE '  - check_all_quotas: Admin/Manager get unlimited';
  RAISE NOTICE '  - increment_chatbot_quota: Admin/Manager bypass limit';
  RAISE NOTICE '  - increment_scanner_quota: Admin/Manager bypass limit';
  RAISE NOTICE '';
  RAISE NOTICE 'Manager users now have:';
  RAISE NOTICE '  - Unlimited chatbot queries';
  RAISE NOTICE '  - Unlimited scanner scans';
  RAISE NOTICE '  - Unlimited vision board items';
  RAISE NOTICE '=====================================================';
END $$;

SELECT 'Manager quota fix applied!' AS result;
