-- ===========================
-- Migration: Update post_boosts for gem-based boost system
-- Date: 2025-12-17
-- Description: Add columns to support gem-based boost packages
-- ===========================

-- Add new columns for gem-based boost system
ALTER TABLE post_boosts
ADD COLUMN IF NOT EXISTS package_type TEXT,
ADD COLUMN IF NOT EXISTS gems_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reach_multiplier INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add index for expires_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_boosts_expires ON post_boosts(expires_at);

-- Update forum_posts to track boost status
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;

-- Create index for boosted posts
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON forum_posts(is_boosted) WHERE is_boosted = TRUE;

-- RPC function to increment boost impressions
CREATE OR REPLACE FUNCTION increment_boost_impressions(p_boost_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE post_boosts
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = p_boost_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to increment boost clicks
CREATE OR REPLACE FUNCTION increment_boost_clicks(p_boost_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE post_boosts
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = p_boost_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire boosts
CREATE OR REPLACE FUNCTION expire_boosts()
RETURNS VOID AS $$
BEGIN
  -- Mark expired boosts
  UPDATE post_boosts
  SET status = 'completed'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  -- Update forum_posts for expired boosts
  UPDATE forum_posts
  SET is_boosted = FALSE, boost_expires_at = NULL
  WHERE is_boosted = TRUE
    AND boost_expires_at IS NOT NULL
    AND boost_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_boost_impressions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_boost_clicks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_boosts() TO authenticated;

COMMENT ON COLUMN post_boosts.package_type IS 'Boost package: basic, standard, premium, ultra';
COMMENT ON COLUMN post_boosts.gems_spent IS 'Number of gems spent on this boost';
COMMENT ON COLUMN post_boosts.reach_multiplier IS 'Reach multiplier for this boost package';
COMMENT ON COLUMN post_boosts.expires_at IS 'When this boost expires';
COMMENT ON COLUMN forum_posts.is_boosted IS 'Whether this post is currently being boosted';
COMMENT ON COLUMN forum_posts.boost_expires_at IS 'When the current boost expires';
