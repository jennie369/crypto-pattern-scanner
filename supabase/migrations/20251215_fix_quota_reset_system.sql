-- =====================================================
-- FIX QUOTA RESET SYSTEM
-- December 15, 2025
--
-- Issues Fixed:
-- 1. Scanner quota was stored in MEMORY only - now persisted
-- 2. Chatbot quota date calculation issues
-- 3. Add proper daily reset at midnight Vietnam time
-- =====================================================

-- =====================================================
-- 1. SCANNER QUOTA TABLE (New)
-- =====================================================
CREATE TABLE IF NOT EXISTS scanner_quota (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily tracking
  date DATE NOT NULL,
  scans_used INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per user per day
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scanner_quota_user_date ON scanner_quota(user_id, date);
CREATE INDEX IF NOT EXISTS idx_scanner_quota_date ON scanner_quota(date);

-- RLS
ALTER TABLE scanner_quota ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scanner quota" ON scanner_quota;
DROP POLICY IF EXISTS "Users can insert own scanner quota" ON scanner_quota;
DROP POLICY IF EXISTS "Users can update own scanner quota" ON scanner_quota;

CREATE POLICY "Users can view own scanner quota"
  ON scanner_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanner quota"
  ON scanner_quota FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scanner quota"
  ON scanner_quota FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_scanner_quota_updated_at
  BEFORE UPDATE ON scanner_quota
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. UNIFIED QUOTA CHECK FUNCTION
-- Returns quota for both chatbot and scanner
-- Uses Vietnam timezone (UTC+7)
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

  -- Get user profile
  SELECT
    COALESCE(chatbot_tier, 'FREE') AS chatbot_tier,
    COALESCE(scanner_tier, 'FREE') AS scanner_tier,
    is_admin,
    role
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

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
  v_chatbot_tier := UPPER(COALESCE(v_profile.chatbot_tier, 'FREE'));
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
  v_scanner_tier := UPPER(COALESCE(v_profile.scanner_tier, 'FREE'));
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
  SELECT COALESCE(queries_used, 0)
  INTO v_chatbot_used
  FROM chatbot_quota
  WHERE user_id = p_user_id AND date = v_today;

  IF NOT FOUND THEN
    v_chatbot_used := 0;
  END IF;

  -- Get scanner usage for today
  SELECT COALESCE(scans_used, 0)
  INTO v_scanner_used
  FROM scanner_quota
  WHERE user_id = p_user_id AND date = v_today;

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
-- 3. INCREMENT CHATBOT QUOTA
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

  -- Get user tier
  SELECT chatbot_tier, is_admin, role INTO v_profile
  FROM profiles WHERE id = p_user_id;

  -- Admin = unlimited
  IF v_profile.is_admin = TRUE OR v_profile.role IN ('admin', 'ADMIN') THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

  v_tier := UPPER(COALESCE(v_profile.chatbot_tier, 'FREE'));
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
-- 4. INCREMENT SCANNER QUOTA
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

  -- Get user tier
  SELECT scanner_tier, is_admin, role INTO v_profile
  FROM profiles WHERE id = p_user_id;

  -- Admin = unlimited
  IF v_profile.is_admin = TRUE OR v_profile.role IN ('admin', 'ADMIN') THEN
    RETURN QUERY SELECT TRUE, 0, -1, FALSE;
    RETURN;
  END IF;

  v_tier := UPPER(COALESCE(v_profile.scanner_tier, 'FREE'));
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
-- 5. CLEANUP OLD QUOTA RECORDS (Both tables)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_all_quota_records()
RETURNS TABLE (
  chatbot_deleted INT,
  scanner_deleted INT
) AS $$
DECLARE
  v_chatbot_deleted INT;
  v_scanner_deleted INT;
BEGIN
  -- Delete chatbot quota older than 30 days
  DELETE FROM chatbot_quota
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
  GET DIAGNOSTICS v_chatbot_deleted = ROW_COUNT;

  -- Delete scanner quota older than 30 days
  DELETE FROM scanner_quota
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
  GET DIAGNOSTICS v_scanner_deleted = ROW_COUNT;

  RETURN QUERY SELECT v_chatbot_deleted, v_scanner_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. ADMIN RESET USER QUOTA (for both)
-- =====================================================
CREATE OR REPLACE FUNCTION admin_reset_user_quota(
  p_user_id UUID,
  p_quota_type TEXT DEFAULT 'both'  -- 'chatbot', 'scanner', 'both'
)
RETURNS JSONB AS $$
DECLARE
  v_today DATE;
  v_result JSONB := '{}';
BEGIN
  v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

  IF p_quota_type IN ('chatbot', 'both') THEN
    DELETE FROM chatbot_quota
    WHERE user_id = p_user_id AND date = v_today;

    v_result := v_result || jsonb_build_object('chatbot_reset', TRUE);
  END IF;

  IF p_quota_type IN ('scanner', 'both') THEN
    DELETE FROM scanner_quota
    WHERE user_id = p_user_id AND date = v_today;

    v_result := v_result || jsonb_build_object('scanner_reset', TRUE);
  END IF;

  v_result := v_result || jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'date', v_today
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_all_quotas(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_chatbot_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_scanner_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_all_quota_records() TO service_role;
GRANT EXECUTE ON FUNCTION admin_reset_user_quota(UUID, TEXT) TO authenticated;

-- =====================================================
-- VERIFY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Quota Reset System Fixed!';
  RAISE NOTICE 'Tables: chatbot_quota, scanner_quota';
  RAISE NOTICE 'Functions: check_all_quotas(), increment_chatbot_quota(), increment_scanner_quota()';
  RAISE NOTICE 'Admin: admin_reset_user_quota()';
END $$;
