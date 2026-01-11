-- ============================================================
-- FEEDBACK & RATING SYSTEM
-- Migration: 20251215_feedback_system.sql
-- Purpose: Collect user feedback, NPS scores, and testimonials
-- ============================================================

-- 1. User feedback table (NPS and general feedback)
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- NPS Rating (1-5 stars, or 0-10 scale)
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10), -- Optional detailed NPS

  -- Feedback details
  feedback_type VARCHAR(50) DEFAULT 'nps', -- 'nps', 'feature', 'bug', 'suggestion'
  feature VARCHAR(100), -- Which feature (if feature feedback)
  comment TEXT,

  -- Context
  app_version VARCHAR(20),
  device_info JSONB DEFAULT '{}',
  screen VARCHAR(100), -- Where feedback was given

  -- Status
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'reviewed', 'responded', 'archived'
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON user_feedback(created_at DESC);

-- 2. User testimonials (approved for display)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES user_feedback(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Display info
  display_name VARCHAR(100), -- Name to display (can be anonymized)
  avatar_url TEXT,
  user_tier VARCHAR(50),

  -- Content
  quote TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Metadata
  feature_highlight VARCHAR(100), -- Which feature they're praising
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,

  -- Status
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, is_approved);

-- 3. Feedback tracking (when to show NPS prompt)
CREATE TABLE IF NOT EXISTS feedback_prompts_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_type VARCHAR(50) DEFAULT 'nps',
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  shown_date DATE DEFAULT CURRENT_DATE, -- Separate date column for uniqueness
  action VARCHAR(50), -- 'completed', 'dismissed', 'later'
  rating INT,
  UNIQUE(user_id, prompt_type, shown_date) -- One per day per type
);

CREATE INDEX IF NOT EXISTS idx_prompts_user ON feedback_prompts_log(user_id);

-- 4. Feature ratings (inline thumbs up/down)
CREATE TABLE IF NOT EXISTS feature_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  is_positive BOOLEAN NOT NULL, -- true = thumbs up, false = thumbs down
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, feature) -- One rating per feature per user
);

CREATE INDEX IF NOT EXISTS idx_feature_ratings_feature ON feature_ratings(feature);

-- 5. RLS Policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_prompts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotent migration)
DROP POLICY IF EXISTS "Users create feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users view own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Admins view all feedback" ON user_feedback;
DROP POLICY IF EXISTS "Admins update feedback" ON user_feedback;
DROP POLICY IF EXISTS "Public view approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users manage own prompts" ON feedback_prompts_log;
DROP POLICY IF EXISTS "Users manage own ratings" ON feature_ratings;

-- Users can create and view own feedback
CREATE POLICY "Users create feedback" ON user_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users view own feedback" ON user_feedback
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all feedback
CREATE POLICY "Admins view all feedback" ON user_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins update feedback" ON user_feedback
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Public can view approved testimonials
CREATE POLICY "Public view approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true);

-- Admins can manage testimonials
CREATE POLICY "Admins manage testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users manage own prompt logs
CREATE POLICY "Users manage own prompts" ON feedback_prompts_log
  FOR ALL USING (user_id = auth.uid());

-- Users manage own feature ratings
CREATE POLICY "Users manage own ratings" ON feature_ratings
  FOR ALL USING (user_id = auth.uid());

-- 6. Function to check if should show NPS prompt
CREATE OR REPLACE FUNCTION should_show_nps_prompt(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_install_date TIMESTAMPTZ;
  v_session_count INT;
  v_last_prompt TIMESTAMPTZ;
  v_days_since_install INT;
  v_days_since_prompt INT;
BEGIN
  -- Get user info
  SELECT created_at INTO v_install_date
  FROM profiles WHERE id = p_user_id;

  IF v_install_date IS NULL THEN
    RETURN false;
  END IF;

  -- Calculate days since install
  v_days_since_install := EXTRACT(DAY FROM NOW() - v_install_date);

  -- Must be 7+ days since install
  IF v_days_since_install < 7 THEN
    RETURN false;
  END IF;

  -- Check last NPS prompt
  SELECT MAX(shown_at) INTO v_last_prompt
  FROM feedback_prompts_log
  WHERE user_id = p_user_id AND prompt_type = 'nps';

  -- If never shown, show it
  IF v_last_prompt IS NULL THEN
    RETURN true;
  END IF;

  -- Must be 30+ days since last prompt
  v_days_since_prompt := EXTRACT(DAY FROM NOW() - v_last_prompt);
  IF v_days_since_prompt < 30 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get feedback stats
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
  total_feedback BIGINT,
  avg_rating NUMERIC,
  nps_score NUMERIC,
  promoters BIGINT,
  passives BIGINT,
  detractors BIGINT,
  feedback_today BIGINT,
  feedback_this_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_feedback,
    ROUND(AVG(f.rating)::NUMERIC, 2) AS avg_rating,
    -- NPS = % promoters - % detractors
    ROUND(
      (COUNT(*) FILTER (WHERE f.rating >= 4)::NUMERIC / NULLIF(COUNT(*), 0) * 100) -
      (COUNT(*) FILTER (WHERE f.rating <= 2)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
      1
    ) AS nps_score,
    COUNT(*) FILTER (WHERE f.rating >= 4)::BIGINT AS promoters,
    COUNT(*) FILTER (WHERE f.rating = 3)::BIGINT AS passives,
    COUNT(*) FILTER (WHERE f.rating <= 2)::BIGINT AS detractors,
    COUNT(*) FILTER (WHERE f.created_at >= CURRENT_DATE)::BIGINT AS feedback_today,
    COUNT(*) FILTER (WHERE f.created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT AS feedback_this_week
  FROM user_feedback f;
END;
$$ LANGUAGE plpgsql;
