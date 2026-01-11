-- ============================================================
-- GEM MESSAGES - CALL FUNCTIONS ENHANCED
-- File: supabase/migrations/20251228_call_functions_enhanced.sql
-- Description: Additional RPC functions for call management
-- ============================================================

-- ============================================================
-- FUNCTION: Initiate a call
-- Creates call record and participant records
-- ============================================================

CREATE OR REPLACE FUNCTION initiate_call(
  p_caller_id UUID,
  p_callee_id UUID,
  p_conversation_id UUID,
  p_call_type TEXT DEFAULT 'audio'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call_id UUID;
  v_existing_call UUID;
BEGIN
  -- Check for existing active call in this conversation
  SELECT id INTO v_existing_call
  FROM calls
  WHERE conversation_id = p_conversation_id
    AND status IN ('initiating', 'ringing', 'connecting', 'connected', 'reconnecting')
  LIMIT 1;

  IF v_existing_call IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'There is already an active call in this conversation',
      'existing_call_id', v_existing_call
    );
  END IF;

  -- Check if callee is blocked
  IF EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = p_caller_id AND blocked_id = p_callee_id)
       OR (blocker_id = p_callee_id AND blocked_id = p_caller_id)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot call blocked user'
    );
  END IF;

  -- Create call record
  INSERT INTO calls (
    conversation_id,
    caller_id,
    call_type,
    status,
    ring_started_at
  )
  VALUES (
    p_conversation_id,
    p_caller_id,
    p_call_type,
    'ringing',
    NOW()
  )
  RETURNING id INTO v_call_id;

  -- Add caller as participant
  INSERT INTO call_participants (
    call_id,
    user_id,
    role,
    status,
    invited_at
  )
  VALUES (
    v_call_id,
    p_caller_id,
    'caller',
    'connecting',
    NOW()
  );

  -- Add callee as participant
  INSERT INTO call_participants (
    call_id,
    user_id,
    role,
    status,
    invited_at
  )
  VALUES (
    v_call_id,
    p_callee_id,
    'callee',
    'ringing',
    NOW()
  );

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    v_call_id,
    p_caller_id,
    'call_initiated',
    jsonb_build_object(
      'call_type', p_call_type,
      'callee_id', p_callee_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'call_id', v_call_id,
    'call_type', p_call_type
  );
END;
$$;

-- ============================================================
-- FUNCTION: Answer a call
-- ============================================================

CREATE OR REPLACE FUNCTION answer_call(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call RECORD;
BEGIN
  -- Get call info
  SELECT * INTO v_call FROM calls WHERE id = p_call_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  -- Check if call is still ringing
  IF v_call.status != 'ringing' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Call is no longer ringing',
      'current_status', v_call.status
    );
  END IF;

  -- Update call status
  UPDATE calls
  SET
    status = 'connecting',
    updated_at = NOW()
  WHERE id = p_call_id;

  -- Update participant status
  UPDATE call_participants
  SET
    status = 'connecting',
    updated_at = NOW()
  WHERE call_id = p_call_id
    AND user_id = p_user_id;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    'call_answered',
    jsonb_build_object('answered_at', NOW())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCTION: Decline a call
-- ============================================================

CREATE OR REPLACE FUNCTION decline_call(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call RECORD;
BEGIN
  -- Get call info
  SELECT * INTO v_call FROM calls WHERE id = p_call_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  -- Check if call can be declined
  IF v_call.status NOT IN ('initiating', 'ringing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Call cannot be declined',
      'current_status', v_call.status
    );
  END IF;

  -- Update call status
  UPDATE calls
  SET
    status = 'declined',
    ended_at = NOW(),
    end_reason = 'declined',
    updated_at = NOW()
  WHERE id = p_call_id;

  -- Update participant status
  UPDATE call_participants
  SET
    status = 'declined',
    left_at = NOW(),
    updated_at = NOW()
  WHERE call_id = p_call_id
    AND user_id = p_user_id;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    'call_declined',
    jsonb_build_object('declined_at', NOW())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCTION: Cancel a call (by caller before answer)
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_call(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call RECORD;
BEGIN
  -- Get call info
  SELECT * INTO v_call FROM calls WHERE id = p_call_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  -- Verify caller
  IF v_call.caller_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only caller can cancel the call');
  END IF;

  -- Check if call can be cancelled
  IF v_call.status NOT IN ('initiating', 'ringing') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Call cannot be cancelled',
      'current_status', v_call.status
    );
  END IF;

  -- Update call status
  UPDATE calls
  SET
    status = 'cancelled',
    ended_at = NOW(),
    end_reason = 'cancelled',
    updated_at = NOW()
  WHERE id = p_call_id;

  -- Update all participants
  UPDATE call_participants
  SET
    status = 'left',
    left_at = NOW(),
    updated_at = NOW()
  WHERE call_id = p_call_id;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    'call_cancelled',
    jsonb_build_object('cancelled_at', NOW())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCTION: Mark call as connected
-- Called when WebRTC connection is established
-- ============================================================

CREATE OR REPLACE FUNCTION mark_call_connected(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update call status to connected (if first connection)
  UPDATE calls
  SET
    status = 'connected',
    started_at = COALESCE(started_at, NOW()),
    updated_at = NOW()
  WHERE id = p_call_id
    AND status IN ('connecting', 'reconnecting');

  -- Update participant status
  UPDATE call_participants
  SET
    status = 'connected',
    joined_at = COALESCE(joined_at, NOW()),
    updated_at = NOW()
  WHERE call_id = p_call_id
    AND user_id = p_user_id;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    'call_connected',
    jsonb_build_object('connected_at', NOW())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCTION: Update participant media state (mute, video, etc.)
-- ============================================================

CREATE OR REPLACE FUNCTION update_call_participant_media(
  p_call_id UUID,
  p_user_id UUID,
  p_is_muted BOOLEAN DEFAULT NULL,
  p_is_video_enabled BOOLEAN DEFAULT NULL,
  p_is_speaker_on BOOLEAN DEFAULT NULL,
  p_connection_quality TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_type TEXT;
BEGIN
  -- Update participant
  UPDATE call_participants
  SET
    is_muted = COALESCE(p_is_muted, is_muted),
    is_video_enabled = COALESCE(p_is_video_enabled, is_video_enabled),
    is_speaker_on = COALESCE(p_is_speaker_on, is_speaker_on),
    connection_quality = COALESCE(p_connection_quality, connection_quality),
    updated_at = NOW()
  WHERE call_id = p_call_id
    AND user_id = p_user_id;

  -- Determine event type
  IF p_is_muted IS NOT NULL THEN
    v_event_type := 'mute_toggled';
  ELSIF p_is_video_enabled IS NOT NULL THEN
    v_event_type := 'video_toggled';
  ELSIF p_is_speaker_on IS NOT NULL THEN
    v_event_type := 'speaker_toggled';
  ELSIF p_connection_quality IS NOT NULL THEN
    v_event_type := 'connection_quality_changed';
  ELSE
    RETURN jsonb_build_object('success', true);
  END IF;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    v_event_type,
    jsonb_build_object(
      'is_muted', p_is_muted,
      'is_video_enabled', p_is_video_enabled,
      'is_speaker_on', p_is_speaker_on,
      'connection_quality', p_connection_quality
    )
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- FUNCTION: Get active call for user
-- ============================================================

CREATE OR REPLACE FUNCTION get_active_call(p_user_id UUID)
RETURNS TABLE (
  call_id UUID,
  conversation_id UUID,
  call_type TEXT,
  status TEXT,
  caller_id UUID,
  started_at TIMESTAMPTZ,
  is_caller BOOLEAN,
  other_user JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS call_id,
    c.conversation_id,
    c.call_type,
    c.status,
    c.caller_id,
    c.started_at,
    (c.caller_id = p_user_id) AS is_caller,
    CASE
      WHEN c.caller_id = p_user_id THEN (
        SELECT jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'avatar_url', p.avatar_url
        )
        FROM call_participants cp2
        JOIN profiles p ON p.id = cp2.user_id
        WHERE cp2.call_id = c.id
          AND cp2.user_id != p_user_id
        LIMIT 1
      )
      ELSE (
        SELECT jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'avatar_url', p.avatar_url
        )
        FROM profiles p
        WHERE p.id = c.caller_id
      )
    END AS other_user
  FROM calls c
  JOIN call_participants cp ON cp.call_id = c.id
  WHERE cp.user_id = p_user_id
    AND c.status IN ('initiating', 'ringing', 'connecting', 'connected', 'reconnecting')
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$;

-- ============================================================
-- FUNCTION: Get incoming calls for user (for push notification)
-- ============================================================

CREATE OR REPLACE FUNCTION get_incoming_calls(p_user_id UUID)
RETURNS TABLE (
  call_id UUID,
  conversation_id UUID,
  call_type TEXT,
  caller JSONB,
  ring_started_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS call_id,
    c.conversation_id,
    c.call_type,
    jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url
    ) AS caller,
    c.ring_started_at
  FROM calls c
  JOIN profiles p ON p.id = c.caller_id
  JOIN call_participants cp ON cp.call_id = c.id
  WHERE cp.user_id = p_user_id
    AND cp.role = 'callee'
    AND c.status = 'ringing'
  ORDER BY c.ring_started_at DESC;
END;
$$;

-- ============================================================
-- FUNCTION: Upgrade audio call to video
-- ============================================================

CREATE OR REPLACE FUNCTION upgrade_call_to_video(
  p_call_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call RECORD;
BEGIN
  -- Get call info
  SELECT * INTO v_call FROM calls WHERE id = p_call_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call not found');
  END IF;

  -- Check if already video
  IF v_call.call_type = 'video' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call is already a video call');
  END IF;

  -- Check if call is active
  IF v_call.status NOT IN ('connected', 'reconnecting') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Call must be connected to upgrade');
  END IF;

  -- Update call type
  UPDATE calls
  SET
    call_type = 'video',
    updated_at = NOW()
  WHERE id = p_call_id;

  -- Enable video for the initiator
  UPDATE call_participants
  SET
    is_video_enabled = TRUE,
    updated_at = NOW()
  WHERE call_id = p_call_id
    AND user_id = p_user_id;

  -- Log event
  INSERT INTO call_events (call_id, user_id, event_type, metadata)
  VALUES (
    p_call_id,
    p_user_id,
    'video_toggled',
    jsonb_build_object('upgraded_to_video', true)
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION initiate_call(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION answer_call(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decline_call(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_call(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_call_connected(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_call_participant_media(UUID, UUID, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_call(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_incoming_calls(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_call_to_video(UUID, UUID) TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION initiate_call IS 'Start a new call to another user';
COMMENT ON FUNCTION answer_call IS 'Answer an incoming call';
COMMENT ON FUNCTION decline_call IS 'Decline an incoming call';
COMMENT ON FUNCTION cancel_call IS 'Cancel outgoing call before answer';
COMMENT ON FUNCTION mark_call_connected IS 'Mark call as connected after WebRTC setup';
COMMENT ON FUNCTION update_call_participant_media IS 'Update mute/video/speaker state';
COMMENT ON FUNCTION get_active_call IS 'Get current active call for user';
COMMENT ON FUNCTION get_incoming_calls IS 'Get incoming calls for push notification';
COMMENT ON FUNCTION upgrade_call_to_video IS 'Upgrade audio call to video';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Call functions enhanced migration completed!';
  RAISE NOTICE '📞 Functions: initiate_call, answer_call, decline_call, cancel_call';
  RAISE NOTICE '🎥 Functions: mark_call_connected, update_call_participant_media';
  RAISE NOTICE '🔍 Functions: get_active_call, get_incoming_calls, upgrade_call_to_video';
END $$;
