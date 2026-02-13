-- ============================================================
-- FIX: Drop existing policies before recreating
-- File: supabase/migrations/20251228_call_system_fix.sql
-- ============================================================

-- Drop existing policies on calls table
DROP POLICY IF EXISTS "Users can view calls in their conversations" ON calls;
DROP POLICY IF EXISTS "Users can create calls in their conversations" ON calls;
DROP POLICY IF EXISTS "Participants can update calls" ON calls;

-- Drop existing policies on call_participants table
DROP POLICY IF EXISTS "Users can view call participants" ON call_participants;
DROP POLICY IF EXISTS "Caller can add participants" ON call_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON call_participants;

-- Drop existing policies on call_events table
DROP POLICY IF EXISTS "Participants can view call events" ON call_events;
DROP POLICY IF EXISTS "Participants can log events" ON call_events;

-- ============================================================
-- RE-CREATE RLS POLICIES
-- ============================================================

-- CALLS POLICIES --

-- View: Users can view calls in their conversations
CREATE POLICY "Users can view calls in their conversations" ON calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = calls.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Insert: Users can create calls in their conversations
CREATE POLICY "Users can create calls in their conversations" ON calls
  FOR INSERT WITH CHECK (
    caller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = calls.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Update: Participants can update call status
CREATE POLICY "Participants can update calls" ON calls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = calls.id
      AND cp.user_id = auth.uid()
    )
  );

-- CALL PARTICIPANTS POLICIES --

-- View: Users can view participants in calls they're part of
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_participants cp2
      WHERE cp2.call_id = call_participants.call_id
      AND cp2.user_id = auth.uid()
    )
  );

-- Insert: Caller can add participants
CREATE POLICY "Caller can add participants" ON call_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_participants.call_id
      AND c.caller_id = auth.uid()
    )
  );

-- Update: Users can update their own participation
CREATE POLICY "Users can update own participation" ON call_participants
  FOR UPDATE USING (user_id = auth.uid());

-- CALL EVENTS POLICIES --

-- View: Participants can view events in their calls
CREATE POLICY "Participants can view call events" ON call_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_events.call_id
      AND cp.user_id = auth.uid()
    )
  );

-- Insert: Participants can log events
CREATE POLICY "Participants can log events" ON call_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_events.call_id
      AND cp.user_id = auth.uid()
    )
  );

-- ============================================================
-- DONE
-- ============================================================
