-- ============================================
-- SEED POSTS RLS POLICY
-- Allow inserting seed posts from mobile app
-- ============================================

-- 1. Add policy to allow inserting seed posts
DROP POLICY IF EXISTS "Allow seed post insert" ON forum_posts;
CREATE POLICY "Allow seed post insert" ON forum_posts
  FOR INSERT WITH CHECK (
    -- Allow if it's marked as a seed post
    is_seed_post = true
  );

-- 2. Alternative: Allow inserting if user_id is from seed_users table
DROP POLICY IF EXISTS "Allow seed user posts" ON forum_posts;
CREATE POLICY "Allow seed user posts" ON forum_posts
  FOR INSERT WITH CHECK (
    -- Allow if user_id exists in seed_users
    EXISTS (SELECT 1 FROM seed_users WHERE id = user_id)
    OR
    -- Or if user_id matches current authenticated user
    user_id = auth.uid()
  );

-- 3. Grant necessary permissions
GRANT INSERT ON forum_posts TO authenticated;
GRANT INSERT ON forum_posts TO anon;
