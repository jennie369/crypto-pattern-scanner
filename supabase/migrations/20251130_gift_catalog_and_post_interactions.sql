-- ============================================
-- Migration: Gift Catalog & Post Interactions
-- Date: 2024-11-30
-- Purpose: Create gift_catalog and post_interactions tables
-- ============================================

-- ============================================
-- 1. GIFT CATALOG TABLE (Feature #15)
-- ============================================

CREATE TABLE IF NOT EXISTS gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  animation_url TEXT,
  gem_cost INT NOT NULL,
  category TEXT CHECK (category IN ('standard', 'premium', 'luxury', 'animated', 'limited')),
  is_animated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_gift_catalog_category ON gift_catalog(category);
CREATE INDEX IF NOT EXISTS idx_gift_catalog_active ON gift_catalog(is_active) WHERE is_active = TRUE;

-- Initial gifts catalog data
INSERT INTO gift_catalog (name, description, image_url, gem_cost, category, is_animated, display_order) VALUES
  ('Heart', 'Show some love', '/gifts/heart.png', 10, 'standard', FALSE, 1),
  ('Star', 'You are a star!', '/gifts/star.png', 25, 'standard', FALSE, 2),
  ('Rose', 'A beautiful rose', '/gifts/rose.png', 50, 'standard', FALSE, 3),
  ('Diamond', 'Premium gift', '/gifts/diamond.png', 100, 'premium', TRUE, 4),
  ('Crown', 'Royal treatment', '/gifts/crown.png', 500, 'luxury', TRUE, 5),
  ('Fireworks', 'Celebration!', '/gifts/fireworks.png', 1000, 'animated', TRUE, 6)
ON CONFLICT DO NOTHING;

-- RLS Policies for gift_catalog
ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;

-- Anyone can view active gifts
CREATE POLICY "Anyone can view active gifts" ON gift_catalog
  FOR SELECT USING (is_active = TRUE);

-- Only admins can manage gift catalog
CREATE POLICY "Admins can manage gift catalog" ON gift_catalog
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 2. POST INTERACTIONS TABLE (Engagement Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share', 'comment')),
  dwell_time INT, -- Time spent viewing in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for upsert operations
  CONSTRAINT unique_user_post_interaction UNIQUE (user_id, post_id, interaction_type)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_post_interactions_created ON post_interactions(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_type ON post_interactions(user_id, interaction_type);

-- RLS Policies for post_interactions
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions" ON post_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own interactions
CREATE POLICY "Users can create own interactions" ON post_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own interactions (for upsert)
CREATE POLICY "Users can update own interactions" ON post_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own interactions (unlike, unsave)
CREATE POLICY "Users can delete own interactions" ON post_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all interactions for analytics
CREATE POLICY "Admins can view all interactions" ON post_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. HELPER FUNCTION: Increment post count
-- ============================================

CREATE OR REPLACE FUNCTION increment_post_count(post_uuid UUID, count_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE forum_posts SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', count_field, count_field)
  USING post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_count TO authenticated;

-- ============================================
-- 4. ENSURE forum_posts has engagement count columns
-- ============================================

DO $$
BEGIN
  -- Add view_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'view_count') THEN
    ALTER TABLE forum_posts ADD COLUMN view_count INT DEFAULT 0;
  END IF;

  -- Add like_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'like_count') THEN
    ALTER TABLE forum_posts ADD COLUMN like_count INT DEFAULT 0;
  END IF;

  -- Add save_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'save_count') THEN
    ALTER TABLE forum_posts ADD COLUMN save_count INT DEFAULT 0;
  END IF;

  -- Add share_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'share_count') THEN
    ALTER TABLE forum_posts ADD COLUMN share_count INT DEFAULT 0;
  END IF;

  -- Add comment_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'comment_count') THEN
    ALTER TABLE forum_posts ADD COLUMN comment_count INT DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 5. USER FEED PREFERENCES (for learning user behavior)
-- ============================================

CREATE TABLE IF NOT EXISTS user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories UUID[] DEFAULT '{}',
  discovery_weight DECIMAL(3,2) DEFAULT 0.4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_feed_preferences
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. USER HASHTAG AFFINITY (for content recommendation)
-- ============================================

CREATE TABLE IF NOT EXISTS user_hashtag_affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  engagement_count INT DEFAULT 1,
  last_engaged_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_hashtag UNIQUE (user_id, hashtag)
);

CREATE INDEX IF NOT EXISTS idx_user_hashtag_affinity_user ON user_hashtag_affinity(user_id);

-- RLS for user_hashtag_affinity
ALTER TABLE user_hashtag_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hashtag affinity" ON user_hashtag_affinity
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. USER CONTENT DISLIKES (negative signals)
-- ============================================

CREATE TABLE IF NOT EXISTS user_content_dislikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  dislike_count INT DEFAULT 1,
  last_disliked_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_category_dislike UNIQUE (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_user_content_dislikes_user ON user_content_dislikes(user_id);

-- RLS for user_content_dislikes
ALTER TABLE user_content_dislikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dislikes" ON user_content_dislikes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. FEED IMPRESSIONS (track what was shown)
-- ============================================

CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  position INT NOT NULL,
  source TEXT CHECK (source IN ('following', 'discovery', 'serendipity', 'ad')),
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  interacted BOOLEAN DEFAULT FALSE,
  interaction_type TEXT,

  CONSTRAINT unique_feed_impression UNIQUE (user_id, post_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_impressions_user ON feed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_session ON feed_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_shown ON feed_impressions(shown_at DESC);

-- RLS for feed_impressions
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own impressions" ON feed_impressions
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view for analytics
CREATE POLICY "Admins can view all impressions" ON feed_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 9. AD IMPRESSIONS (track ad performance)
-- ============================================

CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('affiliate_product', 'subscription_upsell', 'feature_promo')),
  session_id UUID NOT NULL,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  click_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT FALSE,
  convert_at TIMESTAMPTZ,

  CONSTRAINT unique_ad_impression UNIQUE (user_id, ad_type, session_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_user ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_type ON ad_impressions(ad_type);

-- RLS for ad_impressions
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ad impressions" ON ad_impressions
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view for analytics
CREATE POLICY "Admins can view all ad impressions" ON ad_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- COMPLETED
-- ============================================
