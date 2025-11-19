-- =====================================================
-- FIX MESSAGES - CLEAN RLS POLICIES (Version 3)
-- =====================================================
-- Root Cause: Duplicate RLS policies and INSERT failing
-- This script removes ALL existing policies and creates clean ones

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop ALL policies on conversations
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
END $$;

-- Drop ALL policies on conversation_participants
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversation_participants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversation_participants';
    END LOOP;
END $$;

-- Verify all policies are dropped
SELECT 'Dropped all existing policies' as status;

-- =====================================================
-- STEP 2: CREATE CLEAN POLICIES - CONVERSATIONS
-- =====================================================

-- Allow users to view conversations they're part of
CREATE POLICY "conversations_select_policy"
ON conversations
FOR SELECT
USING (auth.uid() = ANY(participant_ids));

-- Allow authenticated users to create conversations
CREATE POLICY "conversations_insert_policy"
ON conversations
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = ANY(participant_ids)
);

-- Allow users to update conversations they're part of
CREATE POLICY "conversations_update_policy"
ON conversations
FOR UPDATE
USING (auth.uid() = ANY(participant_ids));

-- =====================================================
-- STEP 3: CREATE CLEAN POLICIES - PARTICIPANTS
-- =====================================================

-- Allow users to view participants in their conversations
-- SIMPLIFIED: Check if user is in the conversation OR is the participant
CREATE POLICY "participants_select_policy"
ON conversation_participants
FOR SELECT
USING (
  -- Can view if you're the participant
  user_id = auth.uid()
  OR
  -- OR if you're in the conversation
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- Allow authenticated users to create participant records
-- SIMPLIFIED: Just check if authenticated and in the conversation
CREATE POLICY "participants_insert_policy"
ON conversation_participants
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- Allow users to update their own participant record
CREATE POLICY "participants_update_policy"
ON conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

-- =====================================================
-- STEP 4: ENABLE RLS
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: VERIFY NEW POLICIES
-- =====================================================

SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, cmd;

-- Expected output:
-- conversations | conversations_insert_policy | INSERT
-- conversations | conversations_select_policy | SELECT
-- conversations | conversations_update_policy | UPDATE
-- conversation_participants | participants_insert_policy | INSERT
-- conversation_participants | participants_select_policy | SELECT
-- conversation_participants | participants_update_policy | UPDATE

-- =====================================================
-- STEP 6: TEST INSERT (Manual verification)
-- =====================================================

-- After running this migration, you need to:
-- 1. Clear browser cache
-- 2. Restart dev server
-- 3. Try creating a conversation in the app
-- 4. Check console for "Participants inserted: [Array(2)]"
-- 5. Run this query to verify:

SELECT
  cp.id,
  cp.conversation_id,
  cp.user_id,
  c.participant_ids
FROM conversation_participants cp
JOIN conversations c ON c.id = cp.conversation_id
ORDER BY c.created_at DESC
LIMIT 10;

-- If you see rows → INSERT is working! ✅
-- If still empty → There's a deeper issue (check console errors)

-- =====================================================
-- STEP 7: CLEANUP OLD CONVERSATIONS (OPTIONAL)
-- =====================================================

-- Uncomment to delete old conversations that have no participants
-- This helps start fresh for testing

/*
DELETE FROM conversations
WHERE id NOT IN (
  SELECT DISTINCT conversation_id
  FROM conversation_participants
);

SELECT 'Cleaned up conversations without participants' as status;
*/
