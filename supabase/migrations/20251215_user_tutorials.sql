-- ============================================================
-- User Tutorials & Onboarding Tracking
-- Date: December 15, 2025
-- Description: Track welcome screen completion, tooltips viewed,
--              feature discoveries dismissed, and tour progress
-- ============================================================

-- ============================================================
-- 1. USER_TUTORIALS TABLE
-- Main table for tracking tutorial/onboarding progress
-- ============================================================
CREATE TABLE IF NOT EXISTS user_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Welcome screens
  welcome_completed BOOLEAN DEFAULT FALSE,
  welcome_completed_at TIMESTAMPTZ,
  welcome_slides_viewed INT DEFAULT 0,

  -- Tooltips viewed (JSON array of tooltip keys)
  tooltips_viewed JSONB DEFAULT '[]'::JSONB,

  -- Feature discoveries dismissed (JSON array of discovery keys)
  discoveries_dismissed JSONB DEFAULT '[]'::JSONB,

  -- Tour progress (JSON object with tour_name: {completed, step, completed_at})
  tour_progress JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for quick user lookup
CREATE INDEX IF NOT EXISTS idx_user_tutorials_user ON user_tutorials(user_id);

-- RLS Policies
ALTER TABLE user_tutorials ENABLE ROW LEVEL SECURITY;

-- Users can view their own tutorial progress
DROP POLICY IF EXISTS "Users view own tutorial progress" ON user_tutorials;
CREATE POLICY "Users view own tutorial progress" ON user_tutorials
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tutorial progress
DROP POLICY IF EXISTS "Users insert own tutorial progress" ON user_tutorials;
CREATE POLICY "Users insert own tutorial progress" ON user_tutorials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tutorial progress
DROP POLICY IF EXISTS "Users update own tutorial progress" ON user_tutorials;
CREATE POLICY "Users update own tutorial progress" ON user_tutorials
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 2. RPC FUNCTIONS
-- ============================================================

-- Function to get or create user tutorial record
CREATE OR REPLACE FUNCTION get_or_create_user_tutorial(p_user_id UUID)
RETURNS user_tutorials
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result user_tutorials;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_result
  FROM user_tutorials
  WHERE user_id = p_user_id;

  -- If not found, create one
  IF NOT FOUND THEN
    INSERT INTO user_tutorials (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- Function to mark welcome as completed
CREATE OR REPLACE FUNCTION mark_welcome_completed(p_user_id UUID, p_slides_viewed INT DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_tutorials (user_id, welcome_completed, welcome_completed_at, welcome_slides_viewed)
  VALUES (p_user_id, TRUE, NOW(), p_slides_viewed)
  ON CONFLICT (user_id)
  DO UPDATE SET
    welcome_completed = TRUE,
    welcome_completed_at = NOW(),
    welcome_slides_viewed = GREATEST(user_tutorials.welcome_slides_viewed, p_slides_viewed),
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function to mark tooltip as viewed
CREATE OR REPLACE FUNCTION mark_tooltip_viewed(p_user_id UUID, p_tooltip_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current JSONB;
BEGIN
  -- Get current tooltips viewed
  SELECT COALESCE(tooltips_viewed, '[]'::JSONB) INTO v_current
  FROM user_tutorials
  WHERE user_id = p_user_id;

  -- If record doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO user_tutorials (user_id, tooltips_viewed)
    VALUES (p_user_id, jsonb_build_array(p_tooltip_key));
    RETURN TRUE;
  END IF;

  -- Check if already viewed
  IF v_current ? p_tooltip_key THEN
    RETURN TRUE;
  END IF;

  -- Add to array
  UPDATE user_tutorials
  SET
    tooltips_viewed = v_current || jsonb_build_array(p_tooltip_key),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Function to mark feature discovery as dismissed
CREATE OR REPLACE FUNCTION mark_discovery_dismissed(p_user_id UUID, p_discovery_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current JSONB;
BEGIN
  -- Get current discoveries dismissed
  SELECT COALESCE(discoveries_dismissed, '[]'::JSONB) INTO v_current
  FROM user_tutorials
  WHERE user_id = p_user_id;

  -- If record doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO user_tutorials (user_id, discoveries_dismissed)
    VALUES (p_user_id, jsonb_build_array(p_discovery_key));
    RETURN TRUE;
  END IF;

  -- Check if already dismissed
  IF v_current ? p_discovery_key THEN
    RETURN TRUE;
  END IF;

  -- Add to array
  UPDATE user_tutorials
  SET
    discoveries_dismissed = v_current || jsonb_build_array(p_discovery_key),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Function to update tour progress
CREATE OR REPLACE FUNCTION update_tour_progress(
  p_user_id UUID,
  p_tour_name TEXT,
  p_step INT,
  p_completed BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current JSONB;
  v_tour_data JSONB;
BEGIN
  -- Get current tour progress
  SELECT COALESCE(tour_progress, '{}'::JSONB) INTO v_current
  FROM user_tutorials
  WHERE user_id = p_user_id;

  -- Build tour data
  v_tour_data = jsonb_build_object(
    'step', p_step,
    'completed', p_completed,
    'updated_at', NOW()
  );

  IF p_completed THEN
    v_tour_data = v_tour_data || jsonb_build_object('completed_at', NOW());
  END IF;

  -- If record doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO user_tutorials (user_id, tour_progress)
    VALUES (p_user_id, jsonb_build_object(p_tour_name, v_tour_data));
    RETURN TRUE;
  END IF;

  -- Update tour progress
  UPDATE user_tutorials
  SET
    tour_progress = v_current || jsonb_build_object(p_tour_name, v_tour_data),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Function to check if user has completed welcome
CREATE OR REPLACE FUNCTION has_completed_welcome(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completed BOOLEAN;
BEGIN
  SELECT welcome_completed INTO v_completed
  FROM user_tutorials
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_completed, FALSE);
END;
$$;

-- Function to check if tooltip has been viewed
CREATE OR REPLACE FUNCTION has_viewed_tooltip(p_user_id UUID, p_tooltip_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tooltips JSONB;
BEGIN
  SELECT COALESCE(tooltips_viewed, '[]'::JSONB) INTO v_tooltips
  FROM user_tutorials
  WHERE user_id = p_user_id;

  RETURN v_tooltips ? p_tooltip_key;
END;
$$;

-- Function to get all viewed tooltips
CREATE OR REPLACE FUNCTION get_viewed_tooltips(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tooltips JSONB;
BEGIN
  SELECT COALESCE(tooltips_viewed, '[]'::JSONB) INTO v_tooltips
  FROM user_tutorials
  WHERE user_id = p_user_id;

  RETURN v_tooltips;
END;
$$;

-- Function to get tutorial stats for user
CREATE OR REPLACE FUNCTION get_tutorial_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record user_tutorials;
BEGIN
  SELECT * INTO v_record
  FROM user_tutorials
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'welcome_completed', FALSE,
      'tooltips_viewed_count', 0,
      'discoveries_dismissed_count', 0,
      'tours_completed', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'welcome_completed', COALESCE(v_record.welcome_completed, FALSE),
    'welcome_completed_at', v_record.welcome_completed_at,
    'tooltips_viewed_count', jsonb_array_length(COALESCE(v_record.tooltips_viewed, '[]'::JSONB)),
    'discoveries_dismissed_count', jsonb_array_length(COALESCE(v_record.discoveries_dismissed, '[]'::JSONB)),
    'tour_progress', COALESCE(v_record.tour_progress, '{}'::JSONB)
  );
END;
$$;

-- ============================================================
-- 3. TRIGGER FOR UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_tutorials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_tutorials_updated_at ON user_tutorials;
CREATE TRIGGER trigger_user_tutorials_updated_at
  BEFORE UPDATE ON user_tutorials
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tutorials_updated_at();

-- ============================================================
-- 4. GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION get_or_create_user_tutorial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_welcome_completed(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_tooltip_viewed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_discovery_dismissed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tour_progress(UUID, TEXT, INT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION has_completed_welcome(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_viewed_tooltip(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_viewed_tooltips(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tutorial_stats(UUID) TO authenticated;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ User tutorials table and functions created successfully';
END $$;
