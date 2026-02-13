-- ============================================
-- Seed Impressions Table
-- Track which seed posts users have seen
-- ============================================

-- 1. Create seed_impressions table
CREATE TABLE IF NOT EXISTS seed_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES seed_posts(id) ON DELETE CASCADE,
  position INTEGER,
  session_id TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- Prevent duplicate entries per user/post
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_seed_impressions_user ON seed_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_post ON seed_impressions(post_id);
CREATE INDEX IF NOT EXISTS idx_seed_impressions_shown ON seed_impressions(shown_at DESC);

-- 3. Enable RLS
ALTER TABLE seed_impressions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view own seed impressions" ON seed_impressions;
CREATE POLICY "Users can view own seed impressions" ON seed_impressions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own seed impressions" ON seed_impressions;
CREATE POLICY "Users can create own seed impressions" ON seed_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Grant permissions
GRANT SELECT, INSERT ON seed_impressions TO authenticated;
GRANT SELECT, INSERT ON seed_impressions TO anon;
