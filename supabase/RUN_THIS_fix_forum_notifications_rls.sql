-- =====================================================
-- FIX: forum_notifications RLS INSERT Policy
-- Error: new row violates row-level security policy
-- The table was missing INSERT policy
-- =====================================================

-- Allow authenticated users to INSERT notifications
-- (e.g., when liking a post, commenting, following, etc.)
DROP POLICY IF EXISTS "Users can create notifications" ON forum_notifications;
CREATE POLICY "Users can create notifications" ON forum_notifications
  FOR INSERT
  WITH CHECK (
    -- Allow insert if user is authenticated
    auth.uid() IS NOT NULL
  );

-- Also ensure admins can insert/delete any notification
DROP POLICY IF EXISTS "Admins can manage all notifications" ON forum_notifications;
CREATE POLICY "Admins can manage all notifications" ON forum_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow users to delete their own notifications
DROP POLICY IF EXISTS "Users can delete their notifications" ON forum_notifications;
CREATE POLICY "Users can delete their notifications" ON forum_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify existing policies
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'forum_notifications RLS policies updated';
  RAISE NOTICE '- INSERT: Users can create notifications';
  RAISE NOTICE '- DELETE: Users can delete own notifications';
  RAISE NOTICE '- ALL: Admins can manage all';
  RAISE NOTICE '========================================';
END $$;

-- Check policies
SELECT
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'forum_notifications'
ORDER BY policyname;
