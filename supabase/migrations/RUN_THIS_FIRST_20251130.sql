-- ============================================
-- CONSOLIDATED MIGRATION - Run this in Supabase SQL Editor
-- Date: 2024-11-30
-- Purpose: Fix all missing tables, columns, and policies
-- ============================================

-- ============================================
-- PART 1: DROP EXISTING POLICIES (Avoid duplicates)
-- ============================================

-- post_interactions policies
DROP POLICY IF EXISTS "Users can view own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can create own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON post_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON post_interactions;

-- gift_catalog policies
DROP POLICY IF EXISTS "Anyone can view active gifts" ON gift_catalog;
DROP POLICY IF EXISTS "Admins can manage gift catalog" ON gift_catalog;

-- user_feed_preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_feed_preferences;

-- user_hashtag_affinity policies
DROP POLICY IF EXISTS "Users can manage own hashtag affinity" ON user_hashtag_affinity;

-- user_content_dislikes policies
DROP POLICY IF EXISTS "Users can manage own dislikes" ON user_content_dislikes;

-- feed_impressions policies
DROP POLICY IF EXISTS "Users can manage own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Admins can view all impressions" ON feed_impressions;

-- ad_impressions policies
DROP POLICY IF EXISTS "Users can manage own ad impressions" ON ad_impressions;
DROP POLICY IF EXISTS "Admins can view all ad impressions" ON ad_impressions;

-- reposts policies
DROP POLICY IF EXISTS "Anyone can view reposts" ON reposts;
DROP POLICY IF EXISTS "Users can create own reposts" ON reposts;
DROP POLICY IF EXISTS "Users can delete own reposts" ON reposts;

-- ============================================
-- PART 2: GIFT CATALOG TABLE
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

ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gifts" ON gift_catalog
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage gift catalog" ON gift_catalog
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 3: POST INTERACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share', 'comment')),
  dwell_time INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_post_interaction UNIQUE (user_id, post_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_post_interactions_created ON post_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_type ON post_interactions(user_id, interaction_type);

ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON post_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions" ON post_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON post_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON post_interactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" ON post_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 4: HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_post_count(post_uuid UUID, count_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE forum_posts SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', count_field, count_field)
  USING post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_post_count TO authenticated;

-- ============================================
-- PART 5: FORUM_POSTS ENGAGEMENT COLUMNS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'view_count') THEN
    ALTER TABLE forum_posts ADD COLUMN view_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'like_count') THEN
    ALTER TABLE forum_posts ADD COLUMN like_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'save_count') THEN
    ALTER TABLE forum_posts ADD COLUMN save_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'share_count') THEN
    ALTER TABLE forum_posts ADD COLUMN share_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'comment_count') THEN
    ALTER TABLE forum_posts ADD COLUMN comment_count INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'repost_count') THEN
    ALTER TABLE forum_posts ADD COLUMN repost_count INT DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- PART 6: USER FEED PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories UUID[] DEFAULT '{}',
  discovery_weight DECIMAL(3,2) DEFAULT 0.4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 7: USER HASHTAG AFFINITY
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

ALTER TABLE user_hashtag_affinity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hashtag affinity" ON user_hashtag_affinity
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 8: USER CONTENT DISLIKES
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

ALTER TABLE user_content_dislikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dislikes" ON user_content_dislikes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 9: FEED IMPRESSIONS
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

ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own impressions" ON feed_impressions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all impressions" ON feed_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 10: AD IMPRESSIONS
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

ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ad impressions" ON ad_impressions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ad impressions" ON ad_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- PART 11: REPOSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reposter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_repost UNIQUE(original_post_id, reposter_id)
);

CREATE INDEX IF NOT EXISTS idx_reposts_original ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(reposter_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created ON reposts(created_at DESC);

ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts" ON reposts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reposts" ON reposts
  FOR INSERT WITH CHECK (auth.uid() = reposter_id);

CREATE POLICY "Users can delete own reposts" ON reposts
  FOR DELETE USING (auth.uid() = reposter_id);

-- ============================================
-- PART 12: REPOST RPC FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_repost_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_repost_count TO authenticated;

-- ============================================
-- DONE! All tables and policies created.
-- ============================================
