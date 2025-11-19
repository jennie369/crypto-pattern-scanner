-- ==========================================
-- LEADERBOARD & USER PROFILES SYSTEM
-- Day 37-38: Gamification & Social Features
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USER STATS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_profit DECIMAL(15,2) DEFAULT 0,
  total_loss DECIMAL(15,2) DEFAULT 0,
  roi DECIMAL(8,2) DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  patterns_detected INTEGER DEFAULT 0,
  previous_rank INTEGER,
  period_start TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ACHIEVEMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('trading', 'social', 'learning', 'special')),
  badge_icon TEXT,
  badge_color TEXT,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('win_rate', 'total_trades', 'profit', 'streak', 'patterns', 'forum_posts', 'custom')),
  criteria_value DECIMAL(15,2),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- USER ACHIEVEMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- ADD PROFILE FIELDS FOR USER PROFILES
-- ==========================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS telegram_handle TEXT,
  ADD COLUMN IF NOT EXISTS trading_style TEXT,
  ADD COLUMN IF NOT EXISTS favorite_pairs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT TRUE;

-- ==========================================
-- USER FOLLOWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- User Stats Indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_win_rate ON public.user_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_profit ON public.user_stats(total_profit DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_trades ON public.user_stats(total_trades DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_roi ON public.user_stats(roi DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON public.user_stats(best_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_patterns ON public.user_stats(patterns_detected DESC);

-- Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON public.achievements(rarity);

-- User Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- User Follows Indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- User Stats Policies
CREATE POLICY "Users can view all stats"
  ON public.user_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- User Achievements Policies
CREATE POLICY "Anyone can view user achievements"
  ON public.user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- User Follows Policies
CREATE POLICY "Anyone can view follows"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ==========================================
-- INSERT DEFAULT ACHIEVEMENTS
-- ==========================================

INSERT INTO public.achievements (name, description, category, badge_icon, badge_color, criteria_type, criteria_value, rarity, points) VALUES
('First Trade', 'Hoàn thành giao dịch đầu tiên', 'trading', '🎯', '#FFBD59', 'total_trades', 1, 'common', 10),
('Novice Trader', 'Hoàn thành 10 giao dịch', 'trading', '📊', '#00D9FF', 'total_trades', 10, 'common', 25),
('Pattern Hunter', 'Phát hiện 10 patterns', 'trading', '🔍', '#00D9FF', 'patterns', 10, 'common', 20),
('Pattern Master', 'Phát hiện 50 patterns', 'trading', '🎯', '#8B5CF6', 'patterns', 50, 'rare', 50),
('Winning Streak', 'Thắng 5 lệnh liên tiếp', 'trading', '🔥', '#FF8C00', 'streak', 5, 'rare', 50),
('Hot Streak', 'Thắng 10 lệnh liên tiếp', 'trading', '🔥', '#FF6B9D', 'streak', 10, 'epic', 100),
('Unstoppable', 'Thắng 20 lệnh liên tiếp', 'trading', '⚡', '#FFD700', 'streak', 20, 'legendary', 250),
('Profit Maker', 'Đạt 1M lợi nhuận', 'trading', '💰', '#00FF88', 'profit', 1000000, 'common', 30),
('Profit Master', 'Đạt 10M lợi nhuận', 'trading', '💎', '#00FF88', 'profit', 10000000, 'epic', 100),
('Profit Legend', 'Đạt 100M lợi nhuận', 'trading', '👑', '#FFD700', 'profit', 100000000, 'legendary', 500),
('Consistent Trader', 'Win rate >60% với 20+ trades', 'trading', '📈', '#FFBD59', 'win_rate', 60, 'rare', 75),
('Consistency King', 'Win rate >70% với 50+ trades', 'trading', '👑', '#8B5CF6', 'win_rate', 70, 'legendary', 200),
('Community Member', 'Tham gia cộng đồng', 'social', '🌟', '#00D9FF', 'custom', 0, 'common', 5),
('Forum Contributor', 'Tạo 10 bài viết forum', 'social', '💬', '#FFBD59', 'forum_posts', 10, 'common', 20),
('Active Member', 'Tạo 50 bài viết forum', 'social', '🎖️', '#8B5CF6', 'forum_posts', 50, 'rare', 75),
('GEM Legend', 'Unlock tất cả achievements', 'special', '🏆', '#FFD700', 'custom', 0, 'legendary', 1000)
ON CONFLICT DO NOTHING;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Update user_stats timestamp on update
CREATE OR REPLACE FUNCTION update_user_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_stats_update_timestamp
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_timestamp();

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats from trades
CREATE OR REPLACE FUNCTION calculate_user_stats(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_trades INTEGER;
  v_winning_trades INTEGER;
  v_losing_trades INTEGER;
  v_win_rate DECIMAL(5,2);
  v_total_profit DECIMAL(15,2);
  v_total_loss DECIMAL(15,2);
  v_roi DECIMAL(8,2);
BEGIN
  -- Calculate stats from trading_journal
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE profit_loss > 0),
    COUNT(*) FILTER (WHERE profit_loss < 0),
    COALESCE(SUM(profit_loss) FILTER (WHERE profit_loss > 0), 0),
    COALESCE(ABS(SUM(profit_loss)) FILTER (WHERE profit_loss < 0), 0)
  INTO
    v_total_trades,
    v_winning_trades,
    v_losing_trades,
    v_total_profit,
    v_total_loss
  FROM public.trading_journal
  WHERE user_id = p_user_id
    AND profit_loss IS NOT NULL;

  -- Calculate win rate
  IF v_total_trades > 0 THEN
    v_win_rate := (v_winning_trades::DECIMAL / v_total_trades::DECIMAL) * 100;
  ELSE
    v_win_rate := 0;
  END IF;

  -- Calculate ROI
  IF v_total_loss > 0 THEN
    v_roi := ((v_total_profit - v_total_loss) / v_total_loss) * 100;
  ELSE
    v_roi := 0;
  END IF;

  -- Update or insert user stats
  INSERT INTO public.user_stats (
    user_id,
    total_trades,
    winning_trades,
    losing_trades,
    win_rate,
    total_profit,
    total_loss,
    roi
  ) VALUES (
    p_user_id,
    v_total_trades,
    v_winning_trades,
    v_losing_trades,
    v_win_rate,
    v_total_profit,
    v_total_loss,
    v_roi
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_trades = EXCLUDED.total_trades,
    winning_trades = EXCLUDED.winning_trades,
    losing_trades = EXCLUDED.losing_trades,
    win_rate = EXCLUDED.win_rate,
    total_profit = EXCLUDED.total_profit,
    total_loss = EXCLUDED.total_loss,
    roi = EXCLUDED.roi,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE public.user_stats IS 'User trading statistics for leaderboard';
COMMENT ON TABLE public.achievements IS 'Available achievements and badges';
COMMENT ON TABLE public.user_achievements IS 'Achievements unlocked by users';
COMMENT ON TABLE public.user_follows IS 'User follow relationships';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Leaderboard system tables created successfully!';
  RAISE NOTICE '🏆 Tables: user_stats, achievements, user_achievements, user_follows';
  RAISE NOTICE '🎯 Default achievements inserted';
  RAISE NOTICE '📊 Stats calculation functions created';
  RAISE NOTICE '🔐 RLS policies enabled';
END $$;
