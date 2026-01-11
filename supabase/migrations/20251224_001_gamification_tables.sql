-- =============================================
-- GEM ACADEMY - GAMIFICATION TABLES
-- Migration: 20251224_001_gamification_tables.sql
-- =============================================

-- =============================================
-- 1. USER LEARNING STATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- XP & Levels
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,

  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_count INTEGER DEFAULT 0,

  -- Learning Stats
  total_courses_enrolled INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_quizzes_passed INTEGER DEFAULT 0,
  total_watch_time_minutes INTEGER DEFAULT 0,
  total_certificates INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_learning_stats_user_id ON user_learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_total_xp ON user_learning_stats(total_xp DESC);

ALTER TABLE user_learning_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stats" ON user_learning_stats;
CREATE POLICY "Users can view own stats" ON user_learning_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_learning_stats;
CREATE POLICY "Users can update own stats" ON user_learning_stats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_learning_stats;
CREATE POLICY "Users can insert own stats" ON user_learning_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create stats trigger
CREATE OR REPLACE FUNCTION create_user_learning_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_learning_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_learning_stats ON auth.users;
CREATE TRIGGER on_auth_user_created_learning_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_learning_stats();


-- =============================================
-- 2. XP TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own xp" ON xp_transactions;
CREATE POLICY "Users can view own xp" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert xp" ON xp_transactions;
CREATE POLICY "Users can insert xp" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =============================================
-- 3. ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#FFBD59',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#FFBD59';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS requirement_type TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS requirement_value INTEGER;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'achievements_code_key'
  ) THEN
    ALTER TABLE achievements ADD CONSTRAINT achievements_code_key UNIQUE (code);
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);


-- =============================================
-- 4. USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_new BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert achievements" ON user_achievements;
CREATE POLICY "Users can insert achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =============================================
-- 5. DAILY QUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  difficulty TEXT DEFAULT 'easy',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE daily_quests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE daily_quests ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'easy';
ALTER TABLE daily_quests ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10;

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view quests" ON daily_quests;
CREATE POLICY "Anyone can view quests" ON daily_quests FOR SELECT USING (is_active = true);


-- =============================================
-- 6. USER DAILY QUEST PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS user_daily_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id UUID REFERENCES daily_quests(id) ON DELETE CASCADE NOT NULL,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  xp_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id, quest_date)
);

CREATE INDEX IF NOT EXISTS idx_user_quest_progress ON user_daily_quest_progress(user_id, quest_date);

ALTER TABLE user_daily_quest_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage quest progress" ON user_daily_quest_progress;
CREATE POLICY "Users can manage quest progress" ON user_daily_quest_progress FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- 7. WEEKLY LEADERBOARD
-- =============================================
CREATE TABLE IF NOT EXISTS weekly_leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  weekly_xp INTEGER DEFAULT 0,
  rank INTEGER,
  previous_rank INTEGER,
  league TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON weekly_leaderboard(week_start, weekly_xp DESC);

ALTER TABLE weekly_leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON weekly_leaderboard;
CREATE POLICY "Anyone can view leaderboard" ON weekly_leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own entry" ON weekly_leaderboard;
CREATE POLICY "Users can manage own entry" ON weekly_leaderboard FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- 8. COURSE REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Add missing columns if table already exists
ALTER TABLE course_reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE course_reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE course_reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE course_reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE;
ALTER TABLE course_reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON course_reviews(course_id);

ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON course_reviews;
CREATE POLICY "Anyone can view reviews" ON course_reviews FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can manage own reviews" ON course_reviews;
CREATE POLICY "Users can manage own reviews" ON course_reviews FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- 9. OFFLINE DOWNLOADS
-- =============================================
CREATE TABLE IF NOT EXISTS offline_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  file_path TEXT,
  file_size_bytes BIGINT,
  download_status TEXT DEFAULT 'pending',
  download_progress INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE offline_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage downloads" ON offline_downloads;
CREATE POLICY "Users can manage downloads" ON offline_downloads FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- 10. PROMO BANNERS
-- =============================================
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_value TEXT,
  bg_color TEXT DEFAULT '#1A1B3A',
  text_color TEXT DEFAULT '#FFFFFF',
  cta_text TEXT DEFAULT 'Xem ngay',
  cta_color TEXT DEFAULT '#FFBD59',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_tier TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view banners" ON promo_banners;
CREATE POLICY "Anyone can view banners" ON promo_banners FOR SELECT USING (
  is_active = true
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
);


-- =============================================
-- 11. USER ONBOARDING STATE
-- =============================================
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seen_courses_intro BOOLEAN DEFAULT FALSE,
  seen_gamification_intro BOOLEAN DEFAULT FALSE,
  seen_streak_intro BOOLEAN DEFAULT FALSE,
  seen_leaderboard_intro BOOLEAN DEFAULT FALSE,
  seen_achievements_intro BOOLEAN DEFAULT FALSE,
  seen_quiz_intro BOOLEAN DEFAULT FALSE,
  seen_certificate_intro BOOLEAN DEFAULT FALSE,
  seen_offline_intro BOOLEAN DEFAULT FALSE,
  seen_tooltip_progress BOOLEAN DEFAULT FALSE,
  seen_tooltip_xp BOOLEAN DEFAULT FALSE,
  seen_tooltip_streak BOOLEAN DEFAULT FALSE,
  seen_tooltip_daily_quest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage onboarding" ON user_onboarding;
CREATE POLICY "Users can manage onboarding" ON user_onboarding FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- ADMIN POLICIES (for admins to manage)
-- =============================================
DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage quests" ON daily_quests;
CREATE POLICY "Admins can manage quests" ON daily_quests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage banners" ON promo_banners;
CREATE POLICY "Admins can manage banners" ON promo_banners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
