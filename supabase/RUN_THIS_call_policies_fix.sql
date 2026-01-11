-- ============================================================
-- RUN THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- Fix duplicate policy error for call system
-- ============================================================

-- Step 1: Drop all existing call policies
DROP POLICY IF EXISTS "Users can view calls in their conversations" ON calls;
DROP POLICY IF EXISTS "Users can create calls in their conversations" ON calls;
DROP POLICY IF EXISTS "Participants can update calls" ON calls;

DROP POLICY IF EXISTS "Users can view call participants" ON call_participants;
DROP POLICY IF EXISTS "Caller can add participants" ON call_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON call_participants;

DROP POLICY IF EXISTS "Participants can view call events" ON call_events;
DROP POLICY IF EXISTS "Participants can log events" ON call_events;

-- Step 2: Recreate policies for CALLS table
CREATE POLICY "Users can view calls in their conversations" ON calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = calls.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calls in their conversations" ON calls
  FOR INSERT WITH CHECK (
    caller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = calls.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update calls" ON calls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = calls.id
      AND cp.user_id = auth.uid()
    )
  );

-- Step 3: Recreate policies for CALL_PARTICIPANTS table
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_participants cp2
      WHERE cp2.call_id = call_participants.call_id
      AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Caller can add participants" ON call_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_participants.call_id
      AND c.caller_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own participation" ON call_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Step 4: Recreate policies for CALL_EVENTS table
CREATE POLICY "Participants can view call events" ON call_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_events.call_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can log events" ON call_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_events.call_id
      AND cp.user_id = auth.uid()
    )
  );

-- Done! All policies recreated successfully
SELECT 'Call system policies fixed!' as result;
