-- Fix infinite recursion in call_participants RLS policy
-- The old policy referenced call_participants within itself, causing recursion

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view call participants" ON call_participants;
DROP POLICY IF EXISTS "Caller can add participants" ON call_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON call_participants;

-- New policy: Users can view their own participation or if they're the caller
-- Uses calls table instead of self-reference to avoid recursion
CREATE POLICY "Users can view call participants" ON call_participants
  FOR SELECT USING (
    -- User is this participant
    user_id = auth.uid()
    OR
    -- User is the caller of this call
    EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_participants.call_id
      AND c.caller_id = auth.uid()
    )
  );

-- New policy: Users can insert themselves or caller can add participants
CREATE POLICY "Caller can add participants" ON call_participants
  FOR INSERT WITH CHECK (
    -- User is adding themselves
    user_id = auth.uid()
    OR
    -- User is the caller of the call
    EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_participants.call_id
      AND c.caller_id = auth.uid()
    )
  );

-- Users can update their own participation
CREATE POLICY "Users can update own participation" ON call_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Also fix call_events if it has similar issue
DROP POLICY IF EXISTS "Participants can view call events" ON call_events;
DROP POLICY IF EXISTS "Participants can log events" ON call_events;

-- View: Users can view events for calls they're part of
CREATE POLICY "Participants can view call events" ON call_events
  FOR SELECT USING (
    -- User is the caller
    EXISTS (
      SELECT 1 FROM calls c
      WHERE c.id = call_events.call_id
      AND c.caller_id = auth.uid()
    )
    OR
    -- User is a participant (direct check, no subquery on call_participants)
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_events.call_id
      AND cp.user_id = auth.uid()
    )
  );

-- Insert: Users can log events for their calls
CREATE POLICY "Participants can log events" ON call_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );
