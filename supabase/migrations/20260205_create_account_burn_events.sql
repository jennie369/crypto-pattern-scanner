-- =====================================================
-- ACCOUNT BURN EVENTS - ROI PROOF SYSTEM PHASE A
-- File: migrations/20260205_create_account_burn_events.sql
-- Created: February 5, 2026
-- Description: Tracks account status transitions (burn events)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: account_burn_events
-- Records each time a user's account status changes
-- Tracks both degrading (healthy->warning->danger->burned->wiped)
-- and recovering (wiped->burned->danger->warning->healthy)
-- =====================================================
CREATE TABLE IF NOT EXISTS account_burn_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Event date
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Status transition
  previous_status VARCHAR(20) NOT NULL
    CHECK (previous_status IN ('healthy', 'warning', 'danger', 'burned', 'wiped')),
  new_status VARCHAR(20) NOT NULL
    CHECK (new_status IN ('healthy', 'warning', 'danger', 'burned', 'wiped')),

  -- Direction of change
  direction VARCHAR(15) NOT NULL
    CHECK (direction IN ('degrading', 'recovering', 'initial')),

  -- Balance info at event time
  balance DECIMAL(20, 2) NOT NULL,
  initial_balance DECIMAL(20, 2) NOT NULL,
  balance_pct DECIMAL(10, 4) GENERATED ALWAYS AS (
    CASE WHEN initial_balance > 0
      THEN (balance / initial_balance) * 100
      ELSE 0
    END
  ) STORED,

  -- Context at event time
  karma_level VARCHAR(20),
  karma_points INTEGER,
  ritual_streak INTEGER DEFAULT 0,
  discipline_score INTEGER,

  -- Trading context
  last_trade_id UUID,
  last_trade_pnl DECIMAL(20, 2),
  trades_today INTEGER DEFAULT 0,
  win_rate_30d DECIMAL(5, 2),

  -- Notification tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  notification_type VARCHAR(30), -- 'push', 'in_app', 'both'

  -- AI intervention tracking
  ai_intervention_triggered BOOLEAN DEFAULT FALSE,
  ai_intervention_id UUID,

  -- Recovery tracking (for recovering events)
  recovery_days INTEGER, -- Days taken to recover from this status
  recovery_started_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_burn_events_user_date
  ON account_burn_events(user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_burn_events_direction
  ON account_burn_events(direction);
CREATE INDEX IF NOT EXISTS idx_burn_events_new_status
  ON account_burn_events(new_status);
CREATE INDEX IF NOT EXISTS idx_burn_events_unnotified
  ON account_burn_events(notification_sent)
  WHERE notification_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_burn_events_recovery
  ON account_burn_events(user_id, direction)
  WHERE direction = 'recovering';

-- RLS Policies
ALTER TABLE account_burn_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_burn_events" ON account_burn_events;
CREATE POLICY "users_select_own_burn_events" ON account_burn_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_burn_events" ON account_burn_events;
CREATE POLICY "admin_select_all_burn_events" ON account_burn_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "service_insert_burn_events" ON account_burn_events;
CREATE POLICY "service_insert_burn_events" ON account_burn_events
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "service_update_burn_events" ON account_burn_events;
CREATE POLICY "service_update_burn_events" ON account_burn_events
  FOR UPDATE USING (TRUE);

-- Grant permissions
GRANT SELECT ON account_burn_events TO authenticated;
GRANT INSERT, UPDATE ON account_burn_events TO service_role;


-- =====================================================
-- STATUS ORDER for comparison
-- =====================================================
CREATE OR REPLACE FUNCTION get_status_order(p_status VARCHAR(20))
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE p_status
    WHEN 'healthy' THEN 5
    WHEN 'warning' THEN 4
    WHEN 'danger' THEN 3
    WHEN 'burned' THEN 2
    WHEN 'wiped' THEN 1
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- =====================================================
-- FUNCTION: detect_and_record_burn_event
-- Called when health status changes to record the event
-- =====================================================
CREATE OR REPLACE FUNCTION detect_and_record_burn_event(
  p_user_id UUID,
  p_previous_status VARCHAR(20),
  p_new_status VARCHAR(20),
  p_balance DECIMAL(20, 2),
  p_initial_balance DECIMAL(20, 2),
  p_context JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_direction VARCHAR(15);
  v_event_id UUID;
  v_karma RECORD;
BEGIN
  -- Determine direction
  IF p_previous_status IS NULL THEN
    v_direction := 'initial';
  ELSIF get_status_order(p_new_status) < get_status_order(p_previous_status) THEN
    v_direction := 'degrading';
  ELSIF get_status_order(p_new_status) > get_status_order(p_previous_status) THEN
    v_direction := 'recovering';
  ELSE
    -- No change
    RETURN jsonb_build_object('success', FALSE, 'reason', 'No status change');
  END IF;

  -- Get karma info
  SELECT karma_level, karma_points
  INTO v_karma
  FROM profiles
  WHERE id = p_user_id;

  -- Insert burn event
  INSERT INTO account_burn_events (
    user_id,
    previous_status,
    new_status,
    direction,
    balance,
    initial_balance,
    karma_level,
    karma_points,
    ritual_streak,
    discipline_score,
    last_trade_pnl,
    trades_today,
    metadata
  ) VALUES (
    p_user_id,
    COALESCE(p_previous_status, 'healthy'),
    p_new_status,
    v_direction,
    p_balance,
    p_initial_balance,
    v_karma.karma_level,
    v_karma.karma_points,
    COALESCE((p_context->>'ritual_streak')::INTEGER, 0),
    COALESCE((p_context->>'discipline_score')::INTEGER, NULL),
    COALESCE((p_context->>'last_trade_pnl')::DECIMAL, NULL),
    COALESCE((p_context->>'trades_today')::INTEGER, 0),
    p_context
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'event_id', v_event_id,
    'direction', v_direction,
    'previous_status', p_previous_status,
    'new_status', p_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: detect_burn_events
-- Scans for status changes and records burn events
-- Called after daily snapshots are generated
-- =====================================================
CREATE OR REPLACE FUNCTION detect_burn_events(
  p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER := 0;
  v_degrading INTEGER := 0;
  v_recovering INTEGER := 0;
  v_user RECORD;
  v_result JSONB;
BEGIN
  -- Find users whose status changed today
  FOR v_user IN
    SELECT
      today.user_id,
      yesterday.health_status as previous_status,
      today.health_status as new_status,
      today.balance,
      today.initial_balance,
      today.karma_level,
      today.karma_points,
      today.ritual_streak,
      today.trades_count
    FROM account_health_snapshots today
    LEFT JOIN account_health_snapshots yesterday
      ON today.user_id = yesterday.user_id
      AND yesterday.snapshot_date = p_target_date - 1
    WHERE today.snapshot_date = p_target_date
      AND (
        yesterday.health_status IS NULL
        OR today.health_status != yesterday.health_status
      )
  LOOP
    -- Record the burn event
    v_result := detect_and_record_burn_event(
      v_user.user_id,
      v_user.previous_status,
      v_user.new_status,
      v_user.balance,
      v_user.initial_balance,
      jsonb_build_object(
        'ritual_streak', v_user.ritual_streak,
        'trades_today', v_user.trades_count
      )
    );

    IF v_result->>'success' = 'true' THEN
      v_count := v_count + 1;

      IF v_result->>'direction' = 'degrading' THEN
        v_degrading := v_degrading + 1;
      ELSIF v_result->>'direction' = 'recovering' THEN
        v_recovering := v_recovering + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'date', p_target_date,
    'events_recorded', v_count,
    'degrading', v_degrading,
    'recovering', v_recovering
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: get_pending_burn_notifications
-- Returns users who need burn notifications
-- =====================================================
CREATE OR REPLACE FUNCTION get_pending_burn_notifications()
RETURNS TABLE (
  event_id UUID,
  user_id UUID,
  new_status VARCHAR(20),
  direction VARCHAR(15),
  balance_pct DECIMAL,
  karma_level VARCHAR(20),
  push_token TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.user_id,
    e.new_status,
    e.direction,
    e.balance_pct,
    e.karma_level,
    p.expo_push_token as push_token
  FROM account_burn_events e
  JOIN profiles p ON e.user_id = p.id
  WHERE e.notification_sent = FALSE
    AND e.direction = 'degrading'
    AND e.new_status IN ('danger', 'burned', 'wiped')
    AND p.expo_push_token IS NOT NULL
  ORDER BY e.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: get_burn_event_stats
-- Returns aggregated burn event statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_burn_event_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'period_days', p_days,
    'total_events', COUNT(*),
    'degrading_events', COUNT(*) FILTER (WHERE direction = 'degrading'),
    'recovering_events', COUNT(*) FILTER (WHERE direction = 'recovering'),
    'by_status', jsonb_build_object(
      'to_warning', COUNT(*) FILTER (WHERE new_status = 'warning' AND direction = 'degrading'),
      'to_danger', COUNT(*) FILTER (WHERE new_status = 'danger' AND direction = 'degrading'),
      'to_burned', COUNT(*) FILTER (WHERE new_status = 'burned' AND direction = 'degrading'),
      'to_wiped', COUNT(*) FILTER (WHERE new_status = 'wiped' AND direction = 'degrading'),
      'recovered_to_healthy', COUNT(*) FILTER (WHERE new_status = 'healthy' AND direction = 'recovering')
    ),
    'by_karma_level', (
      SELECT jsonb_object_agg(
        COALESCE(karma_level, 'unknown'),
        cnt
      )
      FROM (
        SELECT karma_level, COUNT(*) as cnt
        FROM account_burn_events
        WHERE event_date >= CURRENT_DATE - p_days
        GROUP BY karma_level
      ) sub
    ),
    'unique_users_degraded', (
      SELECT COUNT(DISTINCT user_id)
      FROM account_burn_events
      WHERE event_date >= CURRENT_DATE - p_days
        AND direction = 'degrading'
    ),
    'unique_users_recovered', (
      SELECT COUNT(DISTINCT user_id)
      FROM account_burn_events
      WHERE event_date >= CURRENT_DATE - p_days
        AND direction = 'recovering'
    )
  ) INTO v_result
  FROM account_burn_events
  WHERE event_date >= CURRENT_DATE - p_days;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: get_user_burn_events
-- Returns burn events for a specific user
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_burn_events(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'event_date', event_date,
      'event_time', event_time,
      'previous_status', previous_status,
      'new_status', new_status,
      'direction', direction,
      'balance', balance,
      'balance_pct', ROUND(balance_pct::NUMERIC, 2),
      'karma_level', karma_level,
      'karma_points', karma_points
    ) ORDER BY event_date DESC, event_time DESC
  ), '[]'::jsonb) INTO v_result
  FROM account_burn_events
  WHERE user_id = p_user_id
  LIMIT p_limit;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- GRANTS: Execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_status_order(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_and_record_burn_event(UUID, VARCHAR, VARCHAR, DECIMAL, DECIMAL, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION detect_burn_events(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_burn_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION get_burn_event_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_burn_events(UUID, INTEGER) TO authenticated;


-- =====================================================
-- COMMENTS: Document tables and functions
-- =====================================================
COMMENT ON TABLE account_burn_events IS
  'Records each account status transition (burn events) for tracking degradation and recovery patterns.';

COMMENT ON FUNCTION detect_and_record_burn_event IS
  'Records a single burn event when account status changes. Called by triggers or daily cron.';

COMMENT ON FUNCTION detect_burn_events IS
  'Scans daily snapshots for status changes and records burn events. Run after generate_daily_health_snapshots.';

COMMENT ON FUNCTION get_pending_burn_notifications IS
  'Returns users who need burn notifications (danger/burned/wiped status changes).';

COMMENT ON FUNCTION get_burn_event_stats IS
  'Returns aggregated statistics on burn events for admin dashboard.';

COMMENT ON FUNCTION get_user_burn_events IS
  'Returns burn event history for a specific user.';
