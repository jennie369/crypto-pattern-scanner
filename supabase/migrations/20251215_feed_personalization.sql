-- ============================================================
-- FEED PERSONALIZATION SYSTEM
-- Migration: 20251215_feed_personalization.sql
-- Purpose: Content categorization and personalized feed algorithm
-- ============================================================

-- 1. Add content_category column to forum_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'content_category'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN content_category VARCHAR(50) DEFAULT 'general';
  END IF;
END $$;

-- 2. Create index for content_category
CREATE INDEX IF NOT EXISTS idx_posts_content_category ON forum_posts(content_category);

-- 3. Add user track preference to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_track'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_track VARCHAR(50) DEFAULT 'mastery';
    -- Options: 'wealth', 'wellness', 'mastery'
  END IF;
END $$;

-- 4. Content categories enum (for reference)
-- 'trading' - Technical analysis, market updates, trading tips
-- 'wellness' - Tarot, IChing, crystals, meditation, affirmations
-- 'integration' - Success stories, lifestyle, mindset
-- 'general' - Everything else

-- 5. Function to auto-categorize posts based on content/hashtags
CREATE OR REPLACE FUNCTION auto_categorize_post()
RETURNS TRIGGER AS $$
DECLARE
  v_content TEXT;
  v_hashtags TEXT[];
BEGIN
  -- Combine title and content for analysis
  v_content := LOWER(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  v_hashtags := NEW.hashtags;

  -- Check for trading keywords
  IF v_content ~ '(bitcoin|btc|eth|trading|chart|pattern|candle|support|resistance|breakout|technical|scanner|crypto|altcoin|pump|dump|bull|bear|long|short|leverage)' OR
     v_hashtags && ARRAY['trading', 'crypto', 'bitcoin', 'analysis', 'chart', 'pattern'] THEN
    NEW.content_category := 'trading';
    RETURN NEW;
  END IF;

  -- Check for wellness keywords
  IF v_content ~ '(tarot|iching|kinh dịch|crystal|đá|thiền|meditation|affirmation|năng lượng|tâm linh|chiêm tinh|horoscope|cung|zodiac|chakra|healing)' OR
     v_hashtags && ARRAY['tarot', 'iching', 'crystal', 'meditation', 'wellness', 'spiritual'] THEN
    NEW.content_category := 'wellness';
    RETURN NEW;
  END IF;

  -- Check for integration keywords
  IF v_content ~ '(thành công|success|lifestyle|mindset|tư duy|mục tiêu|goal|vision|manifest|law of attraction|abundance|grateful|gratitude)' OR
     v_hashtags && ARRAY['success', 'mindset', 'lifestyle', 'goals', 'motivation'] THEN
    NEW.content_category := 'integration';
    RETURN NEW;
  END IF;

  -- Default to general
  NEW.content_category := 'general';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger for auto-categorization on insert
DROP TRIGGER IF EXISTS trigger_auto_categorize_post ON forum_posts;
CREATE TRIGGER trigger_auto_categorize_post
  BEFORE INSERT ON forum_posts
  FOR EACH ROW
  WHEN (NEW.content_category IS NULL OR NEW.content_category = 'general')
  EXECUTE FUNCTION auto_categorize_post();

-- 7. Function to get personalized feed
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  content_category VARCHAR,
  hashtags TEXT[],
  like_count INT,
  comment_count INT,
  share_count INT,
  view_count INT,
  created_at TIMESTAMPTZ,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  author_tier VARCHAR,
  is_liked BOOLEAN,
  is_saved BOOLEAN,
  relevance_score NUMERIC
) AS $$
DECLARE
  v_user_track VARCHAR;
  v_trading_weight NUMERIC;
  v_wellness_weight NUMERIC;
BEGIN
  -- Get user's preferred track
  SELECT preferred_track INTO v_user_track
  FROM profiles WHERE id = p_user_id;

  v_user_track := COALESCE(v_user_track, 'mastery');

  -- Set weights based on track
  CASE v_user_track
    WHEN 'wealth' THEN
      v_trading_weight := 0.8;
      v_wellness_weight := 0.2;
    WHEN 'wellness' THEN
      v_trading_weight := 0.2;
      v_wellness_weight := 0.8;
    ELSE -- mastery
      v_trading_weight := 0.5;
      v_wellness_weight := 0.5;
  END CASE;

  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.content,
    p.image_url,
    p.video_url,
    p.content_category,
    p.hashtags,
    COALESCE(p.like_count, 0)::INT,
    COALESCE(p.comment_count, 0)::INT,
    COALESCE(p.share_count, 0)::INT,
    COALESCE(p.view_count, 0)::INT,
    p.created_at,
    prof.id AS author_id,
    prof.full_name AS author_name,
    prof.avatar_url AS author_avatar,
    prof.scanner_tier AS author_tier,
    EXISTS (SELECT 1 FROM forum_likes WHERE post_id = p.id AND user_id = p_user_id) AS is_liked,
    EXISTS (SELECT 1 FROM forum_saved WHERE post_id = p.id AND user_id = p_user_id) AS is_saved,
    -- Calculate relevance score
    (
      CASE p.content_category
        WHEN 'trading' THEN v_trading_weight * 100
        WHEN 'wellness' THEN v_wellness_weight * 100
        WHEN 'integration' THEN 50
        ELSE 30
      END
      +
      -- Recency bonus (posts from last 24h get +20)
      CASE WHEN p.created_at > NOW() - INTERVAL '24 hours' THEN 20 ELSE 0 END
      +
      -- Engagement bonus
      LEAST(COALESCE(p.like_count, 0) + COALESCE(p.comment_count, 0) * 2, 30)
    )::NUMERIC AS relevance_score
  FROM forum_posts p
  JOIN profiles prof ON p.user_id = prof.id
  WHERE p.status = 'published'
    AND (p_category IS NULL OR p.content_category = p_category)
  ORDER BY
    relevance_score DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to update user track preference
CREATE OR REPLACE FUNCTION update_user_track(
  p_user_id UUID,
  p_track VARCHAR
)
RETURNS JSONB AS $$
BEGIN
  IF p_track NOT IN ('wealth', 'wellness', 'mastery') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Track không hợp lệ');
  END IF;

  UPDATE profiles
  SET preferred_track = p_track
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'track', p_track);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to get category stats
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
  category VARCHAR,
  post_count BIGINT,
  recent_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.content_category AS category,
    COUNT(*)::BIGINT AS post_count,
    COUNT(*) FILTER (WHERE p.created_at > NOW() - INTERVAL '24 hours')::BIGINT AS recent_count
  FROM forum_posts p
  WHERE p.status = 'published'
  GROUP BY p.content_category
  ORDER BY post_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Update existing posts to have categories
-- This will trigger the auto_categorize_post function
UPDATE forum_posts
SET content_category = 'general'
WHERE content_category IS NULL;
