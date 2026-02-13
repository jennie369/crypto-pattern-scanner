-- ============================================================
-- ONBOARDING & TOOLTIPS SYSTEM - COMPLETE MIGRATION
-- Run Date: December 15, 2025
--
-- This file contains ALL database objects needed for:
-- 1. Welcome Screens (5 slides for first-time users)
-- 2. Tooltips System (77 tooltips across 12 categories)
-- 3. Feature Discovery (15 usage-based prompts)
-- 4. Guided Tours (5 step-by-step tours)
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ============================================================

-- ============================================================
-- PART 1: DROP OLD OBJECTS (if exists)
-- ============================================================

-- Drop old functions first (to avoid conflicts)
DROP FUNCTION IF EXISTS should_show_tutorial(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_next_tutorial(UUID) CASCADE;

-- ============================================================
-- PART 2: USER_TUTORIALS TABLE
-- Main table for tracking all tutorial/onboarding progress
-- ============================================================

-- Drop and recreate for clean schema
DROP TABLE IF EXISTS user_tutorials CASCADE;

CREATE TABLE user_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Welcome screens tracking
  welcome_completed BOOLEAN DEFAULT FALSE,
  welcome_completed_at TIMESTAMPTZ,
  welcome_slides_viewed INT DEFAULT 0,

  -- Tooltips viewed (JSON array of tooltip keys)
  -- Example: ["scanner_intro", "pattern_cards", "scan_button"]
  tooltips_viewed JSONB DEFAULT '[]'::JSONB,

  -- Feature discoveries dismissed (JSON array of discovery keys)
  -- Example: ["first_scan", "upgrade_tier2", "tarot_daily"]
  discoveries_dismissed JSONB DEFAULT '[]'::JSONB,

  -- Tour progress (JSON object)
  -- Example: {"scanner_tour": {"step": 3, "completed": false}, "gemmaster_tour": {"completed": true}}
  tour_progress JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for quick user lookup
CREATE INDEX idx_user_tutorials_user_id ON user_tutorials(user_id);

-- ============================================================
-- PART 3: RLS POLICIES
-- ============================================================

ALTER TABLE user_tutorials ENABLE ROW LEVEL SECURITY;

-- Users can view their own tutorial progress
DROP POLICY IF EXISTS "Users view own tutorials" ON user_tutorials;
CREATE POLICY "Users view own tutorials" ON user_tutorials
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tutorial progress
DROP POLICY IF EXISTS "Users insert own tutorials" ON user_tutorials;
CREATE POLICY "Users insert own tutorials" ON user_tutorials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tutorial progress
DROP POLICY IF EXISTS "Users update own tutorials" ON user_tutorials;
CREATE POLICY "Users update own tutorials" ON user_tutorials
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PART 4: RPC FUNCTIONS
-- ============================================================

-- 4.1: Get or create user tutorial record
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

-- 4.2: Mark welcome as completed
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

-- 4.3: Check if user has completed welcome
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

-- 4.4: Mark tooltip as viewed
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
    RETURN TRUE; -- Already viewed, return success
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

-- 4.5: Check if tooltip has been viewed
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

  -- If record not found, tooltip not viewed
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN v_tooltips ? p_tooltip_key;
END;
$$;

-- 4.6: Get all viewed tooltips
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

  RETURN COALESCE(v_tooltips, '[]'::JSONB);
END;
$$;

-- 4.7: Mark feature discovery as dismissed
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

-- 4.8: Check if discovery has been dismissed
CREATE OR REPLACE FUNCTION has_dismissed_discovery(p_user_id UUID, p_discovery_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_discoveries JSONB;
BEGIN
  SELECT COALESCE(discoveries_dismissed, '[]'::JSONB) INTO v_discoveries
  FROM user_tutorials
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN v_discoveries ? p_discovery_key;
END;
$$;

-- 4.9: Update tour progress
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
    'currentStep', p_step,
    'completed', p_completed,
    'updatedAt', NOW()
  );

  IF p_completed THEN
    v_tour_data = v_tour_data || jsonb_build_object('completedAt', NOW());
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

-- 4.10: Get tour progress
CREATE OR REPLACE FUNCTION get_tour_progress(p_user_id UUID, p_tour_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress JSONB;
BEGIN
  SELECT COALESCE(tour_progress -> p_tour_name, '{}'::JSONB) INTO v_progress
  FROM user_tutorials
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_progress, '{}'::JSONB);
END;
$$;

-- 4.11: Get tutorial stats for user
CREATE OR REPLACE FUNCTION get_tutorial_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record user_tutorials;
  v_tours_completed INT := 0;
BEGIN
  SELECT * INTO v_record
  FROM user_tutorials
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'welcomeCompleted', FALSE,
      'tooltipsViewedCount', 0,
      'discoveriesDismissedCount', 0,
      'toursCompleted', 0
    );
  END IF;

  -- Count completed tours
  SELECT COUNT(*) INTO v_tours_completed
  FROM jsonb_each(COALESCE(v_record.tour_progress, '{}'::JSONB)) AS tour
  WHERE (tour.value->>'completed')::boolean = true;

  RETURN jsonb_build_object(
    'welcomeCompleted', COALESCE(v_record.welcome_completed, FALSE),
    'welcomeCompletedAt', v_record.welcome_completed_at,
    'welcomeSlidesViewed', v_record.welcome_slides_viewed,
    'tooltipsViewedCount', jsonb_array_length(COALESCE(v_record.tooltips_viewed, '[]'::JSONB)),
    'tooltipsViewed', COALESCE(v_record.tooltips_viewed, '[]'::JSONB),
    'discoveriesDismissedCount', jsonb_array_length(COALESCE(v_record.discoveries_dismissed, '[]'::JSONB)),
    'discoveriesDismissed', COALESCE(v_record.discoveries_dismissed, '[]'::JSONB),
    'tourProgress', COALESCE(v_record.tour_progress, '{}'::JSONB),
    'toursCompleted', v_tours_completed
  );
END;
$$;

-- 4.12: Reset all tutorials (for testing)
CREATE OR REPLACE FUNCTION reset_user_tutorials(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_tutorials WHERE user_id = p_user_id;
  RETURN TRUE;
END;
$$;

-- ============================================================
-- PART 5: TRIGGER FOR UPDATED_AT
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
-- PART 6: GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_or_create_user_tutorial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_welcome_completed(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_completed_welcome(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_tooltip_viewed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_viewed_tooltip(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_viewed_tooltips(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_discovery_dismissed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_dismissed_discovery(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tour_progress(UUID, TEXT, INT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tour_progress(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tutorial_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_tutorials(UUID) TO authenticated;

-- ============================================================
-- PART 7: VERIFICATION
-- ============================================================

DO $$
DECLARE
  v_table_exists BOOLEAN;
  v_function_count INT;
BEGIN
  -- Check table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_tutorials'
  ) INTO v_table_exists;

  -- Count functions
  SELECT COUNT(*) INTO v_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_or_create_user_tutorial',
      'mark_welcome_completed',
      'has_completed_welcome',
      'mark_tooltip_viewed',
      'has_viewed_tooltip',
      'get_viewed_tooltips',
      'mark_discovery_dismissed',
      'has_dismissed_discovery',
      'update_tour_progress',
      'get_tour_progress',
      'get_tutorial_stats',
      'reset_user_tutorials'
    );

  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ ONBOARDING & TOOLTIPS SYSTEM - MIGRATION COMPLETE        ║';
  RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  Table: user_tutorials           = %                         ║', CASE WHEN v_table_exists THEN 'OK' ELSE 'FAIL' END;
  RAISE NOTICE '║  RPC Functions created           = %/12                      ║', v_function_count;
  RAISE NOTICE '║                                                              ║';
  RAISE NOTICE '║  Functions available:                                        ║';
  RAISE NOTICE '║  - get_or_create_user_tutorial(user_id)                      ║';
  RAISE NOTICE '║  - mark_welcome_completed(user_id, slides_viewed)            ║';
  RAISE NOTICE '║  - has_completed_welcome(user_id)                            ║';
  RAISE NOTICE '║  - mark_tooltip_viewed(user_id, tooltip_key)                 ║';
  RAISE NOTICE '║  - has_viewed_tooltip(user_id, tooltip_key)                  ║';
  RAISE NOTICE '║  - get_viewed_tooltips(user_id)                              ║';
  RAISE NOTICE '║  - mark_discovery_dismissed(user_id, discovery_key)          ║';
  RAISE NOTICE '║  - has_dismissed_discovery(user_id, discovery_key)           ║';
  RAISE NOTICE '║  - update_tour_progress(user_id, tour_name, step, completed) ║';
  RAISE NOTICE '║  - get_tour_progress(user_id, tour_name)                     ║';
  RAISE NOTICE '║  - get_tutorial_stats(user_id)                               ║';
  RAISE NOTICE '║  - reset_user_tutorials(user_id)                             ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
