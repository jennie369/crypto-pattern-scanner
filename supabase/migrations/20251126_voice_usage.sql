-- ================================================
-- GEM Mobile - Voice Usage Table
-- Day 11-12: Voice Input Implementation
-- ================================================
-- Track voice input usage for quota management
-- FREE users: 3 voice messages/day
-- TIER1+: Unlimited
-- ================================================

-- Drop existing objects if they exist
DROP TABLE IF EXISTS voice_usage CASCADE;

-- ================================================
-- VOICE USAGE TABLE
-- ================================================
CREATE TABLE voice_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one row per user per day
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_voice_usage_user_id ON voice_usage(user_id);
CREATE INDEX idx_voice_usage_date ON voice_usage(date);
CREATE INDEX idx_voice_usage_user_date ON voice_usage(user_id, date);

-- ================================================
-- RLS POLICIES
-- ================================================
ALTER TABLE voice_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own voice usage" ON voice_usage;
DROP POLICY IF EXISTS "Users can insert own voice usage" ON voice_usage;
DROP POLICY IF EXISTS "Users can update own voice usage" ON voice_usage;

-- Users can view their own voice usage
CREATE POLICY "Users can view own voice usage"
  ON voice_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own voice usage
CREATE POLICY "Users can insert own voice usage"
  ON voice_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own voice usage
CREATE POLICY "Users can update own voice usage"
  ON voice_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to increment voice count with upsert
CREATE OR REPLACE FUNCTION increment_voice_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO voice_usage (user_id, date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    count = voice_usage.count + 1,
    updated_at = NOW()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's voice count
CREATE OR REPLACE FUNCTION get_today_voice_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count INTO v_count
  FROM voice_usage
  WHERE user_id = p_user_id
    AND date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can use voice (returns remaining count)
-- FREE users have 3 messages/day, others unlimited (-1)
CREATE OR REPLACE FUNCTION check_voice_quota(p_user_id UUID)
RETURNS TABLE (
  can_use BOOLEAN,
  remaining INTEGER,
  total_limit INTEGER,
  used_today INTEGER
) AS $$
DECLARE
  v_tier TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user's tier from profiles
  SELECT COALESCE(chatbot_tier, 'FREE') INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  -- If no profile found, default to FREE
  IF v_tier IS NULL THEN
    v_tier := 'FREE';
  END IF;

  -- Get today's usage
  v_used := get_today_voice_count(p_user_id);

  -- Determine limit based on tier
  IF v_tier IN ('FREE') THEN
    v_limit := 3;
    RETURN QUERY SELECT
      v_used < v_limit AS can_use,
      GREATEST(v_limit - v_used, 0) AS remaining,
      v_limit AS total_limit,
      v_used AS used_today;
  ELSE
    -- TIER1+ has unlimited voice
    RETURN QUERY SELECT
      TRUE AS can_use,
      -1 AS remaining,  -- -1 means unlimited
      -1 AS total_limit,
      v_used AS used_today;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- GRANT PERMISSIONS
-- ================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON voice_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_voice_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_voice_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_voice_quota(UUID) TO authenticated;

-- ================================================
-- CLEANUP OLD DATA (optional - run periodically)
-- ================================================
-- This function can be called via pg_cron to clean up old voice usage data
CREATE OR REPLACE FUNCTION cleanup_old_voice_usage()
RETURNS void AS $$
BEGIN
  -- Delete voice usage older than 30 days
  DELETE FROM voice_usage
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SAMPLE DATA (for testing)
-- ================================================
-- Uncomment below to add test data
-- INSERT INTO voice_usage (user_id, date, count)
-- VALUES
--   ('test-user-id', CURRENT_DATE, 2),
--   ('test-user-id', CURRENT_DATE - 1, 3);

COMMENT ON TABLE voice_usage IS 'Tracks daily voice input usage for quota management';
COMMENT ON COLUMN voice_usage.count IS 'Number of voice messages used on this date';
