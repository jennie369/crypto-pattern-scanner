-- =====================================================
-- VISION BOARD 2.0 - COMPLETE DATABASE SCHEMA
-- Created: December 10, 2025
-- =====================================================

-- 1. GOALS
CREATE TABLE IF NOT EXISTS vision_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  life_area VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT 'target',
  color VARCHAR(20),
  target_type VARCHAR(20) DEFAULT 'completion',
  target_value NUMERIC DEFAULT 100,
  target_unit VARCHAR(50),
  current_value NUMERIC DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  progress_percent NUMERIC DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MILESTONES
CREATE TABLE IF NOT EXISTS vision_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_percent INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACTIONS
CREATE TABLE IF NOT EXISTS vision_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  recurrence VARCHAR(20) DEFAULT 'once',
  recurrence_days INTEGER[],
  weight INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 20,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AFFIRMATIONS
CREATE TABLE IF NOT EXISTS vision_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  audio_url TEXT,
  life_area VARCHAR(50),
  times_per_day INTEGER DEFAULT 3,
  times_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AFFIRMATION LOGS
CREATE TABLE IF NOT EXISTS vision_affirmation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affirmation_id UUID REFERENCES vision_affirmations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABITS
CREATE TABLE IF NOT EXISTS vision_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily',
  target_streak INTEGER DEFAULT 30,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  life_area VARCHAR(50),
  icon VARCHAR(50) DEFAULT 'check-circle',
  color VARCHAR(20) DEFAULT '#4CAF50',
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HABIT LOGS
CREATE TABLE IF NOT EXISTS vision_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES vision_habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- 8. RITUALS (Master list)
CREATE TABLE IF NOT EXISTS vision_rituals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100),
  description TEXT,
  category VARCHAR(50) NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  icon VARCHAR(50),
  color VARCHAR(20),
  xp_per_completion INTEGER DEFAULT 20,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RITUAL COMPLETIONS
CREATE TABLE IF NOT EXISTS vision_ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id VARCHAR(50) REFERENCES vision_rituals(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  user_input TEXT,
  reflection TEXT,
  xp_earned INTEGER DEFAULT 0,
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RITUAL STREAKS
CREATE TABLE IF NOT EXISTS vision_ritual_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id VARCHAR(50) REFERENCES vision_rituals(id),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  UNIQUE(user_id, ritual_id)
);

-- 11. DIVINATION READINGS (Tarot & I Ching)
CREATE TABLE IF NOT EXISTS divination_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'tarot' or 'iching'
  question TEXT,
  cards JSONB, -- For tarot
  spread_type VARCHAR(50), -- For tarot
  hexagram_number INTEGER, -- For i ching
  hexagram_data JSONB, -- For i ching
  interpretation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. USER STATS
CREATE TABLE IF NOT EXISTS vision_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  goals_created INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DAILY SUMMARY
CREATE TABLE IF NOT EXISTS vision_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  daily_score INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  actions_total INTEGER DEFAULT 0,
  affirmations_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  ritual_completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

-- 14. CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'goal', 'action', 'ritual', 'habit'
  source_id UUID,
  event_date DATE NOT NULL,
  color VARCHAR(20) DEFAULT '#FFBD59',
  icon VARCHAR(50) DEFAULT 'calendar',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vision_goals_user ON vision_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_goals_status ON vision_goals(status);
CREATE INDEX IF NOT EXISTS idx_vision_goals_life_area ON vision_goals(life_area);
CREATE INDEX IF NOT EXISTS idx_vision_milestones_goal ON vision_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_vision_actions_user ON vision_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_actions_due_date ON vision_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_vision_affirmations_user ON vision_affirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_habits_user ON vision_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_habit_logs_date ON vision_habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_vision_ritual_completions_user ON vision_ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_divination_readings_user ON divination_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_divination_readings_type ON divination_readings(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_vision_daily_summary_user_date ON vision_daily_summary(user_id, summary_date);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE vision_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_affirmation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_ritual_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_ritual_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE divination_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================
DO $$
BEGIN
  -- Goals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own goals') THEN
    CREATE POLICY "Users manage own goals" ON vision_goals FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Milestones (via goal ownership)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own milestones') THEN
    CREATE POLICY "Users manage own milestones" ON vision_milestones FOR ALL
    USING (goal_id IN (SELECT id FROM vision_goals WHERE user_id = auth.uid()));
  END IF;

  -- Actions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own actions') THEN
    CREATE POLICY "Users manage own actions" ON vision_actions FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Affirmations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own affirmations') THEN
    CREATE POLICY "Users manage own affirmations" ON vision_affirmations FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Affirmation Logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own affirmation_logs') THEN
    CREATE POLICY "Users manage own affirmation_logs" ON vision_affirmation_logs FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Habits
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own habits') THEN
    CREATE POLICY "Users manage own habits" ON vision_habits FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Habit Logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own habit_logs') THEN
    CREATE POLICY "Users manage own habit_logs" ON vision_habit_logs FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Ritual Completions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own ritual_completions') THEN
    CREATE POLICY "Users manage own ritual_completions" ON vision_ritual_completions FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Ritual Streaks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own ritual_streaks') THEN
    CREATE POLICY "Users manage own ritual_streaks" ON vision_ritual_streaks FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Divination Readings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own readings') THEN
    CREATE POLICY "Users manage own readings" ON divination_readings FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- User Stats
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own stats') THEN
    CREATE POLICY "Users manage own stats" ON vision_user_stats FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Daily Summary
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own daily_summary') THEN
    CREATE POLICY "Users manage own daily_summary" ON vision_daily_summary FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Calendar Events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own calendar') THEN
    CREATE POLICY "Users manage own calendar" ON calendar_events FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- SEED RITUALS
-- =====================================================
INSERT INTO vision_rituals (id, name, name_vi, description, category, duration_minutes, icon, color, xp_per_completion, sort_order) VALUES
('star-wish', 'Star Wish Ritual', 'Nghi Thức Ước Sao', 'Gửi ước nguyện lên vũ trụ', 'manifest', 3, 'star', '#00CED1', 20, 1),
('cleansing-breath', 'Cleansing Breath', 'Thở Thanh Lọc', 'Giải phóng căng thẳng', 'spiritual', 5, 'wind', '#4A90A4', 20, 2),
('heart-expansion', 'Heart Expansion', 'Mở Rộng Trái Tim', 'Nghi thức tần số yêu thương', 'healing', 7, 'heart', '#FF69B4', 25, 3),
('gratitude-flow', 'Gratitude Flow', 'Dòng Chảy Biết Ơn', 'Thu hút phước lành', 'prosperity', 4, 'gift', '#FFD700', 20, 4),
('water-manifest', 'Water Manifestation', 'Nghi Thức Nước', 'Manifest ước muốn qua nước', 'manifest', 5, 'droplet', '#4169E1', 25, 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  duration_minutes = EXCLUDED.duration_minutes,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  xp_per_completion = EXCLUDED.xp_per_completion,
  sort_order = EXCLUDED.sort_order;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment affirmation count
CREATE OR REPLACE FUNCTION increment_affirmation_count(aff_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vision_affirmations
  SET times_completed = times_completed + 1
  WHERE id = aff_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_vision_goals_updated_at ON vision_goals;
CREATE TRIGGER update_vision_goals_updated_at
  BEFORE UPDATE ON vision_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vision_user_stats_updated_at ON vision_user_stats;
CREATE TRIGGER update_vision_user_stats_updated_at
  BEFORE UPDATE ON vision_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
