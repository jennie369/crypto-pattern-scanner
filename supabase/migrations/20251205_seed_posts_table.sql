-- ============================================
-- SEED POSTS TABLE MIGRATION
-- Create separate table for seed posts (no auth.users FK constraint)
-- ============================================

-- 1. Create seed_posts table (separate from forum_posts to avoid auth.users FK)
CREATE TABLE IF NOT EXISTS seed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES seed_users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  seed_topic VARCHAR(50),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published',
  feed_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_seed_posts_user ON seed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_seed_posts_topic ON seed_posts(seed_topic);
CREATE INDEX IF NOT EXISTS idx_seed_posts_created ON seed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seed_posts_status ON seed_posts(status) WHERE status = 'published';

-- 3. Enable RLS
ALTER TABLE seed_posts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Anyone can read seed posts" ON seed_posts;
CREATE POLICY "Anyone can read seed posts" ON seed_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert seed posts" ON seed_posts;
CREATE POLICY "System can insert seed posts" ON seed_posts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can manage seed posts" ON seed_posts;
CREATE POLICY "Admin can manage seed posts" ON seed_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- 5. Create view to combine real posts and seed posts for display
CREATE OR REPLACE VIEW all_posts_view AS
SELECT
  id,
  user_id,
  title,
  content,
  image_url,
  media_urls,
  NULL::VARCHAR as seed_topic,
  false as is_seed_post,
  likes_count,
  comments_count,
  views_count,
  is_pinned,
  status,
  feed_type,
  created_at,
  updated_at
FROM forum_posts
WHERE status = 'published'
UNION ALL
SELECT
  id,
  user_id,
  title,
  content,
  image_url,
  media_urls,
  seed_topic,
  true as is_seed_post,
  likes_count,
  comments_count,
  views_count,
  is_pinned,
  status,
  feed_type,
  created_at,
  updated_at
FROM seed_posts
WHERE status = 'published';

-- 6. Grant permissions
GRANT SELECT ON seed_posts TO authenticated;
GRANT SELECT ON seed_posts TO anon;
GRANT INSERT, UPDATE, DELETE ON seed_posts TO authenticated;
GRANT SELECT ON all_posts_view TO authenticated;
GRANT SELECT ON all_posts_view TO anon;
