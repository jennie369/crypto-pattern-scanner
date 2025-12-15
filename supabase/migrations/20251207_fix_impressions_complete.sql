-- ============================================
-- Complete fix for impressions tables
-- Ensures all RLS policies are in place for:
-- - INSERT (create impressions when viewing posts)
-- - UPDATE (upsert when viewing posts again)
-- - DELETE (for debug reset function)
-- - SELECT (for querying seen posts)
-- ============================================

-- ============================================
-- 1. FEED_IMPRESSIONS TABLE
-- ============================================

-- Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user ON feed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_post ON feed_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_shown ON feed_impressions(shown_at DESC);

-- Enable RLS
ALTER TABLE feed_impressions ENABLE ROW LEVEL SECURITY;

-- Add unique constraint if it doesn't exist (required for upsert)
DO $$
BEGIN
  ALTER TABLE feed_impressions
  ADD CONSTRAINT feed_impressions_user_post_unique UNIQUE (user_id, post_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop and recreate all policies
DROP POLICY IF EXISTS "Users can view own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can create own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can update own impressions" ON feed_impressions;
DROP POLICY IF EXISTS "Users can delete own impressions" ON feed_impressions;

CREATE POLICY "Users can view own impressions" ON feed_impressions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own impressions" ON feed_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own impressions" ON feed_impressions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own impressions" ON feed_impressions
  FOR DELETE USING (auth.uid() = user_id);

-- Grant all necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON feed_impressions TO authenticated;

-- ============================================
-- 2. SEED_IMPRESSIONS TABLE
-- ============================================

-- Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS seed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES seed_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_seed_impressions_user ON seed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_post ON seed_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_shown ON seed_impressions(shown_at DESC);

-- Enable RLS
ALTER TABLE seed_impressions ENABLE ROW LEVEL SECURITY;

-- Add unique constraint if it doesn't exist (required for upsert)
DO $$
BEGIN
  ALTER TABLE seed_impressions
  ADD CONSTRAINT seed_impressions_user_post_unique UNIQUE (user_id, post_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop and recreate all policies
DROP POLICY IF EXISTS "Users can view own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can create own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can update own seed impressions" ON seed_impressions;
DROP POLICY IF EXISTS "Users can delete own seed impressions" ON seed_impressions;

CREATE POLICY "Users can view own seed impressions" ON seed_impressions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own seed impressions" ON seed_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seed impressions" ON seed_impressions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own seed impressions" ON seed_impressions
  FOR DELETE USING (auth.uid() = user_id);

-- Grant all necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON seed_impressions TO authenticated;

-- ============================================
-- 3. Clean up any duplicate impressions
-- ============================================

-- feed_impressions: Keep only the earliest impression per user+post
DELETE FROM feed_impressions a
USING feed_impressions b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id = b.post_id;

-- seed_impressions: Keep only the earliest impression per user+post
DELETE FROM seed_impressions a
USING seed_impressions b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.post_id = b.post_id;

-- ============================================
-- LOG SUCCESS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Impressions tables completely configured:';
  RAISE NOTICE '  - feed_impressions: SELECT, INSERT, UPDATE, DELETE policies';
  RAISE NOTICE '  - seed_impressions: SELECT, INSERT, UPDATE, DELETE policies';
  RAISE NOTICE '  - Unique constraints on (user_id, post_id)';
  RAISE NOTICE '  - Duplicates cleaned up';
END $$;
