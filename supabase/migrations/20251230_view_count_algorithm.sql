-- =============================================
-- PHASE 4: VIEW COUNT & ALGORITHM SYSTEM
-- Migration: 20251230_view_count_algorithm
-- Date: 2024-12-30
-- =============================================

-- 1. Post Views Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_duration_seconds INTEGER DEFAULT 0
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS view_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(64);
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE post_views ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Drop old constraint if it exists and recreate
ALTER TABLE post_views DROP CONSTRAINT IF EXISTS valid_viewer;

-- 2. Indexes for post_views
CREATE INDEX IF NOT EXISTS idx_post_views_post_id
  ON post_views(post_id);

CREATE INDEX IF NOT EXISTS idx_post_views_user_post
  ON post_views(user_id, post_id)
  WHERE user_id IS NOT NULL;

-- Only create ip_address index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_views' AND column_name = 'ip_address'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_post_views_ip_post
      ON post_views(ip_address, post_id)
      WHERE ip_address IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_views_time
  ON post_views(viewed_at DESC);

-- Only create device_fingerprint index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_views' AND column_name = 'device_fingerprint'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_post_views_fingerprint
      ON post_views(device_fingerprint, post_id)
      WHERE device_fingerprint IS NOT NULL;
  END IF;
END $$;

-- 3. Add score columns to forum_posts
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS unique_viewers INTEGER DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS hot_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(10, 4) DEFAULT 0;

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS last_engagement_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS scores_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Create indexes for sorting (use status column instead of is_deleted)
CREATE INDEX IF NOT EXISTS idx_forum_posts_hot_score
  ON forum_posts(hot_score DESC)
  WHERE status != 'deleted' OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_posts_trending_score
  ON forum_posts(trending_score DESC)
  WHERE status != 'deleted' OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_forum_posts_views_count
  ON forum_posts(views_count DESC)
  WHERE status != 'deleted' OR status IS NULL;

-- 5. Function to record view (with deduplication via upsert approach)
CREATE OR REPLACE FUNCTION record_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_device_fingerprint VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN := FALSE;
  v_recent_view_exists BOOLEAN;
  v_time_bucket TIMESTAMPTZ;
BEGIN
  -- Calculate 5-minute time bucket
  v_time_bucket := date_trunc('hour', NOW()) +
    INTERVAL '5 min' * FLOOR(EXTRACT(MINUTE FROM NOW()) / 5);

  -- Check if user/device already viewed in this 5-min window
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND user_id = p_user_id
        AND viewed_at >= v_time_bucket
    ) INTO v_recent_view_exists;
  ELSIF p_device_fingerprint IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND device_fingerprint = p_device_fingerprint
        AND viewed_at >= v_time_bucket
    ) INTO v_recent_view_exists;
  ELSE
    -- No user_id or fingerprint, skip dedup
    v_recent_view_exists := FALSE;
  END IF;

  -- Only insert if no recent view
  IF NOT v_recent_view_exists THEN
    INSERT INTO post_views (
      post_id,
      user_id,
      ip_address,
      device_fingerprint,
      user_agent,
      referrer
    ) VALUES (
      p_post_id,
      p_user_id,
      p_ip_address,
      p_device_fingerprint,
      p_user_agent,
      p_referrer
    );

    v_result := TRUE;

    -- Update post views count
    UPDATE forum_posts
    SET
      views_count = COALESCE(views_count, 0) + 1,
      last_engagement_at = NOW()
    WHERE id = p_post_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to calculate unique viewers
CREATE OR REPLACE FUNCTION calculate_unique_viewers(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, device_fingerprint, ip_address::TEXT))
  INTO v_count
  FROM post_views
  WHERE post_id = p_post_id;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 7. Function to calculate hot score
-- Formula: (engagement_score * decay_factor) + quality_bonus
-- Decay: Half-life of 24 hours
CREATE OR REPLACE FUNCTION calculate_hot_score(p_post_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_post RECORD;
  v_age_hours DECIMAL;
  v_decay_factor DECIMAL;
  v_engagement_score DECIMAL;
  v_quality_bonus DECIMAL;
  v_hot_score DECIMAL;
  v_reaction_counts JSONB;
  v_total_reactions INTEGER;
BEGIN
  -- Get post data
  SELECT
    p.*,
    EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 AS age_hours
  INTO v_post
  FROM forum_posts p
  WHERE p.id = p_post_id;

  IF v_post IS NULL THEN
    RETURN 0;
  END IF;

  v_age_hours := GREATEST(v_post.age_hours, 0.1);

  -- Calculate decay (half-life = 24 hours)
  -- decay = 2 ^ (-age / half_life)
  v_decay_factor := POWER(2, -v_age_hours / 24);

  -- Get reaction counts
  v_reaction_counts := COALESCE(v_post.reaction_counts, '{"total": 0}'::JSONB);
  v_total_reactions := COALESCE((v_reaction_counts->>'total')::INTEGER, 0);

  -- Calculate engagement score
  -- Weights: reaction=1, comment=2, share=3, view=0.01
  v_engagement_score := (
    v_total_reactions * 1.0 +
    COALESCE(v_post.comments_count, 0) * 2.0 +
    COALESCE(v_post.shares_count, 0) * 3.0 +
    COALESCE(v_post.views_count, 0) * 0.01
  );

  -- Quality bonus (based on content completeness)
  v_quality_bonus := 0;
  IF v_post.content IS NOT NULL AND LENGTH(v_post.content) > 100 THEN
    v_quality_bonus := v_quality_bonus + 1;
  END IF;
  IF v_post.media_urls IS NOT NULL AND jsonb_array_length(v_post.media_urls) > 0 THEN
    v_quality_bonus := v_quality_bonus + 2;
  END IF;
  IF v_post.image_url IS NOT NULL THEN
    v_quality_bonus := v_quality_bonus + 1;
  END IF;

  -- Calculate final score
  v_hot_score := (v_engagement_score * v_decay_factor) + v_quality_bonus;

  RETURN ROUND(v_hot_score, 4);
END;
$$ LANGUAGE plpgsql;

-- 8. Function to calculate trending score
-- Based on velocity of engagement in last 6 hours
CREATE OR REPLACE FUNCTION calculate_trending_score(p_post_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_recent_views INTEGER;
  v_recent_reactions INTEGER;
  v_recent_comments INTEGER;
  v_total_recent INTEGER;
  v_age_hours DECIMAL;
  v_velocity DECIMAL;
  v_trending_score DECIMAL;
BEGIN
  -- Get age
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
  INTO v_age_hours
  FROM forum_posts
  WHERE id = p_post_id;

  IF v_age_hours IS NULL THEN
    RETURN 0;
  END IF;

  -- Count recent engagement (last 6 hours)
  SELECT COUNT(*)
  INTO v_recent_views
  FROM post_views
  WHERE post_id = p_post_id
    AND viewed_at > NOW() - INTERVAL '6 hours';

  SELECT COUNT(*)
  INTO v_recent_reactions
  FROM post_reactions
  WHERE post_id = p_post_id
    AND created_at > NOW() - INTERVAL '6 hours';

  SELECT COUNT(*)
  INTO v_recent_comments
  FROM forum_comments
  WHERE post_id = p_post_id
    AND created_at > NOW() - INTERVAL '6 hours';

  -- Total recent engagement
  v_total_recent := (
    COALESCE(v_recent_views, 0) * 1 +
    COALESCE(v_recent_reactions, 0) * 3 +
    COALESCE(v_recent_comments, 0) * 5
  );

  -- Calculate velocity (engagement per hour)
  -- Higher velocity = more trending
  v_velocity := v_total_recent / GREATEST(LEAST(v_age_hours, 6), 0.1);

  -- Apply freshness boost for very new posts
  IF v_age_hours < 2 THEN
    v_velocity := v_velocity * 1.5;
  ELSIF v_age_hours < 6 THEN
    v_velocity := v_velocity * 1.2;
  END IF;

  v_trending_score := v_velocity;

  RETURN ROUND(v_trending_score, 4);
END;
$$ LANGUAGE plpgsql;

-- 9. Function to update all scores for a post
CREATE OR REPLACE FUNCTION update_post_scores(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_posts
  SET
    unique_viewers = calculate_unique_viewers(p_post_id),
    hot_score = calculate_hot_score(p_post_id),
    trending_score = calculate_trending_score(p_post_id),
    scores_updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger to update scores on new view
CREATE OR REPLACE FUNCTION trigger_view_update_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue score update (runs on each insert)
  PERFORM update_post_scores(NEW.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_view_update_scores ON post_views;
CREATE TRIGGER trigger_view_update_scores
  AFTER INSERT ON post_views
  FOR EACH ROW
  EXECUTE FUNCTION trigger_view_update_scores();

-- 11. Trigger to update scores on reaction changes
CREATE OR REPLACE FUNCTION trigger_reaction_update_post_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_post_scores(COALESCE(NEW.post_id, OLD.post_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reaction_update_post_scores ON post_reactions;
CREATE TRIGGER trigger_reaction_update_post_scores
  AFTER INSERT OR DELETE ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_reaction_update_post_scores();

-- 12. Trigger to update scores on comment changes
CREATE OR REPLACE FUNCTION trigger_comment_update_post_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_post_scores(COALESCE(NEW.post_id, OLD.post_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comment_update_post_scores ON forum_comments;
CREATE TRIGGER trigger_comment_update_post_scores
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_comment_update_post_scores();

-- 13. Function to batch refresh scores for recent posts
CREATE OR REPLACE FUNCTION refresh_recent_post_scores()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_post RECORD;
BEGIN
  FOR v_post IN
    SELECT id FROM forum_posts
    WHERE (status != 'deleted' OR status IS NULL)
      AND created_at > NOW() - INTERVAL '7 days'
  LOOP
    PERFORM update_post_scores(v_post.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. RLS Policies
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (tracked by user_id or fingerprint)
DROP POLICY IF EXISTS "Anyone can record views" ON post_views;
CREATE POLICY "Anyone can record views" ON post_views
  FOR INSERT WITH CHECK (TRUE);

-- Users can see own view history
DROP POLICY IF EXISTS "Users can view own history" ON post_views;
CREATE POLICY "Users can view own history" ON post_views
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Admins can view all
DROP POLICY IF EXISTS "Admins can view all" ON post_views;
CREATE POLICY "Admins can view all" ON post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'gem_master')
    )
  );

-- 15. Comments
COMMENT ON TABLE post_views IS 'Tracks individual post views for analytics';
COMMENT ON COLUMN forum_posts.views_count IS 'Total number of views';
COMMENT ON COLUMN forum_posts.unique_viewers IS 'Number of unique viewers';
COMMENT ON COLUMN forum_posts.hot_score IS 'Hot ranking score (engagement * decay)';
COMMENT ON COLUMN forum_posts.trending_score IS 'Trending score (recent velocity)';
COMMENT ON COLUMN forum_posts.quality_score IS 'Content quality score';

-- 16. Initialize scores for existing posts
-- Only run once during migration
DO $$
DECLARE
  v_post RECORD;
BEGIN
  -- Update scores for recent posts (last 30 days)
  FOR v_post IN
    SELECT id FROM forum_posts
    WHERE (status != 'deleted' OR status IS NULL)
      AND created_at > NOW() - INTERVAL '30 days'
    LIMIT 1000
  LOOP
    PERFORM update_post_scores(v_post.id);
  END LOOP;
END $$;
