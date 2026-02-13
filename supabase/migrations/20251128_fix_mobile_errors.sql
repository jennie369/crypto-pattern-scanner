-- =====================================================
-- FIX MOBILE APP ERRORS - 2025-11-28
-- 1. Add is_gem_master column to profiles (if used by RPC)
-- 2. Create notifications view for compatibility
-- 3. Add missing indexes for performance
-- =====================================================

-- =====================================================
-- 1. ADD is_gem_master COLUMN TO PROFILES
-- Some RPC functions may reference this column
-- It indicates if user is a verified GEM Master
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_gem_master BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_gem_master ON profiles(is_gem_master) WHERE is_gem_master = TRUE;

-- Update existing GEM Masters (based on role column)
UPDATE profiles
SET is_gem_master = TRUE
WHERE role IN ('gem_master', 'admin', 'moderator')
  AND is_gem_master IS NOT TRUE;

-- =====================================================
-- 2. CREATE notifications VIEW FOR COMPATIBILITY
-- Some old code may reference 'notifications' instead of 'forum_notifications'
-- =====================================================
CREATE OR REPLACE VIEW notifications AS
SELECT
  id,
  user_id,
  type,
  title,
  message,
  is_read,
  created_at
FROM forum_notifications;

-- Grant access to authenticated users
GRANT SELECT ON notifications TO authenticated;

-- =====================================================
-- 3. FIX forum_posts COLUMNS
-- Ensure all required columns exist
-- =====================================================
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS feed_type TEXT DEFAULT 'general';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS engagement_score INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS repost_count INT DEFAULT 0;

-- Create index for feed queries
CREATE INDEX IF NOT EXISTS idx_forum_posts_feed_type ON forum_posts(feed_type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_engagement ON forum_posts(engagement_score DESC);

-- =====================================================
-- 4. ADD MISSING TABLES FOR FEED SYSTEM
-- =====================================================

-- User Feed Preferences Table
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  feed_algorithm TEXT DEFAULT 'hybrid',
  discovery_weight FLOAT DEFAULT 0.3,
  preferred_categories UUID[],
  following_users UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Interactions Table (for recommendation engine)
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('view', 'like', 'comment', 'share', 'save')),
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Feed Impressions Table (for deduplication)
CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  session_id UUID,
  position INT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Impressions Table (for ad tracking)
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL,
  ad_content JSONB,
  session_id UUID,
  position INT,
  clicked BOOLEAN DEFAULT FALSE,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user ON feed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_session ON feed_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user ON ad_impressions(user_id);

-- Enable RLS
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own feed preferences"
  ON user_feed_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions"
  ON post_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create interactions"
  ON post_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert feed impressions"
  ON feed_impressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert ad impressions"
  ON ad_impressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. UPDATE ENGAGEMENT SCORE FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_post_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET engagement_score = (
    COALESCE(likes_count, 0) * 1 +
    COALESCE(comments_count, 0) * 3 +
    COALESCE(repost_count, 0) * 5
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE user_follows TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
  ON user_follows FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own follows"
  ON user_follows FOR ALL
  USING (auth.uid() = follower_id);

-- =====================================================
-- DONE
-- =====================================================
