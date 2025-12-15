-- ============================================
-- SEED USERS TABLE MIGRATION
-- Create separate table for seed users (no auth.users FK constraint)
-- ============================================

-- 1. Create seed_users table (separate from profiles to avoid auth.users FK)
CREATE TABLE IF NOT EXISTS seed_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  tier VARCHAR(20) DEFAULT 'free',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  seed_persona VARCHAR(50),
  is_premium_seed BOOLEAN DEFAULT false,
  bot_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_seed_users_persona ON seed_users(seed_persona);
CREATE INDEX IF NOT EXISTS idx_seed_users_premium ON seed_users(is_premium_seed) WHERE is_premium_seed = true;
CREATE INDEX IF NOT EXISTS idx_seed_users_bot_enabled ON seed_users(bot_enabled) WHERE bot_enabled = true;
CREATE INDEX IF NOT EXISTS idx_seed_users_created ON seed_users(created_at DESC);

-- 3. Enable RLS
ALTER TABLE seed_users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can read seed users" ON seed_users;
CREATE POLICY "Anyone can read seed users" ON seed_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage seed users" ON seed_users;
CREATE POLICY "Admin can manage seed users" ON seed_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- 5. Allow insert without auth for seed generation
DROP POLICY IF EXISTS "System can insert seed users" ON seed_users;
CREATE POLICY "System can insert seed users" ON seed_users
  FOR INSERT WITH CHECK (true);

-- 6. Create view to combine real users and seed users for display
CREATE OR REPLACE VIEW all_users_view AS
SELECT
  id,
  email,
  full_name,
  avatar_url,
  bio,
  COALESCE(location, '') as location,
  COALESCE(tier, 'free') as tier,
  COALESCE(followers_count, 0) as followers_count,
  COALESCE(following_count, 0) as following_count,
  false as is_seed_user,
  NULL::VARCHAR as seed_persona,
  false as is_premium_seed,
  created_at,
  updated_at
FROM profiles
UNION ALL
SELECT
  id,
  email,
  full_name,
  avatar_url,
  bio,
  COALESCE(location, '') as location,
  COALESCE(tier, 'free') as tier,
  COALESCE(followers_count, 0) as followers_count,
  COALESCE(following_count, 0) as following_count,
  true as is_seed_user,
  seed_persona,
  is_premium_seed,
  created_at,
  updated_at
FROM seed_users;

-- 7. Function to get random seed users
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
    s.id,
    s.full_name,
    s.avatar_url,
    s.seed_persona
  FROM seed_users s
  WHERE s.bot_enabled = true
    AND (exclude_user_id IS NULL OR s.id != exclude_user_id)
    AND (persona_filter IS NULL OR s.seed_persona = persona_filter)
  ORDER BY RANDOM()
  LIMIT count_needed;
END;
$$;

-- 8. Function to get seed content stats (updated)
CREATE OR REPLACE FUNCTION get_seed_content_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'seed_users_total', (SELECT COUNT(*) FROM seed_users),
    'seed_users_premium', (SELECT COUNT(*) FROM seed_users WHERE is_premium_seed = true),
    'seed_users_regular', (SELECT COUNT(*) FROM seed_users WHERE is_premium_seed = false),
    'seed_posts_total', (SELECT COUNT(*) FROM forum_posts WHERE is_seed_post = true),
    'real_users_total', (SELECT COUNT(*) FROM profiles),
    'real_posts_total', (SELECT COUNT(*) FROM forum_posts WHERE is_seed_post = false OR is_seed_post IS NULL),
    'bot_comments_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'comment' AND created_at >= CURRENT_DATE),
    'bot_likes_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'like' AND created_at >= CURRENT_DATE),
    'bot_replies_today', (SELECT COUNT(*) FROM bot_activity_log WHERE action_type = 'reply' AND created_at >= CURRENT_DATE)
  ) INTO stats;

  RETURN stats;
END;
$$;

-- 9. Function to delete all seed content (updated)
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
  WHERE author_id IN (SELECT id FROM seed_users);

  -- Delete likes by seed users
  DELETE FROM forum_likes
  WHERE user_id IN (SELECT id FROM seed_users);

  -- Delete seed users
  DELETE FROM seed_users;
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

-- 10. Grant permissions
GRANT SELECT ON seed_users TO authenticated;
GRANT SELECT ON seed_users TO anon;
GRANT INSERT, UPDATE, DELETE ON seed_users TO authenticated;
GRANT SELECT ON all_users_view TO authenticated;
GRANT SELECT ON all_users_view TO anon;
GRANT EXECUTE ON FUNCTION get_random_seed_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_seed_content_stats TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_seed_content TO authenticated;
