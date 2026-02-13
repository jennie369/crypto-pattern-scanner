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

-- 2. Post interactions table (CRITICAL - tracks everything)
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'like', 'comment', 'share', 'save', 'view'
  dwell_time INTEGER, -- Seconds spent on post (for views)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate interactions
  UNIQUE(user_id, post_id, interaction_type)
);

-- 3. User feed preferences
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_categories UUID[], -- Array of category IDs
  following_users UUID[], -- Array of user IDs being followed
  hidden_users UUID[], -- Users to not show in feed
  feed_algorithm TEXT DEFAULT 'hybrid', -- 'following', 'discovery', 'hybrid'
  discovery_weight FLOAT DEFAULT 0.4, -- 0-1, how much discovery vs following
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Feed impressions tracking (what user saw)
CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  position INTEGER, -- Position in feed when shown (1, 2, 3...)
  session_id TEXT, -- Group impressions by session
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  interacted BOOLEAN DEFAULT FALSE,
  interaction_type TEXT -- What did user do? (like, comment, skip, etc.)
);

-- 5. Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL, -- 'affiliate', 'tier_upgrade', 'course_promo'
  ad_content JSONB, -- Ad details (title, link, image, etc.)
  position INTEGER, -- Position in feed
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  click_at TIMESTAMPTZ,
  convert_at TIMESTAMPTZ
);

-- 6. User hashtag affinity (learn from engagement)
CREATE TABLE IF NOT EXISTS user_hashtag_affinity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  engagement_count INTEGER DEFAULT 1,
  last_engaged_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, hashtag)
);

-- 7. User content dislikes (negative signals)
CREATE TABLE IF NOT EXISTS user_content_dislikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  dislike_count INTEGER DEFAULT 1,
  last_disliked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, category_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Post interactions
CREATE INDEX IF NOT EXISTS idx_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON post_interactions(created_at DESC);

-- Forum posts
CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_engagement ON forum_posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON forum_posts USING GIN(hashtags);

-- Feed impressions
CREATE INDEX IF NOT EXISTS idx_impressions_user_session ON feed_impressions(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_impressions_post ON feed_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_impressions_shown ON feed_impressions(shown_at DESC);

-- Ad impressions
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_session ON ad_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_shown ON ad_impressions(shown_at DESC);

-- User preferences
CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON user_feed_preferences(user_id);

-- Hashtag affinity
CREATE INDEX IF NOT EXISTS idx_hashtag_affinity_user ON user_hashtag_affinity(user_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_affinity_tag ON user_hashtag_affinity(hashtag);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hashtag_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_dislikes ENABLE ROW LEVEL SECURITY;

-- Post interactions: Users can only see/create their own
DROP POLICY IF EXISTS "Users can view own interactions" ON post_interactions;
CREATE POLICY "Users can view own interactions" ON post_interactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own interactions" ON post_interactions;
CREATE POLICY "Users can create own interactions" ON post_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interactions" ON post_interactions;
CREATE POLICY "Users can delete own interactions" ON post_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Feed preferences: Users can only access their own
DROP POLICY IF EXISTS "Users can view own preferences" ON user_feed_preferences;
CREATE POLICY "Users can view own preferences" ON user_feed_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_feed_preferences;
CREATE POLICY "Users can update own preferences" ON user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Feed impressions: Users can only see their own
DROP POLICY IF EXISTS "Users can view own impressions" ON feed_impressions;
CREATE POLICY "Users can view own impressions" ON feed_impressions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own impressions" ON feed_impressions;
CREATE POLICY "Users can create own impressions" ON feed_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ad impressions: Users can see their own, admins can see all
DROP POLICY IF EXISTS "Users can view own ad impressions" ON ad_impressions;
CREATE POLICY "Users can view own ad impressions" ON ad_impressions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create ad impressions" ON ad_impressions;
CREATE POLICY "Users can create ad impressions" ON ad_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ad impressions" ON ad_impressions;
CREATE POLICY "Users can update own ad impressions" ON ad_impressions
  FOR UPDATE USING (auth.uid() = user_id);

-- Hashtag affinity policies
DROP POLICY IF EXISTS "Users can view own hashtag affinity" ON user_hashtag_affinity;
CREATE POLICY "Users can view own hashtag affinity" ON user_hashtag_affinity
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own hashtag affinity" ON user_hashtag_affinity;
CREATE POLICY "Users can manage own hashtag affinity" ON user_hashtag_affinity
  FOR ALL USING (auth.uid() = user_id);

-- Content dislikes policies
DROP POLICY IF EXISTS "Users can view own dislikes" ON user_content_dislikes;
CREATE POLICY "Users can view own dislikes" ON user_content_dislikes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own dislikes" ON user_content_dislikes;
CREATE POLICY "Users can manage own dislikes" ON user_content_dislikes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate engagement score for a post
CREATE OR REPLACE FUNCTION calculate_engagement_score(post_uuid UUID)
RETURNS FLOAT AS $$
DECLARE
  post_data RECORD;
  engagement_points FLOAT;
  time_decay FLOAT;
  final_score FLOAT;
BEGIN
  -- Get post metrics
  SELECT
    like_count,
    comment_count,
    share_count,
    save_count,
    view_count,
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as hours_old
  INTO post_data
  FROM forum_posts
  WHERE id = post_uuid;

  -- Calculate weighted engagement
  engagement_points :=
    COALESCE(post_data.like_count, 0) * 1 +
    COALESCE(post_data.comment_count, 0) * 3 +
    COALESCE(post_data.share_count, 0) * 5 +
    COALESCE(post_data.save_count, 0) * 4;

  -- Apply time decay (exponential)
  time_decay := EXP(-0.05 * COALESCE(post_data.hours_old, 0));

  -- Calculate final score
  final_score := (engagement_points / GREATEST(COALESCE(post_data.view_count, 1), 1)) * time_decay * 1000;

  RETURN COALESCE(final_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Update post engagement score (call after interactions)
CREATE OR REPLACE FUNCTION update_post_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET engagement_score = calculate_engagement_score(NEW.post_id)
  WHERE id = NEW.post_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update engagement score
DROP TRIGGER IF EXISTS trigger_update_engagement_score ON post_interactions;
CREATE TRIGGER trigger_update_engagement_score
  AFTER INSERT OR UPDATE ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_score();

-- Increment post count helper function
CREATE OR REPLACE FUNCTION increment_post_count(post_uuid UUID, count_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE forum_posts SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', count_field, count_field)
  USING post_uuid;
END;
$$ LANGUAGE plpgsql;

-- Increment hashtag affinity
CREATE OR REPLACE FUNCTION increment_hashtag_affinity(p_user_id UUID, p_hashtag TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_hashtag_affinity
  SET engagement_count = engagement_count + 1,
      last_engaged_at = NOW()
  WHERE user_id = p_user_id AND hashtag = p_hashtag;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default feed preferences for existing users
INSERT INTO user_feed_preferences (user_id, feed_algorithm, discovery_weight)
SELECT id, 'hybrid', 0.4
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_feed_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ANALYTICS VIEWS (Optional but helpful)
-- ============================================

-- Top performing posts
CREATE OR REPLACE VIEW top_performing_posts AS
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
CREATE OR REPLACE VIEW user_engagement_summary AS
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
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  DATE(shown_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM feed_impressions
GROUP BY DATE(shown_at)
ORDER BY date DESC;

-- Ad performance summary
CREATE OR REPLACE VIEW ad_performance_summary AS
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
