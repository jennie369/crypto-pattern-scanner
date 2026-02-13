-- ============================================
-- SEED CONTENT SYSTEM MIGRATION
-- Gemral - Seed Users, Posts, and AI Bot System
-- ============================================

-- 1. Add columns to profiles table for seed users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_seed_user BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seed_persona VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium_seed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free';

-- 2. Add columns to forum_posts table for seed posts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS is_seed_post BOOLEAN DEFAULT false;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS seed_topic VARCHAR(50);

-- 3. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_is_seed_user ON profiles(is_seed_user) WHERE is_seed_user = true;
CREATE INDEX IF NOT EXISTS idx_profiles_seed_persona ON profiles(seed_persona) WHERE seed_persona IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_bot_enabled ON profiles(bot_enabled) WHERE bot_enabled = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium_seed ON profiles(is_premium_seed) WHERE is_premium_seed = true;
CREATE INDEX IF NOT EXISTS idx_posts_is_seed_post ON forum_posts(is_seed_post) WHERE is_seed_post = true;
CREATE INDEX IF NOT EXISTS idx_posts_seed_topic ON forum_posts(seed_topic) WHERE seed_topic IS NOT NULL;

-- 4. Create bot_activity_log table to track all bot actions
CREATE TABLE IF NOT EXISTS bot_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(30) NOT NULL, -- 'comment', 'like', 'reply'
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  seed_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT,
  triggered_by VARCHAR(30) NOT NULL, -- 'auto_new_post', 'auto_reply', 'scheduled', 'manual'
  ai_model VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed'
);

CREATE INDEX IF NOT EXISTS idx_bot_activity_created ON bot_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_activity_type ON bot_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_bot_activity_post ON bot_activity_log(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bot_activity_status ON bot_activity_log(status);

-- 5. Create seed_content_config table for bot configuration
CREATE TABLE IF NOT EXISTS seed_content_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 6. Insert default configuration values
INSERT INTO seed_content_config (key, value, description) VALUES
  ('bot_enabled', 'true', 'Bật/tắt AI bot'),
  ('bot_auto_comment', 'true', 'Tự động comment vào posts của real users'),
  ('bot_auto_reply', 'true', 'Tự động reply comments của real users'),
  ('bot_auto_like', 'true', 'Tự động like posts của real users'),
  ('bot_comments_per_post', '{"min": 3, "max": 5}', 'Số comments bot tạo cho mỗi post'),
  ('bot_likes_per_post', '{"min": 15, "max": 40}', 'Số likes bot tạo cho mỗi post'),
  ('bot_reply_probability', '0.7', 'Xác suất reply comment của real user'),
  ('bot_initial_delay_minutes', '{"min": 5, "max": 20}', 'Delay trước comment đầu tiên'),
  ('bot_comment_spread_hours', '{"min": 1, "max": 48}', 'Spread comments trong bao nhiêu giờ'),
  ('bot_max_daily_comments', '200', 'Giới hạn comments/ngày'),
  ('bot_max_daily_likes', '1000', 'Giới hạn likes/ngày'),
  ('bot_max_daily_replies', '100', 'Giới hạn replies/ngày'),
  ('seed_content_visible', 'true', 'Hiển thị seed content'),
  ('mix_seed_real_feed', 'true', 'Mix seed posts với real posts trong feed'),
  ('gemini_api_key', '"AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc"', 'Gemini API key for AI comments'),
  ('ai_comment_ratio', '0.3', 'Tỷ lệ comments do AI generate (0.3 = 30%)')
ON CONFLICT (key) DO NOTHING;

-- 7. Create seed_generation_log table to track generation history
CREATE TABLE IF NOT EXISTS seed_generation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_type VARCHAR(30) NOT NULL, -- 'users', 'posts', 'likes', 'comments'
  count_generated INTEGER NOT NULL,
  count_failed INTEGER DEFAULT 0,
  parameters JSONB,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  generated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_gen_log_type ON seed_generation_log(generation_type);
CREATE INDEX IF NOT EXISTS idx_gen_log_started ON seed_generation_log(started_at DESC);

-- 8. Enable Row Level Security
ALTER TABLE bot_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_content_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_generation_log ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for bot_activity_log
DROP POLICY IF EXISTS "Admin can view bot logs" ON bot_activity_log;
CREATE POLICY "Admin can view bot logs" ON bot_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

DROP POLICY IF EXISTS "System can insert bot logs" ON bot_activity_log;
CREATE POLICY "System can insert bot logs" ON bot_activity_log
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete bot logs" ON bot_activity_log;
CREATE POLICY "Admin can delete bot logs" ON bot_activity_log
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- 10. RLS Policies for seed_content_config
DROP POLICY IF EXISTS "Admin can manage seed config" ON seed_content_config;
CREATE POLICY "Admin can manage seed config" ON seed_content_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

DROP POLICY IF EXISTS "Anyone can read seed config" ON seed_content_config;
CREATE POLICY "Anyone can read seed config" ON seed_content_config
  FOR SELECT USING (true);

-- 11. RLS Policies for seed_generation_log
DROP POLICY IF EXISTS "Admin can manage generation logs" ON seed_generation_log;
CREATE POLICY "Admin can manage generation logs" ON seed_generation_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- 12. Function to get random seed users for bot actions
CREATE OR REPLACE FUNCTION get_random_seed_users(
  count_needed INTEGER,
  exclude_user_id UUID DEFAULT NULL,
  persona_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  seed_persona VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.seed_persona
  FROM profiles p
  WHERE p.is_seed_user = true
    AND p.bot_enabled = true
    AND (exclude_user_id IS NULL OR p.id != exclude_user_id)
    AND (persona_filter IS NULL OR p.seed_persona = persona_filter)
  ORDER BY RANDOM()
  LIMIT count_needed;
END;
$$;

-- 13. Function to check daily bot limits
CREATE OR REPLACE FUNCTION check_bot_daily_limit(action_type_param VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_count INTEGER;
  max_limit INTEGER;
  config_key VARCHAR;
BEGIN
  config_key := CASE action_type_param
    WHEN 'comment' THEN 'bot_max_daily_comments'
    WHEN 'like' THEN 'bot_max_daily_likes'
    WHEN 'reply' THEN 'bot_max_daily_replies'
    ELSE 'bot_max_daily_comments'
  END;

  SELECT (value::TEXT)::INTEGER INTO max_limit
  FROM seed_content_config
  WHERE key = config_key;

  SELECT COUNT(*) INTO today_count
  FROM bot_activity_log
  WHERE action_type = action_type_param
    AND created_at >= CURRENT_DATE;

  RETURN today_count < COALESCE(max_limit, 100);
END;
$$;

-- 14. Function to get bot config value
CREATE OR REPLACE FUNCTION get_bot_config(config_key VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT value INTO config_value
  FROM seed_content_config
  WHERE key = config_key;

  RETURN config_value;
END;
$$;

-- 15. Function to get seed content statistics
CREATE OR REPLACE FUNCTION get_seed_content_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'seed_users_total', (SELECT COUNT(*) FROM profiles WHERE is_seed_user = true),
    'seed_users_premium', (SELECT COUNT(*) FROM profiles WHERE is_seed_user = true AND is_premium_seed = true),
    'seed_users_regular', (SELECT COUNT(*) FROM profiles WHERE is_seed_user = true AND is_premium_seed = false),
    'seed_posts_total', (SELECT COUNT(*) FROM forum_posts WHERE is_seed_post = true),
    'real_users_total', (SELECT COUNT(*) FROM profiles WHERE is_seed_user = false OR is_seed_user IS NULL),
    'real_posts_total', (SELECT COUNT(*) FROM forum_posts WHERE is_seed_post = false OR is_seed_post IS NULL),
    'bot_comments_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'comment' AND created_at >= CURRENT_DATE),
    'bot_likes_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'like' AND created_at >= CURRENT_DATE),
    'bot_replies_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'reply' AND created_at >= CURRENT_DATE)
  ) INTO stats;

  RETURN stats;
END;
$$;

-- 16. Function to delete all seed content
CREATE OR REPLACE FUNCTION delete_all_seed_content()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_posts INTEGER;
  deleted_users INTEGER;
  deleted_comments INTEGER;
  deleted_likes INTEGER;
BEGIN
  -- Delete comments on seed posts first
  DELETE FROM forum_comments
  WHERE post_id IN (SELECT id FROM forum_posts WHERE is_seed_post = true);
  GET DIAGNOSTICS deleted_comments = ROW_COUNT;

  -- Delete likes on seed posts
  DELETE FROM forum_likes
  WHERE post_id IN (SELECT id FROM forum_posts WHERE is_seed_post = true);
  GET DIAGNOSTICS deleted_likes = ROW_COUNT;

  -- Delete seed posts
  DELETE FROM forum_posts WHERE is_seed_post = true;
  GET DIAGNOSTICS deleted_posts = ROW_COUNT;

  -- Delete comments by seed users
  DELETE FROM forum_comments
  WHERE author_id IN (SELECT id FROM profiles WHERE is_seed_user = true);

  -- Delete likes by seed users
  DELETE FROM forum_likes
  WHERE user_id IN (SELECT id FROM profiles WHERE is_seed_user = true);

  -- Delete seed users
  DELETE FROM profiles WHERE is_seed_user = true;
  GET DIAGNOSTICS deleted_users = ROW_COUNT;

  -- Clear bot activity log
  DELETE FROM bot_activity_log;

  RETURN jsonb_build_object(
    'deleted_posts', deleted_posts,
    'deleted_users', deleted_users,
    'deleted_comments', deleted_comments,
    'deleted_likes', deleted_likes
  );
END;
$$;

-- 17. Trigger function to notify new real posts for bot
CREATE OR REPLACE FUNCTION notify_new_real_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for non-seed posts
  IF NEW.is_seed_post IS NULL OR NEW.is_seed_post = false THEN
    -- Check if author is not a seed user
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.author_id AND is_seed_user = true) THEN
      -- Send notification via pg_notify
      PERFORM pg_notify('new_real_post', json_build_object(
        'post_id', NEW.id,
        'author_id', NEW.author_id,
        'content', LEFT(NEW.content, 500),
        'created_at', NEW.created_at
      )::text);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 18. Trigger function to notify new real comments for bot reply
CREATE OR REPLACE FUNCTION notify_new_real_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if author is not a seed user
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.author_id AND is_seed_user = true) THEN
    -- Send notification via pg_notify
    PERFORM pg_notify('new_real_comment', json_build_object(
      'comment_id', NEW.id,
      'post_id', NEW.post_id,
      'author_id', NEW.author_id,
      'content', LEFT(NEW.content, 500),
      'created_at', NEW.created_at
    )::text);
  END IF;
  RETURN NEW;
END;
$$;

-- 19. Create triggers (drop first if exists)
DROP TRIGGER IF EXISTS trigger_new_real_post ON forum_posts;
CREATE TRIGGER trigger_new_real_post
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_real_post();

DROP TRIGGER IF EXISTS trigger_new_real_comment ON forum_comments;
CREATE TRIGGER trigger_new_real_comment
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_real_comment();

-- 20. Grant permissions
GRANT EXECUTE ON FUNCTION get_random_seed_users TO authenticated;
GRANT EXECUTE ON FUNCTION check_bot_daily_limit TO authenticated;
GRANT EXECUTE ON FUNCTION get_bot_config TO authenticated;
GRANT EXECUTE ON FUNCTION get_seed_content_stats TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_seed_content TO authenticated;

-- Done!
-- Run this migration on your Supabase database to enable the seed content system
