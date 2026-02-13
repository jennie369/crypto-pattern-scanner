-- =====================================================
-- GEM Master - RPC Functions for 12 Major Features
-- Additional helper functions
-- =====================================================

-- Sound play count increment
CREATE OR REPLACE FUNCTION increment_sound_play_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sound use count increment (for trending algorithm)
CREATE OR REPLACE FUNCTION increment_sound_use_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET
    use_count = COALESCE(use_count, 0) + 1,
    trending_score = COALESCE(trending_score, 0) + 10 -- Boost trending score
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Boost impressions increment
CREATE OR REPLACE FUNCTION increment_boost_impressions(p_boost_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_boosts
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = p_boost_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Boost clicks increment
CREATE OR REPLACE FUNCTION increment_boost_clicks(p_boost_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_boosts
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = p_boost_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Repost count increment
CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Repost count decrement
CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment count decrement
CREATE OR REPLACE FUNCTION decrement_comment_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Saved sounds table
CREATE TABLE IF NOT EXISTS saved_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sound_id UUID REFERENCES sound_library(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sound_id)
);

-- RLS for saved_sounds
ALTER TABLE saved_sounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved sounds" ON saved_sounds;
CREATE POLICY "Users can view own saved sounds"
ON saved_sounds FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save sounds" ON saved_sounds;
CREATE POLICY "Users can save sounds"
ON saved_sounds FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave sounds" ON saved_sounds;
CREATE POLICY "Users can unsave sounds"
ON saved_sounds FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- User settings table (for default visibility etc)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_post_visibility TEXT DEFAULT 'public',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add visibility column to forum_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN visibility TEXT DEFAULT 'public';
  END IF;
END $$;

-- Add sound_id column to forum_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'sound_id'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN sound_id UUID REFERENCES sound_library(id);
  END IF;
END $$;

-- Add repost_count column to forum_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'repost_count'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN repost_count INT DEFAULT 0;
  END IF;
END $$;

-- Add is_boosted column to forum_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'is_boosted'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE;
    ALTER TABLE forum_posts ADD COLUMN boost_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add trending_score to sound_library if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sound_library' AND column_name = 'trending_score'
  ) THEN
    ALTER TABLE sound_library ADD COLUMN trending_score INT DEFAULT 0;
  END IF;
END $$;

-- Add is_pinned columns to forum_comments if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_comments' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE forum_comments ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    ALTER TABLE forum_comments ADD COLUMN pinned_at TIMESTAMPTZ;
    ALTER TABLE forum_comments ADD COLUMN pinned_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sound_library_trending ON sound_library(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_sound_library_use_count ON sound_library(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_post_boosts_active ON post_boosts(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_boosted ON forum_posts(is_boosted, boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_close_friends_user ON close_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_shopping_tags_post ON shopping_tags(post_id);

-- Update trending scores periodically (decay function)
-- This should be called by a scheduled job
CREATE OR REPLACE FUNCTION decay_trending_scores()
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET trending_score = GREATEST(trending_score * 0.95, 0)
  WHERE trending_score > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
