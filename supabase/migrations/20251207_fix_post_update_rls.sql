-- ============================================
-- Fix RLS policies for forum_posts UPDATE
-- Ensure users can update their own posts
-- ============================================

-- Drop existing UPDATE policy if exists
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Enable update for post authors" ON forum_posts;
DROP POLICY IF EXISTS "Admins can update any post" ON forum_posts;

-- Create UPDATE policy for post authors
CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant update permission to authenticated users
GRANT UPDATE ON forum_posts TO authenticated;

-- Also ensure RLS is enabled
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Fix seed_posts UPDATE policy (for admin)
-- ============================================
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Admins can update seed posts" ON seed_posts;

  -- Create UPDATE policy for admin only
  CREATE POLICY "Admins can update seed posts" ON seed_posts
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Grant update permission
  GRANT UPDATE ON seed_posts TO authenticated;

  RAISE NOTICE 'Successfully updated seed_posts UPDATE policy';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'seed_posts table does not exist, skipping';
END $$;

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'Successfully fixed forum_posts UPDATE RLS policy - users can now update their own posts';
END $$;
