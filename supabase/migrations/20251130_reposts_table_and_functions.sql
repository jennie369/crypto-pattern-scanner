-- ============================================
-- Migration: Reposts Table and Functions
-- Date: 2024-11-30
-- Purpose: Ensure reposts table and RPC functions exist
-- ============================================

-- ============================================
-- 1. CREATE REPOSTS TABLE (Feature #10)
-- ============================================

CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reposter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_repost UNIQUE(original_post_id, reposter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reposts_original ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts(reposter_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created ON reposts(created_at DESC);

-- ============================================
-- 2. ADD repost_count TO forum_posts
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'forum_posts' AND column_name = 'repost_count') THEN
    ALTER TABLE forum_posts ADD COLUMN repost_count INT DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 3. RLS POLICIES FOR REPOSTS
-- ============================================

ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view reposts" ON reposts;
DROP POLICY IF EXISTS "Users can create own reposts" ON reposts;
DROP POLICY IF EXISTS "Users can delete own reposts" ON reposts;

-- Create policies
CREATE POLICY "Anyone can view reposts" ON reposts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reposts" ON reposts
  FOR INSERT WITH CHECK (auth.uid() = reposter_id);

CREATE POLICY "Users can delete own reposts" ON reposts
  FOR DELETE USING (auth.uid() = reposter_id);

-- ============================================
-- 4. RPC FUNCTIONS
-- ============================================

-- Increment repost count
CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement repost count
CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_repost_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_repost_count TO authenticated;

-- ============================================
-- COMPLETED
-- ============================================
