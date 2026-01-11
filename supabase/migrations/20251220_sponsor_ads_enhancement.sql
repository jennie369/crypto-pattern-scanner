-- =====================================================
-- SPONSOR ADS ENHANCEMENT - FACEBOOK STYLE
-- Add reactions, comments, shares, link preview, etc.
-- =====================================================

-- =====================================================
-- PART 1: Add new columns to sponsor_banners table
-- =====================================================

-- Primary text (combines title + subtitle for Facebook-style display)
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS primary_text TEXT;

-- Media type support (image, video, carousel)
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS media_aspect_ratio VARCHAR(10) DEFAULT '1:1';
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Link preview section
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS link_domain VARCHAR(255);
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS link_title VARCHAR(100);
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS link_description VARCHAR(200);

-- Advertiser info
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS advertiser_verified BOOLEAN DEFAULT false;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS advertiser_tier VARCHAR(20) DEFAULT 'PARTNER';
-- OFFICIAL = GEM internal, PARTNER = paid partners, AFFILIATE = affiliate products

-- Reactions counters
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_like INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_love INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_haha INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_wow INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_sad INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS reaction_angry INTEGER DEFAULT 0;

-- Engagement counters
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS hide_count INTEGER DEFAULT 0;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- =====================================================
-- PART 2: Create sponsor_ad_interactions table
-- Tracks all user interactions with ads
-- =====================================================

CREATE TABLE IF NOT EXISTS sponsor_ad_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES sponsor_banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Interaction type
  interaction_type VARCHAR(30) NOT NULL,
  -- Types: impression, click, reaction, unreaction, comment, share, hide, report, why_this_ad

  -- For reactions
  reaction_type VARCHAR(20),
  -- Types: like, love, haha, wow, sad, angry

  -- For reports
  report_reason VARCHAR(100),

  -- For shares
  share_destination VARCHAR(50),
  -- Types: feed, messenger, copy_link, external

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sponsor_ad_interactions
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_interactions_ad_id ON sponsor_ad_interactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_interactions_user_id ON sponsor_ad_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_interactions_type ON sponsor_ad_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_interactions_created ON sponsor_ad_interactions(created_at DESC);

-- Unique constraint: one reaction per user per ad
CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsor_ad_unique_reaction
  ON sponsor_ad_interactions(ad_id, user_id, interaction_type)
  WHERE interaction_type = 'reaction';

-- Enable RLS
ALTER TABLE sponsor_ad_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_ad_interactions
CREATE POLICY "Users can view own interactions"
  ON sponsor_ad_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON sponsor_ad_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON sponsor_ad_interactions FOR DELETE
  USING (auth.uid() = user_id AND interaction_type = 'reaction');

CREATE POLICY "Admins can view all interactions"
  ON sponsor_ad_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'ADMIN') OR profiles.is_admin = true)
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON sponsor_ad_interactions TO authenticated;

-- =====================================================
-- PART 3: Create sponsor_ad_comments table
-- =====================================================

CREATE TABLE IF NOT EXISTS sponsor_ad_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES sponsor_banners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Parent comment for replies
  parent_id UUID REFERENCES sponsor_ad_comments(id) ON DELETE CASCADE,

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,

  -- Status
  is_hidden BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sponsor_ad_comments
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_comments_ad_id ON sponsor_ad_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_comments_user_id ON sponsor_ad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_comments_parent_id ON sponsor_ad_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_comments_created ON sponsor_ad_comments(created_at DESC);

-- Enable RLS
ALTER TABLE sponsor_ad_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_ad_comments
CREATE POLICY "Anyone can view non-hidden comments"
  ON sponsor_ad_comments FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Users can insert own comments"
  ON sponsor_ad_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON sponsor_ad_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON sponsor_ad_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON sponsor_ad_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('admin', 'ADMIN') OR profiles.is_admin = true)
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sponsor_ad_comments TO authenticated;

-- =====================================================
-- PART 4: Create sponsor_ad_comment_likes table
-- =====================================================

CREATE TABLE IF NOT EXISTS sponsor_ad_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES sponsor_ad_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(comment_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sponsor_ad_comment_likes_comment ON sponsor_ad_comment_likes(comment_id);

-- Enable RLS
ALTER TABLE sponsor_ad_comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comment likes"
  ON sponsor_ad_comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON sponsor_ad_comment_likes FOR ALL
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON sponsor_ad_comment_likes TO authenticated;

-- =====================================================
-- PART 5: Helper functions for reactions
-- =====================================================

-- Function to add/update reaction to an ad
CREATE OR REPLACE FUNCTION react_to_ad(
  p_ad_id UUID,
  p_reaction_type VARCHAR(20)
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_old_reaction VARCHAR(20);
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check for existing reaction
  SELECT reaction_type INTO v_old_reaction
  FROM sponsor_ad_interactions
  WHERE ad_id = p_ad_id AND user_id = v_user_id AND interaction_type = 'reaction';

  -- If same reaction, remove it (toggle off)
  IF v_old_reaction = p_reaction_type THEN
    DELETE FROM sponsor_ad_interactions
    WHERE ad_id = p_ad_id AND user_id = v_user_id AND interaction_type = 'reaction';

    -- Decrement counter
    EXECUTE format('UPDATE sponsor_banners SET reaction_%s = GREATEST(0, reaction_%s - 1) WHERE id = $1',
                   p_reaction_type, p_reaction_type) USING p_ad_id;

    RETURN jsonb_build_object('success', true, 'action', 'removed', 'reaction', p_reaction_type);
  END IF;

  -- If different reaction, update it
  IF v_old_reaction IS NOT NULL THEN
    -- Decrement old reaction
    EXECUTE format('UPDATE sponsor_banners SET reaction_%s = GREATEST(0, reaction_%s - 1) WHERE id = $1',
                   v_old_reaction, v_old_reaction) USING p_ad_id;

    -- Update to new reaction
    UPDATE sponsor_ad_interactions
    SET reaction_type = p_reaction_type, created_at = NOW()
    WHERE ad_id = p_ad_id AND user_id = v_user_id AND interaction_type = 'reaction';
  ELSE
    -- Insert new reaction
    INSERT INTO sponsor_ad_interactions (ad_id, user_id, interaction_type, reaction_type)
    VALUES (p_ad_id, v_user_id, 'reaction', p_reaction_type);
  END IF;

  -- Increment new reaction counter
  EXECUTE format('UPDATE sponsor_banners SET reaction_%s = reaction_%s + 1 WHERE id = $1',
                 p_reaction_type, p_reaction_type) USING p_ad_id;

  RETURN jsonb_build_object('success', true, 'action', 'added', 'reaction', p_reaction_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's reaction to an ad
CREATE OR REPLACE FUNCTION get_user_ad_reaction(p_ad_id UUID)
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN (
    SELECT reaction_type
    FROM sponsor_ad_interactions
    WHERE ad_id = p_ad_id
      AND user_id = auth.uid()
      AND interaction_type = 'reaction'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment share count
CREATE OR REPLACE FUNCTION increment_ad_share(p_ad_id UUID, p_destination VARCHAR(50) DEFAULT 'copy_link')
RETURNS void AS $$
BEGIN
  -- Log the share
  INSERT INTO sponsor_ad_interactions (ad_id, user_id, interaction_type, share_destination)
  VALUES (p_ad_id, auth.uid(), 'share', p_destination);

  -- Increment counter
  UPDATE sponsor_banners
  SET shares_count = shares_count + 1
  WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to report an ad
CREATE OR REPLACE FUNCTION report_ad(p_ad_id UUID, p_reason VARCHAR(100))
RETURNS void AS $$
BEGIN
  -- Log the report
  INSERT INTO sponsor_ad_interactions (ad_id, user_id, interaction_type, report_reason)
  VALUES (p_ad_id, auth.uid(), 'report', p_reason);

  -- Increment counter
  UPDATE sponsor_banners
  SET report_count = report_count + 1
  WHERE id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to hide an ad (different from dismiss)
CREATE OR REPLACE FUNCTION hide_ad(p_ad_id UUID)
RETURNS void AS $$
BEGIN
  -- Log the hide action
  INSERT INTO sponsor_ad_interactions (ad_id, user_id, interaction_type)
  VALUES (p_ad_id, auth.uid(), 'hide');

  -- Increment counter
  UPDATE sponsor_banners
  SET hide_count = hide_count + 1
  WHERE id = p_ad_id;

  -- Also dismiss it for the user
  INSERT INTO dismissed_banners (user_id, banner_id)
  VALUES (auth.uid(), p_ad_id)
  ON CONFLICT (user_id, banner_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add comment to an ad
CREATE OR REPLACE FUNCTION add_ad_comment(
  p_ad_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Insert comment
  INSERT INTO sponsor_ad_comments (ad_id, user_id, content, parent_id)
  VALUES (p_ad_id, auth.uid(), p_content, p_parent_id)
  RETURNING id INTO v_comment_id;

  -- Increment counter on ad
  UPDATE sponsor_banners
  SET comments_count = comments_count + 1
  WHERE id = p_ad_id;

  -- If it's a reply, increment parent's replies_count
  IF p_parent_id IS NOT NULL THEN
    UPDATE sponsor_ad_comments
    SET replies_count = replies_count + 1
    WHERE id = p_parent_id;
  END IF;

  -- Log interaction
  INSERT INTO sponsor_ad_interactions (ad_id, user_id, interaction_type, metadata)
  VALUES (p_ad_id, auth.uid(), 'comment', jsonb_build_object('comment_id', v_comment_id));

  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle like on a comment
CREATE OR REPLACE FUNCTION toggle_ad_comment_like(p_comment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_liked BOOLEAN;
BEGIN
  -- Check if already liked
  IF EXISTS (SELECT 1 FROM sponsor_ad_comment_likes WHERE comment_id = p_comment_id AND user_id = auth.uid()) THEN
    -- Unlike
    DELETE FROM sponsor_ad_comment_likes WHERE comment_id = p_comment_id AND user_id = auth.uid();
    UPDATE sponsor_ad_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_comment_id;
    v_liked := false;
  ELSE
    -- Like
    INSERT INTO sponsor_ad_comment_likes (comment_id, user_id) VALUES (p_comment_id, auth.uid());
    UPDATE sponsor_ad_comments SET likes_count = likes_count + 1 WHERE id = p_comment_id;
    v_liked := true;
  END IF;

  RETURN v_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 6: Comments
-- =====================================================

COMMENT ON TABLE sponsor_ad_interactions IS 'Tracks all user interactions with sponsor ads (reactions, comments, shares, reports)';
COMMENT ON TABLE sponsor_ad_comments IS 'Comments on sponsor ads';
COMMENT ON TABLE sponsor_ad_comment_likes IS 'Likes on ad comments';
COMMENT ON FUNCTION react_to_ad IS 'Add, update, or remove a reaction to a sponsor ad';
COMMENT ON FUNCTION get_user_ad_reaction IS 'Get the current user reaction type for a sponsor ad';
COMMENT ON FUNCTION increment_ad_share IS 'Track when a user shares an ad';
COMMENT ON FUNCTION report_ad IS 'Report a sponsor ad with a reason';
COMMENT ON FUNCTION hide_ad IS 'Hide a sponsor ad from user feed';
COMMENT ON FUNCTION add_ad_comment IS 'Add a comment to a sponsor ad';
COMMENT ON FUNCTION toggle_ad_comment_like IS 'Toggle like on an ad comment';
