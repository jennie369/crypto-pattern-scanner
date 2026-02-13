-- ============================================================
-- GEM MESSAGES - CALL SYSTEM
-- File: supabase/migrations/20251228_call_system.sql
-- Description: Audio/Video call tables for 1-1 and group calls
-- ============================================================

-- ============================================================
-- TABLE: calls
-- Lưu trữ thông tin cuộc gọi
-- ============================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Call type & mode
  call_type TEXT NOT NULL DEFAULT 'audio' CHECK (call_type IN ('audio', 'video')),
  is_group_call BOOLEAN DEFAULT FALSE,

  -- Call status với state machine
  status TEXT NOT NULL DEFAULT 'initiating' CHECK (status IN (
    'initiating',    -- Đang khởi tạo WebRTC
    'ringing',       -- Đang đổ chuông bên callee
    'connecting',    -- Đang thiết lập kết nối P2P
    'connected',     -- Đang trong cuộc gọi
    'reconnecting',  -- Đang kết nối lại sau mất mạng
    'ended',         -- Kết thúc bình thường
    'missed',        -- Không trả lời (timeout 60s)
    'declined',      -- Từ chối
    'cancelled',     -- Người gọi hủy trước khi nhận
    'failed',        -- Lỗi kết nối
    'busy'           -- Người nhận đang bận
  )),

  -- Timing
  ring_started_at TIMESTAMPTZ,      -- Thời điểm bắt đầu đổ chuông
  started_at TIMESTAMPTZ,           -- Thời điểm bắt đầu cuộc gọi (connected)
  ended_at TIMESTAMPTZ,             -- Thời điểm kết thúc
  duration_seconds INTEGER DEFAULT 0, -- Thời lượng cuộc gọi (giây)

  -- WebRTC/LiveKit
  room_id TEXT,                     -- LiveKit room ID (for group calls)

  -- Quality & Metadata
  end_reason TEXT,                  -- 'caller_ended', 'callee_ended', 'connection_failed', 'timeout'
  quality_score SMALLINT CHECK (quality_score IS NULL OR (quality_score >= 1 AND quality_score <= 5)),
  network_type TEXT,                -- 'wifi', '4g', '3g'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: call_participants
-- Người tham gia cuộc gọi
-- ============================================================
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN (
    'caller',       -- Người gọi
    'callee',       -- Người nhận
    'participant'   -- Thành viên group call
  )),

  -- Participant status
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited',      -- Được mời
    'ringing',      -- Đang đổ chuông
    'connecting',   -- Đang kết nối
    'connected',    -- Đã kết nối
    'reconnecting', -- Đang kết nối lại
    'left',         -- Đã rời
    'declined',     -- Từ chối
    'missed',       -- Không trả lời
    'busy'          -- Đang bận
  )),

  -- Timing
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  -- Media state (realtime sync)
  is_muted BOOLEAN DEFAULT FALSE,
  is_video_enabled BOOLEAN DEFAULT TRUE,
  is_screen_sharing BOOLEAN DEFAULT FALSE,
  is_speaker_on BOOLEAN DEFAULT FALSE,

  -- Connection info
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN (
    'excellent',  -- 5 bars
    'good',       -- 4 bars
    'fair',       -- 3 bars
    'poor',       -- 2 bars
    'bad'         -- 1 bar
  )),

  -- Device info
  device_type TEXT,  -- 'ios', 'android', 'web'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(call_id, user_id)
);

-- ============================================================
-- TABLE: call_events
-- Log sự kiện cuộc gọi (debugging & analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS call_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL CHECK (event_type IN (
    -- Call lifecycle
    'call_initiated',
    'call_ringing',
    'call_answered',
    'call_declined',
    'call_missed',
    'call_cancelled',
    'call_connected',
    'call_ended',
    'call_failed',

    -- Participant events
    'participant_joined',
    'participant_left',
    'participant_invited',

    -- Media events
    'mute_toggled',
    'video_toggled',
    'speaker_toggled',
    'screen_share_started',
    'screen_share_stopped',
    'camera_switched',

    -- Connection events
    'connection_quality_changed',
    'network_type_changed',
    'reconnecting',
    'reconnected',
    'ice_candidate_added',
    'ice_connection_failed',

    -- Error events
    'permission_denied',
    'media_error',
    'signaling_error'
  )),

  -- Event data
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Calls indexes
CREATE INDEX IF NOT EXISTS idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status_created ON calls(status, created_at DESC);

-- Call participants indexes
CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_status ON call_participants(status);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_status ON call_participants(user_id, status);

-- Call events indexes
CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON call_events(call_id);
CREATE INDEX IF NOT EXISTS idx_call_events_user_id ON call_events(user_id);
CREATE INDEX IF NOT EXISTS idx_call_events_type ON call_events(event_type);
CREATE INDEX IF NOT EXISTS idx_call_events_created_at ON call_events(created_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;

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
-- REALTIME SUBSCRIPTIONS
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE call_participants;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: End call and calculate duration
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

  -- Update all connected participants to left
  UPDATE call_participants
  SET
    status = 'left',
    left_at = NOW(),
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND status IN ('connected', 'connecting', 'reconnecting');

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

-- Function: Mark call as missed
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

  -- Update callee participant
  UPDATE call_participants
  SET
    status = 'missed',
    updated_at = NOW()
  WHERE call_id = p_call_id
  AND role = 'callee';

  -- Log event
  INSERT INTO call_events (call_id, event_type, metadata)
  VALUES (p_call_id, 'call_missed', jsonb_build_object('timeout_seconds', 60));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Get call history for user
CREATE OR REPLACE FUNCTION get_call_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  call_type TEXT,
  status TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ,
  is_outgoing BOOLEAN,
  other_user JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.call_type,
    c.status,
    c.duration_seconds,
    c.created_at,
    (c.caller_id = p_user_id) AS is_outgoing,
    CASE
      WHEN c.caller_id = p_user_id THEN (
        SELECT jsonb_build_object(
          'id', p.id,
          'display_name', p.display_name,
          'avatar_url', p.avatar_url
        )
        FROM call_participants cp
        JOIN profiles p ON p.id = cp.user_id
        WHERE cp.call_id = c.id
        AND cp.user_id != p_user_id
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
  AND c.status NOT IN ('initiating', 'connecting')
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Update updated_at on calls
CREATE OR REPLACE FUNCTION update_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calls_updated_at ON calls;
CREATE TRIGGER trigger_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_calls_updated_at();

-- Trigger: Update updated_at on call_participants
DROP TRIGGER IF EXISTS trigger_call_participants_updated_at ON call_participants;
CREATE TRIGGER trigger_call_participants_updated_at
  BEFORE UPDATE ON call_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_calls_updated_at();

-- ============================================================
-- COMMENT: UPDATE DATABASE_SCHEMA.md AFTER RUNNING THIS MIGRATION
-- ============================================================
