-- =====================================================
-- FIX Vision Board Upload Policy
-- The INSERT policy WITH CHECK clause was not created properly
-- =====================================================

-- Drop and recreate the upload policy
DROP POLICY IF EXISTS "vision_board_upload_policy" ON storage.objects;

-- Recreate with explicit WITH CHECK
CREATE POLICY "vision_board_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vision-board'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the policy was created correctly
SELECT
  policyname,
  cmd,
  permissive,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname = 'vision_board_upload_policy';
