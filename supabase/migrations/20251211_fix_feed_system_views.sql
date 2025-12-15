-- =====================================================
-- FIX: Drop existing views before recreating
-- Fixes "cannot change name of view column" error
-- December 11, 2025
-- =====================================================

-- Drop existing views first
DROP VIEW IF EXISTS top_performing_posts CASCADE;
DROP VIEW IF EXISTS user_engagement_summary CASCADE;
DROP VIEW IF EXISTS daily_active_users CASCADE;
DROP VIEW IF EXISTS ad_performance_summary CASCADE;

-- ============================================
-- FEED SYSTEM DATABASE SCHEMA
-- ============================================

-- 1. Extend forum_posts table
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS engagement_score FLOAT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS relevance_score FLOAT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS viral_potential FLOAT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Post interactions table
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  dwell_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- 3. User feed preferences
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_categories UUID[],
  following_users UUID[],
  hidden_users UUID[],
  feed_algorithm TEXT DEFAULT 'hybrid',
  discovery_weight FLOAT DEFAULT 0.4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Feed impressions tracking
CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  interacted BOOLEAN DEFAULT FALSE,
  interaction_type TEXT
);

-- 5. Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL,
  ad_content JSONB,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  click_at TIMESTAMPTZ,
  convert_at TIMESTAMPTZ
);

-- 6. User hashtag affinity
CREATE TABLE IF NOT EXISTS user_hashtag_affinity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  engagement_count INTEGER DEFAULT 1,
  last_engaged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hashtag)
);

-- 7. User content dislikes
CREATE TABLE IF NOT EXISTS user_content_dislikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  dislike_count INTEGER DEFAULT 1,
  last_disliked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON post_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_engagement ON forum_posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user ON feed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_session ON feed_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_type ON ad_impressions(ad_type);
CREATE INDEX IF NOT EXISTS idx_hashtag_affinity_user ON user_hashtag_affinity(user_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_affinity_tag ON user_hashtag_affinity(hashtag);

-- ============================================
-- ANALYTICS VIEWS (Recreated fresh)
-- ============================================

-- Top performing posts
CREATE VIEW top_performing_posts AS
SELECT
  p.*,
  u.username,
  COALESCE(p.like_count, 0) + COALESCE(p.comment_count, 0) * 3 + COALESCE(p.share_count, 0) * 5 + COALESCE(p.save_count, 0) * 4 as total_engagement
FROM forum_posts p
JOIN profiles u ON p.user_id = u.id
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.engagement_score DESC
LIMIT 100;

-- User engagement summary
CREATE VIEW user_engagement_summary AS
SELECT
  user_id,
  COUNT(DISTINCT post_id) as posts_interacted,
  COUNT(*) FILTER (WHERE interaction_type = 'like') as likes_given,
  COUNT(*) FILTER (WHERE interaction_type = 'comment') as comments_made,
  COUNT(*) FILTER (WHERE interaction_type = 'share') as shares_made,
  COUNT(*) FILTER (WHERE interaction_type = 'save') as saves_made,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as posts_viewed,
  AVG(dwell_time) FILTER (WHERE dwell_time IS NOT NULL) as avg_dwell_time
FROM post_interactions
GROUP BY user_id;

-- Daily active users
CREATE VIEW daily_active_users AS
SELECT
  DATE(shown_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM feed_impressions
GROUP BY DATE(shown_at)
ORDER BY date DESC;

-- Ad performance summary
CREATE VIEW ad_performance_summary AS
SELECT
  ad_type,
  DATE(shown_at) as date,
  COUNT(*) as impressions,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as ctr,
  ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN clicked THEN 1 ELSE 0 END), 0), 2) as conversion_rate
FROM ad_impressions
GROUP BY ad_type, DATE(shown_at)
ORDER BY date DESC, ad_type;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hashtag_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_dislikes ENABLE ROW LEVEL SECURITY;

-- Post interactions policies
DROP POLICY IF EXISTS "Users can view own interactions" ON post_interactions;
CREATE POLICY "Users can view own interactions" ON post_interactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own interactions" ON post_interactions;
CREATE POLICY "Users can create own interactions" ON post_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interactions" ON post_interactions;
CREATE POLICY "Users can delete own interactions" ON post_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- User feed preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_feed_preferences;
CREATE POLICY "Users can view own preferences" ON user_feed_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON user_feed_preferences;
CREATE POLICY "Users can manage own preferences" ON user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Feed impressions policies
DROP POLICY IF EXISTS "Users can view own impressions" ON feed_impressions;
CREATE POLICY "Users can view own impressions" ON feed_impressions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own impressions" ON feed_impressions;
CREATE POLICY "Users can create own impressions" ON feed_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ad impressions policies
DROP POLICY IF EXISTS "Users can view own ad impressions" ON ad_impressions;
CREATE POLICY "Users can view own ad impressions" ON ad_impressions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own ad impressions" ON ad_impressions;
CREATE POLICY "Users can create own ad impressions" ON ad_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ad impressions" ON ad_impressions;
CREATE POLICY "Users can update own ad impressions" ON ad_impressions
  FOR UPDATE USING (auth.uid() = user_id);

-- User hashtag affinity policies
DROP POLICY IF EXISTS "Users can view own hashtag affinity" ON user_hashtag_affinity;
CREATE POLICY "Users can view own hashtag affinity" ON user_hashtag_affinity
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own hashtag affinity" ON user_hashtag_affinity;
CREATE POLICY "Users can manage own hashtag affinity" ON user_hashtag_affinity
  FOR ALL USING (auth.uid() = user_id);

-- User content dislikes policies
DROP POLICY IF EXISTS "Users can view own dislikes" ON user_content_dislikes;
CREATE POLICY "Users can view own dislikes" ON user_content_dislikes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own dislikes" ON user_content_dislikes;
CREATE POLICY "Users can manage own dislikes" ON user_content_dislikes
  FOR ALL USING (auth.uid() = user_id);
