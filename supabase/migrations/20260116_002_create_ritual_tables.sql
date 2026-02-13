-- ============================================================
-- MIGRATION 002: RITUAL TABLES
-- GEM Master Chatbot Upgrade - Smart Ritual & Habit Tracking
-- ============================================================

-- ============================================================
-- TABLE 1: user_rituals
-- Ritual/habit definitions for each user
-- ============================================================

CREATE TABLE IF NOT EXISTS user_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ritual Identity
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ritual_type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (ritual_type IN (
    'meditation', 'affirmation', 'gratitude', 'journaling',
    'exercise', 'reading', 'breathing', 'visualization', 'custom'
  )),

  -- Scheduling
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN (
    'daily', 'weekdays', 'weekends', 'weekly', 'custom'
  )),
  scheduled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  scheduled_time TIME NOT NULL DEFAULT '08:00',
  duration_minutes INTEGER DEFAULT 10 CHECK (duration_minutes >= 1 AND duration_minutes <= 480),

  -- Reminders
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 15,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Gamification
  xp_reward INTEGER DEFAULT 10,
  streak_eligible BOOLEAN DEFAULT TRUE,

  -- Display
  icon_name VARCHAR(50) DEFAULT 'sparkles',
  color VARCHAR(20) DEFAULT '#FFBD59',
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_rituals
CREATE INDEX IF NOT EXISTS idx_user_rituals_user_id ON user_rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rituals_type ON user_rituals(ritual_type);
CREATE INDEX IF NOT EXISTS idx_user_rituals_active ON user_rituals(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_rituals_scheduled ON user_rituals(user_id, scheduled_time);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_ritual_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_ritual_timestamp ON user_rituals;
CREATE TRIGGER trigger_update_user_ritual_timestamp
  BEFORE UPDATE ON user_rituals
  FOR EACH ROW
  EXECUTE FUNCTION update_user_ritual_timestamp();

-- ============================================================
-- TABLE 2: ritual_completions
-- Log of completed rituals
-- ============================================================

CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id UUID REFERENCES user_rituals(id) ON DELETE SET NULL,

  -- Completion Data
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Performance Metrics
  duration_actual INTEGER, -- actual minutes spent
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5), -- 1-5 stars

  -- Mood Tracking
  mood_before VARCHAR(50),
  mood_after VARCHAR(50),

  -- Notes
  notes TEXT,
  reflection TEXT,

  -- XP Awarded
  xp_earned INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ritual_completions
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_lookup ON ritual_completions(user_id, completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_date ON ritual_completions(ritual_id, completion_date DESC);

-- Prevent duplicate completions for same ritual on same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_ritual_completions_unique_daily
  ON ritual_completions(user_id, ritual_id, completion_date)
  WHERE ritual_id IS NOT NULL;

-- ============================================================
-- ENHANCE EXISTING user_streaks TABLE
-- Add ritual_id support if not exists
-- ============================================================

-- Check if ritual_id column exists, add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'ritual_id'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN ritual_id UUID REFERENCES user_rituals(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_user_streaks_ritual_id ON user_streaks(ritual_id);
  END IF;

  -- Add total_points if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'total_points'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;

  -- Add current_level if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'current_level'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN current_level INTEGER DEFAULT 1;
  END IF;

  -- Add badges_earned if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'badges_earned'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN badges_earned TEXT[] DEFAULT '{}';
  END IF;

  -- Add streak_start_date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'streak_start_date'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN streak_start_date DATE;
  END IF;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on tables
ALTER TABLE user_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- user_rituals policies
DROP POLICY IF EXISTS "Users can view own rituals" ON user_rituals;
CREATE POLICY "Users can view own rituals" ON user_rituals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own rituals" ON user_rituals;
CREATE POLICY "Users can create own rituals" ON user_rituals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rituals" ON user_rituals;
CREATE POLICY "Users can update own rituals" ON user_rituals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rituals" ON user_rituals;
CREATE POLICY "Users can delete own rituals" ON user_rituals
  FOR DELETE USING (auth.uid() = user_id);

-- ritual_completions policies
DROP POLICY IF EXISTS "Users can view own completions" ON ritual_completions;
CREATE POLICY "Users can view own completions" ON ritual_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own completions" ON ritual_completions;
CREATE POLICY "Users can create own completions" ON ritual_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own completions" ON ritual_completions;
CREATE POLICY "Users can update own completions" ON ritual_completions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own completions" ON ritual_completions;
CREATE POLICY "Users can delete own completions" ON ritual_completions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Initialize default rituals for new user
CREATE OR REPLACE FUNCTION initialize_default_rituals(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Check if user already has rituals
  SELECT COUNT(*) INTO v_count FROM user_rituals WHERE user_id = p_user_id;

  IF v_count > 0 THEN
    RETURN v_count;
  END IF;

  -- Insert default rituals
  INSERT INTO user_rituals (user_id, name, description, ritual_type, duration_minutes, scheduled_time, icon_name, color, sort_order)
  VALUES
    (p_user_id, 'Thiền buổi sáng', 'Thiền định 10 phút để bắt đầu ngày mới với tâm an tĩnh', 'meditation', 10, '06:30', 'sun', '#87CEEB', 1),
    (p_user_id, 'Affirmation', 'Đọc và cảm nhận các khẳng định tích cực để nâng cao tần số', 'affirmation', 5, '07:00', 'sparkles', '#FFD700', 2),
    (p_user_id, 'Nhật ký biết ơn', 'Viết 3 điều biết ơn trong ngày để nuôi dưỡng lòng biết ơn', 'gratitude', 5, '21:00', 'heart', '#FF69B4', 3),
    (p_user_id, 'Thiền trước ngủ', 'Thiền định để thư giãn và chuẩn bị cho giấc ngủ sâu', 'meditation', 15, '22:00', 'moon', '#6A5BFF', 4);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function: Get today's ritual status
CREATE OR REPLACE FUNCTION get_today_ritual_status(p_user_id UUID)
RETURNS TABLE (
  ritual_id UUID,
  ritual_name VARCHAR,
  ritual_type VARCHAR,
  scheduled_time TIME,
  is_completed BOOLEAN,
  completion_id UUID,
  completion_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_day_of_week INTEGER := EXTRACT(DOW FROM CURRENT_DATE)::INTEGER;
BEGIN
  -- Convert Sunday=0 to Sunday=7
  IF v_day_of_week = 0 THEN
    v_day_of_week := 7;
  END IF;

  RETURN QUERY
  SELECT
    r.id AS ritual_id,
    r.name AS ritual_name,
    r.ritual_type,
    r.scheduled_time,
    c.id IS NOT NULL AS is_completed,
    c.id AS completion_id,
    c.completed_at AS completion_time
  FROM user_rituals r
  LEFT JOIN ritual_completions c ON c.ritual_id = r.id AND c.completion_date = v_today
  WHERE r.user_id = p_user_id
    AND r.is_active = TRUE
    AND v_day_of_week = ANY(r.scheduled_days)
  ORDER BY r.scheduled_time ASC;
END;
$$;

-- Function: Complete a ritual
CREATE OR REPLACE FUNCTION complete_ritual(
  p_user_id UUID,
  p_ritual_id UUID,
  p_duration_actual INTEGER DEFAULT NULL,
  p_quality_rating INTEGER DEFAULT NULL,
  p_mood_before VARCHAR DEFAULT NULL,
  p_mood_after VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  completion_id UUID,
  xp_earned INTEGER,
  streak_updated BOOLEAN,
  new_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completion_id UUID;
  v_xp INTEGER;
  v_ritual_xp INTEGER;
  v_today DATE := CURRENT_DATE;
  v_existing UUID;
  v_streak_result RECORD;
BEGIN
  -- Check if already completed today
  SELECT id INTO v_existing
  FROM ritual_completions
  WHERE user_id = p_user_id
    AND ritual_id = p_ritual_id
    AND completion_date = v_today;

  IF v_existing IS NOT NULL THEN
    -- Already completed, return existing
    RETURN QUERY
    SELECT v_existing, 0, FALSE, 0;
    RETURN;
  END IF;

  -- Get ritual XP reward
  SELECT xp_reward INTO v_ritual_xp FROM user_rituals WHERE id = p_ritual_id;
  v_xp := COALESCE(v_ritual_xp, 10);

  -- Insert completion
  INSERT INTO ritual_completions (
    user_id, ritual_id, completion_date, completed_at,
    duration_actual, quality_rating, mood_before, mood_after, notes, xp_earned
  )
  VALUES (
    p_user_id, p_ritual_id, v_today, NOW(),
    p_duration_actual, p_quality_rating, p_mood_before, p_mood_after, p_notes, v_xp
  )
  RETURNING id INTO v_completion_id;

  -- Update streak (if user_streaks exists for this ritual)
  -- This will be handled by the application layer for more complex logic

  RETURN QUERY
  SELECT v_completion_id, v_xp, TRUE, 1;
END;
$$;

-- Function: Get ritual statistics
CREATE OR REPLACE FUNCTION get_ritual_stats(
  p_user_id UUID,
  p_ritual_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_completions BIGINT,
  avg_duration NUMERIC,
  avg_rating NUMERIC,
  completion_rate NUMERIC,
  completions_by_day JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE := CURRENT_DATE - p_days;
  v_total_days INTEGER := p_days;
BEGIN
  RETURN QUERY
  WITH completions AS (
    SELECT *
    FROM ritual_completions
    WHERE user_id = p_user_id
      AND (p_ritual_id IS NULL OR ritual_id = p_ritual_id)
      AND completion_date >= v_start_date
  ),
  stats AS (
    SELECT
      COUNT(*) AS total,
      AVG(duration_actual)::NUMERIC(10,1) AS avg_dur,
      AVG(quality_rating)::NUMERIC(10,1) AS avg_rat
    FROM completions
  ),
  by_day AS (
    SELECT
      jsonb_object_agg(
        completion_date::TEXT,
        cnt
      ) AS grouped
    FROM (
      SELECT completion_date, COUNT(*) AS cnt
      FROM completions
      GROUP BY completion_date
    ) sub
  )
  SELECT
    s.total,
    s.avg_dur,
    s.avg_rat,
    CASE WHEN v_total_days > 0 THEN (s.total::NUMERIC / v_total_days * 100) ELSE 0 END,
    COALESCE(bd.grouped, '{}'::JSONB)
  FROM stats s
  CROSS JOIN by_day bd;
END;
$$;

-- Function: Get completion calendar data
CREATE OR REPLACE FUNCTION get_ritual_calendar(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  calendar_date DATE,
  completions_count INTEGER,
  ritual_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    completion_date AS calendar_date,
    COUNT(*)::INTEGER AS completions_count,
    ARRAY_AGG(DISTINCT ritual_id) AS ritual_ids
  FROM ritual_completions
  WHERE user_id = p_user_id
    AND completion_date >= p_start_date
    AND completion_date <= p_end_date
  GROUP BY completion_date
  ORDER BY completion_date;
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION initialize_default_rituals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_ritual_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_ritual(UUID, UUID, INTEGER, INTEGER, VARCHAR, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ritual_stats(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ritual_calendar(UUID, DATE, DATE) TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE user_rituals IS 'User-defined rituals and habits for tracking';
COMMENT ON TABLE ritual_completions IS 'Log of completed rituals with performance metrics';

COMMENT ON COLUMN user_rituals.scheduled_days IS 'Array of days: 1=Monday to 7=Sunday';
COMMENT ON COLUMN user_rituals.xp_reward IS 'XP points awarded for completing this ritual';
COMMENT ON COLUMN ritual_completions.quality_rating IS '1-5 star rating for completion quality';
COMMENT ON COLUMN ritual_completions.mood_before IS 'User mood before ritual (e.g., anxious, tired, neutral)';
COMMENT ON COLUMN ritual_completions.mood_after IS 'User mood after ritual (e.g., calm, energized, peaceful)';
