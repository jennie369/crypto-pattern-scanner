-- =====================================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN QUOTA FUNCTIONS
-- December 15, 2025
--
-- Issue: "column reference chatbot_tier is ambiguous"
-- Cause: RETURN TABLE column names conflict with profiles.chatbot_tier
-- Fix: Prefix table name in SELECT statements
-- =====================================================

-- =====================================================
-- 1. FIX check_all_quotas FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION check_all_quotas(p_user_id UUID)
RETURNS TABLE (
  -- Chatbot
  chatbot_tier TEXT,
  chatbot_limit INT,
  chatbot_used INT,
  chatbot_remaining INT,
  chatbot_unlimited BOOLEAN,
  -- Scanner
  scanner_tier TEXT,
  scanner_limit INT,
  scanner_used INT,
  scanner_remaining INT,
  scanner_unlimited BOOLEAN,
  -- Meta
  today_date DATE,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_today DATE;
  v_reset_at TIMESTAMPTZ;
  v_profile RECORD;
  -- Chatbot
  v_chatbot_tier TEXT := 'FREE';
  v_chatbot_limit INT := 5;
  v_chatbot_used INT := 0;
  -- Scanner
  v_scanner_tier TEXT := 'FREE';
  v_scanner_limit INT := 10;
  v_scanner_used INT := 0;
BEGIN
  -- Get today's date in Vietnam timezone (UTC+7)
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Calculate next reset time (midnight Vietnam time)
  v_reset_at := ((v_today + INTERVAL '1 day')::DATE || ' 00:00:00')::TIMESTAMP
                AT TIME ZONE 'Asia/Ho_Chi_Minh'
                AT TIME ZONE 'UTC';

  -- Get user profile - FIX: Prefix column names with table name
  SELECT
    COALESCE(p.chatbot_tier, 'FREE') AS user_chatbot_tier,
    COALESCE(p.scanner_tier, 'FREE') AS user_scanner_tier,
    p.is_admin,
    p.role
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

  -- Admin check - unlimited everything
  IF v_profile.is_admin = TRUE OR v_profile.role IN ('admin', 'ADMIN') THEN
    RETURN QUERY SELECT
      'ADMIN'::TEXT, -1, 0, -1, TRUE,
      'ADMIN'::TEXT, -1, 0, -1, TRUE,
      v_today, v_reset_at;
    RETURN;
  END IF;

  -- Set chatbot tier and limit
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
    WHEN 'TIER2' THEN 50
    WHEN 'PREMIUM' THEN 50
    WHEN 'TIER1' THEN 20
    WHEN 'PRO' THEN 20
    ELSE 10
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
    --
    v_scanner_tier,
    v_scanner_limit,
    v_scanner_used,
    CASE WHEN v_scanner_limit = -1 THEN -1 ELSE GREATEST(0, v_scanner_limit - v_scanner_used) END,
    v_scanner_limit = -1,
    --
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
BEGIN
  -- Get today in Vietnam timezone
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Get user tier - FIX: Prefix column names with table alias
  SELECT p.chatbot_tier AS user_chatbot_tier, p.is_admin, p.role
  INTO v_profile
  FROM profiles p WHERE p.id = p_user_id;

  -- Admin = unlimited
  IF v_profile.is_admin = TRUE OR v_profile.role IN ('admin', 'ADMIN') THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

  v_tier := UPPER(COALESCE(v_profile.user_chatbot_tier, 'FREE'));
  v_limit := CASE v_tier
    WHEN 'TIER3' THEN -1
    WHEN 'VIP' THEN -1
    WHEN 'TIER2' THEN 50
    WHEN 'PREMIUM' THEN 50
    WHEN 'TIER1' THEN 15
    WHEN 'PRO' THEN 15
    ELSE 5
  END;

  -- Unlimited tier
  IF v_limit = -1 THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

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
BEGIN
  -- Get today in Vietnam timezone
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  -- Get user tier - FIX: Prefix column names with table alias
  SELECT p.scanner_tier AS user_scanner_tier, p.is_admin, p.role
  INTO v_profile
  FROM profiles p WHERE p.id = p_user_id;

  -- Admin = unlimited
  IF v_profile.is_admin = TRUE OR v_profile.role IN ('admin', 'ADMIN') THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

  v_tier := UPPER(COALESCE(v_profile.user_scanner_tier, 'FREE'));
  v_limit := CASE v_tier
    WHEN 'TIER3' THEN -1
    WHEN 'VIP' THEN -1
    WHEN 'TIER2' THEN 50
    WHEN 'PREMIUM' THEN 50
    WHEN 'TIER1' THEN 20
    WHEN 'PRO' THEN 20
    ELSE 10
  END;

  -- Unlimited tier
  IF v_limit = -1 THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

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
-- VERIFY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed ambiguous column reference in quota functions!';
  RAISE NOTICE 'Functions fixed: check_all_quotas, increment_chatbot_quota, increment_scanner_quota';
END $$;
