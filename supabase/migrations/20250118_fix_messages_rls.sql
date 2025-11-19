-- =====================================================
-- FIX MESSAGES - RLS POLICIES
-- =====================================================
-- Issue: Users can't create conversations due to RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can create conversation participants" ON conversation_participants;

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
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
-- CONVERSATION_PARTICIPANTS TABLE POLICIES
-- =====================================================

-- Allow users to view participants in their conversations
CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- Allow users to create participant records
CREATE POLICY "Users can create conversation participants"
ON conversation_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_participants.conversation_id
    AND auth.uid() = ANY(conversations.participant_ids)
  )
);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants')
ORDER BY tablename, policyname;
