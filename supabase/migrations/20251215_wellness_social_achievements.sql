-- ============================================================
-- WELLNESS & SOCIAL ACHIEVEMENTS SYSTEM
-- Migration: 20251215_wellness_social_achievements.sql
-- Purpose: Add wellness (tarot, iching, crystal) and social achievements
-- ============================================================

-- 1. Create wellness_activity_logs table for tracking
CREATE TABLE IF NOT EXISTS wellness_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'tarot', 'iching', 'meditation', 'crystal_purchase'
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_type, activity_date)
);

-- 2. Create wellness_streaks table
CREATE TABLE IF NOT EXISTS wellness_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'tarot', 'iching', 'meditation'
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  last_completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_type)
);

-- 3. Create social_stats table for tracking social metrics
CREATE TABLE IF NOT EXISTS social_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_posts INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_likes_given INT DEFAULT 0,
  total_likes_received INT DEFAULT 0,
  total_gifts_sent INT DEFAULT 0,
  total_gifts_received INT DEFAULT 0,
  total_referrals INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  viral_posts_count INT DEFAULT 0, -- posts with 100+ likes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create crystal_purchases table for tracking
CREATE TABLE IF NOT EXISTS crystal_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id VARCHAR(100), -- Shopify product ID
  product_title VARCHAR(500),
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  order_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_wellness_activity_user_date ON wellness_activity_logs(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_wellness_streaks_user ON wellness_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_social_stats_user ON social_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_crystal_purchases_user ON crystal_purchases(user_id);

-- 6. Function to track wellness activity
CREATE OR REPLACE FUNCTION track_wellness_activity(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_current_streak INT;
  v_longest_streak INT;
  v_total INT;
  v_last_date DATE;
  v_is_new_day BOOLEAN := false;
BEGIN
  -- Log the activity (upsert)
  INSERT INTO wellness_activity_logs (user_id, activity_type, activity_date, metadata)
  VALUES (p_user_id, p_activity_type, v_today, p_metadata)
  ON CONFLICT (user_id, activity_type, activity_date) DO UPDATE
  SET metadata = EXCLUDED.metadata;

  -- Get or create streak record
  SELECT current_streak, longest_streak, total_completions, last_completion_date
  INTO v_current_streak, v_longest_streak, v_total, v_last_date
  FROM wellness_streaks
  WHERE user_id = p_user_id AND activity_type = p_activity_type;

  IF NOT FOUND THEN
    -- First time
    INSERT INTO wellness_streaks (user_id, activity_type, current_streak, longest_streak, total_completions, last_completion_date)
    VALUES (p_user_id, p_activity_type, 1, 1, 1, v_today);

    RETURN jsonb_build_object(
      'success', true,
      'current_streak', 1,
      'longest_streak', 1,
      'total_completions', 1,
      'is_first', true
    );
  END IF;

  -- Check if already completed today
  IF v_last_date = v_today THEN
    RETURN jsonb_build_object(
      'success', true,
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'total_completions', v_total,
      'already_done_today', true
    );
  END IF;

  v_is_new_day := true;
  v_total := v_total + 1;

  -- Update streak
  IF v_last_date = v_yesterday THEN
    -- Consecutive day
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken
    v_current_streak := 1;
  END IF;

  -- Update record
  UPDATE wellness_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      total_completions = v_total,
      last_completion_date = v_today,
      updated_at = NOW()
  WHERE user_id = p_user_id AND activity_type = p_activity_type;

  RETURN jsonb_build_object(
    'success', true,
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'total_completions', v_total,
    'is_new_day', v_is_new_day
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to get wellness stats
CREATE OR REPLACE FUNCTION get_wellness_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_tarot RECORD;
  v_iching RECORD;
  v_meditation RECORD;
  v_crystals INT;
BEGIN
  -- Get streaks
  SELECT * INTO v_tarot FROM wellness_streaks WHERE user_id = p_user_id AND activity_type = 'tarot';
  SELECT * INTO v_iching FROM wellness_streaks WHERE user_id = p_user_id AND activity_type = 'iching';
  SELECT * INTO v_meditation FROM wellness_streaks WHERE user_id = p_user_id AND activity_type = 'meditation';

  -- Get crystal count
  SELECT COUNT(*) INTO v_crystals FROM crystal_purchases WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'tarot', jsonb_build_object(
      'current_streak', COALESCE(v_tarot.current_streak, 0),
      'longest_streak', COALESCE(v_tarot.longest_streak, 0),
      'total', COALESCE(v_tarot.total_completions, 0)
    ),
    'iching', jsonb_build_object(
      'current_streak', COALESCE(v_iching.current_streak, 0),
      'longest_streak', COALESCE(v_iching.longest_streak, 0),
      'total', COALESCE(v_iching.total_completions, 0)
    ),
    'meditation', jsonb_build_object(
      'current_streak', COALESCE(v_meditation.current_streak, 0),
      'longest_streak', COALESCE(v_meditation.longest_streak, 0),
      'total', COALESCE(v_meditation.total_completions, 0)
    ),
    'crystals', v_crystals
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Function to update social stats
CREATE OR REPLACE FUNCTION update_social_stats(
  p_user_id UUID,
  p_stat_type VARCHAR(50),
  p_increment INT DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_stats social_stats;
BEGIN
  -- Upsert social stats
  INSERT INTO social_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update specific stat
  CASE p_stat_type
    WHEN 'post' THEN
      UPDATE social_stats SET total_posts = total_posts + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'comment' THEN
      UPDATE social_stats SET total_comments = total_comments + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'like_given' THEN
      UPDATE social_stats SET total_likes_given = total_likes_given + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'like_received' THEN
      UPDATE social_stats SET total_likes_received = total_likes_received + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'gift_sent' THEN
      UPDATE social_stats SET total_gifts_sent = total_gifts_sent + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'gift_received' THEN
      UPDATE social_stats SET total_gifts_received = total_gifts_received + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'referral' THEN
      UPDATE social_stats SET total_referrals = total_referrals + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'follower' THEN
      UPDATE social_stats SET follower_count = follower_count + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'following' THEN
      UPDATE social_stats SET following_count = following_count + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    WHEN 'viral_post' THEN
      UPDATE social_stats SET viral_posts_count = viral_posts_count + p_increment, updated_at = NOW() WHERE user_id = p_user_id;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Unknown stat type');
  END CASE;

  -- Return updated stats
  SELECT * INTO v_stats FROM social_stats WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'stats', row_to_json(v_stats)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to get social stats
CREATE OR REPLACE FUNCTION get_social_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats social_stats;
BEGIN
  SELECT * INTO v_stats FROM social_stats WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'total_posts', 0,
      'total_comments', 0,
      'total_likes_given', 0,
      'total_likes_received', 0,
      'total_gifts_sent', 0,
      'total_gifts_received', 0,
      'total_referrals', 0,
      'follower_count', 0,
      'following_count', 0,
      'viral_posts_count', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'total_posts', v_stats.total_posts,
    'total_comments', v_stats.total_comments,
    'total_likes_given', v_stats.total_likes_given,
    'total_likes_received', v_stats.total_likes_received,
    'total_gifts_sent', v_stats.total_gifts_sent,
    'total_gifts_received', v_stats.total_gifts_received,
    'total_referrals', v_stats.total_referrals,
    'follower_count', v_stats.follower_count,
    'following_count', v_stats.following_count,
    'viral_posts_count', v_stats.viral_posts_count
  );
END;
$$ LANGUAGE plpgsql;

-- 10. Function to check post viral status (called when like count updates)
CREATE OR REPLACE FUNCTION check_viral_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if post just became viral (100+ likes)
  IF NEW.like_count >= 100 AND (OLD.like_count IS NULL OR OLD.like_count < 100) THEN
    -- Update owner's viral count
    PERFORM update_social_stats(NEW.user_id, 'viral_post', 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for viral post detection
DROP TRIGGER IF EXISTS trigger_check_viral_post ON forum_posts;
CREATE TRIGGER trigger_check_viral_post
  AFTER UPDATE OF like_count ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION check_viral_post();

-- 11. RLS Policies
ALTER TABLE wellness_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotent migration)
DROP POLICY IF EXISTS "Users can view own wellness logs" ON wellness_activity_logs;
DROP POLICY IF EXISTS "Users can insert own wellness logs" ON wellness_activity_logs;
DROP POLICY IF EXISTS "Users can view own wellness streaks" ON wellness_streaks;
DROP POLICY IF EXISTS "Users can view own social stats" ON social_stats;
DROP POLICY IF EXISTS "Users can view own crystal purchases" ON crystal_purchases;
DROP POLICY IF EXISTS "Admins can view all wellness logs" ON wellness_activity_logs;
DROP POLICY IF EXISTS "Admins can view all wellness streaks" ON wellness_streaks;
DROP POLICY IF EXISTS "Admins can view all social stats" ON social_stats;
DROP POLICY IF EXISTS "Admins can view all crystal purchases" ON crystal_purchases;

-- Users can view/manage their own data
CREATE POLICY "Users can view own wellness logs"
  ON wellness_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness logs"
  ON wellness_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own wellness streaks"
  ON wellness_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social stats"
  ON social_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own crystal purchases"
  ON crystal_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all wellness logs"
  ON wellness_activity_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all wellness streaks"
  ON wellness_streaks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all social stats"
  ON social_stats FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view all crystal purchases"
  ON crystal_purchases FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 12. Grant execute permissions
GRANT EXECUTE ON FUNCTION track_wellness_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_wellness_stats TO authenticated;
GRANT EXECUTE ON FUNCTION update_social_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_social_stats TO authenticated;

