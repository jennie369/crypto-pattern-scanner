-- ============================================================
-- FIX CALLS TABLE RLS POLICY - Infinite Recursion
-- Date: 2026-01-26
-- Issue: RLS policy on 'calls' references 'call_participants' which
--        references 'calls', causing infinite recursion
-- ============================================================

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view calls they participate in" ON calls;
DROP POLICY IF EXISTS "Users can update calls they participate in" ON calls;
DROP POLICY IF EXISTS "Users can view own calls" ON calls;
DROP POLICY IF EXISTS "Users can update own calls" ON calls;
DROP POLICY IF EXISTS "Callers can create calls" ON calls;
DROP POLICY IF EXISTS "Participants can view calls" ON calls;
DROP POLICY IF EXISTS "Participants can update calls" ON calls;

-- Create simple non-recursive policies
-- Users can view calls where they are caller or callee
CREATE POLICY "calls_select_policy" ON calls
  FOR SELECT USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

-- Users can insert calls where they are the caller
CREATE POLICY "calls_insert_policy" ON calls
  FOR INSERT WITH CHECK (
    auth.uid() = caller_id
  );

-- Users can update calls where they are caller or callee
CREATE POLICY "calls_update_policy" ON calls
  FOR UPDATE USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

-- ============================================================
-- Also fix call_participants policies if needed
-- ============================================================

DROP POLICY IF EXISTS "Users can view their call participants" ON call_participants;
DROP POLICY IF EXISTS "Users can insert their call participants" ON call_participants;
DROP POLICY IF EXISTS "Users can update their call participants" ON call_participants;
DROP POLICY IF EXISTS "Participants can view call participants" ON call_participants;
DROP POLICY IF EXISTS "Participants can insert call participants" ON call_participants;
DROP POLICY IF EXISTS "Participants can update call participants" ON call_participants;
DROP POLICY IF EXISTS "call_participants_select_policy" ON call_participants;
DROP POLICY IF EXISTS "call_participants_insert_policy" ON call_participants;
DROP POLICY IF EXISTS "call_participants_update_policy" ON call_participants;

-- Simple policy: users can view/manage participants for calls they're in
-- Use subquery to check calls table without recursion
CREATE POLICY "call_participants_select_policy" ON call_participants
  FOR SELECT USING (
    auth.uid() = user_id OR
    call_id IN (SELECT id FROM calls WHERE caller_id = auth.uid() OR callee_id = auth.uid())
  );

CREATE POLICY "call_participants_insert_policy" ON call_participants
  FOR INSERT WITH CHECK (
    -- User can add themselves, or add others to calls they created
    auth.uid() = user_id OR
    call_id IN (SELECT id FROM calls WHERE caller_id = auth.uid())
  );

CREATE POLICY "call_participants_update_policy" ON call_participants
  FOR UPDATE USING (
    auth.uid() = user_id OR
    call_id IN (SELECT id FROM calls WHERE caller_id = auth.uid() OR callee_id = auth.uid())
  );

-- ============================================================
-- Verification
-- ============================================================

SELECT 'Calls RLS policies fixed!' as status;
