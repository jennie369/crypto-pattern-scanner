-- =====================================================
-- FIX MESSAGES - SIMPLIFIED RLS POLICIES (Version 2)
-- =====================================================
-- This version uses simpler policies that are less likely to cause issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can create conversation participants" ON conversation_participants;

-- =====================================================
-- CONVERSATIONS TABLE POLICIES (Same as before)
-- =====================================================

-- Allow users to view conversations they're part of
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
USING (auth.uid() = ANY(participant_ids));

-- Allow users to create conversations
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (auth.uid() = ANY(participant_ids));

-- Allow users to update conversations they're part of
CREATE POLICY "Users can update their conversations"
ON conversations
FOR UPDATE
USING (auth.uid() = ANY(participant_ids));

-- =====================================================
-- CONVERSATION_PARTICIPANTS - SIMPLIFIED POLICIES
-- =====================================================

-- SIMPLIFIED: Allow users to view ANY participant record
-- This is more permissive but avoids subquery complexity
-- Alternative approach: Check if user_id matches OR check conversation
CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (
  -- Can view if: you're the participant OR you're in the conversation
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(c.participant_ids)
  )
);

-- SIMPLIFIED: Allow users to create participant records for conversations they're in
CREATE POLICY "Users can create conversation participants"
ON conversation_participants
FOR INSERT
WITH CHECK (
  -- Can insert if: you're in the conversation's participant_ids
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(c.participant_ids)
  )
);

-- =====================================================
-- ENABLE RLS (if not already enabled)
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN cmd = 'SELECT' THEN '✅ Can View'
    WHEN cmd = 'INSERT' THEN '✅ Can Create'
    WHEN cmd = 'UPDATE' THEN '✅ Can Update'
  END as description
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, cmd;

-- Expected output:
-- conversations | Users can view their conversations | SELECT | ✅ Can View
-- conversations | Users can create conversations | INSERT | ✅ Can Create
-- conversations | Users can update their conversations | UPDATE | ✅ Can Update
-- conversation_participants | Users can view conversation participants | SELECT | ✅ Can View
-- conversation_participants | Users can create conversation participants | INSERT | ✅ Can Create

-- =====================================================
-- TEST THE POLICIES
-- =====================================================

-- Test 1: Can you create a conversation?
DO $$
DECLARE
  test_conv_id UUID;
BEGIN
  INSERT INTO conversations (participant_ids, is_group, created_by)
  VALUES (ARRAY[auth.uid()], false, auth.uid())
  RETURNING id INTO test_conv_id;

  RAISE NOTICE 'Test 1 PASSED: Created conversation %', test_conv_id;

  -- Cleanup
  DELETE FROM conversations WHERE id = test_conv_id;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 1 FAILED: %', SQLERRM;
END $$;

-- Test 2: Can you create and read participants?
DO $$
DECLARE
  test_conv_id UUID;
  participant_count INTEGER;
BEGIN
  -- Create conversation
  INSERT INTO conversations (participant_ids, is_group, created_by)
  VALUES (ARRAY[auth.uid()], false, auth.uid())
  RETURNING id INTO test_conv_id;

  -- Insert participant
  INSERT INTO conversation_participants (conversation_id, user_id, unread_count)
  VALUES (test_conv_id, auth.uid(), 0);

  -- Try to read participant
  SELECT COUNT(*) INTO participant_count
  FROM conversation_participants
  WHERE conversation_id = test_conv_id;

  IF participant_count > 0 THEN
    RAISE NOTICE 'Test 2 PASSED: Created and read participant (count: %)', participant_count;
  ELSE
    RAISE NOTICE 'Test 2 FAILED: Created participant but cannot read it';
  END IF;

  -- Cleanup
  DELETE FROM conversation_participants WHERE conversation_id = test_conv_id;
  DELETE FROM conversations WHERE id = test_conv_id;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test 2 FAILED: %', SQLERRM;
END $$;

-- =====================================================
-- ALTERNATIVE: TEMPORARY PERMISSIVE POLICY FOR DEBUGGING
-- =====================================================
-- Uncomment these lines ONLY for debugging if issue persists
-- DO NOT use in production - these are too permissive

/*
-- SUPER PERMISSIVE - for debugging only
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;

CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (true); -- ALLOW ALL READS - DEBUG ONLY!

-- After applying this, if the issue is fixed, the problem is definitely RLS
-- Then we can work on creating a proper policy that doesn't block
*/
