-- ============================================================
-- FIX: Call participant status cleanup
-- Issue: After ending a call, participant status 'ringing' is not updated,
--        causing "user is busy" error on subsequent calls
-- ============================================================

-- STEP 1: Add 'cancelled' to the status check constraint
-- First, drop the existing constraint
ALTER TABLE call_participants DROP CONSTRAINT IF EXISTS call_participants_status_check;

-- Then add the new constraint with 'cancelled' included
ALTER TABLE call_participants ADD CONSTRAINT call_participants_status_check
  CHECK (status IN (
    'invited',      -- Được mời
    'ringing',      -- Đang đổ chuông
    'connecting',   -- Đang kết nối
    'connected',    -- Đã kết nối
    'reconnecting', -- Đang kết nối lại
    'left',         -- Đã rời
    'declined',     -- Từ chối
    'missed',       -- Không trả lời
    'busy',         -- Đang bận
    'cancelled'     -- Cuộc gọi bị hủy trước khi trả lời
  ));

-- STEP 2: Update end_call function to also cleanup 'ringing' and 'invited' statuses
CREATE OR REPLACE FUNCTION end_call(
  p_call_id UUID,
  p_end_reason TEXT DEFAULT 'normal',
  p_ended_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call RECORD;
  v_duration INTEGER;
  v_result JSONB;
BEGIN
  -- Get call info
  SELECT * INTO v_call FROM calls WHERE id = p_call_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  -- Calculate duration
  IF v_call.started_at IS NOT NULL THEN
    v_duration := EXTRACT(EPOCH FROM (NOW() - v_call.started_at))::INTEGER;
  ELSE
    v_duration := 0;
  END IF;

  -- Update call
  UPDATE calls
  SET
    status = 'ended',
    ended_at = NOW(),
    duration_seconds = v_duration,
    end_reason = p_end_reason,
    updated_at = NOW()
  WHERE id = p_call_id;

  -- Update ALL participants to appropriate terminal status
  -- Connected/Connecting/Reconnecting -> left
  UPDATE call_participants
  SET
    status = 'left',
    left_at = NOW(),
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND status IN ('connected', 'connecting', 'reconnecting');

  -- Ringing/Invited -> cancelled (they never answered)
  UPDATE call_participants
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND status IN ('ringing', 'invited');

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    COALESCE(p_ended_by, auth.uid()),
    'call_ended',
    jsonb_build_object(
      'reason', p_end_reason,
      'duration', v_duration,
      'ended_by', COALESCE(p_ended_by, auth.uid())
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'duration', v_duration,
    'end_reason', p_end_reason
  );
END;
$$;

-- Add a helper function to force cleanup stale call participants
-- This can be called to fix existing stuck records
CREATE OR REPLACE FUNCTION cleanup_stale_call_participants()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update participants that are in ringing/invited/connecting status
  -- but their call has already ended
  UPDATE call_participants cp
  SET
    status = CASE
      WHEN cp.status = 'ringing' THEN 'cancelled'
      WHEN cp.status = 'invited' THEN 'cancelled'
      WHEN cp.status = 'connecting' THEN 'left'
      ELSE 'left'
    END,
    updated_at = NOW()
  FROM calls c
  WHERE cp.call_id = c.id
  AND cp.status IN ('ringing', 'invited', 'connecting', 'reconnecting')
  AND c.status IN ('ended', 'missed', 'cancelled', 'declined', 'failed');

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also cleanup participants for calls that are older than 1 hour
  -- and still in non-terminal status (safety cleanup)
  UPDATE call_participants
  SET
    status = 'left',
    updated_at = NOW()
  WHERE status IN ('ringing', 'invited', 'connecting', 'connected', 'reconnecting')
  AND created_at < NOW() - INTERVAL '1 hour';

  RETURN v_count;
END;
$$;

-- Run cleanup for existing stale records
SELECT cleanup_stale_call_participants();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_stale_call_participants() TO authenticated;

-- ============================================================
-- FIX: mark_call_missed function - update ALL participants, not just callee
-- Issue: Caller's participant status was not updated, leaving stale records
-- ============================================================
CREATE OR REPLACE FUNCTION mark_call_missed(p_call_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update call
  UPDATE calls
  SET
    status = 'missed',
    ended_at = NOW(),
    end_reason = 'no_answer',
    updated_at = NOW()
  WHERE id = p_call_id
  AND status = 'ringing';

  -- Update callee participant to missed
  UPDATE call_participants
  SET
    status = 'missed',
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND role = 'callee';

  -- Update caller participant to 'left' (call ended for them too)
  UPDATE call_participants
  SET
    status = 'left',
    left_at = NOW(),
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND role = 'caller';

  -- Update any other participants (invited/ringing) to cancelled
  UPDATE call_participants
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND status IN ('invited', 'ringing', 'connecting');

  -- Log event
  INSERT INTO call_events (call_id, event_type, metadata)
  VALUES (p_call_id, 'call_missed', jsonb_build_object('timeout_seconds', 60));

  RETURN jsonb_build_object('success', true);
END;
$$;
